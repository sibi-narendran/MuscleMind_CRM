import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const generateBillingPDF = async (billing, userProfileResponse) => {
  let container = null;
  
  try {
    if (!userProfileResponse || !userProfileResponse.data) {
      throw new Error('User profile data is missing');
    }

    // Split patient info (format: "id-name")
    const [patientId, ...patientNameParts] = billing.patient_name.split('-');
    const patientName = patientNameParts.join('-'); // Rejoin in case name contains hyphens

    const headerImageUrl = userProfileResponse.data.header_image_url;
    const gst_number = userProfileResponse.data.gst_number;
    console.log('Header Image URL:', headerImageUrl);

    container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    container.style.width = "210mm";
    container.style.height = "297mm";
    document.body.appendChild(container);

    const formattedDate = formatDate(billing.date);

    const treatments = billing.treatment_name
      .split(",")
      .map((treatment, index) => ({
        name: treatment.trim(),
        cost: (billing.cost / billing.treatment_name.split(",").length).toFixed(2),
        date: formattedDate,
      }));

      container.innerHTML = `
      <!-- Header -->
      <div class="w-full h-[60mm]">
        <img 
          src="${headerImageUrl}" 
          style="width: 100%; height: 100%; object-fit: contain; max-width: 100%; image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;" 
        />
      </div>
     <div class="w-full h-full relative bg-white" style="color: #000000;">
       <!-- Content -->
       <div class="px-10 py-6">
         <!-- Invoice Info -->
         <div style="margin-bottom: 2rem;">
           <div style="display: flex; justify-content: space-between; margin-bottom: 2rem;">
           
             <!-- Patient Info - Left Side -->
             <div>
               <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: #000000;">Patient Information</h3>
               <p style="margin-bottom: 0.5rem; color: #000000;"><span style="font-weight: 600;">Patient ID:</span> ${patientId}</p>
               <p style="margin-bottom: 0.5rem; color: #000000;"><span style="font-weight: 600;">Name:</span> ${patientName}</p>
             </div>
      
             <!-- Invoice Details - Right Side -->
             <div style="text-align: right;">
               <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; color: #000000;">INVOICE</h2>
                <p style="margin-bottom: 0.5rem; color: #000000;"><span style="font-weight: 600;">GST No:</span> ${gst_number}</p>
               <p style="margin-bottom: 0.5rem; color: #000000;"><span style="font-weight: 600;">Invoice No:</span> #${billing.invoice_no}</p>
               <p style="margin-bottom: 0.5rem; color: #000000;"><span style="font-weight: 600;">Date:</span> ${formatDate(billing.date)}</p>
             </div>
           </div>
         </div>
 
         <!-- Treatment Details -->
         <div style="margin-bottom: 2rem;">
           <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: #000000;">Treatment Details</h3>
           <table style="width: 100%; border-collapse: collapse; color: #000000;">
             <thead>
               <tr style="background-color: #f8f9fa;">
                 <th style="padding: 0.75rem 1rem; text-align: left; font-weight: 600; border-bottom: 1px solid #000000;">S.No.</th>
                 <th style="padding: 0.75rem 1rem; text-align: center; font-weight: 600; border-bottom: 1px solid #000000;">Treatment</th>
                 <th style="padding: 0.75rem 1rem; text-align: right; font-weight: 600; border-bottom: 1px solid #000000;">Amount</th>
               </tr>
             </thead>
             <tbody>
               ${treatments
                 .map(
                   (treatment, index) => `
                 <tr>
                   <td style="padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #e5e7eb;">${index + 1}</td>
                   <td style="padding: 0.75rem 1rem;  text-align: center; border-bottom: 1px solid #e5e7eb;">${treatment.name}</td>
                   <td style="padding: 0.75rem 1rem; text-align: right; border-bottom: 1px solid #e5e7eb;">₹${treatment.cost}</td>
                 </tr>
               `
                 )
                 .join("")}
             </tbody>
           </table>
         </div>
 
         <!-- Total Amount -->
         <div style="margin-top: 2rem; text-align: right; border-top: 1px solid #000000; padding-top: 1rem;">
           <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; color: #000000;">Total Amount</h3>
           <p style="font-size: 1.5rem; font-weight: bold; color: #000000;">₹${typeof billing.cost === "string" ? parseFloat(billing.cost).toFixed(2) : billing.cost.toFixed(2)}</p>
         </div>
       </div>
     </div>
   `;

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: 795,
      height: 1123,
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);

    const filename = `invoice-${billing.invoice_no}.pdf`;
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  } finally {
    if (container && document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};