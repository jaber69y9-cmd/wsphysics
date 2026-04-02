import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Search, Plus, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

interface Student {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  type: 'online' | 'offline';
  batchId: string;
  programId: string;
  joinedAt: string;
}

export function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'online' as 'online' | 'offline',
    batchId: '',
    programId: ''
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'student'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await updateDoc(doc(db, 'users', editingStudent.id), formData);
      } else {
        await addDoc(collection(db, 'users'), {
          ...formData,
          role: 'student',
          uid: 'temp_' + Date.now(), // In a real app, this would link to Auth UID
          joinedAt: new Date().toISOString()
        });
      }
      setIsModalOpen(false);
      setEditingStudent(null);
      setFormData({ name: '', email: '', phone: '', type: 'online', batchId: '', programId: '' });
    } catch (error) {
      console.error("Error saving student:", error);
    }
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;
    try {
      await deleteDoc(doc(db, 'users', studentToDelete));
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  const openDeleteModal = (id: string) => {
    setStudentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      type: student.type,
      batchId: student.batchId || '',
      programId: student.programId || ''
    });
    setIsModalOpen(true);
  };

  const filteredStudents = students.filter(s => 
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Management</h1>
          <p className="text-slate-500 mt-2">Manage online and offline students, track attendance and payments.</p>
        </div>
        <Button onClick={() => { setEditingStudent(null); setIsModalOpen(true); }} className="gap-2">
          <Plus className="w-5 h-5" /> Add Student
        </Button>
      </div>

      <GlassCard className="p-4 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            placeholder="Search students by name or email..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Filter</Button>
          <Button variant="outline" size="sm">Export</Button>
        </div>
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200/60">
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Loading students...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No students found.</td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                          {(student.name || 'S').charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{student.name}</p>
                          <p className="text-xs text-slate-500">{student.programId || 'No Program'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-slate-900">{student.email}</p>
                      <p className="text-xs text-slate-500">{student.phone || 'N/A'}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
                        student.type === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {student.type}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {student.joinedAt ? format(new Date(student.joinedAt), 'MMM dd, yyyy') : 'N/A'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(student)} className="p-2 text-slate-400 hover:text-orange-600 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => openDeleteModal(student.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingStudent ? "Edit Student" : "Add New Student"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Full Name" 
            required 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
          />
          <Input 
            label="Email Address" 
            type="email" 
            required 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
          />
          <Input 
            label="Phone Number" 
            value={formData.phone} 
            onChange={e => setFormData({...formData, phone: e.target.value})} 
          />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Student Type</label>
            <select 
              className="flex h-11 w-full rounded-xl border border-white/40 bg-white/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 shadow-sm backdrop-blur-sm"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value as 'online' | 'offline'})}
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Batch ID" 
              value={formData.batchId} 
              onChange={e => setFormData({...formData, batchId: e.target.value})} 
            />
            <Input 
              label="Program ID" 
              value={formData.programId} 
              onChange={e => setFormData({...formData, programId: e.target.value})} 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingStudent ? 'Save Changes' : 'Add Student'}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-6">
          <p className="text-slate-600">Are you sure you want to delete this student? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete Student</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
