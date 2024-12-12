import { useState, useEffect } from 'react';
import { App, Button, Input, Table, Card, Space, Typography, Modal } from 'antd';
import { 
  DownloadOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  EditOutlined,
  SearchOutlined
} from '@ant-design/icons';

import { generatePDF } from '../lib/pdfGenerator';
import PrescriptionForm from './PrescriptionForm';
import { GetPrescription, deleteprescriptions } from '../api.services/services';

const { Search } = Input;
const { Title } = Typography;

function Prescriptions() {
  const { message } = App.useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState({
    name: '',
    age: '',
    sex: '',
    date: ''
  });
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
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

    fetchPrescriptions();
  }, [searchTerm]);

  const getMedicinesSummary = (prescription) => {
    return prescription.medicines ? prescription.medicines.length : 0;
  };

  const handleEditPrescription = (prescription) => {
    setSelectedPrescription({
      name: prescription.patient_name,
      age: prescription.age.toString(),
      sex: prescription.gender,
      date: new Date(prescription.date).toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPrescription({
      name: '',
      age: '',
      sex: '',
      date: ''
    });
  };

  const handleDownloadPDF = (prescription) => {
    try {
      const success = generatePDF(prescription);
      if (success) {
        message.success('Prescription PDF generated successfully');
      } else {
        message.error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      message.error('Error generating PDF');
    }
  };

  const handleDeletePrescription = (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this prescription?',
      content: 'This action cannot be undone',
      onOk: async () => {
        try {
          await deleteprescriptions(id);
          message.success('Prescription deleted successfully');
          setIsModalOpen(false);
          fetchPrescriptions();
        } catch (error) {
          message.error('Failed to delete prescription');
        }
      },
      onCancel() {
        console.log('Cancel delete');
      },
    });
  };

  const handleUpdate = (updatedPrescription) => {
    console.log("Updated prescription:", updatedPrescription);
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
      onFilter: (value, record) => record.patient_name && record.patient_name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Treatment Name',
      dataIndex: 'treatment_name',
      key: 'treatment_name',
      filteredValue: [searchTerm],
      onFilter: (value, record) => record.treatment_name && record.treatment_name.toLowerCase().includes(value.toLowerCase()),
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
          onClick={() => handleEditPrescription(prescription)}
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
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title level={2}>Prescriptions</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedPrescription({
                name: '',
                age: '',
                sex: '',
                date: ''
              });
              setIsModalOpen(true);
            }}
          >
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
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>
      
      <Modal
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        width={800}
        destroyOnClose
      >
        <PrescriptionForm
          selectedPrescription={selectedPrescription}
          onClose={handleModalClose}
          onUpdate={handleUpdate}
        />
      </Modal>
    </div>
  );
}

export default Prescriptions;