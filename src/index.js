/**
 * Generador de PDF KUDE - SIFEN Paraguay
 * Módulo principal
 */

const fs = require('fs');
const path = require('path');
const { parseXmlFile, parseXmlString, extractDE, extractQrUrl } = require('./xmlParser');
const { extractAllData } = require('./dataExtractor');
const { generateQrBase64 } = require('./qrGenerator');
const { generatePdfBuffer, generatePdfFile } = require('./pdfGenerator');

/**
 * Carga una imagen y retorna como base64 data URL
 */
function loadImageAsBase64(imagePath) {
  try {
    if (!imagePath || !fs.existsSync(imagePath)) return null;
    const imageBuffer = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath).toLowerCase().slice(1);
    const mimeType = ext === 'jpg' ? 'jpeg' : ext;
    return `data:image/${mimeType};base64,${imageBuffer.toString('base64')}`;
  } catch (error) {
    return null;
  }
}

/**
 * Genera un PDF KUDE a partir de un XML SIFEN
 * 
 * @param {object} options - Opciones de configuración
 * @param {string} [options.xmlPath] - Ruta al archivo XML
 * @param {string} [options.xmlContent] - Contenido XML como string
 * @param {string} [options.outputPath] - Ruta para guardar el PDF
 * @param {string} [options.logoPath] - Ruta a la imagen del logo
 * @param {boolean} [options.returnBuffer] - Si es true, retorna Buffer
 * @param {object} [options.config] - Configuración para sobrescribir datos del XML
 * @param {object} [options.config.emisor] - Datos del emisor (nombre, direccion, ciudad, pais, telefono, email, ruc)
 * @returns {Promise<Buffer|void>}
 */
async function generateKudePdf(options) {
  const { xmlPath, xmlContent, outputPath, logoPath, returnBuffer = false, config = {} } = options;
  
  if (!xmlPath && !xmlContent) {
    throw new Error('Debe proporcionar xmlPath o xmlContent');
  }
  
  if (!returnBuffer && !outputPath) {
    throw new Error('Debe proporcionar outputPath cuando returnBuffer es false');
  }
  
  // Parsear XML
  const parsedXml = xmlPath ? await parseXmlFile(xmlPath) : parseXmlString(xmlContent);
  
  // Extraer datos
  const de = extractDE(parsedXml);
  const qrUrl = extractQrUrl(parsedXml);
  const data = extractAllData(de, qrUrl);
  
  // Aplicar configuración personalizada (sobrescribe datos del XML)
  if (config.emisor) {
    data.emisor = { ...data.emisor, ...config.emisor };
  }
  
  // Generar QR Code
  let qrImage = null;
  if (qrUrl) {
    try {
      qrImage = await generateQrBase64(qrUrl);
    } catch (e) {}
  }
  
  // Cargar logo
  const logoImage = loadImageAsBase64(logoPath);
  const images = { qrImage, logoImage };
  
  // Generar PDF
  if (returnBuffer) {
    return await generatePdfBuffer(data, images);
  } else {
    await generatePdfFile(data, images, outputPath);
  }
}

/**
 * Parsea un XML SIFEN y retorna los datos extraídos
 */
async function parseKudeXml(options) {
  const { xmlPath, xmlContent } = options;
  
  if (!xmlPath && !xmlContent) {
    throw new Error('Debe proporcionar xmlPath o xmlContent');
  }
  
  const parsedXml = xmlPath ? await parseXmlFile(xmlPath) : parseXmlString(xmlContent);
  const de = extractDE(parsedXml);
  const qrUrl = extractQrUrl(parsedXml);
  
  return extractAllData(de, qrUrl);
}

module.exports = {
  generateKudePdf,
  parseKudeXml,
  loadImageAsBase64
};
