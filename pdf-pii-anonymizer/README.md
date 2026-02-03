# PDF PII Anonymizer

A standalone Python tool to detect and anonymize Personally Identifiable Information (PII) in scanned PDF documents using OCR.

## Features

- **OCR Text Extraction**: Extracts text from scanned PDFs using Tesseract OCR
- **27 US PII Types**: Detects all 27 types of US PII as per privacy standards (NIST, HIPAA, CCPA)
- **Realistic Fake Data**: Replaces detected PII with contextually appropriate fake data using Faker
- **PDF Output**: Generates anonymized PDF documents
- **Detailed Reports**: Optional anonymization reports showing what was detected and replaced

## Supported PII Types

| Category | PII Types |
|----------|-----------|
| Government ID | SSN, Driver's License, Passport, State ID, ITIN |
| Financial | Bank Account, Credit Card, Debit Card, Financial Account |
| Personal | Full Name, Date of Birth, Place of Birth, Mother's Maiden Name |
| Contact | Email, Phone Number, Physical Address |
| Medical | Medical Record Number, Health Insurance ID |
| Digital | IP Address, Credentials, Digital Signature |
| Vehicle | Vehicle Registration (VIN), License Plate |
| Employment | Employee ID |
| Education | Student ID |
| Military | Military ID |

## Installation

### Prerequisites

- Python 3.9+
- Tesseract OCR installed on your system
- Poppler (for PDF to image conversion)

#### Install System Dependencies

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr poppler-utils
```

**macOS:**
```bash
brew install tesseract poppler
```

**Windows:**
- Download Tesseract from: https://github.com/UB-Mannheim/tesseract/wiki
- Download Poppler from: https://github.com/osber/poppler-windows/releases

### Install Python Package

```bash
cd pdf-pii-anonymizer
pip install -e .

# Download spaCy model
python -m spacy download en_core_web_lg
```

Or install with development dependencies:

```bash
pip install -e ".[dev]"
```

## Usage

### Command Line Interface

#### Anonymize a PDF

```bash
pdf-pii-anonymizer anonymize input.pdf -o output_anonymized.pdf
```

With options:
```bash
pdf-pii-anonymizer anonymize input.pdf \
    -o output.pdf \
    --report report.pdf \
    --dpi 300 \
    --threshold 0.5 \
    --seed 42 \
    --verbose
```

#### Scan for PII (without anonymizing)

```bash
pdf-pii-anonymizer scan input.pdf
```

Show actual PII values found:
```bash
pdf-pii-anonymizer scan input.pdf --show-values
```

#### Extract text only

```bash
pdf-pii-anonymizer extract input.pdf -o extracted_text.txt
```

#### List supported PII types

```bash
pdf-pii-anonymizer list-pii
```

### Python API

```python
from pdf_pii_anonymizer import (
    PDFOCRExtractor,
    PIIDetector,
    PIIAnonymizer,
    AnonymizedPDFGenerator,
)

# Extract text from PDF
ocr = PDFOCRExtractor(dpi=300)
ocr_result = ocr.extract_from_file("input.pdf")

# Detect PII
detector = PIIDetector(score_threshold=0.5)
detection_result = detector.detect(ocr_result.full_text)

print(f"Found {detection_result.total_pii_count} PII instances")
print(f"Types: {detection_result.pii_types_found}")

# Anonymize
anonymizer = PIIAnonymizer(seed=42)  # seed for reproducibility
anon_result = anonymizer.anonymize(detection_result)

# Generate anonymized PDF
pdf_gen = AnonymizedPDFGenerator()
pdf_gen.generate_from_text(
    anon_result.anonymized_text,
    "output_anonymized.pdf",
    title="Anonymized Document"
)
```

## Configuration

### OCR Settings

| Parameter | Default | Description |
|-----------|---------|-------------|
| `dpi` | 300 | Resolution for PDF to image conversion |
| `lang` | "eng" | Tesseract language code |
| `psm` | 3 | Page segmentation mode |

### Detection Settings

| Parameter | Default | Description |
|-----------|---------|-------------|
| `score_threshold` | 0.5 | Minimum confidence for PII detection |
| `language` | "en" | NLP processing language |

### Anonymization Settings

| Parameter | Default | Description |
|-----------|---------|-------------|
| `locale` | "en_US" | Faker locale for fake data |
| `seed` | None | Random seed for reproducibility |

## Testing

Run tests with pytest:

```bash
cd pdf-pii-anonymizer
pytest
```

With coverage:
```bash
pytest --cov=src --cov-report=term-missing
```

## Project Structure

```
pdf-pii-anonymizer/
├── src/
│   └── pdf_pii_anonymizer/
│       ├── __init__.py
│       ├── cli.py              # Command-line interface
│       ├── ocr.py              # OCR text extraction
│       ├── detector.py         # PII detection
│       ├── anonymizer.py       # PII anonymization
│       ├── pdf_generator.py    # PDF output generation
│       ├── pii_types.py        # PII type definitions
│       └── custom_recognizers.py # Custom Presidio recognizers
├── tests/
│   ├── test_pii_types.py
│   ├── test_detector.py
│   ├── test_anonymizer.py
│   ├── test_ocr.py
│   ├── test_pdf_generator.py
│   └── test_custom_recognizers.py
├── pyproject.toml
├── requirements.txt
└── README.md
```

## Dependencies

- **pytesseract**: Python wrapper for Tesseract OCR
- **pdf2image**: PDF to image conversion
- **presidio-analyzer**: Microsoft's PII detection engine
- **presidio-anonymizer**: Microsoft's PII anonymization engine
- **spacy**: NLP processing for entity recognition
- **Faker**: Realistic fake data generation
- **reportlab**: PDF generation
- **click**: CLI framework
- **rich**: Terminal formatting

## License

MIT License
