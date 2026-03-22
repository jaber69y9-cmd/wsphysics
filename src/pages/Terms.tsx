import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, FileText, Lock, Info } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen pt-12 pb-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex p-4 rounded-full bg-orange-100 text-orange-600 mb-6">
            <FileText size={40} />
          </div>
          <h1 className="section-title">Terms & Conditions</h1>
          <p className="section-subtitle">
            Please read these terms carefully before using our services.
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
              <ShieldCheck className="text-orange-600" /> 1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using WS Physics, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Lock className="text-orange-600" /> 2. User Accounts
            </h2>
            <p>
              To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Info className="text-orange-600" /> 3. Course Access & Content
            </h2>
            <p>
              All course materials, including videos, notes, and exams, are for personal use only. Unauthorized distribution, reproduction, or sharing of content is strictly prohibited and may lead to account termination.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="text-orange-600" /> 4. Payments & Refunds
            </h2>
            <p>
              Course fees are non-refundable once access is granted. We reserve the right to change pricing at any time. All payments must be made through our authorized channels.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Lock className="text-orange-600" /> 5. Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate your account if you violate these terms or engage in any behavior that harms the WS Physics community.
            </p>
          </section>

          <div className="pt-8 border-t border-slate-100 text-sm text-slate-500 text-center">
            Last Updated: March 19, 2026
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
