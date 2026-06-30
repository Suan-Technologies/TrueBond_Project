import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Heart, X, Star, MapPin, Briefcase, GraduationCap,
  Ruler, Languages, BadgeCheck, Shield, Flag, Ban
} from 'lucide-react';
import { mockProfiles } from '@/data/mockData';
import { useStore } from '@/store/useStore';

export default function ProfileDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setMatchedProfile, setShowMatchOverlay } = useStore();
  const profile = mockProfiles.find(p => p.id === id);

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <p>Profile not found</p>
      </div>
    );
  }

  const handleLike = () => {
    setMatchedProfile(profile);
    setShowMatchOverlay(true);
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Image Header */}
      <div className="relative h-[60vh]">
        <img
          src={profile.photos?.[0] || '/images/avatar1.jpg'}
          alt={profile.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/30 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 glass rounded-full p-3 hover:bg-white/10 transition-all z-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button className="glass rounded-full p-3 hover:bg-white/10 transition-all">
            <Flag className="w-5 h-5" />
          </button>
          <button className="glass rounded-full p-3 hover:bg-white/10 transition-all">
            <Ban className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold">{profile.name}, {profile.age}</h1>
                {profile.verification_level === 'id' && (
                  <BadgeCheck className="w-6 h-6 text-blue-400" />
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-white/60">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profile.location} · {profile.distance}
                </span>
              </div>
            </div>
            <div className="glass px-4 py-2 rounded-full">
              <div className="text-xs text-white/50">Trust</div>
              <div className="text-lg font-bold gradient-text">{profile.trust_score}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pb-32 space-y-6"
      >
        {/* Bio */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white/50 mb-2">About</h3>
          <p className="text-white/80 leading-relaxed">{profile.bio}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-4">
            <Briefcase className="w-5 h-5 text-white/40 mb-2" />
            <div className="text-xs text-white/40">Profession</div>
            <div className="text-sm font-medium">{profile.profession}</div>
          </div>
          <div className="glass rounded-2xl p-4">
            <GraduationCap className="w-5 h-5 text-white/40 mb-2" />
            <div className="text-xs text-white/40">Education</div>
            <div className="text-sm font-medium">{profile.education}</div>
          </div>
          <div className="glass rounded-2xl p-4">
            <Ruler className="w-5 h-5 text-white/40 mb-2" />
            <div className="text-xs text-white/40">Height</div>
            <div className="text-sm font-medium">{profile.height}</div>
          </div>
          <div className="glass rounded-2xl p-4">
            <Shield className="w-5 h-5 text-white/40 mb-2" />
            <div className="text-xs text-white/40">Verification</div>
            <div className="text-sm font-medium capitalize">{profile.verification_level} Verified</div>
          </div>
        </div>

        {/* Languages */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Languages className="w-5 h-5 text-white/40" />
            <h3 className="text-sm font-semibold">Languages</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.languages.map(lang => (
              <span key={lang} className="glass px-3 py-1.5 rounded-full text-xs">{lang}</span>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white/50 mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map(tag => (
              <span key={tag} className="gradient-btn px-4 py-2 rounded-full text-xs">{tag}</span>
            ))}
          </div>
        </div>

        {/* Safety */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-sm font-medium">Safety Note</div>
              <p className="text-xs text-white/50">
                Never share personal information too quickly. Report suspicious behavior.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#050505] to-transparent">
        <div className="flex items-center justify-center gap-6">
          <button className="w-14 h-14 rounded-full glass flex items-center justify-center hover:bg-red-500/20 transition-all hover:scale-110">
            <X className="w-6 h-6 text-red-400" />
          </button>
          <button className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-blue-500/20 transition-all hover:scale-110">
            <Star className="w-5 h-5 text-blue-400" />
          </button>
          <button
            onClick={handleLike}
            className="w-14 h-14 rounded-full gradient-btn flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Heart className="w-6 h-6 text-white fill-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
