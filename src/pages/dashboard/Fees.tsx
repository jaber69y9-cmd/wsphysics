import { safeJson } from '../../utils/api';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, Calendar, Tag } from 'lucide-react';
import SmallLoadingSpinner from '../../components/SmallLoadingSpinner';

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

  if (loading) return <SmallLoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
            Fees & Payments
          </h2>
          <p className="text-slate-500 mt-1 text-sm font-medium">Manage your tuition fees and payment history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-8 rounded-[2rem] border border-white/60 shadow-xl bg-white/40">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Monthly Fee</p>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Your fixed monthly fee</h3>
            </div>
            <div className="text-4xl font-black text-orange-600 tracking-tighter">৳{userData?.monthly_fee || 0}</div>
          </div>
        </div>
        <div className="glass p-8 rounded-[2rem] border border-white/60 shadow-xl bg-white/40">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Total Paid</p>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Total amount paid so far</h3>
            </div>
            <div className="text-4xl font-black text-green-600 tracking-tighter">৳{userData?.paid_amount || 0}</div>
          </div>
        </div>
      </div>

      <div className="glass p-8 rounded-[2rem] border border-white/60 shadow-xl bg-white/40">
        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-8">
          <div className="p-2 bg-orange-100 rounded-xl">
            <CreditCard className="h-5 w-5 text-orange-600" />
          </div>
          Payment Status <span className="text-slate-400 font-bold text-sm ml-2">(12 Months)</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {(() => {
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            let admissionMonthIndex = 0;
            if (userData?.admission_month) {
              const idx = months.findIndex(m => m.toLowerCase() === userData.admission_month.toLowerCase());
              if (idx !== -1) admissionMonthIndex = idx;
            } else if (userData?.admission_date) {
              admissionMonthIndex = new Date(userData.admission_date).getMonth();
            }
            
            return months.map((month, idx) => {
              if (idx < admissionMonthIndex) return null;
              
              const isPaid = payments.some((p: any) => p.month === month && p.type === 'monthly');
              return (
                <div 
                  key={month} 
                  className={`p-5 rounded-3xl text-center transition-all border shadow-lg ${
                    isPaid 
                      ? 'bg-green-500 text-white border-green-400 shadow-green-100' 
                      : 'bg-red-500 text-white border-red-400 shadow-red-100'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2">{month.substring(0, 3)}</div>
                  <div className="flex justify-center">
                    {isPaid ? (
                      <div className="bg-white/20 p-1.5 rounded-full">
                        <CreditCard className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="bg-black/10 p-1.5 rounded-full">
                        <Tag className="h-4 w-4 opacity-50" />
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-[8px] font-black uppercase tracking-tighter opacity-80">
                    {isPaid ? 'Paid' : 'Unpaid'}
                  </div>
                </div>
              );
            }).filter(Boolean);
          })()}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-xl">
            <Calendar className="h-5 w-5 text-slate-600" />
          </div>
          Payment History
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          {payments.map((payment) => (
            <div key={payment.id} className="glass p-6 rounded-[2rem] border border-white/60 shadow-xl bg-white/40 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-white/60 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-green-100 text-green-600 shadow-lg shadow-green-100">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 tracking-tight capitalize">
                    {payment.month || 'N/A'}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <Calendar className="h-3 w-3" />
                      {new Date(payment.date).toLocaleDateString()}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <div className="flex items-center gap-1.5 text-orange-600 text-[10px] font-black uppercase tracking-widest">
                      <Tag className="h-3 w-3" />
                      {payment.type}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Amount Paid</p>
                <p className="text-3xl font-black text-green-600 tracking-tighter">৳{payment.amount}</p>
              </div>
            </div>
          ))}
          {payments.length === 0 && (
            <div className="glass p-12 rounded-[2rem] border border-white/60 shadow-xl bg-white/40 text-center">
              <p className="text-slate-400 font-black uppercase tracking-widest">No payment records found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Fees;
