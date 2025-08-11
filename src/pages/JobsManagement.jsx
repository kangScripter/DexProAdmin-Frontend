import React, { useEffect, useState } from 'react';
import { Plus, Eye, Pencil, Trash2, X } from 'lucide-react';
import { getAllJobs, deleteJob, updateJobStatus } from '../Data/jobData';
import PostJobModal from '../components/PostJobModal';
import Sidebar from '../components/Sidebar';

const getBadgeStyles = (text) => {
  const normalized = text?.toLowerCase().replace('-', ' ');
  switch (normalized) {
    case 'full time':
      return 'bg-blue-100 text-blue-800';
    case 'freelance':
      return 'bg-purple-100 text-purple-800';
    case 'part time':
      return 'bg-yellow-100 text-yellow-800';
    case 'open':
      return 'bg-green-100 text-green-800';
    case 'closed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const JobDetailsModal = ({ job, onClose }) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-red-600"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-2">{job.title}</h2>
        <p className="text-sm text-gray-500 mb-4">
          {job.location} • {job.type?.toUpperCase()} • {job.status?.toUpperCase()}
        </p>

        <div className="mb-4">
          <h3 className="font-semibold mb-1">Description:</h3>
          <p className="text-gray-700 text-sm">{job.description}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-1">Skills Required:</h3>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {job.skills?.map((skill, index) => <li key={index}>{skill}</li>)}
          </ul>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-1">Requirements:</h3>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {job.requirements?.map((req, index) => <li key={index}>{req}</li>)}
          </ul>
        </div>

        <div>
          <p><span className="font-semibold">Compensation:</span> {job.compensation || 'N/A'}</p>
          <p><span className="font-semibold">Posted On:</span> {new Date(job.created_at).toLocaleDateString()}</p>
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
    try {
      await deleteJob(jobId);
      setJobsData((prev) => prev.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error('Failed to delete job:', error);
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
    const type = job.type?.toLowerCase().replace('-', ' ');
    const status = job.status?.toLowerCase();
    const selected = selectedFilter.toLowerCase();

    if (selected === 'all jobs') return true;
    if (['open', 'closed'].includes(selected)) return status === selected;
    if (['full time', 'part time', 'freelance'].includes(selected)) return type === selected;

    return true;
  });

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-8 font-sans">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-screen w-64 bg-white shadow-lg z-50">
        <Sidebar />
      </div>

      <div className="pl-64 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Jobs Management</h1>
            <p className="text-gray-500 mt-1">Manage all job postings and freelance gigs</p>
          </div>
          <button
            className="flex items-center justify-center gap-2 bg-[#140228] hover:bg-[#20033d] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            onClick={() => {
              setShowModal(true);
              setEditJob(null);
            }}
          >
            <Plus size={20} />
            Post New Job
          </button>
        </div>

        <div className="bg-white p-2 rounded-lg shadow-sm mb-6 flex items-center gap-2 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`py-2 px-4 rounded-md cursor-pointer text-sm font-medium transition-colors whitespace-nowrap ${
                selectedFilter === filter
                  ? 'bg-[#140228] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-5 md:grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-xs text-gray-500 uppercase font-semibold min-w-[700px]">
              <div className="md:col-span-4">Job</div>
              <div className="md:col-span-2">Type</div>
              <div className="md:col-span-2">Status</div>
              <div className="md:col-span-2">Date Posted</div>
              <div className="md:col-span-2 text-right">Actions</div>
            </div>

            <div className="min-w-[700px]">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-5 md:grid-cols-12 gap-4 items-center p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <div className="md:col-span-4">
                      <p className="font-semibold text-gray-800">{job.title || 'Untitled Job'}</p>
                      <p className="text-sm text-gray-500">{job.location || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getBadgeStyles(
                          job.type
                        )}`}
                      >
                        {job.type?.replace('-', ' ') || 'N/A'}
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <select
                        value={job.status}
                        onChange={(e) => handleStatusChange(job.id, e.target.value)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer ${getBadgeStyles(
                          job.status
                        )}`}
                      >
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 text-sm text-gray-600">
                      <p className="text-sm text-gray-400">
                        {job.created_at
                          ? new Date(job.created_at).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="md:col-span-2 flex justify-end items-center gap-4 text-gray-500">
                      <button
                        className="hover:text-blue-600 transition-colors"
                        onClick={() => setSelectedJob(job)}
                        aria-label="View job details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="hover:text-green-600 transition-colors"
                        onClick={() => {
                          setEditJob(job);
                          setShowModal(true);
                        }}
                        aria-label="Edit job"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        className="hover:text-red-600 transition-colors"
                        onClick={() => handleDelete(job.id)}
                        aria-label="Delete job"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">No jobs found for selected filter.</div>
              )}
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

