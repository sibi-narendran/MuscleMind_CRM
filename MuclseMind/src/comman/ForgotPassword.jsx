import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from 'antd';
import Loader from '../styles/Loader';
import { sendPasswordResetOtp, resetPassword } from '../interceptor/services';
import cover from '../assets/background.jpg'

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await sendPasswordResetOtp({ email });
      if (response.success) {
        message.success(response.message || 'OTP sent successfully');
        setOtpSent(true);
      } else {
        message.error('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      message.error(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await resetPassword({ email, otp, newPassword });
      if (response.success) {
        message.success(response.message || 'Password reset successful');
        navigate('/');
      } else {
        message.error('Failed to reset password. Please try again.');
      }
    } catch (err) {
      message.error(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* Blurred Background - Only blur on mobile */}
      <div 
        className="absolute inset-0 blur-lg md:blur-none"
        style={{ 
          backgroundImage: `url(${cover})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          zIndex: 0
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center md:justify-end">
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20">
            <Loader />
          </div>
        )}
        
        <div className="w-full md:w-1/2 px-4 md:px-8 py-6">
          <div className="bg-transparent rounded-lg p-8 max-w-md mx-auto shadow-lg">
            <div className="flex flex-col justify-center items-center gap-5">
              <div className="w-full max-w-sm">
                <img 
                  className="mx-auto h-10 w-auto" 
                  src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600" 
                  alt="Your Company" 
                />
                <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
                  Reset your password
                </h2>
              </div>

              <div className="w-full max-w-sm">
                {!otpSent ? (
                  <form className="space-y-6" onSubmit={handleSendOtp}>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                        Email address
                      </label>
                      <div className="mt-2">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <button
                        type="submit"
                        className="flex w-full justify-center rounded-md bg-meta-5 px-3 py-1.5 text-sm font-semibold text-black shadow-sm hover:bg-meta-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        disabled={loading}
                      >
                        {loading ? 'Sending OTP...' : 'Send OTP'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form className="space-y-6" onSubmit={handleResetPassword}>
                    <div>
                      <label htmlFor="otp" className="block text-sm font-medium text-gray-900">
                        OTP
                      </label>
                      <div className="mt-2">
                        <input
                          id="otp"
                          name="otp"
                          type="text"
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-900">
                        New Password
                      </label>
                      <div className="mt-2">
                        <input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <button
                        type="submit"
                        className="flex w-full justify-center rounded-md bg-meta-5 px-3 py-1.5 text-sm font-semibold text-black shadow-sm hover:bg-meta-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        disabled={loading}
                      >
                        {loading ? 'Resetting Password...' : 'Reset Password'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="mt-6 text-center">
                  <a href="/" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                    Back to Login
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
