import React, { useState, useEffect } from "react";
import { DollarSign, Download, Filter, Trash2, Edit, Search, X } from "lucide-react";
import { Modal, message, Spin } from "antd";
import { getBillings, deleteBilling } from "../api.services/services";
import { generateBillingPDF } from "../lib/BillGenerator";
import EditBillingModal from "./EditBillingModal";
import AddInvoiceModal from "./AddInvoiceModal";
import invoicePNG from "../assets/invoice.png";

const Billing = () => {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [treatments, setTreatments] = useState([]);
  const [selectedTreatments, setSelectedTreatments] = useState({});
  const [totalCost, setTotalCost] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchBillings();
  }, []);

  const fetchBillings = async () => {
    try {
      setLoading(true);
      const response = await getBillings();
      setBillings(response.data?.filter(billing => billing !== null) || []); 
    } catch (error) {
      console.error("Error fetching billings:", error);
      message.error("Failed to fetch billings");
      setBillings([]);
    } finally {
      setLoading(false);
    }
  };


  const handleEditBilling = async () => {
    try {
      await fetchBillings();
      setIsEditModalOpen(false);
      setSelectedBilling(null);
    } catch (error) {
      console.error("Error updating billing:", error);
      message.error("Failed to update billing");
    }
  };

  const handleDeleteBilling = async (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this invoice?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No, Cancel',
      onOk: async () => {
        try {
          await deleteBilling(id);
          message.success('Invoice deleted successfully');
          fetchBillings();
        } catch (error) {
          message.error('Failed to delete invoice');
          console.error("Failed to delete billing:", error);
        }
      },
    });
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

  const handleGenerateInvoice = async (billing) => {
    if (!billing) {
      message.error("Invalid billing data");
      return;
    }

    if (billing.invoice_status !== 'Paid') {
      Modal.warning({
        title: 'Payment Pending',
        content: (
          <div>
            <p>This invoice cannot be downloaded as payment is {billing.invoice_status.toLowerCase()}.</p>
            <p className="mt-2 text-gray-500">Please complete the payment to generate the invoice.</p>
          </div>
        ),
        okText: 'Close',
        centered: true,
        className: 'custom-modal-warning'
      });
      return;
    }

    try {
      const success = await generateBillingPDF(billing);
      if (success) {
        message.success("Invoice PDF generated successfully");
      } else {
        message.error("Failed to generate PDF");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      message.error("Failed to generate PDF");
    }
  };

  const renderDownloadButton = (billing) => {
    const isPaid = billing.invoice_status === 'Paid';
    
    return (
      <button
        onClick={() => handleGenerateInvoice(billing)}
        className={`p-2 rounded-lg ${
          isPaid 
            ? 'text-success hover:bg-success/10 active:bg-success/20' 
            : 'text-gray-400 cursor-not-allowed'
        }`}
        disabled={!isPaid}
        title={isPaid ? "Download Invoice" : "Payment pending"}
      >
        <Download size={18} />
      </button>
    );
  };

  const handleEditClick = (billing) => {
    if (!billing.id) {
      message.error("Invalid billing record");
      return;
    }
    setSelectedBilling(billing);
    setIsEditModalOpen(true);
  };

  const filteredBillings = billings.filter((billing) => {
    if (!billing) return false;
    
    const searchLower = searchTerm.toLowerCase().trim();
    
    if (searchTerm === "") return true;

    switch (searchType) {
      case "invoice":
        return billing.invoice_no?.toLowerCase().includes(searchLower);
      case "patient":
        return billing.patient_id?.toLowerCase().includes(searchLower);
      case "name":
        return billing.patient_name?.toLowerCase().includes(searchLower);
      case "all":
      default:
        return (
          billing.invoice_no?.toLowerCase().includes(searchLower) ||
          billing.patient_id?.toLowerCase().includes(searchLower) ||
          billing.patient_name?.toLowerCase().includes(searchLower)
        );
    }
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid Date';
    }
  };

  const sortedBillings = [...filteredBillings].sort((a, b) => {
    if (!a?.date || !b?.date) return 0;
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const handleSortChange = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const tableHeaders = [
    "Invoice Number",
    "Patient Name",
    "Treatment Name",
    {
      label: "Date",
      sortable: true,
      onClick: handleSortChange,
      icon: sortOrder === 'desc' ? '↓' : '↑'
    },
    "Total Amount",
    "Status",
    "Actions",
  ];

  const calculateStatistics = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Calculate total revenue (from all paid invoices)
    const totalRevenue = filteredBillings
      .filter(b => b?.invoice_status === 'Paid')
      .reduce((sum, b) => sum + (parseFloat(b?.cost) || 0), 0);

    // Calculate outstanding amount (from pending and unpaid invoices)
    const outstandingAmount = filteredBillings
      .filter(b => b?.invoice_status !== 'Paid')
      .reduce((sum, b) => sum + (parseFloat(b?.cost) || 0), 0);

    // Calculate this month's payments
    const thisMonthPaid = filteredBillings
      .filter(b => {
        const billDate = new Date(b?.date);
        return b?.invoice_status === 'Paid' && 
               billDate >= firstDayOfMonth && 
               billDate <= today;
      })
      .reduce((sum, b) => sum + (parseFloat(b?.cost) || 0), 0);

    // Count pending invoices
    const pendingCount = filteredBillings
      .filter(b => b?.invoice_status !== 'Paid').length;

    // Count this month's paid invoices
    const paidThisMonthCount = filteredBillings
      .filter(b => {
        const billDate = new Date(b?.date);
        return b?.invoice_status === 'Paid' && 
               billDate >= firstDayOfMonth && 
               billDate <= today;
      }).length;

    // Calculate average invoice amount
    const averageInvoice = filteredBillings.length > 0
      ? (totalRevenue / filteredBillings.filter(b => b?.invoice_status === 'Paid').length).toFixed(2)
      : 0;

    return [
      {
        title: "Total Revenue",
        value: `$${totalRevenue.toFixed(2)}`,
        trend: `${paidThisMonthCount} invoices paid`,
        trendColor: "text-green-600",
      },
      {
        title: "Outstanding",
        value: `$${outstandingAmount.toFixed(2)}`,
        trend: `${pendingCount} pending invoices`,
        trendColor: "text-red-600",
      },
      {
        title: "Paid This Month",
        value: `$${thisMonthPaid.toFixed(2)}`,
        trend: `${paidThisMonthCount} payments received`,
        trendColor: "text-green-600",
      },
      {
        title: "Average Invoice",
        value: `$${averageInvoice}`,
        trend: "Based on paid invoices",
        trendColor: "text-blue-600",
      },
    ];
  };

  const renderSearchBar = () => (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg 
                     focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                     dark:bg-boxdark dark:border-strokedark dark:text-white"
            placeholder="Search invoices..."
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none 
                     focus:border-primary dark:bg-boxdark dark:border-strokedark dark:text-white"
          >
            <option value="all">All Fields</option>
            <option value="invoice">Invoice Number</option>
            <option value="patient">Patient ID</option>
            <option value="name">Patient Name</option>
          </select>
        </div>
      </div>
      {searchTerm && (
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Found {filteredBillings.length} result{filteredBillings.length !== 1 ? 's' : ''}
          {searchType !== 'all' && ` for ${searchType}`}
        </div>
      )}
    </div>
  );

  const handleInvoiceAdded = async () => {
    try {
      await fetchBillings();
      message.success("Invoice created successfully");
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error refreshing billings:", error);
      message.error("Invoice created but failed to refresh list");
    }
  };

  return (
    <div className="p-6 dark:bg-boxdark">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
          Billing & Invoices
        </h1>
        <div className="flex space-x-4">
          
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <DollarSign className="h-5 w-5 mr-2" />
            New Invoice
          </button>
        </div>
      </div>

      {renderSearchBar()}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {calculateStatistics().map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark"
          >
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {stat.title}
            </h3>
            <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
              {stat.value}
            </p>
            <p className={`text-sm mt-2 ${stat.trendColor}`}>
              {stat.trend}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-boxdark rounded-xl shadow-sm border border-gray-100 dark:border-strokedark">
        <div className="p-6 border-b border-gray-200 dark:border-strokedark">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Billings
          </h2>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <img 
              src={invoicePNG} 
              alt="Loading" 
              className="w-32 h-32 mb-4 opacity-50"
            />
            <Spin size="large" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Loading invoices...
            </p>
          </div>
        ) : sortedBillings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <img 
              src={invoicePNG} 
              alt="No Invoices" 
              className="w-32 h-32 mb-4"
            />
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              No Invoices Found
            </p>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {searchTerm ? "No invoices match your search" : "Create your first invoice by clicking the 'New Invoice' button above"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-strokedark">
                  {tableHeaders.map((header, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-meta-2 uppercase tracking-wider"
                      onClick={typeof header === 'object' && header.sortable ? header.onClick : undefined}
                      style={typeof header === 'object' && header.sortable ? { cursor: 'pointer' } : {}}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{typeof header === 'object' ? header.label : header}</span>
                        {typeof header === 'object' && header.sortable && (
                          <span className="text-xs">{header.icon}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-boxdark divide-y divide-gray-200 dark:divide-strokedark">
                {sortedBillings.map((billing) => (
                  billing && (
                    <tr key={billing.id} className="border-b dark:border-strokedark">
                      <td className="px-6 py-4 whitespace-nowrap">
                        #{billing.invoice_no || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {billing.patient_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-meta-2">
                        {billing.treatment_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-meta-2">
                        {formatDate(billing.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        ${parseFloat(billing.cost || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(billing.invoice_status)}`}>
                          {billing.invoice_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {renderDownloadButton(billing)}
                          <button
                            onClick={() => handleEditClick(billing)}
                            className="p-2 rounded-lg text-primary hover:bg-primary/10 active:bg-primary/20"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteBilling(billing.id)}
                            className="p-2 rounded-lg text-danger hover:bg-danger/10 active:bg-danger/20"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddInvoiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleInvoiceAdded}
      />

      <EditBillingModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBilling(null);
        }}
        billing={selectedBilling}
        onUpdate={handleEditBilling}
      />
    </div>
  );
};

export default Billing;