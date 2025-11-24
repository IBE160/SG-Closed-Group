'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';

export default function BonfireRegistrationPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat/bonfire',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hei! 👋 Jeg hjelper deg med å registrere en bålmelding til 110 Sør-Vest.\n\nLa oss begynne - hva er navnet ditt?',
      },
    ],
    onFinish: (message) => {
      // Log completed conversations for analytics
      if (message.content.includes('✅ Bålmeldingen er nå registrert')) {
        console.log('Successful bonfire registration');
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex flex-col">
      {/* Header */}
      <header className="bg-red-600 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="bg-white text-red-600 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Bålmelding 110 Sør-Vest</h1>
              <p className="text-red-100 mt-1">Registrer planlagt bål</p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
        <div className="space-y-4 mb-24">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              <p className="font-semibold">Det oppstod en feil</p>
              <p className="text-sm mt-1">Vennligst prøv igjen eller kontakt 110 Sør-Vest direkte.</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area - fixed at bottom */}
      <div className="border-t bg-white shadow-lg">
        <div className="max-w-4xl mx-auto p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Skriv ditt svar her..."
              className="flex-1 border-2 border-gray-300 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
              disabled={isLoading}
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              Send
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Dine opplysninger behandles i henhold til GDPR og lagres kun for operasjonelle formål
          </p>
        </div>
      </div>
    </div>
  );
}
