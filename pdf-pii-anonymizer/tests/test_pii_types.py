"""Tests for PII types definitions."""


from pdf_pii_anonymizer.pii_types import (
    PII_TYPE_MAP,
    PRESIDIO_ENTITY_MAP,
    US_PII_TYPES,
    PIICategory,
)


class TestPIITypes:
    """Tests for PII type definitions."""

    def test_has_27_pii_types(self):
        """Verify we have exactly 27 US PII types defined."""
        assert len(US_PII_TYPES) == 27

    def test_all_types_have_required_fields(self):
        """Verify all PII types have required fields."""
        for pii_type in US_PII_TYPES:
            assert pii_type.name, f"Missing name for {pii_type.code}"
            assert pii_type.code, "Missing code"
            assert pii_type.category, f"Missing category for {pii_type.code}"
            assert pii_type.description, f"Missing description for {pii_type.code}"
            assert isinstance(pii_type.category, PIICategory)

    def test_unique_codes(self):
        """Verify all PII type codes are unique."""
        codes = [pii.code for pii in US_PII_TYPES]
        assert len(codes) == len(set(codes)), "Duplicate PII type codes found"

    def test_pii_type_map_contains_all_types(self):
        """Verify PII_TYPE_MAP contains all types."""
        assert len(PII_TYPE_MAP) == 27
        for pii_type in US_PII_TYPES:
            assert pii_type.code in PII_TYPE_MAP
            assert PII_TYPE_MAP[pii_type.code] == pii_type

    def test_categories_are_valid(self):
        """Verify all categories are valid PIICategory enum values."""
        valid_categories = set(PIICategory)
        for pii_type in US_PII_TYPES:
            assert pii_type.category in valid_categories

    def test_expected_pii_types_present(self):
        """Verify expected PII types are present."""
        expected_codes = [
            "SSN",
            "DRIVERS_LICENSE",
            "PASSPORT",
            "STATE_ID",
            "ITIN",
            "BANK_ACCOUNT",
            "CREDIT_CARD",
            "DEBIT_CARD",
            "FINANCIAL_ACCOUNT",
            "PERSON_NAME",
            "DATE_OF_BIRTH",
            "PLACE_OF_BIRTH",
            "MOTHERS_MAIDEN_NAME",
            "EMAIL",
            "PHONE",
            "ADDRESS",
            "IP_ADDRESS",
            "MEDICAL_RECORD",
            "HEALTH_INSURANCE_ID",
            "BIOMETRIC",
            "VEHICLE_REGISTRATION",
            "LICENSE_PLATE",
            "DIGITAL_SIGNATURE",
            "CREDENTIALS",
            "EMPLOYEE_ID",
            "STUDENT_ID",
            "MILITARY_ID",
        ]
        actual_codes = [pii.code for pii in US_PII_TYPES]
        for code in expected_codes:
            assert code in actual_codes, f"Missing expected PII type: {code}"

    def test_presidio_entity_map(self):
        """Verify Presidio entity mapping is correct."""
        for pii_type in US_PII_TYPES:
            if pii_type.presidio_entity:
                assert pii_type.presidio_entity in PRESIDIO_ENTITY_MAP

    def test_government_id_category(self):
        """Verify government ID types are categorized correctly."""
        gov_id_codes = ["SSN", "DRIVERS_LICENSE", "PASSPORT", "STATE_ID", "ITIN"]
        for code in gov_id_codes:
            pii_type = PII_TYPE_MAP[code]
            assert pii_type.category == PIICategory.GOVERNMENT_ID

    def test_financial_category(self):
        """Verify financial types are categorized correctly."""
        financial_codes = ["BANK_ACCOUNT", "CREDIT_CARD", "DEBIT_CARD", "FINANCIAL_ACCOUNT"]
        for code in financial_codes:
            pii_type = PII_TYPE_MAP[code]
            assert pii_type.category == PIICategory.FINANCIAL

    def test_contact_category(self):
        """Verify contact types are categorized correctly."""
        contact_codes = ["EMAIL", "PHONE", "ADDRESS"]
        for code in contact_codes:
            pii_type = PII_TYPE_MAP[code]
            assert pii_type.category == PIICategory.CONTACT
