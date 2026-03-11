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

  if (loading) return <div className="p-4 text-gray-500">Loading balances...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (balances.length === 0) return <div className="p-4 text-gray-500">All settled up! No outstanding balances.</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm p-2 mt-1 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Balance Summary</h2>
        <button
          onClick={() => navigate(`/groups/${groupId}/settlements`)}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
        >
          View History
        </button>
      </div>
      <div className="space-y-4">
        {balances.map((rec, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <div className="text-gray-700">
              <span className="font-medium text-red-600">{rec.from.username}</span> owes{' '}
              <span className="font-medium text-green-600">{rec.to.username}</span>
              <span className="ml-2 font-bold">${rec.amount.toFixed(2)}</span>
            </div>
            <button
              onClick={() => handleMarkSettled(rec, index)}
              disabled={processing !== null}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${processing === index
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
            >
              {processing === index ? 'Processing...' : 'Mark Settled'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BalanceSummary;
