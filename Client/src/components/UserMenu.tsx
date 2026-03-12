import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="hidden md:flex items-center gap-3">
      {user && (
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-violet-500/30">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          <span className="hidden sm:block text-sm font-semibold text-gray-700">
            {user.name}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-red-50 hover:text-red-500 transition-all duration-150 cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
        </svg>
        <span className="hidden sm:block">Logout</span>
      </button>
    </div>
  );
};

export default UserMenu;
