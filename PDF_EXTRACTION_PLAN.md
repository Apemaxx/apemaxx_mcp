# PDF/Picture Upload & Data Extraction System

## Overview
Professional system for uploading PDF warehouse receipts and pictures, extracting data automatically, and storing in the correct database tables (address book, warehouse receipts, and associated tables).

## Extraction Strategy

### 1. File Upload Component
- **Multi-format Support**: PDF, PNG, JPG, JPEG
- **Drag & Drop Interface**: Professional file dropzone 
- **Preview System**: Thumbnail previews before processing
- **Progress Tracking**: Real-time upload and processing status

### 2. PDF Data Extraction Methods

#### Method A: OCR + AI Pattern Recognition (Recommended)
```javascript
// Use Tesseract.js for OCR + GPT for structured extraction
async function extractFromPDF(file) {
  // 1. Convert PDF to images
  const images = await pdfToImages(file);
  
  // 2. OCR each page
  const ocrText = await performOCR(images);
  
  // 3. AI-powered structured extraction
  const extractedData = await extractStructuredData(ocrText);
  
  return extractedData;
}
```

#### Method B: PDF Text Extraction + Pattern Matching
```javascript
// For text-based PDFs with standard formats
async function extractFromTextPDF(file) {
  const textContent = await extractPDFText(file);
  const patterns = getWarehouseReceiptPatterns();
  return matchAndExtract(textContent, patterns);
}
```

### 3. Data Extraction Targets

#### A. Address Book Data
- **Shipper Information**:
  - Company name, contact person
  - Address (street, city, state, zip, country)
  - Phone, email, website
  - Tax ID, account number

- **Consignee Information**:
  - Company name, contact person  
  - Address (street, city, state, zip, country)
  - Phone, email
  - Delivery instructions

#### B. Warehouse Receipt Data
- **WR Number** (Primary identifier)
- **Tracking Numbers** (AWB, BOL, etc.)
- **Receipt Date & Time**
- **Warehouse Location**
- **Status** (received_on_hand → released_by_air/ocean → shipped)

#### C. Shipment Details
- **Pieces**: Count, descriptions, SKUs
- **Weight**: Gross, net, units (lbs/kg)
- **Dimensions**: L×W×H for each piece
- **Volume**: Cubic feet AND cubic meters calculation
- **Special Handling**: Fragile, hazardous, temperature-controlled

### 4. Database Integration Schema

#### Address Book Tables
```sql
-- shippers table
INSERT INTO shippers (name, address, city, state, zip, country, phone, email)

-- consignees table  
INSERT INTO consignees (name, address, city, state, zip, country, phone, email)

-- address_book (unified)
INSERT INTO address_book (type, company_name, contact_person, full_address, phone, email)
```

#### Warehouse Receipts Table
```sql
INSERT INTO warehouse_receipts (
  wr_number,           -- PRIMARY identifier
  tracking_number,     -- Secondary reference
  shipper_id,          -- FK to address_book
  consignee_id,        -- FK to address_book
  warehouse_location_id,
  status,              -- received_on_hand|released_by_air|released_by_ocean|shipped
  received_date,
  total_pieces,
  total_weight_lbs,
  total_volume_ft3,    -- Cubic feet
  total_volume_m3,     -- Cubic meters (converted)
  extracted_from_pdf,  -- TRUE for auto-extracted
  user_id
);
```

#### Associated Tables
```sql
-- shipment_pieces (detailed breakdown)
INSERT INTO shipment_pieces (
  warehouse_receipt_id,
  piece_number,
  description,
  weight_lbs,
  length_in, width_in, height_in,
  volume_ft3,
  sku_number
);

-- extraction_log (audit trail)
INSERT INTO extraction_log (
  file_name,
  extraction_method,
  confidence_score,
  extracted_fields,
  manual_corrections,
  processed_by_user_id,
  processed_at
);
```

### 5. AI-Powered Field Recognition

#### Patterns for Common Fields
```javascript
const extractionPatterns = {
  wrNumber: /(?:WR|W\.R\.|Warehouse\s+Receipt)\s*#?\s*:?\s*([A-Z0-9\-]+)/i,
  trackingNumber: /(?:AWB|Tracking|Reference)\s*#?\s*:?\s*([A-Z0-9\-]+)/i,
  shipperName: /(?:Shipper|From)\s*:?\s*(.+?)(?:\n|Address)/i,
  consigneeName: /(?:Consignee|To)\s*:?\s*(.+?)(?:\n|Address)/i,
  pieces: /(?:Pieces|Pcs|Qty)\s*:?\s*(\d+)/i,
  weight: /(?:Weight|Wt)\s*:?\s*([\d,]+\.?\d*)\s*(lbs?|kg)/i,
  dimensions: /(\d+\.?\d*)\s*[x×]\s*(\d+\.?\d*)\s*[x×]\s*(\d+\.?\d*)/i
};
```

### 6. Volume Calculations
```javascript
function calculateVolumes(pieces) {
  let totalCubicFeet = 0;
  
  pieces.forEach(piece => {
    const volumeFt3 = (piece.length * piece.width * piece.height) / 1728; // in³ to ft³
    totalCubicFeet += volumeFt3;
  });
  
  const totalCubicMeters = totalCubicFeet * 0.0283168; // ft³ to m³
  
  return {
    cubic_feet: Math.round(totalCubicFeet * 100) / 100,
    cubic_meters: Math.round(totalCubicMeters * 100) / 100
  };
}
```

### 7. Status Color Coding
- **Blue**: `received_on_hand` - Items received and stored
- **Yellow**: `released_by_air` / `released_by_ocean` - Released for shipment
- **Green**: `shipped` - Successfully shipped/delivered

### 8. Implementation Steps

1. **Upload Component**: Create professional drag-drop interface
2. **OCR Integration**: Implement Tesseract.js or cloud OCR service
3. **AI Extraction**: Use GPT/Claude for structured data parsing
4. **Database Schema**: Update tables for extracted data
5. **Validation Interface**: Allow manual correction of extracted data
6. **Audit Trail**: Log all extractions with confidence scores
7. **Volume Calculator**: Automatic cubic feet ↔ cubic meter conversion

### 9. Quality Assurance
- **Confidence Scoring**: Rate extraction accuracy per field
- **Manual Review**: Flag low-confidence extractions for review
- **Learning System**: Improve patterns based on corrections
- **Duplicate Detection**: Prevent duplicate WR entries

### 10. Future Enhancements
- **Template Learning**: Auto-detect recurring PDF formats
- **Batch Processing**: Handle multiple files simultaneously
- **API Integration**: Connect with carrier tracking systems
- **Mobile Support**: Camera capture for warehouse receipts