import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../services/api';
import VoiceInput from '../components/VoiceInput';
import {
  Sparkles,
  Send,
  Plus,
  Search,
  Trash2,
  Copy,
  Check,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Bot,
  User,
  Loader2,
  MessageSquare,
} from 'lucide-react';

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q');

  const [conversations, setConversations] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [savedIndex, setSavedIndex] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const chats = await api.getChats(1, 30, searchQuery);
      setConversations(chats);
      if (chats.length > 0 && !currentChatId) {
        loadChatDetail(chats[0].id);
      }
    } catch (err) {
      console.error("Failed to load chats:", err);
    }
  };

  // If initialQuery is passed, auto-submit or prepare message
  useEffect(() => {
    if (initialQuery && conversations.length > 0 && messages.length === 0) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const loadChatDetail = async (id) => {
    try {
      setCurrentChatId(id);
      const detail = await api.getChatDetail(id);
      setMessages(detail.messages || []);
    } catch (err) {
      console.error("Failed to load chat details:", err);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setInputMessage('');
  };

  const handleDeleteChat = async (e, id) => {
    e.stopPropagation();
    try {
      await api.deleteChat(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentChatId === id) {
        handleNewChat();
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  const handleSend = async (overrideText) => {
    const textToSend = overrideText || inputMessage;
    if (!textToSend.trim() || loading) return;

    // Optimistically add user message
    const tempUserMsg = {
      id: Date.now(),
      role: 'user',
      content: textToSend,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await api.askQuestion({
        question: textToSend,
        conversation_id: currentChatId,
      });

      // Update current chat ID if this was a new conversation
      if (!currentChatId && res.conversation_id) {
        setCurrentChatId(res.conversation_id);
      }

      // Add AI response
      const aiMsg = {
        id: res.message_id || Date.now() + 1,
        role: 'assistant',
        content: res.answer,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);

      // Refresh sidebar list
      fetchConversations();
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: `⚠️ **EduGenie Notice**: ${err.message || "Couldn't reach AI engine right now. Please check Gemini API configuration in .env or try again."}`,
          created_at: new Date().toISOString(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSaveResponse = async (content, index) => {
    try {
      await api.saveItem({
        item_type: 'question',
        title: content.slice(0, 60) + '...',
        content: content,
      });
      setSavedIndex(index);
      setTimeout(() => setSavedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to save item:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex rounded-3xl overflow-hidden glass-panel border border-slate-200/80 dark:border-slate-800/80 shadow-xl">
      
      {/* 1. Chats Sidebar */}
      <div className="hidden md:flex flex-col w-72 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40">
        
        {/* Top actions */}
        <div className="p-3 border-b border-slate-200/80 dark:border-slate-800/80 space-y-2">
          <button
            onClick={handleNewChat}
            className="w-full py-2.5 px-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Study Session</span>
          </button>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchConversations()}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-800/60 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length > 0 ? (
            conversations.map((chat) => (
              <div
                key={chat.id}
                onClick={() => loadChatDetail(chat.id)}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                  currentChatId === chat.id
                    ? 'bg-primary-100/70 dark:bg-primary-950/70 text-primary-900 dark:text-primary-100 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 text-primary-500" />
                  <span className="truncate">{chat.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded transition-opacity"
                  title="Delete chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              No study chats yet. Start asking!
            </div>
          )}
        </div>

      </div>

      {/* 2. Main Chat Conversation Area */}
      <div className="flex-1 flex flex-col justify-between bg-white/20 dark:bg-slate-900/20">
        
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto p-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-violetAccent-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/20 mb-4">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                EduGenie Academic Q&A Tutor
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
                Ask about concepts, algorithm proofs, debugging, or syllabus questions in English, Tamil, or Tanglish.
              </p>
              
              <div className="grid grid-cols-1 gap-2 w-full text-xs">
                {[
                  "Explain polymorphism with a real-world vehicle example",
                  "How does Dijkstra's algorithm work with priority queue?",
                  "Difference between Process and Thread in Operating Systems",
                  "Why do we need normalization in relational databases?",
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputMessage(sample);
                      handleSend(sample);
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/70 text-left text-slate-700 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all shadow-sm"
                  >
                    💬 {sample}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id || index}
                  className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      isUser
                        ? 'bg-primary-600 text-white'
                        : 'bg-violet-600 text-white'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`space-y-1.5 ${isUser ? 'text-right' : ''}`}>
                    <div
                      className={`inline-block p-4 rounded-2xl text-xs sm:text-sm leading-relaxed text-left ${
                        isUser
                          ? 'bg-primary-600 text-white shadow-md shadow-primary-600/15'
                          : 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 shadow-sm'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="markdown-body">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {/* AI Message Action Bar */}
                    {!isUser && (
                      <div className="flex items-center gap-2 text-slate-400 text-[11px] pt-1 pl-1">
                        <button
                          onClick={() => handleCopy(msg.content, index)}
                          className="hover:text-primary-600 flex items-center gap-1"
                          title="Copy response"
                        >
                          {copiedIndex === index ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedIndex === index ? 'Copied' : 'Copy'}</span>
                        </button>
                        <span>•</span>
                        <button
                          onClick={() => handleSaveResponse(msg.content, index)}
                          className="hover:text-primary-600 flex items-center gap-1"
                          title="Save to library"
                        >
                          {savedIndex === index ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Bookmark className="w-3.5 h-3.5" />}
                          <span>{savedIndex === index ? 'Saved' : 'Save'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* AI Thinking Animation */}
          {loading && (
            <div className="flex gap-3 max-w-xl">
              <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                <span>EduGenie is reasoning through your question...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 focus-within:ring-2 focus-within:ring-primary-500 shadow-sm"
          >
            <textarea
              rows={1}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your studies... (Enter to send, Shift+Enter for newline)"
              className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm focus:outline-none resize-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
            
            <VoiceInput
              onTranscript={(t) => setInputMessage(prev => prev ? `${prev} ${t}` : t)}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/25 transition-all disabled:opacity-40"
              title="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-1.5 flex justify-between text-[10px] text-slate-400 px-1">
            <span>Powered by Google Gemini 1.5 Flash</span>
            <span>+5 XP per question asked</span>
          </div>
        </div>

      </div>

    </div>
  );
}
