import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Shield, Heart, Users, Clock, BadgeCheck,
  Lock
} from 'lucide-react';
import { mockProfiles } from '@/data/mockData';

export default function PassportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const profile = mockProfiles.find(p => p.id === id);

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <p>Profile not found</p>
      </div>
    );
  }

  const stats = [
    { label: 'Friendships', value: 3, icon: Users, color: 'text-blue-400' },
    { label: 'Relationships', value: 1, icon: Heart, color: 'text-rose-400' },
    { label: 'Longest (days)', value: 180, icon: Clock, color: 'text-amber-400' },
    { label: 'Trust Score', value: `${profile.trust_score}%`, icon: Shield, color: 'text-emerald-400' },
  ];

  const milestones = [
    { date: 'Jan 2024', event: 'Joined TrueBond', icon: BadgeCheck },
    { date: 'Feb 2024', event: 'Phone Verified', icon: Shield },
    { date: 'Mar 2024', event: 'Face Verified', icon: Shield },
    { date: 'Jun 2024', event: 'ID Verified', icon: BadgeCheck },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-rose-500/20 via-purple-500/20 to-blue-500/20" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 glass rounded-full p-3 hover:bg-white/10 transition-all z-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
          <div className="w-32 h-32 rounded-full p-1 gradient-btn">
            <img
              src={profile.photos[0]}
              alt={profile.name}
              className="w-full h-full rounded-full object-cover border-2 border-[#050505]"
            />
          </div>
        </div>
      </div>

      <div className="pt-20 px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold">{profile.name}'s Passport</h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Lock className="w-3.5 h-3.5 text-white/40" />
            <span className="text-xs text-white/40">Private · Consent Required</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="glass-strong rounded-2xl p-4 text-center">
                <Icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-white/50">{stat.label}</div>
              </div>
            );
          })}
        </motion.div>

        {/* Current Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-5 mb-6"
        >
          <h3 className="text-sm font-semibold text-white/50 mb-4">Current Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Status</span>
              <span className="text-sm font-medium text-emerald-400">Single</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Intent</span>
              <span className="text-sm font-medium capitalize">{profile.relationshipGoal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Member Since</span>
              <span className="text-sm font-medium">Jan 2024</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Verification</span>
              <span className="text-sm font-medium capitalize flex items-center gap-1">
                <BadgeCheck className="w-4 h-4 text-blue-400" />
                {profile.verification_level} Verified
              </span>
            </div>
          </div>
        </motion.div>

        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-white/50 mb-4">Milestones</h3>
          <div className="space-y-4">
            {milestones.map((ms, i) => {
              const Icon = ms.icon;
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-white/50" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{ms.event}</div>
                    <div className="text-xs text-white/40">{ms.date}</div>
                  </div>
                  {i < milestones.length - 1 && (
                    <div className="absolute left-9 mt-8 w-px h-4 bg-white/10" />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Privacy Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 glass rounded-2xl p-4 flex items-center gap-3"
        >
          <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-xs text-white/50">
            This passport never reveals names, photos, or identities of previous partners. 
            It only shows aggregated, anonymous statistics.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
