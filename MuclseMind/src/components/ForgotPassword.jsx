import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from 'antd';
import Loader from '../styles/Loader';
import { sendPasswordResetOtp, resetPassword } from '../api.services/services';
import cover from '../Images/background.jpg'

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
        navigate('/login');
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
    <div 
    className="w-full h-screen overflow-hidden mx-auto font-roboto bg-[#FCFCFC] flex items-center justify-end"     style={{ 
      userSelect: "none",
      backgroundImage: `url(${cover})`, 
   
   
      backgroundPosition: "center",

    }}
  >      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur">
          <Loader />
        </div>
      )}
    <div className="relative grid grid-rows-1 grid-cols-1 min-h-[85vh] w-1/2 ">
    <div className="row-start-1 col-start-1 z-10 flex flex-col justify-center items-center gap-5 ">
          <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              <img className="mx-auto h-10 w-auto" src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company" />
              <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">Reset your password</h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
              {!otpSent ? (
                <form className="space-y-6" onSubmit={handleSendOtp}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-900">Email address</label>
                    <div className="mt-2">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
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
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-900">OTP</label>
                    <div className="mt-2">
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-900">New Password</label>
                    <div className="mt-2">
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
