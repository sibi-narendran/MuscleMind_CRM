import React, { useState } from 'react';
import { DollarSign, Download, Filter } from 'lucide-react';

const Billing = () => {
  const [invoices, setInvoices] = useState([
    {
      id: 'INV-001',
      patient: 'Sarah Johnson',
      date: '2024-02-20',
      amount: 250.0,
      status: 'Paid',
      treatment: 'Dental Cleaning',
    },
    {
      id: 'INV-002',
      patient: 'Michael Chen',
      date: '2024-02-22',
      amount: 800.0,
      status: 'Pending',
      treatment: 'Root Canal',
    },
  ]);

  const handleStatusChange = (id, newStatus) => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice) =>
        invoice.id === id ? { ...invoice, status: newStatus } : invoice
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

  return (
    <div className="p-6 dark:bg-boxdark">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Billing & Invoices
        </h1>
        <div className="flex space-x-4">
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
            Recent Invoices
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-strokedark">
                {['Invoice ID', 'Patient', 'Date', 'Treatment', 'Amount', 'Status', 'Actions'].map((header, index) => (
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
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-strokedark">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {invoice.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {invoice.patient}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-meta-2">
                    {invoice.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-meta-2">
                    {invoice.treatment}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    ${invoice.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={invoice.status}
                      onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Not Paid">Not Paid</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 dark:text-meta-2 hover:text-blue-800 dark:hover:text-meta-3">
                      <Download className="h-5 w-5" />
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
