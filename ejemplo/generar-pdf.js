/**
 * Ejemplo de uso del módulo generador KUDE PDF
 * Ejecutar: node ejemplo/generar-pdf.js
 * version: v1.0.2  - 2026-02-06
 */

const { generateKudePdf } = require('../src');
const path = require('path');

async function main() {
  // Generar PDF a partir de archivo XML
  await generateKudePdf({
    xmlPath: path.join(__dirname, 'Factura-Electronica-209064.xml'),
    outputPath: path.join(__dirname, 'factura-generada.pdf'),
    logoPath: './assets/maxdominios-setik.png', // Opcional: agregar su logo aquí
    
    // Opcional: sobrescribir datos del emisor que vienen del XML
    // config: {
    //   emisor: {
    //     nombre: 'Nombre Personalizado',
    //     direccion: 'Dirección Personalizada',
    //     ciudad: 'Ciudad',
    //     pais: 'Paraguay',
    //     telefono: '+595 21 123456',
    //     email: 'contacto@empresa.com'
    //   }
    // }
  });
  
  console.log('PDF generado exitosamente!');
}

main().catch(console.error);
