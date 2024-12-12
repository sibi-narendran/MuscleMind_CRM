import { jsPDF } from 'jspdf';

const CaseSheetPdfGenerator = (patientData) => {
  const doc = new jsPDF();
  
  // Helper function to convert any value to string and handle null/undefined
  const toString = (value) => {
    if (value === null || value === undefined) return '';
    return String(value);
  };
  
  // Set initial font styles
  const headerFont = 'helvetica';
  const bodyFont = 'helvetica';
  doc.setFont(headerFont, 'bold');
  
  // Add main border
  doc.rect(10, 10, 190, 277);
  
  // Department Header
  doc.rect(15, 15, 180, 15);
  doc.setFontSize(12);
  doc.text('DEPT. OF CONSERVATIVE DENTISTRY AND', 105, 22, { align: 'center' });
  doc.text('ENDODONTICS', 105, 28, { align: 'center' });
  
  // Case Record header
  doc.rect(15, 32, 180, 10);
  doc.text('CASE RECORD', 105, 38, { align: 'center' });
  
  // Patient Information Section
  const startY = 45;
  const lineHeight = 7;
  let currentY = startY;
  
  // Patient info border
  doc.rect(15, startY, 180, 45);
  
  // Basic info
  doc.setFont(bodyFont, 'normal');
  doc.setFontSize(10);
  
  let leftX = 20;
  let rightX = 120;
  
  // First row
  doc.text("Doctors Name:", leftX, currentY + 7);
  doc.text(patientData.care_person ? `Dr. ${toString(patientData.care_person)}` : '', leftX + 35, currentY + 7);
  doc.text("S.No.", rightX, currentY + 7);
  doc.text(toString(patientData.patient_id), rightX + 25, currentY + 7);
  
  // Second row
  currentY += lineHeight;
  doc.text("Pt. Name:", leftX, currentY + 7);
  doc.text(toString(patientData.name), leftX + 35, currentY + 7);
  doc.text("Date:", rightX, currentY + 7);
  doc.text(new Date().toLocaleDateString(), rightX + 25, currentY + 7);
  
  // Third row
  currentY += lineHeight;
  doc.text("Age/Sex:", leftX, currentY + 7);
  doc.text(`${toString(patientData.age)} / ${toString(patientData.gender)}`, leftX + 35, currentY + 7);
  
  // Fourth row
  currentY += lineHeight;
  doc.text("Address/Ph. No.", leftX, currentY + 7);
  doc.text(toString(patientData.phone), leftX + 35, currentY + 7);

  // DENTAL HISTORY Section
  currentY = 95;
  doc.rect(15, currentY, 180, 80); // Outer rectangle
  doc.line(105, currentY, 105, currentY + 80); // Divider for left and right sections
  doc.setFont(headerFont, 'bold');
  doc.text('DENTAL HISTORY:', leftX, currentY + 4);

  // Left Side Fields
  let leftY = currentY + 13; // Reduced initial spacing
  doc.setFont(bodyFont, 'normal');
  doc.text('Chief Complaint:', leftX, leftY + 6);
  if (patientData.case_sheet_info?.chief_complaint) {
    const complaintText = doc.splitTextToSize(toString(patientData.case_sheet_info.chief_complaint), 85);
    doc.text(complaintText, leftX + 5, leftY + 12);
  }

  leftY += 13; // Reduced spacing between fields
  doc.text('History of Present Illness:', leftX, leftY + 8);
  if (patientData.case_sheet_info?.present_illness) {
    const illnessText = doc.splitTextToSize(toString(patientData.case_sheet_info.present_illness), 85);
    doc.text(illnessText, leftX + 5, leftY + 12);
  }

  leftY += 13; // Reduced spacing
  doc.text('Past Dental History:', leftX, leftY + 8);
  if (patientData.case_sheet_info?.dental_history) {
    const historyText = doc.splitTextToSize(toString(patientData.case_sheet_info.dental_history), 85);
    doc.text(historyText, leftX + 5, leftY + 12);
  }

  leftY += 13; // Reduced spacing
  doc.text('Treatment Plan:', leftX, leftY + 8);
  if (patientData.case_sheet_info?.treatment_plan) {
    const familyText = doc.splitTextToSize(toString(patientData.case_sheet_info.treatment_plan), 85);
    doc.text(familyText, leftX + 5, leftY + 12);
  }

  // Right Side Fields
  let rightY = currentY + 12; // Reduced initial spacing

  doc.text('Decayed:', rightX, rightY + 8);
  if (patientData.case_sheet_info?.decayed) {
    doc.text(toString(patientData.case_sheet_info.decayed), rightX + 30, rightY + 6);
  }

  rightY += 12; // Reduced spacing
  doc.text('Grossly Decayed:', rightX, rightY + 6);
  if (patientData.case_sheet_info?.grossly_decayed) {
    doc.text(toString(patientData.case_sheet_info.grossly_decayed), rightX + 30, rightY + 6);
  }

  rightY += 12; // Reduced spacing
  doc.text('Roots Stumps:', rightX, rightY + 6);
  if (patientData.case_sheet_info?.roots_stumps) {
    doc.text(toString(patientData.case_sheet_info.roots_stumps), rightX + 30, rightY + 6);
  }

  rightY += 12; // Reduced spacing
  doc.text('Other Diagnosis:', rightX, rightY + 6);
  if (patientData.case_sheet_info?.other_diagnosis) {
    doc.text(toString(patientData.case_sheet_info.other_diagnosis), rightX + 30, rightY + 6);
  }




  // PAST MEDICAL HISTORY Section
  currentY = 180;
  doc.rect(15, currentY, 180, 40);
  doc.setFont(headerFont, 'bold');
  doc.text('PAST MEDICAL HISTORY:', leftX, currentY + 7);
  doc.setFont(bodyFont, 'normal');
  
  // Medical conditions grid
  currentY += 12;
  const conditions = [
    ['Cardiovascular', 'Hepatic'],
    ['Respiratory', 'Renal'],
    ['Gastrointestinal', 'Endocrine'],
    ['Neural', '(Diabetes)']
  ];
  
  conditions.forEach((row, index) => {
    const y = currentY + (index * 7);
    doc.text(row[0], leftX, y);
    doc.text(toString(patientData.case_sheet_info?.medical_conditions?.[row[0].toLowerCase()] || 'No'), leftX + 45, y);
    doc.text(row[1], rightX, y);
    doc.text(toString(patientData.case_sheet_info?.medical_conditions?.[row[1].toLowerCase()] || 'No'), rightX + 45, y);
  });

  // ALLERGIC TO Section
  currentY = 225;
  doc.rect(15, currentY, 180, 15);
  doc.setFont(headerFont, 'bold');
  doc.text('ALLERGIC TO:', leftX, currentY + 7);
  doc.setFont(bodyFont, 'normal');
  if (patientData.case_sheet_info?.allergies) {
    doc.text(toString(patientData.case_sheet_info.allergies), leftX + 45, currentY + 7);
  }

  // Hospitalization Section
  currentY = 245;
  doc.rect(15, currentY, 180, 20);
  doc.text('Have you been hospitalized / Operated:', leftX, currentY + 7);
  doc.text(toString(patientData.case_sheet_info?.hospitalization_history || 'No'), leftX + 100, currentY + 7);
  
  if (patientData.case_sheet_info?.hospitalization_history === 'Yes' && patientData.case_sheet_info?.hospitalization_details) {
    doc.text('If Yes, give details:', leftX, currentY + 14);
    const details = doc.splitTextToSize(toString(patientData.case_sheet_info.hospitalization_details), 165);
    doc.text(details, leftX + 45, currentY + 14);
  }

  // Pregnancy Section
  currentY = 270;
  doc.rect(15, currentY, 180, 15);
  doc.text('Are you pregnant?', leftX, currentY + 7);
  doc.text(toString(patientData.case_sheet_info?.pregnancy_status || 'No'), leftX + 100, currentY + 7);
  
  if (patientData.case_sheet_info?.pregnancy_status === 'Yes') {
    // Trimester checkboxes
    const trimesterX = [leftX + 120, leftX + 160, leftX + 200];
    const trimesterLabels = ['I TRIMESTER', 'II TRIMESTER', 'III TRIMESTER'];
    const selectedTrimester = patientData.case_sheet_info?.trimester;
    
    trimesterLabels.forEach((label, index) => {
      doc.rect(trimesterX[index], currentY + 3, 4, 4);
      doc.text(label, trimesterX[index] + 7, currentY + 7);
      if (selectedTrimester === label[0]) {
        doc.text('X', trimesterX[index] + 1, currentY + 6);
      }
    });
  }

  return doc;
};

export default CaseSheetPdfGenerator;
