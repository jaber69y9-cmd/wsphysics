import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Plus, Edit2, Trash2, Video, Calendar, Clock, Link as LinkIcon, Users } from 'lucide-react';
import { format } from 'date-fns';

interface LiveClass {
  id: string;
  title: string;
  date: string;
  time: string;
  link: string;
  batchId: string;
  status: 'scheduled' | 'live' | 'completed';
}

export function LiveClasses() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<LiveClass | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    link: '',
    batchId: '',
    status: 'scheduled' as 'scheduled' | 'live' | 'completed'
  });

  useEffect(() => {
    const q = query(collection(db, 'liveClasses'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LiveClass)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await updateDoc(doc(db, 'liveClasses', editingClass.id), formData);
      } else {
        await addDoc(collection(db, 'liveClasses'), formData);
      }
      setIsModalOpen(false);
      setEditingClass(null);
      setFormData({ title: '', date: '', time: '', link: '', batchId: '', status: 'scheduled' });
    } catch (error) {
      console.error("Error saving class:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await deleteDoc(doc(db, 'liveClasses', id));
      } catch (error) {
        console.error("Error deleting class:", error);
      }
    }
  };

  const openEditModal = (cls: LiveClass) => {
    setEditingClass(cls);
    setFormData({
      title: cls.title,
      date: cls.date,
      time: cls.time,
      link: cls.link,
      batchId: cls.batchId || '',
      status: cls.status
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Live Class Management</h1>
          <p className="text-slate-500 mt-2">Schedule and manage live broadcasting sessions.</p>
        </div>
        <Button onClick={() => { setEditingClass(null); setIsModalOpen(true); }} className="gap-2 bg-red-500 hover:bg-red-600 shadow-red-500/30">
          <Video className="w-5 h-5" /> Schedule Class
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <GlassCard key={i} className="h-48 animate-pulse bg-slate-200/50" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <GlassCard className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
          <Video className="w-12 h-12 mb-4 text-slate-300" />
          <p>No live classes scheduled.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <GlassCard key={cls.id} className="flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className={`absolute top-0 inset-x-0 h-1 ${
                cls.status === 'live' ? 'bg-red-500 animate-pulse' : 
                cls.status === 'completed' ? 'bg-slate-300' : 'bg-orange-500'
              }`} />
              
              <div className="flex justify-between items-start mb-4">
                <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  cls.status === 'live' ? 'bg-red-100 text-red-600 animate-pulse' : 
                  cls.status === 'completed' ? 'bg-slate-100 text-slate-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  {cls.status === 'live' ? 'â Live Now' : cls.status}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(cls)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-orange-600 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(cls.id)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2">{cls.title}</h3>
              
              <div className="space-y-2 mb-6 flex-1">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{cls.date ? format(new Date(cls.date), 'MMM dd, yyyy') : 'No Date'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{cls.time || 'No Time'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Batch: {cls.batchId || 'All'}</span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100">
                <a href={cls.link} target="_blank" rel="noopener noreferrer" className={cls.status === 'completed' ? 'pointer-events-none opacity-50' : ''}>
                  <Button variant={cls.status === 'live' ? 'danger' : 'outline'} className="w-full gap-2">
                    {cls.status === 'live' ? 'Join Studio' : 'Copy Link'}
                    <LinkIcon className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingClass ? "Edit Class" : "Schedule Live Class"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Class Title" 
            required 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Date" 
              type="date"
              required 
              value={formData.date} 
              onChange={e => setFormData({...formData, date: e.target.value})} 
            />
            <Input 
              label="Time" 
              type="time"
              required 
              value={formData.time} 
              onChange={e => setFormData({...formData, time: e.target.value})} 
            />
          </div>

          <Input 
            label="Meeting Link (Zoom/Meet)" 
            type="url"
            required 
            value={formData.link} 
            onChange={e => setFormData({...formData, link: e.target.value})} 
          />
          
          <Input 
            label="Batch ID (Optional)" 
            value={formData.batchId} 
            onChange={e => setFormData({...formData, batchId: e.target.value})} 
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select 
              className="flex h-11 w-full rounded-xl border border-white/40 bg-white/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 shadow-sm backdrop-blur-sm"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as 'scheduled' | 'live' | 'completed'})}
            >
              <option value="scheduled">Scheduled</option>
              <option value="live">Live Now</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingClass ? 'Save Changes' : 'Schedule Class'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
