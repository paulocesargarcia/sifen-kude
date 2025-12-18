# Generador PDF KUDE - SIFEN Paraguay

Módulo Node.js para generar PDF KUDE a partir de XML de facturas electrónicas SIFEN.

## Instalación

```bash
npm install
```

## Uso

```javascript
const { generateKudePdf } = require('./src');

// Generar PDF desde archivo XML
await generateKudePdf({
  xmlPath: './factura.xml',
  outputPath: './factura.pdf',
  logoPath: './assets/logo.png' // opcional
});

// Retornar Buffer (para APIs)
const buffer = await generateKudePdf({
  xmlPath: './factura.xml',
  returnBuffer: true
});

// Sobrescribir datos del emisor
await generateKudePdf({
  xmlPath: './factura.xml',
  outputPath: './factura.pdf',
  logoPath: './assets/logo.png',
  config: {
    emisor: {
      nombre: 'Nombre Personalizado',
      direccion: 'Dirección Personalizada',
      ciudad: 'Ciudad',
      pais: 'Paraguay',
      telefono: '+595 21 123456',
      email: 'contacto@empresa.com'
    }
  }
});
```

## Opciones

| Opción | Tipo | Descripción |
|--------|------|-------------|
| `xmlPath` | string | Ruta al archivo XML |
| `xmlContent` | string | Contenido XML como string |
| `outputPath` | string | Ruta para guardar el PDF |
| `logoPath` | string | Ruta a imagen del logo (JPG/PNG) |
| `returnBuffer` | boolean | Si es true, retorna Buffer |
| `config` | object | Configuración para sobrescribir datos del XML |

## Configuración del Emisor

Los campos del emisor pueden ser personalizados usando `config.emisor`:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `nombre` | string | Nombre o razón social del emisor |
| `direccion` | string | Dirección del emisor |
| `ciudad` | string | Ciudad del emisor |
| `pais` | string | País del emisor (default: Paraguay) |
| `telefono` | string | Teléfono de contacto |
| `email` | string | Correo electrónico |
| `ruc` | string | RUC del emisor |

Los campos en `config.emisor` sobrescriben los valores extraídos del XML. Los campos no especificados mantienen el valor original del XML.

## Ejemplo

```bash
node ejemplo/generar-pdf.js
```

## Licencia

ISC
