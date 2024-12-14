import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import header from '../Images/HeaderPage.png';
import footer from '../Images/HeaderPage.png';

export const generatePDF = async (data) => {
  // Create a temporary container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '210mm';
  container.style.height = '297mm';
  document.body.appendChild(container);

  // Create prescription content
  container.innerHTML = `
        <!-- Header -->
      <div style="width: 100%; height: 60mm;">
        <img src="${header}" style="width: 100%; height: 100%; object-fit: cover;" />
          <div style="width: 100%; height: 1mm; background-color: #000;"></div>
      </div>
    <div class="bg-white p-6" style="width: 210mm; min-height: 297mm; position: relative;">


      <!-- Patient Info -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1rem;">
        <div>
          <p style="font-size: 0.875rem; color: #4b5563;">Name:</p>
          <p style="font-weight: 500;">${data.patient_name || '_______'}</p>
        </div>
        <div>
          <p style="font-size: 0.875rem; color: #4b5563;">Age:</p>
          <p style="font-weight: 500;">${data.age || '_______'}</p>
        </div>
        <div>
          <p style="font-size: 0.875rem; color: #4b5563;">Sex:</p>
          <p style="font-weight: 500;">${data.gender || '_______'}</p>
        </div>
        <div>
          <p style="font-size: 0.875rem; color: #4b5563;">Date:</p>
          <p style="font-weight: 500;">${format(new Date(), 'dd/MM/yyyy')}</p>
        </div>
        <div>
          <p style="font-size: 0.875rem; color: #4b5563;">Treatment:</p>
          <p style="font-weight: 500;">${data.treatment_name || '_______'}</p>
        </div>
      </div>

      <!-- Medicines -->
      <div style="margin-bottom: 2rem;">
        <h4 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;">Rx:</h4>
        ${data.medicines?.map((medicine, index) => `
          <div style="margin-bottom: 1rem; padding: 0.5rem 1rem; border-bottom: 1px solid #e5e7eb;">
            <!-- Single line medicine details -->
            <div style="display: grid; grid-template-columns: 3fr 2fr 2fr; gap: 1rem; align-items: center;">
              <div style="font-weight: 500; font-size: 1rem;">${medicine.name}</div>
              <div style="font-size: 0.875rem; color: #4b5563;">
                ${medicine.dosage} • ${medicine.duration}
              </div>
              <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <div style="text-align: center;">
                  <span style="display: inline-block; width: 1.25rem; height: 1.25rem; border: 2px solid ${medicine.morning ? '#0891b2' : '#d1d5db'}; border-radius: 0.25rem; background-color: ${medicine.morning ? '#0891b2' : 'transparent'}; color: white; text-align: center; line-height: 1.25rem; font-size: 0.75rem;">
                    ${medicine.morning ? '&#10003;' : ''}
                  </span>
                  <span style="font-size: 0.625rem;">M</span>
                </div>
                <div style="text-align: center;">
                  <span style="display: inline-block; width: 1.25rem; height: 1.25rem; border: 2px solid ${medicine.afternoon ? '#0891b2' : '#d1d5db'}; border-radius: 0.25rem; background-color: ${medicine.afternoon ? '#0891b2' : 'transparent'}; color: white; text-align: center; line-height: 1.25rem; font-size: 0.75rem;">
                    ${medicine.afternoon ? '&#10003;' : ''}
                  </span>
                  <span style="font-size: 0.625rem;">A</span>
                </div>
                <div style="text-align: center;">
                  <span style="display: inline-block; width: 1.25rem; height: 1.25rem; border: 2px solid ${medicine.night ? '#0891b2' : '#d1d5db'}; border-radius: 0.25rem; background-color: ${medicine.night ? '#0891b2' : 'transparent'}; color: white; text-align: center; line-height: 1.25rem; font-size: 0.75rem;">
                    ${medicine.night ? '&#10003;' : ''}
                  </span>
                  <span style="font-size: 0.625rem;">N</span>
                </div>
              </div>
            </div>
            ${medicine.instructions ? `
              <div style="margin-top: 0.25rem; padding-left: 1rem; font-size: 0.75rem; color: #4b5563; font-style: italic;">
                Instructions: ${medicine.instructions}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
</div>
  <div style="width: 100%; height: 1mm; background-color: #000;"></div>
      <!-- Footer -->
      <div style="width: 100%; height: 60mm; position: absolute; bottom: 0;">
        <img src="${footer}" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
    
  `;

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 795, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Convert canvas to image
    const imgData = canvas.toDataURL('image/jpeg', 1.0);

    // Add image to PDF
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297); // A4 dimensions in mm

    // Generate filename
    const filename = `prescription-${data.patient_name?.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    pdf.save(filename);

    // Cleanup
    document.body.removeChild(container);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  } finally {
    // Ensure cleanup even if there's an error
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};
