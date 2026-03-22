import { safeJson } from '../../utils/api';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, CheckCircle, XCircle } from 'lucide-react';

const Fees = () => {
  const { token } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/my-profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await safeJson(res);
          setPayments(data.payments || []);
          setUserData(data.user);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <CreditCard className="h-6 w-6 text-green-600" /> Fees & Payments
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Monthly Fee</h3>
              <p className="text-slate-500">Your fixed monthly fee</p>
            </div>
            <div className="text-3xl font-bold text-orange-600">৳{userData?.monthly_fee || 0}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Total Paid</h3>
              <p className="text-slate-500">Total amount paid so far</p>
            </div>
            <div className="text-3xl font-bold text-green-600">৳{userData?.paid_amount || 0}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <h3 className="p-6 font-bold text-slate-800 border-b border-slate-100">Payment History</h3>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Month</th>
              <th className="p-4 font-semibold">Type</th>
              <th className="p-4 font-semibold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-800">{payment.date}</td>
                <td className="p-4 text-slate-600 font-medium">{payment.month || 'N/A'}</td>
                <td className="p-4 text-slate-600 capitalize">{payment.type}</td>
                <td className="p-4 text-right font-bold text-green-600">৳{payment.amount}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-slate-500">No payment records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Fees;
