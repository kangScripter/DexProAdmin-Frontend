import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { RiUserStarLine, RiUser3Line, RiUserSettingsLine, RiMailLine, RiEditLine, RiDeleteBinLine, RiSearchLine, RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';
import StatCard from '../components/StatCard';
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
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalEditors: 0,
    totalOwners: 0,
    totalNewsletter: 0,
    totalUsers: 0
  });
  const [userFilter, setUserFilter] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  // User table search and pagination
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const usersPerPage = 5;
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [subscriberPage, setSubscriberPage] = useState(1);
  const subscribersPerPage = 5;

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
      alert('Failed to fetch users');
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
        alert(editingId ? 'User updated!' : 'User added!');
        setForm(initialUserState);
        setEditingId(null);
        setRefresh(r => !r);
      } else {
        alert('Failed to save user');
      }
    } catch (err) {
      alert('Server error');
    }
    setLoading(false);
  };

  const handleEdit = (user) => {
    setForm({ ...user, password: '' });
    setEditingId(user.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`${API_DOMAIN}/deleteUser/${id}`);
      setRefresh(r => !r);
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const userSession = getSessionUser();
  const canEditUsers = userSession && (userSession.role === 'Admin' || userSession.role === 'Owner');

  // Filter and pagination logic for users
  const filteredUsers = users.filter(u =>
    (u.first_name + ' ' + u.last_name + ' ' + u.email + ' ' + u.role).toLowerCase().includes(userSearch.toLowerCase())
  );
  const paginatedUsers = filteredUsers.slice((userPage - 1) * usersPerPage, userPage * usersPerPage);
  const userTotalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Filter and pagination logic for subscribers
  const filteredSubscribers = subscribers.filter(s =>
    s.email.toLowerCase().includes(subscriberSearch.toLowerCase())
  );
  const paginatedSubscribers = filteredSubscribers.slice((subscriberPage - 1) * subscribersPerPage, subscriberPage * subscribersPerPage);
  const subscriberTotalPages = Math.ceil(filteredSubscribers.length / subscribersPerPage);

  return (
    <Layout onWebsiteClick={() => window.open('https://dexprosolutions.com', '_blank')}>
      <div>
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<RiUser3Line />}
            color="bg-primary text-white"
            onClick={() => setUserFilter(null)}
            active={userFilter === null}
          />
          <StatCard
            title="Total Admins"
            value={stats.totalAdmins}
            icon={<RiUserStarLine />}
            color="bg-blue-600 text-white"
            onClick={() => setUserFilter('Admin')}
            active={userFilter === 'Admin'}
          />
          <StatCard
            title="Total Editors"
            value={stats.totalEditors}
            icon={<RiUserSettingsLine />}
            color="bg-green-600 text-white"
            onClick={() => setUserFilter('Editor')}
            active={userFilter === 'Editor'}
          />
          <StatCard
            title="Total Subscribers"
            value={stats.totalNewsletter}
            icon={<RiMailLine />}
            color="bg-yellow-500 text-white"
            onClick={() => {
              setUserFilter(null);
              document.getElementById('newsletter-subscribers')?.scrollIntoView({ behavior: 'smooth' });
            }}
            active={false}
          />
        </div>
        <h1 className="text-2xl font-bold mb-6">Add Sudo User</h1>
        <form className="bg-white rounded-xl shadow p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit} encType="multipart/form-data">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input name="first_name" value={form.first_name} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input name="last_name" value={form.last_name} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password {editingId ? <span className='text-xs'>(leave blank to keep unchanged)</span> : null}</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" required={!editingId} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select name="role" value={form.role} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="">Select Role</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Profile Picture (optional)</label>
            <input name="profile_pic" type="file" accept="image/*" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            {form.profile_pic && typeof form.profile_pic !== 'string' && (
              <img src={URL.createObjectURL(form.profile_pic)} alt="Preview" className="w-20 h-20 object-cover rounded-full mt-2" />
            )}
            {form.profile_pic && typeof form.profile_pic === 'string' && (
              <img src={form.profile_pic} alt="Preview" className="w-20 h-20 object-cover rounded-full mt-2" />
            )}
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 mt-4">
            <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => { setForm(initialUserState); setEditingId(null); }} disabled={loading}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-primary text-white" disabled={loading}>{loading ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update User' : 'Add User')}</button>
          </div>
        </form>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">User List</h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                  <RiSearchLine className="text-gray-400 text-sm" />
                </div>
              </div>
              <select className="border border-gray-300 rounded-lg px-3 py-2 pr-8" value={userFilter || ''} onChange={e => setUserFilter(e.target.value || null)}>
                <option value="">All Roles</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left"><input type="checkbox" className="rounded border-gray-300" /></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.map((u, i) => (
                  <tr key={u.id || i}>
                    <td className="px-6 py-4"><input type="checkbox" className="rounded border-gray-300" /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {u.profile_pic ? (
                          <img src={u.profile_pic} alt="pic" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                            {u.first_name?.[0] || ''}{u.last_name?.[0] || ''}
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{u.first_name} {u.last_name}</div>
                          <div className="text-sm text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{u.role}</span>
                    </td>
                    <td className="px-6 py-4">{u.gender}</td>
                    <td className="px-6 py-4">{u.phone}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {canEditUsers && (
                          <button className="text-gray-400 hover:text-blue-600" onClick={() => handleEdit(u)}><RiEditLine /></button>
                        )}
                        {canEditUsers && (
                          <button className="text-gray-400 hover:text-red-600" onClick={() => handleDelete(u.id)}><RiDeleteBinLine /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {(userPage - 1) * usersPerPage + 1} to {Math.min(userPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50" onClick={() => setUserPage(p => Math.max(p - 1, 1))} disabled={userPage === 1}><RiArrowLeftSLine /></button>
              {[...Array(userTotalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <button key={page} onClick={() => setUserPage(page)} className={`px-3 py-1 ${userPage === page ? 'bg-primary text-white rounded' : 'text-gray-500 hover:text-gray-700'}`}>{page}</button>
                );
              })}
              <button className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50" onClick={() => setUserPage(p => Math.min(p + 1, userTotalPages))} disabled={userPage === userTotalPages}><RiArrowRightSLine /></button>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8" id="newsletter-subscribers">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Newsletter Subscribers</h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search subscribers..."
                  value={subscriberSearch}
                  onChange={e => { setSubscriberSearch(e.target.value); setSubscriberPage(1); }}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                  <RiSearchLine className="text-gray-400 text-sm" />
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left"><input type="checkbox" className="rounded border-gray-300" /></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedSubscribers.map((s, i) => (
                  <tr key={s.id || i}>
                    <td className="px-6 py-4"><input type="checkbox" className="rounded border-gray-300" /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-medium">
                          {s.email?.[0]?.toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{s.created_at ? new Date(s.created_at).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {(subscriberPage - 1) * subscribersPerPage + 1} to {Math.min(subscriberPage * subscribersPerPage, filteredSubscribers.length)} of {filteredSubscribers.length} subscribers
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50" onClick={() => setSubscriberPage(p => Math.max(p - 1, 1))} disabled={subscriberPage === 1}><RiArrowLeftSLine /></button>
              {[...Array(subscriberTotalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <button key={page} onClick={() => setSubscriberPage(page)} className={`px-3 py-1 ${subscriberPage === page ? 'bg-primary text-white rounded' : 'text-gray-500 hover:text-gray-700'}`}>{page}</button>
                );
              })}
              <button className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50" onClick={() => setSubscriberPage(p => Math.min(p + 1, subscriberTotalPages))} disabled={subscriberPage === subscriberTotalPages}><RiArrowRightSLine /></button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
