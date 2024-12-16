import React, { useEffect, useState, useMemo } from 'react';
import { Button, Input, message, Space, Modal, Spin, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, EyeOutlined, SearchOutlined, FileTextOutlined } from '@ant-design/icons';
import PreviewCaseSheet from '../components/PreviewCaseSheet';
import AddPatientModal from '../components/AddPatientModal';
import EditPatientModal from '../components/EditPatientModal';
import CaseSheetPdfGenerator from '../components/CaseSheetPdfGenerator';
import { getPatients, addPatient, editPatient, deletePatient, getTeamMembers } from '../api.services/services';
import { useTable } from 'react-table';
import '../assets/css/Patients.css';
import { getUserProfile } from '../api.services/services';  
import ViewPatientModal from './ViewPatientModal';

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
  const [userProfile, setUserProfile] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [clinicName, setClinicName] = useState('');
  


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
    fetchUserProfile();
  }, []);
  

  const handleViewPatient = (patient) => {
    setCurrentPatient(patient);
    setViewModalVisible(true);
  };

  const fetchUserProfile = async () => {
    const response = await getUserProfile();
    const clinicName = response.data?.clinicName || '';
    setUserProfile(clinicName);
  };

  const handleDownloadCaseSheet = (patient) => {
    console.log("line 63", userProfile);
    const doc = CaseSheetPdfGenerator(patient, userProfile);
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
        setEditModalVisible(false);
      },
    });
  };

  const handleAddPatient = async (newPatient) => {
    try {
      await addPatient(newPatient);
      message.success('Patient added successfully ' + newPatient.name);
      setAddModalVisible(false);
      fetchPatients();
    } catch (error) {
      message.error('Failed to add patient: ' + error.message);
    }
  };

  const handleEditPatient = async (updatedPatient) => {
    try {
      await editPatient(updatedPatient.id, updatedPatient);
      message.success('Patient updated successfully ' + updatedPatient.name);
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
        Cell: ({ value }) => (
          <p className="text-sm text-black dark:text-white">{value}</p>
        ),
      },
      {
        Header: 'Name',
        accessor: 'name',
        Cell: ({ value }) => (
          <p className="text-sm text-black dark:text-white">{value}</p>
        ),
      },
      {
        Header: 'Basic Info',
        accessor: 'contact',
        Cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <p className="text-sm text-black dark:text-white">
              <span className="font-medium">Gender:</span> {row.original.gender || '-'}
            </p>
            <p className="text-sm text-black dark:text-white">
              <span className="font-medium">Age:</span> {row.original.age}
            </p>
          </div>
        ),
      },
      {
        Header: 'Care By',
        accessor: 'care_person',
        Cell: ({ value }) => (
          <p className="text-sm text-black dark:text-white">
            {value ? `Dr. ${value}` : '-'}
          </p>
        ),
      },
      {
        Header: 'View Case Sheet',
        accessor: 'case_sheet',
        Cell: ({ row }) => (
          <button
            onClick={() => {
              const doc = CaseSheetPdfGenerator(row.original, clinicName);
              const pdfDataUri = doc.output('datauristring');
              const previewWindow = window.open();
              if (previewWindow) {
                previewWindow.document.write(
                  `<iframe width='100%' height='100%' src='${pdfDataUri}'></iframe>`
                );
              }
            }}
            className="px-3 py-1 bg-primary text-white rounded hover:bg-opacity-90 text-sm"
          >
            View
          </button>
        ),
      },
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewPatient(row.original)}
              className="p-2 rounded-lg text-primary hover:bg-primary/10 active:bg-primary/20"
            >
              <EyeOutlined style={{ fontSize: '18px' }} />
            </button>
            <button
              onClick={() => {
                setCurrentPatient(row.original);
                setEditModalVisible(true);
              }}
              className="p-2 rounded-lg text-primary hover:bg-primary/10 active:bg-primary/20"
            >
              <EditOutlined style={{ fontSize: '18px' }} />
            </button>
            <button
              onClick={() => handleDownloadCaseSheet(row.original)}
              className="p-2 rounded-lg text-primary hover:bg-primary/10 active:bg-primary/20"
            >
              <DownloadOutlined style={{ fontSize: '18px' }} />
            </button>
          </div>
        ),
      },
    ],
    [clinicName]
  );

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => 
      String(patient.patient_id).includes(searchTerm) ||
      patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data: filteredPatients });

  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        const response = await getUserProfile();
        if (response.success && response.data) {
          setClinicName(response.data.clinicName);
        }
      } catch (error) {
        console.error('Error fetching clinic data:', error);
      }
    };

    fetchClinicData();
  }, []);

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md dark:bg-meta-4 dark:text-white"
          prefix={<SearchOutlined className="text-gray-400" />}
        />
        <Button 
          className="bg-primary hover:bg-opacity-90 text-white rounded-md"
          onClick={() => setAddModalVisible(true)}
          icon={<PlusOutlined />}
        >
          Add Patient
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Spin size="large" />
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <table {...getTableProps()} className="w-full table-auto">
            <thead>
              {headerGroups.map(headerGroup => (
                <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th 
                      key={column.id}
                      {...column.getHeaderProps()}
                      className="font-extrabold text-black dark:text-white px-4 py-4 text-left text-sm border-b border-[#eee] dark:border-strokedark"
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
                  <tr 
                    key={row.id} 
                    {...row.getRowProps()}
                    className="hover:bg-gray-1 dark:hover:bg-meta-4"
                  >
                    {row.cells.map(cell => (
                      <td 
                        key={cell.column.id}
                        {...cell.getCellProps()}
                        className="border-b border-[#eee] px-4 py-2 dark:border-strokedark text-black dark:text-white"
                      >
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

      <ViewPatientModal
        visible={viewModalVisible}
        onClose={() => setViewModalVisible(false)}
        patient={currentPatient}
      />

      <PreviewCaseSheet
        visible={previewModalVisible}
        onClose={() => setPreviewModalVisible(false)}
        patient={currentPatient}
        clinicName={clinicName}
      />
    </div>
  );
};

export default Patients;
