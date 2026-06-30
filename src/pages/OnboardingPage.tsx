import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Briefcase, GraduationCap, Ruler,
  Heart, ChevronRight, ChevronLeft, Check,
  Sparkles, Star, Users, Crown, Gem
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { interestsList, languagesList, relationshipGoals } from '@/data/mockData';
import type { RelationshipGoal, Gender } from '@/store/useStore';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { setCurrentUser, setAuthenticated, currentUser } = useStore();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    age: '',
    gender: '' as Gender | '',
    location: currentUser?.location || '',
    profession: currentUser?.profession || '',
    education: '',
    height: '',
    languages: [] as string[],
    interests: [] as string[],
    relationshipGoal: '' as RelationshipGoal | '',
    bio: '',
  });

  const totalSteps = 5;

  const updateProfile = (key: string, value: unknown) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const toggleArray = (key: 'languages' | 'interests', value: string) => {
    setProfile(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }));
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      setAuthenticated(true);
      setCurrentUser({
        ...currentUser,
        id: 'me',
        name: profile.name,
        age: parseInt(profile.age) || 25,
        gender: profile.gender || 'other',
        photos: currentUser?.photos || ['/images/avatar1.jpg'],
        bio: profile.bio,
        location: profile.location,
        distance: '0 km',
        profession: profile.profession,
        education: profile.education,
        height: profile.height,
        languages: profile.languages,
        interests: profile.interests,
        relationshipGoal: profile.relationshipGoal || 'dating',
        verification_level: 'email',
        trust_score: currentUser?.trust_score || 45,
        is_online: true,
        last_active: 'now',
      });
      navigate('/app');
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return profile.name && profile.age && profile.gender;
      case 1: return profile.location && profile.profession && profile.education && profile.height;
      case 2: return profile.languages.length > 0;
      case 3: return profile.interests.length >= 3;
      case 4: return profile.relationshipGoal && profile.bio.length >= 20;
      default: return false;
    }
  };

  const goalIcons: Record<string, React.ElementType> = { Users, Heart, Star, Gem, Crown };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-radial from-rose-500/10 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : navigate('/auth')}
            className="glass rounded-full p-2.5 hover:bg-white/10 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-sm text-white/50">
            Step {step + 1} of {totalSteps}
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i <= step ? 'bg-gradient-to-r from-rose-400 to-purple-500' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 px-6 pb-32 overflow-y-auto hide-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-1">Basic Information</h2>
                <p className="text-white/50 mb-8">Let's start with the essentials</p>

                <div className="space-y-5">
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => updateProfile('name', e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-rose-400/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Age</label>
                    <input
                      type="number"
                      value={profile.age}
                      onChange={(e) => updateProfile('age', e.target.value.slice(0, 2))}
                      placeholder="21"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-rose-400/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Gender</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['male', 'female', 'other'] as const).map(g => (
                        <button
                          key={g}
                          onClick={() => updateProfile('gender', g)}
                          className={`py-4 rounded-xl border text-sm font-medium capitalize transition-all ${
                            profile.gender === g
                              ? 'border-rose-400/50 bg-rose-400/10 text-rose-300'
                              : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold mb-1">Professional Details</h2>
                <p className="text-white/50 mb-8">Tell us about your background</p>

                <div className="space-y-5">
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) => updateProfile('location', e.target.value)}
                        placeholder="City"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-rose-400/50 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Profession</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <input
                        type="text"
                        value={profile.profession}
                        onChange={(e) => updateProfile('profession', e.target.value)}
                        placeholder="Your job title"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-rose-400/50 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Education</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <input
                        type="text"
                        value={profile.education}
                        onChange={(e) => updateProfile('education', e.target.value)}
                        placeholder="College / University"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-rose-400/50 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Height</label>
                    <div className="relative">
                      <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <input
                        type="text"
                        value={profile.height}
                        onChange={(e) => updateProfile('height', e.target.value)}
                        placeholder="5ft 8in"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-rose-400/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-1">Languages</h2>
                <p className="text-white/50 mb-8">Select languages you speak</p>

                <div className="flex flex-wrap gap-3">
                  {languagesList.map(lang => (
                    <button
                      key={lang}
                      onClick={() => toggleArray('languages', lang)}
                      className={`px-5 py-3 rounded-full border text-sm transition-all ${
                        profile.languages.includes(lang)
                          ? 'border-rose-400/50 bg-rose-400/10 text-rose-300'
                          : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-1">Your Interests</h2>
                <p className="text-white/50 mb-8">Pick at least 3 interests (Selected: {profile.interests.length})</p>

                <div className="flex flex-wrap gap-3">
                  {interestsList.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleArray('interests', interest)}
                      className={`px-5 py-3 rounded-full border text-sm transition-all ${
                        profile.interests.includes(interest)
                          ? 'border-rose-400/50 bg-rose-400/10 text-rose-300'
                          : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-2xl font-bold mb-1">Almost There!</h2>
                <p className="text-white/50 mb-8">Set your relationship goal and bio</p>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm text-white/60 mb-3 block">Relationship Goal</label>
                    <div className="grid grid-cols-1 gap-3">
                      {relationshipGoals.map(goal => {
                        const Icon = goalIcons[goal.icon] || Heart;
                        return (
                          <button
                            key={goal.value}
                            onClick={() => updateProfile('relationshipGoal', goal.value)}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                              profile.relationshipGoal === goal.value
                                ? 'border-rose-400/50 bg-rose-400/10'
                                : 'border-white/10 bg-white/5 hover:bg-white/10'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              profile.relationshipGoal === goal.value ? 'gradient-btn' : 'bg-white/10'
                            }`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium">{goal.label}</div>
                            </div>
                            {profile.relationshipGoal === goal.value && (
                              <Check className="w-5 h-5 text-rose-400 ml-auto" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Bio ({profile.bio.length}/200)</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => updateProfile('bio', e.target.value.slice(0, 200))}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-rose-400/50 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Button */}
      <div className="relative z-10 px-6 pb-8 pt-4 bg-gradient-to-t from-[#050505] to-transparent">
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="w-full gradient-btn py-4 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {step === totalSteps - 1 ? (
            <>
              <Sparkles className="w-5 h-5" />
              Complete Profile
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
