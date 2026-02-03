"""
US PII Types - Definitions for all 27 types of Personally Identifiable Information.

Based on US privacy standards including NIST SP 800-122, HIPAA, CCPA, and other regulations.
"""

from dataclasses import dataclass
from enum import Enum
from typing import Optional


class PIICategory(Enum):
    """Categories of PII based on sensitivity and type."""

    GOVERNMENT_ID = "government_id"
    FINANCIAL = "financial"
    PERSONAL = "personal"
    CONTACT = "contact"
    MEDICAL = "medical"
    DIGITAL = "digital"
    VEHICLE = "vehicle"
    EMPLOYMENT = "employment"
    EDUCATION = "education"
    MILITARY = "military"


@dataclass
class PIIType:
    """Definition of a PII type with metadata."""

    name: str
    code: str
    category: PIICategory
    description: str
    regex_pattern: Optional[str] = None
    presidio_entity: Optional[str] = None
    requires_custom_recognizer: bool = False


US_PII_TYPES: list[PIIType] = [
    PIIType(
        name="Social Security Number",
        code="SSN",
        category=PIICategory.GOVERNMENT_ID,
        description="9-digit US Social Security Number",
        regex_pattern=r"\b(?!000|666|9\d{2})\d{3}[-\s]?(?!00)\d{2}[-\s]?(?!0000)\d{4}\b",
        presidio_entity="US_SSN",
    ),
    PIIType(
        name="Driver's License Number",
        code="DRIVERS_LICENSE",
        category=PIICategory.GOVERNMENT_ID,
        description="State-issued driver's license number",
        presidio_entity="US_DRIVER_LICENSE",
    ),
    PIIType(
        name="Passport Number",
        code="PASSPORT",
        category=PIICategory.GOVERNMENT_ID,
        description="US Passport number",
        regex_pattern=r"\b[A-Z]?\d{8,9}\b",
        presidio_entity="US_PASSPORT",
        requires_custom_recognizer=True,
    ),
    PIIType(
        name="State ID Number",
        code="STATE_ID",
        category=PIICategory.GOVERNMENT_ID,
        description="State-issued identification number",
        requires_custom_recognizer=True,
    ),
    PIIType(
        name="Individual Taxpayer Identification Number",
        code="ITIN",
        category=PIICategory.GOVERNMENT_ID,
        description="IRS-issued ITIN for tax processing",
        regex_pattern=r"\b9\d{2}[-\s]?[7-9]\d[-\s]?\d{4}\b",
        presidio_entity="US_ITIN",
    ),
    PIIType(
        name="Bank Account Number",
        code="BANK_ACCOUNT",
        category=PIICategory.FINANCIAL,
        description="Bank account number",
        regex_pattern=r"\b\d{8,17}\b",
        presidio_entity="US_BANK_NUMBER",
    ),
    PIIType(
        name="Credit Card Number",
        code="CREDIT_CARD",
        category=PIICategory.FINANCIAL,
        description="Credit card number (Visa, MasterCard, Amex, etc.)",
        presidio_entity="CREDIT_CARD",
    ),
    PIIType(
        name="Debit Card Number",
        code="DEBIT_CARD",
        category=PIICategory.FINANCIAL,
        description="Debit card number",
        presidio_entity="CREDIT_CARD",
    ),
    PIIType(
        name="Financial Account Number",
        code="FINANCIAL_ACCOUNT",
        category=PIICategory.FINANCIAL,
        description="Generic financial account number (brokerage, investment, etc.)",
        regex_pattern=r"\b[A-Z]{0,3}\d{6,12}\b",
        requires_custom_recognizer=True,
    ),
    PIIType(
        name="Full Name",
        code="PERSON_NAME",
        category=PIICategory.PERSONAL,
        description="Full legal name (first, middle, last)",
        presidio_entity="PERSON",
    ),
    PIIType(
        name="Date of Birth",
        code="DATE_OF_BIRTH",
        category=PIICategory.PERSONAL,
        description="Date of birth in various formats",
        presidio_entity="DATE_TIME",
        requires_custom_recognizer=True,
    ),
    PIIType(
        name="Place of Birth",
        code="PLACE_OF_BIRTH",
        category=PIICategory.PERSONAL,
        description="City/state/country of birth",
        presidio_entity="LOCATION",
        requires_custom_recognizer=True,
    ),
    PIIType(
        name="Mother's Maiden Name",
        code="MOTHERS_MAIDEN_NAME",
        category=PIICategory.PERSONAL,
        description="Mother's maiden name (security question)",
        requires_custom_recognizer=True,
    ),
    PIIType(
        name="Email Address",
        code="EMAIL",
        category=PIICategory.CONTACT,
        description="Email address",
        presidio_entity="EMAIL_ADDRESS",
    ),
    PIIType(
        name="Phone Number",
        code="PHONE",
        category=PIICategory.CONTACT,
        description="Phone number (mobile, home, work)",
        presidio_entity="PHONE_NUMBER",
    ),
    PIIType(
        name="Physical Address",
        code="ADDRESS",
        category=PIICategory.CONTACT,
        description="Street address, city, state, ZIP code",
        presidio_entity="LOCATION",
        requires_custom_recognizer=True,
    ),
    PIIType(
        name="IP Address",
        code="IP_ADDRESS",
        category=PIICategory.DIGITAL,
        description="IPv4 or IPv6 address",
        presidio_entity="IP_ADDRESS",
    ),
    PIIType(
        name="Medical Record Number",
        code="MEDICAL_RECORD",
        category=PIICategory.MEDICAL,
        description="Hospital/clinic medical record number",
        regex_pattern=r"\b(?:MRN|MR#?|Medical Record)[:\s#]*\d{6,12}\b",
        presidio_entity="MEDICAL_LICENSE",
        requires_custom_recognizer=True,
    ),
    PIIType(
        name="Health Insurance ID",
        code="HEALTH_INSURANCE_ID",
        category=PIICategory.MEDICAL,
        description="Health insurance policy/member ID",
        regex_pattern=r"\b[A-Z]{3}\d{9,12}\b",
        requires_custom_recognizer=True,
    ),
    PIIType(
        name="Biometric Data",
        code="BIOMETRIC",
        category=PIICategory.PERSONAL,
        description="Fingerprint, facial recognition, retina scan data",
        requires_custom_recognizer=True,
    ),
    PIIType(
        name="Vehicle Registration Number",
        code="VEHICLE_REGISTRATION",
        category=PIICategory.VEHICLE,
        description="Vehicle registration/title number",
        regex_pattern=r"\b[A-Z0-9]{6,17}\b",
        requires_custom_recognizer=True,
    ),
    PIIType(
        name="License Plate Number",
        code="LICENSE_PLATE",
        category=PIICategory.VEHICLE,
        description="Vehicle license plate number",
        regex_pattern=r"\b[A-Z0-9]{2,8}\b",
        requires_custom_recognizer=True,
    ),
    PIIType(
        name="Digital Signature",
        code="DIGITAL_SIGNATURE",
        category=PIICategory.DIGITAL,
        description="Electronic/digital signature",
        requires_custom_recognizer=True,
    ),
    PIIType(
        name="Username/Password",
        code="CREDENTIALS",
        category=PIICategory.DIGITAL,
        description="Login credentials",
        regex_pattern=r"(?:password|pwd|pass)[:\s]*[^\s]+",
        requires_custom_recognizer=True,
    ),
    PIIType(
        name="Employee ID",
        code="EMPLOYEE_ID",
        category=PIICategory.EMPLOYMENT,
        description="Employer-assigned employee identification number",
        regex_pattern=r"\b(?:EMP|Employee)[:\s#]*\d{4,10}\b",
        requires_custom_recognizer=True,
    ),
    PIIType(
        name="Student ID",
        code="STUDENT_ID",
        category=PIICategory.EDUCATION,
        description="School/university student identification number",
        regex_pattern=r"\b(?:Student|SID)[:\s#]*\d{5,12}\b",
        requires_custom_recognizer=True,
    ),
    PIIType(
        name="Military ID",
        code="MILITARY_ID",
        category=PIICategory.MILITARY,
        description="Military service identification number (DoD ID)",
        regex_pattern=r"\b\d{10}\b",
        requires_custom_recognizer=True,
    ),
]

PII_TYPE_MAP: dict[str, PIIType] = {pii.code: pii for pii in US_PII_TYPES}

PRESIDIO_ENTITY_MAP: dict[str, str] = {
    pii.presidio_entity: pii.code
    for pii in US_PII_TYPES
    if pii.presidio_entity
}
