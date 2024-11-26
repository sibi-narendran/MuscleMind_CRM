import React, { useEffect, useState } from "react";
import RandomImageGrid from "../components/RandomImageGrid";
import { useNavigate } from "react-router-dom";
import { useBreakpoint } from '../customHooks';

const Login = () => {
  const currentBreakPoint = useBreakpoint();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const scrollToTop = () => {
    window.scrollTo({ top: 1, behavior: "smooth" });
  };

  useEffect(() => {
    scrollToTop();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate a fake API call
    setTimeout(() => {
      setLoading(false);
      if (email === 'test@example.com' && password === 'password') {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    }, 1000);
  };

  return (
    <div className="w-full h-screen overflow-hidden mx-auto font-roboto bg-[#FCFCFC]" style={{ userSelect: "none" }}>
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
                      <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</a>
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

                {error && <div className="text-red-500 text-sm">{error}</div>}

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