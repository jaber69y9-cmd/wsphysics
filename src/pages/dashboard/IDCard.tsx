import React, { useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { QRCodeSVG } from 'qrcode.react';
import { Download, User, MapPin, Phone, Calendar, Users, Clock, CreditCard } from 'lucide-react';
import html2canvas from 'html2canvas';
import { motion } from 'motion/react';

const IDCard = () => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (cardRef.current) {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 3,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `WS_Physics_ID_${user?.roll_number || 'Student'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-orange-600" />
            Digital ID Card
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Your official student identification for {settings.site_name || "W'S Physics"}.</p>
        </div>
        <button
          onClick={handleDownload}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <Download className="h-5 w-5" />
          Download ID Card
        </button>
      </div>

      <div className="flex justify-center py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          ref={cardRef}
          className="relative w-[380px] h-[600px] bg-white rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden border border-slate-100 flex flex-col"
        >
          {/* Header Background */}
          <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-br from-orange-600 to-rose-600" />
          
          {/* Logo & Institution Name */}
          <div className="relative pt-10 px-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                {settings.logo_url ? (
                  <img src={settings.logo_url} alt="Logo" className="w-full h-full object-cover" crossOrigin="anonymous" />
                ) : (
                  <span className="text-orange-600 font-black text-xl">{(settings.site_name || "W")[0]}</span>
                )}
              </div>
              <h2 className="text-white text-2xl font-black tracking-tighter">{(settings.site_name || "W'S PHYSICS").toUpperCase()}</h2>
            </div>
            <p className="text-orange-100 text-[10px] font-black uppercase tracking-[0.3em]">Excellence in Education</p>
          </div>

          {/* Student Photo */}
          <div className="relative mt-10 flex justify-center">
            <div className="w-40 h-40 bg-white rounded-[2.5rem] p-1 shadow-2xl overflow-hidden border-4 border-white">
              {user.profile_pic ? (
                <img src={user.profile_pic} alt={user.name} className="w-full h-full rounded-[2.2rem] object-cover" crossOrigin="anonymous" />
              ) : (
                <div className="w-full h-full bg-slate-100 rounded-[2.2rem] flex items-center justify-center text-5xl font-black text-slate-300">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Student Details */}
          <div className="px-10 mt-8 text-center flex-1">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight mb-1">{user.name}</h3>
            <p className="text-orange-600 font-black text-xs uppercase tracking-widest mb-6">{user.student_type} Student</p>
            
            <div className="grid grid-cols-2 gap-6 text-left">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Student ID</p>
                <p className="text-sm font-black text-slate-800">{user.roll_number || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Batch</p>
                <p className="text-sm font-black text-slate-800">{user.batch_name || user.batch_id || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Program</p>
                <p className="text-sm font-black text-slate-800 truncate">{user.program_title || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Blood Group</p>
                <p className="text-sm font-black text-red-600">{user.blood_group || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* QR Code & Footer */}
          <div className="bg-slate-50 p-8 border-t border-slate-100 flex items-center justify-between">
            <div className="text-left">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mb-1">Valid Until</p>
              <p className="text-sm font-black text-slate-800">Dec 2026</p>
            </div>
            <div className="bg-white p-2 rounded-2xl shadow-inner border border-slate-200">
              <QRCodeSVG 
                value={`WS-PHYSICS-${user.roll_number || user.id}`}
                size={60}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>
          <div className="h-2 bg-orange-600 w-full" />
        </motion.div>
      </div>

      <div className="glass p-8 rounded-[2.5rem] border border-white/60 shadow-xl max-w-2xl mx-auto">
        <div className="flex items-start gap-4">
          <div className="bg-orange-100 p-3 rounded-2xl">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900 mb-2">Important Instructions</h4>
            <ul className="space-y-2 text-sm text-slate-600 font-medium list-disc ml-4">
              <li>This digital ID card is valid for all institutional purposes.</li>
              <li>Please keep your profile picture updated for a clear identification.</li>
              <li>In case of any discrepancies, please contact the administration.</li>
              <li>You can download and print this card for physical use.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDCard;
