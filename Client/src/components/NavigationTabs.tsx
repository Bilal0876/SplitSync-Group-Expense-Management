type Tab = 'overview' | 'groups' | 'activity';

type NavigationTabsProps = {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
};

const NavigationTabs = ({ activeTab, setActiveTab }: NavigationTabsProps) => {
  const tabs: Tab[] = ['overview', 'groups', 'activity'];

  return (
    <nav className="hidden md:flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all duration-200 cursor-pointer
          ${
            activeTab === tab
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/30'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
};
export default NavigationTabs;