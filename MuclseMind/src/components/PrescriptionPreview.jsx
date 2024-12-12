import React from 'react';
import { FaStethoscope } from 'react-icons/fa';

// Static clinic data
const clinicData = {
  clinicName: 'Dental Clinic',
  description: 'Tooth Pain Sensation Care',
  address: '201, Down Town Street',
  city: 'NEW YORK CITY',
  phoneNumber: '02-1234567',
  username: 'DR. NAME SURNAME',
  specialization: 'DENTAL SURGEON, MPH',
  department: 'Medical officer, Dept.of Oral Medicine'
};

export default function PrescriptionPreview({ data }) {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <div className="border-b pb-4 mb-4 flex justify-between">
        <div>
          <div className="flex items-center gap-2 text-meta-4">
            <FaStethoscope className="w-6 h-6" />
            <div>
              <h2 className="font-bold">{clinicData.clinicName}</h2>
              <p className="text-sm">{clinicData.description}</p>
            </div>
          </div>

          <div className="mt-2 text-sm text-meta-4">
            <p>{clinicData.address}</p>
            <p>{clinicData.city}</p>
            <p>{clinicData.phoneNumber}</p>
          </div>
        </div>

        <div className="text-right text-meta-4">
          <h3 className="font-bold">{clinicData.username}</h3>
          <p className="text-sm text-gray-600">{clinicData.specialization}</p>
          <p className="text-sm text-gray-600">{clinicData.department}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name:</p>
            <p>{data.name || '_______'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Age:</p>
            <p>{data.age || '_______'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Sex:</p>
            <p>{data.sex || '_______'}</p>
          </div>
        </div>

        <div className="min-h-[300px] bg-gray-50 rounded border p-4">
          {data.medicines?.map((medicine, index) => (
            <div key={index} className="mb-6 border-b pb-4">
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="text-xs text-gray-500">Medicine Name</label>
                  <p className="font-medium">{medicine.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Dosage</label>
                    <p className="text-sm">{medicine.dosage}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Duration</label>
                    <p className="text-sm">{medicine.duration}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-2">
                <div>
                  <label className="text-xs text-gray-500">Morning</label>
                  <p className="text-sm">{medicine.morning ? "✓" : "-"}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Afternoon</label>
                  <p className="text-sm">{medicine.afternoon ? "✓" : "-"}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Night</label>
                  <p className="text-sm">{medicine.night ? "✓" : "-"}</p>
                </div>
              </div>

              {medicine.instructions && (
                <div>
                  <label className="text-xs text-gray-500">Special Instructions</label>
                  <p className="text-sm text-gray-600">{medicine.instructions}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between pt-4">
          <div>
            <p className="text-sm text-gray-600">Date:</p>
            <p>{data.date || '_______'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Signature:</p>
            
          </div>
        </div>
      </div>
    </div>
  );
}
