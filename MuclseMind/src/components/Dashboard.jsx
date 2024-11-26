import React from 'react';
import { Users, Calendar, Activity, TrendingUp, PieChart, CheckCircle, LineChart, BarChart } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const Dashboard = () => {
  const stats = [
    { icon: Calendar, label: "Today's Appointments", value: '12', change: '3 pending' },
    { icon: Users, label: 'New Patients This Month', value: '30', change: '+10%' },
    { icon: Activity, label: 'Patient Retention Rate', value: '87%', change: '+4%' },
    { icon: PieChart, label: 'Expected Revenue', value: '$3,500', change: 'from booked appointments' },
  ];

  const upcomingAppointments = [
    { time: '09:00 AM', patient: 'Sarah Johnson', treatment: 'Dental Cleaning' },
    { time: '10:30 AM', patient: 'Michael Chen', treatment: 'Root Canal' },
    { time: '11:00 AM', patient: 'David Brown', treatment: 'Tooth Extraction' },
    { time: '01:00 PM', patient: 'Emily Davis', treatment: 'Consultation' },
    { time: '03:00 PM', patient: 'James Wilson', treatment: 'Teeth Whitening' },
  ];

  const predictiveInsights = [
    { patient: 'John Doe', insight: 'Follow-up required', action: 'Schedule follow-up' },
    { patient: 'Jane Smith', insight: 'Churn risk', action: 'Send engagement email' },
    { patient: 'Alice White', insight: 'High treatment success', action: 'Offer loyalty program' },
  ];

  const actionsRequired = [
    { task: 'Approve Appointment', detail: 'Michael Chen - Root Canal at 10:30 AM' },
    { task: 'Review Inventory', detail: 'Low on dental impression material' },
    { task: 'Confirm Follow-Up', detail: 'John Doe - Follow-up needed' },
  ];

  const patientGrowthData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Patient Growth',
        data: [30, 45, 50, 70, 80, 95],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const appointmentsOverviewData = {
    labels: ['Scheduled', 'Completed', 'Canceled'],
    datasets: [
      {
        label: 'Appointments Overview',
        data: [50, 40, 10],
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 99, 132, 0.2)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-6 space-y-6 dark:bg-boxdark">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white text-meta-4 dark:bg-meta-4 dark:border-strokedark p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-black dark:text-white">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-black dark:text-white mt-1">{stat.value}</h3>
                </div>
                <Icon className="h-8 w-8 text-blue-500 dark:text-white" />
              </div>
              <p className="text-sm text-meta-5 dark:text-meta-3 mt-2">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Actions Required */}
      <div className="bg-white dark:bg-meta-4 dark:border-strokedark p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black dark:text-white">Actions Required</h2>
          <CheckCircle className="h-5 w-5 text-gray-400 dark:text-white" />
        </div>
        <div className="space-y-4">
          {actionsRequired.map((action, index) => (
            <div key={index} className="p-3 bg-red-50 dark:bg-boxdark rounded-lg">
              <p className="text-sm font-medium text-black dark:text-white">{action.task}</p>
              <p className="text-sm text-gray-500 dark:text-white">{action.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Schedule and Predictive Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-meta-4 dark:border-strokedark dark:text-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-black dark:text-white">Today's Schedule</h2>
            <Calendar className="h-5 w-5 text-gray-400 dark:text-white" />
          </div>
          <div className="space-y-4">
            {upcomingAppointments.map((apt, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-boxdark rounded-lg">
                <div className="flex-shrink-0 w-20">
                  <p className="text-sm font-medium text-black dark:text-white">{apt.time}</p>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-black dark:text-white">{apt.patient}</p>
                  <p className="text-sm text-meta-3 dark:text-white">{apt.treatment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-meta-4 dark:border-strokedark dark:text-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-black dark:text-white">Predictive Insights</h2>
            <TrendingUp className="h-5 w-5 text-black dark:text-white" />
          </div>
          <div className="space-y-4">
            {predictiveInsights.map((insight, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-boxdark rounded-lg">
                <div className="ml-4">
                  <p className="text-sm font-medium text-black dark:text-white">{insight.patient}</p>
                  <p className="text-sm text-meta-3 dark:text-white">{insight.insight}</p>
                  <p className="text-sm text-black dark:text-white">{insight.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Growth Trend and Appointments Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-meta-2 dark:bg-meta-4 dark:border-strokedark dark:text-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Patient Growth Trend</h2>
            <LineChart className="h-5 w-5 text-gray-400 dark:text-white" />
          </div>
          <Line data={patientGrowthData} />
        </div>

        <div className="bg-meta-2 dark:bg-meta-4 dark:border-strokedark dark:text-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appointments Overview</h2>
            <BarChart className="h-5 w-5 text-gray-400 dark:text-white" />
          </div>
          <Bar data={appointmentsOverviewData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
