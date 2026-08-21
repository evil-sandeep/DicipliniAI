import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';

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

  const handleSubmit = (e) => {
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
    // Simulate async register — replace with real API call later
    setTimeout(() => {
      setLoading(false);
      navigate('/tracker');
    }, 1000);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/auth/google', {
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
      
      {/* Left Section: Visual/Illustration (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center bg-slate-900 overflow-hidden">
        {/* Subtle decorative background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-500/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-yellow-500/20 blur-[120px]" />
        
        {/* Logo positioned at the absolute top-left of the entire left section */}
        <Link to="/" className="absolute top-10 left-10 z-20 hover:opacity-80 transition-opacity flex items-center">
          <img src="/logo.png" alt="DiscipliniOS Logo" className="h-16 object-contain" />
        </Link>
        
        {/* Illustration content container */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center text-white mt-8">
          
          <div className="w-[80%] max-w-md aspect-square mb-8 relative">
             {/* Abstract modern illustration replacement */}
             <div className="absolute inset-0 bg-gradient-to-tr from-slate-800 to-slate-700 rounded-3xl border border-slate-600/50 shadow-2xl flex flex-col justify-end p-8 overflow-hidden">
                {/* Decorative mock UI elements for the illustration */}
                <div className="w-full flex justify-between items-end gap-4 h-48">
                  <div className="w-1/4 bg-orange-500/80 rounded-t-lg h-[40%] animate-[pulse_4s_ease-in-out_infinite]" />
                  <div className="w-1/4 bg-yellow-400/80 rounded-t-lg h-[70%] animate-[pulse_4s_ease-in-out_infinite_1s]" />
                  <div className="w-1/4 bg-white/20 rounded-t-lg h-[50%] animate-[pulse_4s_ease-in-out_infinite_2s]" />
                  <div className="w-1/4 bg-orange-400 rounded-t-lg h-[90%] animate-[pulse_4s_ease-in-out_infinite_3s]" />
                </div>
                <div className="absolute top-8 left-8 right-8 bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                  <div className="w-3/4 h-3 bg-white/20 rounded-full mb-3" />
                  <div className="w-1/2 h-3 bg-white/10 rounded-full" />
                </div>
             </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Visualize your discipline.</h2>
          <p className="text-slate-300 max-w-md text-lg">Track your habits consistently and watch your progress grow day by day.</p>
        </div>
      </div>

      {/* Right Section: Authentication Card */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px]">
          
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden mb-10 flex justify-center">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="DiscipliniOS Logo" className="h-14 object-contain" />
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
