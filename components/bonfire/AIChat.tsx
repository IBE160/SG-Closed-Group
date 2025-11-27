'use client'

import { useChat } from '@ai-sdk/react'
import { useRef, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function AIChat() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isAdminPage = pathname?.startsWith('/admin')

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat/bonfire',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hei! Jeg er her for å hjelpe deg med å registrere en bålmelding. Hva heter du, og hvor skal bålet være?'
      }
    ],
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Ikke vis AIChat på admin-sider
  if (isAdminPage) {
    return null
  }

  // Sjekk om bålmelding er lagret (siste melding inneholder referansenummer)
  const lastMessage = messages[messages.length - 1]
  const isCompleted = lastMessage?.role === 'assistant' &&
    lastMessage.content.includes('Referansenummer:')

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-3 shadow-lg z-50 transition-all flex items-center gap-2 font-semibold"
        aria-label="Åpne AI chat"
      >
        {isOpen ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Lukk</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span>Spør meg om hjelp</span>
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl z-50 flex flex-col border border-gray-200">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg">
            <h3 className="font-semibold text-lg">AI Assistent - Bålmelding</h3>
            <p className="text-sm text-blue-100">Jeg hjelper deg med å registrere bålmelding</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-start">
                <div className="bg-red-100 text-red-800 p-3 rounded-lg">
                  <p className="text-sm">Feil: {error.message}</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            {isCompleted && (
              <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-sm font-semibold text-green-800">Da er bålmeldingen registrert!</p>
                <p className="text-xs text-green-600 mt-1">Refresh siden for å starte en ny melding</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Skriv din melding..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
                disabled={isCompleted}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim() || isCompleted}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
