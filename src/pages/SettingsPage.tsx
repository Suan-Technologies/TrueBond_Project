import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  ArrowLeft, User, Shield, Bell, Lock, Eye, Moon,
  HelpCircle, FileText, LogOut, ChevronRight,
  Phone, Mail, ScanFace, BadgeCheck, Camera
} from 'lucide-react';
import { useStore } from '@/store/useStore';

import { useTheme } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { currentUser, setAuthenticated } = useStore();
  const { theme } = useTheme();

  const handleLogout = () => {
    setAuthenticated(false);
    navigate('/');
  };

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile', value: 'Name, photos, bio', action: () => {} },
        { icon: Camera, label: 'Photos', value: `${currentUser?.photos?.length || 0} photos`, action: () => {} },
        { icon: BadgeCheck, label: 'Verification', value: `${currentUser?.trust_score || 0}% complete`, action: () => {} },
      ],
    },
    {
      title: 'Verification Center',
      items: [
        { icon: Phone, label: 'Phone Number', value: 'Verified', verified: true, action: () => {} },
        { icon: Mail, label: 'Email', value: 'Verified', verified: true, action: () => {} },
        { icon: ScanFace, label: 'Face Verification', value: 'Not verified', verified: false, action: () => {} },
        { icon: Shield, label: 'Government ID', value: 'Not verified', verified: false, action: () => {} },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', value: '', action: () => {} },
        { icon: Eye, label: 'Privacy', value: '', action: () => {} },
        { icon: Lock, label: 'Security', value: '', action: () => {} },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', value: '', action: () => {} },
        { icon: FileText, label: 'Terms of Service', value: '', action: () => {} },
        { icon: Shield, label: 'Privacy Policy', value: '', action: () => {} },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-accent rounded-full transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">Settings</h1>
      </div>

      <div className="px-4 py-4 space-y-6 pb-32">
        {/* Profile Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-4 flex items-center gap-4"
        >
          <img
            src={currentUser?.photos?.[0] || '/images/avatar1.jpg'}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold">{currentUser?.name || 'User'}</h3>
            <p className="text-sm text-muted-foreground">{currentUser?.location || 'Complete your profile'}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </motion.div>

        {sections.map((section, si) => (
          <motion.div
            key={si}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.05 }}
          >
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">{section.title}</h3>
            <div className="glass rounded-2xl overflow-hidden divide-y divide-border">
              {section.items.map((item, ii) => {
                const Icon = item.icon;
                return (
                  <button
                    key={ii}
                    onClick={item.action}
                    className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-accent/50 transition-all text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                      <Icon className="w-4.5 h-4.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm">{item.label}</div>
                      {item.value && (
                        <div className={`text-xs ${(item as Record<string, unknown>).verified ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                          {item.value}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                );
              })}
              
              {/* Theme Toggle in Preferences section */}
              {section.title === 'Preferences' && (
                <div className="w-full flex items-center gap-4 px-4 py-3.5">
                  <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                    <Moon className="w-4.5 h-4.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">Theme</div>
                    <div className="text-xs text-muted-foreground capitalize">{theme} mode</div>
                  </div>
                  <ThemeToggle />
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleLogout}
          className="w-full glass rounded-2xl p-4 flex items-center gap-4 text-red-500 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </motion.button>
      </div>
    </div>
  );
}
