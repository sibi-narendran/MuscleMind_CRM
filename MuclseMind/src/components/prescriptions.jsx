import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 dark:bg-boxdark">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Prescriptions
        </h1>
     
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {[
          { title: 'Total Prescriptions', value: '1,234', trend: '+5% from last month', trendColor: 'text-green-600' },
          { title: 'Filled This Month', value: '567', trend: '20 prescriptions filled', trendColor: 'text-green-600' },
          { title: 'Average Prescriptions', value: '45', trend: 'Based on 30 days', trendColor: 'text-blue-600' },
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
        <div className="p-6 border-b border-gray-200 dark:border-strokedark flex justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Prescriptions
          </h2>
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
        </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-strokedark">
                {['Prescription No', 'Patient Name', 'Medication', 'Date', 'Total Amount', 'Actions'].map((header, index) => (
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
              {filteredPrescriptions.map((prescription, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-strokedark">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {prescription.prescription_no}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {prescription.patient_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-meta-2">
                    {prescription.medication_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-meta-2">
                    {prescription.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    ${prescription.total_amount?.toFixed(2) || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => console.log('View details for:', prescription)}
                      className="text-blue-600 dark:text-meta-2 hover:text-blue-800 dark:hover:text-meta-3"
                    >
                      View Details
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

export default Prescriptions;
