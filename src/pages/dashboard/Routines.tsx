import { safeJson } from '../../utils/api';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, Download, Trash2 } from 'lucide-react';
import { showConfirm } from '../../utils/alert';

const Routines = () => {
  const { token, user } = useAuth();
  const [routines, setRoutines] = useState<any[]>([]);

  useEffect(() => {
    fetchRoutines();
  }, [token]);

  const fetchRoutines = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/routines', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await safeJson(res);
        const allRoutines = Array.isArray(data) ? data : [];
        // Filter routines for the student's batch or 'all'
        const filteredRoutines = user?.role === 'admin' 
          ? allRoutines 
          : allRoutines.filter(r => r.batch_id === 'all' || r.batch_id === user?.batch_id);
        setRoutines(filteredRoutines);
      } else {
        setRoutines([]);
      }
    } catch (error) {
      console.error('Failed to fetch routines:', error);
      setRoutines([]);
    }
  };

  const handleDelete = async (id: string) => {
    if (await showConfirm('Are you sure you want to delete this routine?')) {
      const res = await fetch(`/api/routines/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchRoutines();
      }
    }
  };

  const downloadRoutine = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'routine.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Class Routines</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {routines.map((routine) => (
          <div key={routine.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {routine.image_url && (
              <div className="h-48 overflow-hidden bg-slate-100 relative group">
                <img src={routine.image_url} alt="Routine" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => downloadRoutine(routine.image_url)}
                    className="p-2 bg-white/80 rounded-full"
                    title="Download Routine"
                  >
                    <Download className="h-5 w-5 text-green-600" />
                  </button>
                  {user?.role === 'admin' && (
                    <button 
                      onClick={() => handleDelete(routine.id)}
                      className="p-2 bg-white/80 rounded-full"
                      title="Delete Routine"
                    >
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                <Clock className="h-4 w-4" />
                <span>Posted on {new Date(routine.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap">{routine.content}</p>
            </div>
          </div>
        ))}
        
        {routines.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            No routines published yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Routines;
