const twilio = require('twilio');
const logger = require('../config/logger');
const config = require('../config/index');

const validateTwilioRequest = (req, res, next) => {
  try {
    const twilioSignature = req.get('X-Twilio-Signature') || '';
    const url = `${config.TWILIO_WEBHOOK_URL}/api/v1/whatsapp/webhook`;
    const params = req.body;

    const isValid = twilio.validateRequest(
      config.TWILIO_AUTH_TOKEN,
      twilioSignature,
      url,
      params,
    );

    if (!isValid) {
      logger.warn('Invalid Twilio signature', {
        url,
        signature: twilioSignature.substring(0, 10) + '...',
      });
      return res.status(403).json({ error: 'Unauthorized' });
    }

    logger.debug('Twilio signature validated');
    next();
  } catch (error) {
    logger.error('Error validating Twilio signature', { error: error.message });
    res.status(403).json({ error: 'Unauthorized' });
  }
};

module.exports = {
  validateTwilioRequest,
};
