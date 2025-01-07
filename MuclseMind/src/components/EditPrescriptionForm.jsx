import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, Input, Button, Radio, Typography, message, Checkbox } from "antd";
import { prescriptionSchema } from "../pages/Prescriptions";
import PrescriptionPreview from "./PrescriptionPreview";
import { updatePrescription } from "../interceptor/services";

export default function EditPrescriptionForm({ selectedPrescription, onUpdate }) {
  const [medicines, setMedicines] = useState(selectedPrescription.medicines || []);
  const [treatmentField, setTreatmentField] = useState('');

  useEffect(() => {
    setMedicines(selectedPrescription.medicines || []);
    setTreatmentField(selectedPrescription.treatment_name || '');
  }, [selectedPrescription]);

  const handleFormSubmit = async () => {
    try {
      const payload = {
        ...selectedPrescription,
        medicines: medicines,
        treatment_name: treatmentField,
      };
      
      const response = await updatePrescription(selectedPrescription.id, payload);
      
      if (response.success) {
        onUpdate();
      } else {
        throw new Error(response.message || 'Failed to update prescription');
      }
    } catch (error) {
      message.error(`Failed to update prescription: ${error.message}`);
      console.error('Error updating prescription:', error);
    }
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = medicines.map((medicine, idx) => {
      if (idx === index) {
        return { ...medicine, [field]: value };
      }
      return medicine;
    });
    setMedicines(updatedMedicines);
  };

  const addMedicine = () => {
    const newMedicine = {
      name: "",
      dosage: "",
      duration: "",
      morning: false,
      afternoon: false,
      night: false,
      instructions: "",
    };
    setMedicines([...medicines, newMedicine]);
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, idx) => idx !== index));
  };

  return (
    <div className="grid grid-cols-2 gap-8 ">
      <div>
        <Form
          layout="vertical"
          className="bg-white  p-6 rounded-lg shadow-sm"
          onFinish={handleFormSubmit}
        >
          <div className="space-y-6">
            <Form.Item label="Patient Name">
              <Input disabled defaultValue={selectedPrescription.patient_name} />
            </Form.Item>
            
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="Age">
                <Input disabled defaultValue={selectedPrescription.age} type="number" />
              </Form.Item>
              <Form.Item label="Gender">
                <Radio.Group disabled defaultValue={selectedPrescription.gender}>
                  <Radio value="Male">Male</Radio>
                  <Radio value="Female">Female</Radio>
                </Radio.Group>
              </Form.Item>
            </div>

            <Form.Item label="Date">
              <Input disabled defaultValue={selectedPrescription.date} type="date" />
            </Form.Item>

            <Form.Item label="Treatment Field">
              <Input 
                type="text"
                value={treatmentField} 
                onChange={(e) => setTreatmentField(e.target.value)}  
              />
            </Form.Item>

            <Form.Item label="Medicines">
              <div className="space-y-4">
                {medicines.map((medicine, index) => (
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
                Update Prescription
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>
      <PrescriptionPreview data={{ ...selectedPrescription, medicines, treatment_field: treatmentField }} />
    </div>
  );
}
