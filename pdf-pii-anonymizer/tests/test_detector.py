"""Tests for PII Detector."""

import pytest

from pdf_pii_anonymizer.detector import DetectionResult, PIIDetector, PIIMatch


class TestPIIMatch:
    """Tests for PIIMatch dataclass."""

    def test_pii_match_creation(self):
        """Test creating a PIIMatch."""
        match = PIIMatch(
            entity_type="PERSON",
            text="John Doe",
            start=0,
            end=8,
            score=0.85,
        )

        assert match.entity_type == "PERSON"
        assert match.text == "John Doe"
        assert match.start == 0
        assert match.end == 8
        assert match.score == 0.85

    def test_pii_match_with_known_type(self):
        """Test PIIMatch sets pii_type for known entity types."""
        match = PIIMatch(
            entity_type="SSN",
            text="123-45-6789",
            start=0,
            end=11,
            score=0.95,
        )

        assert match.pii_type is not None
        assert match.pii_type.code == "SSN"


class TestDetectionResult:
    """Tests for DetectionResult dataclass."""

    def test_detection_result_creation(self):
        """Test creating a DetectionResult."""
        result = DetectionResult(
            text="Test text",
            matches=[],
            total_pii_count=0,
            pii_types_found=set(),
        )

        assert result.text == "Test text"
        assert result.matches == []
        assert result.total_pii_count == 0
        assert result.pii_types_found == set()

    def test_has_pii_false_when_empty(self):
        """Test has_pii is False when no PII found."""
        result = DetectionResult(
            text="No PII here",
            matches=[],
            total_pii_count=0,
            pii_types_found=set(),
        )

        assert result.has_pii is False

    def test_has_pii_true_when_pii_found(self):
        """Test has_pii is True when PII found."""
        match = PIIMatch(
            entity_type="PERSON",
            text="John",
            start=0,
            end=4,
            score=0.8,
        )
        result = DetectionResult(
            text="John is here",
            matches=[match],
            total_pii_count=1,
            pii_types_found={"PERSON"},
        )

        assert result.has_pii is True


class TestPIIDetector:
    """Tests for PIIDetector class."""

    def test_detector_initialization_without_spacy(self):
        """Test detector initializes without loading spaCy."""
        detector = PIIDetector(load_spacy_model=False)

        assert detector.language == "en"
        assert detector.score_threshold == 0.5
        assert detector.analyzer is None

    def test_detector_custom_threshold(self):
        """Test detector with custom threshold."""
        detector = PIIDetector(score_threshold=0.7, load_spacy_model=False)

        assert detector.score_threshold == 0.7

    def test_get_supported_entities(self):
        """Test getting supported entities list."""
        detector = PIIDetector(load_spacy_model=False)
        entities = detector.get_supported_entities()

        assert isinstance(entities, list)
        assert len(entities) > 0
        assert "PERSON" in entities
        assert "US_SSN" in entities
        assert "EMAIL_ADDRESS" in entities

    def test_presidio_entities_defined(self):
        """Test Presidio entities are defined."""
        assert len(PIIDetector.PRESIDIO_ENTITIES) > 0
        assert "PERSON" in PIIDetector.PRESIDIO_ENTITIES
        assert "EMAIL_ADDRESS" in PIIDetector.PRESIDIO_ENTITIES

    def test_custom_entities_defined(self):
        """Test custom entities are defined."""
        assert len(PIIDetector.CUSTOM_ENTITIES) > 0
        assert "US_PASSPORT" in PIIDetector.CUSTOM_ENTITIES
        assert "MEDICAL_RECORD" in PIIDetector.CUSTOM_ENTITIES

    def test_detect_empty_text(self):
        """Test detecting PII in empty text."""
        detector = PIIDetector(load_spacy_model=False)

        class MockAnalyzer:
            def analyze(self, **kwargs):  # noqa: ARG002
                return []

        detector.analyzer = MockAnalyzer()

        result = detector.detect("")

        assert result.total_pii_count == 0
        assert result.has_pii is False

    def test_detect_whitespace_only(self):
        """Test detecting PII in whitespace-only text."""
        detector = PIIDetector(load_spacy_model=False)

        result = detector.detect("   \n\t  ")

        assert result.total_pii_count == 0
        assert result.has_pii is False

    def test_detect_raises_without_analyzer(self):
        """Test detect raises error when analyzer not initialized."""
        detector = PIIDetector(load_spacy_model=False)

        with pytest.raises(RuntimeError):
            detector.detect("Some text with John Doe")


class TestPIIDetectorEntities:
    """Tests for PII detector entity coverage."""

    def test_all_presidio_entities_are_strings(self):
        """Test all Presidio entities are strings."""
        for entity in PIIDetector.PRESIDIO_ENTITIES:
            assert isinstance(entity, str)
            assert len(entity) > 0

    def test_all_custom_entities_are_strings(self):
        """Test all custom entities are strings."""
        for entity in PIIDetector.CUSTOM_ENTITIES:
            assert isinstance(entity, str)
            assert len(entity) > 0

    def test_no_duplicate_entities(self):
        """Test no duplicate entities between Presidio and custom."""
        all_entities = PIIDetector.PRESIDIO_ENTITIES + PIIDetector.CUSTOM_ENTITIES
        assert len(all_entities) == len(set(all_entities))

    def test_expected_presidio_entities(self):
        """Test expected Presidio entities are present."""
        expected = [
            "PERSON",
            "EMAIL_ADDRESS",
            "PHONE_NUMBER",
            "US_SSN",
            "CREDIT_CARD",
            "IP_ADDRESS",
        ]
        for entity in expected:
            assert entity in PIIDetector.PRESIDIO_ENTITIES

    def test_expected_custom_entities(self):
        """Test expected custom entities are present."""
        expected = [
            "US_PASSPORT",
            "STATE_ID",
            "MEDICAL_RECORD",
            "HEALTH_INSURANCE_ID",
            "EMPLOYEE_ID",
            "STUDENT_ID",
            "MILITARY_ID",
        ]
        for entity in expected:
            assert entity in PIIDetector.CUSTOM_ENTITIES
