import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import { API_BASE_URL } from '../config';

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm]         = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleChange = (e) => {
    setError('');
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/tracker');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Google Auth failed');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setLoading(false);
      navigate('/tracker');
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign In was unsuccessful. Try again later.');
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50 font-sans">
      
      {/* Left Section: Minimalist Aesthetic Hero */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center bg-[#06080f] overflow-hidden select-none">
        {/* Soft Ambient Brand Auroras */}
        <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full bg-[#10b981]/12 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#2dd4bf]/12 blur-[160px]" />
        <div className="absolute top-[35%] left-[25%] w-[380px] h-[380px] rounded-full bg-[#00f5a0]/06 blur-[120px]" />

        {/* Brand Logo - Top Left */}
        <Link to="/" className="absolute top-10 left-10 z-20 hover:scale-105 transition-all">
          <img
            src="/logo.png"
            alt="DiscipliniOS Logo"
            className="h-24 md:h-28 w-auto object-contain drop-shadow-[0_0_35px_rgba(45,212,191,0.3)]"
          />
        </Link>

        {/* Center Minimalist Aesthetic Scene */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center text-white mt-12 max-w-md">

          {/* Minimal Floating Glassmorphic Streak Card */}
          <div className="w-full bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent border border-emerald-500/20 backdrop-blur-2xl rounded-3xl p-7 shadow-[0_20px_60px_-15px_rgba(0,245,160,0.12)]">
            
            {/* Minimalist 7-Day Consistency Flow */}
            <div className="flex items-center justify-between gap-2.5 pb-4 border-b border-white/[0.06]">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                const isCompleted = idx < 6;
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                        isCompleted
                          ? 'bg-[#2dd4bf]/20 border border-[#2dd4bf]/40 text-[#2dd4bf] shadow-[0_0_12px_rgba(45,212,191,0.25)]'
                          : 'bg-white/[0.04] border border-white/[0.08] text-slate-500'
                      }`}
                    >
                      {isCompleted ? '✓' : ''}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">{day}</span>
                  </div>
                );
              })}
            </div>

            {/* Subtle Progress Bar */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2dd4bf] animate-pulse" />
                  Weekly Discipline
                </span>
                <span className="text-[#2dd4bf] font-mono font-bold">92%</span>
              </div>
              <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden p-0.5 border border-white/[0.05]">
                <div className="h-full bg-gradient-to-r from-[#10b981] via-[#2dd4bf] to-[#00f5a0] rounded-full w-[92%] shadow-[0_0_12px_rgba(45,212,191,0.4)]" />
              </div>
            </div>
          </div>

          {/* Minimal Slogan */}
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white mt-8 mb-2">
            Master your <span className="bg-gradient-to-r from-white via-[#2dd4bf] to-[#00f5a0] bg-clip-text text-transparent">consistency.</span>
          </h2>
          <p className="text-slate-400 text-xs tracking-wider uppercase font-semibold">
            Track habits • Control expenses • Evolve daily
          </p>
        </div>
      </div>

      {/* Right Section: Authentication Card */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px]">
          
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="DiscipliniOS Logo" className="h-16 w-auto object-contain drop-shadow-md" />
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 sm:p-10">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Create account</h1>
            <p className="text-gray-500 text-sm mb-8">Start building your best self today</p>

            <div className="w-full flex justify-center mb-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                shape="pill"
                size="large"
                text="signup_with"
                width="100%"
              />
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">or register with email</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* Name */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FiUser />
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FiMail />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FiLock />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="Password (min 6 chars)"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FiLock />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="confirm"
                  placeholder="Confirm password"
                  value={form.confirm}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              {/* Error */}
              {error && <div className="text-xs text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 mt-2">{error}</div>}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-medium transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center group"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <>
                    Create Account
                    <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-slate-900 font-bold hover:text-orange-500 transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
