import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.tsx';
import CreateGroupModal from '../components/CreateGroupModal.tsx';
import { getGroups, type Group } from '../services/groupServices';

const Icon = ({ path, className = 'size-5' }: { path: string; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const ICONS = {
  groups: 'M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z',
  empty: 'M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z',
  search: 'm21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z',
};

const GROUP_COLORS = [
  'from-violet-500 to-purple-600',
  'from-indigo-500 to-blue-600',
  'from-purple-500 to-fuchsia-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
];

const GroupsPage = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await getGroups();
        setGroups(data);
      } catch (err) {
        console.error('Failed to load groups:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/60 flex flex-col font-sans">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
          style={{ animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Groups</h1>
            <p className="text-sm text-gray-400 mt-1">Manage and track all your shared expenses.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-2 py-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold shadow-lg shadow-violet-500/25 hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <span>+ New Group</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-8" style={{ animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}>
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400">
            <Icon path={ICONS.search} className="size-5" />
          </div>
          <input
            type="text"
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-[2rem] shadow-sm focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all outline-none text-gray-700 font-medium"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-gray-100 rounded-[2.5rem] animate-pulse" />
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-16 text-center shadow-sm">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-300">
              <Icon path={ICONS.empty} className="size-10" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">{search ? 'No groups found' : 'No groups yet'}</h3>
            <p className="text-gray-400 max-w-xs mx-auto">
              {search ? `We couldn't find any groups matching "${search}"` : "Create your first group to start splitting bills with friends."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((g, i) => (
              <div
                key={g.id}
                onClick={() => navigate(`/groups/${g.id}`)}
                className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                style={{ animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${0.15 + i * 0.05}s both` }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${GROUP_COLORS[i % GROUP_COLORS.length]} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <Icon path={ICONS.groups} className="size-7 text-white" />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-1 group-hover:text-violet-600 transition-colors">{g.name}</h3>
                <div className="flex items-center justify-between mt-auto">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {g.member_count ?? 0} {(g.member_count ?? 0) === 1 ? 'member' : 'members'}
                  </p>
                  <span className="text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold text-sm">View Details →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <CreateGroupModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(newGroup) => setGroups(prev => [newGroup, ...prev])}
      />
    </div>
  );
};

export default GroupsPage;
