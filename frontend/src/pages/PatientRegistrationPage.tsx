import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Grid,
  Alert,
  MenuItem,
  Divider,
  Snackbar,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  medicalNotes: string;
}

const initialFormData: PatientFormData = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  email: '',
  phone: '',
  streetAddress: '',
  city: '',
  state: '',
  zipCode: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  insuranceProvider: '',
  insurancePolicyNumber: '',
  medicalNotes: '',
};

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

const PatientRegistrationPage: React.FC = () => {
  const [formData, setFormData] = useState<PatientFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<PatientFormData>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Partial<PatientFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.emergencyContactName.trim()) {
      newErrors.emergencyContactName = 'Emergency contact name is required';
    }
    if (!formData.emergencyContactPhone.trim()) {
      newErrors.emergencyContactPhone = 'Emergency contact phone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof PatientFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      setErrorMessage('Please fill in all required fields correctly');
      return;
    }

    console.log('Patient registration data:', formData);
    setSuccessMessage('Patient registered successfully!');
    setFormData(initialFormData);
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
    setErrorMessage('');
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <PersonAddIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4">Patient Registration</Typography>
      </Box>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom color="primary">
            Personal Information
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="First Name"
                required
                value={formData.firstName}
                onChange={handleChange('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Last Name"
                required
                value={formData.lastName}
                onChange={handleChange('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={handleChange('dateOfBirth')}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="Gender"
                required
                value={formData.gender}
                onChange={handleChange('gender')}
                error={!!errors.gender}
                helperText={errors.gender}
              >
                {genderOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" gutterBottom color="primary">
            Contact Information
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange('email')}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Phone Number"
                required
                value={formData.phone}
                onChange={handleChange('phone')}
                error={!!errors.phone}
                helperText={errors.phone}
                placeholder="(555) 123-4567"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Street Address"
                value={formData.streetAddress}
                onChange={handleChange('streetAddress')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={handleChange('city')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={handleChange('state')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={formData.zipCode}
                onChange={handleChange('zipCode')}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" gutterBottom color="primary">
            Emergency Contact
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Emergency Contact Name"
                required
                value={formData.emergencyContactName}
                onChange={handleChange('emergencyContactName')}
                error={!!errors.emergencyContactName}
                helperText={errors.emergencyContactName}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Emergency Contact Phone"
                required
                value={formData.emergencyContactPhone}
                onChange={handleChange('emergencyContactPhone')}
                error={!!errors.emergencyContactPhone}
                helperText={errors.emergencyContactPhone}
                placeholder="(555) 123-4567"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" gutterBottom color="primary">
            Insurance Information (Optional)
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Insurance Provider"
                value={formData.insuranceProvider}
                onChange={handleChange('insuranceProvider')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Policy Number"
                value={formData.insurancePolicyNumber}
                onChange={handleChange('insurancePolicyNumber')}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" gutterBottom color="primary">
            Medical Notes (Optional)
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Medical Notes / Allergies / Special Conditions"
                multiline
                rows={4}
                value={formData.medicalNotes}
                onChange={handleChange('medicalNotes')}
                placeholder="Enter any relevant medical history, allergies, or special conditions..."
              />
            </Grid>
          </Grid>

          <Box display="flex" gap={2} mt={4} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={handleReset}
              size="large"
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              size="large"
            >
              Register Patient
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
      />
    </Box>
  );
};

export default PatientRegistrationPage;
