import { z } from 'zod';

export const prescriptionSchema = z.object({
  name: z.string().min(1, "Patient name is required"),
  age: z.number().min(0, "Age must be a positive number"),
  sex: z.enum(["Male", "Female"], "Sex is required"),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  medicines: z.array(
    z.object({
      name: z.string().min(1, "Medicine name is required"),
      dosage: z.string().min(1, "Dosage is required"),
      duration: z.string().min(1, "Duration is required"),
      morning: z.boolean(),
      afternoon: z.boolean(),
      night: z.boolean(),
      instructions: z.string().optional(),
    })
  ).min(1, "At least one medicine is required"),
});