import React from 'react';
import { Modal, Button } from 'antd';
import CaseSheetPdfGenerator from '../lib/CaseSheetPdfGenerator';

const PreviewCaseSheet = ({ visible, onClose, patient, clinicName }) => {
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
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button key="preview" onClick={handlePreview}>
          Preview
        </Button>
      ]}
    >
      <div className="p-4">
        <p>Click "Preview" to view the case sheet in a new window.</p>
      </div>
    </Modal>
  );
};

export default PreviewCaseSheet;
