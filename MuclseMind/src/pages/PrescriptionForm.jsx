import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaStethoscope, FaDownload } from "react-icons/fa";
import { Form, Input, Button, Radio, Typography } from 'antd';

import PrescriptionPreview from "../components/PrescriptionPreview";
import { generatePDF } from "../lib/pdfGenerator";

const medicineSchema = z.object({
  name: z.string().min(1, "Medicine name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  duration: z.string().min(1, "Duration is required"),
  morning: z.boolean().default(false),
  afternoon: z.boolean().default(false),
  night: z.boolean().default(false),
  instructions: z.string().optional(),
});

const prescriptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.string().regex(/^\d+$/, "Age must be a number"),
  sex: z.enum(["M", "F"], { required_error: "Sex is required" }),
  date: z.string(),
  medicines: z.array(medicineSchema).default([]),
});

function PrescriptionForm({ isOpen, onClose, defaultValues }) {
  // Using static doctor data instead of fetching from backend
  const doctorData = {
    name: "DR. NAME SURNAME",
    title: "DENTAL SURGEON, MPH",
    department: "Medical officer, Dept.of Oral Medicine"
  };
  
  const form = useForm({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      medicines: [],
    },
  });

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        date: new Date().toLocaleDateString(),
        medicines: data.medicines.map(med => ({
          ...med,
          morning: med.morning || false,
          afternoon: med.afternoon || false,
          night: med.night || false
        }))
      };
      
      const success = generatePDF(formattedData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...form.getValues(),
        ...defaultValues,
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [defaultValues]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-2 text-cyan-500 mb-6">
          <div className="flex items-center gap-2">
            <FaStethoscope className="w-8 h-8" />
            <h1 className="text-2xl font-bold text-meta-4">Add New Prescription</h1>
          </div>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Form {...form} layout="vertical">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Form.Item label="Patient Name">
                <Input {...form.register("name")} className="w-full" />
              </Form.Item>

              <Form.Item label="Age">
                <Input {...form.register("age")} className="w-full" type="number" />
              </Form.Item>

              <Form.Item label="Sex">
                <Radio.Group
                  onValueChange={(value) => form.setValue("sex", value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <Radio value="M" id="male" />
                    <Typography.Text htmlFor="male">Male</Typography.Text>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Radio value="F" id="female" />
                    <Typography.Text htmlFor="female">Female</Typography.Text>
                  </div>
                </Radio.Group>
              </Form.Item>

              <Form.Item label="Date">
                <Input {...form.register("date")} type="date" className="w-full" />
              </Form.Item>

              <Form.Item label="Medicines">
                <div className="space-y-4">
                  {form.watch("medicines").map((_, index) => (
                    <div key={index} className="space-y-2 p-4 border rounded-lg">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Typography.Text>Medicine Name</Typography.Text>
                            <Input
                              placeholder="Enter medicine name"
                              {...form.register(`medicines.${index}.name`)}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Typography.Text>Dosage</Typography.Text>
                              <Input
                                placeholder="e.g., 500mg"
                                {...form.register(`medicines.${index}.dosage`)}
                              />
                            </div>
                            <div>
                              <Typography.Text>Duration</Typography.Text>
                              <Input
                                placeholder="e.g., 7 days"
                                {...form.register(`medicines.${index}.duration`)}
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
                              />
                              Morning
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                {...form.register(`medicines.${index}.afternoon`)}
                              />
                              Afternoon
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                {...form.register(`medicines.${index}.night`)}
                              />
                              Night
                            </label>
                          </div>
                        </div>
                        
                        <div>
                          <Typography.Text>Special Instructions</Typography.Text>
                          <Input
                            placeholder="Enter any special instructions"
                            {...form.register(`medicines.${index}.instructions`)}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const medicines = form.getValues("medicines");
                          medicines.splice(index, 1);
                          form.setValue("medicines", [...medicines]);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const medicines = form.getValues("medicines");
                      form.setValue("medicines", [
                        ...medicines,
                        { 
                          name: "", 
                          dosage: "",
                          duration: "",
                          morning: false, 
                          afternoon: false, 
                          night: false, 
                          instructions: "" 
                        }
                      ]);
                    }}
                  >
                    Add Medicine
                  </Button>
                </div>
              </Form.Item>

              <Form.Item>
                <Button 
                  type="submit" 
                  className="w-full flex items-center gap-2"
                >
                  <FaDownload className="w-4 h-4" />
                  Save Prescription 
                </Button>
              </Form.Item>
            </form>
          </Form>

          <PrescriptionPreview 
            data={form.watch()} 
          />
        </div>
      </div>
    </div>
  );
}

PrescriptionForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  defaultValues: PropTypes.shape({
    name: PropTypes.string,
    age: PropTypes.string,
    sex: PropTypes.oneOf(['M', 'F']),
    medicines: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      dosage: PropTypes.string,
      duration: PropTypes.string,
      morning: PropTypes.bool,
      afternoon: PropTypes.bool,
      night: PropTypes.bool,
      instructions: PropTypes.string
    }))
  })
};

export default PrescriptionForm;
