import React, { useState } from "react";
import { Form, Input, Button, Radio, Typography, message } from "antd";
import { FaStethoscope } from "react-icons/fa";
import PrescriptionPreview from "./PrescriptionPreview";
import { addPrescription } from "../api.services/services";

export default function AddPrescriptionForm({ onUpdate }) {
  const [formData, setFormData] = useState({
    patient_name: "",
    age: "",
    gender: "",
    treatment_name: "",
    date: new Date().toISOString().split("T")[0],
    medicines: []
  });

  const handleFormSubmit = async () => {
    try {
      const response = await addPrescription(formData);
      if (response.success) {
        message.success('Prescription added successfully');
        onUpdate();
      } else {
        throw new Error(response.message || 'Failed to add prescription');
      }
    } catch (error) {
      message.error(`Failed to add prescription: ${error.message}`);
      console.error('Error adding prescription:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = formData.medicines.map((medicine, idx) => {
      if (idx === index) {
        return { ...medicine, [field]: value };
      }
      return medicine;
    });
    setFormData(prev => ({
      ...prev,
      medicines: updatedMedicines
    }));
  };

  const addMedicine = () => {
    const newMedicine = {
      name: "",
      dosage: "",
      duration: "",
      morning: false,
      afternoon: false,
      night: false,
      instructions: ""
    };
    setFormData(prev => ({
      ...prev,
      medicines: [...prev.medicines, newMedicine]
    }));
  };

  const handleRemoveMedicine = (index) => {
    setFormData(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, idx) => idx !== index)
    }));
  };

  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <Form
          layout="vertical"
          className="bg-white  p-6 rounded-lg shadow-sm"
          onFinish={handleFormSubmit}
        >
          <div className="space-y-6">
            <Form.Item label="Patient Name">
              <Input
                value={formData.patient_name}
                onChange={(e) => handleInputChange('patient_name', e.target.value)}
                placeholder="Enter patient name"
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="Age">
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="Enter age"
                />
              </Form.Item>
              <Form.Item label="Gender">
                <Radio.Group
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                >
                  <Radio value="Male">Male</Radio>
                  <Radio value="Female">Female</Radio>
                </Radio.Group>
              </Form.Item>
            </div>

            <Form.Item label="Treatment Name">
              <Input
                value={formData.treatment_name}
                onChange={(e) => handleInputChange('treatment_name', e.target.value)}
                placeholder="Enter treatment name"
              />
            </Form.Item>

            <Form.Item label="Date">
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </Form.Item>

            <Form.Item label="Medicines">
              <div className="space-y-4">
                {formData.medicines.map((medicine, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded-lg">
                    <Typography.Text>Medicine Name</Typography.Text>
                    <Input
                      value={medicine.name}
                      onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Typography.Text>Dosage</Typography.Text>
                        <Input
                          value={medicine.dosage}
                          onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                        />
                      </div>
                      <div>
                        <Typography.Text>Duration</Typography.Text>
                        <Input
                          value={medicine.duration}
                          onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Typography.Text>Timing</Typography.Text>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        {['morning', 'afternoon', 'night'].map((time) => (
                          <label key={time} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={medicine[time]}
                              onChange={(e) =>
                                handleMedicineChange(index, time, e.target.checked)
                              }
                            />
                            {time.charAt(0).toUpperCase() + time.slice(1)}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Typography.Text>Special Instructions</Typography.Text>
                      <Input
                        placeholder="Enter any special instructions"
                        value={medicine.instructions}
                        onChange={(e) =>
                          handleMedicineChange(index, 'instructions', e.target.value)
                        }
                      />
                    </div>

                    <Button danger onClick={() => handleRemoveMedicine(index)}>
                      Remove Medicine
                    </Button>
                  </div>
                ))}
                <Button type="dashed" onClick={addMedicine} block>
                  Add Medicine
                </Button>
              </div>
            </Form.Item>

            <Form.Item>
              <Button type="primary" onClick={handleFormSubmit} className="w-full">
                Add Prescription
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>
      <PrescriptionPreview data={formData} />
    </div>
  );
}
