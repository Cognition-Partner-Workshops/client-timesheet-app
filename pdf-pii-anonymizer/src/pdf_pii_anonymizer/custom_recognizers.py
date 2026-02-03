"""
Custom PII recognizers for types not covered by default Presidio entities.

Implements pattern-based and context-aware recognizers for specialized US PII types.
"""


from presidio_analyzer import Pattern, PatternRecognizer


class USPassportRecognizer(PatternRecognizer):
    """Recognizer for US Passport numbers."""

    PATTERNS = [
        Pattern(
            "US_PASSPORT_PATTERN",
            r"\b[A-Z]?\d{8,9}\b",
            0.3,
        ),
    ]

    CONTEXT = [
        "passport",
        "passport number",
        "passport no",
        "passport #",
        "travel document",
    ]

    def __init__(self):
        super().__init__(
            supported_entity="US_PASSPORT",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="en",
        )


class StateIDRecognizer(PatternRecognizer):
    """Recognizer for State ID numbers (varies by state)."""

    PATTERNS = [
        Pattern("STATE_ID_ALPHA_NUM", r"\b[A-Z]{1,2}\d{6,8}\b", 0.3),
        Pattern("STATE_ID_NUM", r"\b\d{7,12}\b", 0.2),
    ]

    CONTEXT = [
        "state id",
        "state identification",
        "id number",
        "identification number",
        "id card",
        "state issued",
    ]

    def __init__(self):
        super().__init__(
            supported_entity="STATE_ID",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="en",
        )


class MedicalRecordRecognizer(PatternRecognizer):
    """Recognizer for Medical Record Numbers (MRN)."""

    PATTERNS = [
        Pattern(
            "MRN_LABELED",
            r"(?:MRN|MR#?|Medical Record|Patient ID)[:\s#]*(\d{6,12})",
            0.85,
        ),
        Pattern("MRN_NUMERIC", r"\b\d{6,10}\b", 0.1),
    ]

    CONTEXT = [
        "mrn",
        "medical record",
        "patient id",
        "patient number",
        "chart number",
        "hospital",
        "clinic",
        "healthcare",
        "medical",
    ]

    def __init__(self):
        super().__init__(
            supported_entity="MEDICAL_RECORD",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="en",
        )


class HealthInsuranceIDRecognizer(PatternRecognizer):
    """Recognizer for Health Insurance IDs."""

    PATTERNS = [
        Pattern("INSURANCE_ID_ALPHA", r"\b[A-Z]{3}\d{9,12}\b", 0.6),
        Pattern("INSURANCE_ID_MIXED", r"\b[A-Z0-9]{10,15}\b", 0.3),
    ]

    CONTEXT = [
        "insurance",
        "member id",
        "policy number",
        "subscriber id",
        "group number",
        "health plan",
        "coverage",
        "beneficiary",
    ]

    def __init__(self):
        super().__init__(
            supported_entity="HEALTH_INSURANCE_ID",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="en",
        )


class EmployeeIDRecognizer(PatternRecognizer):
    """Recognizer for Employee ID numbers."""

    PATTERNS = [
        Pattern(
            "EMP_ID_LABELED",
            r"(?:EMP|Employee|Staff|Worker)[:\s#]*(\d{4,10})",
            0.85,
        ),
        Pattern("EMP_ID_PREFIX", r"\bEMP\d{4,8}\b", 0.7),
    ]

    CONTEXT = [
        "employee",
        "emp id",
        "staff id",
        "worker id",
        "badge number",
        "personnel",
        "hr",
        "payroll",
    ]

    def __init__(self):
        super().__init__(
            supported_entity="EMPLOYEE_ID",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="en",
        )


class StudentIDRecognizer(PatternRecognizer):
    """Recognizer for Student ID numbers."""

    PATTERNS = [
        Pattern(
            "STUDENT_ID_LABELED",
            r"(?:Student|SID|Student ID)[:\s#]*(\d{5,12})",
            0.85,
        ),
        Pattern("STUDENT_ID_PREFIX", r"\b[A-Z]{1,3}\d{6,10}\b", 0.4),
    ]

    CONTEXT = [
        "student",
        "student id",
        "sid",
        "university",
        "college",
        "school",
        "enrollment",
        "academic",
    ]

    def __init__(self):
        super().__init__(
            supported_entity="STUDENT_ID",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="en",
        )


class MilitaryIDRecognizer(PatternRecognizer):
    """Recognizer for Military ID numbers (DoD ID)."""

    PATTERNS = [
        Pattern("DOD_ID", r"\b\d{10}\b", 0.3),
        Pattern(
            "MILITARY_ID_LABELED",
            r"(?:DoD|Military|Service)[:\s#]*(\d{10})",
            0.85,
        ),
    ]

    CONTEXT = [
        "military",
        "dod",
        "department of defense",
        "service member",
        "veteran",
        "armed forces",
        "army",
        "navy",
        "air force",
        "marines",
        "coast guard",
    ]

    def __init__(self):
        super().__init__(
            supported_entity="MILITARY_ID",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="en",
        )


class VehicleRegistrationRecognizer(PatternRecognizer):
    """Recognizer for Vehicle Registration/VIN numbers."""

    PATTERNS = [
        Pattern(
            "VIN",
            r"\b[A-HJ-NPR-Z0-9]{17}\b",
            0.85,
        ),
        Pattern(
            "REGISTRATION_LABELED",
            r"(?:VIN|Vehicle|Registration)[:\s#]*([A-Z0-9]{6,17})",
            0.7,
        ),
    ]

    CONTEXT = [
        "vin",
        "vehicle identification",
        "registration",
        "title",
        "automobile",
        "car",
        "truck",
        "motorcycle",
    ]

    def __init__(self):
        super().__init__(
            supported_entity="VEHICLE_REGISTRATION",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="en",
        )


class LicensePlateRecognizer(PatternRecognizer):
    """Recognizer for License Plate numbers."""

    PATTERNS = [
        Pattern(
            "LICENSE_PLATE_STANDARD",
            r"\b[A-Z0-9]{1,3}[-\s]?[A-Z0-9]{2,4}[-\s]?[A-Z0-9]{1,4}\b",
            0.4,
        ),
        Pattern(
            "LICENSE_PLATE_LABELED",
            r"(?:License Plate|Plate|Tag)[:\s#]*([A-Z0-9]{2,8})",
            0.8,
        ),
    ]

    CONTEXT = [
        "license plate",
        "plate number",
        "tag",
        "vehicle plate",
        "registration plate",
    ]

    def __init__(self):
        super().__init__(
            supported_entity="LICENSE_PLATE",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="en",
        )


class CredentialsRecognizer(PatternRecognizer):
    """Recognizer for usernames and passwords."""

    PATTERNS = [
        Pattern(
            "PASSWORD_LABELED",
            r"(?:password|pwd|pass|passcode)[:\s]*[^\s]{4,}",
            0.9,
        ),
        Pattern(
            "USERNAME_LABELED",
            r"(?:username|user|login|userid)[:\s]*[^\s]{3,}",
            0.7,
        ),
    ]

    CONTEXT = [
        "password",
        "username",
        "login",
        "credentials",
        "authentication",
        "sign in",
        "log in",
    ]

    def __init__(self):
        super().__init__(
            supported_entity="CREDENTIALS",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="en",
        )


class USAddressRecognizer(PatternRecognizer):
    """Recognizer for US physical addresses."""

    PATTERNS = [
        Pattern(
            "US_ADDRESS_FULL",
            r"\d{1,5}\s+[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Circle|Cir|Place|Pl)\.?(?:\s+(?:Apt|Suite|Unit|#)\s*\d+)?(?:,?\s+[\w\s]+,?\s+[A-Z]{2}\s+\d{5}(?:-\d{4})?)?",
            0.85,
        ),
        Pattern(
            "ZIP_CODE",
            r"\b\d{5}(?:-\d{4})?\b",
            0.3,
        ),
    ]

    CONTEXT = [
        "address",
        "street",
        "avenue",
        "road",
        "city",
        "state",
        "zip",
        "postal",
        "mailing",
        "residence",
        "home",
        "office",
    ]

    def __init__(self):
        super().__init__(
            supported_entity="US_ADDRESS",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="en",
        )


class DateOfBirthRecognizer(PatternRecognizer):
    """Recognizer for Date of Birth with context awareness."""

    PATTERNS = [
        Pattern(
            "DOB_MDY",
            r"\b(?:0?[1-9]|1[0-2])[/\-](?:0?[1-9]|[12]\d|3[01])[/\-](?:19|20)\d{2}\b",
            0.5,
        ),
        Pattern(
            "DOB_DMY",
            r"\b(?:0?[1-9]|[12]\d|3[01])[/\-](?:0?[1-9]|1[0-2])[/\-](?:19|20)\d{2}\b",
            0.5,
        ),
        Pattern(
            "DOB_WRITTEN",
            r"\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b",
            0.6,
        ),
    ]

    CONTEXT = [
        "dob",
        "date of birth",
        "birth date",
        "birthday",
        "born",
        "birthdate",
        "d.o.b",
    ]

    def __init__(self):
        super().__init__(
            supported_entity="DATE_OF_BIRTH",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="en",
        )


class MothersMaidenNameRecognizer(PatternRecognizer):
    """Recognizer for Mother's Maiden Name (security question context)."""

    PATTERNS = [
        Pattern(
            "MAIDEN_NAME_LABELED",
            r"(?:mother'?s?\s+maiden\s+name|maiden\s+name)[:\s]*([A-Z][a-z]+)",
            0.9,
        ),
    ]

    CONTEXT = [
        "maiden name",
        "mother's maiden",
        "security question",
        "verification",
    ]

    def __init__(self):
        super().__init__(
            supported_entity="MOTHERS_MAIDEN_NAME",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="en",
        )


class FinancialAccountRecognizer(PatternRecognizer):
    """Recognizer for generic financial account numbers."""

    PATTERNS = [
        Pattern(
            "ACCOUNT_LABELED",
            r"(?:account|acct|a/c)[:\s#]*(\d{6,17})",
            0.8,
        ),
        Pattern(
            "ROUTING_NUMBER",
            r"\b\d{9}\b",
            0.3,
        ),
    ]

    CONTEXT = [
        "account",
        "routing",
        "bank",
        "financial",
        "brokerage",
        "investment",
        "savings",
        "checking",
        "wire",
        "transfer",
    ]

    def __init__(self):
        super().__init__(
            supported_entity="FINANCIAL_ACCOUNT",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="en",
        )


def get_all_custom_recognizers() -> list[PatternRecognizer]:
    """
    Get all custom PII recognizers.

    Returns:
        List of initialized custom recognizer instances
    """
    return [
        USPassportRecognizer(),
        StateIDRecognizer(),
        MedicalRecordRecognizer(),
        HealthInsuranceIDRecognizer(),
        EmployeeIDRecognizer(),
        StudentIDRecognizer(),
        MilitaryIDRecognizer(),
        VehicleRegistrationRecognizer(),
        LicensePlateRecognizer(),
        CredentialsRecognizer(),
        USAddressRecognizer(),
        DateOfBirthRecognizer(),
        MothersMaidenNameRecognizer(),
        FinancialAccountRecognizer(),
    ]
