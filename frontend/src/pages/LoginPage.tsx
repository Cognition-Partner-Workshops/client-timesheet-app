import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

type LoginMethod = 'email' | 'mobile';

const LoginPage: React.FC = () => {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithMobile } = useAuth();
  const navigate = useNavigate();

  const handleLoginMethodChange = (_event: React.MouseEvent<HTMLElement>, newMethod: LoginMethod | null) => {
    if (newMethod !== null) {
      setLoginMethod(newMethod);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (loginMethod === 'email') {
        await login(email);
      } else {
        await loginWithMobile(mobile);
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = loginMethod === 'email' ? email.trim() !== '' : mobile.trim() !== '';

  return (
    <Container component="main" maxWidth="sm">
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        px: 2,
      }}
    >
      <Paper elevation={3} sx={{ padding: 3, width: '100%', maxWidth: 500 }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Time Tracker
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>
          Log in with your email or mobile number
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          This app intentionally does not have a password field.
        </Alert>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <ToggleButtonGroup
            value={loginMethod}
            exclusive
            onChange={handleLoginMethodChange}
            aria-label="login method"
          >
            <ToggleButton value="email" aria-label="email login">
              <EmailIcon sx={{ mr: 1 }} />
              Email
            </ToggleButton>
            <ToggleButton value="mobile" aria-label="mobile login">
              <PhoneIcon sx={{ mr: 1 }} />
              Mobile
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          {loginMethod === 'email' ? (
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          ) : (
            <TextField
              margin="normal"
              required
              fullWidth
              id="mobile"
              label="Mobile Number"
              name="mobile"
              autoComplete="tel"
              autoFocus
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              disabled={isLoading}
              placeholder="+1234567890"
              helperText="Enter your mobile number (7-15 digits, optionally starting with +)"
            />
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2, mb: 1 }}
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Log In'}
          </Button>
        </Box>
      </Paper>
    </Box>
    </Container>
  );
};

export default LoginPage;
