import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, Input, Button, Radio, Typography, message, Checkbox } from "antd";
import { prescriptionSchema } from "../pages/Prescriptions";
import PrescriptionPreview from "./PrescriptionPreview";
import { updatePrescription } from "../api.services/services";

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
                  <div key={index} className="space-y-2 p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">Medicine {index + 1}</p>
                    <Input 
                      value={medicine.name} 
                      onChange={(e) => handleMedicineChange(index, 'name', e.target.value)} 
                    />
                    <p className="text-sm text-gray-600">Dosage</p>
                    <Input
                      value={medicine.dosage}
                      onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                    />
                    <p className="text-sm text-gray-600">Duration</p>
                    <Input
                      value={medicine.duration}
                      onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                    />
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
                    <p className="text-sm text-gray-600">Special Instructions</p>
                    <Input
                      value={medicine.instructions}
                      onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                    />
                  </div>
                ))}
                <Button type="dashed" onClick={addMedicine}>Add Medicine</Button>
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
