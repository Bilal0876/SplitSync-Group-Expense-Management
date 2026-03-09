import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header.tsx';

// ── Types ────────────────────────────────────────────────────────────────────
interface Member {
     id: number;
     username: string;
     email: string;
}

interface Group {
     id: number;
     name: string;
     created_at: string;
     members: Member[];
}

// ── Icon helper ───────────────────────────────────────────────────────────────
const Icon = ({ path, className = 'size-5' }: { path: string; className?: string }) => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          strokeWidth={1.5} stroke="currentColor" className={className}>
          <path strokeLinecap="round" strokeLinejoin="round" d={path} />
     </svg>
);

const ICONS = {
     logo: 'M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
     back: 'M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18',
     members: 'M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z',
     add_member: 'M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z',
     add_expense: 'M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
     balance: 'M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z',
     receipt: 'M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185ZM9.75 9h.008v.008H9.75V9Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 4.5h.008v.008h-.008V13.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z',
     settle: 'M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
     calendar: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5',
     trash: 'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0',
     check: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
};

// ── Avatar with initials ──────────────────────────────────────────────────────
const AVATAR_GRADIENTS = [
     'from-violet-500 to-purple-600',
     'from-indigo-500 to-blue-600',
     'from-purple-500 to-fuchsia-600',
     'from-blue-500 to-cyan-500',
     'from-rose-500 to-pink-600',
     'from-amber-500 to-orange-500',
     'from-emerald-500 to-teal-600',
];

const getGradient = (name: string) =>
     AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length];

const Avatar = ({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) => {
     const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' };
     const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
     return (
          <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${getGradient(name)} flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md`}>
               {initials}
          </div>
     );
};

// ── Skeleton loader ───────────────────────────────────────────────────────────
const Skeleton = ({ className }: { className: string }) => (
     <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
);

// ── Main Component ────────────────────────────────────────────────────────────
const GroupDetail = () => {
     const { id } = useParams<{ id: string }>();
     const navigate = useNavigate();

     const [group, setGroup] = useState<Group | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState('');

     // Add member state
     const [memberEmail, setMemberEmail] = useState('');
     const [addingMember, setAddingMember] = useState(false);
     const [addMemberError, setAddMemberError] = useState('');
     const [addMemberSuccess, setAddMemberSuccess] = useState(false);

     // ── Fetch group on mount ──
     useEffect(() => {
          if (!id) return;
          setLoading(true);
          setError('');

          api.get(`/groups/${id}`)
               .then(res => setGroup(res.data))
               .catch(err => {
                    const msg = err?.response?.data?.error ?? 'Failed to load group.';
                    setError(msg);
               })
               .finally(() => setLoading(false));
     }, [id]);

     // ── Add member handler ──
     const handleAddMember = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!memberEmail.trim()) return;
          setAddingMember(true);
          setAddMemberError('');
          setAddMemberSuccess(false);

          try {
               const res = await api.post(`/groups/${id}/members`, { email: memberEmail.trim() });
               // Update member list with the returned member
               const newMember: Member = res.data.member;
               setGroup(prev => prev ? {
                    ...prev,
                    members: [...prev.members, newMember]
               } : prev);
               setMemberEmail('');
               setAddMemberSuccess(true);
               setTimeout(() => setAddMemberSuccess(false), 2500);
          } catch (err: any) {
               setAddMemberError(err?.response?.data?.error ?? 'Could not add member.');
          } finally {
               setAddingMember(false);
          }
     };

     // ── Remove member handler ──
     const handleRemoveMember = async (memberId: number) => {
          try {
               await api.delete(`/groups/${id}/members`, { data: { userId: memberId } });
               setGroup(prev => prev ? {
                    ...prev,
                    members: prev.members.filter(m => m.id !== memberId)
               } : prev);
          } catch (err: any) {
               alert(err?.response?.data?.error ?? 'Could not remove member.');
          }
     };

     // ── Loading skeleton ──
     if (loading) return (
          <div className="min-h-screen bg-gray-50/60 flex flex-col font-sans">
               <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { font-family: 'Plus Jakarta Sans', sans-serif; }`}</style>
               <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3.5 flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-xl" />
                    <Skeleton className="w-28 h-5" />
               </header>
               <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                    <Skeleton className="w-48 h-8" />
                    <Skeleton className="w-full h-36 rounded-2xl" />
                    <Skeleton className="w-full h-48 rounded-2xl" />
                    <div className="grid grid-cols-2 gap-4">
                         <Skeleton className="h-40 rounded-2xl" />
                         <Skeleton className="h-40 rounded-2xl" />
                    </div>
               </main>
          </div>
     );

     // ── Error state ──
     if (error) return (
          <div className="min-h-screen bg-gray-50/60 flex flex-col items-center justify-center gap-4 font-sans">
               <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { font-family: 'Plus Jakarta Sans', sans-serif; }`}</style>
               <div className="bg-white border border-red-100 rounded-2xl p-8 shadow-sm text-center max-w-sm">
                    <p className="text-sm text-red-400 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">{error}</p>
                    <button type="button" onClick={() => navigate(-1)}
                         className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow shadow-violet-500/30 hover:opacity-90 transition cursor-pointer">
                         ← Go Back
                    </button>
               </div>
          </div>
     );

     return (
          <div className="min-h-screen bg-gray-50/60 flex flex-col font-sans">
               <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

               {/* ── Header ── */}
               <Header />

               <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                    {/* ── Group Hero ── */}
                    <div className="relative bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden "
                         style={{ animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s both' }}>
                         {/* decorative gradient strip */}
                         <div className="px-6 py-5 flex items-start justify-between gap-4 flex-wrap">
                              <div className="flex items-center gap-4">
                                   <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 flex-shrink-0">
                                        <Icon path={ICONS.members} className="size-7 text-white" />
                                   </div>
                                   <div>
                                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
                                             {group?.name}
                                        </h1>
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                             <Icon path={ICONS.calendar} className="size-3.5 text-gray-300" />
                                             <span className="text-xs text-gray-400">
                                                  Created {group?.created_at ? new Date(group.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                             </span>
                                        </div>
                                   </div>
                              </div>
                              {/* Stacked avatars summary */}
                              <div className="flex items-center gap-2">
                                   <div className="flex -space-x-2">
                                        {group?.members.slice(0, 4).map(m => (
                                             <div key={m.id} className="ring-2 ring-white rounded-full">
                                                  <Avatar name={m.username} size="sm" />
                                             </div>
                                        ))}
                                        {(group?.members.length ?? 0) > 4 && (
                                             <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500">
                                                  +{(group?.members.length ?? 0) - 4}
                                             </div>
                                        )}
                                   </div>
                                   <span className="text-sm text-gray-400 font-medium ml-1">
                                        {group?.members.length ?? 0} member{(group?.members.length ?? 0) !== 1 ? 's' : ''}
                                   </span>
                              </div>
                         </div>
                    </div>

                    {/* ── Two-col layout ── */}
                    <div className="grid lg:grid-cols-5 gap-6">

                         {/* ── Members Panel ── */}
                         <div className="lg:col-span-2 flex flex-col gap-4">

                              {/* Add Member Card */}
                              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
                                   style={{ animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.10s both' }}>
                                   <div className="px-5 pt-5 pb-3 border-b border-gray-50">
                                        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                             <span className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                                                  <Icon path={ICONS.add_member} className="size-4 text-violet-500" />
                                             </span>
                                             Add Member
                                        </h3>
                                   </div>
                                   <div className="px-5 py-4">
                                        <form onSubmit={handleAddMember} className="flex flex-col gap-3">
                                             <div className="flex flex-col gap-1">
                                                  <label htmlFor="member-email" className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                                       Email Address
                                                  </label>
                                                  <input
                                                       id="member-email"
                                                       type="email"
                                                       placeholder="friend@example.com"
                                                       value={memberEmail}
                                                       onChange={e => { setMemberEmail(e.target.value); setAddMemberError(''); }}
                                                       required
                                                       className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-300 text-sm outline-none focus:border-violet-500 focus:bg-violet-50/50 transition-all"
                                                  />
                                             </div>

                                             {addMemberError && (
                                                  <p className="text-xs text-red-400 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                                                       {addMemberError}
                                                  </p>
                                             )}

                                             {addMemberSuccess && (
                                                  <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 flex items-center gap-1.5"
                                                       style={{ animation: 'popIn 0.3s cubic-bezier(0.16,1,0.3,1) both' }}>
                                                       <Icon path={ICONS.check} className="size-4" /> Member added successfully!
                                                  </p>
                                             )}

                                             <button
                                                  type="submit"
                                                  disabled={addingMember || !memberEmail.trim()}
                                                  className="py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-bold text-sm shadow shadow-violet-500/30 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
                                             >
                                                  {addingMember
                                                       ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                       : <><Icon path={ICONS.add_member} className="size-4" /> Invite Member</>
                                                  }
                                             </button>
                                        </form>
                                   </div>
                              </div>

                              {/* Members List */}
                              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
                                   style={{ animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.14s both' }}>
                                   <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-50">
                                        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                             <span className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                                                  <Icon path={ICONS.members} className="size-4 text-violet-500" />
                                             </span>
                                             Members
                                        </h3>
                                        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                             {group?.members.length ?? 0}
                                        </span>
                                   </div>

                                   {group?.members.length === 0 ? (
                                        <div className="px-5 py-8 text-center">
                                             <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                                                  <Icon path={ICONS.members} className="size-6 text-gray-300" />
                                             </div>
                                             <p className="text-sm text-gray-400">No members yet. Invite someone above!</p>
                                        </div>
                                   ) : (
                                        <ul className="divide-y divide-gray-50">
                                             {group?.members.map((member, i) => (
                                                  <li key={member.id}
                                                       className="flex items-center gap-3 px-5 py-3 group hover:bg-gray-50/60 transition-colors"
                                                       style={{ animation: `slideIn 0.4s cubic-bezier(0.16,1,0.3,1) ${0.16 + i * 0.05}s both` }}>
                                                       <Avatar name={member.username} size="md" />
                                                       <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-800 truncate">{member.username}</p>
                                                            <p className="text-xs text-gray-400 truncate">{member.email}</p>
                                                       </div>
                                                       <button
                                                            type="button"
                                                            onClick={() => handleRemoveMember(member.id)}
                                                            title="Remove member"
                                                            className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-400 transition-all cursor-pointer">
                                                            <Icon path={ICONS.trash} className="size-3.5" />
                                                       </button>
                                                  </li>
                                             ))}
                                        </ul>
                                   )}
                              </div>
                         </div>

                         {/* ── Right column: Expenses + Balances placeholders ── */}
                         <div className="lg:col-span-3 flex flex-col gap-4">

                              {/* Expenses Placeholder */}
                              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
                                   style={{ animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.18s both' }}>
                                   <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-50">
                                        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                             <span className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                                                  <Icon path={ICONS.receipt} className="size-4 text-indigo-500" />
                                             </span>
                                             Expenses
                                        </h3>
                                        <button type="button" className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow shadow-violet-500/30 hover:opacity-90 transition cursor-pointer flex items-center gap-1">
                                             <Icon path={ICONS.add_expense} className="size-3.5" />
                                             Add
                                        </button>
                                   </div>

                                   {/* Placeholder state */}
                                   <div className="px-5 py-10 flex flex-col items-center justify-center text-center gap-3">
                                        <div className="relative">
                                             <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center">
                                                  <Icon path={ICONS.receipt} className="size-8 text-violet-300" />
                                             </div>
                                             <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow shadow-violet-500/30">
                                                  <Icon path={ICONS.add_expense} className="size-3.5 text-white" />
                                             </div>
                                        </div>
                                        <div>
                                             <p className="text-sm font-semibold text-gray-700">No expenses yet</p>
                                             <p className="text-xs text-gray-400 mt-1">Add your first shared expense to get started.</p>
                                        </div>
                                        <button type="button" className="mt-1 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow shadow-violet-500/30 hover:opacity-90 hover:-translate-y-px transition-all cursor-pointer">
                                             + Add First Expense
                                        </button>
                                   </div>
                              </div>

                              {/* Balances Placeholder */}
                              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
                                   style={{ animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.22s both' }}>
                                   <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-50">
                                        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                             <span className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                                                  <Icon path={ICONS.balance} className="size-4 text-purple-500" />
                                             </span>
                                             Balances
                                        </h3>
                                        <button type="button" className="text-xs font-semibold px-3 py-1.5 rounded-lg text-violet-500 bg-violet-50 hover:bg-violet-100 transition cursor-pointer flex items-center gap-1">
                                             <Icon path={ICONS.settle} className="size-3.5" />
                                             Settle Up
                                        </button>
                                   </div>

                                   {/* Placeholder state */}
                                   <div className="px-5 py-10 flex flex-col items-center justify-center text-center gap-3">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 flex items-center justify-center">
                                             <Icon path={ICONS.balance} className="size-8 text-purple-300" />
                                        </div>
                                        <div>
                                             <p className="text-sm font-semibold text-gray-700">All settled up!</p>
                                             <p className="text-xs text-gray-400 mt-1">Balances will appear here once expenses are added.</p>
                                        </div>
                                   </div>
                              </div>

                              {/* Quick Actions */}
                              <div className="grid grid-cols-2 gap-3"
                                   style={{ animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.26s both' }}>
                                   <button type="button" className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30 hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer">
                                        <Icon path={ICONS.add_expense} className="size-4" />
                                        Add Expense
                                   </button>
                                   <button type="button" className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm bg-white border border-gray-100 text-gray-600 shadow-sm hover:shadow-md hover:border-violet-200 hover:text-violet-600 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer">
                                        <Icon path={ICONS.settle} className="size-4" />
                                        Settle Up
                                   </button>
                              </div>

                         </div>
                    </div>
               </main>
          </div>
     );
};

export default GroupDetail;
