// Sidebar.jsx
import React from "react";
import { useState } from "react";
import { useEffect } from "react";    
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getSessionUser, isLoggedIn } from '../utils/session';
import {
  RiUserLine,
  RiDashboardLine,
  RiArticleLine,
  RiCustomerServiceLine,
  RiGlobalLine,
  RiFacebookLine,
  RiWhatsappLine,
  RiBarChartLine,
  RiSettingsLine,
  RiLogoutBoxLine,
  RiBookFill,
} from "react-icons/ri";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getSessionUser();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };
  const navItems = [
    { icon: <RiDashboardLine />, label: "Dashboard", to: "/dashboard" },
    { icon: <RiUserLine />, label: "Users", to: "/users" },
    { icon: <RiArticleLine />, label: "Blogs", to: "/blogs" },
    { icon: <RiCustomerServiceLine />, label: "Leads", to: "/leads" },
    { icon: <RiBookFill />, label: "Ebooks", to: "/ebooks" },
    { icon: <RiGlobalLine />, label: "Website", to: "/website" },
    { icon: <RiFacebookLine />, label: "Meta", to: "/meta" },
    { icon: <RiWhatsappLine />, label: "WhatsApp", to: "/whatsapp" },
    { icon: <RiBarChartLine />, label: "Analytics", to: "/analytics" },
    { icon: <RiSettingsLine />, label: "Services", to: "/services" },
  ];

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-gray-200">
        {/* <div className="font-['Pacifico'] text-2xl text-primary">Dexpro</div>
        <div className="text-sm text-gray-500 mt-1">Solutions</div> */}
        <img
                src="logo.png" 
                alt="Dexpro Solutions"
                className="h-10 w-100 object-contain"
              />
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <RiUserLine className="text-white" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.first_name} {user.last_name}</div>
            <div className="text-sm text-gray-500">{user.role}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.to;
            return (
              <li key={index}>
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
    </div>
  );
};

export default Sidebar;
