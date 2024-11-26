import React, { useState } from 'react';
import { Modal, Input } from 'antd';

const EditPatientModal = ({ visible, onClose, patient, onSave }) => {
  const [formData, setFormData] = useState(patient);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Modal
      title="Edit Patient"
      visible={visible}
      onOk={handleSave}
      onCancel={onClose}
      okText="Save"
      cancelText="Cancel"
    >
      <div className="flex flex-col space-y-4">
        <Input
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <Input
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <Input
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <Input
          placeholder="Notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>
    </Modal>
  );
};

export default EditPatientModal; 