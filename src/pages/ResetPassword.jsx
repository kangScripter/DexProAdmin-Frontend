import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      setValidatingToken(false);
      return;
    }

    // Validate the reset token
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/validate-reset-token?token=${token}`);
      if (response.status === 200) {
        setTokenValid(true);
      }
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 401) {
        setError('This reset link is invalid or has expired. Please request a new password reset.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setValidatingToken(false);
    }
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError('⚠️ Please fill in all fields.');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/reset-password`, {
        token: token,
        newPassword: password
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setSuccess(true);
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          setError('Invalid or expired reset token.');
        } else if (status === 401) {
          setError('This reset link has expired. Please request a new password reset.');
        } else {
          setError(error.response.data?.message || 'Something went wrong. Please try again.');
        }
      } else if (error.request) {
        setError('No response from server. Check your network connection.');
      } else {
        setError('Unexpected error: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <img
                src="logo.png" 
                alt="Dexpro Solutions"
                className="h-20 w-100 object-contain"
              />
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 mt-4">Validating reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <img
                src="logo.png" 
                alt="Dexpro Solutions"
                className="h-20 w-100 object-contain"
              />
            </div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful</h2>
            <p className="text-gray-600 mb-8">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center bg-primary text-white py-3 px-4 rounded-button text-sm font-medium hover:bg-secondary transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <img
                src="logo.png" 
                alt="Dexpro Solutions"
                className="h-20 w-100 object-contain"
              />
            </div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-8">
              {error || 'This reset link is invalid or has expired.'}
            </p>
            <div className="space-y-4">
              <Link
                to="/forgot-password"
                className="w-full inline-flex items-center justify-center bg-primary text-white py-3 px-4 rounded-button text-sm font-medium hover:bg-secondary transition-colors"
              >
                Request New Reset Link
              </Link>
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center text-primary hover:text-secondary transition-colors text-sm font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const passwordValidation = validatePassword(password);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <img
              src="logo.png" 
              alt="Dexpro Solutions"
              className="h-20 w-100 object-contain"
            />
          </div>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
          <p className="text-gray-600 mb-8">
            Enter your new password below.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="relative bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded mb-4 animate-fade-in text-center">
              <div className="flex items-center justify-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="block">{error}</span>
              </div>
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {password && (
                <div className="mt-2 text-xs">
                  <div className="space-y-1">
                    <div className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className="mr-2">•</span>
                      At least 8 characters
                    </div>
                    <div className={`flex items-center ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className="mr-2">•</span>
                      One uppercase letter
                    </div>
                    <div className={`flex items-center ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className="mr-2">•</span>
                      One lowercase letter
                    </div>
                    <div className={`flex items-center ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className="mr-2">•</span>
                      One number
                    </div>
                    <div className={`flex items-center ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className="mr-2">•</span>
                      One special character
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !passwordValidation.isValid || password !== confirmPassword}
              className="w-full bg-primary text-white py-3 px-4 rounded-button text-sm font-medium hover:bg-secondary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-primary hover:text-secondary transition-colors text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 