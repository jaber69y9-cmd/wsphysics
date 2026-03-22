import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, FileText, Lock, Info } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen pt-12 pb-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex p-4 rounded-full bg-orange-100 text-orange-600 mb-6">
            <Lock size={40} />
          </div>
          <h1 className="section-title">Privacy Policy</h1>
          <p className="section-subtitle">
            Your privacy is our top priority. Learn how we handle your data.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200 space-y-8 text-slate-700 leading-relaxed"
        >
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="text-orange-600" /> 1. Information We Collect
            </h2>
            <p>
              We collect personal information such as your name, email address, and phone number when you register for an account or contact us. We also collect data about your course progress and exam results.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Lock className="text-orange-600" /> 2. How We Use Your Data
            </h2>
            <p>
              Your data is used to provide and improve our educational services, personalize your learning experience, communicate important updates, and process payments. We do not sell your data to third parties.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Info className="text-orange-600" /> 3. Data Security
            </h2>
            <p>
              We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, or alteration. Your account is protected by your chosen password.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="text-orange-600" /> 4. Third-Party Services
            </h2>
            <p>
              We may use third-party services for payment processing and analytics. These services have their own privacy policies and are responsible for the data they collect.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Lock className="text-orange-600" /> 5. Your Rights
            </h2>
            <p>
              You have the right to access, update, or delete your personal information at any time. If you have any questions or concerns about your data, please contact us.
            </p>
          </section>

          <div className="pt-8 border-t border-slate-100 text-sm text-slate-500 text-center">
            Last Updated: March 19, 2026
          </div>
        </motion.div>

        {/* Developer Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-200 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-16 -mt-16" />
          
          <h2 className="text-3xl font-black text-slate-900 mb-8 relative z-10">Developer Information</h2>
          <div className="flex flex-col items-center space-y-6 relative z-10">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-100 shadow-xl">
              <img 
                src="https://avatars.githubusercontent.com/u/1?v=4" 
                alt="Developer" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">Lead Developer</h3>
              <p className="text-orange-600 font-bold tracking-widest uppercase text-xs">Full Stack Web Developer</p>
            </div>
            <div className="max-w-xl text-slate-600 font-medium leading-relaxed">
              This platform is crafted with passion and dedication. 
              Interestingly, the lead developer of this website is also a proud student of <strong>WS Physics</strong>. 
              This ensures that the platform is built with a deep understanding of both student and teacher needs, providing the best possible educational experience.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
