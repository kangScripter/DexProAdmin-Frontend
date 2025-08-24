import React, { useEffect, useState } from 'react';
import { Briefcase, Clock, Users, TrendingUp, Plus, MapPin, Calendar, Eye, FileText, ArrowRight, Building2, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PostJobModal from '../components/PostJobModal';
import { getAllJobs } from '../Data/jobData';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const API_URL = import.meta.env.VITE_API_URL;

export default function CareerDashboard() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await getAllJobs();
        setRecentJobs(response || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setRecentJobs([]);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const response = await axios.get(`${API_URL}/applicant/get`);
        setRecentApplications(response.data || []);
      } catch (error) {
        console.error('Error fetching applicants:', error);
        setRecentApplications([]);
      }
    };
    fetchApplicants();
  }, []);

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

  const stats = [
    {
      title: "Total Jobs",
      value: recentJobs.length.toString(),
      icon: <Briefcase className="h-6 w-6 text-primary" />,
      iconBgColor: "bg-primary/10",
      description: "Active job postings"
    },
    {
      title: "Freelance Gigs",
      value: recentJobs.filter(job => job.type === 'freelance').length.toString(),
      icon: <Clock className="h-6 w-6 text-secondary" />,
      iconBgColor: "bg-secondary/10",
      description: "Freelance opportunities"
    },
    {
      title: "Total Applications",
      value: recentApplications.length.toString(),
      icon: <Users className="h-6 w-6 text-emerald-600" />,
      iconBgColor: "bg-emerald-100",
      description: "Job applications received"
    },
    {
      title: "This Month",
      value: "+12%",
      icon: <TrendingUp className="h-6 w-6 text-blue-600" />,
      iconBgColor: "bg-blue-100",
      description: "Growth in applications",
      isGrowth: true,
    },
  ];

  const StatCard = ({ item }) => {
    const valueStyle = item.isGrowth
      ? "text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full text-sm font-semibold"
      : "text-3xl font-bold text-gray-900";
    
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${item.iconBgColor} rounded-xl flex items-center justify-center`}>
              {item.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{item.title}</p>
              <p className={valueStyle}>{item.value}</p>
              <p className="text-xs text-gray-400 mt-1">{item.description}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      open: "bg-emerald-100 text-emerald-700",
      new: "bg-blue-100 text-blue-700",
      reviewed: "bg-amber-100 text-amber-700",
      closed: "bg-red-100 text-red-700",
    };
    return (
      <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    );
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
                    Career Dashboard
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">Monitor your job postings and applications at a glance</p>
                </div>
                <button
                  className="flex items-center gap-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  onClick={() => setShowModal(true)}
                >
                  <Plus size={20} />
                  Post New Job
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((item, idx) => <StatCard key={idx} item={item} />)}
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Building2 size={20} className="text-primary" />
                  Quick Actions
                </h2>
                <div className="space-y-4">
                  <button
                    onClick={() => navigate('/job-management')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-primary hover:text-white rounded-xl transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 group-hover:bg-white/20 rounded-lg flex items-center justify-center">
                        <Briefcase size={20} className="text-primary group-hover:text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 group-hover:text-white">Manage Jobs</p>
                        <p className="text-sm text-gray-500 group-hover:text-white/80">View and edit job postings</p>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-gray-400 group-hover:text-white" />
                  </button>

                  <button
                    onClick={() => navigate('/job-application')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-secondary hover:text-white rounded-xl transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary/10 group-hover:bg-white/20 rounded-lg flex items-center justify-center">
                        <UserCheck size={20} className="text-secondary group-hover:text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 group-hover:text-white">View Applications</p>
                        <p className="text-sm text-gray-500 group-hover:text-white/80">Review job applications</p>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-gray-400 group-hover:text-white" />
                  </button>

                  <button
                    onClick={() => navigate('/career-dashboard')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-emerald-600 hover:text-white rounded-xl transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 group-hover:bg-white/20 rounded-lg flex items-center justify-center">
                        <Eye size={20} className="text-emerald-600 group-hover:text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 group-hover:text-white">Dashboard Overview</p>
                        <p className="text-sm text-gray-500 group-hover:text-white/80">View detailed analytics</p>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-gray-400 group-hover:text-white" />
                  </button>
                </div>
              </div>

              {/* Recent Jobs */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText size={20} className="text-primary" />
                    Recent Jobs
                  </h2>
                  <button 
                    onClick={() => navigate('/job-management')} 
                    className="text-sm text-primary hover:text-secondary font-medium transition-colors"
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-4">
                  {recentJobs.length > 0 ? (
                    recentJobs
                      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                      .slice(0, 4)
                      .map((job, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-sm mb-2">{job.title}</h3>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                <MapPin size={12} />
                                {job.location || 'Location not specified'}
                              </div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getBadgeStyles(job.type)}`}>
                              {job.type?.replace('-', ' ') || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <StatusBadge status={job.status} />
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Calendar size={12} />
                              {new Date(job.created_at).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Briefcase className="text-gray-400" size={24} />
                      </div>
                      <p className="text-sm text-gray-500">No recent jobs posted yet.</p>
                      <p className="text-xs text-gray-400 mt-1">Start by posting your first job!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Applications */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users size={20} className="text-primary" />
                    Recent Applications
                  </h2>
                  <button 
                    onClick={() => navigate('/job-application')} 
                    className="text-sm text-primary hover:text-secondary font-medium transition-colors"
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-4">
                  {recentApplications.length > 0 ? (
                    recentApplications.slice(0, 4).map((app, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm mb-2">{app.name}</h3>
                            <p className="text-xs text-gray-500 mb-2">
                              {recentJobs.find(job => job._id === app.jobId)?.title || 'Job Title Not Found'}
                            </p>
                          </div>
                          <StatusBadge status={app.status} />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar size={12} />
                          {new Date(app.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="text-gray-400" size={24} />
                      </div>
                      <p className="text-sm text-gray-500">No recent applications found.</p>
                      <p className="text-xs text-gray-400 mt-1">Applications will appear here once received.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Job Modal */}
      {showModal && <PostJobModal onclose={() => setShowModal(false)} />}
    </div>
  );
}
