import { safeJson } from '../utils/api';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Loader } from 'lucide-react';

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

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="h-10 w-10 text-orange-600 animate-spin" />
          </div>
        ) : (
          <>
            {categories.length > 1 && (
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-6 py-2 rounded-full font-bold transition-colors ${
                      activeCategory === category 
                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' 
                        : 'bg-white text-slate-600 hover:bg-orange-50 hover:text-orange-600 border border-slate-200'
                    }`}
                  >
                    {category}
                  </button>
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
                  >
                    <img 
                      src={img.image_url} 
                      alt={img.caption || "Gallery Image"} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <span className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">{img.category || 'General'}</span>
                      <p className="text-white font-medium">{img.caption}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Gallery;
