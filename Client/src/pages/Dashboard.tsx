import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.tsx';
import CreateGroupModal from '../components/CreateGroupModal.tsx';
import { getGroups, type Group } from '../services/groupServices';
import { getDashboardData, type DashboardData } from '../services/userServices';


const Icon = ({ path, className = 'size-5' }: { path: string; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const ICONS = {
  groups: 'M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z',
  balance: 'M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z',
  add: 'M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  settle: 'M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
  activity: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z',
  check: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  close: 'M6 18 18 6M6 6l12 12',
  empty: 'M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z',
};

const GROUP_COLORS = [
  'from-violet-500 to-purple-600',
  'from-indigo-500 to-blue-600',
  'from-purple-500 to-fuchsia-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
];

// ── stat card functon
const StatCard = ({ label, value, sub, icon, delay = '0ms' }: {
  label: string; value: string; sub: string; icon: string; delay?: string;
}) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
    style={{ animation: `fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) ${delay} both` }}>
    <div className="flex items-start justify-between mb-4">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
      <span className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500">
        <Icon path={icon} className="size-4" />
      </span>
    </div>
    <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{value}</p>
    <p className="text-xs text-gray-400 mt-1">{sub}</p>
  </div>
);


//main dashboard 
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  //Groups states
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  //Dashboard states
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      setGroupsLoading(true);
      setGroupsError('');
      try {
        const data = await getGroups();
        setGroups(data);
      } catch (err: unknown) {
        const error = err as any;
        setGroupsError(error?.response?.data?.error || 'Failed to load groups.');
      } finally {
        setGroupsLoading(false);
      }
    };

    const fetchDashboard = async () => {
      setStatsLoading(true);
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (err: any) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchGroups();
    fetchDashboard();
  }, []);

  const handleGroupCreated = (newGroup: Group) => {
    setGroups((prev) => [newGroup, ...prev]);
  };

  const netBalance = dashboardData?.netBalance ?? 0;
  const groupsCount = dashboardData?.groupsCount ?? groups.length;

  return (
    <div className="min-h-screen bg-gray-50/60 flex flex-col font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* Header component */}
      <Header />

      {/* ── Main ── */}
      <main className="flex-1 w-full max-w-4xl xl:max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* Welcome */}
        <div style={{ animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s both' }}>
          <h2 className="text-2xl font-extrabold text-gray-900">
            Good day, <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">{user?.name?.split(' ')[0] ?? 'there'}</span>
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">Here's your expense snapshot for today.</p>
        </div>

        {/*Stats*/}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Net Balance" value={`${netBalance >= 0 ? '+' : '-'}$${Math.abs(netBalance).toFixed(2)}`}
            sub={netBalance >= 0 ? 'Others owe you' : 'You owe others'} icon={ICONS.balance} delay="0.08s" />
          <StatCard label="Active Groups" value={String(groupsCount)}
            sub={`Total groups joined`} icon={ICONS.groups} delay="0.12s" />
          <StatCard label="This Month" value="$0.00" sub="Not available" icon={ICONS.activity} delay="0.16s" />
          <StatCard label="Settled" value="0" sub="Summarized" icon={ICONS.check} delay="0.20s" />
        </div>

        {/*Balance and Groups */}
        <div className="grid lg:grid-cols-5 gap-6">

          {/* Balances */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
            style={{ animation: 'fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.22s both' }}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="font-bold text-gray-800 text-sm">Balances</h3>
              <button 
                onClick={() => navigate('/activity')}
                className="text-xs text-violet-500 font-semibold hover:text-violet-400 transition-colors cursor-pointer"
              >
                Settle Up →
              </button>
            </div>
            <ul className="divide-y divide-gray-50">
              {statsLoading ? (
                <div className="py-8 flex justify-center"><div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : dashboardData?.summarizedBalances.length === 0 ? (
                <p className="px-5 py-6 text-xs text-gray-400 text-center font-medium">No outstanding balances!</p>
              ) : (
                dashboardData?.summarizedBalances.map((b, i) => (
                  <li key={b.userId} className="flex items-center justify-between px-5 py-3.5"
                    style={{ animation: `slideIn 0.4s cubic-bezier(0.16,1,0.3,1) ${0.25 + i * 0.06}s both` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-600 text-xs font-bold uppercase">
                        {b.username.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{b.username}</span>
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-bold ${b.dir === 'owed_to_me' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      ${b.amount.toFixed(2)}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Groups */}
          <div className="lg:col-span-3 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
            style={{ animation: 'fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.26s both' }}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="font-bold text-gray-800 text-sm">Your Groups</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/groups')}
                  className="text-xs text-violet-500 font-semibold hover:text-violet-400 transition-colors cursor-pointer"
                >
                  View all
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow shadow-violet-500/30 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  + New
                </button>
              </div>
            </div>

            {/* Loading state */}
            {groupsLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Error state */}
            {!groupsLoading && groupsError && (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-rose-500 font-medium">{groupsError}</p>
              </div>
            )}

            {/* Empty state */}
            {!groupsLoading && !groupsError && groups.length === 0 && (
              <div className="px-5 py-12 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
                  <Icon path={ICONS.empty} className="size-6" />
                </div>
                <p className="text-sm font-semibold text-gray-500">No groups yet</p>
                <p className="text-xs text-gray-400 mt-0.5">Create one to start splitting expenses.</p>
              </div>
            )}

            {/* Group list */}
            {!groupsLoading && !groupsError && groups.length > 0 && (
              <ul className="divide-y divide-gray-50">
                {groups.slice(0, 5).map((g, i) => (
                  <li key={g.id}
                    onClick={() => navigate(`/groups/${g.id}`)}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors group cursor-pointer"
                    style={{ animation: `slideIn 0.4s cubic-bezier(0.16,1,0.3,1) ${0.28 + i * 0.06}s both` }}>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${GROUP_COLORS[i % GROUP_COLORS.length]} flex items-center justify-center shadow-md flex-shrink-0`}>
                      <Icon path={ICONS.groups} className="size-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{g.name}</p>
                      <p className="text-xs text-gray-400">
                        {g.member_count ?? 0} {(g.member_count ?? 0) === 1 ? 'member' : 'members'}
                      </p>
                    </div>
                    <div className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-violet-200 text-violet-600 group-hover:bg-violet-50 group-hover:border-violet-300 transition-all cursor-pointer flex-shrink-0">
                      View
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Activities section */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
          style={{ animation: 'fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.34s both' }}>

          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h3 className="font-bold text-gray-800 text-sm">Recent Activity</h3>
            <button 
              onClick={() => navigate('/activity')}
              className="text-xs text-violet-500 font-semibold hover:text-violet-400 transition-colors cursor-pointer"
            >
              View all →
            </button>
          </div>

          {/*activities list*/}
          <ul className="divide-y divide-gray-50">
            {statsLoading ? (
              <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : dashboardData?.recentActivity.length === 0 ? (
              <p className="py-12 text-sm text-gray-400 text-center font-medium">No recent activity found.</p>
            ) : (
              dashboardData?.recentActivity.slice(0, 5).map((a, i) => (
                <li key={`${a.type}-${i}`} className="flex items-center gap-4 px-5 py-3.5 cursor-default hover:bg-gray-50/40 transition-colors"
                  style={{ animation: `slideIn 0.4s cubic-bezier(0.16,1,0.3,1) ${0.36 + i * 0.05}s both` }}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${a.paid_by_id === user?.id ? 'bg-violet-50 text-violet-500' : 'bg-gray-50 text-gray-400'}`}>
                    <Icon path={a.type === 'expense' ? ICONS.add : ICONS.settle} className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{a.title}</p>
                    <p className="text-xs text-gray-400">
                      {a.paid_by_id === user?.id ? 'You' : a.paid_by_username} {a.type === 'expense' ? 'paid' : 'settled'} · {a.group_name}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${a.type === 'settlement' ? 'text-emerald-500' : 'text-gray-700'}`}>${a.amount.toFixed(2)}</p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>

        </div>
      </main>

      {/* Create Group modal */}
      <CreateGroupModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleGroupCreated}
      />
    </div>
  );
};
export default Dashboard;