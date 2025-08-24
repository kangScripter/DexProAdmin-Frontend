import React, { useEffect, useState } from 'react';
import { Plus, Eye, Pencil, Trash2, X, Search, Filter, Calendar, MapPin, Users, TrendingUp } from 'lucide-react';
import { getAllJobs, deleteJob, updateJobStatus } from '../Data/jobData';
import PostJobModal from '../components/PostJobModal';
import Sidebar from '../components/Sidebar';

const getBadgeStyles = (text) => {
  const normalized = text?.toLowerCase().replace('-', ' ');
  switch (normalized) {
    case 'full time':
      return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg';
    case 'freelance':
      return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg';
    case 'part time':
      return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg';
    case 'open':
      return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg';
    case 'closed':
      return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg';
    default:
      return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg';
  }
};

const JobDetailsModal = ({ job, onClose }) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative animate-in slide-in-from-bottom-4 duration-300">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-2xl">
          <button
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  {job.location || 'Remote'}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  {new Date(job.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex gap-3">
            <span className={`px-4 py-2 text-sm font-semibold rounded-full ${getBadgeStyles(job.type)}`}>
              {job.type?.replace('-', ' ') || 'N/A'}
            </span>
            <span className={`px-4 py-2 text-sm font-semibold rounded-full ${getBadgeStyles(job.status)}`}>
              {job.status?.toUpperCase() || 'N/A'}
            </span>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <TrendingUp size={18} />
              Description
            </h3>
            <p className="text-gray-700 leading-relaxed">{job.description}</p>
          </div>

          {job.skills && job.skills.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Requirements</h3>
              <ul className="space-y-2">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Compensation</p>
              <p className="font-semibold text-gray-900">{job.compensation || 'Not specified'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Posted On</p>
              <p className="font-semibold text-gray-900">{new Date(job.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const JobsManagement = () => {
  const [jobsData, setJobsData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('All Jobs');
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await getAllJobs();
        setJobsData(response || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setJobsData([]);
      }
    };
    getData();
  }, []);

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(jobId);
        setJobsData((prev) => prev.filter((job) => job.id !== jobId));
      } catch (error) {
        console.error('Failed to delete job:', error);
      }
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await updateJobStatus(jobId, newStatus);
      setJobsData((prev) =>
        prev.map((job) => (job.id === jobId ? { ...job, status: newStatus } : job))
      );
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const filters = ['All Jobs', 'Open', 'Closed', 'Full time', 'Part time', 'Freelance'];

  const filteredJobs = jobsData.filter((job) => {
    if (!job) return false;
    
    // Search filter
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (searchTerm && !matchesSearch) return false;
    
    // Category filter
    const type = job.type?.toLowerCase().replace('-', ' ');
    const status = job.status?.toLowerCase();
    const selected = selectedFilter.toLowerCase();

    if (selected === 'all jobs') return true;
    if (['open', 'closed'].includes(selected)) return status === selected;
    if (['full time', 'part time', 'freelance'].includes(selected)) return type === selected;

    return true;
  });

  const stats = {
    total: jobsData.length,
    open: jobsData.filter(job => job.status === 'open').length,
    closed: jobsData.filter(job => job.status === 'closed').length,
    fullTime: jobsData.filter(job => job.type === 'full-time').length
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen font-sans">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-screen w-64 bg-white shadow-xl z-50">
        <Sidebar />
      </div>

      <div className="pl-64">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Jobs Management
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">Manage all job postings and freelance opportunities</p>
                </div>
                <button
                  className="flex items-center gap-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  onClick={() => {
                    setShowModal(true);
                    setEditJob(null);
                  }}
                >
                  <Plus size={20} />
                  Post New Job
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Jobs</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Users className="text-primary" size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Open Positions</p>
                      <p className="text-2xl font-bold text-emerald-600">{stats.open}</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="text-emerald-600" size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Closed</p>
                      <p className="text-2xl font-bold text-red-600">{stats.closed}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <X className="text-red-600" size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Full Time</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.fullTime}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Calendar className="text-blue-600" size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search jobs by title, location, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                {/* Filter Buttons */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
                  <Filter className="text-gray-400" size={20} />
                  {filters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        selectedFilter === filter
                          ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Jobs Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <div className="grid grid-cols-12 gap-4 p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 text-sm text-gray-600 font-semibold min-w-[900px]">
                  <div className="col-span-4">Job Details</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Posted</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                <div className="min-w-[900px]">
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map((job, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-4 items-center p-6 border-b border-gray-100 last:border-b-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group"
                      >
                        <div className="col-span-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Users className="text-white" size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                {job.title || 'Untitled Job'}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <MapPin size={14} />
                                {job.location || 'Remote'}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-span-2">
                          <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getBadgeStyles(job.type)}`}>
                            {job.type?.replace('-', ' ') || 'N/A'}
                          </span>
                        </div>
                        
                        <div className="col-span-2">
                          <select
                            value={job.status}
                            onChange={(e) => handleStatusChange(job.id, e.target.value)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full cursor-pointer border-0 focus:ring-2 focus:ring-primary transition-all duration-200 ${getBadgeStyles(job.status)}`}
                          >
                            <option value="open">Open</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                        
                        <div className="col-span-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} />
                            {job.created_at
                              ? new Date(job.created_at).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : 'N/A'}
                          </div>
                        </div>
                        
                        <div className="col-span-2 flex justify-end items-center gap-3">
                          <button
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            onClick={() => setSelectedJob(job)}
                            aria-label="View job details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                            onClick={() => {
                              setEditJob(job);
                              setShowModal(true);
                            }}
                            aria-label="Edit job"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            onClick={() => handleDelete(job.id)}
                            aria-label="Delete job"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="text-gray-400" size={24} />
                      </div>
                      <p className="text-gray-500 text-lg">No jobs found for the selected criteria.</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post/Edit Modal */}
      {showModal && (
        <PostJobModal
          onclose={() => {
            setShowModal(false);
            setEditJob(null);
          }}
          jobToEdit={editJob}
        />
      )}

      {/* View Details Modal */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
};

export default JobsManagement;

