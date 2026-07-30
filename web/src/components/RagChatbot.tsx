import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Bot, User } from 'lucide-react';
import { ragService } from '../services/api';
import { Link } from 'react-router';
import { useLanguage } from '../context/LanguageContext';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  sources?: { id: number; title: string; slug: string }[];
}

export const RagChatbot: React.FC = () => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load from database on client-side mount (re-runs when language changes to translate base greeting)
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await ragService.getHistory();
        if (response.success && response.data && response.data.length > 0) {
          const mappedMessages: Message[] = response.data.map(msg => ({
            id: msg.id.toString(),
            role: msg.role === 'user' ? 'user' : 'bot',
            content: msg.content
          }));
          setMessages(mappedMessages);
        } else {
          setMessages([
            { id: '1', role: 'bot', content: t('bot_greeting') }
          ]);
        }
      } catch (e) {
        console.error("Failed to load chat history", e);
        setMessages([
          { id: '1', role: 'bot', content: t('bot_greeting') }
        ]);
      }
    };
    fetchHistory();
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await ragService.chat({ question: userMsg.content });
      if (response.success && response.data) {
        let sources = undefined;
        if (response.data.sources && response.data.sources.length > 0) {
          sources = response.data.sources; // Backend now returns {id, title, slug}
        }

        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          content: response.data.answer,
          sources
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error('Failed to get answer');
      }
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: t('chat_error'),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputValue);
  };

  const clearChat = () => {
    setMessages([{ id: Date.now().toString(), role: 'bot', content: t('bot_greeting') }]);
  };

  const suggestions = [
    t('suggestion_hello'),
    t('suggestion_intro'),
    t('suggestion_purpose'),
    t('suggestion_programming')
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-4 sm:bottom-24 sm:right-6 p-4 rounded-full bg-accentPurple text-white shadow-xl shadow-accentPurple/30 transition-all duration-300 hover:scale-110 z-50 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        aria-label="Open AI Assistant"
      >
        <Bot className="w-6 h-6" />
      </button>

      <div
        className={`fixed inset-x-0 bottom-0 top-0 sm:left-auto sm:top-auto sm:bottom-24 sm:right-6 w-full sm:w-[400px] h-full sm:h-[550px] sm:max-h-[calc(100vh-12rem)] bg-white dark:bg-[#151B2C] border-t sm:border border-slate-200/80 dark:border-slate-800/80 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col transition-all duration-350 origin-bottom-right z-50 ${
          isOpen 
            ? 'translate-y-0 sm:scale-100 sm:opacity-100' 
            : 'translate-y-full sm:translate-y-0 sm:scale-0 sm:opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#1A2235]/50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accentPurple/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-accentPurple" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">{t('ai_assistant')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('ask_about_articles')}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 1 && (
              <button
                onClick={clearChat}
                className="text-[10px] uppercase font-bold text-slate-400 hover:text-red-500 mr-2 transition-colors"
              >
                {t('clear_chat')}
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-accentBlue/10' : 'bg-accentPurple/10'}`}>
                {msg.role === 'user' ? (
                  <User className="w-3.5 h-3.5 text-accentBlue" />
                ) : (
                  <Bot className="w-3.5 h-3.5 text-accentPurple" />
                )}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${msg.role === 'user' ? 'bg-accentBlue text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'}`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300 opacity-90">{t('chat_sources')}</p>
                    <ul className="space-y-1">
                      {msg.sources.map(source => (
                        <li key={source.id}>
                          <Link to={`/posts/${source.slug}`} className="text-xs text-accentBlue hover:underline flex items-center gap-1">
                            • {source.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-accentPurple/10 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-accentPurple" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3">
                <Loader2 className="w-4 h-4 text-accentPurple animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {suggestions.map((text, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(text)}
                className="text-xs bg-accentPurple/10 text-accentPurple px-2.5 py-1.5 rounded-full hover:bg-accentPurple/20 transition-colors"
              >
                {text}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#151B2C] rounded-b-2xl">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={t('type_question_placeholder')}
              className="flex-1 max-h-32 min-h-[44px] bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accentPurple/20 focus:border-accentPurple/50"
              rows={1}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 bg-accentPurple text-white rounded-xl hover:bg-accentPurple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
