"""
PDF Generation module for creating anonymized PDF documents.

Generates new PDF files with anonymized content while preserving layout.
"""

import io
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer


@dataclass
class PDFConfig:
    """Configuration for PDF generation."""

    page_size: tuple = letter
    left_margin: float = 1.0
    right_margin: float = 1.0
    top_margin: float = 1.0
    bottom_margin: float = 1.0
    font_name: str = "Helvetica"
    font_size: int = 11
    line_spacing: float = 1.2
    title: Optional[str] = None
    author: Optional[str] = None


class AnonymizedPDFGenerator:
    """
    Generates PDF documents with anonymized content.

    Creates new PDF files from anonymized text while maintaining
    readable formatting and structure.
    """

    def __init__(self, config: Optional[PDFConfig] = None):
        """
        Initialize the PDF generator.

        Args:
            config: PDF configuration options
        """
        self.config = config or PDFConfig()
        self._styles = self._create_styles()

    def _create_styles(self) -> dict:
        """Create paragraph styles for the PDF."""
        styles = getSampleStyleSheet()

        body_style = ParagraphStyle(
            "BodyText",
            parent=styles["Normal"],
            fontName=self.config.font_name,
            fontSize=self.config.font_size,
            leading=self.config.font_size * self.config.line_spacing,
            alignment=TA_LEFT,
            spaceAfter=6,
        )

        title_style = ParagraphStyle(
            "DocumentTitle",
            parent=styles["Heading1"],
            fontName=f"{self.config.font_name}-Bold",
            fontSize=16,
            spaceAfter=12,
            alignment=TA_LEFT,
        )

        heading_style = ParagraphStyle(
            "SectionHeading",
            parent=styles["Heading2"],
            fontName=f"{self.config.font_name}-Bold",
            fontSize=13,
            spaceBefore=12,
            spaceAfter=6,
            alignment=TA_LEFT,
        )

        return {
            "body": body_style,
            "title": title_style,
            "heading": heading_style,
        }

    def generate_from_text(
        self,
        text: str,
        output_path: str | Path,
        title: Optional[str] = None,
    ) -> Path:
        """
        Generate a PDF from anonymized text.

        Args:
            text: Anonymized text content
            output_path: Path for the output PDF file
            title: Optional document title

        Returns:
            Path to the generated PDF file
        """
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        doc = SimpleDocTemplate(
            str(output_path),
            pagesize=self.config.page_size,
            leftMargin=self.config.left_margin * inch,
            rightMargin=self.config.right_margin * inch,
            topMargin=self.config.top_margin * inch,
            bottomMargin=self.config.bottom_margin * inch,
            title=title or self.config.title or "Anonymized Document",
            author=self.config.author or "PDF PII Anonymizer",
        )

        story = self._build_story(text, title)
        doc.build(story)

        return output_path

    def generate_to_bytes(
        self,
        text: str,
        title: Optional[str] = None,
    ) -> bytes:
        """
        Generate a PDF and return as bytes.

        Args:
            text: Anonymized text content
            title: Optional document title

        Returns:
            PDF content as bytes
        """
        buffer = io.BytesIO()

        doc = SimpleDocTemplate(
            buffer,
            pagesize=self.config.page_size,
            leftMargin=self.config.left_margin * inch,
            rightMargin=self.config.right_margin * inch,
            topMargin=self.config.top_margin * inch,
            bottomMargin=self.config.bottom_margin * inch,
            title=title or self.config.title or "Anonymized Document",
            author=self.config.author or "PDF PII Anonymizer",
        )

        story = self._build_story(text, title)
        doc.build(story)

        buffer.seek(0)
        return buffer.read()

    def _build_story(self, text: str, title: Optional[str] = None) -> list:
        """
        Build the document story (content flow).

        Args:
            text: Text content
            title: Optional document title

        Returns:
            List of flowable elements
        """
        story = []

        if title:
            story.append(Paragraph(self._escape_text(title), self._styles["title"]))
            story.append(Spacer(1, 12))

        pages = text.split("\n\n")

        for i, page_text in enumerate(pages):
            if not page_text.strip():
                continue

            paragraphs = page_text.split("\n")

            for para in paragraphs:
                if not para.strip():
                    story.append(Spacer(1, 6))
                    continue

                escaped_text = self._escape_text(para)
                story.append(Paragraph(escaped_text, self._styles["body"]))

            if i < len(pages) - 1:
                story.append(Spacer(1, 12))

        return story

    def _escape_text(self, text: str) -> str:
        """
        Escape special characters for ReportLab.

        Args:
            text: Raw text

        Returns:
            Escaped text safe for PDF generation
        """
        replacements = [
            ("&", "&amp;"),
            ("<", "&lt;"),
            (">", "&gt;"),
        ]

        for old, new in replacements:
            text = text.replace(old, new)

        return text

    def generate_multi_page(
        self,
        page_texts: list[str],
        output_path: str | Path,
        title: Optional[str] = None,
    ) -> Path:
        """
        Generate a multi-page PDF from a list of page texts.

        Args:
            page_texts: List of text content for each page
            output_path: Path for the output PDF file
            title: Optional document title

        Returns:
            Path to the generated PDF file
        """
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        doc = SimpleDocTemplate(
            str(output_path),
            pagesize=self.config.page_size,
            leftMargin=self.config.left_margin * inch,
            rightMargin=self.config.right_margin * inch,
            topMargin=self.config.top_margin * inch,
            bottomMargin=self.config.bottom_margin * inch,
            title=title or self.config.title or "Anonymized Document",
            author=self.config.author or "PDF PII Anonymizer",
        )

        story = []

        if title:
            story.append(Paragraph(self._escape_text(title), self._styles["title"]))
            story.append(Spacer(1, 12))

        for i, page_text in enumerate(page_texts):
            if not page_text.strip():
                continue

            paragraphs = page_text.split("\n")

            for para in paragraphs:
                if not para.strip():
                    story.append(Spacer(1, 6))
                    continue

                escaped_text = self._escape_text(para)
                story.append(Paragraph(escaped_text, self._styles["body"]))

            if i < len(page_texts) - 1:
                story.append(PageBreak())

        doc.build(story)

        return output_path


class PDFReportGenerator:
    """
    Generates detailed anonymization reports in PDF format.

    Creates reports showing what PII was found and how it was anonymized.
    """

    def __init__(self, config: Optional[PDFConfig] = None):
        """
        Initialize the report generator.

        Args:
            config: PDF configuration options
        """
        self.config = config or PDFConfig()
        self._styles = self._create_styles()

    def _create_styles(self) -> dict:
        """Create paragraph styles for the report."""
        styles = getSampleStyleSheet()

        return {
            "title": ParagraphStyle(
                "ReportTitle",
                parent=styles["Heading1"],
                fontSize=18,
                spaceAfter=20,
            ),
            "heading": ParagraphStyle(
                "ReportHeading",
                parent=styles["Heading2"],
                fontSize=14,
                spaceBefore=15,
                spaceAfter=10,
            ),
            "body": ParagraphStyle(
                "ReportBody",
                parent=styles["Normal"],
                fontSize=10,
                spaceAfter=6,
            ),
            "code": ParagraphStyle(
                "ReportCode",
                parent=styles["Code"],
                fontSize=9,
                spaceAfter=4,
                leftIndent=20,
            ),
        }

    def generate_report(
        self,
        replacements: list[dict],
        output_path: str | Path,
        source_file: Optional[str] = None,
    ) -> Path:
        """
        Generate an anonymization report.

        Args:
            replacements: List of replacement dictionaries from anonymization
            output_path: Path for the output report PDF
            source_file: Optional source file name for the report

        Returns:
            Path to the generated report
        """
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        doc = SimpleDocTemplate(
            str(output_path),
            pagesize=self.config.page_size,
            leftMargin=self.config.left_margin * inch,
            rightMargin=self.config.right_margin * inch,
            topMargin=self.config.top_margin * inch,
            bottomMargin=self.config.bottom_margin * inch,
            title="PII Anonymization Report",
            author="PDF PII Anonymizer",
        )

        story = []

        story.append(Paragraph("PII Anonymization Report", self._styles["title"]))

        if source_file:
            story.append(
                Paragraph(f"Source: {source_file}", self._styles["body"])
            )

        story.append(
            Paragraph(f"Total PII Instances Found: {len(replacements)}", self._styles["body"])
        )
        story.append(Spacer(1, 12))

        story.append(Paragraph("Summary by PII Type", self._styles["heading"]))

        type_counts = {}
        for r in replacements:
            entity_type = r.get("entity_type", "UNKNOWN")
            type_counts[entity_type] = type_counts.get(entity_type, 0) + 1

        for pii_type, count in sorted(type_counts.items()):
            story.append(
                Paragraph(f"- {pii_type}: {count} instance(s)", self._styles["body"])
            )

        story.append(Spacer(1, 12))
        story.append(Paragraph("Detailed Replacements", self._styles["heading"]))

        for i, r in enumerate(replacements, 1):
            entity_type = r.get("entity_type", "UNKNOWN")
            original = r.get("original_value", "N/A")
            replacement = r.get("replacement_value", "N/A")
            score = r.get("confidence_score", 0)

            story.append(
                Paragraph(
                    f"{i}. [{entity_type}] (confidence: {score:.2f})",
                    self._styles["body"],
                )
            )
            story.append(
                Paragraph(
                    f"   Original: {self._escape_text(original)}",
                    self._styles["code"],
                )
            )
            story.append(
                Paragraph(
                    f"   Replaced: {self._escape_text(replacement)}",
                    self._styles["code"],
                )
            )

        doc.build(story)

        return output_path

    def _escape_text(self, text: str) -> str:
        """Escape special characters for ReportLab."""
        replacements = [
            ("&", "&amp;"),
            ("<", "&lt;"),
            (">", "&gt;"),
        ]

        for old, new in replacements:
            text = text.replace(old, new)

        return text
