import React, { useEffect, useState, useMemo } from 'react';
import { Button, Input, message, Space, Modal, Spin, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, FileTextOutlined, EyeOutlined } from '@ant-design/icons';
import { jsPDF } from 'jspdf';
import AddPatientModal from './AddPatientModal';
import EditPatientModal from './EditPatientModal';
import { getPatients, addPatient, editPatient, deletePatient,getTeamMembers } from '../api.services/services';
import { useTable } from 'react-table';
import '../assets/css/Patients.css';

const { confirm } = Modal;
const { Option } = Select;

const CARE_PERSONS = [
  "Dr. John Smith",
  "Dr. Sarah Wilson",
  "Dr. Michael Brown",
  "Dr. Emily Davis"
];

const   Patients = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [viewModalVisible, setViewModalVisible] = useState(false);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await getPatients();
      setPatients(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      message.error('Failed to fetch patients: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await getTeamMembers();
        setTeamMembers(response.data);
      } catch (error) {
        message.error('Failed to fetch team members: ' + error.message);
      }
    };

    fetchTeamMembers();
  }, []);

  const handleDownloadPDF = (patient) => {
    const doc = new jsPDF();
    doc.text(`Patient Details`, 10, 10);
    doc.text(`Patient ID: ${patient.patient_id}`, 10, 20);
    doc.text(`Name: ${patient.name}`, 10, 30);
    doc.text(`Email: ${patient.email}`, 10, 40);
    doc.text(`Phone: ${patient.phone}`, 10, 50);
    doc.text(`Care of: ${patient.care_person || 'N/A'}`, 10, 60);
    doc.text(`Notes: ${patient.notes || 'N/A'}`, 10, 70);
    doc.save(`${patient.name}_details.pdf`);
  };

  const showDeleteConfirm = (patient) => {
    confirm({
      title: 'Are you sure you want to delete this patient?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        handleDeletePatient(patient.id);
      },
    });
  };

  const handleAddPatient = async (newPatient) => {
    try {
      await addPatient(newPatient);
      message.success('Patient added successfully');
      setAddModalVisible(false);
      fetchPatients(); // Refetch patients after adding
    } catch (error) {
      message.error('Failed to add patient: ' + error.message);
    }
  };

  const handleEditPatient = async (updatedPatient) => {
    try {
      await editPatient(updatedPatient.id, updatedPatient);
      message.success('Patient updated successfully');
      setEditModalVisible(false);
      fetchPatients(); // Refetch patients after editing
    } catch (error) {
      message.error('Failed to update patient: ' + error.message);
    }
  };

  const handleDeletePatient = async (id) => {
    try {
      await deletePatient(id);
      message.success('Patient deleted successfully');
      fetchPatients(); // Refetch patients after deleting
    } catch (error) {
      message.error('Failed to delete patient: ' + error.message);
    }
  };

  const showNoteModal = (note) => {
    setCurrentNote(note);
    setNoteModalVisible(true);
  };

  const handleViewPatient = (patient) => {
    setCurrentPatient(patient);
    setViewModalVisible(true);
  };

  const handleDownloadCaseSheet = (patient) => {
    console.log('Downloading case sheet for:', patient);
  };

  const handleCarePersonChange = async (patientId, carePerson) => {
    try {
      await editPatient(patientId, { care_person: carePerson });
      message.success('Care person updated successfully');
      fetchPatients(); // Refetch patients to update the UI
    } catch (error) {
      message.error('Failed to update care person: ' + error.message);
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: 'Patient ID',
        accessor: 'patient_id',
      },
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Basic info',
        accessor: 'contact',
        Cell: ({ row }) => (
            <div className="mtb">
              <p className='ml-2'> Gender : {row.original.gender || '-'}</p>
              <p className='ml-2'>Age : {row.original.age }</p>
            </div>
        ),
      },
      {
        Header: 'Care by',
        accessor: 'care_person',
        Cell: ({ row }) => (
          <Select
            value={row.original.care_person}
            onChange={(value) => handleCarePersonChange(row.original.id, value)}
          >
            {teamMembers.map((member) => (
              <Option key={member.id} value={member.name}>{member.name}</Option>
            ))}
          </Select>
        ),
      },
      {
        Header: 'Case Sheet',
        accessor: 'case_sheet_file',
        Cell: ({ row }) => (
          <Button
            onClick={() => showModal('viewCaseSheet', row.original)}
            icon={<FileTextOutlined />}
          >
            View 
          </Button>
        ),
      },
      {
        Header: 'Documents',
        accessor: 'documents',
        Cell: ({ row }) => (
          <Button
            onClick={() => showModal('viewDocuments', row.original)}
            icon={<FileTextOutlined />}
          >
            View ({row.original.documents?.length || 0})
          </Button>
        ),
      },
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }) => (
          <Space>
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleViewPatient(row.original)}
            />
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setCurrentPatient(row.original);
                setEditModalVisible(true);
              }}
            />
            <Button
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadCaseSheet(row.original)}
            />
          </Space>
        ),
      },
    ],
    [patients, teamMembers]
  );

  const filteredPatients = useMemo(() => {
    return patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
    );
  }, [patients, searchTerm]);

  const data = useMemo(() => filteredPatients, [filteredPatients]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  return (
    <div className="">
      <div className="flex justify-between mb-6">
        <Input
          placeholder="Search patients by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-6 max-w-md text-black dark:text-black"
        />
        <button 
          onClick={() => setAddModalVisible(true)}
          className="bg-blue-600 dark:bg-meta-4 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-meta-3 mtb-btn small-button"
        >
          <PlusOutlined className="mr-2 " />
          <span className="hidden sm:inline">Add Patient</span>
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center">
          <Spin size="large" />
        </div>
      ) : (
        <div className="overflow-x-auto">
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        <table {...getTableProps()} className="min-w-full bg-white dark:bg-boxdark rounded-lg shadow-md">
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()} className="border-b dark:border-meta-4">
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()} className="px-4 py-2 text-left text-lg font-bold text-black dark:text-white">
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                  {row.cells.map(cell => {
                    const cellProps = cell.getCellProps();
                    const columnHeader = cell.column.Header + " :";
                    return (
                      <td key={cellProps.key} {...cellProps} className="px-4 py-2 text-sm text-black dark:text-white" data-label={columnHeader} >
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        </div>
      )}

      <AddPatientModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAdd={handleAddPatient}
      />

      <EditPatientModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        patient={currentPatient}
        onSave={handleEditPatient}
        onDelete={showDeleteConfirm}
      />

      <Modal
        title="Patient Notes"
        visible={noteModalVisible}
        onCancel={() => setNoteModalVisible(false)}
        footer={null}
      >
        <p>{currentNote}</p>
      </Modal>

      <Modal
        title="Patient Details"
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
        ]}
        width={720}
      >
        {currentPatient && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Patient ID</p>
                <p>{currentPatient.patient_id}</p>
              </div>
              <div>
                <p className="font-semibold">Name</p>
                <p>{currentPatient.name}</p>
              </div>
              <div>
                <p className="font-semibold">Age</p>
                <p>{currentPatient.age}</p>
              </div>
              <div>
                <p className="font-semibold">Gender</p>
                <p>{currentPatient.gender}</p>
              </div>
              <div>
                <p className="font-semibold">Phone</p>
                <p>{currentPatient.phone}</p>
              </div>
              <div>
                <p className="font-semibold">Email</p>
                <p>{currentPatient.email}</p>
              </div>
              <div>
                <p className="font-semibold">Care Person</p>
                <p>{currentPatient.care_person}</p>
              </div>
            </div>

            <div>
              <p className="font-semibold">Notes</p>
              <p>{currentPatient.notes || 'No notes available'}</p>
            </div>

            <div>
              <p className="font-semibold">Documents</p>
              {currentPatient.documents && currentPatient.documents.length > 0 ? (
                <ul>
                  {currentPatient.documents.map((doc, index) => (
                    <li key={index}>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        {doc.name}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No documents available</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Patients;