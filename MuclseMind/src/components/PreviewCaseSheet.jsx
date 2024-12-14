import React from 'react';
import { Modal, Button } from 'antd';
import CaseSheetPdfGenerator from './CaseSheetPdfGenerator';

const PreviewCaseSheet = ({ visible, onClose, patient , clinicName}) => {

  console.log("line 7", clinicName);
  
  const handleDownload = () => {
    const doc = CaseSheetPdfGenerator(patient, clinicName);
    doc.save(`${patient.name}_case_sheet.pdf`);
  };

  const handlePreview = () => {
    const doc = CaseSheetPdfGenerator(patient, clinicName);
    const pdfDataUri = doc.output('datauristring');
    const previewWindow = window.open();
    if (previewWindow) {
      previewWindow.document.write(
        `<iframe width='100%' height='100%' src='${pdfDataUri}'></iframe>`
      );
    }
  };

  return (
    <Modal
      title="Case Sheet Preview"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button key="preview" onClick={handlePreview}>
          Preview
        </Button>,
        <Button key="download" type="primary" onClick={handleDownload}>
          Download PDF
        </Button>,
      ]}
    >
      <div className="p-4">
        <div className="mb-4 border-b pb-2">
          <h3 className="text-lg font-semibold">Patient Information</h3>
          <p>Name: {patient?.name}</p>
          <p>Age: {patient?.age}</p>
          <p>Gender: {patient?.gender}</p>
          <p>Phone: {patient?.phone}</p>
        </div>

        <div className="mb-4 border-b pb-2">
          <h3 className="text-lg font-semibold">Case Sheet Information</h3>
          <p>Medical History: {patient?.case_sheet_info?.medical_history}</p>
          <p>Dental History: {patient?.case_sheet_info?.dental_history}</p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold">Treatment Information</h3>
          <p>Decayed: {patient?.case_sheet_info?.decayed}</p>
          <p>Grossly Decayed: {patient?.case_sheet_info?.grossly_decayed}</p>
          <p>Roots Stumps: {patient?.case_sheet_info?.roots_stumps}</p>
          <p>Treatment Plan: {patient?.case_sheet_info?.treatment_plan}</p>
        </div>
      </div>
    </Modal>
  );
};

export default PreviewCaseSheet;
