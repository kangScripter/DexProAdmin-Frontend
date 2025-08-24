// src/pages/ProjectRequestDashboard.jsx
import React, { useEffect, useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Filter,
  Eye,
  X,
  Building2,
  Users,
  TrendingUp,
  Briefcase
} from "lucide-react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";

const API_URL = import.meta.env.VITE_API_URL;

const ProjectRequestDashboard = () => {
  const [userData, setUserData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch data from backend
  useEffect(() => {
    axios
      .get(`${API_URL}/project-requirements/get-all`)
      .then((res) => {
        setUserData(res.data);
      })
      .catch((err) => {
        console.error("Error fetching user data:", err);
        setError("Failed to load project submissions.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const openModal = (user) => setSelectedUser(user);
  const closeModal = () => setSelectedUser(null);

  const filteredData = userData.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.selectedservices?.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "recent" && isRecentSubmission(user.submittedat)) ||
      (statusFilter === "high-budget" && Number(user.budgetrange) > 50000);
    
    return matchesSearch && matchesStatus;
  });

  const isRecentSubmission = (date) => {
    if (!date) return false;
    const submissionDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - submissionDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const getStatusBadge = (user) => {
    if (isRecentSubmission(user.submittedat)) {
      return (
        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
          Recent
        </span>
      );
    }
    if (Number(user.budgetrange) > 50000) {
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
          High Budget
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
        Standard
      </span>
    );
  };

  const stats = {
    total: userData.length,
    recent: userData.filter(user => isRecentSubmission(user.submittedat)).length,
    highBudget: userData.filter(user => Number(user.budgetrange) > 50000).length,
    totalBudget: userData.reduce((sum, user) => sum + (Number(user.budgetrange) || 0), 0)
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
                    Project Submissions
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">Manage and review client project requests</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Submissions</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {loading ? <Loader className="!h-8 !w-8" /> : stats.total}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <FileText className="text-primary" size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Recent (7 days)</p>
                      <p className="text-2xl font-bold text-emerald-600">{stats.recent}</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Clock className="text-emerald-600" size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">High Budget</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.highBudget}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="text-blue-600" size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Budget</p>
                      <p className="text-2xl font-bold text-secondary">
                        ₹{stats.totalBudget.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <DollarSign className="text-secondary" size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 rounded-xl flex items-center gap-3 bg-red-50 border border-red-200 text-red-700">
                <AlertCircle size={20} className="text-red-600" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by name, email, or services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      statusFilter === "all"
                        ? "bg-primary text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter("recent")}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      statusFilter === "recent"
                        ? "bg-emerald-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Recent
                  </button>
                  <button
                    onClick={() => setStatusFilter("high-budget")}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      statusFilter === "high-budget"
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    High Budget
                  </button>
                </div>
              </div>
            </div>

            {/* Project Submissions Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader />
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-gray-400" size={24} />
                </div>
                <p className="text-gray-500 text-lg">
                  {searchTerm || statusFilter !== "all" ? "No submissions found matching your criteria." : "No project submissions yet."}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm || statusFilter !== "all" ? "Try adjusting your search or filter criteria." : "Project submissions will appear here once clients submit their requests."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredData.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 cursor-pointer"
                    onClick={() => openModal(user)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <User className="text-primary" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{user.username}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      {getStatusBadge(user)}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} />
                        <span>{user.phone || "No phone"}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={14} />
                        <span className="truncate">{user.address || "No address"}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Briefcase size={14} />
                          Services
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {(user.selectedservices || []).slice(0, 3).map((service, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                            >
                              {service}
                            </span>
                          ))}
                          {(user.selectedservices || []).length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                              +{(user.selectedservices || []).length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar size={14} />
                          {user.submittedat ? new Date(user.submittedat).toLocaleDateString('en-IN') : "N/A"}
                        </div>
                        <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                          <DollarSign size={14} />
                          ₹{Number(user.budgetrange)?.toLocaleString("en-IN") || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      {selectedUser && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <User className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Submission Details</h2>
                    <p className="text-gray-500 text-sm">Client project request information</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Client Information */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User size={20} className="text-primary" />
                  Client Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User size={16} className="text-gray-400" />
                      <span className="font-medium">Name:</span>
                      <span className="text-gray-700">{selectedUser.username}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={16} className="text-gray-400" />
                      <span className="font-medium">Email:</span>
                      <span className="text-gray-700">{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={16} className="text-gray-400" />
                      <span className="font-medium">Phone:</span>
                      <span className="text-gray-700">{selectedUser.phone || "Not provided"}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <span className="font-medium">Address:</span>
                        <p className="text-gray-700">{selectedUser.address || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="font-medium">Submitted:</span>
                      <span className="text-gray-700">
                        {selectedUser.submittedat ? new Date(selectedUser.submittedat).toLocaleString('en-IN') : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase size={20} className="text-primary" />
                  Project Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedUser.selectedservices || []).map((service, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Sub-Services</h4>
                    {selectedUser.selectedsubservices && Object.keys(selectedUser.selectedsubservices).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(selectedUser.selectedsubservices).map(([service, subs]) => (
                          <div key={service} className="bg-white p-3 rounded-lg border border-gray-200">
                            <p className="text-sm font-medium text-gray-900 mb-1">{service}</p>
                            <div className="flex flex-wrap gap-1">
                              {(subs || []).map((sub, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No sub-services selected</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Project Timeline</h4>
                      <p className="text-gray-900">{selectedUser.projecttimeline || "Not specified"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Budget Range</h4>
                      <p className="text-emerald-600 font-semibold">
                        ₹{Number(selectedUser.budgetrange)?.toLocaleString("en-IN") || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Requirements</h4>
                    <p className="text-gray-900 bg-white p-3 rounded-lg border border-gray-200">
                      {selectedUser.additionalrequirements || "No additional requirements specified"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-600" />
                    <span className="text-sm text-gray-700">
                      Keep Updated: {selectedUser.keepupdated ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectRequestDashboard;
