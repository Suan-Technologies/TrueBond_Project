import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Phone, Mail, ArrowLeft, ChevronRight, Shield, BadgeCheck,
  User, IndianRupee, Camera, Lock, Eye, EyeOff, Loader2
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import CityStateAutocomplete from '@/components/CityStateAutocomplete';
import { authApi, apiRequest, setTokens } from '@/services/api';
import { API_BASE_URL, USER_ENDPOINTS } from '@/config/api.config';

type Step = 'info' | 'details' | 'otp' | 'photo';
type Gender = 'male' | 'female' | 'other';

export default function AuthPage() {
  const navigate = useNavigate();
  const { setAuthenticated, setCurrentUser } = useStore();

  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [step, setStep] = useState<Step>('info');
  const [loginPhase, setLoginPhase] = useState<'form' | 'otp'>('form');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState<Gender | ''>('');
  const [address, setAddress] = useState('');
  const [income, setIncome] = useState('');
  const [phone, setPhone] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    if (!resendDisabled) return;
    if (resendCountdown <= 0) {
      setResendDisabled(false);
      return;
    }
    const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendDisabled, resendCountdown]);

  const switchMode = (m: 'register' | 'login') => {
    setMode(m);
    setStep('info');
    setLoginPhase('form');
    setErrors({});
    setOtp(['', '', '', '', '', '']);
    setResendDisabled(false);
    setResendCountdown(30);
    setName('');
    setEmail('');
    setTitle('');
    setPassword('');
    setShowPassword(false);
    setGender('');
    setAddress('');
    setIncome('');
    setPhone('');
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleBack = () => {
    if (mode === 'login') {
      if (loginPhase === 'otp') {
        setLoginPhase('form');
      } else {
        navigate('/');
      }
      return;
    }
    if (step === 'info') {
      navigate('/');
    } else {
      const stepOrder: Step[] = ['info', 'details', 'otp', 'photo'];
      const idx = stepOrder.indexOf(step);
      setStep(stepOrder[idx - 1]);
    }
  };

  const clearError = (key: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateInfo = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email';
    if (!title.trim()) e.title = 'Title is required';
    if (password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!gender) e.gender = 'Please select a gender';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateDetails = () => {
    const e: Record<string, string> = {};
    if (!address.trim()) e.address = 'Address is required';
    if (phone.length !== 10) e.phone = 'Phone must be 10 digits';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateLogin = () => {
    const e: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleInfoContinue = () => {
    if (validateInfo()) {
      setStep('details');
    }
  };

  const handleSendOtp = async () => {
    if (!validateDetails()) return;
    setLoading(true);
    try {
      const res = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        password,
        title: title.trim(),
        gender,
        address: address.trim(),
        phone: `+91${phone}`,
        income: income.trim() || undefined,
      });
      toast.success(res.message || 'OTP sent to your email!');
      setStep('otp');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const combined = otp.join('');
    if (combined.length !== 6) {
      setErrors({ otp: 'Please enter all 6 digits' });
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.verifyEmail({ email: email.trim(), otp: combined });
      setTokens(res.access_token, res.refresh_token);
      const user = await authApi.getMe();
      setCurrentUser(user);
      setAuthenticated(true);
      toast.success('Welcome to TrueBond!');
      if (mode === 'register') {
        setStep('photo');
      } else {
        navigate(user.bio ? '/app' : '/onboarding');
      }
    } catch (err: any) {
      toast.error(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendDisabled) return;
    setResendDisabled(true);
    setResendCountdown(30);
    try {
      await authApi.resendOtp({ email: email.trim(), purpose: 'verify_email' });
      toast.success('OTP resent to your email');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend OTP');
      setResendDisabled(false);
    }
  };

  const handleLoginSubmit = async () => {
    if (!validateLogin()) return;
    setLoading(true);
    try {
      const res = await authApi.login({ email: email.trim(), password });
      setTokens(res.access_token, res.refresh_token);
      const user = await authApi.getMe();
      setCurrentUser(user);
      setAuthenticated(true);
      toast.success('Welcome back!');
      navigate(user.bio ? '/app' : '/onboarding');
    } catch (err: any) {
      if (err.message === 'EMAIL_NOT_VERIFIED') {
        setLoginPhase('otp');
        toast.info('Please verify your email first');
      } else {
        toast.error(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoContinue = async () => {
    if (photoFile) {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('photo', photoFile);
        await apiRequest(`${API_BASE_URL}${USER_ENDPOINTS.uploadPhoto}`, {
          method: 'POST',
          body: formData,
        });
        toast.success('Photo uploaded');
      } catch (err: any) {
        toast.error(err.message || 'Photo upload failed');
      } finally {
        setLoading(false);
      }
    }
    navigate('/onboarding');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleForgotSubmit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      toast.error('Invalid email');
      return;
    }
    setForgotLoading(true);
    try {
      await authApi.forgotPassword({ email: forgotEmail.trim() });
      toast.success('Reset OTP sent to your email');
      setShowForgotModal(false);
      setForgotEmail('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset OTP');
    } finally {
      setForgotLoading(false);
    }
  };

  const stepOrder: Step[] = ['info', 'details', 'otp', 'photo'];
  const progress = mode === 'register' ? ((stepOrder.indexOf(step) + 1) / stepOrder.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-purple-500/10 to-blue-500/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-6 left-6 glass rounded-full p-3 hover:bg-white/10 transition-all z-10"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Progress Bar */}
      {mode === 'register' && (
        <div className="absolute top-6 left-0 right-0 px-6 z-10">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2 text-xs text-white/40">
              <span>Step {stepOrder.indexOf(step) + 1} of {stepOrder.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full gradient-btn rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md px-6 pt-16"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full gradient-btn flex items-center justify-center">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-2xl font-bold">TrueBond</span>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="glass rounded-full p-1 flex gap-1">
            <button
              onClick={() => switchMode('register')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${mode === 'register' ? 'gradient-btn text-white' : 'text-white/50 hover:text-white'}`}
            >
              Create Account
            </button>
            <button
              onClick={() => switchMode('login')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${mode === 'login' ? 'gradient-btn text-white' : 'text-white/50 hover:text-white'}`}
            >
              Sign In
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Registration Info Step */}
          {mode === 'register' && step === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h1 className="text-2xl font-bold mb-1 text-center">Create Account</h1>
              <p className="text-white/50 text-center mb-6">Let's get to know you</p>

              <div className="glass rounded-2xl p-6 space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); clearError('name'); }}
                      placeholder="John Doe"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-rose-400/50 focus:ring-1 focus:ring-rose-400/30 transition-all"
                    />
                  </div>
                  {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                      placeholder="your@email.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-rose-400/50 focus:ring-1 focus:ring-rose-400/30 transition-all"
                    />
                  </div>
                  {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Title / Profession *</label>
                  <div className="relative">
                    <BadgeCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => { setTitle(e.target.value); clearError('title'); }}
                      placeholder="Software Engineer, Doctor, Student..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-rose-400/50 focus:ring-1 focus:ring-rose-400/30 transition-all"
                    />
                  </div>
                  {errors.title && <p className="text-rose-400 text-xs mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Password * (min 6 chars)</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                      placeholder="Create a strong password"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-rose-400/50 focus:ring-1 focus:ring-rose-400/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-rose-400 text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Gender *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['male', 'female', 'other'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => { setGender(g); clearError('gender'); }}
                        className={`py-3 rounded-xl border text-sm font-medium capitalize transition-all ${gender === g ? 'border-rose-400/50 bg-rose-400/10 text-rose-300' : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  {errors.gender && <p className="text-rose-400 text-xs mt-1">{errors.gender}</p>}
                </div>

                <button
                  onClick={handleInfoContinue}
                  disabled={loading}
                  className="w-full gradient-btn py-3.5 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ChevronRight className="w-5 h-5" /></>}
                </button>
              </div>
            </motion.div>
          )}

          {/* Registration Details Step */}
          {mode === 'register' && step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h1 className="text-2xl font-bold mb-1 text-center">A Few More Details</h1>
              <p className="text-white/50 text-center mb-6">Help us create your profile</p>

              <div className="glass rounded-2xl p-6 space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Address *</label>
                  <CityStateAutocomplete
                    value={address}
                    onChange={(val) => { setAddress(val); clearError('address'); }}
                    placeholder="Search city..."
                  />
                  {errors.address && <p className="text-rose-400 text-xs mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Annual Income (Optional)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="text"
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                      placeholder="e.g., 5-10 LPA"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-rose-400/50 focus:ring-1 focus:ring-rose-400/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Phone Number *</label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-lg">🇮🇳</span>
                      <span className="text-white/70 text-sm">+91</span>
                    </div>
                    <div className="flex-1">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); clearError('phone'); }}
                        placeholder="99999 99999"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-rose-400/50 focus:ring-1 focus:ring-rose-400/30 transition-all"
                      />
                    </div>
                  </div>
                  {errors.phone && <p className="text-rose-400 text-xs mt-1">{errors.phone}</p>}
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full gradient-btn py-3.5 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send OTP <ChevronRight className="w-5 h-5" /></>}
                </button>
              </div>
            </motion.div>
          )}

          {/* OTP Step (shared) */}
          {((mode === 'register' && step === 'otp') || (mode === 'login' && loginPhase === 'otp')) && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-1 text-center">Verify OTP</h1>
              <p className="text-white/50 text-center mb-1">Code sent to {email}</p>
              <p className="text-white/30 text-center text-sm mb-6">(Check your email inbox)</p>

              <div className="glass rounded-2xl p-6 mb-4">
                <div className="flex justify-center gap-2.5 mb-6">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      className="w-11 h-12 bg-white/5 border border-white/10 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:border-rose-400/50 focus:ring-1 focus:ring-rose-400/30 transition-all"
                      maxLength={1}
                    />
                  ))}
                </div>
                {errors.otp && <p className="text-rose-400 text-xs text-center mb-3">{errors.otp}</p>}
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="w-full gradient-btn py-3.5 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify & Continue</>}
                </button>
              </div>

              <p className="text-center text-sm text-white/40">
                Didn't receive code?{' '}
                <button
                  onClick={handleResendOtp}
                  disabled={resendDisabled}
                  className="text-rose-400 hover:text-rose-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendDisabled ? `Resend in ${resendCountdown}s` : 'Resend'}
                </button>
              </p>
            </motion.div>
          )}

          {/* Photo Step */}
          {mode === 'register' && step === 'photo' && (
            <motion.div
              key="photo"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-1 text-center">Add Profile Photo</h1>
              <p className="text-white/50 text-center mb-6">Optional — you can skip this step</p>

              <div className="glass rounded-2xl p-6 mb-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-white/10 bg-white/5 flex items-center justify-center">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <img src="/images/avatar1.jpg" alt="Default" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-9 h-9 rounded-full gradient-btn flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                      <Camera className="w-4 h-4 text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                  </div>
                  <p className="text-sm text-white/40">
                    {photoPreview ? 'Photo selected' : 'Default avatar will be used'}
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handlePhotoContinue}
                    className="flex-1 glass py-3.5 rounded-xl font-semibold text-white/70 hover:bg-white/10 transition-all"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handlePhotoContinue}
                    disabled={!photoPreview}
                    className="flex-1 gradient-btn py-3.5 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Login Form */}
          {mode === 'login' && loginPhase === 'form' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h1 className="text-2xl font-bold mb-1 text-center">Welcome Back</h1>
              <p className="text-white/50 text-center mb-6">Sign in to your account</p>

              <div className="glass rounded-2xl p-6 space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                      placeholder="your@email.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-rose-400/50 focus:ring-1 focus:ring-rose-400/30 transition-all"
                    />
                  </div>
                  {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                      placeholder="Enter your password"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-rose-400/50 focus:ring-1 focus:ring-rose-400/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-rose-400 text-xs mt-1">{errors.password}</p>}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowForgotModal(true)}
                    className="text-sm text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  onClick={handleLoginSubmit}
                  disabled={loading}
                  className="w-full gradient-btn py-3.5 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ChevronRight className="w-5 h-5" /></>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust Badges */}
        <div className="mt-10 flex items-center justify-center gap-6 text-white/30">
          <div className="flex items-center gap-1.5 text-xs">
            <Shield className="w-3.5 h-3.5" />
            Secure
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <BadgeCheck className="w-3.5 h-3.5" />
            Verified
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Phone className="w-3.5 h-3.5" />
            Encrypted
          </div>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-sm mx-4"
            >
              <h2 className="text-xl font-bold mb-2">Reset Password</h2>
              <p className="text-white/50 text-sm mb-4">Enter your email to receive a reset OTP.</p>
              <div className="relative mb-4">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-rose-400/50 focus:ring-1 focus:ring-rose-400/30 transition-all"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 glass py-3 rounded-xl font-semibold text-white/70 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleForgotSubmit}
                  disabled={forgotLoading}
                  className="flex-1 gradient-btn py-3 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send OTP'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
