import LoadingSpinner from '../components/LoadingSpinner';
import { showAlert, showConfirm } from '../utils/alert';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, User, Users, Filter, Award, Trophy, Star } from 'lucide-react';

const Results = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'your' | 'full'>('your');
  
  // Filters
  const [selectedProgram, setSelectedProgram] = useState(() => localStorage.getItem('results_program') || '');
  const [selectedClass, setSelectedClass] = useState(() => localStorage.getItem('results_class') || '');
  const [selectedBatch, setSelectedBatch] = useState(() => localStorage.getItem('results_batch') || '');
  const [selectedExam, setSelectedExam] = useState(() => localStorage.getItem('results_exam') || '');
  const [selectedCategory, setSelectedCategory] = useState(() => localStorage.getItem('results_category') || '');
  const [rollNumber, setRollNumber] = useState('');

  useEffect(() => {
    localStorage.setItem('results_program', selectedProgram);
    localStorage.setItem('results_class', selectedClass);
    localStorage.setItem('results_batch', selectedBatch);
    localStorage.setItem('results_exam', selectedExam);
    localStorage.setItem('results_category', selectedCategory);
  }, [selectedProgram, selectedClass, selectedBatch, selectedExam, selectedCategory]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examsRes, resultsRes, programsRes, batchesRes] = await Promise.all([
          fetch('/api/public/exams'),
          fetch('/api/public/results'),
          fetch('/api/programs'),
          fetch('/api/batches')
        ]);
        if (examsRes.ok) {
          const examsData = await examsRes.json();
          setExams(Array.isArray(examsData) ? examsData : []);
        }
        if (resultsRes.ok) {
          const resultsData = await resultsRes.json();
          setResults(Array.isArray(resultsData) ? resultsData : []);
        }
        if (programsRes.ok) {
          const programsData = await programsRes.json();
          setPrograms(Array.isArray(programsData) ? programsData : []);
        }
        if (batchesRes.ok) {
          const batchesData = await batchesRes.json();
          setBatches(Array.isArray(batchesData) ? batchesData : []);
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredResults = useMemo(() => {
    if (activeTab === 'your') return [];
    
    let filtered = results;
    if (selectedProgram) {
      filtered = filtered.filter(r => r.program_id?.toString() === selectedProgram);
    }
    if (selectedClass) {
      filtered = filtered.filter(r => r.student_class === selectedClass);
    }
    if (selectedBatch) {
      filtered = filtered.filter(r => r.batch_id?.toString() === selectedBatch);
    }
    if (selectedExam) {
      filtered = filtered.filter(r => r.exam_id?.toString() === selectedExam);
    }
    if (selectedCategory) {
      filtered = filtered.filter(r => r.exam_category === selectedCategory);
    }
    
    // Add roll number search for full results too
    if (rollNumber && activeTab === 'full') {
      filtered = filtered.filter(r => r.roll_number?.toString().includes(rollNumber));
    }
    
    return filtered.sort((a, b) => (Number(b.marks) || 0) - (Number(a.marks) || 0));
  }, [results, selectedProgram, selectedClass, selectedBatch, selectedExam, selectedCategory, rollNumber, activeTab]);

  const searchResult = useMemo(() => {
    if (activeTab !== 'your' || !rollNumber) return null;
    
    let filtered = results;
    if (selectedProgram) {
      filtered = filtered.filter(r => r.program_id?.toString() === selectedProgram);
    }
    if (selectedClass) {
      filtered = filtered.filter(r => r.student_class === selectedClass);
    }
    if (selectedBatch) {
      filtered = filtered.filter(r => r.batch_id?.toString() === selectedBatch);
    }
    if (selectedExam) {
      filtered = filtered.filter(r => r.exam_id?.toString() === selectedExam);
    }
    if (selectedCategory) {
      filtered = filtered.filter(r => r.exam_category === selectedCategory);
    }
    
    const searchRoll = rollNumber.trim();
    const found = filtered.find(r => r.roll_number?.toString().trim() === searchRoll);
    
    if (found && !found.merit_position) {
      const sameExamResults = results.filter(r => r.exam_id === found.exam_id);
      sameExamResults.sort((a, b) => (Number(b.marks) || 0) - (Number(a.marks) || 0));
      const meritIndex = sameExamResults.findIndex(r => r.id === found.id);
      found.calculated_merit = meritIndex !== -1 ? meritIndex + 1 : 'N/A';
    }
    
    return found || null;
  }, [results, selectedProgram, selectedClass, selectedBatch, selectedExam, selectedCategory, rollNumber, activeTab]);

  const handleApplyFilters = () => {
    if (!selectedProgram || !selectedBatch || !selectedExam) {
      showAlert('Please select Program, Batch, and Exam to view the full merit list.');
      return;
    }
    setActiveTab('full');
  };

  const handleSearchRoll = () => {
    if (!rollNumber) return;
    if (!selectedProgram || !selectedBatch || !selectedExam) {
      showAlert('Please select Program, Batch, and Exam before searching your roll number.');
      return;
    }
    setActiveTab('your');
  };

  // Get unique values for dropdowns
  const uniqueClasses = Array.from(new Set(batches.map(b => b.class || b.class_name || b.batch_class).filter(Boolean)));
  
  let uniqueBatches = batches;
  if (selectedProgram) {
    uniqueBatches = uniqueBatches.filter(b => b.program_id?.toString() === selectedProgram);
  }
  if (selectedClass) {
    uniqueBatches = uniqueBatches.filter(b => (b.class || b.class_name || b.batch_class) === selectedClass);
  }

  let uniqueExams = Array.from(new Set(exams.map(e => e.id).filter(Boolean))).map(id => {
    return exams.find(e => e.id === id);
  }).filter(Boolean);
  
  if (selectedBatch) {
    uniqueExams = uniqueExams.filter(e => e.batch_id?.toString() === selectedBatch);
  }

  const uniqueCategories = Array.from(new Set(exams.map(e => e.category).filter(Boolean)));

  return (
    <div className="min-h-screen pt-12 pb-20 px-4 sm:px-6 lg:px-8 bg-[#F4F6F9]">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="section-title">Exam Results</h1>
          <p className="section-subtitle">
            Check your performance and merit position.
          </p>
        </motion.div>
        
        {/* Filters Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="glass-card p-8 relative overflow-hidden group"
        >
          {/* Newton's Apple Decoration */}
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <motion.div
              animate={{ y: [0, 100, 0], rotate: [0, 15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-12 h-12 bg-red-500 rounded-full relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-1 h-3 bg-green-800 rounded-full" />
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative group"
            >
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Program</label>
              <div className="relative">
                <select 
                  className="w-full bg-white/50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold appearance-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                >
                  <option value="">All Programs</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.title || p.name || p.program_name || 'Unknown Program'}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Filter className="h-4 w-4" />
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative group"
            >
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Class</label>
              <div className="relative">
                <select 
                  className="w-full bg-white/50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold appearance-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">All Classes</option>
                  {uniqueClasses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Users className="h-4 w-4" />
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative group"
            >
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Batch</label>
              <div className="relative">
                <select 
                  className="w-full bg-white/50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold appearance-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                >
                  <option value="">Select Batch</option>
                  {uniqueBatches.map(b => (
                    <option key={b.id} value={b.id}>{b.name || b.batch_name || 'Unknown Batch'}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Trophy className="h-4 w-4" />
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative group"
            >
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Exam Type</label>
              <div className="relative">
                <select 
                  className="w-full bg-white/50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold appearance-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                >
                  <option value="">All Exams</option>
                  {uniqueExams.map(exam => (
                    <option key={exam.id} value={exam.id}>{exam.exam_name}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Award className="h-4 w-4" />
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative group"
            >
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Category</label>
              <div className="relative">
                <select 
                  className="w-full bg-white/50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold appearance-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Star className="h-4 w-4" />
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-end"
            >
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApplyFilters}
                className="glass-btn w-full"
              >
                <Filter className="h-4 w-4" /> APPLY FILTERS
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Results Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 md:p-12 relative overflow-hidden"
        >
          {/* Background Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500/5 rounded-full blur-[100px] -ml-48 -mb-48"></div>

          {/* Tabs */}
          <div className="flex bg-slate-100/50 backdrop-blur-md rounded-2xl p-1.5 mb-10 relative z-10 border border-white/40">
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('your')}
              className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${activeTab === 'your' ? 'bg-orange-600 text-white shadow-xl shadow-orange-900/20' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
            >
              <User className="h-5 w-5" /> YOUR RESULT
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('full')}
              className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${activeTab === 'full' ? 'bg-orange-600 text-white shadow-xl shadow-orange-900/20' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
            >
              <Users className="h-5 w-5" /> FULL RESULT
            </motion.button>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-12 relative z-10">
            <div className="flex gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  type="number" 
                  placeholder={activeTab === 'your' ? "Enter Roll Number" : "Search in Merit List..."}
                  className="glass-input pl-14 py-4 text-lg font-bold"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (activeTab === 'your' ? handleSearchRoll() : {})}
                />
              </div>
              {activeTab === 'your' && (
                <motion.button 
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSearchRoll}
                  className="glass-btn px-8 py-4 flex items-center gap-2"
                >
                  <Search className="h-5 w-5" /> SEARCH
                </motion.button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          {loading ? (
            <div className="space-y-6 relative z-10">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/60 animate-pulse flex items-center px-6 gap-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded-full w-1/3"></div>
                    <div className="h-3 bg-slate-200 rounded-full w-1/4"></div>
                  </div>
                  <div className="w-24 h-8 bg-slate-200 rounded-full"></div>
                </div>
              ))}
            </div>
          ) : activeTab === 'your' ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto relative z-10"
            >
              <AnimatePresence mode="wait">
                {searchResult ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="glass p-12 text-center relative overflow-hidden rounded-[40px] border border-white/60 shadow-2xl"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                      className="w-28 h-28 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-2xl rotate-3"
                    >
                      <Trophy className="h-12 w-12 text-white" />
                    </motion.div>

                    <h3 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tight leading-none">{searchResult.student_name}</h3>
                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-slate-100/80 backdrop-blur-sm rounded-full text-slate-500 font-black text-[10px] uppercase tracking-widest mb-10 border border-slate-200">
                      <Award className="h-3 w-3 text-orange-500" /> ROLL: {searchResult.roll_number}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6">
                      <motion.div 
                        whileHover={{ y: -8, scale: 1.05 }}
                        className="glass p-6 rounded-3xl border border-white/60 shadow-lg bg-white/40"
                      >
                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2">Obtained</div>
                        <div className="text-2xl font-black text-orange-600 leading-none">{Number(searchResult.marks ?? 0).toFixed(2)}</div>
                      </motion.div>
                      <motion.div 
                        whileHover={{ y: -8, scale: 1.05 }}
                        className="glass p-6 rounded-3xl border border-white/60 shadow-lg bg-white/40"
                      >
                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2">Highest</div>
                        <div className="text-2xl font-black text-emerald-600 leading-none">{Number(searchResult.highest_marks ?? searchResult.total_marks ?? 0).toFixed(2)}</div>
                      </motion.div>
                      <motion.div 
                        whileHover={{ y: -8, scale: 1.05 }}
                        className="glass p-6 rounded-3xl border border-white/60 shadow-lg bg-white/40"
                      >
                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2">Merit</div>
                        <div className="text-2xl font-black text-orange-600 leading-none">#{searchResult.merit_position || searchResult.calculated_merit}</div>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : rollNumber && !loading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center p-12 glass rounded-[40px] border border-white/60"
                  >
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">Result Not Found</h3>
                    <p className="text-slate-500 text-sm font-medium">Please double check the roll number and filters.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="relative z-10">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-hidden rounded-[32px] border border-white/60 shadow-2xl glass">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-orange-600 text-white">
                      <th className="p-6 font-black text-[10px] uppercase tracking-widest">Roll</th>
                      <th className="p-6 font-black text-[10px] uppercase tracking-widest">Name</th>
                      <th className="p-6 font-black text-[10px] uppercase tracking-widest">Obtained Marks</th>
                      <th className="p-6 font-black text-[10px] uppercase tracking-widest">Highest Marks</th>
                      <th className="p-6 font-black text-[10px] uppercase tracking-widest">Merit Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20">
                    {filteredResults.length > 0 ? (
                      filteredResults
                        .sort((a, b) => b.marks - a.marks)
                        .map((result, idx) => (
                        <tr key={result.id} className="hover:bg-white/40 transition-colors group">
                          <td className="p-6 text-slate-600 font-bold">{result.roll_number}</td>
                          <td className="p-6 font-black text-slate-900 uppercase tracking-tight group-hover:text-orange-600 transition-colors">{result.student_name}</td>
                          <td className="p-6 text-slate-600 font-bold">{Number(result.marks ?? 0).toFixed(2)}</td>
                          <td className="p-6 text-slate-600 font-bold">{Number(result.highest_marks ?? result.total_marks ?? 0).toFixed(2)}</td>
                          <td className="p-6">
                            <span className="inline-flex items-center justify-center w-10 h-10 bg-orange-100 text-orange-600 rounded-xl font-black text-sm shadow-sm">
                              #{result.merit_position || idx + 1}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-20 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-6 bg-slate-100 rounded-full">
                              <Filter className="h-10 w-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800">No Results to Display</h3>
                            <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto">Please select Program, Batch, and Exam to view the full merit list.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-6">
                {filteredResults.length > 0 ? (
                  filteredResults
                    .sort((a, b) => b.marks - a.marks)
                    .map((result, idx) => (
                      <div key={result.id} className="glass p-8 rounded-[32px] border border-white/60 shadow-xl flex flex-col gap-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="flex justify-between items-start relative z-10">
                          <div>
                            <h4 className="font-black text-slate-900 text-2xl uppercase tracking-tight leading-none mb-2">{result.student_name}</h4>
                            <div className="inline-block px-3 py-1 bg-slate-100 rounded-full text-slate-500 font-black text-[9px] uppercase tracking-widest">
                              Roll: {result.roll_number}
                            </div>
                          </div>
                          <div className="w-12 h-12 bg-orange-600 text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-lg shadow-orange-900/20">
                            #{result.merit_position || idx + 1}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-2 border-t border-slate-100 pt-6 relative z-10">
                          <div className="bg-white/40 p-4 rounded-2xl border border-white/60">
                            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Obtained</p>
                            <p className="text-xl font-black text-orange-600 leading-none">{Number(result.marks ?? 0).toFixed(2)}</p>
                          </div>
                          <div className="bg-white/40 p-4 rounded-2xl border border-white/60">
                            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Highest</p>
                            <p className="text-xl font-black text-emerald-600 leading-none">{Number(result.highest_marks ?? result.total_marks ?? 0).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-16 text-center glass rounded-[40px] border border-white/60">
                    <div className="p-6 bg-slate-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                      <Filter className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800">No Results</h3>
                    <p className="text-slate-500 text-sm font-medium mt-2">Apply filters to view results.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Results;
