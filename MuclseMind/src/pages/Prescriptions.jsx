import { useState } from 'react';
import { DownloadOutlined, FilterOutlined, DeleteOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Input, Table, Card, Space, Typography } from 'antd';
import PrescriptionForm from './PrescriptionForm';
import { generatePDF } from '../lib/pdfGenerator';

function Prescriptions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const staticPrescriptions = [
    {
      id: 1,
      prescription_no: "RX001",
      patient_name: "John Doe",
      age: "35",
      sex: "M",
      date: new Date().toISOString().split('T')[0],
      medicines: JSON.stringify([
        {
          name: "Amoxicillin",
          dosage: "500mg",
          duration: "7 days",
          morning: true,
          afternoon: false,
          night: true,
          instructions: "Take after meals"
        }
      ])
    },
    {
      id: 2,
      prescription_no: "RX002",
      patient_name: "Jane Smith",
      age: "28",
      sex: "F",
      date: "2024-12-08",
      medicines: JSON.stringify([
        {
          name: "Ibuprofen",
          dosage: "400mg",
          duration: "5 days",
          morning: true,
          afternoon: true,
          night: true,
          instructions: "Take with food"
        }
      ])
    }
  ];

  const filteredPrescriptions = staticPrescriptions.filter(prescription =>
    prescription.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadPDF = async (prescription) => {
    const medicines = JSON.parse(prescription.medicines);
    await generatePDF({
      name: prescription.patient_name,
      age: prescription.age,
      sex: prescription.sex,
      date: prescription.date,
      medicines
    });
  };

  const handleDeletePrescription = (prescriptionId) => {
    // In a static version, we'll just show an alert
    alert('Delete functionality is disabled in static version');
  };

  const getMedicinesSummary = (prescription) => {
    try {
      const medicines = JSON.parse(prescription.medicines);
      return `${medicines.length} medicine${medicines.length !== 1 ? 's' : ''}`;
    } catch {
      return 'No medicines';
    }
  };

  const columns = [
    {
      title: 'Prescription No',
      dataIndex: 'prescription_no',
      key: 'prescription_no',
    },
    {
      title: 'Patient Name',
      dataIndex: 'patient_name',
      key: 'patient_name',
      filteredValue: [searchTerm],
      onFilter: (value, record) => record.patient_name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Treatment Name',
      dataIndex: 'treatment_name',
      key: 'treatment_name',
      filteredValue: [searchTerm],
      onFilter: (value, record) => record.patient_name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Medicines',
      key: 'medicines',
      render: (_, prescription) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedPrescription(prescription);
            setIsModalOpen(true);
          }}
          icon={<EditOutlined />}
        >
          View/Edit ({getMedicinesSummary(prescription)})
        </Button>
      ),
    },
  
    {
      title: 'Actions',
      key: 'actions',
      render: (_, prescription) => (
        <Space>
          <Button
            type="text"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadPDF(prescription)}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeletePrescription(prescription.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography.Title level={4} style={{ margin: 0 }}>Prescriptions</Typography.Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            New Prescription
          </Button>
        </div>

        <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
          <Input
            placeholder="Search by patient name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 200 }}
            prefix={<FilterOutlined />}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredPrescriptions}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <PrescriptionForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPrescription(null);
          // No need to refetch with static data
        }}
        defaultValues={selectedPrescription ? {
          name: selectedPrescription.patient_name,
          age: selectedPrescription.age,
          sex: selectedPrescription.sex,
          medicines: JSON.parse(selectedPrescription.medicines)
        } : undefined}
      />
    </div>
  );
}

export default Prescriptions;
