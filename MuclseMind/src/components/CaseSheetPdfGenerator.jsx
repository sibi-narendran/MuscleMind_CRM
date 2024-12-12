import { jsPDF } from 'jspdf';

const CaseSheetPdfGenerator = (patientData) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Set font styles
    const headerFont = 'helvetica';
    const bodyFont = 'helvetica';
    doc.setFont(headerFont, 'bold');
    
    // Add border to the page
    doc.rect(10, 10, 190, 277);
    
    // Header with border
    doc.rect(15, 15, 180, 15);
    doc.setFontSize(12);
    doc.text('DEPT. OF CONSERVATIVE DENTISTRY AND', 105, 22, { align: 'center' });
    doc.text('ENDODONTICS', 105, 28, { align: 'center' });
    
    // Case Record header with border
    doc.rect(15, 32, 180, 10);
    doc.text('CASE RECORD', 105, 38, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont(bodyFont, 'normal');
    
    // Patient Information Section
    const startY = 45;
    const lineHeight = 7;
    let currentY = startY;

    // Draw borders for patient info section
    doc.rect(15, startY, 180, 45);

    // Left column
    doc.setFontSize(10);
    doc.text(`Doctor's Name:`, 20, currentY + 5);
    doc.text(`${patientData.care_person || ''}`, 55, currentY + 5);
    
    currentY += lineHeight;
    doc.text(`Pt. Name:`, 20, currentY + 5);
    doc.text(`${patientData.name || ''}`, 55, currentY + 5);
    
    currentY += lineHeight;
    doc.text(`Age/Sex:`, 20, currentY + 5);
    doc.text(`${patientData.age || ''} / ${patientData.gender || ''}`, 55, currentY + 5);
    
    currentY += lineHeight;
    doc.text(`Occupation:`, 20, currentY + 5);
    doc.text(`${patientData.occupation || ''}`, 55, currentY + 5);
    
    currentY += lineHeight;
    doc.text(`Marital Status:`, 20, currentY + 5);
    doc.text(`${patientData.marital_status || ''}`, 55, currentY + 5);
    
    currentY += lineHeight;
    doc.text(`Address/Ph. No:`, 20, currentY + 5);
    doc.text(`${patientData.phone || ''}`, 55, currentY + 5);

    // Right column
    doc.text(`S.No:`, 120, startY + 5);
    doc.text(`${patientData.patient_id || ''}`, 140, startY + 5);
    
    doc.text(`O.P. No.:`, 120, startY + lineHeight + 5);
    doc.text(`${patientData.op_no || ''}`, 140, startY + lineHeight + 5);
    
    doc.text(`Date:`, 120, startY + (lineHeight * 2) + 5);
    doc.text(`${new Date().toLocaleDateString()}`, 140, startY + (lineHeight * 2) + 5);

    // Dental History Section
    currentY = 95;
    doc.setFont(headerFont, 'bold');
    doc.rect(15, currentY, 180, 60);
    doc.text('DENTAL HISTORY:', 20, currentY + 7);
    doc.setFont(bodyFont, 'normal');
    
    // Chief Complaint
    doc.text('Chief Complaint:', 20, currentY + 15);
    if (patientData.case_sheet_info?.chief_complaint) {
      const complaintText = doc.splitTextToSize(patientData.case_sheet_info.chief_complaint, 165);
      doc.text(complaintText, 25, currentY + 22);
    }
    
    // History of Present Illness
    currentY += 35;
    doc.setFont(headerFont, 'bold');
    doc.text('History of Present Illness:', 20, currentY);
    doc.setFont(bodyFont, 'normal');
    if (patientData.case_sheet_info?.present_illness) {
      const illnessText = doc.splitTextToSize(patientData.case_sheet_info.present_illness, 165);
      doc.text(illnessText, 25, currentY + 7);
    }
    
    if (patientData.case_sheet_info?.medical_history) {
      const medicalHistory = doc.splitTextToSize(patientData.case_sheet_info.medical_history, 170);
      doc.text(medicalHistory, 20, currentY);
      currentY += (lineHeight * medicalHistory.length);
    }

    // Past Dental History
    currentY += lineHeight;
    doc.setFont(headerFont, 'bold');
    doc.text('Past Dental History:', 20, currentY);
    doc.setFont(bodyFont, 'normal');
    currentY += lineHeight;
    
    if (patientData.case_sheet_info?.dental_history) {
      const dentalHistory = doc.splitTextToSize(patientData.case_sheet_info.dental_history, 170);
      doc.text(dentalHistory, 20, currentY);
      currentY += (lineHeight * dentalHistory.length);
    }

    // Medical Conditions Grid
    currentY += lineHeight * 2;
    doc.setFont(headerFont, 'bold');
    doc.text('PAST MEDICAL HISTORY:', 20, currentY);
    doc.text('ANY RELATED DISEASES TO:', 20, currentY + lineHeight);
    
    // Create grid for medical conditions
    currentY += lineHeight * 2;
    const conditions = [
      ['Cardiovascular', 'Yes/No', 'Hepatic', 'Yes/No'],
      ['Respiratory', 'Yes/No', 'Renal', 'Yes/No'],
      ['Gastrointestinal', 'Yes/No', 'Endocrine', 'Yes/No'],
      ['Neural', 'Yes/No', '(Diabetes)', 'Yes/No']
    ];

    conditions.forEach((row, index) => {
      doc.text(row[0], 20, currentY + (index * lineHeight));
      doc.text(row[1], 60, currentY + (index * lineHeight));
      doc.text(row[2], 100, currentY + (index * lineHeight));
      doc.text(row[3], 140, currentY + (index * lineHeight));
    });

    // Additional Information
    currentY += lineHeight * 6;
    doc.text('ALLERGIC TO:', 20, currentY);
    
    currentY += lineHeight * 2;
    doc.text('Have you been hospitalized / Operated', 20, currentY);
    doc.text('Yes / No', 140, currentY);
    
    currentY += lineHeight;
    doc.text('If Yes, give details', 20, currentY);
    
    // Pregnancy Information
    currentY += lineHeight * 2;
    doc.text('Are you pregnant?', 20, currentY);
    doc.text('Yes / No', 140, currentY);
    
    currentY += lineHeight * 2;
    // Trimester checkboxes
    doc.rect(20, currentY, 5, 5);
    doc.text('I TRIMESTER', 30, currentY + 4);
    doc.rect(80, currentY, 5, 5);
    doc.text('II TRIMESTER', 90, currentY + 4);
    doc.rect(140, currentY, 5, 5);
    doc.text('III TRIMESTER', 150, currentY + 4);

    return doc;
  };

  return generatePDF();
};

export default CaseSheetPdfGenerator;
