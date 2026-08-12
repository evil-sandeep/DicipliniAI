import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi';

const features = [
  'Track any habit, any day of the week',
  'Build custom lists for your own goals',
  'Simple, distraction-free interface',
  'Streaks & progress at a glance',
];

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page w-full h-full flex flex-col items-center justify-center relative overflow-hidden select-none">

      {/* ── Background decorative blobs ── */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* ── Top nav ── */}
      <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 md:px-10 py-4 z-10">
        <span className="brand-logo">Disciplini</span>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/login')}
            className="nav-btn-outline"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="nav-btn-solid"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">
        {/* Badge */}
        <div className="badge mb-6">
          <span className="badge-dot" />
          Your discipline, visualised
        </div>

        {/* Headline */}
        <h1 className="hero-title">
          Build habits.<br />
          <span className="hero-title-accent">Stay disciplined.</span>
        </h1>

        {/* Sub */}
        <p className="hero-sub mt-4 mb-8">
          Disciplini is the clean weekly tracker that keeps you accountable —
          no noise, no clutter, just your goals and your progress.
        </p>

        {/* Feature list */}
        <ul className="feature-list mb-10">
          {features.map(f => (
            <li key={f} className="feature-item">
              <FiCheckCircle className="feature-icon" />
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={() => navigate('/register')}
          className="cta-btn group"
        >
          Start for free
          <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="mt-4 text-sm text-white/40">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-purple-300 hover:text-white underline underline-offset-2 transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default HomePage;
