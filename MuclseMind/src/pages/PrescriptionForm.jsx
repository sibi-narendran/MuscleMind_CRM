import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaStethoscope } from "react-icons/fa";
import { Form, Input, Button, Radio, Typography, message } from "antd";
import { prescriptionSchema } from "../types/prescription";
import PrescriptionPreview from "../components/PrescriptionPreview";
import { addPrescription,    } from "../api.services/services";

function PrescriptionForm({ selectedPrescription, onUpdate }) {
  const defaultValues = {
    name: selectedPrescription?.name || "",
    age: selectedPrescription?.age || "",
    sex: selectedPrescription?.sex || "",
    date: selectedPrescription?.date
      ? new Date(selectedPrescription.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    medicines: selectedPrescription?.medicines || [],
  };

  const form = useForm({
    resolver: zodResolver(prescriptionSchema),
    defaultValues,
  });

  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    if (selectedPrescription) {
      form.reset(selectedPrescription);
      if (
        selectedPrescription &&
        Array.isArray(selectedPrescription.medicines)
      ) {
        setMedicines(selectedPrescription.medicines);
      } else {
        setMedicines([]);
      }
    }
  }, [selectedPrescription, form.reset]);

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = medicines.map((medicine, idx) => {
      if (idx === index) {
        return { ...medicine, [field]: value };
      }
      return medicine;
    });
    setMedicines(updatedMedicines);
    form.setValue(`medicines.${index}.${field}`, value);
  };

  const onSubmit = async (formData) => {
    console.log("Attempting to submit:", formData);
    try {
      let response;
      if (selectedPrescription?.id) {
        console.log("Updating prescription with ID:", selectedPrescription.id);
        response = await updatePrescription(selectedPrescription.id, formData);
        message.success('Prescription updated successfully');
      } else {
        console.log("Adding new prescription");
        response = await addPrescription(formData);
        message.success('Prescription added successfully');
      }
      console.log("Response:", response);
    } catch (error) {
      message.error('Failed to save prescription');
      console.error('Error saving prescription:', error);
    }
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
    setMedicines((prevMedicines) => {
      const updatedMedicines = [...prevMedicines, newMedicine];
      if (typeof onUpdate === "function") {
        onUpdate(updatedMedicines);
      }
      return updatedMedicines;
    });
  };

  const handleRemoveMedicine = (index) => {
    const newMedicines = medicines.filter((_, idx) => idx !== index);
    setMedicines(newMedicines);
    form.setValue("medicines", newMedicines);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-2 text-cyan-500 mb-6">
        <div className="flex items-center gap-2">
          <FaStethoscope className="w-8 h-8" />
          <h1 className="text-2xl font-bold text-meta-4">
            {selectedPrescription
              ? "Edit Prescription"
              : "Add New Prescription"}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Form
            layout="vertical"
            className="bg-white p-6 rounded-lg shadow-sm"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="space-y-6">
              <Form.Item
                label="Patient Name"
                validateStatus={form.formState.errors.name ? "error" : ""}
                help={form.formState.errors.name?.message}
              >
                <Input
                  {...form.register("name", {
                    required: "Patient name is required",
                  })}
                  className="w-full"
                  placeholder="Enter patient name"
                  value={selectedPrescription.name}
                />
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  label="Age"
                  validateStatus={form.formState.errors.age ? "error" : ""}
                  help={form.formState.errors.age?.message}
                >
                  <Input
                    {...form.register("age", { required: "Age is required" })}
                    className="w-full"
                    placeholder="Enter age"
                    type="number"
                    value={selectedPrescription.age}
                  />
                </Form.Item>

                <Form.Item
                  label="Sex"
                  validateStatus={form.formState.errors.sex ? "error" : ""}
                  help={form.formState.errors.sex?.message}
                >
                  <Radio.Group
                    value={form.watch("sex")}
                    onChange={(e) => form.setValue("sex", e.target.value)}
                    {...form.register("sex", { required: "Sex is required" })}
                  >
                    <Radio value="Male">Male</Radio>
                    <Radio value="Female">Female</Radio>
                  </Radio.Group>
                </Form.Item>
              </div>

              <Form.Item
                label="Date"
                validateStatus={form.formState.errors.date ? "error" : ""}
                help={form.formState.errors.date?.message}
              >
                <Input
                  {...form.register("date", { required: "Date is required" })}
                  type="date"
                  className="w-full"
                  value={selectedPrescription.date}
                />
              </Form.Item>

              <Form.Item label="Medicines">
                <div className="space-y-4">
                  {medicines.map((medicine, index) => (
                    <div
                      key={index}
                      className="space-y-2 p-4 border rounded-lg"
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Typography.Text>Medicine Name</Typography.Text>
                            <Input
                              placeholder="Enter medicine name"
                              {...form.register(`medicines.${index}.name`)}
                              value={medicine.name}
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Typography.Text>Dosage</Typography.Text>
                              <Input
                                placeholder="e.g., 500mg"
                                {...form.register(`medicines.${index}.dosage`)}
                                value={medicine.dosage}
                                onChange={(e) =>
                                  handleMedicineChange(
                                    index,
                                    "dosage",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Typography.Text>Duration</Typography.Text>
                              <Input
                                placeholder="e.g., 7 days"
                                {...form.register(
                                  `medicines.${index}.duration`
                                )}
                                value={medicine.duration}
                                onChange={(e) =>
                                  handleMedicineChange(
                                    index,
                                    "duration",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <Typography.Text>Timing</Typography.Text>
                          <div className="grid grid-cols-3 gap-4 mt-2">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                {...form.register(`medicines.${index}.morning`)}
                                checked={medicine.morning}
                                onChange={(e) =>
                                  handleMedicineChange(
                                    index,
                                    "morning",
                                    e.target.checked
                                  )
                                }
                              />
                              Morning
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                {...form.register(
                                  `medicines.${index}.afternoon`
                                )}
                                checked={medicine.afternoon}
                                onChange={(e) =>
                                  handleMedicineChange(
                                    index,
                                    "afternoon",
                                    e.target.checked
                                  )
                                }
                              />
                              Afternoon
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                {...form.register(`medicines.${index}.night`)}
                                checked={medicine.night}
                                onChange={(e) =>
                                  handleMedicineChange(
                                    index,
                                    "night",
                                    e.target.checked
                                  )
                                }
                              />
                              Night
                            </label>
                          </div>
                        </div>

                        <div>
                          <Typography.Text>
                            Special Instructions
                          </Typography.Text>
                          <Input
                            placeholder="Enter any special instructions"
                            {...form.register(
                              `medicines.${index}.instructions`
                            )}
                            value={medicine.instructions}
                            onChange={(e) =>
                              handleMedicineChange(
                                index,
                                "instructions",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                      <Button
                        type="primary"
                        danger
                        onClick={() => handleRemoveMedicine(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={addMedicine} block>
                    Add Medicine
                  </Button>
                </div>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" className="w-full">
                  Save Prescription
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>

        <PrescriptionPreview data={{ ...form.getValues(), medicines }} />
      </div>
    </div>
  );
}

export default PrescriptionForm;
