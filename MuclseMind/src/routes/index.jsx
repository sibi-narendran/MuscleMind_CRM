import React, { Suspense } from 'react';
import { lazy } from 'react';

// Loader Component
const AppLoader = () => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-boxdark flex items-center justify-center">
      <div className="relative inline-flex">
        {/* Outer Circle */}
        <div className="w-24 h-24 rounded-full border-4 border-meta-5 border-t-transparent animate-spin"></div>
        
        {/* Inner Circle */}
        <div className="w-16 h-16 rounded-full border-4 border-meta-6 border-t-transparent animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Center Logo or Text */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="text-meta-5 font-bold text-xl">MM</span>
        </div>
      </div>
      
      {/* Loading Text */}
      <div className="absolute bottom-1/4 text-center">
        <p className="text-meta-5 dark:text-meta-7 text-xl font-semibold mb-2">Loading</p>
        <div className="flex justify-center space-x-1">
          <div className="w-3 h-3 bg-meta-5 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-meta-5 rounded-full animate-bounce delay-100"></div>
          <div className="w-3 h-3 bg-meta-5 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
};

// Your existing route imports

const LandingPage = lazy(() => import('../landingPage/LandingPage'));
const Dashboard = lazy(() => import('../components/Dashboard/Dashboard'));
const Patients = lazy(() => import('../pages/paitents'));
const Appointments = lazy(() => import('../pages/Appointments'));
const Billing = lazy(() => import('../pages/Billing'));
const Management = lazy(() => import('../pages/Management'));
const Reminders = lazy(() => import('../components/Dashboard/Reminders'));
const Clinic = lazy(() => import('../pages/ClinicInfo'));
const Login = lazy(() => import('../comman/login'));
const CreateAccount = lazy(() => import('../comman/CreateAccount'));
const ForgotPassword = lazy(() => import('../comman/ForgotPassword'));
const MyProfile = lazy(() => import('../components/Profile'));
const Prescriptions = lazy(() => import('../pages/Prescriptions'));
const Settings = lazy(() => import('../components/Payment/Settings'));

const coreRoutes = [
  { path: '/', title: 'Login', component: LandingPage },
  { path: '/login', title: 'Login', component: Login },
  { path: '/create-account', title: 'Create Account', component: CreateAccount },
  { path: '/forgot-password', title: 'Forgot Password', component: ForgotPassword },
  { path: '/dashboard', title: 'Dashboard', component: Dashboard },
  { path: '/patients', title: 'Patients', component: Patients },
  { path: '/appointments', title: 'Appointments', component: Appointments },
  { path: '/billing', title: 'Billing', component: Billing },
  { path: '/management', title: 'Management', component: Management },
  { path: '/reminders', title: 'Reminders', component: Reminders },
  { path: '/prescriptions', title: 'Prescriptions', component: Prescriptions },
  { path: '/clinic', title: 'Clinic', component: Clinic },
  { path: '/myprofile', title: 'My Profile', component: MyProfile },
  { path: '/settings', title: 'Settings', component: Settings },
].map(route => ({
  ...route,
  element: (
    <Suspense fallback={<AppLoader />}>
      <route.component />
    </Suspense>
  ),
}));

const routes = [...coreRoutes];
export default routes;
