import NavigationTabs from "../components/NavigationTabs.tsx";
import UserMenu from "../components/UserMenu.tsx";
import Logo from "../components/Logo.tsx";

type Tab = 'overview' | 'groups' | 'activity';

type HeaderProps = {
  activeTab?: Tab;
  setActiveTab?: (tab: Tab) => void;
};

const Header = ({ activeTab, setActiveTab }: HeaderProps) => {
  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">

      <Logo />
      {activeTab && setActiveTab && (
        <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
      <UserMenu />

    </header>
  );
};

export default Header;
