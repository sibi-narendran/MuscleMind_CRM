import React, { useState, useEffect } from "react";
import { Modal, Input, Select, Button, Checkbox, message } from "antd";
import { getTreatments, createBilling, getPatients } from "../api.services/services";
import PropTypes from "prop-types";

const { Option } = Select;

const AddInvoiceModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    patient_id: "",
    patient_name: "",
    treatment_name: "",
    treatment_id: "",
    invoice_status: "Pending",
    date: new Date().toISOString().split('T')[0],
  });
  const [treatments, setTreatments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedTreatments, setSelectedTreatments] = useState({});
  const [treatmentCosts, setTreatmentCosts] = useState({});
  const [totalCost, setTotalCost] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [treatmentsResponse, patientsResponse] = await Promise.all([
          getTreatments(),
          getPatients()
        ]);
        setTreatments(treatmentsResponse.data || []);
        setPatients(patientsResponse.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Failed to load data");
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handlePatientChange = (value, option) => {
    setFormData(prev => ({
      ...prev,
      patient_id: value,
      patient_name: option.children
    }));
  };

  const handleTreatmentChange = (treatmentId, isChecked) => {
    const treatment = treatments.find(t => t.treatment_id === treatmentId);
    if (treatment) {
      setSelectedTreatments(prev => ({
        ...prev,
        [treatmentId]: isChecked
      }));
      
      setTreatmentCosts(prev => {
        const updated = { ...prev };
        if (isChecked) {
          updated[treatmentId] = parseFloat(treatment.cost) || 0;
        } else {
          delete updated[treatmentId];
        }
        return updated;
      });
    }
  };

  const handleTreatmentCostChange = (treatmentId, newCost) => {
    setTreatmentCosts(prev => ({
      ...prev,
      [treatmentId]: parseFloat(newCost) || 0
    }));
  };

  useEffect(() => {
    const newTotal = Object.values(treatmentCosts).reduce((sum, cost) => sum + (parseFloat(cost) || 0), 0);
    setTotalCost(newTotal);
  }, [treatmentCosts]);

  const resetForm = () => {
    setFormData({
      patient_id: "",
      patient_name: "",
      treatment_name: "",
      treatment_id: "",
      invoice_status: "Pending",
      date: new Date().toISOString().split('T')[0],
    });
    setSelectedTreatments({});
    setTreatmentCosts({});
    setTotalCost(0);
  };

  const handleSubmit = async () => {
    try {
      if (isSubmitting) return;
      setIsSubmitting(true);

      if (!formData.patient_id) {
        message.error("Please select a patient");
        return;
      }

      if (Object.keys(selectedTreatments).length === 0) {
        message.error("Please select at least one treatment");
        return;
      }

      const selectedTreatmentDetails = Object.keys(selectedTreatments)
        .filter(id => selectedTreatments[id])
        .map(id => {
          const treatment = treatments.find(t => t.treatment_id === parseInt(id));
          return {
            treatment_id: treatment.treatment_id,
            treatment_name: treatment.procedure_name,
            cost: treatmentCosts[id]
          };
        });

      const newInvoice = {
        invoice_no: `INV-${Date.now().toString().slice(-6)}`,
        patient_id: formData.patient_id,
        patient_name: formData.patient_name,
        treatment_id: selectedTreatmentDetails.map(t => t.treatment_id).join(','),
        treatment_name: selectedTreatmentDetails.map(t => t.treatment_name).join(', '),
        cost: totalCost,
        invoice_status: formData.invoice_status,
        date: formData.date
      };

      const response = await createBilling(newInvoice);
      
      if (response.success) {
        await onSuccess();
        resetForm();
      } else {
        throw new Error(response.message || 'Failed to create invoice');
      }
    } catch (error) {
      if (error.message.includes('already exists')) {
        message.error("This invoice number already exists. Please try again.");
      } else {
        message.error("Failed to create invoice: " + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title="Create New Invoice"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Create Invoice
        </Button>
      ]}
    >
      <div className="space-y-4">
        <div>
          <label>Patient Name</label>
          <Select
            showSearch
            value={formData.patient_id}
            onChange={handlePatientChange}
            placeholder="Select a patient"
            className="w-full"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {patients.map(patient => (
              <Option key={patient.id} value={patient.id}>
                {`${patient.patient_id}-${patient.name}`}
              </Option>
            ))}
          </Select>
        </div>
        <div>
          <label>Status</label>
          <Select
            value={formData.invoice_status}
            onChange={(value) => setFormData(prev => ({ ...prev, invoice_status: value }))}
            className="w-full"
          >
            <Option value="Paid">Paid</Option>
            <Option value="Pending">Pending</Option>
            <Option value="Not Paid">Not Paid</Option>
          </Select>
        </div>
        <div>
          <label>Treatments</label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {treatments.map((treatment) => (
              <div key={treatment.treatment_id} className="flex items-center space-x-4">
                <Checkbox
                  checked={selectedTreatments[treatment.treatment_id]}
                  onChange={(e) => handleTreatmentChange(treatment.treatment_id, e.target.checked)}
                />
                <span className="flex-grow">{treatment.procedure_name}</span>
                {selectedTreatments[treatment.treatment_id] && (
                  <Input
                    type="number"
                    className="w-24"
                    value={treatmentCosts[treatment.treatment_id]}
                    onChange={(e) => handleTreatmentCostChange(treatment.treatment_id, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <label>Total Cost</label>
          <Input
            value={totalCost.toFixed(2)}
            disabled
            prefix="₹"
          />
        </div>
      </div>
    </Modal>
  );
};

AddInvoiceModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
};

export default AddInvoiceModal; 