import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AuthPage = () => {
  //useState hook to manage the states
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  //useAuth hook to get the authentication state
  const { login, register, token } = useAuth();
  const navigate = useNavigate();

  // If authenticated, navigate to dashboard
  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, navigate]);

  if (token) return null;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ name, email, password });
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      // Extract the server error message if available
      const axiosError = err as { response?: { data?: { message?: string } } };
      const serverMsg = axiosError?.response?.data?.message;
      setError(serverMsg || (err instanceof Error ? err.message : 'Something went wrong.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white overflow-x-hidden">
      {/*Auth Form */}
      <div className='flex-1  flex items-center justify-center p-6 xl:max-w-[43%] lg:max-w-[41%] lg:p-8 bg-gray-50/30 bg-white lg:justify-end md:py-30 sm:p-20 py-30 xl:pl-80'>
        <div className="w-full h-fit max-w-md bg-white border border-gray-100 rounded-[2rem] p-8 lg:p-5 shadow-2xl"
          style={{ animation: 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both' }}>

          {/* Brand */}
          <div className="flex flex-col items-center gap-2 mb-7">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" className="size-5 text-white" />
              </svg>
            </span>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight text-center">
              Split-Sync
            </h1>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-7">
            {(['login', 'signup'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => { setMode(tab); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer
                  ${mode === tab
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/40'
                    : 'text-gray-400 hover:text-gray-600'}`}
              >
                {tab === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'signup' && (
              <div className="flex flex-col gap-1">
                <label htmlFor="name" className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-300 text-sm outline-none focus:border-violet-500 focus:bg-violet-50 transition-all"
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                Email
              </label>
              <input id="email" type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-300 text-sm outline-none focus:border-violet-500 focus:bg-violet-50 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                Password
              </label>
              <input id="password" type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-300 text-sm outline-none focus:border-violet-500 focus:bg-violet-50 transition-all"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/25 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl text-white font-bold text-base shadow-lg shadow-violet-500/40 transition-all duration-150 flex items-center justify-center min-h-[48px] cursor-pointer"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                mode === 'login' ? 'Login' : 'Create Account'
              )}
            </button>
          </form>

          {/* Switch mode */}
          <p className="mt-5 text-center text-sm text-gray-400">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              className="text-violet-400 font-semibold hover:text-violet-300 hover:underline transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              {mode === 'login' ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
      <div className='flex-1 flex flex-col justify-center items-center lg:items-start px-6 py-12 lg:px-6 md:px-10'>
        <h1 className="text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-center lg:text-left bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent leading-tight">
          Track Shared Expenses.  <br /> Settle Smarter.  <br />Simplify Spending.
        </h1>

        <p className="text-base md:text-md lg:text-lg xl:text-lg text-gray-500 text-center lg:text-left mt-4">
          Manage group expenses, split costs instantly, and keep everyone balanced.
        </p>
      </div>


      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
