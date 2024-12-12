// Type definitions for prescription management system

/**
 * @typedef {Object} Medicine
 * @property {string} name - Medicine name (required)
 * @property {string} dosage - Medicine dosage (required)
 * @property {string} duration - Treatment duration (required)
 * @property {boolean} [morning] - Take in morning
 * @property {boolean} [afternoon] - Take in afternoon
 * @property {boolean} [night] - Take at night
 * @property {string} [instructions] - Special instructions
 */

/**
 * @typedef {Object} Prescription
 * @property {string} name - Patient name (required)
 * @property {string} age - Patient age (numeric string)
 * @property {"M" | "F"} sex - Patient sex (M or F)
 * @property {string} date - Prescription date
 * @property {Medicine[]} medicines - List of prescribed medicines
 */

/**
 * @typedef {Object} ClinicData
 * @property {string} clinicName - Name of the clinic
 * @property {string} description - Clinic description
 * @property {string} address - Clinic address
 * @property {string} city - Clinic city
 * @property {string} phoneNumber - Clinic phone number
 * @property {string} username - Doctor's name
 * @property {string} specialization - Doctor's specialization
 * @property {string} department - Doctor's department
 */

export const prescriptionSchema = {
    type: "object",
    properties: {
      name: {
        type: "string",
        minLength: 1,
        errorMessage: "Name is required"
      },
      age: {
        type: "string",
        pattern: "^\\d+$",
        errorMessage: "Age must be a number"
      },
      sex: {
        type: "string",
        enum: ["M", "F"],
        errorMessage: "Sex is required"
      },
      date: {
        type: "string",
        format: "date",
        errorMessage: "Valid date is required"
      },
      medicines: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 1 },
            dosage: { type: "string", minLength: 1 },
            duration: { type: "string", minLength: 1 },
            morning: { type: "boolean", default: false },
            afternoon: { type: "boolean", default: false },
            night: { type: "boolean", default: false },
            instructions: { type: "string" }
          },
          required: ["name", "dosage", "duration"]
        },
        default: []
      }
    },
    required: ["name", "age", "sex", "date"]
  };
  
  export const medicineSchema = {
    type: "object",
    properties: {
      name: {
        type: "string",
        minLength: 1,
        errorMessage: "Medicine name is required"
      },
      dosage: {
        type: "string",
        minLength: 1,
        errorMessage: "Dosage is required"
      },
      duration: {
        type: "string",
        minLength: 1,
        errorMessage: "Duration is required"
      },
      morning: {
        type: "boolean",
        default: false
      },
      afternoon: {
        type: "boolean",
        default: false
      },
      night: {
        type: "boolean",
        default: false
      },
      instructions: {
        type: "string"
      }
    },
    required: ["name", "dosage", "duration"]
  };
  