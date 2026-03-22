import { showAlert } from '../utils/alert';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { db } from '../firebase';
import { addDoc, collection } from 'firebase/firestore';

const Contact = () => {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Contact Form Submission',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'messages'), {
        ...formData,
        createdAt: new Date()
      });
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: 'Contact Form Submission', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      showAlert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // If it's already an embed URL, return it
    if (url.includes('google.com/maps/embed') || url.includes('output=embed')) return url;
    
    // If it's a full iframe tag, extract the src
    const srcMatch = url.match(/src="([^"]+)"/);
    if (srcMatch) return srcMatch[1];

    try {
      // Handle shortened maps.app.goo.gl links - these can't be embedded directly
      // but we can try to warn or just use the URL as is (which will fail in iframe)
      if (url.includes('maps.app.goo.gl')) {
        // We can't easily resolve this client-side, but we can try to use the whole URL as a query
        return `https://maps.google.com/maps?q=${encodeURIComponent(url)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }

      // Handle /@lat,lng,zoom
      const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }

      // Handle /place/Place+Name
      const placeMatch = url.match(/\/place\/([^\/|\?|!]+)/);
      if (placeMatch) {
        const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
        return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }

      // Handle search?q=...
      const queryMatch = url.match(/q=([^&]+)/);
      if (queryMatch) {
        return `https://maps.google.com/maps?q=${queryMatch[1]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }

      // If it's just a query string or address
      if (!url.startsWith('http')) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(url)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }
      
      // Fallback for any other URL - try to use it as a query if it's short
      if (url.length < 300) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(url)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }
    } catch (e) {
      console.error('Error parsing map URL:', e);
    }
    
    return url;
  };

  return (
    <div className="min-h-screen pt-12 pb-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="section-title">Get in Touch</h1>
          <p className="section-subtitle">
            Have questions? We're here to help you on your physics journey.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12"
        >
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Contact Information
              </h2>
              <p className="text-slate-500 text-lg">
                Have questions about our courses or admission process? We're here to help.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 flex items-center space-x-4 rounded-xl shadow-sm border border-slate-200">
                <div className="bg-orange-50 p-3 rounded-full text-orange-600">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-slate-800 font-semibold">Phone</h3>
                  <p className="text-slate-500">{settings.contact_phone || '+880 1234 567890'}</p>
                </div>
              </div>

              <div className="bg-white p-6 flex items-center space-x-4 rounded-xl shadow-sm border border-slate-200">
                <div className="bg-orange-50 p-3 rounded-full text-orange-600">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-slate-800 font-semibold">Email</h3>
                  <p className="text-slate-500">{settings.contact_email || 'contact@wsphysics.com'}</p>
                </div>
              </div>

              <div className="bg-white p-6 flex items-start space-x-4 rounded-xl shadow-sm border border-slate-200">
                <div className="bg-orange-50 p-3 rounded-full text-orange-600 mt-1">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="w-full">
                  <h3 className="text-slate-800 font-semibold">Campus 1</h3>
                  <p className="text-slate-500 whitespace-pre-line">{settings.office_address || 'Farmgate, Dhaka, Bangladesh'}</p>
                </div>
              </div>

              {settings.campus_2_address && (
                <div className="bg-white p-6 flex items-start space-x-4 rounded-xl shadow-sm border border-slate-200">
                  <div className="bg-orange-50 p-3 rounded-full text-orange-600 mt-1">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="w-full">
                    <h3 className="text-slate-800 font-semibold">Campus 2</h3>
                    <p className="text-slate-500 whitespace-pre-line">{settings.campus_2_address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-xl shadow-xl border border-slate-200 relative overflow-hidden">
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center p-8 text-center"
                >
                  <CheckCircle className="h-20 w-20 text-green-500 mb-4" />
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-600">We will get back to you soon.</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Name</label>
                <input
                  type="text"
                  className="input-field w-full"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  className="input-field w-full"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                <textarea
                  className="input-field w-full h-32 resize-none"
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                ></textarea>
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50">
                <Send className="h-5 w-5" /> {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Map Section */}
        {(settings.map_embed_url || settings.map_embed_url_2) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {settings.map_embed_url && (
              <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-600" /> Campus 1 Location
                </h3>
                <div className="aspect-video w-full rounded-xl overflow-hidden shadow-inner bg-slate-100 h-[350px]">
                  <iframe
                    src={getEmbedUrl(settings.map_embed_url)}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Google Maps Campus 1"
                  ></iframe>
                </div>
              </div>
            )}

            {settings.map_embed_url_2 && (
              <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-600" /> Campus 2 Location
                </h3>
                <div className="aspect-video w-full rounded-xl overflow-hidden shadow-inner bg-slate-100 h-[350px]">
                  <iframe
                    src={getEmbedUrl(settings.map_embed_url_2)}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Google Maps Campus 2"
                  ></iframe>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Contact;
