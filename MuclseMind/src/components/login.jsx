import React, { useEffect, useState } from "react";
import RandomImageGrid from "../components/RandomImageGrid";
import { useNavigate } from "react-router-dom";
import { useBreakpoint } from '../customHooks';
import { message } from 'antd';
import Loader from '../styles/Loader';
import { userLogin } from '../api.services/services';

const Login = () => {
  const currentBreakPoint = useBreakpoint();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 1, behavior: "smooth" });
  };

  useEffect(() => {
    scrollToTop();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await userLogin({ email, password });

      if (response.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        message.success(response.message || 'Login successful');
        navigate('/dashboard');
      } else {
        message.error('Failed to retrieve token. Please try again.');
      }
    } catch (err) {
      message.error(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden mx-auto font-roboto bg-[#FCFCFC]" style={{ userSelect: "none" }}>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-white bg-opacity-75">
          <Loader />
        </div>
      )}
      <div className="relative grid grid-rows-1 grid-cols-1 min-h-[85vh]">
        {currentBreakPoint !== "sm" && (
          <div className="row-start-1 col-start-1 z-0">
            <RandomImageGrid />
          </div>
        )}
        <div className="row-start-1 col-start-1 z-10 flex flex-col justify-center items-center gap-5">
          <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              <img className="mx-auto h-10 w-auto" src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company" />
              <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">Sign in to your account</h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
              <form className="space-y-6" onSubmit={handleLogin}>
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
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-900">Password</label>
                    <div className="text-sm">
                      <a href="/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</a>
                    </div>
                  </div>
                  <div className="mt-2">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <a href="/create-account" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                  Create an account
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;