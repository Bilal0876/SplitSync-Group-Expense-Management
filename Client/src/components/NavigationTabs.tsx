import { useLocation, useNavigate } from 'react-router-dom';

export type Tab = 'overview' | 'groups' | 'activity';

type NavigationTabsProps = {
  activeTab?: Tab;
  setActiveTab?: (tab: Tab) => void;
  isMobile?: boolean;
  onClose?: () => void;
};

const NavigationTabs = ({ activeTab: propActiveTab, setActiveTab, isMobile, onClose }: NavigationTabsProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const activeTab = propActiveTab || (queryParams.get('tab') as Tab) || (location.pathname === '/dashboard' ? 'overview' : null);

  const tabs: Tab[] = ['overview', 'groups', 'activity'];

  const handleTabClick = (tab: Tab) => {
    if (setActiveTab && location.pathname === '/dashboard') {
      setActiveTab(tab);
      navigate(`/dashboard?tab=${tab}`, { replace: true });
    } else {
      navigate(`/dashboard?tab=${tab}`);
    }
    if (onClose) onClose();
  };

  if (isMobile) {
    return (
      <nav className="flex flex-col w-full">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`w-full text-left px-6 py-4 text-sm font-bold capitalize transition-all duration-200 border-l-2 ${activeTab === tab
              ? 'bg-violet-50 border-violet-600 text-violet-600'
              : 'border-transparent text-gray-500 hover:bg-gray-50'
              }`}
          >
            {tab}
          </button>
        ))}
      </nav>
    );
  }

  return (
    <nav className="hidden md:flex items-center self-stretch">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => handleTabClick(tab)}
          className={`relative px-4 self-stretch flex items-center text-sm font-bold capitalize transition-all duration-200 cursor-pointer ${activeTab === tab
            ? 'text-violet-600'
            : 'text-gray-400 hover:text-gray-600'
            }`}
        >
          {tab}
          {activeTab === tab && (
            <div className="absolute bottom-[-14px] left-0 right-0 h-[3px] bg-violet-600 rounded-t-full shadow-[0_-2px_8px_rgba(124,58,237,0.3)] animate-[slideIn_0.2s_ease-out]" />
          )}
        </button>
      ))}
    </nav>
  );
};

export default NavigationTabs;