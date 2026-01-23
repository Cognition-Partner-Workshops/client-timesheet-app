import React, { useState, useMemo } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PasswordStrength {
  score: number;
  label: string;
  color: 'error' | 'warning' | 'info' | 'success';
}

const getPasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[@$!%*?&]/.test(password)) score += 1;

  if (score <= 2) return { score: 25, label: 'Weak', color: 'error' };
  if (score <= 3) return { score: 50, label: 'Fair', color: 'warning' };
  if (score <= 4) return { score: 75, label: 'Good', color: 'info' };
  return { score: 100, label: 'Strong', color: 'success' };
};

const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/\d/.test(password)) errors.push('One number');
  if (/[@$!%*?&]/.test(password) === false) errors.push('One special character (@$!%*?&)');
  return errors;
};

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const isLoginMode = tabIndex === 0;

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordErrors = useMemo(() => validatePassword(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLoginMode) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (passwordErrors.length > 0) {
        setError('Password does not meet requirements');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || `${isLoginMode ? 'Login' : 'Registration'} failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    setError('');
    setPassword('');
    setConfirmPassword('');
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
          
          <Tabs value={tabIndex} onChange={handleTabChange} centered sx={{ mb: 2 }}>
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
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
            <TextField
              margin="normal"
              required
              fullWidth
              id="password"
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={isLoginMode ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            {!isLoginMode && password && (
              <Box sx={{ mt: 1, mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <LinearProgress
                    variant="determinate"
                    value={passwordStrength.score}
                    color={passwordStrength.color}
                    sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color={`${passwordStrength.color}.main`}>
                    {passwordStrength.label}
                  </Typography>
                </Box>
                {passwordErrors.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Missing: {passwordErrors.join(', ')}
                  </Typography>
                )}
              </Box>
            )}

            {!isLoginMode && (
              <TextField
                margin="normal"
                required
                fullWidth
                id="confirmPassword"
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                error={confirmPassword !== '' && password !== confirmPassword}
                helperText={confirmPassword !== '' && password !== confirmPassword ? 'Passwords do not match' : ''}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, mb: 1 }}
              disabled={isLoading || !email || !password || (!isLoginMode && !confirmPassword)}
            >
              {isLoading ? <CircularProgress size={24} /> : (isLoginMode ? 'Log In' : 'Register')}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
