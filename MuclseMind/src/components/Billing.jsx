import React, { useState, useEffect } from "react";
import { DollarSign, Download, Filter, Trash2 } from "lucide-react";
import { getBillings, getTreatments, createBilling, updateBilling, deleteBilling } from "../api.services/services";
import { generateBillingPDF } from "../lib/BillGenerator";

const Billing = () => {
  const [billings, setBillings] = useState([]);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentBilling, setCurrentBilling] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [selectedTreatments, setSelectedTreatments] = useState({});
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    fetchBillings();
    fetchTreatments();
  }, []);

  const fetchBillings = async () => {
    try {
      const response = await getBillings();
      setBillings(response.data || []); 
    } catch (error) {
      console.error("Error fetching billings:", error);
    }
  };

  const fetchTreatments = async () => {
    try {
      const response = await getTreatments();
      setTreatments(response.data || []); 
    } catch (error) {
      console.error("Error fetching treatments:", error);
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
    } catch (error) {
      console.error("Failed to delete billing:", error);
    }
  };  

  const handleStatusChange = async (billingId, newStatus) => {
    try {
      await updateBilling(billingId, { invoice_status: newStatus });
      fetchBillings();
    } catch (error) {
      console.error("Failed to update billing status:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "text-meta-3 bg-meta-4 dark:bg-meta-4 dark:meta-3";
      case "Pending":
        return "text-meta-6 bg-meta-4 dark:bg-meta-4 dark:text-meta-6";
      case "Not Paid":
        return "text-meta-1 bg-meta-4 dark:bg-meta-4 dark:text-meta-1";
      default:
        return "text-gray-700 bg-gray-100 dark:bg-meta-2 dark:text-gray-100";
    }
  };

  const handleCheckboxChange = (treatmentId, isChecked) => {
    setSelectedTreatments((prev) => {
      const updated = { ...prev };
      if (isChecked) {
        const treatment = treatments.find(t => t.treatment_id === treatmentId);
        if (treatment) {
          updated[treatmentId] = parseFloat(treatment.cost) || 0;
        }
      } else {
        delete updated[treatmentId];
      }
      return updated;
    });
  };

  useEffect(() => {
    const total = Object.values(selectedTreatments).reduce((sum, cost) => sum + parseFloat(cost), 0);
    setTotalCost(total);
  }, [selectedTreatments]);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const treatmentNames = Object.keys(selectedTreatments)
        .map(id => treatments.find(t => t.treatment_id === parseInt(id))?.procedure_name)
        .filter(Boolean)
        .join(', ');

      const newBilling = {
        invoice_no: `INV-${Date.now().toString().slice(-6)}`,
        patient_name: formData.get('patient_name'),
        patient_id: 1,
        treatment_name: treatmentNames,
        cost: totalCost,
        date: new Date().toISOString(),
        invoice_status: 'Pending'
      };

      await createBilling(newBilling);
      await fetchBillings();
      setSelectedTreatments({});
      setTotalCost(0);
      setShowModal(false);
      message.success("Invoice created successfully");
    } catch (error) {
      message.error("Failed to create invoice");
    }
  };

  const handleGenerateInvoice = async (billing) => {
    const success = await generateBillingPDF(billing);
    if (success) {
      message.success("Invoice PDF generated successfully");
    } else {
      message.error("Failed to generate PDF");
    }
  };


  const filteredBillings = billings.filter((billing) =>
    billing.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 dark:bg-boxdark">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[
          {
            title: "Total Revenue",
            value: `$${filteredBillings.reduce((sum, b) => sum + (parseFloat(b.cost) || 0), 0).toFixed(2)}`,
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
        <div className="p-6 border-b border-gray-200 dark:border-strokedark">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Billings
          </h2>
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
              {filteredBillings.map((billing) => (
                <tr
                  key={billing.id}
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
                    {new Date(billing.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    ${parseFloat(billing.cost || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(billing.invoice_status)}`}>
                      {billing.invoice_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => generateBillingPDF(billing)}
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