import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Stethoscope } from "../lib/icons";
import { clinicInfo } from '../api.services/services';

export default function PrescriptionPreview({ data }) {
  const [clinicData, setClinicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        setLoading(true);
        const data = await clinicInfo();
        if (data.success) {
          setClinicData(data.data);
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch clinic data');
      } finally {
        setLoading(false);
      }
    };

    fetchClinicData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <div className="border-b pb-4 mb-4 flex justify-between">
        <div>
          <div className="flex items-center gap-2  text-meta-4">
            <Stethoscope className="w-6 h-6" />
            <div>
              <h2 className="font-bold">{clinicData?.clinicName || 'Dental Clinic'}</h2>
              <p className="text-sm">{clinicData?.description || 'Tooth Pain Sensation Care'}</p>
            </div>
          </div>
          
          <div className="mt-2 text-sm text-meta-4">
            <p>{clinicData?.address || '201, Down Town Street, on'}</p>
            <p>{clinicData?.city || 'NEW YORK CITY'}</p>
            <p>{clinicData?.phoneNumber || '02-1234567, +880-12345678'}</p>
          </div>
        </div>
        
        <div className="text-right text-meta-4">
          <h3 className="font-bold">{clinicData?.username || 'DR. NAME SURNAME'}</h3>
          <p className="text-sm text-gray-600">{clinicData?.specialization || 'DENTAL SURGEON, MPH'}</p>
          <p className="text-sm text-gray-600">{clinicData?.department || 'Medical officer, Dept.of Oral Medicine'}</p>
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
            <div className="w-32 h-12 border-b border-red-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

PrescriptionPreview.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    age: PropTypes.string,
    sex: PropTypes.oneOf(['M', 'F']),
    date: PropTypes.string,
    medicines: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      dosage: PropTypes.string.isRequired,
      duration: PropTypes.string.isRequired,
      morning: PropTypes.bool,
      afternoon: PropTypes.bool,
      night: PropTypes.bool,
      instructions: PropTypes.string
    }))
  })
};
