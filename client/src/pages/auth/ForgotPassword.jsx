import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ShieldCheck, Lock, ArrowRight, ArrowLeft, Check, X } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Security Question, 3: New Password
  
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordValidations = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const handleFetchQuestion = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSecurityQuestion(res.data.securityQuestion);
      setStep(2);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch account');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAnswer = async (e) => {
    e.preventDefault();
    if (securityAnswer.trim().length < 2) return toast.error('Please enter a valid answer');
    
    setLoading(true);
    try {
      await api.post('/auth/verify-security-answer', { email, securityAnswer });
      setStep(3);
    } catch (err) {
      toast.error(err.message || 'Incorrect security answer');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!passwordValidations.length || !passwordValidations.uppercase || !passwordValidations.lowercase || !passwordValidations.number || !passwordValidations.special) {
      return toast.error('Please meet all password requirements');
    }
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, securityAnswer, password });
      toast.success('Password reset successfully! Logging you in...');
      navigate('/home');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-accent-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="glass rounded-2xl p-8">
          {step === 1 && (
            <div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-glow mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold font-[var(--font-display)] gradient-text">Forgot Password</h1>
                <p className="text-surface-400 mt-2 text-sm">Enter your registered email to continue</p>
              </div>
              <form onSubmit={handleFetchQuestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Email Address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-800/50 border border-surface-700/50 rounded-xl text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
                    placeholder="you@college.edu" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 disabled:opacity-50 transition-all shadow-glow">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Continue'}
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-500/20 shadow-glow mb-4">
                  <ShieldCheck className="w-8 h-8 text-accent-400" />
                </div>
                <h1 className="text-2xl font-bold font-[var(--font-display)] gradient-text">Security Question</h1>
                <p className="text-surface-400 mt-2 text-sm text-balance">Answer the security question you set during registration</p>
              </div>
              <form onSubmit={handleVerifyAnswer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Question</label>
                  <div className="w-full px-4 py-3 bg-surface-900/50 border border-surface-700/50 rounded-xl text-surface-100 font-medium">
                    {securityQuestion}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Your Answer</label>
                  <input type="text" required value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-800/50 border border-surface-700/50 rounded-xl text-surface-100 focus:outline-none focus:ring-2 focus:ring-accent-500/30 transition-all"
                    placeholder="Answer..." />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-accent-500 hover:bg-accent-600 disabled:opacity-50 transition-all shadow-glow mt-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
                </button>
                <button type="button" onClick={() => setStep(1)}
                  className="w-full text-center text-sm text-surface-400 hover:text-white transition-colors">
                  Wrong email? Go back
                </button>
              </form>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-success-500/20 shadow-glow mb-4">
                  <Lock className="w-8 h-8 text-success-400" />
                </div>
                <h1 className="text-2xl font-bold font-[var(--font-display)] gradient-text">New Password</h1>
                <p className="text-surface-400 mt-2 text-sm">Create a strong new password</p>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">New Password</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-800/50 border border-surface-700/50 rounded-xl text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-success-500/30 transition-all"
                    placeholder="••••••••" />
                  
                  {password.length > 0 && (
                    <div className="mt-3 space-y-1.5 text-xs bg-surface-800/30 p-3 rounded-xl border border-surface-700/30">
                      <div className={`flex items-center gap-2 transition-colors ${passwordValidations.length ? 'text-success-400' : 'text-surface-500'}`}>
                        {passwordValidations.length ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} At least 6 characters
                      </div>
                      <div className={`flex items-center gap-2 transition-colors ${passwordValidations.uppercase ? 'text-success-400' : 'text-surface-500'}`}>
                        {passwordValidations.uppercase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} One uppercase letter
                      </div>
                      <div className={`flex items-center gap-2 transition-colors ${passwordValidations.lowercase ? 'text-success-400' : 'text-surface-500'}`}>
                        {passwordValidations.lowercase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} One lowercase letter
                      </div>
                      <div className={`flex items-center gap-2 transition-colors ${passwordValidations.number ? 'text-success-400' : 'text-surface-500'}`}>
                        {passwordValidations.number ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} One number
                      </div>
                      <div className={`flex items-center gap-2 transition-colors ${passwordValidations.special ? 'text-success-400' : 'text-surface-500'}`}>
                        {passwordValidations.special ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} One special character
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Confirm New Password</label>
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-800/50 border border-surface-700/50 rounded-xl text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-success-500/30 transition-all"
                    placeholder="••••••••" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-success-500 hover:bg-success-600 disabled:opacity-50 transition-all shadow-glow">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
                </button>
                <button type="button" onClick={() => setStep(2)}
                  className="w-full text-center text-sm text-surface-400 hover:text-white transition-colors mt-2">
                  Back
                </button>
              </form>
            </div>
          )}

          {step === 1 && (
            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
