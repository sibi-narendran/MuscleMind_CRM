import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import header from "../Images/HeaderPage.png";
// Function to format date as DD-MMM-YYYY
const formatDate = (dateString) => {
  const date = new Date(dateString);    
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const generateBillingPDF = async (billing) => {
  // Wait for header image to load
  const headerImg = document.getElementById("dental-header");
  if (!headerImg || !headerImg.complete) {
    await new Promise((resolve) => {
      if (headerImg) {
        headerImg.onload = resolve;
      } else {
        resolve(true);
      }
    });
  }

  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "210mm";
  container.style.height = "297mm";
  document.body.appendChild(container);

  const headerSrc = headerImg?.src || "";
  const formattedDate = formatDate(billing.date);

  // Parse treatments and their individual costs
  const treatments = billing.treatment_name
    .split(",")
    .map((treatment, index) => ({
      name: treatment.trim(),
      cost: (billing.cost / billing.treatment_name.split(",").length).toFixed(
        2
      ),
      date: formattedDate,
    }));

  container.innerHTML = `
     <!-- Header -->
<div class="w-full h-[60mm]">
  <img 
    src="${header}" 
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
              <p style="margin-bottom: 0.5rem; color: #000000;"><span style="font-weight: 600;">Name:</span> ${billing.patient_name}</p>
            </div>

            <!-- Invoice Details - Right Side -->
            <div style="text-align: right;">
              <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; color: #000000;">INVOICE</h2>
              <p style="margin-bottom: 0.5rem; color: #000000;"><span style="font-weight: 600;">Invoice No:</span> #${billing.invoice_no}</p>
              <p style="margin-bottom: 0.5rem; color: #000000;"><span style="font-weight: 600;">GS No:</span> #${billing.gst_no}</p>
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
                  <td style="padding: 0.75rem 1rem; text-align: right; border-bottom: 1px solid #e5e7eb;">$${treatment.cost}</td>
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

      <!-- Footer -->
  
    </div>
  `;

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: 795, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Add image to PDF
    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);

    // Generate filename
    const filename = `invoice-${billing.invoice_no}.pdf`;
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};
