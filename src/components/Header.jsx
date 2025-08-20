import React from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import {
  RiSearchLine,
  RiNotificationLine,
  RiSettingsLine,
  RiAddLine,
  RiDownloadLine,
  RiRefreshLine,
} from "react-icons/ri";
import { getSessionUser } from '../utils/session';
import * as XLSX from 'xlsx';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getSessionUser();

  const getPrimaryButtonLabel = () => {
    if (location.pathname === '/dashboard') return 'New User';
    if (location.pathname === '/users') return 'New User';
    if (location.pathname === '/blogs') return 'Write a Blog';
    return 'Create';
  };
  const getPrimaryPageName = () => {
    if (location.pathname === '/dashboard') return 'Dashboard';
    if (location.pathname === '/users') return 'Users';
    if (location.pathname === '/blogs') return 'Blogs';
    if (location.pathname === '/leads') return 'Leads';
    if (location.pathname === '/Careers') return 'Careers';

    return 'Home';
  }
  const handleClick = () => {
    if (getPrimaryButtonLabel() === 'New User') {
      navigate('/users');
    } else if (location.pathname.startsWith('/blogs')) {
      navigate('/blogs/new');
    } else if (location.pathname.startsWith('/dashboard')) {
      // Optionally, navigate to a user creation page or do nothing
    }
  };

  // Export newsletter subscribers to Excel
  const exportSubscribersToExcel = () => {
    // Get subscribers from localStorage or window (since Header doesn't have direct access to state)
    let subscribers = [];
    if (window.__newsletter_subscribers) {
      subscribers = window.__newsletter_subscribers;
    } else if (localStorage.getItem('newsletter_subscribers')) {
      try {
        subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers'));
      } catch {}
    }
    if (!subscribers.length) {
      alert('No subscribers to export!');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(subscribers.map(s => ({
      Email: s.email,
      'Subscribed At': s.created_at ? new Date(s.created_at).toLocaleString() : ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Subscribers');
    XLSX.writeFile(wb, 'newsletter_subscribers.xlsx');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
      {/* Top Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{getPrimaryPageName()}</h1>
          <p className="text-gray-500">Welcome back, {user.first_name}</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-80"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <RiSearchLine className="text-gray-400 text-sm" />
            </div>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <RiNotificationLine className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>
          </div>

          {/* Settings */}
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <RiSettingsLine className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex items-center justify-between mt-4">
        <div>
          <div className="text-sm font-medium text-gray-900">
            Today: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleString(undefined, { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            className="bg-primary text-white px-4 py-2 rounded-button flex items-center space-x-2"
            onClick={handleClick}
          >
            <RiAddLine className="w-4 h-4" />
            <span>{getPrimaryButtonLabel()}</span>
          </button>
          <button
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-button flex items-center space-x-2"
            onClick={location.pathname === '/users' ? exportSubscribersToExcel : undefined}
          >
            <RiDownloadLine className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-button flex items-center space-x-2">
            <RiRefreshLine className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
