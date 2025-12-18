/**
 * Extractor de datos del XML SIFEN
 */

/** Formatea CDC con espacios cada 4 dígitos */
function formatCDC(cdc) {
  if (!cdc) return '';
  const cdcStr = String(cdc).replace(/\s/g, '');
  return cdcStr.match(/.{1,4}/g)?.join(' ') || cdcStr;
}

/** Formatea número con separador de miles */
function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined) return '0';
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  return num.toLocaleString('es-PY', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/** Formatea fecha y hora */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const pad = n => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** Formatea solo fecha */
function formatDateOnly(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const pad = n => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** Rellena con ceros a la izquierda */
function padZeros(value, length) {
  if (!value) return '0'.repeat(length);
  return String(value).padStart(length, '0');
}

/** Normaliza nombres de localidad (ciudad, distrito, etc.)
 * 1. Remueve texto entre paréntesis ej: "ASUNCION (DISTRITO)" -> "ASUNCION"
 * 2. Convierte a formato título ej: "ASUNCION" -> "Asunción"
 */
function normalizarLocalidad(valor) {
  if (!valor) return '';
  
  // Remover texto entre paréntesis y espacios extras
  let normalizado = valor.replace(/\s*\([^)]*\)\s*/g, '').trim();
  
  // Convertir a título (primera letra mayúscula, resto minúscula)
  normalizado = normalizado
    .toLowerCase()
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');
  
  return normalizado;
}

/** Extrae datos del emisor */
function extractEmisor(de) {
  const g = de.gDatGralOpe?.gEmis || {};
  
  // Extraer actividades económicas
  const actEco = g.gActEco || [];
  const actividadesArr = Array.isArray(actEco) ? actEco : [actEco];
  const actividades = actividadesArr
    .filter(a => a.cActEco && a.dDesActEco)
    .map(a => `${a.cActEco} - ${a.dDesActEco}`)
    .join('\n');
  
  return {
    ruc: `${g.dRucEm || ''}-${g.dDVEmi || ''}`,
    nombre: g.dNomEmi || '',
    direccion: g.dDirEmi || '',
    departamento: normalizarLocalidad(g.dDesDepEmi),
    ciudad: normalizarLocalidad(g.dDesCiuEmi),
    telefono: g.dTelEmi || '',
    email: g.dEmailE || '',
    actividades: normalizarLocalidad(actividades)
  };
}

/** Extrae datos del receptor */
function extractReceptor(de) {
  const g = de.gDatGralOpe?.gDatRec || {};
  return {
    ruc: g.dRucRec ? `${g.dRucRec}-${g.dDVRec || '0'}` : '',
    razonSocial: g.dNomRec || '',
    direccion: g.dDirRec || '',
    telefono: g.dTelRec || '',
    ciudad: normalizarLocalidad(g.dDesCiuRec),
    pais: g.dDesPaisRe || '',
    distrito: normalizarLocalidad(g.dDesDisRec),
    email: g.dEmailRec || ''
  };
}

/** Extrae datos del timbrado */
function extractTimbrado(de) {
  const g = de.gTimb || {};
  const est = padZeros(g.dEst, 3);
  const punExp = padZeros(g.dPunExp, 3);
  const numDoc = padZeros(g.dNumDoc, 7);
  
  return {
    tipo: g.dDesTiDE || '',
    numeroTimbrado: g.dNumTim || '',
    fechaInicioVigencia: formatDateOnly(g.dFeIniT),
    numeroFormateado: `${est}-${punExp}-${numDoc}`
  };
}

/** Extrae datos de la operación */
function extractOperacion(de) {
  const gDat = de.gDatGralOpe || {};
  const gOpe = gDat.gOpeCom || {};
  const gCond = de.gDtipDE?.gCamCond || {};
  
  return {
    fechaEmision: formatDate(gDat.dFeEmiDE),
    tipoTransaccion: gOpe.dDesTipTra || '',
    moneda: gOpe.cMoneOpe || 'PYG',
    condicionOperacion: gCond.dDCondOpe || ''
  };
}

/** Extrae ítems de la factura */
function extractItems(de) {
  const items = de.gDtipDE?.gCamItem || [];
  const arr = Array.isArray(items) ? items : [items];
  
  return arr.map(item => {
    const gVal = item.gValorItem || {};
    const gRest = gVal.gValorRestaItem || {};
    const gIVA = item.gCamIVA || {};
    const tasa = parseInt(gIVA.dTasaIVA) || 0;
    const total = parseFloat(gRest.dTotOpeItem) || 0;
    
    return {
      descripcion: item.dDesProSer || '',
      precioUnitario: formatNumber(gVal.dPUniProSer),
      cantidad: item.dCantProSer || '1',
      iva5: tasa === 5 ? formatNumber(total) : '0',
      iva10: tasa === 10 ? formatNumber(total) : '0'
    };
  });
}

/** Extrae totales */
function extractTotales(de) {
  const g = de.gTotSub || {};
  return {
    subtotal5: formatNumber(g.dSub5),
    subtotal10: formatNumber(g.dSub10),
    totalGeneral: formatNumber(g.dTotGralOpe),
    iva5: formatNumber(g.dIVA5),
    iva10: formatNumber(g.dIVA10),
    totalIVA: formatNumber(g.dTotIVA)
  };
}

/** Extrae CDC */
function extractCDC(de) {
  return formatCDC(de['@_Id'] || '');
}

/** Extrae todos los datos necesarios para el PDF */
function extractAllData(de, qrUrl) {
  const isTest = qrUrl && qrUrl.includes('consultas-test');
  
  return {
    emisor: extractEmisor(de),
    receptor: extractReceptor(de),
    timbrado: extractTimbrado(de),
    operacion: extractOperacion(de),
    items: extractItems(de),
    totales: extractTotales(de),
    cdc: extractCDC(de),
    qrUrl: qrUrl,
    isAmbientePrueba: isTest,
    mensajeAmbiente: isTest ? 'Factura generada en Ambiente NO CONECTADO a la SET' : null
  };
}

module.exports = { extractAllData, formatNumber, formatDate, formatCDC };
