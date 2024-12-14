import React, { useState, useEffect } from "react";
import { Modal, Input, Select, Button, Checkbox, message } from "antd";
import { getTreatments, updateBilling } from "../api.services/services";

const { Option } = Select;

const EditBillingModal = ({ isOpen, onClose, billing, onUpdate }) => {
  const [editedBilling, setEditedBilling] = useState(billing);
  const [treatments, setTreatments] = useState([]);
  const [selectedTreatments, setSelectedTreatments] = useState({});
  const [totalCost, setTotalCost] = useState(billing?.cost || 0);
  const [treatmentCosts, setTreatmentCosts] = useState({});

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const response = await getTreatments();
        setTreatments(response.data || []);
      } catch (error) {
        console.error("Error fetching treatments:", error);
      }
    };

    fetchTreatments();
  }, []);

  useEffect(() => {
    if (billing && treatments.length > 0) {
      setEditedBilling(billing);
      setTotalCost(billing.cost);
      
      if (billing.treatment_name) {
        const treatmentNames = billing.treatment_name.split(', ');
        const initialTreatments = {};
        const initialCosts = {};
        
        treatmentNames.forEach(name => {
          const treatment = treatments.find(t => t.procedure_name === name);
          if (treatment) {
            initialTreatments[treatment.treatment_id] = true;
            initialCosts[treatment.treatment_id] = parseFloat(treatment.cost) || 0;
          }
        });
        
        setSelectedTreatments(initialTreatments);
        setTreatmentCosts(initialCosts);
      }
    }
  }, [billing, treatments]);

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
    // Calculate total cost whenever treatment costs change
    const newTotal = Object.values(treatmentCosts).reduce((sum, cost) => sum + (parseFloat(cost) || 0), 0);
    setTotalCost(newTotal);
  }, [treatmentCosts]);

  const handleSubmit = async () => {
    try {
      if (!editedBilling.id) {
        throw new Error('Billing ID is missing');
      }

      const updatedBilling = {
        ...editedBilling,
        cost: totalCost,
        treatment_name: Object.keys(selectedTreatments)
          .filter(id => selectedTreatments[id])
          .map(id => treatments.find(t => t.treatment_id === parseInt(id))?.procedure_name)
          .filter(Boolean)
          .join(', ')
      };

      await updateBilling(editedBilling.id, updatedBilling);
      message.success("Billing updated successfully");
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      message.error("Failed to update billing: " + error.message);
    }
  };

  return (
    <Modal
      title="Edit Billing"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Update
        </Button>
      ]}
    >
      <div className="space-y-4">
        <div>
          <label>Invoice Number</label>
          <Input
            value={editedBilling?.invoice_no}
            disabled
          />
        </div>
        <div>
          <label>Patient Name</label>
          <Input
            value={editedBilling?.patient_name}
            disabled
          />
        </div>
        <div>
          <label>Status</label>
          <Select
            value={editedBilling?.invoice_status}
            onChange={(value) => setEditedBilling(prev => ({ ...prev, invoice_status: value }))}
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
            prefix="$"
          />
        </div>
      </div>
    </Modal>
  );
};

export default EditBillingModal; 