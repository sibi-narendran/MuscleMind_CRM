import React, { useState } from "react";
import { Form, Input, Button, Radio, Typography, message, Checkbox } from "antd";
import { FaStethoscope } from "react-icons/fa";
import PrescriptionPreview from "./PrescriptionPreview";
import { addPrescription } from "../interceptor/services";

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
                  <div key={index} className="relative space-y-2 p-4 border rounded-lg bg-gray-50">
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(index)}
                      className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-100 text-red-500 transition-colors"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    </button>

                    <p className="text-sm text-gray-600 font-medium">Medicine {index + 1}</p>
                    <Input 
                      placeholder="Medicine Name"
                      value={medicine.name} 
                      onChange={(e) => handleMedicineChange(index, 'name', e.target.value)} 
                    />
                    <p className="text-sm text-gray-600">Dosage</p>
                    <Input
                      placeholder="e.g., 1 tablet"
                      value={medicine.dosage}
                      onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                    />
                    <p className="text-sm text-gray-600">Duration</p>
                    <Input
                      placeholder="e.g., 7 days"
                      value={medicine.duration}
                      onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                    />
                    <div className="flex gap-4 mt-2">
                      <Checkbox
                        checked={medicine.morning}
                        onChange={(e) => handleMedicineChange(index, 'morning', e.target.checked)}
                      >Morning</Checkbox>
                      <Checkbox
                        checked={medicine.afternoon}
                        onChange={(e) => handleMedicineChange(index, 'afternoon', e.target.checked)}
                      >Afternoon</Checkbox>
                      <Checkbox
                        checked={medicine.night}
                        onChange={(e) => handleMedicineChange(index, 'night', e.target.checked)}
                      >Night</Checkbox>
                    </div>
                    <p className="text-sm text-gray-600">Special Instructions</p>
                    <Input
                      placeholder="Any special instructions"
                      value={medicine.instructions}
                      onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                    />
                  </div>
                ))}
                <Button 
                  type="dashed" 
                  onClick={addMedicine} 
                  className="w-full"
                  icon={<svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" 
                      clipRule="evenodd" 
                    />
                  </svg>}
                >
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
