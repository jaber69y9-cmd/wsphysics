import { showAlert, showConfirm } from '../utils/alert';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, User, Users, Filter } from 'lucide-react';

const Results = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'your' | 'full'>('your');
  
  // Filters
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [searchResult, setSearchResult] = useState<any | null>(null);

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
          setFilteredResults([]);
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

  const handleApplyFilters = () => {
    if (!selectedProgram && !selectedClass && !selectedBatch && !selectedExam && !selectedCategory) {
      showAlert('Please select at least one filter to view the full merit list.');
      return;
    }
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
    setFilteredResults(filtered);
    setSearchResult(null);
    setRollNumber('');
  };

  const handleSearchRoll = () => {
    if (!rollNumber) return;
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
    
    if (found) {
      // Calculate merit position if not present
      if (!found.merit_position) {
        const sameExamResults = results.filter(r => r.exam_id === found.exam_id);
        sameExamResults.sort((a, b) => parseFloat(b.marks || 0) - parseFloat(a.marks || 0));
        const meritIndex = sameExamResults.findIndex(r => r.id === found.id);
        found.calculated_merit = meritIndex !== -1 ? meritIndex + 1 : 'N/A';
      }
    }
    
    setSearchResult(found || null);
    if (!found) {
      showAlert('Result not found for this roll number with the selected filters.');
    }
  };

  // Get unique values for dropdowns
  const uniqueClasses = Array.from(new Set(batches.map(b => b.class || b.class_name || b.batch_class).filter(Boolean)));
  const uniqueBatches = batches;
  const uniqueExams = Array.from(new Set(exams.map(e => e.id).filter(Boolean))).map(id => {
    return exams.find(e => e.id === id);
  }).filter(Boolean);
  const uniqueCategories = Array.from(new Set(exams.map(e => e.category).filter(Boolean)));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border-t-4 border-orange-600 p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-orange-600 uppercase mb-2">Program</label>
              <select 
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-400 focus:outline-none appearance-none bg-slate-50 cursor-not-allowed"
                value=""
                disabled
              >
                <option value="">All Programs</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-orange-600 uppercase mb-2">Class</label>
              <select 
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:border-orange-500 appearance-none bg-white"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">All Classes</option>
                {uniqueClasses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-orange-600 uppercase mb-2">Batch</label>
              <select 
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:border-orange-500 appearance-none bg-white"
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
              >
                <option value="">Select Batch</option>
                {uniqueBatches.map(b => (
                  <option key={b.id} value={b.id}>{b.name || b.batch_name || 'Unknown Batch'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-orange-600 uppercase mb-2">Exam Type</label>
              <select 
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:border-orange-500 appearance-none bg-white"
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
              >
                <option value="">All Exams</option>
                {uniqueExams.map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.exam_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-orange-600 uppercase mb-2">Category</label>
              <select 
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:border-orange-500 appearance-none bg-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={handleApplyFilters}
                className="w-full bg-orange-600 text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              >
                <Filter className="h-4 w-4" /> APPLY FILTERS
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-8"
        >
          {/* Tabs */}
          <div className="flex bg-slate-50 rounded-lg p-1 mb-8">
            <button 
              onClick={() => setActiveTab('your')}
              className={`flex-1 py-3 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'your' ? 'bg-orange-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <User className="h-5 w-5" /> YOUR RESULT
            </button>
            <button 
              onClick={() => setActiveTab('full')}
              className={`flex-1 py-3 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'full' ? 'bg-orange-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Users className="h-5 w-5" /> FULL RESULT
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'your' && (
            <div className="max-w-sm mx-auto">
              <div className="flex gap-2 mb-8">
                <input 
                  type="text" 
                  placeholder="Roll number" 
                  className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchRoll()}
                />
                <button 
                  onClick={handleSearchRoll}
                  className="bg-orange-600 text-white px-5 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center shadow-md"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>

              {searchResult && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">{searchResult.student_name}</h3>
                  <p className="text-slate-500 mb-6">Roll: {searchResult.roll_number}</p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                      <div className="text-sm text-slate-500 font-bold mb-1">Obtained</div>
                      <div className="text-2xl font-black text-orange-600">{Number(searchResult.marks ?? 0).toFixed(2)}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                      <div className="text-sm text-slate-500 font-bold mb-1">Highest</div>
                      <div className="text-2xl font-black text-green-600">{Number(searchResult.highest_marks ?? searchResult.total_marks ?? 0).toFixed(2)}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                      <div className="text-sm text-slate-500 font-bold mb-1">Merit</div>
                      <div className="text-2xl font-black text-orange-600">#{searchResult.merit_position || searchResult.calculated_merit}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 col-span-3">
                      <div className="text-sm text-slate-500 font-bold mb-1">Monthly Fee</div>
                      <div className="text-2xl font-black text-slate-800">৳{searchResult.monthly_fee || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'full' && (
            <div>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-orange-600 text-white">
                      <th className="p-4 font-bold text-sm rounded-tl-lg">Roll</th>
                      <th className="p-4 font-bold text-sm">Name</th>
                      <th className="p-4 font-bold text-sm">Obtained Marks</th>
                      <th className="p-4 font-bold text-sm">Highest Marks</th>
                      <th className="p-4 font-bold text-sm rounded-tr-lg">Merit Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredResults.length > 0 ? (
                      filteredResults
                        .sort((a, b) => b.marks - a.marks)
                        .map((result, idx) => (
                        <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 text-slate-600">{result.roll_number}</td>
                          <td className="p-4 font-bold text-slate-800 uppercase">{result.student_name}</td>
                          <td className="p-4 text-slate-600">{Number(result.marks ?? 0).toFixed(2)}</td>
                          <td className="p-4 text-slate-600">{Number(result.highest_marks ?? result.total_marks ?? 0).toFixed(2)}</td>
                          <td className="p-4 font-bold text-slate-800">{result.merit_position || idx + 1}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          Please apply filters to view full results.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {filteredResults.length > 0 ? (
                  filteredResults
                    .sort((a, b) => b.marks - a.marks)
                    .map((result, idx) => (
                      <div key={result.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-800 text-lg uppercase">{result.student_name}</h4>
                            <p className="text-sm text-slate-500 font-mono">Roll: {result.roll_number}</p>
                          </div>
                          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold">
                            #{result.merit_position || idx + 1}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2 border-t border-slate-100 pt-3">
                          <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Obtained</p>
                            <p className="text-lg font-bold text-orange-600">{Number(result.marks ?? 0).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Highest</p>
                            <p className="text-lg font-bold text-green-600">{Number(result.highest_marks ?? result.total_marks ?? 0).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                    Please apply filters to view full results.
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
