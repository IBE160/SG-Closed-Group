"use client";

import { useState, useRef } from "react";
import { X, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlashMessage {
  id: string;
  text: string;
  timestamp: Date;
  sender?: string;
}

export function FlashBar() {
  const [currentMessage, setCurrentMessage] = useState<FlashMessage | null>(null);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClearMessage = () => {
    setCurrentMessage(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: FlashMessage = {
        id: Date.now().toString(),
        text: inputValue.trim(),
        timestamp: new Date(),
        sender: "Du", // Will be replaced with actual user
      };
      setCurrentMessage(newMessage);
      setInputValue("");
      // TODO: Send to database/broadcast to other operators
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBarClick = () => {
    if (!currentMessage) {
      inputRef.current?.focus();
    }
  };

  return (
    <div
      className={cn(
        "flex h-12 w-full items-center px-4",
        "border-2 border-destructive",
        "bg-destructive/10",
        "transition-all",
        !currentMessage && "cursor-text"
      )}
      onClick={handleBarClick}
    >
      {/* Message display or input */}
      <div className="flex flex-1 items-center">
        {currentMessage ? (
          <>
            <span className="flex-1 truncate text-base font-semibold text-foreground">
              {currentMessage.text}
            </span>
            <span className="ml-3 text-xs text-muted-foreground whitespace-nowrap">
              {currentMessage.sender} •{" "}
              {currentMessage.timestamp.toLocaleTimeString("no-NO", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearMessage();
              }}
              className="ml-3 rounded p-1.5 text-destructive hover:bg-destructive/30 transition-colors"
              title="Fjern melding og skriv ny"
              aria-label="Fjern flash-melding"
            >
              <X className="h-5 w-5" />
            </button>
          </>
        ) : (
          <div className="flex flex-1 items-center relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-base font-semibold text-foreground focus:outline-none"
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
                className="ml-2 rounded p-1.5 text-destructive hover:bg-destructive/30 transition-colors"
                title="Send melding (Enter)"
                aria-label="Send flash-melding"
              >
                <Send className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
