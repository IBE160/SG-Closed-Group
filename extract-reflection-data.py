#!/usr/bin/env python3
"""
Reflection Report Data Extraction Tool
======================================

Extracts data from project logs, git history, and code to help fill out
the IBE160 reflection report.

Usage:
    python extract-reflection-data.py

Output:
    reflection-data.md - Markdown file with all extracted data
"""

import json
import os
import subprocess
import re
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any

class ReflectionDataExtractor:
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root)
        self.logging_dir = self.project_root / ".logging" / "requests"
        self.output_file = self.project_root / "reflection-data.md"

    def extract_all(self):
        """Extract all data and generate markdown report"""
        print("🔍 Extracting reflection report data...")

        data = {
            "tech_stack": self.extract_tech_stack(),
            "prompts": self.extract_prompts(),
            "git_stats": self.extract_git_stats(),
            "challenges": self.extract_challenges(),
            "ai_usage": self.extract_ai_usage_stats(),
            "code_metrics": self.extract_code_metrics()
        }

        self.generate_markdown_report(data)
        print(f"\n✅ Report generated: {self.output_file}")

    def extract_tech_stack(self) -> Dict[str, Any]:
        """Extract technology stack from package.json"""
        print("  📦 Extracting tech stack...")

        package_json = self.project_root / "package.json"
        if not package_json.exists():
            return {}

        with open(package_json) as f:
            data = json.load(f)

        return {
            "frontend": self._categorize_frontend_deps(data.get("dependencies", {})),
            "backend": self._categorize_backend_deps(data.get("dependencies", {})),
            "dev_tools": list(data.get("devDependencies", {}).keys())[:10],
            "scripts": data.get("scripts", {})
        }

    def _categorize_frontend_deps(self, deps: Dict) -> List[str]:
        """Categorize frontend dependencies"""
        frontend_keywords = ["react", "next", "tailwind", "lucide", "@radix", "clsx"]
        return [dep for dep in deps.keys() if any(kw in dep.lower() for kw in frontend_keywords)]

    def _categorize_backend_deps(self, deps: Dict) -> List[str]:
        """Categorize backend dependencies"""
        backend_keywords = ["prisma", "zod", "next-auth", "ai", "anthropic", "azure"]
        return [dep for dep in deps.keys() if any(kw in dep.lower() for kw in backend_keywords)]

    def extract_prompts(self) -> List[Dict[str, Any]]:
        """Extract key prompts from logging directory"""
        print("  💬 Extracting AI prompts...")

        if not self.logging_dir.exists():
            return []

        prompts = []
        for json_file in self.logging_dir.glob("*.json"):
            try:
                with open(json_file) as f:
                    session_data = json.load(f)

                for entry in session_data[:10]:  # First 10 prompts per session
                    request = entry.get("request", {})
                    response = entry.get("response", {})

                    if request.get("request_text"):
                        prompt_text = self._extract_prompt_text(request["request_text"])

                        prompts.append({
                            "timestamp": request.get("event.timestamp", ""),
                            "prompt": prompt_text[:500] + "..." if len(prompt_text) > 500 else prompt_text,
                            "model": request.get("model", "unknown"),
                            "input_tokens": response.get("input_token_count", 0),
                            "output_tokens": response.get("output_token_count", 0),
                            "duration_ms": response.get("duration_ms", 0)
                        })
            except Exception as e:
                print(f"    ⚠️  Error reading {json_file.name}: {e}")

        return prompts[:20]  # Return top 20 prompts

    def _extract_prompt_text(self, request_text: Any) -> str:
        """Extract clean text from request"""
        if isinstance(request_text, list):
            for msg in reversed(request_text):
                if isinstance(msg, dict) and msg.get("role") == "user":
                    parts = msg.get("parts", [])
                    if parts and isinstance(parts[0], dict):
                        return parts[0].get("text", "")
        return str(request_text)[:500]

    def extract_git_stats(self) -> Dict[str, Any]:
        """Extract git statistics"""
        print("  📊 Extracting git statistics...")

        try:
            # Total commits
            total_commits = subprocess.check_output(
                ["git", "rev-list", "--count", "HEAD"],
                cwd=self.project_root,
                text=True
            ).strip()

            # Recent commits
            recent_commits = subprocess.check_output(
                ["git", "log", "--oneline", "-20"],
                cwd=self.project_root,
                text=True
            ).strip().split("\n")

            # Contributors
            contributors = subprocess.check_output(
                ["git", "log", "--format=%an", "|", "sort", "-u"],
                cwd=self.project_root,
                text=True,
                shell=True
            ).strip().split("\n")

            # Files changed
            files_changed = subprocess.check_output(
                ["git", "diff", "--name-only", "HEAD~10..HEAD"],
                cwd=self.project_root,
                text=True
            ).strip().split("\n")

            return {
                "total_commits": total_commits,
                "recent_commits": recent_commits,
                "contributors": contributors,
                "files_changed": len(files_changed)
            }
        except Exception as e:
            print(f"    ⚠️  Git stats error: {e}")
            return {}

    def extract_challenges(self) -> List[Dict[str, str]]:
        """Extract challenges from git commits with 'fix', 'bug', 'error' keywords"""
        print("  🐛 Extracting technical challenges...")

        try:
            commits = subprocess.check_output(
                ["git", "log", "--all", "--grep=fix\\|bug\\|error", "--oneline", "-10"],
                cwd=self.project_root,
                text=True
            ).strip().split("\n")

            challenges = []
            for commit in commits:
                if commit:
                    hash_msg = commit.split(" ", 1)
                    if len(hash_msg) == 2:
                        challenges.append({
                            "commit": hash_msg[0],
                            "message": hash_msg[1]
                        })

            return challenges
        except Exception as e:
            print(f"    ⚠️  Challenges extraction error: {e}")
            return []

    def extract_ai_usage_stats(self) -> Dict[str, Any]:
        """Calculate AI usage statistics"""
        print("  🤖 Calculating AI usage statistics...")

        if not self.logging_dir.exists():
            return {}

        total_prompts = 0
        total_input_tokens = 0
        total_output_tokens = 0
        total_duration_ms = 0
        models_used = set()

        for json_file in self.logging_dir.glob("*.json"):
            try:
                with open(json_file) as f:
                    session_data = json.load(f)

                for entry in session_data:
                    total_prompts += 1
                    response = entry.get("response", {})
                    total_input_tokens += response.get("input_token_count", 0)
                    total_output_tokens += response.get("output_token_count", 0)
                    total_duration_ms += response.get("duration_ms", 0)

                    model = entry.get("request", {}).get("model")
                    if model:
                        models_used.add(model)
            except:
                pass

        return {
            "total_prompts": total_prompts,
            "total_input_tokens": total_input_tokens,
            "total_output_tokens": total_output_tokens,
            "total_tokens": total_input_tokens + total_output_tokens,
            "total_duration_minutes": round(total_duration_ms / 60000, 1),
            "average_tokens_per_prompt": round((total_input_tokens + total_output_tokens) / max(total_prompts, 1)),
            "models_used": list(models_used)
        }

    def extract_code_metrics(self) -> Dict[str, Any]:
        """Extract code metrics"""
        print("  📈 Extracting code metrics...")

        metrics = {
            "total_files": 0,
            "typescript_files": 0,
            "total_lines": 0,
            "key_files": []
        }

        code_extensions = {".ts", ".tsx", ".js", ".jsx"}

        for ext in code_extensions:
            files = list(self.project_root.rglob(f"*{ext}"))
            # Exclude node_modules
            files = [f for f in files if "node_modules" not in str(f)]

            metrics["total_files"] += len(files)
            if ext in {".ts", ".tsx"}:
                metrics["typescript_files"] += len(files)

            for file in files[:5]:  # Sample first 5
                try:
                    with open(file) as f:
                        lines = len(f.readlines())
                        metrics["total_lines"] += lines

                        if lines > 50:  # Significant files
                            metrics["key_files"].append({
                                "path": str(file.relative_to(self.project_root)),
                                "lines": lines
                            })
                except:
                    pass

        return metrics

    def generate_markdown_report(self, data: Dict[str, Any]):
        """Generate markdown report with all extracted data"""

        with open(self.output_file, "w", encoding="utf-8") as f:
            f.write("# Reflection Report - Extracted Data\n\n")
            f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write("---\n\n")

            # Tech Stack
            f.write("## 1. Technology Stack\n\n")
            f.write("### Frontend Dependencies\n")
            for dep in data["tech_stack"].get("frontend", [])[:10]:
                f.write(f"- {dep}\n")

            f.write("\n### Backend Dependencies\n")
            for dep in data["tech_stack"].get("backend", [])[:10]:
                f.write(f"- {dep}\n")

            # AI Usage
            f.write("\n\n## 2. AI Usage Statistics\n\n")
            ai_stats = data["ai_usage"]
            f.write(f"- **Total prompts:** {ai_stats.get('total_prompts', 0)}\n")
            f.write(f"- **Total tokens:** {ai_stats.get('total_tokens', 0):,}\n")
            f.write(f"  - Input: {ai_stats.get('total_input_tokens', 0):,}\n")
            f.write(f"  - Output: {ai_stats.get('total_output_tokens', 0):,}\n")
            f.write(f"- **Average tokens/prompt:** {ai_stats.get('average_tokens_per_prompt', 0)}\n")
            f.write(f"- **Total AI time:** {ai_stats.get('total_duration_minutes', 0)} minutes\n")
            f.write(f"- **Models used:** {', '.join(ai_stats.get('models_used', []))}\n")

            # Key Prompts
            f.write("\n\n## 3. Key AI Prompts (Top 10)\n\n")
            for i, prompt in enumerate(data["prompts"][:10], 1):
                f.write(f"### Prompt {i}\n")
                f.write(f"**Time:** {prompt['timestamp'][:19] if prompt['timestamp'] else 'N/A'}\n\n")
                f.write(f"**Model:** {prompt['model']}\n\n")
                f.write(f"**Tokens:** {prompt['input_tokens']} → {prompt['output_tokens']}\n\n")
                f.write(f"**Content:**\n```\n{prompt['prompt']}\n```\n\n")

            # Git Stats
            f.write("\n\n## 4. Git Statistics\n\n")
            git_stats = data["git_stats"]
            f.write(f"- **Total commits:** {git_stats.get('total_commits', 'N/A')}\n")
            f.write(f"- **Contributors:** {', '.join(git_stats.get('contributors', ['N/A']))}\n")
            f.write(f"- **Files changed (last 10 commits):** {git_stats.get('files_changed', 0)}\n")

            f.write("\n### Recent Commits\n")
            for commit in git_stats.get("recent_commits", [])[:10]:
                f.write(f"- {commit}\n")

            # Challenges
            f.write("\n\n## 5. Technical Challenges (from git)\n\n")
            for challenge in data["challenges"]:
                f.write(f"- **{challenge['commit']}:** {challenge['message']}\n")

            # Code Metrics
            f.write("\n\n## 6. Code Metrics\n\n")
            metrics = data["code_metrics"]
            f.write(f"- **Total code files:** {metrics.get('total_files', 0)}\n")
            f.write(f"- **TypeScript files:** {metrics.get('typescript_files', 0)}\n")
            f.write(f"- **Total lines of code (sampled):** {metrics.get('total_lines', 0):,}\n")

            f.write("\n### Key Files\n")
            for file in metrics.get("key_files", [])[:10]:
                f.write(f"- `{file['path']}` ({file['lines']} lines)\n")

            f.write("\n\n---\n\n")
            f.write("**Use this data to fill out your reflection report!**\n")

if __name__ == "__main__":
    extractor = ReflectionDataExtractor()
    extractor.extract_all()
    print("\n📄 Now fill out the template using reflection-data.md as reference!")
