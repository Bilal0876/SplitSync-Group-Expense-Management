import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import NavigationTabs from "../components/NavigationTabs.tsx";
import UserMenu from "../components/UserMenu.tsx";
import Logo from "../components/Logo.tsx";
import { useAuth } from '../hooks/useAuth';

type HeaderProps = {
  // Navigation is now handled internally by NavigationTabs via URL
};

const Header = ({ }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">

        <div className="flex-1 flex items-center">
          <Link to="/dashboard" className="transition-opacity hover:opacity-80">
            <Logo />
          </Link>
        </div>


        <div className="hidden md:flex flex-1 justify-center">
          <NavigationTabs />
        </div>


        <div className="flex-1 flex items-center justify-end gap-4">
          <UserMenu />


          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"} />
            </svg>
          </button>
        </div>
      </header>


      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            style={{ animation: 'fadeIn 0.25s ease-out' }}
            onClick={() => setIsMenuOpen(false)}
          />

          <div
            className="fixed top-2 right-5 bottom-0 w-64 h-73 bg-white/95 backdrop-blur-xl shadow-2xl z-50 md:hidden flex flex-col border-gray-100 rounded-2xl"
            style={{ animation: 'slideInTop 0.3s cubic-bezier(0.16,1,0.3,1)' }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-violet-500/30">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">{user.name}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{user.email}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-400 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-gray-800">Menu</span>
                </div>
              )}
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 px-3 flex flex-col pt-2 pb-4">
              <NavigationTabs
                isMobile={true}
                onClose={() => setIsMenuOpen(false)}
              />

              {user && (
                <div className=" border-t border-gray-100 flex flex-col gap-2">

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-all cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>

          </div>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideInTop {
              from { transform: translateY(-20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </>
      )}
    </>
  );
};

export default Header;