import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Image } from 'lucide-react';

export function Gallery() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Gallery</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Glimpses of our events, classes, and success celebrations.
        </p>
      </div>
      <GlassCard className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
        <Image className="w-12 h-12 mb-4 text-slate-300" />
        <p>Gallery images will be uploaded soon.</p>
      </GlassCard>
    </div>
  );
}
