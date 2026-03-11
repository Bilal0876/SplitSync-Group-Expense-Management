import { useState } from 'react';
import { Link } from "react-router-dom";
import NavigationTabs from "../components/NavigationTabs.tsx";
import UserMenu from "../components/UserMenu.tsx";
import Logo from "../components/Logo.tsx";

type Tab = 'overview' | 'groups' | 'activity';

type HeaderProps = {
  activeTab?: Tab;
  setActiveTab?: (tab: Tab) => void;
};

const Header = ({ activeTab, setActiveTab }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">

        <div className="flex-1 flex items-center">
          <Link to="/dashboard" className="transition-opacity hover:opacity-80">
            <Logo />
          </Link>
        </div>

        {/* Navigation (Desktop only) */}
        <div className="hidden md:flex flex-1 justify-center">
          <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* User Menu & Mobile Toggle */}
        <div className="flex-1 flex items-center justify-end gap-4">
          <UserMenu />

          {/* Mobile Menu Button */}
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

      {/* Mobile Overlay — rendered outside header so it covers the ENTIRE page */}
      {isMenuOpen && (
        <>
          {/* Full-page backdrop blur */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            style={{ animation: 'fadeIn 0.25s ease-out' }}
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Slide-in drawer */}
          <div
            className="fixed top-0 right-0 bottom-0 w-72 bg-white/95 backdrop-blur-xl shadow-2xl z-50 md:hidden flex flex-col border-gray-100 rounded-l-3xl"
            style={{ animation: 'slideInRight 0.3s cubic-bezier(0.16,1,0.3,1)' }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gray-400 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-gray-800">Menu</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Tabs */}
            <div className="flex-1 px-3">
              <NavigationTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isMobile={true}
                onClose={() => setIsMenuOpen(false)}
              />
            </div>

          </div>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
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