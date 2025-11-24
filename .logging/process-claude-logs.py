#!/usr/bin/env python3
"""
Claude Code Log Processor

Converts Claude Code JSONL logs to Gemini-compatible format for viewing.
This allows you to use the same api-viewer.html to view both Claude and Gemini sessions.

Usage:
    python process-claude-logs.py
    # or with uv:
    uv run process-claude-logs.py
"""

import json
import os
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any
import argparse


def find_claude_logs() -> List[Path]:
    """Find all Claude Code JSONL log files."""
    claude_dir = Path.home() / ".claude" / "projects"
    if not claude_dir.exists():
        return []

    log_files = []
    for project_dir in claude_dir.iterdir():
        if project_dir.is_dir():
            for log_file in project_dir.glob("*.jsonl"):
                # Skip agent logs, focus on main session logs
                if not log_file.name.startswith("agent-"):
                    log_files.append(log_file)

    return sorted(log_files, key=lambda x: x.stat().st_mtime, reverse=True)


def parse_claude_log(log_file: Path) -> Dict[str, Any]:
    """Parse a Claude Code JSONL log file."""
    events = []
    session_id = None

    with open(log_file, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                try:
                    event = json.loads(line)
                    events.append(event)
                    if 'sessionId' in event and session_id is None:
                        session_id = event['sessionId']
                except json.JSONDecodeError:
                    continue

    return {
        'session_id': session_id or log_file.stem,
        'events': events,
        'log_file': log_file
    }


def convert_to_gemini_format(parsed_log: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Convert Claude Code log to Gemini-compatible format."""
    session_id = parsed_log['session_id']
    events = parsed_log['events']

    gemini_format = []
    current_request = None
    current_response_parts = []
    prompt_counter = 0

    for event in events:
        event_type = event.get('type')

        # User message = request
        if event_type == 'user' and 'message' in event:
            msg = event['message']

            # If we have a pending response, finalize it first
            if current_request and current_response_parts:
                gemini_format.append({
                    'request': current_request,
                    'response': {
                        'session.id': session_id,
                        'model': 'claude-sonnet-4-5-20250929',
                        'status_code': 200,
                        'duration_ms': 0,
                        'input_token_count': 0,
                        'output_token_count': 0,
                        'total_token_count': 0,
                        'response_text': current_response_parts,
                        'prompt_id': f"{session_id}########{prompt_counter}",
                        'auth_type': 'claude-api-key',
                        'event.timestamp': current_request.get('event.timestamp', '')
                    },
                    'error': None
                })
                prompt_counter += 1

            # Start new request
            user_content = msg.get('content', '')

            # Handle both string and array content
            if isinstance(user_content, str):
                request_text = [
                    {
                        'role': 'user',
                        'parts': [{'text': user_content}]
                    }
                ]
            elif isinstance(user_content, list):
                # Extract text from tool results or direct text
                text_parts = []
                for item in user_content:
                    if isinstance(item, dict):
                        if item.get('type') == 'tool_result':
                            text_parts.append({'text': f"[Tool Result] {item.get('content', '')}"})
                        elif 'text' in item:
                            text_parts.append({'text': item['text']})

                request_text = [
                    {
                        'role': 'user',
                        'parts': text_parts if text_parts else [{'text': str(user_content)}]
                    }
                ]
            else:
                request_text = [
                    {
                        'role': 'user',
                        'parts': [{'text': str(user_content)}]
                    }
                ]

            current_request = {
                'session.id': session_id,
                'event.name': 'claude.api_request',
                'event.timestamp': event.get('timestamp', ''),
                'model': 'claude-sonnet-4-5-20250929',
                'prompt_id': f"{session_id}########{prompt_counter}",
                'request_text': request_text
            }
            current_response_parts = []

        # Assistant message = response
        elif event_type == 'assistant' and 'message' in event:
            msg = event['message']

            # Extract thinking and text content
            content = msg.get('content', [])
            for item in content:
                if isinstance(item, dict):
                    if item.get('type') == 'thinking':
                        current_response_parts.append({
                            'candidates': [{
                                'content': {
                                    'parts': [{
                                        'thought': True,
                                        'text': item.get('thinking', '')
                                    }],
                                    'role': 'model'
                                }
                            }]
                        })
                    elif item.get('type') == 'text':
                        current_response_parts.append({
                            'candidates': [{
                                'content': {
                                    'parts': [{
                                        'text': item.get('text', '')
                                    }],
                                    'role': 'model'
                                }
                            }]
                        })
                    elif item.get('type') == 'tool_use':
                        current_response_parts.append({
                            'candidates': [{
                                'content': {
                                    'parts': [{
                                        'functionCall': {
                                            'name': item.get('name', ''),
                                            'args': item.get('input', {})
                                        }
                                    }],
                                    'role': 'model'
                                }
                            }]
                        })

            # Extract token usage if available
            usage = msg.get('usage', {})
            if current_request:
                current_request['input_tokens'] = usage.get('input_tokens', 0)
                current_request['output_tokens'] = usage.get('output_tokens', 0)

    # Finalize last request/response pair
    if current_request and current_response_parts:
        gemini_format.append({
            'request': current_request,
            'response': {
                'session.id': session_id,
                'model': 'claude-sonnet-4-5-20250929',
                'status_code': 200,
                'duration_ms': 0,
                'input_token_count': current_request.get('input_tokens', 0),
                'output_token_count': current_request.get('output_tokens', 0),
                'total_token_count': current_request.get('input_tokens', 0) + current_request.get('output_tokens', 0),
                'response_text': current_response_parts,
                'prompt_id': f"{session_id}########{prompt_counter}",
                'auth_type': 'claude-api-key',
                'event.timestamp': current_request.get('event.timestamp', '')
            },
            'error': None
        })

    return gemini_format


def save_processed_log(data: List[Dict[str, Any]], session_id: str, output_dir: Path):
    """Save processed log in Gemini-compatible format."""
    output_dir.mkdir(parents=True, exist_ok=True)

    # Use timestamp-based filename like Gemini does
    timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    filename = f"{timestamp}-{session_id[:8]}.json"
    output_file = output_dir / filename

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    return output_file


def main():
    parser = argparse.ArgumentParser(
        description='Process Claude Code logs to Gemini-compatible format'
    )
    parser.add_argument(
        '--output-dir',
        type=Path,
        default=Path('.logging/requests'),
        help='Output directory for processed logs (default: .logging/requests)'
    )
    parser.add_argument(
        '--limit',
        type=int,
        default=10,
        help='Maximum number of recent sessions to process (default: 10)'
    )
    parser.add_argument(
        '--all',
        action='store_true',
        help='Process all sessions (ignores --limit)'
    )

    args = parser.parse_args()

    print("🔍 Søker etter Claude Code logger...")
    log_files = find_claude_logs()

    if not log_files:
        print("❌ Fant ingen Claude Code logger")
        return

    print(f"✅ Fant {len(log_files)} logger")

    # Limit number of files to process
    if not args.all:
        log_files = log_files[:args.limit]
        print(f"📝 Prosesserer {len(log_files)} nyeste sesjoner...")
    else:
        print(f"📝 Prosesserer alle {len(log_files)} sesjoner...")

    processed_count = 0
    for log_file in log_files:
        try:
            print(f"\n🔄 Prosesserer: {log_file.name}")
            parsed = parse_claude_log(log_file)

            if not parsed['events']:
                print(f"   ⏭️  Ingen events funnet, hopper over")
                continue

            gemini_data = convert_to_gemini_format(parsed)

            if not gemini_data:
                print(f"   ⏭️  Ingen interaksjoner funnet, hopper over")
                continue

            output_file = save_processed_log(
                gemini_data,
                parsed['session_id'],
                args.output_dir
            )

            print(f"   ✅ Lagret: {output_file.name}")
            print(f"   📊 {len(gemini_data)} interaksjoner")
            processed_count += 1

        except Exception as e:
            print(f"   ❌ Feil: {e}")
            continue

    print(f"\n✨ Ferdig! Prosesserte {processed_count} sesjoner")
    print(f"📁 Filer lagret i: {args.output_dir}")
    print(f"\n💡 For å se logger, kjør:")
    print(f"   uv run .logging/server.py")
    print(f"   # eller")
    print(f"   python .logging/server.py")


if __name__ == '__main__':
    main()
