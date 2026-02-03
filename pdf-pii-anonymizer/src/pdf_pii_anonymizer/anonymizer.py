"""
PII Anonymization module using Faker for realistic fake data generation.

Replaces detected PII with contextually appropriate fake data.
"""

from dataclasses import dataclass
from typing import Callable, Optional

from faker import Faker

from pdf_pii_anonymizer.detector import DetectionResult, PIIMatch


@dataclass
class AnonymizationResult:
    """Result of PII anonymization."""

    original_text: str
    anonymized_text: str
    replacements: list[dict]
    total_replacements: int


class PIIAnonymizer:
    """
    Anonymizes PII by replacing detected instances with realistic fake data.

    Uses Faker library to generate contextually appropriate replacement values
    for each PII type.
    """

    def __init__(self, locale: str = "en_US", seed: Optional[int] = None):
        """
        Initialize the anonymizer.

        Args:
            locale: Faker locale for generating region-appropriate fake data
            seed: Random seed for reproducible fake data generation
        """
        self.faker = Faker(locale)
        if seed is not None:
            Faker.seed(seed)
            self.faker.seed_instance(seed)

        self._replacement_generators = self._build_replacement_generators()

    def _build_replacement_generators(self) -> dict[str, Callable[[], str]]:
        """Build mapping of entity types to fake data generators."""
        return {
            "PERSON": lambda: self.faker.name(),
            "EMAIL_ADDRESS": lambda: self.faker.email(),
            "PHONE_NUMBER": lambda: self.faker.phone_number(),
            "US_SSN": lambda: self.faker.ssn(),
            "US_DRIVER_LICENSE": lambda: self._generate_drivers_license(),
            "CREDIT_CARD": lambda: self.faker.credit_card_number(),
            "US_BANK_NUMBER": lambda: self.faker.bban(),
            "US_ITIN": lambda: self._generate_itin(),
            "IP_ADDRESS": lambda: self.faker.ipv4(),
            "LOCATION": lambda: self.faker.city() + ", " + self.faker.state_abbr(),
            "DATE_TIME": lambda: self.faker.date(),
            "URL": lambda: self.faker.url(),
            "US_PASSPORT": lambda: self._generate_passport_number(),
            "STATE_ID": lambda: self._generate_state_id(),
            "MEDICAL_RECORD": lambda: f"MRN{self.faker.random_number(digits=8, fix_len=True)}",
            "HEALTH_INSURANCE_ID": lambda: self._generate_health_insurance_id(),
            "EMPLOYEE_ID": lambda: f"EMP{self.faker.random_number(digits=6, fix_len=True)}",
            "STUDENT_ID": lambda: f"STU{self.faker.random_number(digits=8, fix_len=True)}",
            "MILITARY_ID": lambda: str(self.faker.random_number(digits=10, fix_len=True)),
            "VEHICLE_REGISTRATION": lambda: self._generate_vin(),
            "LICENSE_PLATE": lambda: self.faker.license_plate(),
            "CREDENTIALS": lambda: "[REDACTED_CREDENTIALS]",
            "US_ADDRESS": lambda: self.faker.address().replace("\n", ", "),
            "DATE_OF_BIRTH": lambda: self.faker.date_of_birth(
                minimum_age=18, maximum_age=90
            ).strftime("%m/%d/%Y"),
            "MOTHERS_MAIDEN_NAME": lambda: self.faker.last_name(),
            "FINANCIAL_ACCOUNT": lambda: self.faker.bban(),
            "NRP": lambda: self.faker.country(),
            "MEDICAL_LICENSE": lambda: f"ML{self.faker.random_number(digits=8, fix_len=True)}",
            "IBAN_CODE": lambda: self.faker.iban(),
        }

    def _generate_drivers_license(self) -> str:
        """Generate a fake driver's license number."""
        prefix = self.faker.random_uppercase_letter()
        number = self.faker.random_number(digits=7, fix_len=True)
        return f"{prefix}{number}"

    def _generate_itin(self) -> str:
        """Generate a fake ITIN (Individual Taxpayer Identification Number)."""
        area = 9
        group = self.faker.random_int(min=70, max=99)
        serial = self.faker.random_number(digits=4, fix_len=True)
        return f"{area}{group:02d}-{serial}"

    def _generate_passport_number(self) -> str:
        """Generate a fake US passport number."""
        return str(self.faker.random_number(digits=9, fix_len=True))

    def _generate_state_id(self) -> str:
        """Generate a fake state ID number."""
        prefix = self.faker.random_uppercase_letter()
        number = self.faker.random_number(digits=8, fix_len=True)
        return f"{prefix}{number}"

    def _generate_health_insurance_id(self) -> str:
        """Generate a fake health insurance ID."""
        prefix = "".join(self.faker.random_uppercase_letter() for _ in range(3))
        number = self.faker.random_number(digits=10, fix_len=True)
        return f"{prefix}{number}"

    def _generate_vin(self) -> str:
        """Generate a fake VIN (Vehicle Identification Number)."""
        chars = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789"
        vin = "".join(self.faker.random_element(chars) for _ in range(17))
        return vin

    def anonymize(self, detection_result: DetectionResult) -> AnonymizationResult:
        """
        Anonymize all detected PII in the text.

        Args:
            detection_result: Result from PIIDetector.detect()

        Returns:
            AnonymizationResult with anonymized text and replacement details
        """
        if not detection_result.has_pii:
            return AnonymizationResult(
                original_text=detection_result.text,
                anonymized_text=detection_result.text,
                replacements=[],
                total_replacements=0,
            )

        sorted_matches = sorted(
            detection_result.matches, key=lambda m: m.start, reverse=True
        )

        anonymized_text = detection_result.text
        replacements = []

        for match in sorted_matches:
            fake_value = self._generate_replacement(match.entity_type)

            replacement_info = {
                "entity_type": match.entity_type,
                "original_value": match.text,
                "replacement_value": fake_value,
                "position": {"start": match.start, "end": match.end},
                "confidence_score": match.score,
            }
            replacements.append(replacement_info)

            anonymized_text = (
                anonymized_text[: match.start] + fake_value + anonymized_text[match.end :]
            )

        replacements.reverse()

        return AnonymizationResult(
            original_text=detection_result.text,
            anonymized_text=anonymized_text,
            replacements=replacements,
            total_replacements=len(replacements),
        )

    def _generate_replacement(self, entity_type: str) -> str:
        """
        Generate a fake replacement value for the given entity type.

        Args:
            entity_type: The type of PII entity

        Returns:
            Fake replacement value
        """
        generator = self._replacement_generators.get(entity_type)
        if generator:
            return generator()
        return f"[REDACTED_{entity_type}]"

    def anonymize_text(self, text: str, matches: list[PIIMatch]) -> str:
        """
        Anonymize text given a list of PII matches.

        Args:
            text: Original text
            matches: List of PIIMatch objects

        Returns:
            Anonymized text
        """
        if not matches:
            return text

        sorted_matches = sorted(matches, key=lambda m: m.start, reverse=True)
        result = text

        for match in sorted_matches:
            fake_value = self._generate_replacement(match.entity_type)
            result = result[: match.start] + fake_value + result[match.end :]

        return result

    def get_replacement_mapping(
        self, detection_result: DetectionResult
    ) -> dict[str, str]:
        """
        Get a mapping of original PII values to their replacements.

        Useful for consistent replacement across multiple documents.

        Args:
            detection_result: Result from PIIDetector.detect()

        Returns:
            Dictionary mapping original values to fake replacements
        """
        mapping = {}
        for match in detection_result.matches:
            if match.text not in mapping:
                mapping[match.text] = self._generate_replacement(match.entity_type)
        return mapping

    def anonymize_with_mapping(
        self, text: str, mapping: dict[str, str]
    ) -> str:
        """
        Anonymize text using a pre-defined replacement mapping.

        Args:
            text: Text to anonymize
            mapping: Dictionary mapping original values to replacements

        Returns:
            Anonymized text
        """
        result = text
        for original, replacement in sorted(
            mapping.items(), key=lambda x: len(x[0]), reverse=True
        ):
            result = result.replace(original, replacement)
        return result
