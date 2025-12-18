/**
 * Parser de XML SIFEN
 */

const { XMLParser } = require('fast-xml-parser');
const fs = require('fs');

const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: false,
  parseTagValue: false,
  trimValues: true,
  isArray: (name) => ['gCamItem', 'gActEco', 'gPaConEIni'].includes(name)
};

const parser = new XMLParser(parserOptions);

/** Parsea archivo XML */
async function parseXmlFile(filePath) {
  const xmlContent = fs.readFileSync(filePath, 'utf-8');
  return parseXmlString(xmlContent);
}

/** Parsea string XML */
function parseXmlString(xmlContent) {
  return parser.parse(xmlContent);
}

/** Extrae elemento DE del XML */
function extractDE(parsedXml) {
  if (parsedXml.rDE && parsedXml.rDE.DE) {
    return parsedXml.rDE.DE;
  }
  throw new Error('Estructura XML inválida: elemento DE no encontrado');
}

/** Extrae URL del QR Code */
function extractQrUrl(parsedXml) {
  if (parsedXml.rDE && parsedXml.rDE.gCamFuFD && parsedXml.rDE.gCamFuFD.dCarQR) {
    return parsedXml.rDE.gCamFuFD.dCarQR;
  }
  return null;
}

module.exports = {
  parseXmlFile,
  parseXmlString,
  extractDE,
  extractQrUrl
};
