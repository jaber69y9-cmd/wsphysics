import { safeJson } from '../utils/api';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Loader, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface GalleryItem {
  id: number;
  image_url: string;
  caption: string;
  category: string;
}

const Gallery = () => {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/gallery')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch gallery');
      })
      .then(data => {
        setImages(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch gallery", err);
        setLoading(false);
      });
  }, []);

  const categories = ['All', ...Array.from(new Set(images.map(img => img.category || 'General')))];
  const filteredImages = activeCategory === 'All' ? images : images.filter(img => (img.category || 'General') === activeCategory);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % filteredImages.length);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-12 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="section-title">Photo Gallery</h1>
          <p className="section-subtitle">
            Glimpses of our classrooms, events, and student achievements.
          </p>
        </motion.div>

        {loading ? null : (
          <>
            {categories.length > 1 && (
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                {categories.map(category => (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-6 py-2 rounded-full font-bold transition-colors ${
                      activeCategory === category 
                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' 
                        : 'bg-white text-slate-600 hover:bg-orange-50 hover:text-orange-600 border border-slate-200'
                    }`}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredImages.length === 0 ? (
                <div className="col-span-3 text-center py-20 text-slate-500">
                  <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>No images in this category yet.</p>
                </div>
              ) : (
                filteredImages.map((img, index) => (
                  <motion.div
                    key={img.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative overflow-hidden rounded-2xl shadow-lg aspect-video cursor-pointer"
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img 
                      src={img.image_url} 
                      alt={img.caption || "Gallery Image"} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://picsum.photos/seed/broken/800/600';
                        target.onerror = null;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <div className="flex items-center gap-2 mb-1">
                        <ZoomIn className="h-4 w-4 text-orange-400" />
                        <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">{img.category || 'General'}</span>
                      </div>
                      <p className="text-white font-medium">{img.caption}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4 md:p-12"
            onClick={() => setSelectedImageIndex(null)}
          >
            <button 
              className="absolute top-6 right-6 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all z-[10001]"
              onClick={() => setSelectedImageIndex(null)}
            >
              <X className="h-8 w-8" />
            </button>

            <button 
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-[10001]"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-10 w-10" />
            </button>

            <button 
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-[10001]"
              onClick={handleNext}
            >
              <ChevronRight className="h-10 w-10" />
            </button>

            <motion.div 
              key={selectedImageIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={filteredImages[selectedImageIndex].image_url} 
                alt={filteredImages[selectedImageIndex].caption}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="mt-6 text-center">
                <span className="text-orange-500 font-bold uppercase tracking-widest text-sm mb-2 block">
                  {filteredImages[selectedImageIndex].category || 'General'}
                </span>
                <h3 className="text-white text-xl md:text-2xl font-bold">
                  {filteredImages[selectedImageIndex].caption}
                </h3>
                <p className="text-white/50 text-sm mt-2">
                  Image {selectedImageIndex + 1} of {filteredImages.length}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
