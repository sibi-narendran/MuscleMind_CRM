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

const coreRoutes = [
  { path: '/', title: 'Login', component: Login },
  { path: '/dashboard', title: 'Dashboard', component: Dashboard },
  { path: '/patients', title: 'Patients', component: Patients },
  { path: '/appointments', title: 'Appointments', component: Appointments },
  { path: '/billing', title: 'Billing', component: Billing },
  { path: '/management', title: 'Management', component: Management },
  { path: '/reminders', title: 'Reminders', component: Reminders },
  { path: '/clinc', title: 'Clinic', component: Clinic },
  { path: '/create-account', title: 'Clinic', component: createAccount },
];

const routes = [...coreRoutes];
export default routes;
