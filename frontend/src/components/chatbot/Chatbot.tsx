import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Volume2, VolumeX, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { VoiceInput } from './VoiceInput';
import { chatbotAPI } from '@/services/chatbotAPI';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  powered_by?: 'gemini' | 'fallback';
}

interface SuggestionItem {
  id: string;
  text: string;
}

const suggestions: SuggestionItem[] = [
  { id: '1', text: 'Best time to visit Sikkim?' },
  { id: '2', text: 'Permits for Nathula Pass' },
  { id: '3', text: 'Plan a 5-day Sikkim trip' },
  { id: '4', text: 'Trekking routes in Sikkim' },
];

// Custom markdown components for beautiful rendering
const markdownComponents = {
  h1: ({ node, ...props }: any) => (
    <h1 className="text-2xl font-bold mt-4 mb-2 text-emerald-900" {...props} />
  ),
  h2: ({ node, ...props }: any) => (
    <h2 className="text-xl font-bold mt-3 mb-2 text-emerald-800" {...props} />
  ),
  h3: ({ node, ...props }: any) => (
    <h3 className="text-lg font-semibold mt-2 mb-1 text-emerald-700" {...props} />
  ),
  h4: ({ node, ...props }: any) => (
    <h4 className="text-base font-semibold mt-2 mb-1 text-emerald-600" {...props} />
  ),
  p: ({ node, ...props }: any) => (
    <p className="mb-2 text-slate-700 leading-relaxed" {...props} />
  ),
  ul: ({ node, ...props }: any) => (
    <ul className="list-disc list-inside mb-2 ml-2 text-slate-700" {...props} />
  ),
  ol: ({ node, ...props }: any) => (
    <ol className="list-decimal list-inside mb-2 ml-2 text-slate-700" {...props} />
  ),
  li: ({ node, ...props }: any) => (
    <li className="mb-1 text-slate-700" {...props} />
  ),
  table: ({ node, ...props }: any) => (
    <div className="overflow-x-auto my-3 rounded-lg border border-emerald-300">
      <table className="w-full border-collapse bg-white" {...props} />
    </div>
  ),
  thead: ({ node, ...props }: any) => (
    <thead className="bg-emerald-600 text-white" {...props} />
  ),
  tbody: ({ node, ...props }: any) => <tbody {...props} />,
  tr: ({ node, ...props }: any) => (
    <tr className="border-b border-emerald-300 hover:bg-emerald-50" {...props} />
  ),
  th: ({ node, ...props }: any) => (
    <th className="px-4 py-2 text-left font-semibold border-r border-emerald-300" {...props} />
  ),
  td: ({ node, ...props }: any) => (
    <td className="px-4 py-2 border-r border-emerald-200" {...props} />
  ),
  code: ({ node, inline, ...props }: any) => {
    if (inline) {
      return <code className="bg-slate-200 px-2 py-1 rounded text-sm font-mono text-slate-900" {...props} />;
    }
    return (
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto mb-2">
        <code className="font-mono text-sm" {...props} />
      </pre>
    );
  },
  blockquote: ({ node, ...props }: any) => (
    <blockquote className="border-l-4 border-emerald-600 pl-4 py-2 my-2 bg-emerald-50 italic text-slate-700" {...props} />
  ),
  a: ({ node, ...props }: any) => (
    <a className="text-emerald-600 hover:text-emerald-700 underline" target="_blank" rel="noopener noreferrer" {...props} />
  ),
};

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'bot',
      content: "🏔️ Namaste! I'm **SikkimAI**, your Himalayan travel expert powered by Google Gemini.\n\nI can help you plan your perfect Sikkim trip — permits, destinations, weather, trekking, food and more. What would you like to know?",
      timestamp: new Date(),
      powered_by: 'gemini',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const generateId = () => `msg-${Date.now()}-${Math.random()}`;

  // Text-to-Speech function
  const speakMessage = (text: string, messageId: string) => {
    // Stop any currently playing speech
    if (synthesisRef.current) {
      window.speechSynthesis.cancel();
    }

    // Check if browser supports Web Speech API
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser');
      return;
    }

    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setPlayingMessageId(messageId);
      console.log('[TTS] Started speaking');
    };

    utterance.onend = () => {
      setPlayingMessageId(null);
      console.log('[TTS] Finished speaking');
    };

    utterance.onerror = (event) => {
      console.error('[TTS] Error:', event.error);
      setPlayingMessageId(null);
    };

    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setPlayingMessageId(null);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Build history from current messages for multi-turn context
      const history = messages
        .filter(m => m.id !== '0')
        .map(m => ({ role: m.role, content: m.content }));

      const data = await chatbotAPI.sendMessage(userMessage.content, history);
      const botMessage: Message = {
        id: generateId(),
        role: 'bot',
        content: data.response || 'Sorry, I could not generate a response.',
        timestamp: new Date(),
        powered_by: data.powered_by,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Error connecting to the server. Is the Flask backend running on http://localhost:5000?';
      setError(errorMsg);

      const errorMessage: Message = {
        id: generateId(),
        role: 'bot',
        content: `❌ ${errorMsg}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleVoiceTranscript = (transcript: string) => {
    // Voice input adds transcript to input field and auto-sends
    setInput(transcript);
    
    // Auto-send after React updates state
    setTimeout(() => {
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content: transcript,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setError(null);

      // Call backend
      chatbotAPI.sendMessage(transcript)
        .then((data) => {
          const botMessage: Message = {
            id: generateId(),
            role: 'bot',
            content: data.response || 'Sorry, I could not generate a response.',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMessage]);
          
          // Auto-play response
          setTimeout(() => {
            speakMessage(data.response || 'Sorry, I could not generate a response.', botMessage.id);
          }, 300);
        })
        .catch((err) => {
          const errorMsg = err instanceof Error ? err.message : 'Error connecting to server';
          setError(errorMsg);
          const errMessage: Message = {
            id: generateId(),
            role: 'bot',
            content: `❌ ${errorMsg}`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errMessage]);
        })
        .finally(() => setIsLoading(false));
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {/* Chat Button with Enhanced Animation */}
      {!isOpen && (
        <div className="relative group">
          {/* Pulse Ring Animation */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-pulse delay-200" />

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            Ask AI Assistant
            <div className="absolute top-full right-2 w-2 h-2 bg-slate-900 transform rotate-45" />
          </div>

          {/* Main Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group-hover:from-emerald-600 group-hover:to-teal-700"
            aria-label="Open chat"
          >
            <MessageCircle size={24} className="group-hover:animate-bounce" />
          </button>
        </div>
      )}

      {/* Chat Window with Enhanced Styling */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-96 max-h-[600px] flex flex-col animate-in slide-in-from-bottom-5 overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg">SikkimAI</h3>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
                  Powered by Gemini · Himalayan Expert
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-lg transition-colors duration-200"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-slate-50 to-slate-100 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                } animate-fade-in`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-xl text-sm leading-relaxed flex items-start gap-2 transition-all duration-300 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-br-none shadow-md hover:shadow-lg'
                      : 'bg-white text-slate-800 rounded-bl-none shadow-sm hover:shadow-md border border-slate-200'
                  }`}
                >
                  <div className="flex-1">
                    {message.role === 'bot' ? (
                      <>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                          {message.content}
                        </ReactMarkdown>
                        {message.powered_by === 'gemini' && (
                          <div className="mt-1 flex items-center gap-1">
                            <Sparkles size={10} className="text-emerald-500" />
                            <span className="text-xs text-emerald-500 font-medium">Gemini</span>
                          </div>
                        )}
                      </>
                    ) : (
                      message.content
                    )}
                  </div>
                  
                  {message.role === 'bot' && (
                    <button
                      onClick={() => 
                        playingMessageId === message.id
                          ? stopSpeaking()
                          : speakMessage(message.content, message.id)
                      }
                      className={`flex-shrink-0 p-2 rounded-lg transition-all duration-300 ${
                        playingMessageId === message.id
                          ? 'bg-amber-100 text-amber-600 hover:bg-amber-200 animate-pulse'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title={playingMessageId === message.id ? 'Stop speaking' : 'Read message'}
                      aria-label="Text-to-speech"
                    >
                      {playingMessageId === message.id ? (
                        <VolumeX size={16} />
                      ) : (
                        <Volume2 size={16} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-800 rounded-xl rounded-bl-none px-4 py-3 border border-slate-200">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions (show only when no messages or at the start) */}
          {messages.length <= 1 && !isLoading && (
            <div className="px-4 py-4 bg-white border-t border-slate-200">
              <p className="text-xs text-slate-600 mb-3 font-bold uppercase tracking-wide">
                ✨ Try asking:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="text-xs bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-700 px-3 py-2 rounded-lg transition-all duration-300 text-left font-semibold hover:shadow-md border border-emerald-100 hover:border-emerald-300"
                  >
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Section */}
          <div className="border-t border-slate-200 p-4 bg-white rounded-b-xl">
            {error && (
              <div className="text-xs text-red-600 mb-3 p-3 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                {error}
              </div>
            )}
            <div className="flex gap-2 items-end">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 transition-all duration-300 disabled:bg-slate-100"
                disabled={isLoading}
              />
              <VoiceInput onTranscript={handleVoiceTranscript} isLoading={isLoading} />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-lg p-2 transition-all duration-300 hover:shadow-lg active:scale-95"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
