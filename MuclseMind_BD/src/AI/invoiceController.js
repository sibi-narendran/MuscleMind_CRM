const { generateInvoiceDescription } = require('../AI/invoiceGenerator');

const generateInvoiceDescriptionController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId; // Get userId from JWT token

        const description = await generateInvoiceDescription(id, userId);
        
        res.json({
            success: true,
            message: 'Description generated successfully',
            data: { description }
        });
    } catch (error) {
        console.error('Error in generateInvoiceDescriptionController:', error);
        res.status(error.message.includes('Unauthorized') ? 403 : 500).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};

module.exports = {
    generateInvoiceDescriptionController
};