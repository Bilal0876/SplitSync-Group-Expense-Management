import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

export interface Expense {
     id: number;
     title: string;
     amount: string | number;
     paid_by: number;
     paid_by_username: string;
     created_at: string;
     split_count?: number;
}

const Icon = ({ path, className = 'size-5' }: { path: string; className?: string }) => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          strokeWidth={1.5} stroke="currentColor" className={className}>
          <path strokeLinecap="round" strokeLinejoin="round" d={path} />
     </svg>
);

const ICONS = {
     receipt: 'M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185ZM9.75 9h.008v.008H9.75V9Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 4.5h.008v.008h-.008V13.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z',
     user_circle: 'M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
     clock: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
     split: 'M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
     trash: 'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0',
     close: 'M6 18 18 6M6 6l12 12',
     pencil: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10',
     check: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
     tag: 'M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z',
     dollar: 'M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
     warning: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z',
};

const AVATAR_GRADIENTS = [
     'from-violet-500 to-purple-600',
     'from-indigo-500 to-blue-600',
     'from-purple-500 to-fuchsia-600',
     'from-rose-500 to-pink-600',
     'from-amber-500 to-orange-600'
];

const getGradient = (name: string) =>
     AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length];


interface EditExpenseModalProps {
     expense: Expense;
     onClose: () => void;
     onSuccess: () => void;
}

export const EditExpenseModal = ({ expense, onClose, onSuccess }: EditExpenseModalProps) => {
     const [title, setTitle] = useState(expense.title);
     const [amount, setAmount] = useState(String(parseFloat(String(expense.amount))));
     const [submitting, setSubmitting] = useState(false);
     const [error, setError] = useState('');
     const titleRef = useRef<HTMLInputElement>(null);

     useEffect(() => { titleRef.current?.focus(); }, []);
     useEffect(() => {
          const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
          window.addEventListener('keydown', handler);
          return () => window.removeEventListener('keydown', handler);
     }, [onClose]);

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          const parsedAmount = parseFloat(amount);
          if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
               setError('Please enter a valid title and amount.');
               return;
          }
          setSubmitting(true);
          setError('');
          try {
               await api.put(`/expenses/${expense.id}`, {
                    description: title.trim(),
                    amount: parsedAmount,
               });
               onSuccess();
               onClose();
          } catch (err: any) {
               setError(err?.response?.data?.error ?? 'Could not update expense.');
          } finally {
               setSubmitting(false);
          }
     };

     return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
               style={{ animation: 'backdropIn 0.2s ease both' }}>
               <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-md" onClick={onClose} />
               <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-violet-500/10 overflow-hidden"
                    style={{ animation: 'modalIn 0.3s cubic-bezier(0.16,1,0.3,1) both' }}>

                    {/* Header */}
                    <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-gray-100">
                         <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                                   <Icon path={ICONS.pencil} className="size-5 text-white" />
                              </div>
                              <div>
                                   <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Edit Expense</h2>
                                   <p className="text-sm text-gray-400 mt-0.5">Update the details below</p>
                              </div>
                         </div>
                         <button type="button" onClick={onClose}
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer">
                              <Icon path={ICONS.close} className="size-5" />
                         </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
                         {/* Title field */}
                         <div className="space-y-2">
                              <label htmlFor="edit-title" className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                   <Icon path={ICONS.tag} className="size-3.5 text-gray-300" />
                                   Title
                              </label>
                              <input ref={titleRef} id="edit-title" type="text"
                                   placeholder="e.g. Dinner at Nobu, Uber ride…"
                                   value={title}
                                   onChange={e => { setTitle(e.target.value); setError(''); }}
                                   required
                                   className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-300 text-sm outline-none focus:border-amber-500 focus:bg-amber-50/40 focus:ring-2 focus:ring-amber-500/20 transition-all" />
                         </div>

                         {/* Amount field */}
                         <div className="space-y-2">
                              <label htmlFor="edit-amount" className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                   <Icon path={ICONS.dollar} className="size-3.5 text-gray-300" />
                                   Amount
                              </label>
                              <div className="relative">
                                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 pointer-events-none">$</span>
                                   <input id="edit-amount" type="number" min="0.01" step="0.01" placeholder="0.00"
                                        value={amount}
                                        onChange={e => { setAmount(e.target.value); setError(''); }}
                                        required
                                        className="w-full pl-8 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-300 text-sm outline-none focus:border-amber-500 focus:bg-amber-50/40 focus:ring-2 focus:ring-amber-500/20 transition-all" />
                              </div>
                         </div>

                         {/* Error */}
                         {error && (
                              <p className="text-xs text-red-400 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
                                   style={{ animation: 'popIn 0.25s cubic-bezier(0.16,1,0.3,1) both' }}>
                                   {error}
                              </p>
                         )}

                         {/* Actions */}
                         <div className="flex items-center gap-3 pt-2">
                              <button type="button" onClick={onClose}
                                   className="flex-1 py-3.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all cursor-pointer">
                                   Cancel
                              </button>
                              <button type="submit"
                                   disabled={submitting || !title.trim() || !amount}
                                   className="flex-1 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 hover:opacity-90 hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2">
                                   {submitting
                                        ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        : <><Icon path={ICONS.check} className="size-4" /> Save Changes</>
                                   }
                              </button>
                         </div>
                    </form>
               </div>
          </div>
     );
};


interface DeleteConfirmModalProps {
     expense: Expense;
     onClose: () => void;
     onSuccess: () => void;
}

export const DeleteConfirmModal = ({ expense, onClose, onSuccess }: DeleteConfirmModalProps) => {
     const [deleting, setDeleting] = useState(false);
     const [error, setError] = useState('');

     useEffect(() => {
          const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
          window.addEventListener('keydown', handler);
          return () => window.removeEventListener('keydown', handler);
     }, [onClose]);

     const handleDelete = async () => {
          setDeleting(true);
          setError('');
          try {
               await api.delete(`/expenses/${expense.id}`);
               onSuccess();
               onClose();
          } catch (err: any) {
               setError(err?.response?.data?.error ?? 'Could not delete expense.');
          } finally {
               setDeleting(false);
          }
     };

     return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
               style={{ animation: 'backdropIn 0.2s ease both' }}>
               <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-md" onClick={onClose} />
               <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-red-500/10 overflow-hidden"
                    style={{ animation: 'modalIn 0.3s cubic-bezier(0.16,1,0.3,1) both' }}>
                    <div className="px-7 py-8 text-center">
                         <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center mx-auto mb-5">
                              <Icon path={ICONS.warning} className="size-8 text-red-400" />
                         </div>
                         <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Delete Expense?</h2>
                         <p className="text-sm text-gray-400 mt-3 leading-relaxed max-w-xs mx-auto">
                              Are you sure you want to delete <span className="font-semibold text-gray-600">"{expense.title}"</span>?
                              This will also remove all associated splits. This action cannot be undone.
                         </p>

                         {error && (
                              <p className="mt-4 text-xs text-red-400 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
                                   style={{ animation: 'popIn 0.25s cubic-bezier(0.16,1,0.3,1) both' }}>
                                   {error}
                              </p>
                         )}

                         <div className="flex items-center gap-3 mt-6">
                              <button type="button" onClick={onClose}
                                   className="flex-1 py-3.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all cursor-pointer">
                                   Cancel
                              </button>
                              <button type="button" onClick={handleDelete} disabled={deleting}
                                   className="flex-1 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30 hover:opacity-90 hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2">
                                   {deleting
                                        ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        : <><Icon path={ICONS.trash} className="size-4" /> Delete</>
                                   }
                              </button>
                         </div>
                    </div>
               </div>
          </div>
     );
};


interface ExpenseCardProps {
     expense: Expense;
     index: number;
     onEdit: (expense: Expense) => void;
     onDelete: (expense: Expense) => void;
}

const ExpenseCard = ({ expense, index, onEdit, onDelete }: ExpenseCardProps) => {
     const { user } = useAuth();

     const amount = parseFloat(String(expense.amount));
     const date = new Date(expense.created_at);
     const isThisYear = date.getFullYear() === new Date().getFullYear();
     const formattedDate = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          ...(!isThisYear && { year: 'numeric' }),
     });

     const isOwner = user?.id === expense.paid_by;
     const accentGradient = getGradient(expense.paid_by_username);

     return (
          <li
               className="group/card flex items-center gap-4 px-5 py-4 hover:bg-gray-50/70 transition-colors border-b border-gray-50 last:border-0"
               style={{ animation: `slideIn 0.4s cubic-bezier(0.16,1,0.3,1) ${0.18 + index * 0.05}s both` }}
          >
               {/* Icon */}
               <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentGradient} flex items-center justify-center shadow-sm flex-shrink-0`}>
                    <Icon path={ICONS.receipt} className="size-5 text-white/90" />
               </div>

               {/* Details */}
               <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{expense.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                         <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Icon path={ICONS.user_circle} className="size-3.5 text-gray-300" />
                              <span className="font-semibold text-violet-500">{expense.paid_by_username}</span>
                              <span>paid</span>
                         </span>
                         <span className="text-gray-200">·</span>
                         <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Icon path={ICONS.clock} className="size-3 text-gray-300" />
                              {formattedDate}
                         </span>
                         {expense.split_count && expense.split_count > 1 && (
                              <>
                                   <span className="text-gray-200">·</span>
                                   <span className="flex items-center gap-1 text-xs text-gray-400">
                                        <Icon path={ICONS.split} className="size-3 text-gray-300" />
                                        split {expense.split_count} ways
                                   </span>
                              </>
                         )}
                    </div>
               </div>

               {/* Amount + Actions */}
               <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                         <p className="text-sm font-extrabold text-gray-800">${amount.toFixed(2)}</p>
                         {expense.split_count && expense.split_count > 1 && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                   ${(amount / expense.split_count).toFixed(2)}/person
                              </p>
                         )}
                    </div>

                    {/* Edit / Delete — only visible if user is the payer */}
                    {isOwner && (
                         <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
                              <button type="button" onClick={() => onEdit(expense)} title="Edit expense"
                                   className="w-8 h-8 rounded-lg hover:bg-amber-50 flex items-center justify-center text-gray-300 hover:text-amber-500 transition-all cursor-pointer">
                                   <Icon path={ICONS.pencil} className="size-3.5" />
                              </button>
                              <button type="button" onClick={() => onDelete(expense)} title="Delete expense"
                                   className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-400 transition-all cursor-pointer">
                                   <Icon path={ICONS.trash} className="size-3.5" />
                              </button>
                         </div>
                    )}
               </div>
          </li>
     );
};

export default ExpenseCard;
