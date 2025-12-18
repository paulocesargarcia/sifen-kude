# Generador PDF KUDE - SIFEN Paraguay

Módulo Node.js para generar representación gráfica PDF (KUDE) a partir de documentos electrónicos XML del Sistema Integrado de Facturación Electrónica Nacional (SIFEN) de Paraguay.

## Características

- Genera PDF KUDE desde archivos XML o contenido XML string
- Soporte para logo personalizado del emisor
- Extracción automática de datos del XML (emisor, receptor, items, totales)
- Configuración flexible para sobrescribir datos del XML
- Retorna Buffer para integración con APIs

## Instalación

```bash
npm install
```

## Uso Básico

```javascript
const { generateKudePdf } = require('sifen-kude');

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
```

## Uso con Configuración Personalizada

```javascript
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
      email: 'contacto@empresa.com',
      actividades: 'Actividades de la empresa'
    }
  }
});
```

## Opciones

| Opción | Tipo | Requerido | Descripción |
|--------|------|-----------|-------------|
| `xmlPath` | string | * | Ruta al archivo XML |
| `xmlContent` | string | * | Contenido XML como string |
| `outputPath` | string | ** | Ruta para guardar el PDF |
| `logoPath` | string | No | Ruta a imagen del logo (JPG/PNG) |
| `returnBuffer` | boolean | No | Si es true, retorna Buffer |
| `config` | object | No | Configuración para sobrescribir datos del XML |

\* Se requiere `xmlPath` o `xmlContent`  
\** Requerido cuando `returnBuffer` es false

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
| `actividades` | string | Actividades económicas (líneas separadas por \n) |

> Los campos en `config.emisor` sobrescriben los valores extraídos del XML. Los campos no especificados mantienen el valor original.

## Ejemplo

```bash
node ejemplo/generar-pdf.js
```

## Repositorio

https://github.com/paulocesargarcia/sifen-kude

## Licencia

ISC
