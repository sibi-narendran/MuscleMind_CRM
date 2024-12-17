import { Users, Calendar, Activity, TrendingUp, PieChart, CheckCircle, LineChart, BarChart, Clock } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import React, { useEffect, useState } from 'react';
import { getDashboardStats, getAppointments, getDashboardPatientGrowth } from '../api.services/services';
import { format } from 'date-fns';

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patientGrowthData, setPatientGrowthData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Patient Growth',
        data: [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await getDashboardStats();
        if (response.success) {
          setStats([
            { icon: Calendar, label: "Today's Appointments", value: response.data.todayAppointments || 0, change: '3 pending' },
            { icon: Users, label: 'New Patients', value: response.data.newPatients || 0, change: '+10%' },
            { icon: Activity, label: 'Present Staff Members', value: response.data.presentStaff || 0, change: '3 on leave' },
            { icon: CheckCircle, label: 'Appointments Completed', value: response.data.completedAppointments || 0, change: '+5% from last month' },
          ]);
        } else {
          console.error('Failed to fetch stats:', response.message);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchDashboardStats();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    fetchPatientGrowthData();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await getAppointments();
      if (response.success) {
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
        const todayAppointments = response.data.filter(apt => apt.date === today);
        setUpcomingAppointments(todayAppointments);
        setAppointments(response.data);
      } else {
        console.error('Failed to fetch appointments:', response.message);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  const fetchPatientGrowthData = async () => {
    try {
      const response = await getDashboardPatientGrowth();
      if (response.success) {
        // Extract months and counts from the response data
        const months = Object.keys(response.data.patientGrowth).sort();
        const counts = months.map(month => response.data.patientGrowth[month]);

        setPatientGrowthData({
          labels: months,
          datasets: [{
            ...patientGrowthData.datasets[0],
            data: counts
          }]
        });
      } else {
        console.error('Failed to fetch patient growth data:', response.message);
      }
    } catch (error) {
      console.error('Error fetching patient growth data:', error);
    }
  };

  // Calculate the counts of each appointment status
  const statusCounts = appointments.reduce((acc, apt) => {
    acc[apt.status] = (acc[apt.status] || 0) + 1;
    return acc;
  }, {});

  const appointmentsOverviewData = {
    labels: ['Scheduled', 'Completed', 'Cancelled'],
    datasets: [
      {
        label: 'Appointments Overview',
        data: [
          statusCounts['Scheduled'] || 0,
          statusCounts['Completed'] || 0,
          statusCounts['Cancelled'] || 0
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 99, 132, 0.2)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const predictiveInsights = [];

  return (
    <div className="p-6 space-y-6 dark:bg-boxdark">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

       {/* Patient Growth Trend and Appointments Overview */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-meta-2 dark:bg-meta-4 dark:border-strokedark dark:text-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Patient Growth Trend</h2>
            <LineChart className="h-5 w-5 text-gray-400 dark:text-white" />
          </div>
          <Line data={patientGrowthData} options={{ responsive: true }} />
        </div>

        <div className="bg-meta-2 dark:bg-meta-4 dark:border-strokedark dark:text-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appointments Overview</h2>
            <BarChart className="h-5 w-5 text-gray-400 dark:text-white" />
          </div>
          <Bar data={appointmentsOverviewData} />
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
            {upcomingAppointments.map((apt) => (
              <div
                key={apt.id}
                className="flex flex-col sm:flex-row items-start sm:items-center p-4 bg-meta-9 dark:bg-boxdark rounded-lg dark:hover:bg-meta-3 mb-4"
                onClick={() => handleAppointmentClick(apt)}
              >
                <div className="flex-shrink-0 w-full sm:w-20 mb-2 sm:mb-0">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 dark:text-meta-2 mr-1" />
                    <span className="text-sm font-medium text-black dark:text-meta-2">
                      {format(new Date(apt.date), 'MMM dd')} {format(new Date(`1970-01-01T${apt.time}`), 'hh:mm a')}
                    </span>
                  </div>
                </div>
                <div className='ml-2 mr-4'>
                  <span className="text-sm font-medium text-black dark:text-meta-2 ml-4">
                    {apt.appointment_id}
                  </span>
                </div>
                <div className="ml-4 flex-grow">
                  <p className="text-sm font-medium text-black dark:text-white">
                    {apt.patient_name}
                  </p>
                  <p className="text-sm text-black dark:text-meta-2">
                    {apt.treatment_name}
                  </p>
                </div>
                <div className="ml-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      apt.status === 'Scheduled'
                        ? 'text-meta-6 bg-meta-4 dark:bg-green-900'
                        : apt.status === 'Completed'
                        ? 'text-meta-3 bg-meta-4 dark:bg-yellow-900'
                        : apt.status === 'Cancelled'
                        ? 'text-meta-1 bg-meta-4 dark:bg-red-900'
                        : ''
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}
            {upcomingAppointments.length === 0 && (
              <p className="text-sm text-black dark:text-meta-2">No appointments for today.</p>
            )}
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

     
    </div>
  );
};

export default Dashboard;
