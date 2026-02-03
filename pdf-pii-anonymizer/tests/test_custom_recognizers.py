"""Tests for custom PII recognizers."""

import pytest

from pdf_pii_anonymizer.custom_recognizers import (
    CredentialsRecognizer,
    DateOfBirthRecognizer,
    EmployeeIDRecognizer,
    FinancialAccountRecognizer,
    HealthInsuranceIDRecognizer,
    LicensePlateRecognizer,
    MedicalRecordRecognizer,
    MilitaryIDRecognizer,
    MothersMaidenNameRecognizer,
    StudentIDRecognizer,
    USAddressRecognizer,
    USPassportRecognizer,
    VehicleRegistrationRecognizer,
    get_all_custom_recognizers,
)


class TestCustomRecognizers:
    """Tests for custom PII recognizers."""

    def test_get_all_custom_recognizers_returns_list(self):
        """Test that get_all_custom_recognizers returns a list."""
        recognizers = get_all_custom_recognizers()
        assert isinstance(recognizers, list)
        assert len(recognizers) == 14

    def test_all_recognizers_have_supported_entity(self):
        """Test all recognizers have a supported entity."""
        recognizers = get_all_custom_recognizers()
        for recognizer in recognizers:
            assert recognizer.supported_entities is not None
            assert len(recognizer.supported_entities) > 0

    def test_all_recognizers_have_patterns(self):
        """Test all recognizers have patterns defined."""
        recognizers = get_all_custom_recognizers()
        for recognizer in recognizers:
            assert recognizer.patterns is not None
            assert len(recognizer.patterns) > 0

    def test_all_recognizers_have_context(self):
        """Test all recognizers have context words."""
        recognizers = get_all_custom_recognizers()
        for recognizer in recognizers:
            assert recognizer.context is not None
            assert len(recognizer.context) > 0


class TestUSPassportRecognizer:
    """Tests for US Passport recognizer."""

    @pytest.fixture
    def recognizer(self):
        return USPassportRecognizer()

    def test_supported_entity(self, recognizer):
        assert "US_PASSPORT" in recognizer.supported_entities

    def test_has_patterns(self, recognizer):
        assert len(recognizer.patterns) > 0

    def test_has_context(self, recognizer):
        assert "passport" in recognizer.context


class TestMedicalRecordRecognizer:
    """Tests for Medical Record recognizer."""

    @pytest.fixture
    def recognizer(self):
        return MedicalRecordRecognizer()

    def test_supported_entity(self, recognizer):
        assert "MEDICAL_RECORD" in recognizer.supported_entities

    def test_has_medical_context(self, recognizer):
        assert "mrn" in recognizer.context
        assert "medical record" in recognizer.context


class TestHealthInsuranceIDRecognizer:
    """Tests for Health Insurance ID recognizer."""

    @pytest.fixture
    def recognizer(self):
        return HealthInsuranceIDRecognizer()

    def test_supported_entity(self, recognizer):
        assert "HEALTH_INSURANCE_ID" in recognizer.supported_entities

    def test_has_insurance_context(self, recognizer):
        assert "insurance" in recognizer.context
        assert "member id" in recognizer.context


class TestEmployeeIDRecognizer:
    """Tests for Employee ID recognizer."""

    @pytest.fixture
    def recognizer(self):
        return EmployeeIDRecognizer()

    def test_supported_entity(self, recognizer):
        assert "EMPLOYEE_ID" in recognizer.supported_entities

    def test_has_employee_context(self, recognizer):
        assert "employee" in recognizer.context


class TestStudentIDRecognizer:
    """Tests for Student ID recognizer."""

    @pytest.fixture
    def recognizer(self):
        return StudentIDRecognizer()

    def test_supported_entity(self, recognizer):
        assert "STUDENT_ID" in recognizer.supported_entities

    def test_has_student_context(self, recognizer):
        assert "student" in recognizer.context
        assert "university" in recognizer.context


class TestMilitaryIDRecognizer:
    """Tests for Military ID recognizer."""

    @pytest.fixture
    def recognizer(self):
        return MilitaryIDRecognizer()

    def test_supported_entity(self, recognizer):
        assert "MILITARY_ID" in recognizer.supported_entities

    def test_has_military_context(self, recognizer):
        assert "military" in recognizer.context
        assert "dod" in recognizer.context


class TestVehicleRegistrationRecognizer:
    """Tests for Vehicle Registration recognizer."""

    @pytest.fixture
    def recognizer(self):
        return VehicleRegistrationRecognizer()

    def test_supported_entity(self, recognizer):
        assert "VEHICLE_REGISTRATION" in recognizer.supported_entities

    def test_has_vehicle_context(self, recognizer):
        assert "vin" in recognizer.context
        assert "vehicle identification" in recognizer.context


class TestLicensePlateRecognizer:
    """Tests for License Plate recognizer."""

    @pytest.fixture
    def recognizer(self):
        return LicensePlateRecognizer()

    def test_supported_entity(self, recognizer):
        assert "LICENSE_PLATE" in recognizer.supported_entities

    def test_has_plate_context(self, recognizer):
        assert "license plate" in recognizer.context


class TestCredentialsRecognizer:
    """Tests for Credentials recognizer."""

    @pytest.fixture
    def recognizer(self):
        return CredentialsRecognizer()

    def test_supported_entity(self, recognizer):
        assert "CREDENTIALS" in recognizer.supported_entities

    def test_has_credentials_context(self, recognizer):
        assert "password" in recognizer.context
        assert "username" in recognizer.context


class TestUSAddressRecognizer:
    """Tests for US Address recognizer."""

    @pytest.fixture
    def recognizer(self):
        return USAddressRecognizer()

    def test_supported_entity(self, recognizer):
        assert "US_ADDRESS" in recognizer.supported_entities

    def test_has_address_context(self, recognizer):
        assert "address" in recognizer.context
        assert "street" in recognizer.context


class TestDateOfBirthRecognizer:
    """Tests for Date of Birth recognizer."""

    @pytest.fixture
    def recognizer(self):
        return DateOfBirthRecognizer()

    def test_supported_entity(self, recognizer):
        assert "DATE_OF_BIRTH" in recognizer.supported_entities

    def test_has_dob_context(self, recognizer):
        assert "dob" in recognizer.context
        assert "date of birth" in recognizer.context


class TestMothersMaidenNameRecognizer:
    """Tests for Mother's Maiden Name recognizer."""

    @pytest.fixture
    def recognizer(self):
        return MothersMaidenNameRecognizer()

    def test_supported_entity(self, recognizer):
        assert "MOTHERS_MAIDEN_NAME" in recognizer.supported_entities

    def test_has_maiden_context(self, recognizer):
        assert "maiden name" in recognizer.context


class TestFinancialAccountRecognizer:
    """Tests for Financial Account recognizer."""

    @pytest.fixture
    def recognizer(self):
        return FinancialAccountRecognizer()

    def test_supported_entity(self, recognizer):
        assert "FINANCIAL_ACCOUNT" in recognizer.supported_entities

    def test_has_financial_context(self, recognizer):
        assert "account" in recognizer.context
        assert "bank" in recognizer.context
