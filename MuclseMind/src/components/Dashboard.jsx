import { Users, Calendar, Activity, TrendingUp, PieChart, CheckCircle, LineChart, BarChart, Clock } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import React, { useEffect, useState } from 'react';
import { getDashboardStats, getTodayAppointments, getDashboardPatientGrowth } from '../api.services/services';
import { format } from 'date-fns';

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const [appointmentStats, setAppointmentStats] = useState({
    scheduled: 0,
    completed: 0,
    cancelled: 0
  });
  const [todayAppointmentStats, setTodayAppointmentStats] = useState({
    scheduled: 0,
    completed: 0,
    cancelled: 0
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await getDashboardStats();
        if (response.success) {
          setStats([
            { 
              icon: Calendar, 
              label: "Today's Appointments", 
              value: response.data.todayAppointments || 0, 
              change: `${response.data.pendingAppointments || 0} pending` 
            },
            { 
              icon: Users, 
              label: 'New Patients', 
              value: response.data.newPatients || 0, 
              change: `${response.data.patientGrowthRate || 0}%` 
            },
            { 
              icon: Activity, 
              label: 'Present Staff Members', 
              value: response.data.presentStaff || 0, 
              change: `${response.data.staffOnLeave || 0} on leave` 
            },
            { 
              icon: CheckCircle, 
              label: 'Appointments Completed', 
              value: response.data.completedAppointments || 0, 
              change: `${response.data.completionRate || 0}% from last month` 
            },
          ]);

          setAppointmentStats({
            scheduled: response.data.appointmentStats?.scheduled || 0,
            completed: response.data.appointmentStats?.completed || 0,
            cancelled: response.data.appointmentStats?.cancelled || 0
          });
        } else {
          console.error('Failed to fetch stats:', response.message);
          message.error('Failed to load dashboard statistics');
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        message.error('Error loading dashboard data');
      }
    };

    const fetchPatientGrowthData = async () => {
      try {
        const response = await getDashboardPatientGrowth();
        if (response.success) {
          const months = Object.keys(response.data.patientGrowth || {}).sort();
          const counts = months.map(month => response.data.patientGrowth[month]);

          setPatientGrowthData({
            labels: months,
            datasets: [{
              label: 'Patient Growth',
              data: counts,
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }]
          });
        } else {
          console.error('Failed to fetch patient growth data:', response.message);
        }
      } catch (error) {
        console.error('Error fetching patient growth data:', error);
      }
    };

    const fetchTodayAppointments = async () => {
      try {
        setIsLoading(true);
        const response = await getTodayAppointments();
        
        if (response.success) {
          setUpcomingAppointments(response.data.map(apt => ({
            id: apt.id,
            appointment_id: apt.appointment_id,
            patient_name: apt.patient_name,
            treatment_name: apt.treatment_name,
            date: apt.date,
            time: apt.time,
            status: apt.status
          })));

          const todayStats = response.data.reduce((acc, apt) => {
            const status = apt.status.toLowerCase();
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {});

          setTodayAppointmentStats({
            scheduled: todayStats.scheduled || 0,
            completed: todayStats.completed || 0,
            cancelled: todayStats.cancelled || 0
          });
        } else {
          console.error('Failed to fetch appointments:', response.message);
          message.error('Failed to fetch today\'s appointments');
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
        message.error('Error loading appointments');
      } finally {
        setIsLoading(false);
      }
    };

    // Initial data fetch
    fetchDashboardStats();
    fetchTodayAppointments();
    fetchPatientGrowthData();

    // Optional: Set up refresh interval
    const refreshInterval = setInterval(() => {
      fetchDashboardStats();
      fetchTodayAppointments();
      fetchPatientGrowthData();
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  // Calculate the counts of each appointment status
  const statusCounts = appointments.reduce((acc, apt) => {
    acc[apt.status] = (acc[apt.status] || 0) + 1;
    return acc;
  }, {});

  const todayAppointmentsOverviewData = {
    labels: ['Scheduled', 'Completed', 'Cancelled'],
    datasets: [
      {
        label: "Today's Appointments Overview",
        data: [
          todayAppointmentStats.scheduled,
          todayAppointmentStats.completed,
          todayAppointmentStats.cancelled
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.2)',  // Yellow for scheduled
          'rgba(75, 192, 192, 0.2)',   // Green for completed
          'rgba(255, 99, 132, 0.2)'    // Red for cancelled
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Appointments Overview</h2>
            <PieChart className="h-5 w-5 text-gray-400 dark:text-white" />
          </div>
          <Bar 
            data={todayAppointmentsOverviewData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    color: 'white'
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    color: 'white',
                    stepSize: 1
                  }
                },
                x: {
                  ticks: {
                    color: 'white'
                  }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Today's Schedule and Predictive Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-meta-4 dark:border-strokedark dark:text-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-black dark:text-white">Today's Schedule</h2>
            <Calendar className="h-5 w-5 text-gray-400 dark:text-white" />
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center p-4 bg-meta-9 dark:bg-boxdark rounded-lg dark:hover:bg-meta-3 mb-4"
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
                            ? 'text-meta-6 bg-meta-4 '
                            : apt.status === 'Completed'
                            ? 'text-meta-3 bg-meta-4 '
                            : apt.status === 'Cancelled'
                            ? 'text-meta-1 bg-meta-4'
                            : ''
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-black dark:text-meta-2">No appointments for today.</p>
              )}
            </div>
          )}
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
