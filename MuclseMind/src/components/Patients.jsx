import React, { useState } from 'react';
import { useTable } from 'react-table';
import { Button, Modal, Input } from 'antd';
import { Plus, Eye, Edit, Trash } from 'lucide-react';
import EditPatientModal from './EditPatientModal';

const Patients = () => {
  const [patients, setPatients] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      notes: 'Patient has a history of hypertension.',
      caseSheetLink: 'http://example.com/casesheet/johndoe',
      carePerson: 'Doctor 1',
      otherDocuments: []
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '987-654-3210',
      notes: 'Allergic to penicillin.',
      caseSheetLink: 'http://example.com/casesheet/janesmith',
      carePerson: 'Doctor 2',
      otherDocuments: []
    },
    {
      id: 3,
      name: 'Alice Johnson',
      email: 'alice.j@example.com',
      phone: '555-123-4567',
      notes: 'Requires regular check-ups.',
      caseSheetLink: 'http://example.com/casesheet/alicejohnson',
      carePerson: 'Doctor 1',
      otherDocuments: []
    }
  ]);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handleAddPatient = () => {
    const newPatient = {
      id: patients.length + 1,
      name: '',
      email: '',
      phone: '',
      notes: '',
      caseSheetLink: '',
      carePerson: 'Doctor 1',
      otherDocuments: []
    };
    setPatients([...patients, newPatient]);
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setIsEditModalVisible(true);
  };

  const handleDeletePatient = (patient) => {
    setSelectedPatient(patient);
    setIsDeleteModalVisible(true);
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setIsViewModalVisible(true);
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Contact',
        accessor: 'phone',
        Cell: ({ row }) => (
          <>
            <div>{row.original.phone}</div>
            <div>{row.original.email}</div>
          </>
        ),
      },
      {
        Header: 'Case Sheet',
        accessor: 'caseSheetLink',
        Cell: ({ value }) => (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-meta-2">
            View Case Sheet
          </a>
        ),
      },
      {
        Header: 'Notes',
        accessor: 'notes',
      },
      {
        Header: 'Care of',
        accessor: 'carePerson',
      },
      {
        Header: 'Actions',
        Cell: ({ row }) => (
          <div className="flex space-x-2">
            <Button icon={<Eye />} onClick={() => handleViewPatient(row.original)} />
            <Button icon={<Edit />} onClick={() => handleEditPatient(row.original)} />
            <Button icon={<Trash />} onClick={() => handleDeletePatient(row.original)} />
          </div>
        ),
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data: patients });

  return (
    <div className="p-6 dark:bg-boxdark dark:text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patients</h1>
        <button
          onClick={handleAddPatient}
          className="flex items-center px-4 py-2 bg-blue-600 dark:bg-meta-4 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Patient
        </button>
      </div>

      <div className="bg-white dark:bg-boxdark rounded-xl shadow-sm border border-gray-100 dark:border-strokedark">
        <div className="overflow-x-auto">
          <table {...getTableProps()} className="w-full">
            <thead>
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()} className="bg-gray-50 dark:bg-boxdark">
                  {headerGroup.headers.map(column => (
                    <th {...column.getHeaderProps()} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-meta-2">
                      {column.render('Header')}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="bg-white dark:bg-boxdark divide-y divide-gray-200 dark:divide-strokedark">
              {rows.map(row => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} className="hover:bg-gray-50 dark:hover:bg-meta-4">
                    {row.cells.map(cell => (
                      <td {...cell.getCellProps()} className="px-6 py-4 dark:text-meta-2">
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Patient Modal */}
      {selectedPatient && (
        <Modal
          title="Patient Details"
          visible={isViewModalVisible}
          onCancel={() => setIsViewModalVisible(false)}
          footer={null}
        >
          <p><strong>Name:</strong> {selectedPatient.name}</p>
          <p><strong>Email:</strong> {selectedPatient.email}</p>
          <p><strong>Phone:</strong> {selectedPatient.phone}</p>
          <p><strong>Notes:</strong> {selectedPatient.notes}</p>
          <p><strong>Care of:</strong> {selectedPatient.carePerson}</p>
          <p>
            <strong>Case Sheet:</strong> <a href={selectedPatient.caseSheetLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-meta-2">View Case Sheet</a>
          </p>
        </Modal>
      )}

      {/* Edit Patient Modal */}
      {selectedPatient && (
        <EditPatientModal
          visible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          patient={selectedPatient}
          onSave={(updatedPatient) => {
            setPatients(patients.map(p => (p.id === updatedPatient.id ? updatedPatient : p)));
            setIsEditModalVisible(false);
          }}
        />
      )}

      {/* Delete Patient Modal */}
      {selectedPatient && (
        <Modal
          title="Delete Patient"
          visible={isDeleteModalVisible}
          onOk={() => {
            setPatients(patients.filter(p => p.id !== selectedPatient.id));
            setIsDeleteModalVisible(false);
          }}
          onCancel={() => setIsDeleteModalVisible(false)}
          okText="Delete"
          cancelText="Cancel"
        >
          <p>Are you sure you want to delete {selectedPatient.name}?</p>
        </Modal>
      )}
    </div>
  );
};

export default Patients;
