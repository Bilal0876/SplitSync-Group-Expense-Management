import React, { useState } from 'react';
import { createGroup, type Group } from '../services/groupServices';

// ── tiny icon helpers ────────────────────────────────────────────────────────
const Icon = ({ path, className = 'size-5' }: { path: string; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const ICONS = {
  close: 'M6 18 18 6M6 6l12 12',
};

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (group: Group) => void;
}

const CreateGroupModal = ({ open, onClose, onCreated }: CreateGroupModalProps) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Group name is required.'); return; }

    setLoading(true);
    try {
      const group = await createGroup(name.trim());
      onCreated(group);
      setName('');
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to create group.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6"
        style={{ animation: 'fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both' }}>

        {/* Close button */}
        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
          <Icon path={ICONS.close} className="size-4" />
        </button>

        <h3 className="text-lg font-extrabold text-gray-900 mb-1">Create New Group</h3>
        <p className="text-sm text-gray-400 mb-5">Start splitting expenses with your team.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="group-name" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Group Name
            </label>
            <input
              id="group-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Barcelona Trip"
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-violet-500/30 hover:opacity-90 disabled:opacity-60 transition-opacity cursor-pointer"
          >
            {loading ? 'Creating…' : 'Create Group'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
