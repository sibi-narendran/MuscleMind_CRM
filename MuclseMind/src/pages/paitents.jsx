import React from 'react';
import Breadcrumb from '../comman/Breadcrumb';
import Patients from '../components/Patients';

const PatientsPage = () => {
  return (
    <React.Fragment>
      <Breadcrumb pageName="Patients" />

      <div className="flex flex-col gap-5">
      <Patients />
      </div>
    </React.Fragment>
  );
};

export default PatientsPage;
