import React, { useState, useEffect } from 'react';
import { 
  User, 
  UserCheck, 
  UserCog, 
  Mail, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Phone,
  Shield,
  Users,
  TrendingUp,
  Eye,
  ChevronLeft,
  ChevronRight,
  Upload
} from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { getSessionUser } from '../utils/session';

const API_DOMAIN = import.meta.env.VITE_API_URL;
const ROLES = ['Admin', 'Owner', 'Editor'];

const initialUserState = {
  email: '',
  password: '',
  phone: '',
  first_name: '',
  last_name: '',
  role: '',
  gender: '',
  profile_pic: null
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialUserState);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalEditors: 0,
    totalOwners: 0,
    totalNewsletter: 0,
    totalUsers: 0
  });
  const [userFilter, setUserFilter] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const usersPerPage = 8;
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [subscriberPage, setSubscriberPage] = useState(1);
  const subscribersPerPage = 8;

  useEffect(() => {
    fetchUsers();
    fetchSubscribers();
  }, []);

  useEffect(() => {
    if (refresh) {
      fetchUsers();
      fetchSubscribers();
    }
  }, [refresh]);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_DOMAIN}/getAllUsers`);
      const userList = res.data.data || [];
      setUsers(userList);
      setStats(s => ({
        ...s,
        totalAdmins: userList.filter(u => u.role === 'Admin').length,
        totalEditors: userList.filter(u => u.role === 'Editor').length,
        totalOwners: userList.filter(u => u.role === 'Owner').length,
        totalUsers: userList.length
      }));
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  // Fetch newsletter subscribers
  const fetchSubscribers = async () => {
    try {
      const res = await axios.get(`${API_DOMAIN}/api/subscribers`);
      setSubscribers(res.data.subscribers || []);
      setStats(s => ({ ...s, totalNewsletter: (res.data.subscribers || []).length }));
      window.__newsletter_subscribers = res.data.subscribers || [];
    } catch (err) {
      setSubscribers([]);
      setStats(s => ({ ...s, totalNewsletter: 0 }));
      window.__newsletter_subscribers = [];
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profile_pic') {
      setForm({ ...form, profile_pic: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      let res;
      if (editingId) {
        res = await axios.put(`${API_DOMAIN}/updateUser/${editingId}`, formData);
      } else {
        res = await axios.post(`${API_DOMAIN}/newUser`, formData);
      }
      if (res.status === 201 || res.status === 200) {
        setSuccess(editingId ? 'User updated successfully!' : 'User added successfully!');
        setForm(initialUserState);
        setEditingId(null);
        setShowModal(false);
        setRefresh(r => !r);
      } else {
        setError('Failed to save user');
      }
    } catch (err) {
      setError('Server error occurred');
    }
    setLoading(false);
  };

  const handleEdit = (user) => {
    setForm({ ...user, password: '' });
    setEditingId(user.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${API_DOMAIN}/deleteUser/${id}`);
      setSuccess('User deleted successfully!');
      setRefresh(r => !r);
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const userSession = getSessionUser();
  const canEditUsers = userSession && (userSession.role === 'Admin' || userSession.role === 'Owner');

  // Filter and pagination logic for users
  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.first_name + ' ' + u.last_name + ' ' + u.email + ' ' + u.role).toLowerCase().includes(userSearch.toLowerCase());
    const matchesFilter = !userFilter || u.role === userFilter;
    return matchesSearch && matchesFilter;
  });
  const paginatedUsers = filteredUsers.slice((userPage - 1) * usersPerPage, userPage * usersPerPage);
  const userTotalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Filter and pagination logic for subscribers
  const filteredSubscribers = subscribers.filter(s =>
    s.email.toLowerCase().includes(subscriberSearch.toLowerCase())
  );
  const paginatedSubscribers = filteredSubscribers.slice((subscriberPage - 1) * subscribersPerPage, subscriberPage * subscribersPerPage);
  const subscriberTotalPages = Math.ceil(filteredSubscribers.length / subscribersPerPage);

  const getRoleBadge = (role) => {
    const colors = {
      'Admin': 'bg-red-100 text-red-700',
      'Owner': 'bg-purple-100 text-purple-700',
      'Editor': 'bg-blue-100 text-blue-700'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role] || 'bg-gray-100 text-gray-700'}`}>
        {role}
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
                    User Management
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">Manage system users and newsletter subscribers</p>
                </div>
                {canEditUsers && (
                  <button
                    className="flex items-center gap-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    onClick={() => {
                      setForm(initialUserState);
                      setEditingId(null);
                      setError("");
                      setSuccess("");
                      setShowModal(true);
                    }}
                  >
                    <Plus size={20} />
                    Add User
                  </button>
                )}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Users className="text-primary" size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Admins</p>
                      <p className="text-2xl font-bold text-red-600">{stats.totalAdmins}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <Shield className="text-red-600" size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Editors</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.totalEditors}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <UserCog className="text-blue-600" size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Owners</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.totalOwners}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <UserCheck className="text-purple-600" size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Subscribers</p>
                      <p className="text-2xl font-bold text-secondary">{stats.totalNewsletter}</p>
                    </div>
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <Mail className="text-secondary" size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-6 p-4 rounded-xl flex items-center gap-3 bg-red-50 border border-red-200 text-red-700">
                <AlertCircle size={20} className="text-red-600" />
                <span className="font-medium">{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 rounded-xl flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700">
                <CheckCircle size={20} className="text-emerald-600" />
                <span className="font-medium">{success}</span>
              </div>
            )}

            {/* Users Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">System Users</h2>
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
                        className="w-full sm:w-64 pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <select 
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      value={userFilter || ''} 
                      onChange={e => setUserFilter(e.target.value || null)}
                    >
                      <option value="">All Roles</option>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Users Grid */}
              <div className="p-6">
                {paginatedUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="text-gray-400" size={24} />
                    </div>
                    <p className="text-gray-500 text-lg">No users found matching your criteria.</p>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter criteria.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedUsers.map((user, index) => (
                      <div key={user.id || index} className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            {user.profile_pic ? (
                              <img src={user.profile_pic} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                                {user.first_name?.[0] || ''}{user.last_name?.[0] || ''}
                              </div>
                            )}
                            <div>
                              <h3 className="font-semibold text-gray-900">{user.first_name} {user.last_name}</h3>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          {getRoleBadge(user.role)}
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={14} />
                            <span>{user.phone || "No phone"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} />
                            <span>{user.gender || "Not specified"}</span>
                          </div>
                        </div>

                        {canEditUsers && (
                          <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                            <button
                              onClick={() => handleEdit(user)}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                            >
                              <Edit2 size={14} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {userTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Showing {(userPage - 1) * usersPerPage + 1} to {Math.min(userPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 rounded-lg hover:bg-gray-100 transition-all" 
                        onClick={() => setUserPage(p => Math.max(p - 1, 1))} 
                        disabled={userPage === 1}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      {[...Array(userTotalPages)].map((_, i) => {
                        const page = i + 1;
                        return (
                          <button 
                            key={page} 
                            onClick={() => setUserPage(page)} 
                            className={`px-3 py-2 rounded-lg transition-all ${
                              userPage === page 
                                ? 'bg-primary text-white shadow-lg' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button 
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 rounded-lg hover:bg-gray-100 transition-all" 
                        onClick={() => setUserPage(p => Math.min(p + 1, userTotalPages))} 
                        disabled={userPage === userTotalPages}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Newsletter Subscribers Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Newsletter Subscribers</h2>
                  <div className="relative flex-1 lg:flex-initial max-w-md">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search subscribers..."
                      value={subscriberSearch}
                      onChange={e => { setSubscriberSearch(e.target.value); setSubscriberPage(1); }}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6">
                {paginatedSubscribers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="text-gray-400" size={24} />
                    </div>
                    <p className="text-gray-500 text-lg">No subscribers found matching your criteria.</p>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedSubscribers.map((subscriber, index) => (
                      <div key={subscriber.id || index} className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-white font-semibold">
                            {subscriber.email?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 truncate">{subscriber.email}</h3>
                            <p className="text-sm text-gray-500">
                              {subscriber.created_at ? new Date(subscriber.created_at).toLocaleDateString('en-IN') : 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} />
                          <span>
                            {subscriber.created_at ? new Date(subscriber.created_at).toLocaleString('en-IN') : 'Subscription date unknown'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {subscriberTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Showing {(subscriberPage - 1) * subscribersPerPage + 1} to {Math.min(subscriberPage * subscribersPerPage, filteredSubscribers.length)} of {filteredSubscribers.length} subscribers
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 rounded-lg hover:bg-gray-100 transition-all" 
                        onClick={() => setSubscriberPage(p => Math.max(p - 1, 1))} 
                        disabled={subscriberPage === 1}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      {[...Array(subscriberTotalPages)].map((_, i) => {
                        const page = i + 1;
                        return (
                          <button 
                            key={page} 
                            onClick={() => setSubscriberPage(page)} 
                            className={`px-3 py-2 rounded-lg transition-all ${
                              subscriberPage === page 
                                ? 'bg-primary text-white shadow-lg' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button 
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 rounded-lg hover:bg-gray-100 transition-all" 
                        onClick={() => setSubscriberPage(p => Math.min(p + 1, subscriberTotalPages))} 
                        disabled={subscriberPage === subscriberTotalPages}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
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
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingId ? "Edit User" : "Add New User"}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {editingId ? "Update user information" : "Create a new system user"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={20} className="text-primary" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                      <input
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                      <input
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        placeholder="Enter last name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Settings */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield size={20} className="text-primary" />
                    Account Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password {editingId && <span className="text-xs text-gray-500">(leave blank to keep unchanged)</span>}
                      </label>
                      <input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        required={!editingId}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        placeholder={editingId ? "Enter new password (optional)" : "Enter password"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                      <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select Role</option>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                      <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                      <label className="flex items-center gap-3 w-full cursor-pointer rounded-xl border border-gray-300 px-4 py-3 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all duration-200 bg-white">
                        <Upload className="text-gray-400" size={20} />
                        <span className="flex-1 text-gray-700">
                          {form.profile_pic ? (typeof form.profile_pic === 'string' ? 'Current image' : form.profile_pic.name) : "Choose profile picture..."}
                        </span>
                        <input
                          name="profile_pic"
                          type="file"
                          accept="image/*"
                          onChange={handleChange}
                          className="hidden"
                        />
                      </label>
                      {form.profile_pic && (
                        <div className="mt-2">
                          <img 
                            src={typeof form.profile_pic === 'string' ? form.profile_pic : URL.createObjectURL(form.profile_pic)} 
                            alt="Preview" 
                            className="w-16 h-16 object-cover rounded-full border border-gray-200" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-primary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {editingId ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        {editingId ? "Update User" : "Add User"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
