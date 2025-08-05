import React, { useEffect, useState } from 'react';
import { Briefcase, Clock, Users, TrendingUp, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PostJobModal from '../components/PostJobModal';
import { getAllJobs } from '../Data/jobData';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

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
        const response = await axios.get('http://localhost:3000/applicant/get');
        setRecentApplications(response.data || []);
      } catch (error) {
        console.error('Error fetching applicants:', error);
        setRecentApplications([]);
      }
    };
    fetchApplicants();
  }, []);

  const stats = [
    {
      title: "Total Jobs",
      value: recentJobs.length.toString(),
      icon: <Briefcase className="h-6 w-6 text-blue-600" />,
      iconBgColor: "bg-blue-100",
    },
    {
      title: "Freelance Gigs",
      value: recentJobs.filter(job => job.jobType === 'freelance').length.toString(),
      icon: <Clock className="h-6 w-6 text-purple-600" />,
      iconBgColor: "bg-purple-100",
    },
    {
      title: "Total Applications",
      value: recentApplications.length.toString(),
      icon: <Users className="h-6 w-6 text-green-600" />,
      iconBgColor: "bg-green-100",
    },
    {
      title: "This Month",
      value: "+12%",
      icon: <TrendingUp className="h-6 w-6 text-indigo-600" />,
      iconBgColor: "bg-indigo-100",
      isGrowth: true,
    },
  ];

  const Card = ({ children, className = "" }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition ${className}`}>
      {children}
    </div>
  );

  const StatCard = ({ item }) => {
    const valueStyle = item.isGrowth
      ? "text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm font-semibold"
      : "text-3xl font-bold text-gray-900";
    return (
      <Card className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${item.iconBgColor}`}>{item.icon}</div>
          <div>
            <p className="text-gray-500 text-sm">{item.title}</p>
            <p className={valueStyle}>{item.value}</p>
          </div>
        </div>
      </Card>
    );
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      open: "bg-green-100 text-green-700",
      new: "bg-blue-100 text-blue-700",
      reviewed: "bg-yellow-100 text-yellow-700",
    };
    return (
      <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="fixed top-0 left-0 h-screen w-64 bg-white shadow-lg z-50">
        <Sidebar />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 pl-64">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Career Dashboard</h1>
          <p className="text-gray-500 mt-2">Welcome back! Monitor your job posts and applications at a glance.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item, idx) => <StatCard key={idx} item={item} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => setShowModal(true)}
                className="w-full flex items-center justify-center bg-[#140228] hover:bg-[#20033d] text-white py-2.5 px-4 rounded-lg transition"
              >
                <Plus className="h-5 w-5 mr-2" /> Post New Job
              </button>
              <button
                onClick={() => navigate('/job-application')}
                className="w-full text-center text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-100 transition"
              >
                View Applications
              </button>
              <button
                onClick={() => navigate('/job-management')}
                className="w-full text-center text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-100 transition"
              >
                Manage Jobs
              </button>
            </div>
          </Card>

          <Card className="lg:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Recent Jobs</h2>
              <p onClick={() => navigate('/job-management')} className="text-sm text-blue-600 hover:underline cursor-pointer">View all</p>
            </div>
            <div className="space-y-4">
              {recentJobs.length > 0 ? (
                recentJobs
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 4)
                  .map((job, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-500">{job.company}</p>
                        </div>
                        <p className="text-sm text-gray-500 capitalize">{job.jobType}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <StatusBadge status={job.status} />
                        <p className="text-sm text-gray-400">
                          {new Date(job.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-gray-500">No recent jobs posted yet.</p>
              )}
            </div>
          </Card>

          <Card className="lg:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Recent Applications</h2>
              <p onClick={() => navigate('/job-application')} className="text-sm text-blue-600 hover:underline cursor-pointer">View all</p>
            </div>
            <div className="space-y-4">
              {recentApplications.length > 0 ? (
                recentApplications.slice(0, 4).map((app, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{app.name}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-500">
                            {recentJobs.find(job => job._id === app.jobId)?.title || 'Job Title Not Found'}
                          </p>
                          <StatusBadge status={app.status} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 whitespace-nowrap">
                        {new Date(app.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent applications found.</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* onclose prop */}
      {showModal && <PostJobModal onclose={() => setShowModal(false)} />}
    </div>
  );
}
