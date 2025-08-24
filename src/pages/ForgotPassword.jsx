import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Phone } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: password.length >= minLength,
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    };
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('⚠️ Please enter your email address.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/forgot-password`, {
        email: email
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 && response.data.success) {
        setStep(2);
        startResendTimer();
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message || 'Something went wrong. Please try again.';
        
        if (status === 400) {
          setError(errorMessage);
        } else if (status === 404) {
          setError('User with this email does not exist.');
        } else if (status === 500) {
          setError('Failed to send OTP email. Please try again.');
        } else {
          setError(errorMessage);
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

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/verify-otp`, {
        email: email,
        otp: otp
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 && response.data.success) {
        setStep(3);
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message || 'Something went wrong. Please try again.';
        
        if (status === 400) {
          setError('Invalid or expired OTP. Please check and try again.');
        } else {
          setError(errorMessage);
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

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError('⚠️ Please fill in all fields.');
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/reset-password`, {
        email: email,
        otp: otp,
        newPassword: newPassword
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 && response.data.success) {
        setSuccess(true);
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message || 'Something went wrong. Please try again.';
        
        if (status === 400) {
          setError(errorMessage);
        } else {
          setError(errorMessage);
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

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/resend-otp`, {
        email: email
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 && response.data.success) {
        startResendTimer();
        setError('');
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message || 'Failed to resend OTP. Please try again.';
        
        if (status === 429) {
          setError('Too many requests. Please wait before trying again.');
        } else {
          setError(errorMessage);
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

  const renderStep1 = () => (
    <>
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
        <Mail className="h-6 w-6 text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
      <p className="text-gray-600 mb-8">
        Enter your email address and we'll send you a verification code to reset your password.
      </p>

      <form className="space-y-6" onSubmit={handleSendOTP}>
        <div>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white py-3 px-4 rounded-button text-sm font-medium hover:bg-secondary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send Verification Code'}
        </button>
      </form>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
        <Phone className="h-6 w-6 text-orange-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Verification Code</h2>
      <p className="text-gray-600 mb-4">
        We've sent a 6-digit verification code to <strong>{email}</strong>
      </p>
      <p className="text-sm text-gray-500 mb-8">
        Enter the code below to continue.
      </p>

      <form className="space-y-6" onSubmit={handleVerifyOTP}>
        <div>
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center text-lg tracking-widest"
            required
            disabled={isLoading}
            maxLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || otp.length !== 6}
          className="w-full bg-primary text-white py-3 px-4 rounded-button text-sm font-medium hover:bg-secondary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Verifying...' : 'Verify Code'}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Didn't receive the code?
          </p>
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resendTimer > 0 || isLoading}
            className="text-primary hover:text-secondary transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
          </button>
        </div>
      </form>
    </>
  );

  const renderStep3 = () => {
    const passwordValidation = validatePassword(newPassword);
    
    return (
      <>
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Set New Password</h2>
        <p className="text-gray-600 mb-8">
          Enter your new password below.
        </p>

        <form className="space-y-6" onSubmit={handleResetPassword}>
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
                  <span className="text-gray-400">👁️</span>
                ) : (
                  <span className="text-gray-400">👁️‍🗨️</span>
                )}
              </button>
            </div>
            
            {/* Password strength indicator */}
            {newPassword && (
              <div className="mt-2 text-xs">
                <div className="space-y-1">
                  <div className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                    <span className="mr-2">•</span>
                    At least 6 characters
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
                  <span className="text-gray-400">👁️</span>
                ) : (
                  <span className="text-gray-400">👁️‍🗨️</span>
                )}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !passwordValidation.isValid || newPassword !== confirmPassword}
            className="w-full bg-primary text-white py-3 px-4 rounded-button text-sm font-medium hover:bg-secondary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </>
    );
  };

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

          <div className="text-center">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </div>

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

export default ForgotPassword; 