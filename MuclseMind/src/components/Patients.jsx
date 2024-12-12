import React, { useEffect, useState, useMemo } from 'react';
import { Button, Input, message, Space, Modal, Spin, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import PreviewCaseSheet from '../components/PreviewCaseSheet';
import AddPatientModal from '../components/AddPatientModal';
import EditPatientModal from '../components/EditPatientModal';
import CaseSheetPdfGenerator from '../components/CaseSheetPdfGenerator';
import { getPatients, addPatient, editPatient, deletePatient, getTeamMembers } from '../api.services/services';
import { useTable } from 'react-table';
import '../assets/css/Patients.css';

const { Option } = Select;

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [carePresons, setCarePresons] = useState([]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await getPatients();
      setPatients(Array.isArray(response.data) ? response.data : []);
      const carePresonsResponse = await getTeamMembers();
      setCarePresons(Array.isArray(carePresonsResponse.data) ? carePresonsResponse.data : []);
    } catch (error) {
      message.error('Failed to fetch patients: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleViewPatient = (patient) => {
    setCurrentPatient(patient);
    setPreviewModalVisible(true);
  };

  const handleDownloadCaseSheet = (patient) => {
    const doc = CaseSheetPdfGenerator(patient);
    doc.save(`${patient.name}_case_sheet.pdf`);
  };

  const showDeleteConfirm = (patient) => {
    Modal.confirm({
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
      fetchPatients();
    } catch (error) {
      message.error('Failed to add patient: ' + error.message);
    }
  };

  const handleEditPatient = async (updatedPatient) => {
    try {
      await editPatient(updatedPatient.id, updatedPatient);
      message.success('Patient updated successfully');
      setEditModalVisible(false);
      fetchPatients();
    } catch (error) {
      message.error('Failed to update patient: ' + error.message);
    }
  };

  const handleDeletePatient = async (id) => {
    try {
      await deletePatient(id);
      message.success('Patient deleted successfully');
      fetchPatients();
    } catch (error) {
      message.error('Failed to delete patient: ' + error.message);
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
            <p className='ml-2'>Gender: {row.original.gender || '-'}</p>
            <p className='ml-2'>Age: {row.original.age}</p>
          </div>
        ),
      },
      {
        Header: 'Care by',
        accessor: 'care_person',
        Cell: ({ row }) => (
          <div>{row.original.care_person ? `Dr. ${row.original.care_person}` : '-'}</div>
        ),
      },
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }) => (
          <Space className="flex gap-2">
            <Button
              className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-white"
              icon={<EyeOutlined />}
              onClick={() => handleViewPatient(row.original)}
            />
            <Button
              className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-white"
              icon={<EditOutlined />}
              onClick={() => {
                setCurrentPatient(row.original);
                setEditModalVisible(true);
              }}
            />
            <Button
              className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-white"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadCaseSheet(row.original)}
            />
          </Space>
        ),
      },
    ],
    []
  );

  const filteredPatients = useMemo(() => {
    return patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patient_id.includes(searchTerm)
    );
  }, [patients, searchTerm]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data: filteredPatients });

  return (
    <div className="p-4 bg-white dark:bg-boxdark">
      <div className="flex justify-between mb-6">
        <Input
          placeholder="Search patients by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md dark:bg-meta-4 dark:text-white dark:border-meta-4"
        />
        <Button 
          className="bg-primary dark:bg-meta-4 text-white hover:bg-primary-dark dark:hover:bg-meta-3"
          onClick={() => setAddModalVisible(true)}
          icon={<PlusOutlined />}
        >
          Add Patient
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <Spin size="large" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table {...getTableProps()} className="min-w-full bg-white dark:bg-boxdark">
            <thead className="bg-gray-50 dark:bg-meta-4">
              {headerGroups.map(headerGroup => (
                <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th 
                      key={column.id}
                      {...column.getHeaderProps()}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider"
                    >
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
                  <tr key={row.id} {...row.getRowProps()}>
                    {row.cells.map(cell => (
                      <td key={cell.column.id} {...cell.getCellProps()}>
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
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

      <PreviewCaseSheet
        visible={previewModalVisible}
        onClose={() => setPreviewModalVisible(false)}
        patient={currentPatient}
      />
    </div>
  );
};

export default Patients;
