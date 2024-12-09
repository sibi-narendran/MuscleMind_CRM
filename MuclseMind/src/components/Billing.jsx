import React, { useState, useEffect } from "react";
import { DollarSign, Download, Filter, Trash2 } from "lucide-react";
import {
  getBillings,
  createBilling,
  updateBilling,
  deleteBilling,
} from "../api.services/services";

const Billing = () => {
  const [billings, setBillings] = useState([]);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBillings();
  }, []);

  const fetchBillings = async () => {
    try {
      const response = await getBillings();
      console.log("Fetched billings:", response);
      setBillings(response.data || []);
    } catch (error) {
      console.error("Error fetching billings:", error);
    }
  };

  const handleGenerateBilling = async () => {
    try {
      const newBilling = {
        /* populate with necessary data */
      };
      await createBilling(newBilling);
      fetchBillings();
    } catch (error) {
      console.error("Error generating billing:", error);
    }
  };

  const handleEditBilling = async (id, updatedData) => {
    try {
      await updateBilling(id, updatedData);
      fetchBillings();
    } catch (error) {
      console.error("Error updating billing:", error);
    }
  };

  const handleDeleteBilling = async (id) => {
    if (!id) {
      console.error("Invalid billing ID:", id);
      return;
    }
    try {
      await deleteBilling(id);
      fetchBillings();
      message.success("Billing deleted successfully");
    } catch (error) {
      message.error("Failed to delete billing: " + error.message);
    }
  };  

  const handleStatusChange = async (billingId, newStatus) => {
    try {
      await updateBilling(billingId, { invoice_status: newStatus });
      fetchBillings();
      message.success("Billing status updated successfully");
    } catch (error) {
      message.error("Failed to update billing status: " + error.message);
    }
  };

  const filteredBillings = billings.filter((billing) =>
    billing.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "text-meta-3  bg-meta-4 dark:bg-meta-4 dark:meta-3";
      case "Pending":
        return "text-meta-6 bg-meta-4 dark:bg-meta-4 dark:text-meta-6";
      case "Not Paid":
        return "text-meta- bg-meta-4 dark:bg-meta-4 dark:text-meta-1";
      default:
        return "text-gray-700 bg-gray-100 dark:bg-meta-2 dark:text-gray-100";
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
          {
            title: "Total Revenue",
            value: "$45,678",
            trend: "+8.3% from last month",
            trendColor: "text-green-600",
          },
          {
            title: "Outstanding",
            value: "$3,456",
            trend: "4 pending invoices",
            trendColor: "text-red-600",
          },
          {
            title: "Paid This Month",
            value: "$12,345",
            trend: "15 payments received",
            trendColor: "text-green-600",
          },
          {
            title: "Average Invoice",
            value: "$450",
            trend: "Based on 30 days",
            trendColor: "text-blue-600",
          },
        ].map((card, index) => (
          <div
            key={index}
            className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark"
          >
            <p className="text-sm text-gray-500 dark:text-meta-2">
              {card.title}
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {card.value}
            </h3>
            <p className={`text-sm mt-2 ${card.trendColor}`}>{card.trend}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-boxdark rounded-xl shadow-sm border border-gray-100 dark:border-strokedark">
        <div className="p-6 border-b border-gray-200 dark:border-strokedark flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Billings
          </h2>
          <input
            type="text"
            placeholder="Search by patient name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-meta-4 dark:text-meta-2"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-strokedark">
                {[
                  "Invoice Number",
                  "Patient Name",
                  "Treatment Name",
                  "Date",
                  "Total Amount",
                  "Status",
                  "Actions",
                ].map((header, index) => (
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
              {filteredBillings.map((billing, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-strokedark"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {billing.invoice_no || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {billing.patient_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-meta-2">
                    {billing.treatment_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-meta-2">
                    {(() => {
                      if (billing.date) {
                        const date = new Date(billing.date);
                        if (!isNaN(date)) {
                          const isoDate = date.toISOString().split("T")[0];
                          const [year, month, day] = isoDate.split("-");
                          return `${day}-${month}-${year}`;
                        }
                      }
                      return "N/A";
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    ${billing.cost?.toFixed(2) || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={billing.invoice_status}
                      onChange={(e) =>
                        handleStatusChange(billing.id, e.target.value)
                      }
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(billing.invoice_status)}`}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Not Paid">Not Paid</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center">
                    <button
                      onClick={() => handleGenerateInvoice(billing)}
                      className="text-blue-600 dark:text-meta-2 hover:text-blue-800 dark:hover:text-meta-3 mr-2"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBilling(billing.id)}
                      className="text-red-600 dark:text-meta-2 hover:text-red-800 dark:hover:text-meta-3"
                    >
                      <Trash2 className="h-5 w-5" />
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
