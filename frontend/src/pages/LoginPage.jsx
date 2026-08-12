import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm]           = useState({ email: '', password: '' });
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleChange = (e) => {
    setError('');
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    // Simulate async login — replace with real API call later
    setTimeout(() => {
      setLoading(false);
      navigate('/tracker');
    }, 900);
  };

  return (
    <div className="home-page w-full h-full flex flex-col items-center justify-center relative overflow-hidden">

      {/* Blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Back to home */}
      <div className="absolute top-5 left-6 z-10">
        <Link to="/" className="brand-logo text-lg">Disciplini</Link>
      </div>

      {/* Card */}
      <div className="auth-card relative z-10 animate-[fadeIn_0.2s_ease]">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to continue your streak</p>

        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
          {/* Email */}
          <div className="input-group">
            <FiMail className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              className="auth-input"
            />
          </div>

          {/* Password */}
          <div className="input-group">
            <FiLock className="input-icon" />
            <input
              type={showPass ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              className="auth-input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
              tabIndex={-1}
            >
              {showPass ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
            </button>
          </div>

          {/* Error */}
          {error && <p className="auth-error">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="auth-submit group mt-1"
          >
            {loading ? (
              <span className="loader" />
            ) : (
              <>
                Sign In
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="auth-footer-text">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
