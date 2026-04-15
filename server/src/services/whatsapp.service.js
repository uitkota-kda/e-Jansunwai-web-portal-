/**
 * WhatsApp Service for Node.js
 * This is a placeholder for actual WhatsApp integration (e.g., Twilio, Meta API, or a custom bridge).
 */

const axios = require('axios');

/**
 * Sends a WhatsApp message to a user.
 * @param {string} mobile - The mobile number with country code (e.g., 919876543210).
 * @param {string} message - The message content.
 */
exports.sendWhatsAppMessage = async (mobile, message) => {
    try {
        console.log(`[WhatsApp Service] Sending message to ${mobile}: ${message}`);
        
        // Example: If using a simple HTTP-based WhatsApp gateway
        // const response = await axios.post(process.env.WHATSAPP_API_URL, {
        //     apiKey: process.env.WHATSAPP_API_KEY,
        //     to: mobile,
        //     text: message
        // });
        
        // return response.data;

        // Return a mock success for now
        return { success: true, message: 'Message queued (Mock)' };
    } catch (error) {
        console.error('[WhatsApp Service] Error sending message:', error.message);
        throw error;
    }
};

/**
 * Notify user of grievance status update.
 * @param {string} mobile - User mobile number.
 * @param {string} grievanceId - Public ID of the grievance.
 * @param {string} status - New status.
 */
exports.notifyStatusUpdate = async (mobile, grievanceId, status) => {
    const message = `Hello, action has been taken on your grievance ${grievanceId}. New status: ${status}. You can check more details on the portal.`;
    return this.sendWhatsAppMessage(mobile, message);
};
