import React, { useState, useEffect } from 'react';
import { Button, Input, Table, Card, Space, Typography, Modal, message, Spin, Tooltip } from 'antd';
import { DownloadOutlined, DeleteOutlined, PlusOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import EditPrescriptionForm from './EditPrescriptionForm';
import AddPrescriptionForm from './AddPrescriptionForm';
import { deletePrescriptions, GetPrescription, getUserProfile, generatePrescription } from '../api.services/services';
import { generatePDF } from '../lib/pdfGenerator';
import { z } from 'zod';
import GeminiIcon from "../Images/google-gemini-icon.svg";

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

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [generatingPrescriptions, setGeneratingPrescriptions] = useState({});

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
      console.log(prescription);
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

  const handleGeminiClick = async (prescription) => {
    if (!prescription || !prescription.id) {
      message.error('Invalid prescription data');
      return;
    }

    const prescriptionData = {
      patient_name: prescription.patient_name,
      age: prescription.age,
      gender: prescription.gender,
      date: prescription.date
    };

    setGeneratingPrescriptions(prev => ({ ...prev, [prescription.id]: true }));
    
    try {
      const response = await generatePrescription(prescription.id, prescriptionData); 
      if (response.success) {
        message.success('prescription medicine generated successfully');
        fetchPrescriptions();
      } else {
        message.error(response.message || 'Failed to generate medicine');
      }
    } catch (error) {
      console.error('Error generating medicine:', error);
      message.error('No medications were suggested by AI');
    } finally {
      setGeneratingPrescriptions(prev => ({ ...prev, [prescription.id]: false }));
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
      responsive: ['md'],
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
      title: 'Treatment',
      dataIndex: 'treatment_name',
      key: 'treatment_name',
      responsive: ['sm'],
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
      responsive: ['sm'],
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
          <Tooltip 
            title="AI Generator" 
            placement="top" 
            className="cursor-pointer"
          >
            <button
              onClick={() => handleGeminiClick(prescription)}
              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 active:bg-blue-200 transition-colors duration-200"
              disabled={generatingPrescriptions[prescription.id]}
            >
              {generatingPrescriptions[prescription.id] ? (
                <Spin size="small" />
              ) : (
                <img 
                  src={GeminiIcon} 
                  alt="Gemini AI" 
                  className="w-6 h-6 min-w-[24px] min-h-[24px] max-w-[24px] max-h-[24px] object-contain"
                  style={{ width: '24px', height: '24px' }}
                />
              )}
            </button>
          </Tooltip>
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
    <div className="p-2 sm:p-6">
      <Card className="bg-white dark:bg-boxdark">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <Title level={2} className="dark:text-white text-xl sm:text-2xl m-0">Prescriptions</Title>
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
            className="w-full sm:w-auto"
            style={{ maxWidth: '100%', width: '100%', minWidth: 200 }}
          />
        </div>

        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={prescriptions}
            rowKey="id"
            pagination={{ 
              pageSize: 10, 
              showSizeChanger: true, 
              showQuickJumper: true,
              responsive: true,
              size: 'small'
            }}
            scroll={{ x: 'max-content' }}
            size="small"
          />
        </div>
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
};

export default Prescriptions;