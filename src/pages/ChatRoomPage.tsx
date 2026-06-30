import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Phone, Video, MoreVertical, Send, Image,
  Mic, Smile, Shield, BadgeCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { chatApi, extractData } from '@/services/api';
import type { Conversation, Message } from '@/services/api';

export default function ChatRoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState<Conversation | null>(null);

  const profile = conversation?.profile;

  useEffect(() => {
    if (!id) return;
    let interval: ReturnType<typeof setInterval>;

    const loadConversation = async () => {
      try {
        const res = await chatApi.getConversations();
        const conversations = extractData(res);
        const conv = conversations.find((c: Conversation) => c.profile?.id === id || c.id === id);
        if (!conv) {
          toast.error('Conversation not found');
          navigate(-1);
          return;
        }
        setConversation(conv);

        const msgRes = await chatApi.getMessages(conv.id);
        const msgs = extractData(msgRes);
        setMessages(msgs.reverse());

        await chatApi.markAsRead(conv.id);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load chat');
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
    interval = setInterval(loadConversation, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, [id, navigate]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !conversation) return;
    const content = message.trim();
    setMessage('');

    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversation.id,
      sender_id: 'me',
      content,
      type: 'text',
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await chatApi.sendMessage(conversation.id, content, 'text');
      const sent = extractData(res);
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? sent : m));
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-screen bg-[#050505] text-white flex items-center justify-center">
        <p>Conversation not found</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <div className="glass flex items-center gap-3 px-4 py-3 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="relative">
          <img
            src={profile.photos?.[0] || '/images/avatar1.jpg'}
            alt={profile.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          {profile.is_online && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#050505]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-sm truncate">{profile.name}</h3>
            {profile.verification_level === 'id' && (
              <BadgeCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-white/50">
            {isTyping ? 'typing...' : profile.is_online ? 'Online' : profile.last_active}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-white/10 rounded-full transition-all">
            <Phone className="w-5 h-5 text-white/60" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-all">
            <Video className="w-5 h-5 text-white/60" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-all">
            <MoreVertical className="w-5 h-5 text-white/60" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto hide-scrollbar px-4 py-4 space-y-3">
        {/* Trust Banner */}
        <div className="flex justify-center mb-4">
          <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-white/60">
              {profile.trust_score}% Trust Score · {profile.verification_level} verified
            </span>
          </div>
        </div>

        <AnimatePresence>
          {messages.map((msg, i) => {
            const isMe = msg.sender_id === 'me';
            const showTime = i === 0 ||
              new Date(messages[i - 1].created_at).getMinutes() !== new Date(msg.created_at).getMinutes();

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] ${isMe ? 'order-1' : 'order-1'}`}>
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      isMe
                        ? 'gradient-btn text-white rounded-br-md'
                        : 'glass text-white rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                  {showTime && (
                    <p className={`text-[10px] text-white/30 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isMe && <span className="ml-1">{msg.is_read ? 'Read' : 'Sent'}</span>}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="glass px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white/40 rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-white/40 rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-white/40 rounded-full typing-dot" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="glass flex-shrink-0 px-4 py-3">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/10 rounded-full transition-all">
            <Image className="w-5 h-5 text-white/50" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-all">
            <Mic className="w-5 h-5 text-white/50" />
          </button>
          <div className="flex-1 glass rounded-full px-4 py-2.5 flex items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
            />
            <button className="p-1 hover:bg-white/10 rounded-full transition-all">
              <Smile className="w-5 h-5 text-white/40" />
            </button>
          </div>
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={`p-3 rounded-full transition-all ${
              message.trim()
                ? 'gradient-btn hover:scale-105'
                : 'bg-white/5 text-white/30'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
