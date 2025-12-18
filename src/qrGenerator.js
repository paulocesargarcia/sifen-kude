/**
 * Generador de QR Code
 */

const QRCode = require('qrcode');

/**
 * Genera QR Code como base64
 */
async function generateQrBase64(url, options = {}) {
  if (!url) throw new Error('URL es requerida para generar el QR Code');
  
  const qrOptions = {
    type: 'png',
    width: options.width || 150,
    margin: options.margin || 1,
    errorCorrectionLevel: 'M',
    color: { dark: '#000000', light: '#ffffff' }
  };
  
  return await QRCode.toDataURL(url, qrOptions);
}

module.exports = { generateQrBase64 };
