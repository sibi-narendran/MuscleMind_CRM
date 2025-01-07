import React, { useState, useEffect } from "react";
import { Modal, Input, Select, Button, message, Form, Tooltip } from "antd";
import { getTreatments, updateBilling } from "../interceptor/services";
import { Plus, X } from "lucide-react";

const EditBillingModal = ({ isOpen, onClose, billing, onUpdate }) => {
  const [form] = Form.useForm();
  const [treatments, setTreatments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTreatments, setSelectedTreatments] = useState([]);
  const [showTreatmentSearch, setShowTreatmentSearch] = useState(false);
  const [customTreatment, setCustomTreatment] = useState({ name: "", cost: "" });
  const [showCustomForm, setShowCustomForm] = useState(false);

  useEffect(() => {
    fetchTreatments();
  }, []);

  useEffect(() => {
    if (billing) {
      const initialTreatments = billing.treatment_name?.split(', ').map(name => ({
        name,
        cost: billing.cost / (billing.treatment_name?.split(', ').length || 1)
      })) || [];
      
      setSelectedTreatments(initialTreatments);
      form.setFieldsValue({
        invoice_no: billing.invoice_no,
        patient_name: billing.patient_name,
        invoice_status: billing.invoice_status
      });
    }
  }, [billing, form]);

  const fetchTreatments = async () => {
    try {
      const response = await getTreatments();
      setTreatments(response.data || []);
    } catch (error) {
      console.error("Error fetching treatments:", error);
      message.error("Failed to fetch treatments");
    }
  };

  const handleAddTreatment = (treatment) => {
    setSelectedTreatments(prev => [...prev, {
      name: treatment.procedure_name,
      cost: treatment.cost
    }]);
    setShowTreatmentSearch(false);
    setSearchTerm("");
  };

  const handleAddCustomTreatment = () => {
    if (!customTreatment.name || !customTreatment.cost) {
      message.error("Please fill in both name and cost");
      return;
    }
    setSelectedTreatments(prev => [...prev, {
      name: customTreatment.name,
      cost: parseFloat(customTreatment.cost)
    }]);
    setCustomTreatment({ name: "", cost: "" });
    setShowCustomForm(false);
  };

  const handleRemoveTreatment = (index) => {
    setSelectedTreatments(prev => prev.filter((_, i) => i !== index));
  };

  const handleTreatmentCostChange = (index, newCost) => {
    setSelectedTreatments(prev => prev.map((treatment, i) => 
      i === index ? { ...treatment, cost: parseFloat(newCost) || 0 } : treatment
    ));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const totalCost = selectedTreatments.reduce((sum, t) => sum + (parseFloat(t.cost) || 0), 0);
      const treatmentNames = selectedTreatments.map(t => t.name).join(', ');

      const updatedBilling = {
        ...values,
        id: billing.id,
        cost: totalCost,
        treatment_name: treatmentNames
      };

      await updateBilling(billing.id, updatedBilling);
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating billing:", error);
      message.error("Failed to update billing");
    }
  };

  const filteredTreatments = treatments.filter(treatment =>
    treatment.procedure_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal
      title="Edit Billing"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Invoice Number" name="invoice_no">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Patient Name" name="patient_name">
              <Input disabled />
            </Form.Item>
          </div>

          <Form.Item label="Status" name="invoice_status">
            <Select>
              <Select.Option value="Paid">Paid</Select.Option>
              <Select.Option value="Pending">Pending</Select.Option>
              <Select.Option value="Not Paid">Not Paid</Select.Option>
            </Select>
          </Form.Item>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium">Treatments</label>
              <Button 
                type="primary"
                onClick={() => setShowTreatmentSearch(true)}
                icon={<Plus size={16} />}
              >
                Add Treatment
              </Button>
            </div>

            {/* Selected Treatments List */}
            <div className="space-y-2 mb-4">
              {selectedTreatments.map((treatment, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded">
                  <span className="flex-grow">{treatment.name}</span>
                  <Input
                    type="number"
                    value={treatment.cost}
                    onChange={(e) => handleTreatmentCostChange(index, e.target.value)}
                    className="w-24"
                    prefix="₹"
                  />
                  <Button
                    type="text"
                    danger
                    icon={<X size={16} />}
                    onClick={() => handleRemoveTreatment(index)}
                  />
                </div>
              ))}
            </div>

            {/* Treatment Search */}
            {showTreatmentSearch && (
              <div className="border rounded p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <Input
                    placeholder="Search treatments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-2"
                  />
                  <Button 
                    type="link"
                    onClick={() => setShowCustomForm(true)}
                  >
                    Add Custom
                  </Button>
                </div>

                {/* Search Results */}
                <div className="max-h-40 overflow-y-auto">
                  {filteredTreatments.map((treatment) => (
                    <div
                      key={treatment.treatment_id}
                      className="flex justify-between items-center p-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleAddTreatment(treatment)}
                    >
                      <span>{treatment.procedure_name}</span>
                      <span>₹{treatment.cost}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Treatment Form */}
            {showCustomForm && (
              <div className="border rounded p-4 mb-4">
                <h4 className="font-medium mb-2">Add Custom Treatment</h4>
                <div className="space-y-2">
                  <Input
                    placeholder="Treatment name"
                    value={customTreatment.name}
                    onChange={(e) => setCustomTreatment(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    type="number"
                    placeholder="Cost"
                    value={customTreatment.cost}
                    onChange={(e) => setCustomTreatment(prev => ({ ...prev, cost: e.target.value }))}
                    prefix="₹"
                  />
                  <div className="flex justify-end gap-2">
                    <Button onClick={() => setShowCustomForm(false)}>Cancel</Button>
                    <Button type="primary" onClick={handleAddCustomTreatment}>Add</Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-lg font-medium">
              Total: ₹{selectedTreatments.reduce((sum, t) => sum + (parseFloat(t.cost) || 0), 0).toFixed(2)}
            </div>
            <div className="flex gap-2">
              <Button onClick={onClose}>Cancel</Button>
              <Button type="primary" htmlType="submit">Save Changes</Button>
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default EditBillingModal;