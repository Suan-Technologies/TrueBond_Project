import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, User, ScanEye, X, Star,
  MapPin, Briefcase, GraduationCap, BadgeCheck, Filter,
  Settings, Crown, Bell, Sparkles, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/store/useStore';
import { chatApi, matchApi, discoveryApi, extractData } from '@/services/api';
import type { Profile, Conversation, Match } from '@/services/api';
import { moments } from '@/data/mockData';

type Tab = 'discover' | 'matches' | 'moments' | 'chat' | 'profile';

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'discover', label: 'Discover', icon: ScanEye },
  { key: 'matches', label: 'Matches', icon: Heart },
  { key: 'moments', label: 'Moments', icon: Sparkles },
  { key: 'chat', label: 'Chat', icon: MessageCircle },
  { key: 'profile', label: 'Me', icon: User },
];

/* ─── Discover / Swipe View ─── */
function DiscoverView({ onLike, onPass, onSuperLike }: {
  onLike: (p: Profile) => void;
  onPass: () => void;
  onSuperLike: (p: Profile) => void;
}) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const res = await discoveryApi.getProfiles();
      const data = extractData(res);
      const profiles = Array.isArray(data) ? data : data.profiles || [];
      setProfiles(profiles);
      setCurrentIndex(0);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const profile = profiles[currentIndex];

  const handleSwipe = async (dir: 'left' | 'right' | 'up') => {
    if (!profile) return;
    setDirection(dir);

    try {
      if (dir === 'right') {
        const res = await discoveryApi.likeProfile(profile.id);
        const data = extractData(res) as any;
        if (data.is_match) onLike(profile);
      } else if (dir === 'up') {
        const res = await discoveryApi.superLike(profile.id);
        const data = extractData(res) as any;
        if (data.is_match) onSuperLike(profile);
      } else if (dir === 'left') {
        await discoveryApi.passProfile(profile.id);
        onPass();
      }
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    }

    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setDirection(null);
    }, 300);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8">
        <Heart className="w-16 h-16 text-white/10 mb-4" />
        <h3 className="text-xl font-bold mb-2">No More Profiles</h3>
        <p className="text-sm text-white/50 text-center mb-6">Check back later or adjust your filters</p>
        <button onClick={loadProfiles} className="gradient-btn px-6 py-3 rounded-full text-sm font-medium">
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={() => setShowFilter(!showFilter)} className="glass rounded-full p-2.5 hover:bg-white/10 transition-all">
          <Filter className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gradient-btn flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-bold text-lg">TrueBond</span>
        </div>
        <button className="glass rounded-full p-2.5 hover:bg-white/10 transition-all relative">
          <Bell className="w-5 h-5" />
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-400 rounded-full border-2 border-[#050505]" />
        </button>
      </div>

      {/* Filter Bar */}
      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 flex gap-2 overflow-x-auto hide-scrollbar">
              {['Nearby', 'Verified', 'Online', 'New'].map(f => (
                <button key={f} className="glass px-4 py-2 rounded-full text-xs whitespace-nowrap hover:bg-white/10 transition-all">
                  {f}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Stack */}
      <div className="flex-1 flex items-center justify-center px-4 py-2 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: direction === 'left' ? -400 : direction === 'right' ? 400 : direction === 'up' ? 0 : 0,
              y: direction === 'up' ? -400 : 0,
              rotate: direction === 'left' ? -20 : direction === 'right' ? 20 : 0,
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-[380px] aspect-[3/4.5] rounded-3xl overflow-hidden card-shadow relative"
          >
            {/* Image */}
            <img
              src={profile.photos?.[0] || '/images/avatar1.jpg'}
              alt={profile.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            {/* Swipe Labels */}
            {direction === 'left' && (
              <div className="absolute top-8 right-8 border-4 border-red-500 text-red-500 text-3xl font-bold px-4 py-2 rounded-xl rotate-12">
                NOPE
              </div>
            )}
            {direction === 'right' && (
              <div className="absolute top-8 left-8 border-4 border-emerald-500 text-emerald-500 text-3xl font-bold px-4 py-2 rounded-xl -rotate-12">
                LIKE
              </div>
            )}
            {direction === 'up' && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 border-4 border-blue-400 text-blue-400 text-3xl font-bold px-4 py-2 rounded-xl">
                SUPER LIKE
              </div>
            )}

            {/* Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold">{profile.name}, {profile.age}</h3>
                    {profile.verification_level === 'id' && (
                      <BadgeCheck className="w-5 h-5 text-blue-400" />
                    )}
                    {profile.verification_level === 'face' && (
                      <BadgeCheck className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-white/70">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {profile.location}
                    </span>
                    <span>{profile.distance}</span>
                  </div>
                </div>
                <div className="glass px-3 py-1.5 rounded-full">
                  <span className="text-xs font-medium">{profile.trust_score}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3 text-sm text-white/60">
                <Briefcase className="w-3.5 h-3.5" />
                <span>{profile.profession}</span>
                <span className="text-white/20">|</span>
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{profile.education}</span>
              </div>

              <p className="text-sm text-white/70 mb-4 line-clamp-2">{profile.bio}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {(profile.interests || []).slice(0, 4).map((tag: string) => (
                  <span key={tag} className="glass px-3 py-1 rounded-full text-xs">{tag}</span>
                ))}
              </div>

              {profile.is_online && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs text-emerald-400">Online now</span>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-6 pb-6 pt-2">
        <button
          onClick={() => handleSwipe('left')}
          className="w-14 h-14 rounded-full glass flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/50 transition-all hover:scale-110"
        >
          <X className="w-6 h-6 text-red-400" />
        </button>
        <button
          onClick={() => handleSwipe('up')}
          className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-blue-500/20 hover:border-blue-500/50 transition-all hover:scale-110"
        >
          <Star className="w-5 h-5 text-blue-400" />
        </button>
        <button
          onClick={() => handleSwipe('right')}
          className="w-14 h-14 rounded-full gradient-btn flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Heart className="w-6 h-6 text-white fill-white" />
        </button>
      </div>
    </div>
  );
}

/* ─── Matches View ─── */
function MatchesView() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const res = await matchApi.getMatches();
      const data = extractData(res);
      const matches = Array.isArray(data) ? data : data.matches || [];
      setMatches(matches);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const newMatches = matches.filter(m => m.is_new);
  const allMatches = matches;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold mb-1">Your Matches</h1>
        <p className="text-sm text-white/50">{allMatches.length} people liked you back</p>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-4">
        {/* New Matches */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white/50 mb-3">New Matches</h3>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {newMatches.map(match => (
              <button
                key={match.id}
                onClick={() => match.profile && navigate(`/chat/${match.profile.id}`)}
                className="flex-shrink-0 text-center"
              >
                <div className="w-20 h-20 rounded-full p-0.5 gradient-btn mb-2">
                  <img
                    src={match.profile?.photos?.[0] || '/images/avatar1.jpg'}
                    alt={match.profile?.name}
                    className="w-full h-full rounded-full object-cover border-2 border-[#050505]"
                  />
                </div>
                <span className="text-xs">{match.profile?.name}</span>
              </button>
            ))}
            {newMatches.length === 0 && (
              <div className="glass rounded-2xl p-6 text-center flex-1">
                <Heart className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-sm text-white/40">No new matches yet</p>
              </div>
            )}
          </div>
        </div>

        {/* All Matches */}
        <div>
          <h3 className="text-sm font-semibold text-white/50 mb-3">All Matches</h3>
          <div className="space-y-3">
            {allMatches.map(match => (
              <button
                key={match.id}
                onClick={() => match.profile && navigate(`/chat/${match.profile.id}`)}
                className="w-full glass rounded-2xl p-4 flex items-center gap-4 hover:bg-white/[0.08] transition-all text-left"
              >
                <div className="relative">
                  <img
                    src={match.profile?.photos?.[0] || '/images/avatar1.jpg'}
                    alt={match.profile?.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  {match.profile?.is_online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#050505]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{match.profile?.name}</h4>
                    {match.profile?.verification_level === 'id' && (
                      <BadgeCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-white/50 truncate">{match.profile?.profession}</p>
                </div>
                <MessageCircle className="w-5 h-5 text-white/30" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Moments View ─── */
function MomentsView() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Moments</h1>
          <p className="text-sm text-white/50">Share your story</p>
        </div>
        <button className="gradient-btn px-4 py-2 rounded-full text-sm font-medium">
          + Post
        </button>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-4 space-y-4">
        {moments.map(moment => (
          <motion.div
            key={moment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl overflow-hidden"
          >
            {/* User Header */}
            <div className="flex items-center gap-3 p-4">
              <img
                src={moment.user.photos[0]}
                alt={moment.user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{moment.user.name}</span>
                  {moment.user.verification_level === 'id' && (
                    <BadgeCheck className="w-3.5 h-3.5 text-blue-400" />
                  )}
                </div>
                <span className="text-xs text-white/40">{moment.timeAgo}</span>
              </div>
            </div>

            {/* Image */}
            <img
              src={moment.image}
              alt={moment.caption}
              className="w-full aspect-[4/3] object-cover"
            />

            {/* Actions */}
            <div className="p-4">
              <div className="flex items-center gap-4 mb-2">
                <button className="flex items-center gap-1.5 text-sm text-white/60 hover:text-rose-400 transition-colors">
                  <Heart className="w-5 h-5" />
                  {moment.likes}
                </button>
                <button className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  {moment.comments}
                </button>
              </div>
              <p className="text-sm text-white/70">{moment.caption}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Chat View ─── */
function ChatView() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await chatApi.getConversations();
      const data = extractData(res);
      const conversations = Array.isArray(data) ? data : data.conversations || [];
      setConversations(conversations);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-sm text-white/50">
            {totalUnread > 0 ? `${totalUnread} unread` : 'No new messages'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-4 space-y-2">
        {conversations.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center mt-8">
            <MessageCircle className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">No messages yet</h3>
            <p className="text-sm text-white/40">Start matching to begin conversations</p>
          </div>
        )}
        {conversations.map(conv => (
          <button
            key={conv.id}
            onClick={() => navigate(`/chat/${conv.profile.id}`)}
            className="w-full glass rounded-2xl p-4 flex items-center gap-4 hover:bg-white/[0.08] transition-all text-left"
          >
            <div className="relative flex-shrink-0">
              <img
                src={conv.profile?.photos?.[0] || '/images/avatar1.jpg'}
                alt={conv.profile?.name}
                className="w-14 h-14 rounded-full object-cover"
              />
              {conv.profile?.is_online && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#050505]" />
              )}
              {conv.unread_count > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold">
                  {conv.unread_count}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <h4 className={`font-semibold truncate ${conv.unread_count > 0 ? 'text-white' : 'text-white/80'}`}>
                  {conv.profile?.name}
                </h4>
                <span className="text-xs text-white/30 flex-shrink-0 ml-2">
                  {conv.last_message && new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className={`text-sm truncate ${conv.unread_count > 0 ? 'text-white/70' : 'text-white/40'}`}>
                {conv.last_message?.content}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Profile View ─── */
function ProfileView() {
  const navigate = useNavigate();
  const { currentUser } = useStore();

  const menuItems = [
    { icon: User, label: 'Edit Profile', path: '/settings' },
    { icon: BadgeCheck, label: 'Verification Center', path: '/settings' },
    { icon: Crown, label: 'Premium Plans', path: '/premium' },
    { icon: Heart, label: 'My Preferences', path: '/settings' },
    { icon: Sparkles, label: 'AI Insights', path: '/settings' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto hide-scrollbar">
      {/* Profile Header */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-rose-500/30 via-purple-500/30 to-blue-500/30" />
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
          <div className="w-32 h-32 rounded-full p-1 gradient-btn">
            <img
              src={currentUser?.photos?.[0] || '/images/avatar1.jpg'}
              alt="Profile"
              className="w-full h-full rounded-full object-cover border-2 border-[#050505]"
            />
          </div>
        </div>
      </div>

      <div className="pt-20 px-4 pb-4 text-center">
        <h2 className="text-xl font-bold">{currentUser?.name || 'User'}</h2>
        <p className="text-sm text-white/50">{currentUser?.profession || 'Complete your profile'}</p>

        {/* Trust Score */}
        <div className="mt-4 glass rounded-2xl p-4 inline-block">
          <div className="text-xs text-white/50 mb-1">Trust Score</div>
          <div className="text-2xl font-bold gradient-text">{currentUser?.trust_score || 0}%</div>
          <div className="w-32 h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full gradient-btn rounded-full transition-all duration-1000"
              style={{ width: `${currentUser?.trust_score || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="px-4 pb-8 space-y-2">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className="w-full glass rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.08] transition-all text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <Icon className="w-5 h-5 text-white/70" />
              </div>
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-white/30" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Match Overlay ─── */
function MatchOverlay({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="text-center"
      >
        <h2 className="text-4xl font-bold gradient-text mb-2">It's a Match!</h2>
        <p className="text-white/50 mb-8">You and {profile.name} liked each other</p>

        <div className="flex items-center justify-center gap-4 mb-8">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <img
              src="/images/avatar1.jpg"
              alt="You"
              className="w-24 h-24 rounded-full object-cover border-4 border-rose-400"
            />
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            <Heart className="w-10 h-10 text-rose-400 fill-rose-400" />
          </motion.div>
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <img
              src={profile.photos?.[0] || '/images/avatar1.jpg'}
              alt={profile.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-rose-400"
            />
          </motion.div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => { onClose(); navigate(`/chat/${profile.id}`); }}
            className="w-full gradient-btn py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Send Message
          </button>
          <button
            onClick={onClose}
            className="w-full glass py-4 rounded-xl font-medium text-white/70 hover:bg-white/10 transition-all"
          >
            Keep Swiping
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main App ─── */
export default function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [matchProfile, setMatchProfile] = useState<Profile | null>(null);

  const handleLike = (profile: Profile) => {
    setMatchProfile(profile);
  };

  const handleSuperLike = (profile: Profile) => {
    setMatchProfile(profile);
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'discover' && (
              <DiscoverView onLike={handleLike} onPass={() => {}} onSuperLike={handleSuperLike} />
            )}
            {activeTab === 'matches' && <MatchesView />}
            {activeTab === 'moments' && <MomentsView />}
            {activeTab === 'chat' && <ChatView />}
            {activeTab === 'profile' && <ProfileView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="flex-shrink-0 px-4 pb-4 pt-2">
        <div className="glass rounded-full flex items-center justify-around h-16">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-full transition-all ${
                  isActive ? 'text-white' : 'text-white/40 hover:text-white/60'
                }`}
              >
                <motion.div
                  animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                <span className="text-[10px] font-medium">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-0.5 w-1 h-1 bg-rose-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 400 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Match Overlay */}
      <AnimatePresence>
        {matchProfile && (
          <MatchOverlay
            profile={matchProfile}
            onClose={() => setMatchProfile(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
