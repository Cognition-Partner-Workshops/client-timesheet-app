"""
OCR module for extracting text from scanned PDF documents.

Uses Tesseract OCR via pytesseract and pdf2image for PDF to image conversion.
"""

from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import pytesseract
from pdf2image import convert_from_bytes, convert_from_path
from PIL import Image


@dataclass
class PageText:
    """Represents extracted text from a single PDF page."""

    page_number: int
    text: str
    confidence: float
    width: int
    height: int


@dataclass
class OCRResult:
    """Result of OCR extraction from a PDF document."""

    pages: list[PageText]
    total_pages: int
    source_path: Optional[str] = None

    @property
    def full_text(self) -> str:
        """Get concatenated text from all pages."""
        return "\n\n".join(page.text for page in self.pages)


class PDFOCRExtractor:
    """
    Extracts text from scanned PDF documents using OCR.

    Uses Tesseract OCR engine with configurable parameters for
    optimal text extraction from various document types.
    """

    def __init__(
        self,
        tesseract_cmd: Optional[str] = None,
        lang: str = "eng",
        dpi: int = 300,
        psm: int = 3,
    ):
        """
        Initialize the OCR extractor.

        Args:
            tesseract_cmd: Path to tesseract executable (auto-detected if None)
            lang: OCR language code (default: English)
            dpi: DPI for PDF to image conversion (higher = better quality but slower)
            psm: Page segmentation mode for Tesseract
                 3 = Fully automatic page segmentation (default)
                 6 = Assume a single uniform block of text
        """
        if tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

        self.lang = lang
        self.dpi = dpi
        self.psm = psm
        self._tesseract_config = f"--psm {psm}"

    def extract_from_file(self, pdf_path: str | Path) -> OCRResult:
        """
        Extract text from a PDF file using OCR.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            OCRResult containing extracted text from all pages
        """
        pdf_path = Path(pdf_path)
        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")

        images = convert_from_path(str(pdf_path), dpi=self.dpi)
        pages = self._process_images(images)

        return OCRResult(
            pages=pages,
            total_pages=len(pages),
            source_path=str(pdf_path),
        )

    def extract_from_bytes(self, pdf_bytes: bytes) -> OCRResult:
        """
        Extract text from PDF bytes using OCR.

        Args:
            pdf_bytes: PDF content as bytes

        Returns:
            OCRResult containing extracted text from all pages
        """
        images = convert_from_bytes(pdf_bytes, dpi=self.dpi)
        pages = self._process_images(images)

        return OCRResult(
            pages=pages,
            total_pages=len(pages),
        )

    def _process_images(self, images: list[Image.Image]) -> list[PageText]:
        """
        Process a list of page images and extract text.

        Args:
            images: List of PIL Image objects (one per page)

        Returns:
            List of PageText objects with extracted text
        """
        pages = []
        for i, image in enumerate(images, start=1):
            text, confidence = self._extract_text_from_image(image)
            pages.append(
                PageText(
                    page_number=i,
                    text=text,
                    confidence=confidence,
                    width=image.width,
                    height=image.height,
                )
            )
        return pages

    def _extract_text_from_image(self, image: Image.Image) -> tuple[str, float]:
        """
        Extract text from a single image using Tesseract.

        Args:
            image: PIL Image object

        Returns:
            Tuple of (extracted_text, confidence_score)
        """
        data = pytesseract.image_to_data(
            image,
            lang=self.lang,
            config=self._tesseract_config,
            output_type=pytesseract.Output.DICT,
        )

        text = pytesseract.image_to_string(
            image,
            lang=self.lang,
            config=self._tesseract_config,
        )

        confidences = [
            int(conf) for conf in data["conf"] if conf != "-1" and str(conf).isdigit()
        ]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0

        return text.strip(), avg_confidence

    def preprocess_image(self, image: Image.Image) -> Image.Image:
        """
        Preprocess image for better OCR results.

        Applies grayscale conversion and contrast enhancement.

        Args:
            image: Original PIL Image

        Returns:
            Preprocessed PIL Image
        """
        gray = image.convert("L")

        from PIL import ImageEnhance

        enhancer = ImageEnhance.Contrast(gray)
        enhanced = enhancer.enhance(1.5)

        return enhanced
