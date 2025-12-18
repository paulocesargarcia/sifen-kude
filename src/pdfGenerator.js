/**
 * Generador de PDF KUDE
 */

const PdfPrinter = require('pdfmake');
const fs = require('fs');

const printer = new PdfPrinter({
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
});

const styles = {
  tableHeader: { fontSize: 8, bold: true, fillColor: '#eeeeee', alignment: 'center' },
  tableCell: { fontSize: 8, lineHeight: 2 },
  tableCellRight: { fontSize: 8, alignment: 'right', lineHeight: 2 },
  tableCellCenter: { fontSize: 8, alignment: 'center', lineHeight: 2 }
};

/** Crea encabezado con logo, emisor y timbrado */
function createHeader(data, logoImage) {
  const { emisor, timbrado } = data;
  
  // Columna 1: Logo
  const logoColumn = {
    margin: [10, 10, 10, 10],
    stack: logoImage 
      ? [{ image: logoImage, width: 100, alignment: 'center' }] 
      : [{ text: '', fontSize: 9 }]
  };
  
  // Columna 2: Datos del emisor (nombre, dirección, teléfono)
  const emisorStack = [];
  if (emisor.nombre) emisorStack.push({ text: emisor.nombre, fontSize: 12, bold: true, margin: [0, 0, 0, 5] });
  if (emisor.direccion) emisorStack.push({ text: emisor.direccion, fontSize: 9, margin: [0, 0, 0, 2] });
  if (emisor.ciudad) emisorStack.push({ text: `${emisor.ciudad} - ${emisor.pais || 'Paraguay'}`, fontSize: 9, margin: [0, 0, 0, 2] });
  if (emisor.telefono) emisorStack.push({ text: `Tel: ${emisor.telefono}`, fontSize: 9 });
  if (emisor.email) emisorStack.push({ text: `Email: ${emisor.email}`, fontSize: 9 });
  if (emisor.actividades) emisorStack.push({ text: emisor.actividades, fontSize: 5, margin: [0, 3, 0, 0], lineHeight: 1.5 });
  
  const emisorColumn = {
    margin: [10, 10, 10, 10],
    lineHeight: 1.2,
    stack: emisorStack
  };
  
  // Columna 3: Datos del timbrado
  const timbradoColumn = {
    margin: [10, 10, 10, 10],
    stack: [
      { text: [{ text: 'RUC: ', bold: true }, emisor.ruc], fontSize: 9, margin: [0, 0, 0, 5] },
      { text: [{ text: 'Timbrado Nº: ', bold: true }, timbrado.numeroTimbrado], fontSize: 9, margin: [0, 0, 0, 5] },
      { text: [{ text: 'Fecha de Vigencia: ', bold: true }, timbrado.fechaInicioVigencia], fontSize: 9, margin: [0, 0, 0, 8] },
      { text: timbrado.tipo.toUpperCase(), fontSize: 10, bold: true, margin: [0, 0, 0, 5] },
      { text: `Nº: ${timbrado.numeroFormateado}`, fontSize: 10, bold: true }
    ]
  };
  
  return {
    table: {
      widths: ['22%', '47%', '31%'],
      body: [[logoColumn, emisorColumn, timbradoColumn]]
    },
    layout: {
      hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 1 : 0,
      vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length) ? 1 : 0,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000'
    },
    margin: [0, 0, 0, 5]
  };
}

/** Crea sección de operación y receptor */
function createOperacionReceptorInfo(data) {
  const { operacion, receptor } = data;

  // console.log(receptor);
  
  return {
    table: {
      widths: ['50%', '50%'],
      body: [[
        {
          margin: [10, 10, 10, 10],
          stack: [
            { text: [{ text: 'Fecha y hora de emisión: ', bold: true }, operacion.fechaEmision], fontSize: 9, margin: [0, 0, 0, 6] },
            { text: [{ text: 'Condición Venta: ', bold: true }, operacion.condicionOperacion], fontSize: 9, margin: [0, 0, 0, 6] },
            { text: [{ text: 'Moneda: ', bold: true }, operacion.moneda], fontSize: 9, margin: [0, 0, 0, 6] },
            { text: [{ text: 'Tipo de Operación: ', bold: true }, operacion.tipoTransaccion], fontSize: 9 }
          ]
        },
        {
          margin: [10, 10, 10, 10],
          stack: [
            ...(receptor.ruc ? [{ text: [{ text: 'RUC: ', bold: true }, receptor.ruc], fontSize: 9, margin: [0, 0, 0, 6] }] : []),
            ...(receptor.razonSocial ? [{ text: [{ text: 'Razón Social: ', bold: true }, receptor.razonSocial], fontSize: 9, margin: [0, 0, 0, 6] }] : []),
            ...(receptor.telefono ? [{ text: [{ text: 'Teléfono: ', bold: true }, receptor.telefono], fontSize: 9, margin: [0, 0, 0, 6] }] : []),
            ...((receptor.direccion || receptor.ciudad || receptor.pais) ? [{ 
              text: [
                { text: 'Dirección: ', bold: true ,lineHeight: 1.5}, 
                [receptor.direccion, receptor.ciudad, receptor.pais].filter(Boolean).join(', ')
              ], 
              fontSize: 9 
            }] : [])
          ] 
        }
      ]]
    },
    layout: {
      hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 1 : 0,
      vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length) ? 1 : 0,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000'
    },
    margin: [0, 0, 0, 10]
  };
}

/** Crea tabla de ítems */
function createItemsTable(data) {
  const { items, totales } = data;
  
  const header = [
    { text: 'Descripción', style: 'tableHeader' },
    { text: 'Precio Unitario', style: 'tableHeader' },
    { text: 'Cantidad', style: 'tableHeader' },
    { text: '5%', style: 'tableHeader' },
    { text: '10%', style: 'tableHeader' }
  ];
  
  const rows = items.map(item => [
    { text: item.descripcion, style: 'tableCell' },
    { text: item.precioUnitario, style: 'tableCellRight' },
    { text: item.cantidad.toString(), style: 'tableCellCenter' },
    { text: item.iva5, style: 'tableCellRight' },
    { text: item.iva10, style: 'tableCellRight' }
  ]);
  
  const subtotalRow = [
    { text: 'SUBTOTAL', style: 'tableHeader', colSpan: 3, alignment: 'right' }, {}, {},
    { text: totales.subtotal5, style: 'tableCellRight', bold: true },
    { text: totales.subtotal10, style: 'tableCellRight', bold: true }
  ];
  
  const totalRow = [
    { text: 'TOTAL DE LA OPERACIÓN', style: 'tableHeader', colSpan: 3, alignment: 'right' }, {}, {},
    { text: '', style: 'tableCellRight' },
    { text: totales.totalGeneral, style: 'tableCellRight', bold: true }
  ];
  
  const ivaRow = [
    { text: 'LIQUIDACIÓN IVA', style: 'tableHeader', alignment: 'right' },
    { text: `(5%) ${totales.iva5}`, style: 'tableCellRight', noWrap: true },
    { text: `(10%) ${totales.iva10}`, style: 'tableCellRight' },
    { text: 'Total IVA :', style: 'tableCellRight', bold: true, noWrap: true },
    { text: totales.totalIVA, style: 'tableCellRight', noWrap: true }
  ];
  
  return {
    table: {
      headerRows: 1,
      widths: ['49.5%', '15%', '10%', '10.5%', '15%'],
      body: [header, ...rows, subtotalRow, totalRow, ivaRow]
    },
    layout: {
      hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 1 : 0.5,
      vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length) ? 1 : 0.5,
      hLineColor: (i, node) => (i === 0 || i === node.table.body.length) ? '#000000' : '#999999',
      vLineColor: (i, node) => (i === 0 || i === node.table.widths.length) ? '#000000' : '#999999',
      paddingLeft: () => 4,
      paddingRight: () => 4,
      paddingTop: () => 5,
      paddingBottom: () => 5,
      lineHeight: 1.5
    },
    margin: [0, 0, 0, 15]
  };
}

/** Crea pie de página con QR y CDC */
function createFooter(data, qrImage) {
  const { cdc } = data;
  
  return [{
    table: {
      widths: [115, '*'],
      body: [[
        {
          border: [true, true, false, true],
          margin: [10, 10, 5, 10],
          stack: qrImage ? [{ image: qrImage, width: 95, height: 95, alignment: 'center' }] : []
        },
        {
          border: [false, true, true, true],
          margin: [5, 10, 10, 10],
          stack: [
            { text: 'Consulte la validez de esta Factura Electrónica con el número de CDC impreso abajo en:', fontSize: 9, margin: [0, 0, 0, 2] },
            { text: 'https://ekuatia.set.gov.py/consultas', fontSize: 9, color: '#0000cc', margin: [0, 0, 0, 8] },
            { text: `CDC: ${cdc}`, fontSize: 10, bold: true, margin: [0, 0, 0, 8] },
            { text: 'ESTE DOCUMENTO ES UNA REPRESENTACIÓN GRÁFICA DE UN DOCUMENTO ELECTRÓNICO (XML)', fontSize: 8, bold: true, margin: [0, 0, 0, 5] },
            { text: 'Si su documento electrónico presenta algún error puede solicitar la modificación dentro de las 72 horas siguientes de la emisión de este comprobante.', fontSize: 7 }
          ]
        }
      ]]
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000'
    }
  }];
}

/** Genera definición del documento PDF */
function createDocDefinition(data, qrImage, logoImage) {
  const content = [];
  
  if (data.mensajeAmbiente) {
    content.push({ text: data.mensajeAmbiente, fontSize: 9, bold: true, color: '#cc0000', alignment: 'center', margin: [0, 5, 0, 10] });
  }
  
  content.push(createHeader(data, logoImage));
  content.push(createOperacionReceptorInfo(data));
  content.push(createItemsTable(data));
  content.push(...createFooter(data, qrImage));
  
  return {
    content,
    styles,
    defaultStyle: { font: 'Helvetica', fontSize: 9 },
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40]
  };
}

/** Genera PDF y retorna como buffer */
function generatePdfBuffer(data, images = {}) {
  const { qrImage = null, logoImage = null } = images;
  
  return new Promise((resolve, reject) => {
    try {
      const docDefinition = createDocDefinition(data, qrImage, logoImage);
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks = [];
      pdfDoc.on('data', chunk => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/** Genera PDF y guarda en archivo */
async function generatePdfFile(data, images, outputPath) {
  const buffer = await generatePdfBuffer(data, images);
  fs.writeFileSync(outputPath, buffer);
}

module.exports = { generatePdfBuffer, generatePdfFile };
