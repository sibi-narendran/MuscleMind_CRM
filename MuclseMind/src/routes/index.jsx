import { lazy } from 'react';

const Dashboard = lazy(() => import('../components/Dashboard'));
const Patients = lazy(() => import('../pages/paitents'));
const Appointments = lazy(() => import('../components/Appointments'));
const Billing = lazy(() => import('../components/Billing'));
const Management = lazy(() => import('../components/Management'));
const Reminders = lazy(() => import('../components/Reminders'));
const Clinic = lazy(() => import('../components/ClinicInfo'));
const Login = lazy(() => import('../components/login'));
const createAccount = lazy(() => import('../components/CreateAccount'));
const ForgotPassword = lazy(() => import('../components/ForgotPassword'));
const MyProfile = lazy(() => import('../components/Profile'));
const Prescriptions = lazy(() => import('../pages/Prescriptions'));
const Settings = lazy(() => import('../components/Settings'));

const coreRoutes = [
  { path: '/', title: 'Login', component: Login },
  { path: '/dashboard', title: 'Dashboard', component: Dashboard },
  { path: '/patients', title: 'Patients', component: Patients },
  { path: '/appointments', title: 'Appointments', component: Appointments },
  { path: '/billing', title: 'Billing', component: Billing },
  { path: '/management', title: 'Management', component: Management },
  { path: '/reminders', title: 'Reminders', component: Reminders },
  { path: '/prescriptions', title: 'Prescriptions', component: Prescriptions },
  { path: '/clinic', title: 'Clinic', component: Clinic },
  { path: '/create-account', title: 'Clinic', component: createAccount },
  { path: '/forgot-password', title: 'Forgot Password', component: ForgotPassword },
  { path: '/myprofile', title: 'MyProfile', component: MyProfile },
  { path: '/settings', title: 'Settings', component: Settings },

];

const routes = [...coreRoutes];
export default routes;
