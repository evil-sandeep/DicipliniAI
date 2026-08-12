import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';

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
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Start building your best self today</p>

        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
          {/* Name */}
          <div className="input-group">
            <FiUser className="input-icon" />
            <input
              type="text"
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              className="auth-input"
            />
          </div>

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
              placeholder="Password (min 6 chars)"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
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

          {/* Confirm Password */}
          <div className="input-group">
            <FiLock className="input-icon" />
            <input
              type={showPass ? 'text' : 'password'}
              name="confirm"
              placeholder="Confirm password"
              value={form.confirm}
              onChange={handleChange}
              autoComplete="new-password"
              className="auth-input"
            />
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
                Create Account
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
