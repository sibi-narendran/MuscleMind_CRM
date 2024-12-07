import React, { useState, useEffect } from 'react';
import { DollarSign, Download, Filter } from 'lucide-react';
import { createClient } from '@supabase/supabase-js'; // Import Supabase client

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Billing = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('treatment_name, patient_name, date, status, total_amount');

      if (error) {
        console.error('Error fetching appointments:', error);
      } else {
        setAppointments(data);
      }
    };

    fetchAppointments();
  }, []);

  const handleAppointmentStatusChange = (index, newStatus) => {
    setAppointments((prevAppointments) =>
      prevAppointments.map((appointment, i) =>
        i === index ? { ...appointment, status: newStatus } : appointment
      )
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'text-green-700 bg-green-100 dark:bg-green-700 dark:text-green-100';
      case 'Pending':
        return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-700 dark:text-yellow-100';
      case 'Not Paid':
        return 'text-red-700 bg-red-100 dark:bg-red-700 dark:text-red-100';
      default:
        return 'text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-100';
    }
  };

  const handleGenerateInvoice = (appointment) => {
    // Logic to generate and download invoice
    console.log('Generating invoice for:', appointment);
  };

  const filteredAppointments = appointments.filter(appointment =>
    appointment.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 dark:bg-boxdark">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Billing & Invoices
        </h1>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search by patient name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-meta-4 dark:text-meta-2"
          />
          <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 dark:bg-meta-4 dark:text-meta-2 rounded-lg hover:bg-gray-200 dark:hover:bg-meta-3">
            <Filter className="h-5 w-5 mr-2" />
            Filter
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <DollarSign className="h-5 w-5 mr-2" />
            New Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {[
          { title: 'Total Revenue', value: '$45,678', trend: '+8.3% from last month', trendColor: 'text-green-600' },
          { title: 'Outstanding', value: '$3,456', trend: '4 pending invoices', trendColor: 'text-red-600' },
          { title: 'Paid This Month', value: '$12,345', trend: '15 payments received', trendColor: 'text-green-600' },
          { title: 'Average Invoice', value: '$450', trend: 'Based on 30 days', trendColor: 'text-blue-600' },
        ].map((card, index) => (
          <div
            key={index}
            className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark"
          >
            <p className="text-sm text-gray-500 dark:text-meta-2">{card.title}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</h3>
            <p className={`text-sm mt-2 ${card.trendColor}`}>{card.trend}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-boxdark rounded-xl shadow-sm border border-gray-100 dark:border-strokedark">
        <div className="p-6 border-b border-gray-200 dark:border-strokedark">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Appointments
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-strokedark">
                {['Patient Name', 'Treatment Name', 'Date', 'Total Amount', 'Status', 'Actions'].map((header, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-meta-2 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-boxdark divide-y divide-gray-200 dark:divide-strokedark">
              {filteredAppointments.map((appointment, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-strokedark">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {appointment.patient_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-meta-2">
                    {appointment.treatment_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-meta-2">
                    {appointment.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    ${appointment.total_amount?.toFixed(2) || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={appointment.status}
                      onChange={(e) => handleAppointmentStatusChange(index, e.target.value)}
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Not Paid">Not Paid</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleGenerateInvoice(appointment)}
                      className="text-blue-600 dark:text-meta-2 hover:text-blue-800 dark:hover:text-meta-3"
                    >
                      <Download className="h-5 w-5" />
                      Generate & Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Billing;
