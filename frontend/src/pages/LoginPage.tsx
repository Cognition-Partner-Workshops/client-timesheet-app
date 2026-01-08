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
  Tabs,
  Tab,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`login-tabpanel-${index}`}
      aria-labelledby={`login-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const LoginPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [displayCode, setDisplayCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, requestAuthCode, loginWithMobile } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setCodeSent(false);
    setDisplayCode('');
    setAuthCode('');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email);
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await requestAuthCode(mobileNumber);
      setCodeSent(true);
      setDisplayCode(response.code);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to send auth code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await loginWithMobile(mobileNumber, authCode);
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Invalid auth code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
            Choose your login method
          </Typography>

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Email" id="login-tab-0" aria-controls="login-tabpanel-0" />
            <Tab label="Mobile" id="login-tab-1" aria-controls="login-tabpanel-1" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <TabPanel value={tabValue} index={0}>
            <Alert severity="info" sx={{ mb: 2 }}>
              This app intentionally does not have a password field.
            </Alert>
            <Box component="form" onSubmit={handleEmailSubmit}>
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
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2, mb: 1 }}
                disabled={isLoading || !email}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Log In with Email'}
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {!codeSent ? (
              <Box component="form" onSubmit={handleRequestCode}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Enter your mobile number to receive an auth code.
                </Alert>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="mobileNumber"
                  label="Mobile Number"
                  name="mobileNumber"
                  autoComplete="tel"
                  placeholder="+1234567890"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  disabled={isLoading}
                  helperText="Enter with country code (e.g., +1234567890)"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 2, mb: 1 }}
                  disabled={isLoading || !mobileNumber}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Request Auth Code'}
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleVerifyCode}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Auth code sent! For demo purposes, your code is: <strong>{displayCode}</strong>
                </Alert>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="authCode"
                  label="Auth Code"
                  name="authCode"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  disabled={isLoading}
                  inputProps={{ maxLength: 6 }}
                  helperText="Enter the 6-digit code"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 2, mb: 1 }}
                  disabled={isLoading || authCode.length !== 6}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Verify Code'}
                </Button>
                <Button
                  fullWidth
                  variant="text"
                  sx={{ mt: 1 }}
                  onClick={() => {
                    setCodeSent(false);
                    setDisplayCode('');
                    setAuthCode('');
                  }}
                  disabled={isLoading}
                >
                  Use a different number
                </Button>
              </Box>
            )}
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
