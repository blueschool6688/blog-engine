import React, { useState, useEffect } from 'react';
import { useLoaderData, useNavigation, useRevalidator } from 'react-router';
import { Bot, User, Search, RefreshCw, MessageSquare, Calendar } from 'lucide-react';
import { ragService } from '../services/api';
import type { Conversation, ChatMessage } from '../services/api';
import { useToast } from '../context/ToastContext';

export async function clientLoader() {
  try {
    const res = await ragService.listConversations();
    if (res.success && res.data) {
      return { conversations: res.data };
    }
  } catch (err) {
    console.error('Failed to load conversations', err);
  }
  return { conversations: [] };
}

export const ChatLogsAdmin: React.FC = () => {
  const { conversations: initialConversations } = useLoaderData() as { conversations: Conversation[] };
  const { revalidate } = useRevalidator();
  const navigation = useNavigation();
  const loading = navigation.state === 'loading';
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFingerprint, setSelectedFingerprint] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (selectedFingerprint) {
      fetchMessages(selectedFingerprint);
    } else {
      setMessages([]);
    }
  }, [selectedFingerprint]);

  const fetchMessages = async (fingerprint: string) => {
    setLoadingMessages(true);
    try {
      const res = await ragService.getConversation(fingerprint);
      if (res.success && res.data) {
        setMessages(res.data);
      } else {
        toast.error('Failed to load conversation messages');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error loading conversation messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const filteredConversations = initialConversations.filter(c =>
    c.fingerprint.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Helper to format anonymous label (e.g. Guest-ae8f)
  const getGuestLabel = (fp: string) => {
    if (fp.length > 8) {
      return `Guest-${fp.substring(0, 8)}`;
    }
    return `Guest-${fp}`;
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6">
      {/* Sidebar List */}
      <div className="w-80 flex flex-col glass-panel bg-white dark:bg-[#151B2C] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden">
        {/* Header Search */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-800 dark:text-slate-100">Hội thoại RAG</h2>
            <button 
              onClick={() => revalidate()} 
              disabled={loading}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm fingerprint..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-accentPurple focus:border-accentPurple dark:text-white"
            />
          </div>
        </div>

        {/* Scrollable Conversations */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Không tìm thấy hội thoại nào</p>
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isActive = selectedFingerprint === c.fingerprint;
              return (
                <button
                  key={c.fingerprint}
                  onClick={() => setSelectedFingerprint(c.fingerprint)}
                  className={`w-full text-left p-4 transition-all hover:bg-slate-50/50 dark:hover:bg-slate-900/30 flex flex-col gap-1 ${
                    isActive ? 'bg-gradient-to-r from-accentBlue/10 to-accentPurple/5 border-l-4 border-accentPurple' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-150">
                      {getGuestLabel(c.fingerprint)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {c.message_count} tin nhắn
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate w-full">
                    {c.fingerprint}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(c.last_active)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Details View */}
      <div className="flex-1 flex flex-col glass-panel bg-white dark:bg-[#151B2C] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden">
        {selectedFingerprint ? (
          <>
            {/* Active Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#1A2235]/30">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Chi tiết hội thoại: {getGuestLabel(selectedFingerprint)}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                Fingerprint: {selectedFingerprint}
              </p>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMessages ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accentPurple" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  Không có tin nhắn nào trong hội thoại này
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[80%] ${
                        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                      }`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isUser ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' : 'bg-accentPurple/10 text-accentPurple'
                      }`}>
                        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                          isUser
                            ? 'bg-gradient-to-tr from-accentBlue to-accentPurple text-white rounded-tr-none'
                            : 'bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 text-slate-850 dark:text-slate-200 rounded-tl-none'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <p className={`text-[10px] text-slate-400 ${isUser ? 'text-right' : 'text-left'}`}>
                          {formatDate(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
            <Bot className="w-16 h-16 text-accentPurple mb-4 animate-pulse opacity-80" />
            <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200 mb-1">
              Quản lý Log Chat RAG
            </h3>
            <p className="text-sm text-center max-w-sm">
              Chọn một hội thoại ẩn danh từ danh sách bên trái để bắt đầu theo dõi các câu hỏi và câu trả lời từ hệ thống RAG chatbot.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLogsAdmin;
