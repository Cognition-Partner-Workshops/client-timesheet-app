"""
Command-line interface for the PDF PII Anonymizer tool.

Provides a user-friendly CLI for processing PDF documents.
"""

import sys
from pathlib import Path
from typing import Optional

import click
from rich.console import Console
from rich.panel import Panel
from rich.progress import BarColumn, Progress, SpinnerColumn, TextColumn
from rich.table import Table

console = Console()


@click.group()
@click.version_option(version="1.0.0", prog_name="pdf-pii-anonymizer")
def main():
    """
    PDF PII Anonymizer - Detect and anonymize PII in scanned PDF documents.

    This tool extracts text from scanned PDFs using OCR, detects 27 types of
    US PII, and replaces them with realistic fake data.
    """
    pass


@main.command()
@click.argument("input_pdf", type=click.Path(exists=True, path_type=Path))
@click.option(
    "-o",
    "--output",
    type=click.Path(path_type=Path),
    help="Output PDF path (default: input_anonymized.pdf)",
)
@click.option(
    "--report",
    type=click.Path(path_type=Path),
    help="Generate anonymization report PDF",
)
@click.option(
    "--dpi",
    default=300,
    type=int,
    help="DPI for OCR processing (default: 300)",
)
@click.option(
    "--threshold",
    default=0.5,
    type=float,
    help="Confidence threshold for PII detection (default: 0.5)",
)
@click.option(
    "--seed",
    type=int,
    help="Random seed for reproducible fake data",
)
@click.option(
    "--verbose",
    "-v",
    is_flag=True,
    help="Show detailed processing information",
)
def anonymize(
    input_pdf: Path,
    output: Optional[Path],
    report: Optional[Path],
    dpi: int,
    threshold: float,
    seed: Optional[int],
    verbose: bool,
):
    """
    Anonymize PII in a scanned PDF document.

    Extracts text using OCR, detects PII, and generates a new PDF
    with all PII replaced by realistic fake data.
    """
    if output is None:
        output = input_pdf.parent / f"{input_pdf.stem}_anonymized.pdf"

    console.print(Panel.fit(
        "[bold blue]PDF PII Anonymizer[/bold blue]\n"
        f"Input: {input_pdf}\n"
        f"Output: {output}",
        title="Processing",
    ))

    try:
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            console=console,
        ) as progress:
            task = progress.add_task("Loading dependencies...", total=5)

            from pdf_pii_anonymizer.anonymizer import PIIAnonymizer
            from pdf_pii_anonymizer.detector import PIIDetector
            from pdf_pii_anonymizer.ocr import PDFOCRExtractor
            from pdf_pii_anonymizer.pdf_generator import (
                AnonymizedPDFGenerator,
                PDFReportGenerator,
            )

            progress.update(task, advance=1, description="Extracting text with OCR...")

            ocr = PDFOCRExtractor(dpi=dpi)
            ocr_result = ocr.extract_from_file(input_pdf)

            if verbose:
                console.print(f"[dim]Extracted {ocr_result.total_pages} page(s)[/dim]")

            progress.update(task, advance=1, description="Detecting PII...")

            detector = PIIDetector(score_threshold=threshold)
            detection_result = detector.detect(ocr_result.full_text)

            if verbose:
                console.print(
                    f"[dim]Found {detection_result.total_pii_count} PII instance(s)[/dim]"
                )

            progress.update(task, advance=1, description="Anonymizing data...")

            anonymizer = PIIAnonymizer(seed=seed)
            anon_result = anonymizer.anonymize(detection_result)

            progress.update(task, advance=1, description="Generating PDF...")

            pdf_gen = AnonymizedPDFGenerator()
            pdf_gen.generate_from_text(
                anon_result.anonymized_text,
                output,
                title=f"Anonymized: {input_pdf.name}",
            )

            if report:
                report_gen = PDFReportGenerator()
                report_gen.generate_report(
                    anon_result.replacements,
                    report,
                    source_file=str(input_pdf),
                )
                if verbose:
                    console.print(f"[dim]Report saved to: {report}[/dim]")

            progress.update(task, advance=1, description="Complete!")

        _print_summary(detection_result, anon_result, output, verbose)

    except FileNotFoundError as e:
        console.print(f"[red]Error: {e}[/red]")
        sys.exit(1)
    except Exception as e:
        console.print(f"[red]Error processing PDF: {e}[/red]")
        if verbose:
            console.print_exception()
        sys.exit(1)


@main.command()
@click.argument("input_pdf", type=click.Path(exists=True, path_type=Path))
@click.option(
    "--dpi",
    default=300,
    type=int,
    help="DPI for OCR processing (default: 300)",
)
@click.option(
    "--threshold",
    default=0.5,
    type=float,
    help="Confidence threshold for PII detection (default: 0.5)",
)
@click.option(
    "--show-values",
    is_flag=True,
    help="Show actual PII values found (use with caution)",
)
def scan(
    input_pdf: Path,
    dpi: int,
    threshold: float,
    show_values: bool,
):
    """
    Scan a PDF for PII without anonymizing.

    Useful for reviewing what PII would be detected before processing.
    """
    console.print(Panel.fit(
        f"[bold blue]Scanning for PII[/bold blue]\n"
        f"File: {input_pdf}",
        title="PII Scanner",
    ))

    try:
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            task = progress.add_task("Loading...", total=3)

            from pdf_pii_anonymizer.detector import PIIDetector
            from pdf_pii_anonymizer.ocr import PDFOCRExtractor

            progress.update(task, advance=1, description="Extracting text...")

            ocr = PDFOCRExtractor(dpi=dpi)
            ocr_result = ocr.extract_from_file(input_pdf)

            progress.update(task, advance=1, description="Detecting PII...")

            detector = PIIDetector(score_threshold=threshold)
            detection_result = detector.detect(ocr_result.full_text)

            progress.update(task, advance=1, description="Complete!")

        _print_scan_results(detection_result, show_values)

    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        sys.exit(1)


@main.command()
@click.argument("input_pdf", type=click.Path(exists=True, path_type=Path))
@click.option(
    "-o",
    "--output",
    type=click.Path(path_type=Path),
    help="Output text file path",
)
@click.option(
    "--dpi",
    default=300,
    type=int,
    help="DPI for OCR processing (default: 300)",
)
def extract(
    input_pdf: Path,
    output: Optional[Path],
    dpi: int,
):
    """
    Extract text from a scanned PDF using OCR.

    Outputs the extracted text to stdout or a file.
    """
    try:
        from pdf_pii_anonymizer.ocr import PDFOCRExtractor

        with console.status("Extracting text..."):
            ocr = PDFOCRExtractor(dpi=dpi)
            result = ocr.extract_from_file(input_pdf)

        if output:
            output.write_text(result.full_text)
            console.print(f"[green]Text saved to: {output}[/green]")
        else:
            console.print(result.full_text)

        console.print(f"\n[dim]Pages: {result.total_pages}[/dim]")

    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        sys.exit(1)


@main.command(name="list-pii")
def list_pii():
    """
    List all 27 supported US PII types.
    """
    from pdf_pii_anonymizer.pii_types import US_PII_TYPES

    table = Table(title="Supported US PII Types (27 Total)")
    table.add_column("Code", style="cyan")
    table.add_column("Name", style="green")
    table.add_column("Category", style="yellow")
    table.add_column("Description")

    for pii in US_PII_TYPES:
        table.add_row(
            pii.code,
            pii.name,
            pii.category.value,
            pii.description,
        )

    console.print(table)


def _print_summary(detection_result, anon_result, output_path, verbose):  # noqa: ARG001
    """Print anonymization summary."""
    console.print()

    if detection_result.total_pii_count == 0:
        console.print("[yellow]No PII detected in the document.[/yellow]")
        return

    table = Table(title="Anonymization Summary")
    table.add_column("PII Type", style="cyan")
    table.add_column("Count", justify="right", style="green")

    type_counts = {}
    for r in anon_result.replacements:
        entity_type = r.get("entity_type", "UNKNOWN")
        type_counts[entity_type] = type_counts.get(entity_type, 0) + 1

    for pii_type, count in sorted(type_counts.items()):
        table.add_row(pii_type, str(count))

    console.print(table)

    console.print(
        f"\n[bold green]Success![/bold green] "
        f"Anonymized {anon_result.total_replacements} PII instance(s)"
    )
    console.print(f"Output saved to: [blue]{output_path}[/blue]")


def _print_scan_results(detection_result, show_values):
    """Print PII scan results."""
    console.print()

    if detection_result.total_pii_count == 0:
        console.print("[green]No PII detected in the document.[/green]")
        return

    table = Table(title=f"PII Detected: {detection_result.total_pii_count} instance(s)")
    table.add_column("#", style="dim")
    table.add_column("Type", style="cyan")
    table.add_column("Confidence", justify="right", style="yellow")

    if show_values:
        table.add_column("Value", style="red")

    for i, match in enumerate(detection_result.matches, 1):
        row = [str(i), match.entity_type, f"{match.score:.2f}"]
        if show_values:
            row.append(match.text[:50] + "..." if len(match.text) > 50 else match.text)
        table.add_row(*row)

    console.print(table)

    console.print("\n[bold]Summary by Type:[/bold]")
    type_counts = {}
    for match in detection_result.matches:
        type_counts[match.entity_type] = type_counts.get(match.entity_type, 0) + 1

    for pii_type, count in sorted(type_counts.items()):
        console.print(f"  - {pii_type}: {count}")


if __name__ == "__main__":
    main()
