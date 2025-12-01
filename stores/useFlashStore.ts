/**
 * Zustand store for Flash Message state management
 * Story 4.1: Flash Message Basic Send and Receive
 * Story 4.2: Blink Animation and Acknowledgment
 *
 * Handles:
 * - Message list with read/unread status
 * - Current message index for navigation
 * - Acknowledged IDs (persisted to localStorage)
 * - Message queue for simultaneous arrivals
 * - Blink animation state (quick/continuous/none)
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FlashMessage {
  id: string;
  content: string;
  senderName?: string | null;
  createdAt: string;
}

export type BlinkPhase = "quick" | "continuous" | "none";

interface FlashState {
  // Message state
  messages: FlashMessage[];
  currentIndex: number;
  acknowledgedIds: string[];

  // Blink animation state (Story 4.2)
  blinkPhase: BlinkPhase;

  // Full-screen flash state - flashes for 20 seconds or until acknowledged
  fullScreenFlash: boolean;

  // Computed values exposed via selectors
  // Actions
  addMessage: (message: FlashMessage, isOwnMessage?: boolean) => void;
  setMessages: (messages: FlashMessage[]) => void;
  acknowledge: (id: string) => void;
  nextMessage: () => void;
  prevMessage: () => void;
  goToMessage: (index: number) => void;
  clearExpired: () => void;
  reset: () => void;

  // Blink actions (Story 4.2)
  setBlinkPhase: (phase: BlinkPhase) => void;
  transitionToContinu: () => void;

  // Full-screen flash actions
  stopFullScreenFlash: () => void;
}

const initialState = {
  messages: [] as FlashMessage[],
  currentIndex: 0,
  acknowledgedIds: [] as string[],
  blinkPhase: "none" as BlinkPhase,
  fullScreenFlash: false,
};

export const useFlashStore = create<FlashState>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Add a new message to the queue
       * New messages are added at the beginning (most recent first)
       * Auto-navigates to the new message
       * Triggers full-screen flash for 20 seconds (Story 4.2) - unless it's own message
       */
      addMessage: (message, isOwnMessage = false) =>
        set((state) => {
          // Avoid duplicates
          if (state.messages.some((m) => m.id === message.id)) {
            return state;
          }
          return {
            messages: [message, ...state.messages].slice(0, 5), // Keep max 5 messages
            currentIndex: 0, // Navigate to newest message
            // Don't flash for own messages - only for messages from others
            blinkPhase: isOwnMessage ? "none" : "quick",
            fullScreenFlash: isOwnMessage ? false : true,
          };
        }),

      /**
       * Set all messages (used for initial load)
       * Limited to 5 messages max
       */
      setMessages: (messages) =>
        set({
          messages: messages.slice(0, 5),
          currentIndex: 0,
        }),

      /**
       * Acknowledge a message (mark as read)
       * Stay on current message - don't auto-advance
       * Stops blinking and full-screen flash when acknowledged (Story 4.2)
       */
      acknowledge: (id) =>
        set((state) => {
          // Already acknowledged
          if (state.acknowledgedIds.includes(id)) {
            return state;
          }

          const newAcknowledgedIds = [...state.acknowledgedIds, id];

          // Check if all messages are now acknowledged (Story 4.2)
          const unreadCount = state.messages.filter(
            (m) => !newAcknowledgedIds.includes(m.id)
          ).length;
          const newBlinkPhase = unreadCount === 0 ? "none" : state.blinkPhase;

          return {
            acknowledgedIds: newAcknowledgedIds,
            // Stay on current message - don't auto-advance
            blinkPhase: newBlinkPhase,
            // Stop full-screen flash on acknowledgment
            fullScreenFlash: unreadCount === 0 ? false : state.fullScreenFlash,
          };
        }),

      /**
       * Navigate to next message
       */
      nextMessage: () =>
        set((state) => {
          if (state.messages.length === 0) return state;
          const nextIndex = (state.currentIndex + 1) % state.messages.length;
          return { currentIndex: nextIndex };
        }),

      /**
       * Navigate to previous message
       */
      prevMessage: () =>
        set((state) => {
          if (state.messages.length === 0) return state;
          const prevIndex =
            state.currentIndex === 0
              ? state.messages.length - 1
              : state.currentIndex - 1;
          return { currentIndex: prevIndex };
        }),

      /**
       * Go to specific message index
       */
      goToMessage: (index) =>
        set((state) => {
          if (index < 0 || index >= state.messages.length) return state;
          return { currentIndex: index };
        }),

      /**
       * Clear expired messages (older than 24 hours)
       */
      clearExpired: () =>
        set((state) => {
          const now = Date.now();
          const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
          const validMessages = state.messages.filter(
            (m) => new Date(m.createdAt).getTime() > twentyFourHoursAgo
          );
          return {
            messages: validMessages,
            currentIndex: Math.min(state.currentIndex, validMessages.length - 1),
          };
        }),

      /**
       * Reset to initial state
       */
      reset: () => set(initialState),

      /**
       * Set blink phase directly (Story 4.2)
       */
      setBlinkPhase: (phase) => set({ blinkPhase: phase }),

      /**
       * Transition from quick blinks to continuous (Story 4.2)
       * Called when quick animation ends
       */
      transitionToContinu: () =>
        set((state) => {
          // Only transition if we're in quick phase and there are unread messages
          if (state.blinkPhase !== "quick") return state;

          const unreadCount = state.messages.filter(
            (m) => !state.acknowledgedIds.includes(m.id)
          ).length;

          return {
            blinkPhase: unreadCount > 0 ? "continuous" : "none",
          };
        }),

      /**
       * Stop full-screen flash (called after 20 seconds timeout)
       * Message remains visible but flashing stops
       */
      stopFullScreenFlash: () => set({ fullScreenFlash: false }),
    }),
    {
      name: "flash-storage",
      // Don't persist anything - fresh start on each login
      partialize: () => ({}),
    }
  )
);

// Selector hooks for common use cases

/**
 * Get current message (the one being displayed)
 */
export const useCurrentMessage = () =>
  useFlashStore((state) =>
    state.messages.length > 0 ? state.messages[state.currentIndex] : null
  );

/**
 * Get unread message count
 */
export const useUnreadCount = () =>
  useFlashStore(
    (state) =>
      state.messages.filter((m) => !state.acknowledgedIds.includes(m.id)).length
  );

/**
 * Check if a specific message is acknowledged
 */
export const useIsAcknowledged = (id: string) =>
  useFlashStore((state) => state.acknowledgedIds.includes(id));

/**
 * Get message position string (e.g., "2/5")
 */
export const useMessagePosition = () =>
  useFlashStore((state) => {
    if (state.messages.length === 0) return null;
    return `${state.currentIndex + 1}/${state.messages.length}`;
  });

/**
 * Check if current message is acknowledged
 */
export const useCurrentIsAcknowledged = () =>
  useFlashStore((state) => {
    const currentMsg = state.messages[state.currentIndex];
    return currentMsg ? state.acknowledgedIds.includes(currentMsg.id) : true;
  });

/**
 * Get current blink phase (Story 4.2)
 */
export const useBlinkPhase = () =>
  useFlashStore((state) => state.blinkPhase);

/**
 * Get full-screen flash state (Story 4.2)
 * True = screen should be flashing, False = stopped
 */
export const useFullScreenFlash = () =>
  useFlashStore((state) => state.fullScreenFlash);
