import { safeJson } from '../../utils/api';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, Calendar, CheckCircle, XCircle, Clock, CreditCard, Tag, Info, Phone, Users } from 'lucide-react';
import { motion } from 'motion/react';
import SmallLoadingSpinner from '../../components/SmallLoadingSpinner';

const MyEnrollments = () => {
  const { token } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await fetch('/api/my-enrollments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await safeJson(res);
          setEnrollments(Array.isArray(data) ? data : (data.enrollments || []));
        }
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, [token]);

  if (loading) return <SmallLoadingSpinner />;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight flex items-center gap-3">
            <FileText className="h-8 w-8 text-orange-600" />
            My Enrollments
          </h1>
          <p className="text-slate-700 mt-1 font-medium">Track your course application status and payment details.</p>
        </div>
        <div className="glass px-6 py-3 rounded-2xl text-orange-700 font-bold text-sm border border-white/60 shadow-xl">
          {enrollments.length} Application{enrollments.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {enrollments.map((enroll) => (
          <motion.div 
            key={enroll.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="glass rounded-[2.5rem] shadow-2xl border border-white/60 overflow-hidden transition-all duration-500 group bg-white/80"
          >
            <div className={`px-8 py-5 border-b border-white/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
              enroll.status === 'approved' ? 'bg-emerald-500/10' : 
              enroll.status === 'rejected' ? 'bg-red-500/10' : 'bg-orange-500/10'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  enroll.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                  enroll.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {enroll.status === 'approved' ? <CheckCircle className="h-5 w-5" /> : 
                   enroll.status === 'rejected' ? <XCircle className="h-5 w-5" /> : 
                   <Clock className="h-5 w-5" />}
                </div>
                <div>
                  <span className={`font-black uppercase tracking-widest text-xs ${
                    enroll.status === 'approved' ? 'text-emerald-800' : 
                    enroll.status === 'rejected' ? 'text-red-800' : 'text-orange-800'
                  }`}>
                    {enroll.status}
                  </span>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Application Status</p>
                </div>
              </div>
              <div className="text-xs font-bold text-slate-700 flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full border border-white/60 shadow-sm">
                <Calendar className="h-4 w-4 text-orange-600" />
                {new Date(enroll.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </div>
            </div>

            <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2">Program / Course</p>
                <h3 className="text-2xl font-black text-slate-950 leading-tight group-hover:text-orange-700 transition-colors">
                  {enroll.program_title || enroll.course_title}
                </h3>
                {enroll.batch_name && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Users className="h-3 w-3" />
                    Batch: {enroll.batch_name}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 lg:col-span-2">
                <div className="bg-white/50 p-5 rounded-3xl border border-white/60 shadow-inner">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2">Admission Fee</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-orange-700">৳{enroll.admission_fee || enroll.fee || 0}</span>
                  </div>
                </div>

                <div className="bg-white/50 p-5 rounded-3xl border border-white/60 shadow-inner">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2">Monthly Fee</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-950">৳{enroll.monthly_fee || 0}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">/month</span>
                  </div>
                </div>

                <div className="bg-white/50 p-5 rounded-3xl border border-white/60 shadow-inner">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2">Payment Method</p>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-orange-600" />
                    <span className="text-lg font-black text-slate-950">{enroll.payment_method || 'N/A'}</span>
                  </div>
                </div>

                <div className="bg-white/50 p-5 rounded-3xl border border-white/60 shadow-inner">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2">Payment Number</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-orange-600" />
                    <span className="text-lg font-black text-slate-950">{enroll.payment_number || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 bg-slate-900/10 p-5 rounded-3xl border border-white/40 shadow-inner">
                <p className="text-[10px] text-slate-600 uppercase font-black tracking-[0.2em] mb-2">Transaction ID / Info</p>
                <p className="text-sm font-mono font-bold text-slate-900 break-all">
                  {enroll.transaction_id || 'N/A'}
                </p>
              </div>
            </div>

            {enroll.status === 'pending' && (
              <div className="px-8 py-6 bg-blue-500/5 border-t border-white/20 flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-xl">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  Your application is currently being reviewed by our team. Once approved, your account will be fully activated and you will receive a confirmation.
                </p>
              </div>
            )}
          </motion.div>
        ))}

        {enrollments.length === 0 && (
          <div className="text-center py-24 glass rounded-[3rem] border border-dashed border-slate-300 shadow-inner">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-12 w-12 text-slate-300" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">No Enrollments Found</h3>
            <p className="text-slate-500 font-medium">You haven't submitted any enrollment applications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEnrollments;
