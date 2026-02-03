"""Tests for OCR module."""

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from pdf_pii_anonymizer.ocr import OCRResult, PageText, PDFOCRExtractor


class TestPageText:
    """Tests for PageText dataclass."""

    def test_page_text_creation(self):
        """Test creating a PageText."""
        page = PageText(
            page_number=1,
            text="Sample text",
            confidence=95.5,
            width=612,
            height=792,
        )

        assert page.page_number == 1
        assert page.text == "Sample text"
        assert page.confidence == 95.5
        assert page.width == 612
        assert page.height == 792


class TestOCRResult:
    """Tests for OCRResult dataclass."""

    def test_ocr_result_creation(self):
        """Test creating an OCRResult."""
        pages = [
            PageText(1, "Page 1 text", 90.0, 612, 792),
            PageText(2, "Page 2 text", 85.0, 612, 792),
        ]
        result = OCRResult(
            pages=pages,
            total_pages=2,
            source_path="/path/to/file.pdf",
        )

        assert result.total_pages == 2
        assert len(result.pages) == 2
        assert result.source_path == "/path/to/file.pdf"

    def test_full_text_property(self):
        """Test full_text property concatenates pages."""
        pages = [
            PageText(1, "First page", 90.0, 612, 792),
            PageText(2, "Second page", 85.0, 612, 792),
        ]
        result = OCRResult(pages=pages, total_pages=2)

        assert result.full_text == "First page\n\nSecond page"

    def test_full_text_single_page(self):
        """Test full_text with single page."""
        pages = [PageText(1, "Only page", 90.0, 612, 792)]
        result = OCRResult(pages=pages, total_pages=1)

        assert result.full_text == "Only page"

    def test_full_text_empty_pages(self):
        """Test full_text with no pages."""
        result = OCRResult(pages=[], total_pages=0)

        assert result.full_text == ""


class TestPDFOCRExtractor:
    """Tests for PDFOCRExtractor class."""

    def test_extractor_initialization(self):
        """Test extractor initializes with default values."""
        extractor = PDFOCRExtractor()

        assert extractor.lang == "eng"
        assert extractor.dpi == 300
        assert extractor.psm == 3

    def test_extractor_custom_initialization(self):
        """Test extractor with custom values."""
        extractor = PDFOCRExtractor(
            lang="fra",
            dpi=200,
            psm=6,
        )

        assert extractor.lang == "fra"
        assert extractor.dpi == 200
        assert extractor.psm == 6

    def test_tesseract_config_format(self):
        """Test tesseract config is formatted correctly."""
        extractor = PDFOCRExtractor(psm=6)

        assert extractor._tesseract_config == "--psm 6"

    def test_extract_from_file_not_found(self):
        """Test extract_from_file raises for missing file."""
        extractor = PDFOCRExtractor()

        with pytest.raises(FileNotFoundError):
            extractor.extract_from_file("/nonexistent/path/file.pdf")

    @patch("pdf_pii_anonymizer.ocr.convert_from_path")
    @patch("pdf_pii_anonymizer.ocr.pytesseract")
    def test_extract_from_file_success(self, mock_tesseract, mock_convert):
        """Test successful extraction from file."""
        mock_image = MagicMock()
        mock_image.width = 612
        mock_image.height = 792
        mock_convert.return_value = [mock_image]

        mock_tesseract.image_to_string.return_value = "Extracted text"
        mock_tesseract.image_to_data.return_value = {
            "conf": ["90", "85", "95"]
        }
        mock_tesseract.Output.DICT = "dict"

        extractor = PDFOCRExtractor()

        with patch.object(Path, "exists", return_value=True):
            result = extractor.extract_from_file("/test/file.pdf")

        assert result.total_pages == 1
        assert result.pages[0].text == "Extracted text"

    @patch("pdf_pii_anonymizer.ocr.convert_from_bytes")
    @patch("pdf_pii_anonymizer.ocr.pytesseract")
    def test_extract_from_bytes(self, mock_tesseract, mock_convert):
        """Test extraction from bytes."""
        mock_image = MagicMock()
        mock_image.width = 612
        mock_image.height = 792
        mock_convert.return_value = [mock_image]

        mock_tesseract.image_to_string.return_value = "Bytes text"
        mock_tesseract.image_to_data.return_value = {
            "conf": ["88"]
        }
        mock_tesseract.Output.DICT = "dict"

        extractor = PDFOCRExtractor()
        result = extractor.extract_from_bytes(b"fake pdf bytes")

        assert result.total_pages == 1
        assert result.pages[0].text == "Bytes text"

    @patch("pdf_pii_anonymizer.ocr.pytesseract")
    def test_extract_text_from_image(self, mock_tesseract):
        """Test text extraction from single image."""
        mock_tesseract.image_to_string.return_value = "Image text"
        mock_tesseract.image_to_data.return_value = {
            "conf": ["90", "85", "-1", "invalid"]
        }
        mock_tesseract.Output.DICT = "dict"

        mock_image = MagicMock()
        extractor = PDFOCRExtractor()

        text, confidence = extractor._extract_text_from_image(mock_image)

        assert text == "Image text"
        assert confidence == 87.5

    @patch("pdf_pii_anonymizer.ocr.pytesseract")
    def test_extract_text_empty_confidence(self, mock_tesseract):
        """Test extraction with no valid confidence scores."""
        mock_tesseract.image_to_string.return_value = "Text"
        mock_tesseract.image_to_data.return_value = {
            "conf": ["-1", "-1"]
        }
        mock_tesseract.Output.DICT = "dict"

        mock_image = MagicMock()
        extractor = PDFOCRExtractor()

        text, confidence = extractor._extract_text_from_image(mock_image)

        assert text == "Text"
        assert confidence == 0.0

    def test_preprocess_image(self):
        """Test image preprocessing."""
        from PIL import Image

        test_image = Image.new("RGB", (100, 100), color="white")
        extractor = PDFOCRExtractor()

        result = extractor.preprocess_image(test_image)

        assert result.mode == "L"

    @patch("pdf_pii_anonymizer.ocr.convert_from_path")
    @patch("pdf_pii_anonymizer.ocr.pytesseract")
    def test_process_multiple_images(self, mock_tesseract, mock_convert):
        """Test processing multiple page images."""
        mock_images = [MagicMock() for _ in range(3)]
        for img in mock_images:
            img.width = 612
            img.height = 792
        mock_convert.return_value = mock_images

        mock_tesseract.image_to_string.side_effect = [
            "Page 1", "Page 2", "Page 3"
        ]
        mock_tesseract.image_to_data.return_value = {"conf": ["90"]}
        mock_tesseract.Output.DICT = "dict"

        extractor = PDFOCRExtractor()

        with patch.object(Path, "exists", return_value=True):
            result = extractor.extract_from_file("/test/multi.pdf")

        assert result.total_pages == 3
        assert result.pages[0].text == "Page 1"
        assert result.pages[1].text == "Page 2"
        assert result.pages[2].text == "Page 3"
