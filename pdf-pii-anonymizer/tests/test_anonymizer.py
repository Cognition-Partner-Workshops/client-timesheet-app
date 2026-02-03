"""Tests for PII Anonymizer."""

import pytest

from pdf_pii_anonymizer.anonymizer import AnonymizationResult, PIIAnonymizer
from pdf_pii_anonymizer.detector import DetectionResult, PIIMatch


class TestPIIAnonymizer:
    """Tests for PIIAnonymizer class."""

    @pytest.fixture
    def anonymizer(self):
        """Create anonymizer with fixed seed for reproducibility."""
        return PIIAnonymizer(seed=42)

    @pytest.fixture
    def sample_detection_result(self):
        """Create a sample detection result."""
        text = "John Doe's SSN is 123-45-6789 and email is john@example.com"
        matches = [
            PIIMatch(
                entity_type="PERSON",
                text="John Doe",
                start=0,
                end=8,
                score=0.85,
            ),
            PIIMatch(
                entity_type="US_SSN",
                text="123-45-6789",
                start=18,
                end=29,
                score=0.95,
            ),
            PIIMatch(
                entity_type="EMAIL_ADDRESS",
                text="john@example.com",
                start=44,
                end=60,
                score=0.99,
            ),
        ]
        return DetectionResult(
            text=text,
            matches=matches,
            total_pii_count=3,
            pii_types_found={"PERSON", "US_SSN", "EMAIL_ADDRESS"},
        )

    def test_anonymizer_initialization(self, anonymizer):
        """Test anonymizer initializes correctly."""
        assert anonymizer.faker is not None
        assert len(anonymizer._replacement_generators) > 0

    def test_anonymizer_with_seed_is_reproducible(self):
        """Test that using a seed produces reproducible results."""
        anon1 = PIIAnonymizer(seed=123)
        anon2 = PIIAnonymizer(seed=123)

        result1 = anon1._generate_replacement("PERSON")
        result2 = anon2._generate_replacement("PERSON")

        assert result1 == result2

    def test_anonymize_empty_result(self, anonymizer):
        """Test anonymizing empty detection result."""
        empty_result = DetectionResult(
            text="No PII here",
            matches=[],
            total_pii_count=0,
            pii_types_found=set(),
        )

        result = anonymizer.anonymize(empty_result)

        assert result.original_text == "No PII here"
        assert result.anonymized_text == "No PII here"
        assert result.total_replacements == 0
        assert len(result.replacements) == 0

    def test_anonymize_with_pii(self, anonymizer, sample_detection_result):
        """Test anonymizing text with PII."""
        result = anonymizer.anonymize(sample_detection_result)

        assert isinstance(result, AnonymizationResult)
        assert result.original_text == sample_detection_result.text
        assert result.anonymized_text != sample_detection_result.text
        assert result.total_replacements == 3
        assert len(result.replacements) == 3

        assert "John Doe" not in result.anonymized_text
        assert "123-45-6789" not in result.anonymized_text
        assert "john@example.com" not in result.anonymized_text

    def test_replacement_generators_exist_for_common_types(self, anonymizer):
        """Test that replacement generators exist for common PII types."""
        common_types = [
            "PERSON",
            "EMAIL_ADDRESS",
            "PHONE_NUMBER",
            "US_SSN",
            "CREDIT_CARD",
            "US_BANK_NUMBER",
            "IP_ADDRESS",
        ]

        for entity_type in common_types:
            assert entity_type in anonymizer._replacement_generators
            replacement = anonymizer._generate_replacement(entity_type)
            assert replacement is not None
            assert len(replacement) > 0

    def test_unknown_entity_type_fallback(self, anonymizer):
        """Test fallback for unknown entity types."""
        replacement = anonymizer._generate_replacement("UNKNOWN_TYPE")
        assert replacement == "[REDACTED_UNKNOWN_TYPE]"

    def test_generate_drivers_license(self, anonymizer):
        """Test driver's license generation."""
        dl = anonymizer._generate_drivers_license()
        assert len(dl) == 8
        assert dl[0].isalpha()
        assert dl[1:].isdigit()

    def test_generate_itin(self, anonymizer):
        """Test ITIN generation."""
        itin = anonymizer._generate_itin()
        assert itin.startswith("9")
        assert "-" in itin

    def test_generate_passport_number(self, anonymizer):
        """Test passport number generation."""
        passport = anonymizer._generate_passport_number()
        assert len(passport) == 9
        assert passport.isdigit()

    def test_generate_vin(self, anonymizer):
        """Test VIN generation."""
        vin = anonymizer._generate_vin()
        assert len(vin) == 17
        assert vin.isalnum()

    def test_anonymize_text_method(self, anonymizer):
        """Test anonymize_text method."""
        text = "Contact John at john@test.com"
        matches = [
            PIIMatch(
                entity_type="PERSON",
                text="John",
                start=8,
                end=12,
                score=0.8,
            ),
            PIIMatch(
                entity_type="EMAIL_ADDRESS",
                text="john@test.com",
                start=16,
                end=29,
                score=0.95,
            ),
        ]

        result = anonymizer.anonymize_text(text, matches)

        assert "John" not in result
        assert "john@test.com" not in result

    def test_anonymize_text_empty_matches(self, anonymizer):
        """Test anonymize_text with no matches."""
        text = "No PII here"
        result = anonymizer.anonymize_text(text, [])
        assert result == text

    def test_get_replacement_mapping(self, anonymizer, sample_detection_result):
        """Test getting replacement mapping."""
        mapping = anonymizer.get_replacement_mapping(sample_detection_result)

        assert len(mapping) == 3
        assert "John Doe" in mapping
        assert "123-45-6789" in mapping
        assert "john@example.com" in mapping

    def test_anonymize_with_mapping(self, anonymizer):
        """Test anonymizing with pre-defined mapping."""
        text = "John Doe and John Doe again"
        mapping = {"John Doe": "Jane Smith"}

        result = anonymizer.anonymize_with_mapping(text, mapping)

        assert result == "Jane Smith and Jane Smith again"
        assert "John Doe" not in result

    def test_replacement_info_structure(self, anonymizer, sample_detection_result):
        """Test structure of replacement info."""
        result = anonymizer.anonymize(sample_detection_result)

        for replacement in result.replacements:
            assert "entity_type" in replacement
            assert "original_value" in replacement
            assert "replacement_value" in replacement
            assert "position" in replacement
            assert "confidence_score" in replacement
            assert "start" in replacement["position"]
            assert "end" in replacement["position"]

    def test_ssn_replacement_format(self, anonymizer):
        """Test SSN replacement generates valid format."""
        ssn = anonymizer._generate_replacement("US_SSN")
        assert ssn is not None
        parts = ssn.replace("-", "")
        assert len(parts) >= 9

    def test_email_replacement_format(self, anonymizer):
        """Test email replacement generates valid format."""
        email = anonymizer._generate_replacement("EMAIL_ADDRESS")
        assert "@" in email
        assert "." in email

    def test_phone_replacement_format(self, anonymizer):
        """Test phone replacement generates value."""
        phone = anonymizer._generate_replacement("PHONE_NUMBER")
        assert phone is not None
        assert len(phone) > 0

    def test_credit_card_replacement(self, anonymizer):
        """Test credit card replacement generates numeric value."""
        cc = anonymizer._generate_replacement("CREDIT_CARD")
        assert cc is not None
        cc_digits = "".join(c for c in cc if c.isdigit())
        assert len(cc_digits) >= 13
