from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
import io
from PIL import Image as PILImage
import requests
from typing import List, Dict

class BillGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        # Create custom styles
        self.styles.add(ParagraphStyle(
            name='RightAlign',
            parent=self.styles['Normal'],
            alignment=2  # right alignment
        ))
        self.styles.add(ParagraphStyle(
            name='Header',
            parent=self.styles['Heading1'],
            fontSize=18,
            spaceAfter=30
        ))

    def format_date(self, date_string: str) -> str:
        """Format date string to readable format"""
        date_obj = datetime.strptime(date_string, '%Y-%m-%d')
        return date_obj.strftime('%B %d, %Y')

    def get_header_image(self, url: str) -> Image:
        """Fetch and process header image"""
        try:
            response = requests.get(url)
            img = PILImage.open(io.BytesIO(response.content))
            img_width = 180 * mm  # 180mm width
            aspect = img.height / img.width
            img_height = img_width * aspect
            return Image(io.BytesIO(response.content), width=img_width, height=min(img_height, 60*mm))
        except Exception as e:
            print(f"Error processing header image: {e}")
            return None

    def create_treatments_table(self, treatments: List[Dict]) -> Table:
        """Create treatments table"""
        # Table headers
        data = [['S.No.', 'Treatment', 'Amount']]
        
        # Add treatments
        for idx, treatment in enumerate(treatments, 1):
            data.append([
                str(idx),
                treatment['name'],
                f"₹{treatment['cost']}"
            ])

        # Create table
        table = Table(data, colWidths=[30*mm, 100*mm, 50*mm])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ALIGN', (-1, 0), (-1, -1), 'RIGHT'),
        ]))
        return table

    def generate_billing_pdf(self, billing: Dict, user_profile: Dict) -> bool:
        """Generate PDF bill"""
        try:
            # Split patient info
            patient_id, *patient_name_parts = billing['patient_name'].split('-')
            patient_name = '-'.join(patient_name_parts)

            # Create PDF file
            filename = f"invoice-{billing['invoice_no']}.pdf"
            doc = SimpleDocTemplate(
                filename,
                pagesize=A4,
                rightMargin=20*mm,
                leftMargin=20*mm,
                topMargin=20*mm,
                bottomMargin=20*mm
            )

            # Prepare story (content)
            story = []

            # Add header image
            header_image = self.get_header_image(user_profile['header_image_url'])
            if header_image:
                story.append(header_image)
                story.append(Spacer(1, 10*mm))

            # Create two-column layout for patient and invoice info
            patient_info = [
                [Paragraph("<b>Patient Information</b>", self.styles['Heading2'])],
                [Paragraph(f"<b>Patient ID:</b> {patient_id}", self.styles['Normal'])],
                [Paragraph(f"<b>Name:</b> {patient_name}", self.styles['Normal'])]
            ]

            invoice_info = [
                [Paragraph("<b>INVOICE</b>", self.styles['Header'])],
                [Paragraph(f"<b>GST No:</b> {user_profile['gst_number']}", self.styles['RightAlign'])],
                [Paragraph(f"<b>Invoice No:</b> #{billing['invoice_no']}", self.styles['RightAlign'])],
                [Paragraph(f"<b>Date:</b> {self.format_date(billing['date'])}", self.styles['RightAlign'])]
            ]

            # Create info table
            info_table = Table([[Table(patient_info), Table(invoice_info)]], colWidths=[90*mm, 90*mm])
            story.append(info_table)
            story.append(Spacer(1, 10*mm))

            # Create treatments table
            treatments = [
                {
                    'name': treatment.strip(),
                    'cost': float(billing['cost']) / len(billing['treatment_name'].split(','))
                }
                for treatment in billing['treatment_name'].split(',')
            ]
            story.append(Paragraph("<b>Treatment Details</b>", self.styles['Heading2']))
            story.append(Spacer(1, 5*mm))
            story.append(self.create_treatments_table(treatments))
            story.append(Spacer(1, 10*mm))

            # Add total amount
            total_table = Table([
                [Paragraph("<b>Total Amount</b>", self.styles['Heading2'])],
                [Paragraph(f"₹{float(billing['cost']):.2f}", self.styles['Header'])]
            ], colWidths=[180*mm])
            total_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ]))
            story.append(total_table)

            # Build PDF
            doc.build(story)
            return True

        except Exception as e:
            print(f"Error generating PDF: {e}")
            return False

# Usage example:
if __name__ == "__main__":
    billing_data = {
        "patient_name": "P001-John Doe",
        "invoice_no": "INV001",
        "date": "2024-03-20",
        "treatment_name": "Root Canal, Cleaning",
        "cost": "1500.00"
    }

    user_profile = {
        "header_image_url": "https://ltxnbtvdxdtrobskpjsw.supabase.co/storage/v1/object/public/dental_crm/dental_CRM_cloud/headerImage_1735190822931.png ",
        "gst_number": "GST123456789"
    }

    bill_generator = BillGenerator()
    success = bill_generator.generate_billing_pdf(billing_data, user_profile)
    print(f"PDF generation {'successful' if success else 'failed'}")