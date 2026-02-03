"""Tests for PDF Generator."""

import tempfile
from pathlib import Path

import pytest

from pdf_pii_anonymizer.pdf_generator import (
    AnonymizedPDFGenerator,
    PDFConfig,
    PDFReportGenerator,
)


class TestPDFConfig:
    """Tests for PDFConfig dataclass."""

    def test_default_config(self):
        """Test default configuration values."""
        config = PDFConfig()
        assert config.left_margin == 1.0
        assert config.right_margin == 1.0
        assert config.top_margin == 1.0
        assert config.bottom_margin == 1.0
        assert config.font_name == "Helvetica"
        assert config.font_size == 11
        assert config.line_spacing == 1.2

    def test_custom_config(self):
        """Test custom configuration values."""
        config = PDFConfig(
            left_margin=0.5,
            font_size=12,
            title="Test Document",
        )
        assert config.left_margin == 0.5
        assert config.font_size == 12
        assert config.title == "Test Document"


class TestAnonymizedPDFGenerator:
    """Tests for AnonymizedPDFGenerator class."""

    @pytest.fixture
    def generator(self):
        return AnonymizedPDFGenerator()

    @pytest.fixture
    def temp_dir(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            yield Path(tmpdir)

    def test_generator_initialization(self, generator):
        """Test generator initializes correctly."""
        assert generator.config is not None
        assert generator._styles is not None

    def test_generator_with_custom_config(self):
        """Test generator with custom config."""
        config = PDFConfig(font_size=14)
        generator = AnonymizedPDFGenerator(config=config)
        assert generator.config.font_size == 14

    def test_generate_from_text(self, generator, temp_dir):
        """Test generating PDF from text."""
        text = "This is a test document with anonymized content."
        output_path = temp_dir / "test_output.pdf"

        result = generator.generate_from_text(text, output_path)

        assert result == output_path
        assert output_path.exists()
        assert output_path.stat().st_size > 0

    def test_generate_from_text_with_title(self, generator, temp_dir):
        """Test generating PDF with title."""
        text = "Document content here."
        output_path = temp_dir / "titled_output.pdf"

        result = generator.generate_from_text(
            text, output_path, title="Test Title"
        )

        assert result.exists()

    def test_generate_to_bytes(self, generator):
        """Test generating PDF as bytes."""
        text = "Test content for bytes output."

        result = generator.generate_to_bytes(text)

        assert isinstance(result, bytes)
        assert len(result) > 0
        assert result.startswith(b"%PDF")

    def test_generate_multi_page(self, generator, temp_dir):
        """Test generating multi-page PDF."""
        pages = [
            "Page 1 content here.",
            "Page 2 content here.",
            "Page 3 content here.",
        ]
        output_path = temp_dir / "multi_page.pdf"

        result = generator.generate_multi_page(pages, output_path)

        assert result.exists()
        assert result.stat().st_size > 0

    def test_escape_text(self, generator):
        """Test text escaping for special characters."""
        text = "Test <tag> & more"
        escaped = generator._escape_text(text)

        assert "&lt;" in escaped
        assert "&gt;" in escaped
        assert "&amp;" in escaped

    def test_creates_output_directory(self, generator, temp_dir):
        """Test that output directory is created if it doesn't exist."""
        output_path = temp_dir / "subdir" / "nested" / "output.pdf"

        result = generator.generate_from_text("Test", output_path)

        assert result.exists()
        assert result.parent.exists()

    def test_empty_text_handling(self, generator, temp_dir):
        """Test handling of empty text."""
        output_path = temp_dir / "empty.pdf"

        result = generator.generate_from_text("", output_path)

        assert result.exists()

    def test_multiline_text(self, generator, temp_dir):
        """Test handling of multiline text."""
        text = "Line 1\nLine 2\nLine 3\n\nNew paragraph"
        output_path = temp_dir / "multiline.pdf"

        result = generator.generate_from_text(text, output_path)

        assert result.exists()


class TestPDFReportGenerator:
    """Tests for PDFReportGenerator class."""

    @pytest.fixture
    def generator(self):
        return PDFReportGenerator()

    @pytest.fixture
    def temp_dir(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            yield Path(tmpdir)

    @pytest.fixture
    def sample_replacements(self):
        return [
            {
                "entity_type": "PERSON",
                "original_value": "John Doe",
                "replacement_value": "Jane Smith",
                "confidence_score": 0.85,
            },
            {
                "entity_type": "US_SSN",
                "original_value": "123-45-6789",
                "replacement_value": "987-65-4321",
                "confidence_score": 0.95,
            },
            {
                "entity_type": "EMAIL_ADDRESS",
                "original_value": "john@example.com",
                "replacement_value": "jane@test.com",
                "confidence_score": 0.99,
            },
        ]

    def test_generator_initialization(self, generator):
        """Test report generator initializes correctly."""
        assert generator.config is not None
        assert generator._styles is not None

    def test_generate_report(self, generator, temp_dir, sample_replacements):
        """Test generating anonymization report."""
        output_path = temp_dir / "report.pdf"

        result = generator.generate_report(
            sample_replacements,
            output_path,
            source_file="test.pdf",
        )

        assert result == output_path
        assert output_path.exists()
        assert output_path.stat().st_size > 0

    def test_generate_report_without_source(self, generator, temp_dir, sample_replacements):
        """Test generating report without source file."""
        output_path = temp_dir / "report_no_source.pdf"

        result = generator.generate_report(sample_replacements, output_path)

        assert result.exists()

    def test_generate_report_empty_replacements(self, generator, temp_dir):
        """Test generating report with no replacements."""
        output_path = temp_dir / "empty_report.pdf"

        result = generator.generate_report([], output_path)

        assert result.exists()

    def test_escape_text_in_report(self, generator):
        """Test text escaping in report generator."""
        text = "Value <script> & more"
        escaped = generator._escape_text(text)

        assert "&lt;" in escaped
        assert "&amp;" in escaped
