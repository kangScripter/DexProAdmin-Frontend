import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { X } from 'lucide-react';
const API_URL = import.meta.env.VITE_API_URL;
const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      // alert('Please fill in all required fields.');
      setError('⚠️ Please fill in all required fields.');
      return;
    }

    if (!isValidEmail(email)) {
      alert('Please enter a valid email address.');
      setError('Please enter a valid email address.');
      return;
    }

    try {
      console.log(email, password)
      const res = await axios.post(`${API_URL}/validatepassword`, {
        email,
        password, 
      
      },
      {
    headers: {
      'Content-Type': 'application/json',
    },
  }
    );
      console.log(res?.status)
      if (res?.status === 200) {
        // Save login session
        const storage = localStorage
        // const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('isLoggedIn', 'true');
        storage.setItem('email', email);
        storage.setItem('user', JSON.stringify(res.data.data));

        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setError("Invalid email or password")
        alert('Invalid credentials');
      }
    } catch (error) {
        if (error.response) {
            const status = error.response.status;
            console.log(status)
            if (status === 404) {
            setError('Account not found');
            // alert('Account not found.');
            } else if (status === 401) {
            // alert('Unauthorized. Please check your credentials.');
            setError('Invalid Emailres.data. or password');
            } else if (status === 403){
               setError(`Invalid email or password`);
            } else {
            setError(`Server responded with status ${status}: ${error.response.data?.message || 'Internal Server error'}`);
            // alert(`Server responded with status ${status}: ${error.response.data?.message || 'Unknown error'}`);
            }
        } else if (error.request) {
            // alert('No response from server. Check your network or backend server.');
            setError('No response from server. Check your network or backend server.');
        } else {
            // alert('Unexpected error: ' + error.message);
            setError('Unexpected error: ' + error.message);
        }

        console.error('Login failed:', error);
        }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
              {/* <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <i className="ri-settings-3-line text-white text-xl"></i>
              </div> */}
              <img
                src="logo.png" 
                alt="Dexpro Solutions"
                className="h-20 w-100 object-contain"
              />
            </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Admin Login</h2>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="relative bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded mb-4 animate-fade-in text-center">
              <span className="block">{error}</span>
              <button
                type="button"
                onClick={() => setError('')}
                className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-2xl"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
      )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember-me"
                  className="custom-checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600 cursor-pointer">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-primary hover:text-secondary transition-colors">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-3 px-4 rounded-button text-sm font-medium hover:bg-secondary transition-colors cursor-pointer whitespace-nowrap"
            >
              Log In
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">Need help? </span>
            <a href="#" className="text-sm text-primary hover:text-secondary transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
