import React from 'react';
import { Modal, Form, Row, Col, Collapse } from 'antd';
import { FileOutlined, EyeOutlined } from '@ant-design/icons';

const { Panel } = Collapse;

const ViewPatientModal = ({ visible, onClose, patient }) => {
  if (!patient) return null;

  const renderField = (label, value) => (
    <div className="mb-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="font-medium">{value || '-'}</div>
    </div>
  );

  const handleViewDocument = (url) => {
    // For PDFs and images, open in new tab
    window.open(url, '_blank');
  };

  const renderDocuments = (documents) => {
    if (!documents || documents.length === 0) return <div>No documents available</div>;

    return (
      <div className="space-y-2">
        {documents.map((doc, index) => (
          <div key={index} className="flex items-center justify-between p-2 border rounded">
            <div className="flex items-center space-x-2">
              <FileOutlined className="text-primary" />
              <span>{doc.name}</span>
            </div>
            <button
              onClick={() => handleViewDocument(doc.url)}
              className="flex items-center space-x-1 text-primary hover:text-primary-dark"
            >
              <EyeOutlined />
              <span>View</span>
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Modal
      title="View Patient Details"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Form layout="vertical">
        <Collapse defaultActiveKey={['1']} className="mb-4" accordion={true}>
          <Panel header="Personal Information" key="1">
            <Row gutter={16}>
              <Col span={12}>
                {renderField("Name", patient.name)}
                {renderField("Age", patient.age)}
                {renderField("Gender", patient.gender)}
              </Col>
              <Col span={12}>
                {renderField("Email", patient.email)}
                {renderField("Phone", patient.phone)}
                {renderField("Care of", patient.care_person ? `Dr. ${patient.care_person}` : '-')}
              </Col>
            </Row>
          </Panel>

          <Panel header="Case Sheet Information" key="2">
            <div className="space-y-6">
              {/* DENTAL HISTORY Section */}
              <div className="border p-4 rounded">
                <h3 className="font-bold mb-4">DENTAL HISTORY</h3>
                <Row gutter={16}>
                  <Col span={12}>
                    {renderField("Chief Complaint", patient.case_sheet_info?.chief_complaint)}
                    {renderField("History of Present Illness", patient.case_sheet_info?.present_illness)}
                    {renderField("Past Dental History", patient.case_sheet_info?.dental_history)}
                    {renderField("Medical History", patient.case_sheet_info?.medical_history)}
                  </Col>
                  <Col span={12}>
                    {renderField("Decayed", patient.case_sheet_info?.decayed)}
                    {renderField("Grossly Decayed", patient.case_sheet_info?.grossly_decayed)}
                    {renderField("Roots Stumps", patient.case_sheet_info?.roots_stumps)}
                    {renderField("Other Diagnosis", patient.case_sheet_info?.other_diagnosis)}
                    {renderField("Treatment Plan", patient.case_sheet_info?.treatment_plan)}
                  </Col>
                </Row>
              </div>

              {/* PAST MEDICAL HISTORY Section */}
              <div className="border p-4 rounded">
                <h3 className="font-bold mb-4">PAST MEDICAL HISTORY</h3>
                <p className="mb-2">ANY RELATED DISEASES TO:</p>
                
                <Row gutter={16}>
                  <Col span={12}>
                    {['cardiovascular', 'respiratory', 'gastrointestinal', 'neural'].map((condition) => (
                      renderField(
                        condition.charAt(0).toUpperCase() + condition.slice(1),
                        patient.case_sheet_info?.medical_conditions?.[condition] || 'No'
                      )
                    ))}
                  </Col>
                  <Col span={12}>
                    {['hepatic', 'renal', 'endocrine', 'diabetes'].map((condition) => (
                      renderField(
                        condition.charAt(0).toUpperCase() + condition.slice(1),
                        patient.case_sheet_info?.medical_conditions?.[condition] || 'No'
                      )
                    ))}
                  </Col>
                </Row>
              </div>

              {/* Allergies and Other Medical Information */}
              <div className="border p-4 rounded">
                {renderField("ALLERGIC TO", patient.case_sheet_info?.allergies)}
                {renderField(
                  "Have you been hospitalized / Operated?",
                  patient.case_sheet_info?.hospitalization_history || 'No'
                )}
                {patient.case_sheet_info?.hospitalization_history === 'Yes' && 
                  renderField("Hospitalization Details", patient.case_sheet_info?.hospitalization_details)
                }
                {renderField("Pregnancy Status", patient.case_sheet_info?.pregnancy_status || 'No')}
                {patient.case_sheet_info?.pregnancy_status === 'Yes' && 
                  renderField("Trimester", patient.case_sheet_info?.trimester)
                }
              </div>
            </div>
          </Panel>

 

          <Panel header="Additional Documents" key="4">
            <div className="border p-4 rounded">
              {renderDocuments(patient.documents)}
            </div>
          </Panel>
        </Collapse>
      </Form>
    </Modal>
  );
};

export default ViewPatientModal; 