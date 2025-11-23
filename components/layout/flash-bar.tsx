"use client";

import { useState, useRef, useEffect } from "react";
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
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Demo: Show a sample message (will be replaced with real data later)
  useEffect(() => {
    // Simulated flash message - remove this when connecting to real data
    const demoMessage: FlashMessage = {
      id: "demo-1",
      text: "Velkommen til 110 Sør-Vest operasjonssystem",
      timestamp: new Date(),
      sender: "System",
    };
    setCurrentMessage(demoMessage);
  }, []);

  const handleClearMessage = () => {
    setCurrentMessage(null);
    setIsEditing(true);
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
      setIsEditing(false);
      // TODO: Send to database/broadcast to other operators
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setInputValue("");
    }
  };

  const handleBarClick = () => {
    if (!currentMessage) {
      setIsEditing(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <div
      className={cn(
        "flex h-10 w-full items-center border-b border-border bg-card/50 px-4",
        "transition-colors",
        currentMessage ? "bg-info/10" : "hover:bg-card/80 cursor-text"
      )}
      onClick={handleBarClick}
    >
      {/* Flash label */}
      <span className="mr-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Flash
      </span>

      {/* Message display or input */}
      <div className="flex flex-1 items-center">
        {currentMessage && !isEditing ? (
          <>
            <span className="flex-1 truncate text-sm text-foreground">
              {currentMessage.text}
            </span>
            <span className="ml-2 text-xs text-muted-foreground">
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
              className="ml-3 rounded p-1 text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
              title="Fjern melding (Esc)"
              aria-label="Fjern flash-melding"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!inputValue.trim()) {
                  setIsEditing(false);
                }
              }}
              placeholder="Skriv flash-melding til alle operatører..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              autoFocus={isEditing}
            />
            {inputValue.trim() && (
              <button
                onClick={handleSendMessage}
                className="ml-2 rounded p-1 text-info hover:bg-info/20 transition-colors"
                title="Send melding (Enter)"
                aria-label="Send flash-melding"
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
