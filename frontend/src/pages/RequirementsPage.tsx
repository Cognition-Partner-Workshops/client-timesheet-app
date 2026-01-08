import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  AccessTime as TimeIcon,
  Assessment as ReportIcon,
  FileDownload as ExportIcon,
  Dashboard as DashboardIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface Requirement {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'critical' | 'high' | 'medium';
  features: string[];
  icon: React.ReactNode;
}

const requirements: Requirement[] = [
  {
    id: 'REQ-001',
    title: 'User Authentication & Management',
    description: 'Secure email-based authentication system for user identification and session management.',
    category: 'Security',
    priority: 'critical',
    features: [
      'Email-only authentication (simplified for internal network)',
      'Automatic user creation on first login',
      'JWT token-based session management',
      'Rate limiting on login attempts (5 per 15 minutes)',
      'Email format validation',
    ],
    icon: <PersonIcon />,
  },
  {
    id: 'REQ-002',
    title: 'Client Management',
    description: 'Complete client lifecycle management with full CRUD operations and user-scoped data isolation.',
    category: 'Core Business',
    priority: 'critical',
    features: [
      'Create, read, update, and delete client records',
      'Client name (required, max 255 characters)',
      'Client description (optional, max 1000 characters)',
      'User-scoped data isolation (users only see their own clients)',
      'Automatic timestamp tracking (created_at, updated_at)',
    ],
    icon: <BusinessIcon />,
  },
  {
    id: 'REQ-003',
    title: 'Time/Work Entry Tracking',
    description: 'Comprehensive time tracking system for logging billable hours against specific clients.',
    category: 'Core Business',
    priority: 'critical',
    features: [
      'Log work entries against specific clients',
      'Track hours (required, 0-24 hours, 2 decimal precision)',
      'Track date (required, ISO format)',
      'Optional description (max 1000 characters)',
      'Full CRUD operations for work entries',
      'Client ownership verification before entry creation',
    ],
    icon: <TimeIcon />,
  },
  {
    id: 'REQ-004',
    title: 'Data Validation & Input Sanitization',
    description: 'Robust input validation using Joi schemas to ensure data integrity and prevent invalid data entry.',
    category: 'Security',
    priority: 'critical',
    features: [
      'Email format validation',
      'Client name required validation',
      'Hours range validation (0-24)',
      'Date format validation (ISO)',
      'Input trimming and sanitization',
      'Maximum length enforcement for all text fields',
    ],
    icon: <CheckIcon />,
  },
  {
    id: 'REQ-005',
    title: 'Security & Data Protection',
    description: 'Comprehensive security measures to protect user data and prevent unauthorized access.',
    category: 'Security',
    priority: 'critical',
    features: [
      'User data isolation at database level',
      'Authentication required for all protected routes',
      'Rate limiting to prevent brute force attacks',
      'Security headers via Helmet middleware',
      'CORS configuration for cross-origin requests',
      'Automated security scanning (Trivy) in CI/CD pipeline',
    ],
    icon: <SecurityIcon />,
  },
  {
    id: 'REQ-006',
    title: 'Reporting & Analytics',
    description: 'Generate aggregated reports with hours calculation and statistics per client.',
    category: 'Analytics',
    priority: 'high',
    features: [
      'View aggregated hours per client',
      'Total hours calculation',
      'Entry count statistics',
      'Average hours per entry calculation',
      'Work entries listing with date sorting',
    ],
    icon: <ReportIcon />,
  },
  {
    id: 'REQ-007',
    title: 'Export Functionality',
    description: 'Export client reports in multiple formats for billing and record-keeping purposes.',
    category: 'Analytics',
    priority: 'high',
    features: [
      'Export reports to CSV format',
      'Export reports to PDF format',
      'Formatted reports with client name, dates, hours, descriptions',
      'Automatic file naming with timestamps',
      'Download functionality with proper MIME types',
    ],
    icon: <ExportIcon />,
  },
  {
    id: 'REQ-008',
    title: 'Dashboard & Overview',
    description: 'Central dashboard providing quick access to key metrics and recent activity.',
    category: 'User Experience',
    priority: 'medium',
    features: [
      'View total clients count',
      'View total work entries count',
      'View total hours logged',
      'Recent work entries display (last 5)',
      'Quick action buttons for common tasks',
      'Navigation to all major sections',
    ],
    icon: <DashboardIcon />,
  },
  {
    id: 'REQ-009',
    title: 'Data Persistence & Performance',
    description: 'Reliable data storage with optimized queries and proper relationship management.',
    category: 'Infrastructure',
    priority: 'medium',
    features: [
      'SQLite database for data persistence',
      'Foreign key relationships between entities',
      'Cascade delete for related records',
      'Performance indexes on frequently queried columns',
      'Automatic timestamp management',
    ],
    icon: <WarningIcon />,
  },
];

const getPriorityColor = (priority: string): 'error' | 'warning' | 'info' => {
  switch (priority) {
    case 'critical':
      return 'error';
    case 'high':
      return 'warning';
    default:
      return 'info';
  }
};

const getPriorityLabel = (priority: string): string => {
  switch (priority) {
    case 'critical':
      return 'CRITICAL';
    case 'high':
      return 'HIGH';
    default:
      return 'MEDIUM';
  }
};

const RequirementsPage: React.FC = () => {
  const criticalCount = requirements.filter(r => r.priority === 'critical').length;
  const highCount = requirements.filter(r => r.priority === 'high').length;
  const mediumCount = requirements.filter(r => r.priority === 'medium').length;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Business Requirements
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        High-level business requirements extracted from the Employee Time Tracking Application codebase.
        Requirements are categorized by priority to highlight critical functionality.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
            <CardContent>
              <Typography variant="h3" component="div" fontWeight="bold">
                {criticalCount}
              </Typography>
              <Typography variant="subtitle1">
                Critical Requirements
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <CardContent>
              <Typography variant="h3" component="div" fontWeight="bold">
                {highCount}
              </Typography>
              <Typography variant="subtitle1">
                High Priority
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent>
              <Typography variant="h3" component="div" fontWeight="bold">
                {mediumCount}
              </Typography>
              <Typography variant="subtitle1">
                Medium Priority
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Critical Requirements
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        These requirements are essential for the core functionality and security of the application.
      </Typography>
      
      {requirements
        .filter(req => req.priority === 'critical')
        .map((req) => (
          <Paper 
            key={req.id} 
            sx={{ 
              p: 3, 
              mb: 2, 
              borderLeft: 4, 
              borderColor: 'error.main',
              bgcolor: 'error.50',
            }}
          >
            <Box display="flex" alignItems="flex-start" gap={2}>
              <Box 
                sx={{ 
                  bgcolor: 'error.main', 
                  color: 'white', 
                  p: 1, 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {req.icon}
              </Box>
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Typography variant="h6" component="span">
                    {req.title}
                  </Typography>
                  <Chip 
                    label={getPriorityLabel(req.priority)} 
                    color={getPriorityColor(req.priority)} 
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Chip 
                    label={req.category} 
                    variant="outlined" 
                    size="small"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {req.id}
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {req.description}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5 }}>
                  Key Features:
                </Typography>
                <List dense disablePadding>
                  {req.features.map((feature, index) => (
                    <ListItem key={index} disablePadding sx={{ py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <CheckIcon fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={feature} 
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          </Paper>
        ))}

      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        High Priority Requirements
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Important features that enhance the application's value and usability.
      </Typography>
      
      {requirements
        .filter(req => req.priority === 'high')
        .map((req) => (
          <Paper 
            key={req.id} 
            sx={{ 
              p: 3, 
              mb: 2, 
              borderLeft: 4, 
              borderColor: 'warning.main',
            }}
          >
            <Box display="flex" alignItems="flex-start" gap={2}>
              <Box 
                sx={{ 
                  bgcolor: 'warning.main', 
                  color: 'white', 
                  p: 1, 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {req.icon}
              </Box>
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Typography variant="h6" component="span">
                    {req.title}
                  </Typography>
                  <Chip 
                    label={getPriorityLabel(req.priority)} 
                    color={getPriorityColor(req.priority)} 
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Chip 
                    label={req.category} 
                    variant="outlined" 
                    size="small"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {req.id}
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {req.description}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5 }}>
                  Key Features:
                </Typography>
                <List dense disablePadding>
                  {req.features.map((feature, index) => (
                    <ListItem key={index} disablePadding sx={{ py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <CheckIcon fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={feature} 
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          </Paper>
        ))}

      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Medium Priority Requirements
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Supporting features that improve user experience and system reliability.
      </Typography>
      
      {requirements
        .filter(req => req.priority === 'medium')
        .map((req) => (
          <Paper 
            key={req.id} 
            sx={{ 
              p: 3, 
              mb: 2, 
              borderLeft: 4, 
              borderColor: 'info.main',
            }}
          >
            <Box display="flex" alignItems="flex-start" gap={2}>
              <Box 
                sx={{ 
                  bgcolor: 'info.main', 
                  color: 'white', 
                  p: 1, 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {req.icon}
              </Box>
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Typography variant="h6" component="span">
                    {req.title}
                  </Typography>
                  <Chip 
                    label={getPriorityLabel(req.priority)} 
                    color={getPriorityColor(req.priority)} 
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Chip 
                    label={req.category} 
                    variant="outlined" 
                    size="small"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {req.id}
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {req.description}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5 }}>
                  Key Features:
                </Typography>
                <List dense disablePadding>
                  {req.features.map((feature, index) => (
                    <ListItem key={index} disablePadding sx={{ py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <CheckIcon fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={feature} 
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          </Paper>
        ))}
    </Box>
  );
};

export default RequirementsPage;
