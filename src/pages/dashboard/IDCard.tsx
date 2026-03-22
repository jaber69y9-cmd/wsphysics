import React, { useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { Download, User, MapPin, Phone, Calendar, Users, Clock } from 'lucide-react';
import html2canvas from 'html2canvas';

const IDCard = () => {
  const { user } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (cardRef.current) {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 3, // Higher scale for better print quality
        backgroundColor: null
      });
      const link = document.createElement('a');
      link.download = `WS_Physics_ID_${user?.roll_number || 'Student'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  if (!user) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20 flex flex-col items-center">
      <div className="w-full flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Student ID Card</h2>
        <button 
          onClick={handleDownload}
          className="btn-primary flex items-center gap-2 bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200"
        >
          <Download className="h-5 w-5" /> Download ID
        </button>
      </div>

      <div className="flex flex-col items-center justify-center py-12 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300 w-full">
        {/* ID Card Container - Standard CR80 Vertical Size (approx 2.125" x 3.375" scaled up) */}
        <div 
          ref={cardRef}
          className="w-[360px] min-h-[640px] h-auto bg-white rounded-2xl shadow-2xl overflow-hidden relative border border-slate-200 flex flex-col"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-b from-orange-600 to-orange-500 pt-6 pb-12 relative flex flex-col items-center text-center">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '12px 12px' }}></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-white p-2 rounded-xl mb-2 shadow-md">
                <span className="text-orange-600 font-black text-2xl leading-none">W</span>
              </div>
              <h1 className="text-white font-black text-xl tracking-widest uppercase">W'S PHYSICS</h1>
              <p className="text-orange-100 text-[8px] font-bold tracking-[0.2em] uppercase mt-0.5">Excellence in Learning</p>
            </div>
          </div>

          {/* Profile Picture */}
          <div className="flex justify-center -mt-12 relative z-20">
            <div className="w-28 h-28 bg-white rounded-2xl p-1 shadow-2xl border-2 border-orange-100 overflow-hidden transform hover:scale-105 transition-transform">
              {user.profile_pic ? (
                <img 
                  src={user.profile_pic} 
                  alt={user.name} 
                  className="w-full h-full object-cover rounded-xl"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center">
                  <User className="h-14 w-14 text-slate-300" />
                </div>
              )}
            </div>
          </div>

          {/* Batch Bar - Prominent */}
          <div className="mt-4 w-full px-4">
            <div className="bg-orange-600 text-white py-2 px-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center justify-between gap-2 border border-orange-400/30">
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5" />
                <span>Batch</span>
              </div>
              <span className="bg-white/20 px-3 py-0.5 rounded-lg">{user.batch_name || 'Regular Batch'}</span>
            </div>
          </div>

          {/* Student Info */}
          <div className="flex-1 px-6 pt-4 pb-2 flex flex-col items-center text-center">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight mb-1 drop-shadow-sm">{user.name}</h2>
            <div className="text-orange-600 font-bold text-[10px] uppercase tracking-[0.3em] mb-4">
              Student ID Card
            </div>

            <div className="w-full space-y-3 text-left mt-2">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Calendar className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1 border-b border-slate-100 pb-1">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Roll Number</p>
                  <p className="text-sm font-black text-slate-800 font-mono tracking-tighter">{user.roll_number}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1 border-b border-slate-100 pb-1">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Batch Time</p>
                  <p className="text-sm font-black text-slate-800">{user.batch_time || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Phone className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1 border-b border-slate-100 pb-1">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Phone</p>
                  <p className="text-sm font-black text-slate-800">{user.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with Large QR */}
          <div className="bg-slate-50 p-6 flex flex-col items-center justify-center border-t border-slate-100 gap-4 flex-1">
            <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-200 transform hover:scale-105 transition-transform">
              <QRCodeSVG 
                value={`WS-PHYSICS-ROLL-${user.roll_number}-NAME-${user.name}`}
                size={180}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "https://yt3.ggpht.com/yCls-kXn7hDbzhR5VDN487vOkUQfVyKXpDnh09EscXdOq6mOdDhxfkTnJ4kKQ85K4RaXwhv70A=s176-c-k-c0x00ffffff-no-rj-mo",
                  x: undefined,
                  y: undefined,
                  height: 36,
                  width: 36,
                  excavate: true,
                }}
              />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-24 h-0.5 bg-slate-300 mb-1 rounded-full"></div>
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.3em]">Authorized Signature</p>
            </div>
          </div>
          
          {/* Bottom Accent */}
          <div className="h-1.5 bg-orange-600 w-full"></div>
        </div>

        <p className="mt-8 text-slate-500 text-sm max-w-md text-center">
          This is your official digital ID card. You can download it and keep it on your phone or print it.
        </p>
      </div>
    </div>
  );
};

export default IDCard;
