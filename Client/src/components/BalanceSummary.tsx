import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBalances, recordSettlement } from '../services/settlementServices';
import type { SettlementRecommendation } from '../services/settlementServices';

interface BalanceSummaryProps {
  groupId: number;
  onSettled?: () => void;
}

const BalanceSummary: React.FC<BalanceSummaryProps> = ({ groupId, onSettled }) => {
  const navigate = useNavigate();
  const [balances, setBalances] = useState<SettlementRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const data = await getBalances(groupId);
      setBalances(data.transactions);
      setError(null);
    } catch (err) {
      console.error('Error fetching balances:', err);
      setError('Failed to load balances.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [groupId]);

  const handleMarkSettled = async (rec: SettlementRecommendation, index: number) => {
    try {
      setProcessing(index);
      await recordSettlement({
        groupId,
        senderId: rec.from.userId,
        receiverId: rec.to.userId,
        amount: rec.amount,
      });
      await fetchBalances();
      if (onSettled) onSettled();
    } catch (err) {
      console.error('Error recording settlement:', err);
      alert('Failed to record settlement.');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      style={{ animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.22s both' }}>

      {/* Header - Always Visible */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-50">
        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-indigo-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" />
            </svg>
          </span>
          Outstanding Balances
        </h3>
        <button
          onClick={() => navigate(`/groups/${groupId}/settlements`)}
          className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-gray-50 text-indigo-600 hover:bg-indigo-100/50 transition-all cursor-pointer"
        >
          View History
        </button>
      </div>

      <div className="p-1">
        {loading ? (
          <div className="p-10 text-center">
            <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Calculating...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-xs text-red-400 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 inline-block">{error}</p>
          </div>
        ) : balances.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-emerald-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-extrabold text-gray-800">All settled up!</p>
              <p className="text-xs text-gray-400 mt-1">No outstanding debts in this group.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1 p-1">
            {balances.map((rec, index) => (
              <div key={index} className="flex items-center justify-between p-3.5 hover:bg-gray-50/50 rounded-2xl transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                    <span className="text-xs font-black">{rec.from.username[0].toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-gray-900 truncate">
                      {rec.from.username} <span className="text-gray-400 font-medium">owes</span> {rec.to.username}
                    </p>
                    <p className="text-[10px] text-emerald-500 font-black mt-0.5 tracking-tight">${rec.amount.toFixed(2)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleMarkSettled(rec, index)}
                  disabled={processing !== null}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${processing === index
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white shadow shadow-indigo-500/20 hover:opacity-90 hover:-translate-y-px active:translate-y-0'
                    }`}
                >
                  {processing === index ? '...' : 'Settle'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceSummary;
