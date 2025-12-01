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
import { ChevronLeft, ChevronRight, Send, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useFlashStore,
  useUnreadCount,
  useBlinkPhase,
} from "@/stores/useFlashStore";

export function FlashBar() {
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [inputMode, setInputMode] = useState(false); // Toggle between message view and input
  const [placeholderText, setPlaceholderText] = useState(""); // Shows old message until user types
  const inputRef = useRef<HTMLInputElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Zustand store - use direct subscriptions to ensure reactivity
  const { addMessage, acknowledge, nextMessage, prevMessage, setMessages, transitionToContinu, setBlinkPhase } =
    useFlashStore();

  // Subscribe to individual state slices for proper reactivity
  const messages = useFlashStore((state) => state.messages);
  const currentIndex = useFlashStore((state) => state.currentIndex);
  const acknowledgedIds = useFlashStore((state) => state.acknowledgedIds);
  const unreadCount = useUnreadCount();
  const blinkPhase = useBlinkPhase();

  // Compute derived values
  const currentMessage = messages.length > 0 ? messages[currentIndex] : null;
  const messagePosition = messages.length > 0 ? `${currentIndex + 1}/${messages.length}` : null;
  const isCurrentAcknowledged = currentMessage ? acknowledgedIds.includes(currentMessage.id) : true;

  /**
   * Fetch messages from API
   */
  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch("/api/flash?limit=5");
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const currentIds = useFlashStore.getState().messages.map(m => m.id);

          // On initial load, set all messages WITHOUT triggering blink
          if (currentIds.length === 0 && result.data.length > 0) {
            setMessages(result.data);
            return; // Don't process as new messages
          }

          // Check for genuinely new messages (not initial load)
          const newMessages = result.data.filter((m: { id: string }) => !currentIds.includes(m.id));

          // Add new messages (will trigger blink)
          newMessages.forEach((msg: { id: string; content: string; senderName?: string | null; createdAt: string }) => {
            addMessage(msg);
          });
        }
      }
    } catch (error) {
      console.error("[FlashBar] Failed to fetch messages:", error);
    }
  }, [addMessage, setMessages]);

  /**
   * Fetch initial messages on mount and poll every 1 second for updates
   */
  useEffect(() => {
    fetchMessages();

    // Poll for new messages every 1 second for real-time updates
    const pollInterval = setInterval(fetchMessages, 1000);

    return () => clearInterval(pollInterval);
  }, [fetchMessages]);

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
          const messageId = result.data.id;
          // Add to store immediately (SSE will also receive it)
          addMessage({
            id: messageId,
            content: result.data.content,
            senderName: result.data.senderName,
            createdAt: result.data.createdAt,
          });
          // Auto-acknowledge own message so sender doesn't see blink
          acknowledge(messageId);
          setBlinkPhase("none");
          setInputValue("");
          setInputMode(false); // Return to message view after sending
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
  }, [inputValue, isSending, addMessage, acknowledge, setBlinkPhase]);

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
   * Handle click on message:
   * - First click (unread): acknowledge + stop blink (stay in message view)
   * - Second click (already read): go to input mode with placeholder
   */
  const handleMessageClick = () => {
    if (currentMessage) {
      if (!isCurrentAcknowledged) {
        // First click: just acknowledge and stop blink
        setBlinkPhase("none");
        acknowledge(currentMessage.id);
        // Stay in message view - don't go to input mode
      } else {
        // Second click (already acknowledged): go to input mode
        setPlaceholderText(currentMessage.content);
        setInputMode(true);
      }
    }
  };

  /**
   * Focus input when clicking empty bar
   */
  const handleBarClick = () => {
    if (!currentMessage || inputMode) {
      inputRef.current?.focus();
    }
  };

  /**
   * Enter input mode to compose a new message
   */
  const handleComposeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputMode(true);
  };

  /**
   * Focus input when entering input mode
   */
  useEffect(() => {
    if (inputMode) {
      inputRef.current?.focus();
    }
  }, [inputMode]);

  /**
   * Auto-exit input mode when new unacknowledged message arrives
   * Flash messages must ALWAYS be receivable and acknowledgeable
   */
  useEffect(() => {
    if (blinkPhase === "quick" && inputMode) {
      // New message arrived while in input mode - exit to show the message
      setInputMode(false);
      setPlaceholderText("");
      // Keep any typed text for later
    }
  }, [blinkPhase, inputMode]);

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
  // Show input if: no messages, OR inputMode is true
  const showMessage = currentMessage !== null && !inputMode;
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
      {/* Navigation arrows - side by side */}
      {hasMessages && (
        <div className="flex items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Exit input mode when navigating to show the message
              if (inputMode) {
                setInputMode(false);
                setPlaceholderText("");
              }
              prevMessage();
            }}
            className="p-1 rounded hover:bg-destructive/20 transition-colors"
            title="Forrige melding"
            aria-label="Forrige melding"
          >
            <ChevronLeft className="h-5 w-5 text-destructive" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Exit input mode when navigating to show the message
              if (inputMode) {
                setInputMode(false);
                setPlaceholderText("");
              }
              nextMessage();
            }}
            className="p-1 rounded hover:bg-destructive/20 transition-colors"
            title="Neste melding"
            aria-label="Neste melding"
          >
            <ChevronRight className="h-5 w-5 text-destructive" />
          </button>
        </div>
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
              {currentMessage.senderName && (
                <span className="font-medium">{currentMessage.senderName} · </span>
              )}
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
              onChange={(e) => {
                setInputValue(e.target.value);
                // Clear placeholder when user starts typing
                if (e.target.value && placeholderText) {
                  setPlaceholderText("");
                }
              }}
              onKeyDown={handleKeyDown}
              maxLength={100}
              disabled={isSending}
              className="flex-1 bg-transparent text-base font-semibold text-foreground focus:outline-none disabled:opacity-50"
              placeholder=""
            />
            {/* Placeholder - shows old message or "FLASH" */}
            {!inputValue && (
              <span className={cn(
                "absolute left-0 text-base pointer-events-none select-none",
                placeholderText
                  ? "font-normal text-muted-foreground/70"
                  : "font-medium text-muted-foreground/50 uppercase tracking-widest"
              )}>
                {placeholderText || "FLASH"}
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

      {/* Compose button - show when viewing messages (larger for easy access) */}
      {showMessage && (
        <button
          onClick={handleComposeClick}
          className="p-2 rounded hover:bg-destructive/20 transition-colors"
          title="Skriv ny melding"
          aria-label="Ny melding"
        >
          <PenLine className="h-6 w-6 text-destructive" />
        </button>
      )}

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
    </div>
  );
}
