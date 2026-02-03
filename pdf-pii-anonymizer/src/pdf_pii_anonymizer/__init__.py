"""
PDF PII Anonymizer - A tool to detect and anonymize PII in scanned PDF documents.

This package provides functionality to:
- Extract text from scanned PDFs using OCR (Tesseract)
- Detect 27 types of US PII using Microsoft Presidio and custom recognizers
- Replace detected PII with realistic fake data using Faker
- Generate anonymized PDF output
"""

__version__ = "1.0.0"
__author__ = "Devin AI"

from pdf_pii_anonymizer.anonymizer import PIIAnonymizer
from pdf_pii_anonymizer.detector import PIIDetector
from pdf_pii_anonymizer.ocr import PDFOCRExtractor
from pdf_pii_anonymizer.pdf_generator import AnonymizedPDFGenerator

__all__ = [
    "PIIDetector",
    "PIIAnonymizer",
    "PDFOCRExtractor",
    "AnonymizedPDFGenerator",
]
