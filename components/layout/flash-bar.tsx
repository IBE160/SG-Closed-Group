"use client";

/**
 * FlashBar Component - Urgent Dispatcher Communication
 * Story 4.1: Flash Message Basic Send and Receive
 * Story 4.2: Blink Animation and Acknowledgment
 *
 * Features:
 * - Send flash messages to all dispatchers via SSE
 * - Display received messages with timestamp
 * - Navigate between messages with arrows
 * - Click to acknowledge (mark as read)
 * - Unread count badge
 * - Blink animations (quick and continuous)
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useFlashStore,
  useCurrentMessage,
  useUnreadCount,
  useMessagePosition,
  useCurrentIsAcknowledged,
  useBlinkPhase,
} from "@/stores/useFlashStore";

export function FlashBar() {
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Zustand store
  const { addMessage, acknowledge, nextMessage, prevMessage, setMessages, transitionToContinu } =
    useFlashStore();
  const currentMessage = useCurrentMessage();
  const unreadCount = useUnreadCount();
  const messagePosition = useMessagePosition();
  const isCurrentAcknowledged = useCurrentIsAcknowledged();
  const blinkPhase = useBlinkPhase();

  /**
   * Fetch initial messages on mount
   */
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("/api/flash?limit=10");
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setMessages(result.data);
          }
        }
      } catch (error) {
        console.error("[FlashBar] Failed to fetch messages:", error);
      }
    };

    fetchMessages();
  }, [setMessages]);

  /**
   * Send a new flash message
   */
  const handleSendMessage = useCallback(async () => {
    const content = inputValue.trim();
    if (!content || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/flash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Add to store immediately (SSE will also receive it)
          addMessage({
            id: result.data.id,
            content: result.data.content,
            createdAt: result.data.createdAt,
          });
          setInputValue("");
        }
      } else {
        const error = await response.json();
        console.error("[FlashBar] Send failed:", error);
      }
    } catch (error) {
      console.error("[FlashBar] Send error:", error);
    } finally {
      setIsSending(false);
    }
  }, [inputValue, isSending, addMessage]);

  /**
   * Handle keyboard events
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Handle click on message to acknowledge
   */
  const handleMessageClick = () => {
    if (currentMessage && !isCurrentAcknowledged) {
      acknowledge(currentMessage.id);
    }
  };

  /**
   * Focus input when clicking empty bar
   */
  const handleBarClick = () => {
    if (!currentMessage) {
      inputRef.current?.focus();
    }
  };

  /**
   * Handle animation end - transition from quick to continuous (Story 4.2)
   */
  const handleAnimationEnd = useCallback(() => {
    if (blinkPhase === "quick") {
      transitionToContinu();
    }
  }, [blinkPhase, transitionToContinu]);

  /**
   * Format timestamp as HH:MM
   */
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("no-NO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Determine if we're showing a message or the input
  const showMessage = currentMessage !== null;
  const hasMessages = messagePosition !== null;

  return (
    <div
      ref={barRef}
      className={cn(
        "flex h-12 w-full items-center px-2 gap-2",
        "border-2 border-destructive",
        "bg-destructive/10",
        "transition-all",
        !showMessage && "cursor-text",
        // Blink animations (Story 4.2)
        blinkPhase === "quick" && "animate-flash-quick",
        blinkPhase === "continuous" && "animate-flash-continuous"
      )}
      onClick={handleBarClick}
      onAnimationEnd={handleAnimationEnd}
    >
      {/* Previous button */}
      {hasMessages && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevMessage();
          }}
          className="p-1 rounded hover:bg-destructive/20 transition-colors"
          title="Forrige melding"
          aria-label="Forrige melding"
        >
          <ChevronLeft className="h-5 w-5 text-destructive" />
        </button>
      )}

      {/* Message display or input */}
      <div className="flex flex-1 items-center min-w-0">
        {showMessage ? (
          <div
            className={cn(
              "flex flex-1 items-center min-w-0 cursor-pointer rounded px-2 py-1 -mx-2",
              !isCurrentAcknowledged && "hover:bg-destructive/20",
              !isCurrentAcknowledged && "font-bold"
            )}
            onClick={handleMessageClick}
            title={isCurrentAcknowledged ? "Melding kvittert" : "Klikk for å kvittere"}
          >
            <span className="flex-1 truncate text-base text-foreground">
              {currentMessage.content}
            </span>
            <span className="ml-3 text-xs text-muted-foreground whitespace-nowrap">
              {formatTime(currentMessage.createdAt)}
            </span>
          </div>
        ) : (
          <div className="flex flex-1 items-center relative">
            <input
              ref={inputRef}
              id="flash-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={100}
              disabled={isSending}
              className="flex-1 bg-transparent text-base font-semibold text-foreground focus:outline-none disabled:opacity-50"
              placeholder=""
            />
            {/* Placeholder that disappears when typing */}
            {!inputValue && (
              <span className="absolute left-0 text-base font-medium text-muted-foreground/50 pointer-events-none select-none uppercase tracking-widest">
                FLASH
              </span>
            )}
            {inputValue.trim() && (
              <button
                onClick={handleSendMessage}
                disabled={isSending}
                className="ml-2 rounded p-1.5 text-destructive hover:bg-destructive/30 transition-colors disabled:opacity-50"
                title="Send melding (Enter)"
                aria-label="Send flash-melding"
              >
                <Send className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Position indicator and unread badge */}
      {hasMessages && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
          <span>{messagePosition}</span>
          {unreadCount > 0 && (
            <span className="bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full font-medium">
              {unreadCount}
            </span>
          )}
        </div>
      )}

      {/* Next button */}
      {hasMessages && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            nextMessage();
          }}
          className="p-1 rounded hover:bg-destructive/20 transition-colors"
          title="Neste melding"
          aria-label="Neste melding"
        >
          <ChevronRight className="h-5 w-5 text-destructive" />
        </button>
      )}
    </div>
  );
}
