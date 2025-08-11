// Sidebar.jsx
import React from "react";
import { useState } from "react";
import { useEffect } from "react";    
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getSessionUser } from "../utils/session";
import {
  RiUserLine,
  RiDashboardLine,
  RiArticleLine,
  RiCustomerServiceLine,
  RiGlobalLine,
  RiFacebookLine,
  RiWhatsappLine,
  RiBarChartLine,
  RiSettings3Line,
  RiLogoutBoxLine,
  RiBook2Line,
  RiBriefcaseLine,
  RiFolderLine,

} from "react-icons/ri";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getSessionUser();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone || '',
    password: '',
  });
  const [profilePicPreview, setProfilePicPreview] = useState(user.profile_pic || null);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleProfileChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profile_pic') {
      setProfileForm({ ...profileForm, profile_pic: files[0] });
      setProfilePicPreview(files[0] ? URL.createObjectURL(files[0]) : null);
    } else {
      setProfileForm({ ...profileForm, [name]: value });
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(profileForm).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      await fetch(`${import.meta.env.VITE_API_URL}/updateUser/${user.id}`, {
        method: 'PUT',
        body: formData,
      });
      alert('Profile updated!');
      setShowProfileModal(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    }
  }

  const navItems = [
    { icon: <RiDashboardLine />, label: "Dashboard", to: "/dashboard" },
    { icon: <RiUserLine />, label: "Users", to: "/users" },
    { icon: <RiArticleLine />, label: "Blogs", to: "/blogs" },
//     { icon: <RiCustomerServiceLine />, label: "Leads", to: "/leads" },
//     { icon: <RiGlobalLine />, label: "Website", to: "https://dexprosolutions.com", external: true },
    { icon: <RiBook2Line />, label: "Ebooks", to: "/ebooks" },
    { icon: <RiBriefcaseLine />, label: "Career", to: "/career-dashboard" },
    { icon: <RiGlobalLine />, label: "Website", to: "https://dexprosolutions.com", external: true },
//     { icon: <RiFacebookLine />, label: "Meta", to: "/meta" },
    { icon: <RiSettings3Line />, label: "Services", to: "/services" },
    { icon: <RiFolderLine />, label: "Projects", to: "/project-requirement" },
//     { icon: <RiWhatsappLine />, label: "WhatsApp", to: "/whatsapp" },
//     { icon: <RiBarChartLine />, label: "Analytics", to: "/analytics" },
  ];

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-gray-200">
        <img
          src="logo.png"
          alt="Dexpro Solutions"
          className="h-10 w-100 object-contain"
        />
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setShowProfileModal(true)}>
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center overflow-hidden">
            {user.profile_pic ? (
              <img src={user.profile_pic} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
              <RiUserLine className="text-white" />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {user.first_name} {user.last_name}
            </div>
            <div className="text-sm text-gray-500">{user.role}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.to;
            return (
              <li key={index}>
                {item.external ? (
                  <a
                    href={item.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <Link
                    to={item.to}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 w-full cursor-pointer"
        onClick= {() => setShowLogoutConfirm(true)}
        >
          <RiLogoutBoxLine className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-40">
  <div className="bg-white p-10 rounded-xl shadow-2xl w-[90%] max-w-xl">
    <h3 className="text-2xl font-bold mb-4 text-gray-800">Confirm Logout</h3>
    <p className="mb-6 text-gray-600">Are you sure you want to logout?</p>
    <div className="flex justify-end space-x-4">
      <button
        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        onClick={handleLogout}
      >
        Yes, Logout
      </button>
      <button
        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        onClick={() => setShowLogoutConfirm(false)}
      >
        Cancel
      </button>
    </div>
  </div>
</div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-40">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-[90%] max-w-md">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">My Profile</h3>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <label htmlFor="profile_pic" className="cursor-pointer">
                  {profilePicPreview ? (
                    <img src={profilePicPreview} alt="Profile" className="w-20 h-20 object-cover rounded-full border-2 border-primary" />
                  ) : (
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl">
                      <RiUserLine />
                    </div>
                  )}
                </label>
                <input id="profile_pic" name="profile_pic" type="file" accept="image/*" className="hidden" onChange={handleProfileChange} />
                <span className="text-xs text-gray-400 mt-1">Click to change</span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input name="first_name" value={profileForm.first_name} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input name="last_name" value={profileForm.last_name} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input name="email" value={profileForm.email} disabled className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input name="phone" value={profileForm.phone} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password <span className="text-xs text-gray-400">(leave blank to keep unchanged)</span></label>
                <input name="password" type="password" value={profileForm.password} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowProfileModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-primary text-white">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
