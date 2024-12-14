import React, { useState, useEffect } from 'react';
import { Button, Input, Table, Card, Space, Typography, Modal, message } from 'antd';
import { DownloadOutlined, DeleteOutlined, PlusOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import EditPrescriptionForm from './EditPrescriptionForm';
import AddPrescriptionForm from './AddPrescriptionForm';
import { deletePrescriptions, GetPrescription, getUserProfile } from '../api.services/services';
import { generatePDF } from '../lib/pdfGenerator';
import { z } from 'zod';

const { Search } = Input;
const { Title } = Typography;

export const prescriptionSchema = z.object({
  patient_name: z.string(),
  age: z.number(),
  gender: z.enum(['Male', 'Female']),
  date: z.string(),
  medicines: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    duration: z.string(),
    morning: z.boolean(),
    afternoon: z.boolean(),
    night: z.boolean(),
    instructions: z.string().optional(),
  })),
});

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);


    const fetchPrescriptions = async () => {
      try {
        const response = await GetPrescription();
        if (response.success && Array.isArray(response.data)) {
          setPrescriptions(response.data);
        } else {
          console.error('Failed to fetch prescriptions:', response.message);
          setPrescriptions([]);
        }
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        setPrescriptions([]);
      }
    };
    useEffect(() => {
    fetchPrescriptions();
  }, [searchTerm]);

  const handleDeletePrescription = async (id) => {
    try {
      Modal.confirm({
        title: 'Are you sure you want to delete this prescription?',
        content: 'This action cannot be undone.',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          const response = await deletePrescriptions(id);
          if (response.success) {
            message.success('Prescription deleted successfully');
            fetchPrescriptions(); // Refresh the list
          } else {
            throw new Error(response.message || 'Failed to delete prescription');
          }
        },
      });
    } catch (error) {
      message.error('Failed to delete prescription: ' + error.message);
      console.error('Error deleting prescription:', error);
    }
  };

  const handleOpenAddForm = () => setIsAddModalOpen(true);
  const handleOpenEditForm = (prescription) => {
    setSelectedPrescription(prescription);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => setIsEditModalOpen(false);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const handleUpdatePrescriptions = async () => {
    try {
      await fetchPrescriptions(); // Refresh the list of prescriptions
      handleCloseEditModal(); // Close the modal after successful update
      message.success('Prescription updated successfully');
    } catch (error) {
      console.error('Error updating prescriptions:', error);
      message.error('Failed to update prescription');
    }
  };

  const handleDownloadPDF = async (prescription) => {
    try {
      const userProfileResponse = await getUserProfile();
      
      if (!userProfileResponse.success) {
        throw new Error('Failed to fetch user profile');
      }

      await generatePDF(prescription, userProfileResponse);
      message.success('Prescription PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      message.error('Error generating PDF');
    }
  };

  const getMedicinesSummary = (prescription) => {
    return prescription.medicines ? prescription.medicines.length : 0;
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
      onFilter: (value, record) => 
        record.patient_name && 
        record.patient_name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Treatment Name',
      dataIndex: 'treatment_name',
      key: 'treatment_name',
      filteredValue: [searchTerm],
      onFilter: (value, record) => 
        record.treatment_name && 
        record.treatment_name.toLowerCase().includes(value.toLowerCase()),
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
          onClick={() => handleOpenEditForm(prescription)}
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
    <div className="p-6">
      <Card className="bg-white dark:bg-boxdark">
        <div className="flex justify-between items-center mb-6">
          <Title level={2} className="dark:text-white">Prescriptions</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAddForm}>
            New Prescription
          </Button>
        </div>

        <div className="mb-6">
          <Search
            placeholder="Search prescriptions..."
            allowClear
            enterButton={<SearchOutlined />}
            size="small"
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 200 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={prescriptions}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }}
        />
      </Card>
      
      <Modal
        title="Edit Prescription"
        open={isEditModalOpen}
        onCancel={handleCloseEditModal}
        footer={null}
        width={800}
        destroyOnClose
      >
        {selectedPrescription && (
          <EditPrescriptionForm
            selectedPrescription={selectedPrescription}
            onUpdate={handleUpdatePrescriptions}
          />
        )}
      </Modal>

      <Modal
        title="Add New Prescription"
        open={isAddModalOpen}
        onCancel={handleCloseAddModal}
        footer={null}
        width={800}
        destroyOnClose
      >
        <AddPrescriptionForm onUpdate={handleUpdatePrescriptions} />
      </Modal>
    </div>
  );
}