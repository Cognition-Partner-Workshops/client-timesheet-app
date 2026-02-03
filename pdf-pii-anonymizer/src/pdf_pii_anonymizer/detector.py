"""
PII Detection module using Microsoft Presidio with custom recognizers.

Detects all 27 US PII types in text extracted from documents.
"""

from dataclasses import dataclass
from typing import Optional

from presidio_analyzer import AnalyzerEngine
from presidio_analyzer.nlp_engine import NlpEngineProvider

from pdf_pii_anonymizer.custom_recognizers import get_all_custom_recognizers
from pdf_pii_anonymizer.pii_types import PII_TYPE_MAP, PIIType


@dataclass
class PIIMatch:
    """Represents a detected PII instance in text."""

    entity_type: str
    text: str
    start: int
    end: int
    score: float
    pii_type: Optional[PIIType] = None

    def __post_init__(self):
        """Set the PII type based on entity type."""
        if self.pii_type is None:
            self.pii_type = PII_TYPE_MAP.get(self.entity_type)


@dataclass
class DetectionResult:
    """Result of PII detection on a text."""

    text: str
    matches: list[PIIMatch]
    total_pii_count: int
    pii_types_found: set[str]

    @property
    def has_pii(self) -> bool:
        """Check if any PII was detected."""
        return self.total_pii_count > 0


class PIIDetector:
    """
    Detects PII in text using Microsoft Presidio with custom recognizers.

    Supports all 27 US PII types through a combination of built-in
    Presidio entities and custom pattern recognizers.
    """

    PRESIDIO_ENTITIES = [
        "PERSON",
        "EMAIL_ADDRESS",
        "PHONE_NUMBER",
        "US_SSN",
        "US_DRIVER_LICENSE",
        "CREDIT_CARD",
        "US_BANK_NUMBER",
        "US_ITIN",
        "IP_ADDRESS",
        "LOCATION",
        "DATE_TIME",
        "NRP",
        "MEDICAL_LICENSE",
        "URL",
        "IBAN_CODE",
    ]

    CUSTOM_ENTITIES = [
        "US_PASSPORT",
        "STATE_ID",
        "MEDICAL_RECORD",
        "HEALTH_INSURANCE_ID",
        "EMPLOYEE_ID",
        "STUDENT_ID",
        "MILITARY_ID",
        "VEHICLE_REGISTRATION",
        "LICENSE_PLATE",
        "CREDENTIALS",
        "US_ADDRESS",
        "DATE_OF_BIRTH",
        "MOTHERS_MAIDEN_NAME",
        "FINANCIAL_ACCOUNT",
    ]

    def __init__(
        self,
        language: str = "en",
        score_threshold: float = 0.5,
        load_spacy_model: bool = True,
    ):
        """
        Initialize the PII detector.

        Args:
            language: Language code for NLP processing
            score_threshold: Minimum confidence score for PII detection
            load_spacy_model: Whether to load spaCy model (set False for testing)
        """
        self.language = language
        self.score_threshold = score_threshold

        if load_spacy_model:
            self._initialize_analyzer()
        else:
            self.analyzer = None

    def _initialize_analyzer(self):
        """Initialize the Presidio analyzer with custom recognizers."""
        configuration = {
            "nlp_engine_name": "spacy",
            "models": [{"lang_code": self.language, "model_name": "en_core_web_lg"}],
        }

        try:
            provider = NlpEngineProvider(nlp_configuration=configuration)
            nlp_engine = provider.create_engine()
        except OSError:
            configuration["models"][0]["model_name"] = "en_core_web_sm"
            provider = NlpEngineProvider(nlp_configuration=configuration)
            nlp_engine = provider.create_engine()

        self.analyzer = AnalyzerEngine(nlp_engine=nlp_engine)

        custom_recognizers = get_all_custom_recognizers()
        for recognizer in custom_recognizers:
            self.analyzer.registry.add_recognizer(recognizer)

    def detect(self, text: str) -> DetectionResult:
        """
        Detect PII in the given text.

        Args:
            text: Text to analyze for PII

        Returns:
            DetectionResult containing all detected PII matches
        """
        if not text or not text.strip():
            return DetectionResult(
                text=text,
                matches=[],
                total_pii_count=0,
                pii_types_found=set(),
            )

        if self.analyzer is None:
            raise RuntimeError("Analyzer not initialized. Set load_spacy_model=True.")

        all_entities = self.PRESIDIO_ENTITIES + self.CUSTOM_ENTITIES

        results = self.analyzer.analyze(
            text=text,
            language=self.language,
            entities=all_entities,
            score_threshold=self.score_threshold,
        )

        matches = []
        pii_types_found = set()

        for result in results:
            match = PIIMatch(
                entity_type=result.entity_type,
                text=text[result.start : result.end],
                start=result.start,
                end=result.end,
                score=result.score,
            )
            matches.append(match)
            pii_types_found.add(result.entity_type)

        matches.sort(key=lambda m: m.start)

        return DetectionResult(
            text=text,
            matches=matches,
            total_pii_count=len(matches),
            pii_types_found=pii_types_found,
        )

    def detect_with_context(
        self,
        text: str,
        context_window: int = 50,
    ) -> list[dict]:
        """
        Detect PII with surrounding context for review.

        Args:
            text: Text to analyze
            context_window: Number of characters to include before/after match

        Returns:
            List of dictionaries with PII matches and context
        """
        result = self.detect(text)
        matches_with_context = []

        for match in result.matches:
            context_start = max(0, match.start - context_window)
            context_end = min(len(text), match.end + context_window)

            matches_with_context.append(
                {
                    "entity_type": match.entity_type,
                    "matched_text": match.text,
                    "score": match.score,
                    "position": {"start": match.start, "end": match.end},
                    "context": text[context_start:context_end],
                    "context_position": {
                        "start": context_start,
                        "end": context_end,
                    },
                }
            )

        return matches_with_context

    def get_supported_entities(self) -> list[str]:
        """Get list of all supported PII entity types."""
        return self.PRESIDIO_ENTITIES + self.CUSTOM_ENTITIES

    def get_pii_summary(self, text: str) -> dict:
        """
        Get a summary of PII detected in text.

        Args:
            text: Text to analyze

        Returns:
            Dictionary with PII detection summary
        """
        result = self.detect(text)

        type_counts = {}
        for match in result.matches:
            entity_type = match.entity_type
            type_counts[entity_type] = type_counts.get(entity_type, 0) + 1

        return {
            "total_pii_found": result.total_pii_count,
            "unique_pii_types": len(result.pii_types_found),
            "pii_types_found": list(result.pii_types_found),
            "type_counts": type_counts,
            "has_sensitive_data": result.has_pii,
        }
