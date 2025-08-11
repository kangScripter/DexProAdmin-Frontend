import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { Search, Eye, Download, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const API_URL = import.meta.env.VITE_API_URL;


const formatDate = (dateString) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const StatusBadge = ({ status }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full inline-block";
  const statusClasses = {
    new: "bg-blue-100 text-blue-800",
    reviewed: "bg-yellow-100 text-yellow-800",
    shortlisted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    interviewed: "bg-purple-100 text-purple-800",
  };
  const key = status?.toLowerCase();
  return <span className={`${baseClasses} ${statusClasses[key] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
};

const getResumeURL = (filename) => `${API_URL}/applicant/download/${filename}`;

function JobApplication() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);

  const filters = ['all', 'new', 'reviewed', 'shortlisted', 'rejected', 'interviewed'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/applicant/get`);
        setRecentApplications(response.data || []);
      } catch (error) {
        console.error('Error fetching applicants:', error);
        setRecentApplications([]);
      }
    };
    fetchData();
  }, []);

  const filteredApplicants = useMemo(() => {
    return recentApplications
      .filter(applicant =>
        activeFilter === 'all' ||
        applicant.status?.toLowerCase() === activeFilter
      )
      .filter(applicant => {
        const search = searchTerm.toLowerCase();
        return (
          applicant.name?.toLowerCase().includes(search) ||
          applicant.email?.toLowerCase().includes(search) ||
          applicant.job?.toLowerCase().includes(search)
        );
      });
  }, [searchTerm, activeFilter, recentApplications]);

  return (
    <div className="bg-slate-50 min-h-screen font-sans p-4 sm:p-6 lg:p-8">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-screen w-64 bg-white shadow-lg z-50">
        <Sidebar />
      </div>

      <div className="max-w-7xl mx-auto pl-64">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Applications</h1>
          <p className="text-slate-500 mt-1">Review and manage job applications</p>
        </header>

        <main className="bg-white p-6 rounded-lg shadow-sm">
          {/* Search & Filters */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="relative w-full sm:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search applicants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-2 py-2 border border-slate-300 rounded-md focus:border-[#140228] transition"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-10 bg-slate-100 p-1 rounded-md overflow-x-auto">
              {filters.map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                    activeFilter === filter
                      ? 'bg-[#140228] text-white shadow'
                      : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-3">Applicant</th>
                  <th className="px-6 py-3">Job</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Applied</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplicants.map((applicant) => (
                  <tr
                    key={applicant.id}
                    className="bg-white border-b hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{applicant.name}</div>
                      <div className="text-slate-500">{applicant.email}</div>
                    </td>
                    <td className="px-6 py-4">{applicant.job}</td>
                    <td className="px-6 py-4">
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        value={applicant.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          try {
                            await axios.patch(`${API_URL}/applicant/update/${applicant.id}`, {
                              status: newStatus,
                            });
                            setRecentApplications(prev =>
                              prev.map(a =>
                                a.id === applicant.id ? { ...a, status: newStatus } : a
                              )
                            );
                          } catch (err) {
                            console.error('Status update failed:', err);
                            alert('Failed to update status.');
                          }
                        }}
                      >
                        {filters
                          .filter(f => f !== 'all')
                          .map(f => (
                            <option key={f} value={f.charAt(0).toUpperCase() + f.slice(1)}>
                              {f.charAt(0).toUpperCase() + f.slice(1)}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">{formatDate(applicant.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <button
                          className="text-slate-500 hover:text-blue-600"
                          onClick={() => setSelectedApplicant(applicant)}
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <a
                          href={getResumeURL(applicant.resume_pdf)}
                          download
                          className="text-slate-500 hover:text-blue-600"
                        >
                          <Download className="h-5 w-5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredApplicants.length === 0 && (
              <div className="text-center py-10 text-slate-500">No applicants found.</div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedApplicant(null)}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-semibold text-slate-800 mb-6">Application Details</h2>

            <div className="mb-4">
              <p className="text-sm text-slate-500">Name</p>
              <p className="text-base text-slate-800 font-medium">{selectedApplicant.name}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-slate-500">Email</p>
              <p className="text-base text-slate-800">{selectedApplicant.email}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-slate-500">Phone</p>
              <p className="text-base text-slate-800">{selectedApplicant.phone || 'N/A'}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-slate-500">Applied For</p>
              <p className="text-base text-slate-800">{selectedApplicant.job}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-slate-500">Date Applied</p>
              <p className="text-base text-slate-800">{formatDate(selectedApplicant.created_at)}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-slate-500 mb-1">Cover Letter</p>
              <div className="bg-slate-50 p-3 rounded-md text-slate-700 text-sm whitespace-pre-line">
                {selectedApplicant.cover_letter || 'N/A'}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-slate-500 mb-1">Status</p>
              <StatusBadge status={selectedApplicant.status} />
            </div>

            <a
              href={getResumeURL(selectedApplicant.resume_pdf)}
              download
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#140228] hover:bg-[#20033d] text-white font-medium rounded-md transition"
            >
              <Download className="w-4 h-4" />
              Download Resume
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobApplication;
