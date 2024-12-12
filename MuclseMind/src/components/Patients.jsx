import React, { useEffect, useState, useMemo } from 'react';
import { Button, Input, message, Space, Modal, Spin, Select, Tag, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, EyeOutlined, SearchOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
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

  const handleCarePersonChange = async (id, value) => {
    try {
      await editPatient(id, { care_person: value });
      message.success('Care person updated successfully');
      fetchPatients();
    } catch (error) {
      message.error('Failed to update care person: ' + error.message);
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: 'Patient ID',
        accessor: 'patient_id',
        Cell: ({ value }) => (
          <Tag color="blue" className="rounded-full px-3 text-sm">
            #{value}
          </Tag>
        ),
      },
      {
        Header: 'Name',
        accessor: 'name',
        Cell: ({ value }) => (
          <span className="font-semibold text-gray-800 dark:text-white">
            {value}
          </span>
        ),
      },
      {
        Header: 'Basic Info',
        accessor: 'contact',
        Cell: ({ row }) => (
          <div className="space-y-2">
            <span color={row.original.gender === 'Male' ? 'blue' : 'pink'} className="">
              {row.original.gender || '-'}
            </span>
            <div className="text-gray-600 dark:text-gray-300">
              Age: {row.original.age}
            </div>
          </div>
        ),
      },
      {
        Header: 'Care by',
        accessor: 'care_person',
        Cell: ({ row }) => (
          <Select
            value={"Dr. " + row.original.care_person}
            onChange={(value) => handleCarePersonChange(row.original.id, value)}
          >
            {carePresons.map(doctor => (
              <Option key={doctor.name} value={doctor.name}>{"Dr. " + doctor.name || 'N/A'}</Option>
            ))}
          </Select>
        ),
      },

      {
        Header: 'Case Sheet',
        accessor: 'case_sheet_file',
        Cell: ({ row }) => (
          <Button
            type="default"
            onClick={() => showModal('viewCaseSheet', row.original)}
            icon={<FileTextOutlined />}
            className="rounded-lg hover:text-blue-500 hover:border-blue-500"
          >
            View
          </Button>
        ),
      },
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }) => (
          <Space size="middle">
            <Tooltip title="View Details">
              <Button
                type="default"
                shape="circle"
                icon={<EyeOutlined />}
                onClick={() => handleViewPatient(row.original)}
                className="hover:text-blue-500 hover:border-blue-500"
              />
            </Tooltip>
            <Tooltip title="Edit Patient">
              <Button
                type="default"
                shape="circle"
                icon={<EditOutlined />}
                onClick={() => {
                  setCurrentPatient(row.original);
                  setEditModalVisible(true);
                }}
                className="hover:text-green-500 hover:border-green-500"
              />
            </Tooltip>
            <Tooltip title="Download Case Sheet">
              <Button
                type="default"
                shape="circle"
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadCaseSheet(row.original)}
                className="hover:text-purple-500 hover:border-purple-500"
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [carePresons]
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
    <div className="p-6 bg-white dark:bg-boxdark rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search patients by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            className="rounded-lg hover:border-blue-500 focus:border-blue-500"
            size="large"
          />
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => setAddModalVisible(true)}
          className="rounded-lg bg-blue-500 hover:bg-blue-600 border-none ml-4"
        >
          Add Patient
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide">
            <table {...getTableProps()} className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-meta-4 sticky top-0 z-10">
                {headerGroups.map(headerGroup => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => (
                      <th
                        {...column.getHeaderProps()}
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        {column.render('Header')}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody 
                {...getTableBodyProps()}
                className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-boxdark"
              >
                {rows.map(row => {
                  prepareRow(row);
                  return (
                    <tr 
                      {...row.getRowProps()} 
                      className="dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      {row.cells.map(cell => {
                        const cellProps = cell.getCellProps();
                        const columnHeader = cell.column.Header + " :";
                        return (
                          <td 
                            key={cellProps.key} 
                            {...cellProps} 
                            className="px-4 py-2 text-sm text-black dark:text-white" 
                            data-label={columnHeader}
                          >
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

      <PreviewCaseSheet
        visible={previewModalVisible}
        onClose={() => setPreviewModalVisible(false)}
        patient={currentPatient}
      />
    </div>
  );
};

export default Patients;
