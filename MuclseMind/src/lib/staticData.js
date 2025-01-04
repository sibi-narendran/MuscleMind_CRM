// Static clinic data
export const clinicData = {
    clinicName: 'Dental Clinic',
    description: 'Tooth Pain Sensation Care',
    address: '201, Down Town Street',
    city: 'NEW YORK CITY',
    phoneNumber: '02-1234567',
    username: 'DR. NAME SURNAME',
    specialization: 'DENTAL SURGEON, MPH',
    department: 'Medical officer, Dept.of Oral Medicine'
  };
  
  // Static prescription data
  export const prescriptions = [
    {
      key: '1',
      id: 1,
      prescription_no: 'RX-001',
      patient_name: 'John Doe',
      treatment_name: 'Root Canal Treatment',
      age: '35',
      sex: 'M',
      date: new Date('2024-12-11'),
      medicines: [
        {
          name: 'Amoxicillin',
          dosage: '500mg',
          duration: '7 days',
          morning: true,
          afternoon: false,
          night: true,
          instructions: 'Take after meals'
        },
        {
          name: 'Ibuprofen',
          dosage: '400mg',
          duration: '5 days',
          morning: true,
          afternoon: true,
          night: true,
          instructions: 'Take with food'
        }
      ]
    },
    {
      key: '2',
      id: 2,
      prescription_no: 'RX-002',
      patient_name: 'Jane Smith',
      treatment_name: 'Teeth Cleaning',
      age: '28',
      sex: 'F',
      date: new Date('2024-12-11'),
      medicines: [
        {
          name: 'Acetaminophen',
          dosage: '650mg',
          duration: '3 days',
          morning: true,
          afternoon: true,
          night: false,
          instructions: 'Take as needed for pain'
        }
      ]
    },
    {
      key: '3',
      id: 3,
      prescription_no: 'RX-003',
      patient_name: 'Robert Johnson',
      treatment_name: 'Tooth Extraction',
      age: '45',
      sex: 'M',
      date: new Date('2024-12-11'),
      medicines: [
        {
          name: 'Metronidazole',
          dosage: '400mg',
          duration: '5 days',
          morning: true,
          afternoon: false,
          night: true,
          instructions: 'Complete the full course'
        },
        {
          name: 'Chlorhexidine',
          dosage: '0.2%',
          duration: '7 days',
          morning: true,
          afternoon: true,
          night: true,
          instructions: 'Rinse for 30 seconds twice daily'
        }
      ]
    }
  ];
  