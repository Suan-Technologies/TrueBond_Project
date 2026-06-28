import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Shield, Heart, Lock, Zap, Users, Star,
  BadgeCheck, MessageCircle,
  Siren, Brain, Camera, EyeOff, ArrowRight,
  Sparkles, Crown, Gem, Phone
} from 'lucide-react';
import { safetyFeatures } from '@/data/mockData';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  }),
};

const iconMap: Record<string, React.ElementType> = {
  Siren, Brain, Camera, EyeOff, Shield, Lock, Heart, Zap, Users, Star,
  BadgeCheck, MessageCircle, Sparkles, Crown, Gem, Phone, ArrowRight,
};

function FloatingOrb({ delay, x, y, size }: { delay: number; x: number; y: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        background: `radial-gradient(circle, rgba(244,63,94,0.15) 0%, rgba(139,92,246,0.08) 50%, transparent 70%)`,
      }}
      animate={{
        x: [0, 30, -20, 0],
        y: [0, -20, 30, 0],
        scale: [1, 1.1, 0.95, 1],
      }}
      transition={{
        duration: 12,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { value: '5kM+', label: 'Verified Users' },
    { value: '1k+', label: 'Successful Matches' },
    { value: '1K+', label: 'Relationships' },
    { value: '99.9%', label: 'Safety Score' },
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Verify Your Identity',
      description: 'Complete multi-layer verification including phone, email, face match, and government ID.',
      icon: Shield,
    },
    {
      step: '02',
      title: 'Create Your Profile',
      description: 'Share your story, interests, and what you are looking for in a genuine connection.',
      icon: Users,
    },
    {
      step: '03',
      title: 'Discover Matches',
      description: 'Our AI finds compatible profiles based on values, interests, and relationship goals.',
      icon: Sparkles,
    },
    {
      step: '04',
      title: 'Connect Safely',
      description: 'Chat with confidence. Every conversation is protected with end-to-end encryption.',
      icon: MessageCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
      {/* Navigation */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full gradient-btn flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">TrueBond</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">How It Works</a>
            <a href="#safety" className="text-sm text-white/60 hover:text-white transition-colors">Safety</a>
            <a href="#premium" className="text-sm text-white/60 hover:text-white transition-colors">Premium</a>
          </div>
          <button
            onClick={() => navigate('/auth')}
            className="gradient-btn px-6 py-2 rounded-full text-sm font-semibold text-white"
          >
            Get Started
          </button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/hero-bg.jpg"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/40 to-[#050505]" />
        </div>

        {/* Floating Orbs */}
        <FloatingOrb delay={0} x={10} y={20} size={300} />
        <FloatingOrb delay={3} x={70} y={60} size={250} />
        <FloatingOrb delay={6} x={40} y={80} size={200} />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8"
          >
            <BadgeCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-white/80">India's Most Trusted Relationship Platform</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            Find Your{' '}
            <span className="gradient-text">Perfect Match</span>
            <br />
            <span className="text-white">With Trust</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            No fake profiles. No games. Just real people looking for genuine connections.
            Verified. Safe. Meaningful.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <button
              onClick={() => navigate('/auth')}
              className="gradient-btn px-10 py-4 rounded-full text-lg font-semibold text-white flex items-center gap-2"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="glass px-10 py-4 rounded-full text-lg font-semibold text-white hover:bg-white/10 transition-all"
            >
              Learn More
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {stats.map((stat, i) => (
              <div key={i} className="glass rounded-2xl p-4">
                <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-xs text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/40 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} custom={0} className="text-3xl md:text-5xl font-bold mb-4">
              Why Choose <span className="gradient-text">TrueBond</span>
            </motion.h2>
            <motion.p variants={fadeInUp} custom={1} className="text-white/50 max-w-xl mx-auto">
              We have built a platform that prioritizes your safety, privacy, and genuine connections.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Multi-Layer Verification', desc: 'Phone, email, face match, and government ID verification for every profile.' },
              { icon: Brain, title: 'AI-Powered Matching', desc: 'Our advanced AI understands compatibility beyond just looks and location.' },
              { icon: Lock, title: 'End-to-End Encryption', desc: 'Your conversations are completely private and encrypted from end to end.' },
              { icon: Siren, title: 'Emergency SOS', desc: 'One-tap emergency alert with live location sharing to trusted contacts.' },
              { icon: Sparkles, title: 'Relationship Passport', desc: 'A transparent history that builds trust between potential partners.' },
              { icon: Crown, title: 'Premium Experience', desc: 'Ad-free browsing, advanced filters, and priority support for premium members.' },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeInUp}
                  custom={i}
                  className="glass-strong rounded-2xl p-6 hover:bg-white/[0.08] transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl gradient-btn flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} custom={0} className="text-3xl md:text-5xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </motion.h2>
            <motion.p variants={fadeInUp} custom={1} className="text-white/50 max-w-xl mx-auto">
              Four simple steps to find your perfect match.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeInUp}
                  custom={i}
                  className="relative"
                >
                  <div className="glass rounded-2xl p-6 h-full">
                    <div className="text-5xl font-display text-white/10 mb-4">{step.step}</div>
                    <div className="w-10 h-10 rounded-lg gradient-btn flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{step.description}</p>
                  </div>
                  {i < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-white/20 to-transparent" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section id="safety" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} custom={0} className="text-3xl md:text-5xl font-bold mb-4">
              Your <span className="gradient-text">Safety</span> Is Our Priority
            </motion.h2>
            <motion.p variants={fadeInUp} custom={1} className="text-white/50 max-w-xl mx-auto">
              We have built industry-leading safety features to protect you at every step.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safetyFeatures.map((feature, i) => {
              const Icon = iconMap[feature.icon] || Shield;
              return (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeInUp}
                  custom={i}
                  className="glass rounded-2xl p-6 hover:bg-white/[0.05] transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Premium Plans */}
      <section id="premium" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} custom={0} className="text-3xl md:text-5xl font-bold mb-4">
              Choose Your <span className="gradient-text">Plan</span>
            </motion.h2>
            <motion.p variants={fadeInUp} custom={1} className="text-white/50 max-w-xl mx-auto">
              Unlock the full potential of TrueBond with our premium plans.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Free', price: '₹0', period: 'forever', features: ['10 Likes Daily', 'Basic Filters', '1 Boost Monthly'], highlight: false },
              { name: 'Silver', price: '₹99', period: '/month', features: ['30 Likes Daily', 'Advanced Filters', 'No Ads', '20 Chats Daily'], highlight: false },
              { name: 'Gold', price: '₹199', period: '/month', features: ['100 Likes Daily', 'See Who Liked You', '5 Boosts Monthly', 'AI Insights'], highlight: true },
              { name: 'Platinum', price: '₹999', period: '/month', features: ['Unlimited Everything', 'VIP Badge', 'Incognito Mode', 'Priority Support'], highlight: false },
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial="visible"
                variants={fadeInUp}
                custom={i}
                className={`relative rounded-2xl p-6 ${
                  plan.highlight
                    ? 'gradient-btn scale-105'
                    : 'glass'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-white/50">{plan.period}</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-white/70">
                      <BadgeCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/auth')}
                  className={`w-full mt-6 py-3 rounded-full text-sm font-semibold transition-all ${
                    plan.highlight
                      ? 'bg-white text-black hover:bg-white/90'
                      : 'gradient-btn text-white'
                  }`}
                >
                  Get Started
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            custom={0}
            className="glass-strong rounded-3xl p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 via-purple-500/20 to-blue-500/20" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Ready to Find Your{' '}
                <span className="gradient-text">Perfect Match?</span>
              </h2>
              <p className="text-white/50 max-w-lg mx-auto mb-8">
                Join millions of verified singles who trust TrueBond to find meaningful relationships.
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="gradient-btn px-12 py-4 rounded-full text-lg font-semibold text-white inline-flex items-center gap-2"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full gradient-btn flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-lg font-bold">TrueBond</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/40">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact Us</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
            <div className="text-sm text-white/30">
              &copy; 2026 TrueBond. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
