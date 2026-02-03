import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

interface SLOMetric {
  current: number;
  target: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface LatencyMetrics {
  p50: SLOMetric;
  p95: SLOMetric;
  p99: SLOMetric;
  average: number;
}

interface QualityGate {
  name: string;
  passed: boolean;
  current: string;
  target: number;
  unit: string;
}

interface SLOMetricsData {
  timeWindow: number;
  totalRequests: number;
  availability: SLOMetric & { successCount: number; failureCount: number };
  latency: LatencyMetrics;
  errorRate: SLOMetric & { errorCount: number };
  throughput: SLOMetric & { requestsPerMinute: number };
  qualityGates: {
    passed: boolean;
    gates: QualityGate[];
  };
  timestamp: string;
}

interface EndpointMetric {
  endpoint: string;
  totalRequests: number;
  errorRate: number;
  avgLatency: number;
  p95Latency: number;
}

const getStatusColor = (status: string): 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'healthy':
      return 'success';
    case 'warning':
      return 'warning';
    case 'critical':
      return 'error';
    default:
      return 'success';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy':
      return <CheckCircleIcon color="success" />;
    case 'warning':
      return <WarningIcon color="warning" />;
    case 'critical':
      return <ErrorIcon color="error" />;
    default:
      return <CheckCircleIcon color="success" />;
  }
};

const MetricCard: React.FC<{
  title: string;
  current: number | string;
  target: number;
  unit: string;
  status: string;
  icon: React.ReactNode;
  subtitle?: string;
}> = ({ title, current, target, unit, status, icon, subtitle }) => {
  const progress = typeof current === 'number' ? Math.min((current / target) * 100, 100) : 0;
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            {icon}
            <Typography variant="h6" component="div">
              {title}
            </Typography>
          </Box>
          {getStatusIcon(status)}
        </Box>
        <Typography variant="h3" component="div" color={getStatusColor(status)}>
          {current}{unit}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Target: {target}{unit}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            color={getStatusColor(status)}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

const QualityGatesCard: React.FC<{ gates: QualityGate[]; passed: boolean }> = ({ gates, passed }) => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <SecurityIcon color={passed ? 'success' : 'error'} />
            <Typography variant="h6">Quality Gates</Typography>
          </Box>
          <Chip
            label={passed ? 'All Passed' : 'Failed'}
            color={passed ? 'success' : 'error'}
            size="small"
          />
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Gate</TableCell>
                <TableCell align="right">Current</TableCell>
                <TableCell align="right">Target</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gates.map((gate) => (
                <TableRow key={gate.name}>
                  <TableCell>{gate.name}</TableCell>
                  <TableCell align="right">{gate.current}{gate.unit}</TableCell>
                  <TableCell align="right">{gate.target}{gate.unit}</TableCell>
                  <TableCell align="center">
                    {gate.passed ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                      <ErrorIcon color="error" fontSize="small" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

const EndpointMetricsTable: React.FC<{ endpoints: EndpointMetric[] }> = ({ endpoints }) => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <TimelineIcon color="primary" />
          <Typography variant="h6">Endpoint Metrics</Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Endpoint</TableCell>
                <TableCell align="right">Requests</TableCell>
                <TableCell align="right">Error Rate</TableCell>
                <TableCell align="right">Avg Latency</TableCell>
                <TableCell align="right">P95 Latency</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {endpoints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">No endpoint data available</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                endpoints.map((endpoint) => (
                  <TableRow key={endpoint.endpoint}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {endpoint.endpoint}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{endpoint.totalRequests}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${endpoint.errorRate}%`}
                        size="small"
                        color={endpoint.errorRate > 5 ? 'error' : endpoint.errorRate > 1 ? 'warning' : 'success'}
                      />
                    </TableCell>
                    <TableCell align="right">{endpoint.avgLatency}ms</TableCell>
                    <TableCell align="right">{endpoint.p95Latency}ms</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

const SLODashboardPage: React.FC = () => {
  const [timeWindow, setTimeWindow] = useState<number>(60);

  const { data: metricsData, isLoading: metricsLoading, error: metricsError } = useQuery<SLOMetricsData>({
    queryKey: ['sloMetrics', timeWindow],
    queryFn: () => apiClient.getSLOMetrics(timeWindow),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: endpointsData, isLoading: endpointsLoading } = useQuery<{ endpoints: EndpointMetric[] }>({
    queryKey: ['sloEndpoints', timeWindow],
    queryFn: () => apiClient.getSLOEndpointMetrics(timeWindow),
    refetchInterval: 30000,
  });

  if (metricsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (metricsError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load SLO metrics. Please try again later.
      </Alert>
    );
  }

  const metrics = metricsData;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">SLO Dashboard</Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Time Window</InputLabel>
          <Select
            value={timeWindow}
            label="Time Window"
            onChange={(e) => setTimeWindow(Number(e.target.value))}
          >
            <MenuItem value={15}>Last 15 min</MenuItem>
            <MenuItem value={30}>Last 30 min</MenuItem>
            <MenuItem value={60}>Last 1 hour</MenuItem>
            <MenuItem value={180}>Last 3 hours</MenuItem>
            <MenuItem value={360}>Last 6 hours</MenuItem>
            <MenuItem value={720}>Last 12 hours</MenuItem>
            <MenuItem value={1440}>Last 24 hours</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {metrics && (
        <>
          <Paper sx={{ p: 2, mb: 3, bgcolor: metrics.qualityGates.passed ? 'success.light' : 'error.light' }}>
            <Box display="flex" alignItems="center" gap={2}>
              {metrics.qualityGates.passed ? (
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.dark' }} />
              ) : (
                <ErrorIcon sx={{ fontSize: 40, color: 'error.dark' }} />
              )}
              <Box>
                <Typography variant="h5" color={metrics.qualityGates.passed ? 'success.dark' : 'error.dark'}>
                  {metrics.qualityGates.passed ? 'All SLOs Met' : 'SLO Violations Detected'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {metrics.totalRequests} requests in the last {timeWindow} minutes | Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* @ts-expect-error - MUI Grid item prop type issue */}
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Availability"
                current={metrics.availability.current}
                target={metrics.availability.target}
                unit="%"
                status={metrics.availability.status}
                icon={<CheckCircleIcon color="primary" />}
                subtitle={`${metrics.availability.successCount} success / ${metrics.availability.failureCount} failures`}
              />
            </Grid>
            {/* @ts-expect-error - MUI Grid item prop type issue */}
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Latency (P95)"
                current={metrics.latency.p95.current}
                target={metrics.latency.p95.target}
                unit="ms"
                status={metrics.latency.p95.status}
                icon={<SpeedIcon color="primary" />}
                subtitle={`P50: ${metrics.latency.p50.current}ms | P99: ${metrics.latency.p99.current}ms`}
              />
            </Grid>
            {/* @ts-expect-error - MUI Grid item prop type issue */}
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Error Rate"
                current={metrics.errorRate.current}
                target={metrics.errorRate.target}
                unit="%"
                status={metrics.errorRate.status}
                icon={<ErrorIcon color="primary" />}
                subtitle={`${metrics.errorRate.errorCount} errors total`}
              />
            </Grid>
            {/* @ts-expect-error - MUI Grid item prop type issue */}
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Throughput"
                current={metrics.throughput.requestsPerMinute}
                target={metrics.throughput.target}
                unit=" req/min"
                status={metrics.throughput.status}
                icon={<TrendingUpIcon color="primary" />}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* @ts-expect-error - MUI Grid item prop type issue */}
            <Grid item xs={12} md={6}>
              <QualityGatesCard
                gates={metrics.qualityGates.gates}
                passed={metrics.qualityGates.passed}
              />
            </Grid>
            {/* @ts-expect-error - MUI Grid item prop type issue */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <SpeedIcon color="primary" />
                    <Typography variant="h6">Latency Distribution</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    {/* @ts-expect-error - MUI Grid item prop type issue */}
                    <Grid item xs={4}>
                      <Box textAlign="center">
                        <Typography variant="h4" color={getStatusColor(metrics.latency.p50.status)}>
                          {metrics.latency.p50.current}ms
                        </Typography>
                        <Typography variant="body2" color="text.secondary">P50</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Target: {metrics.latency.p50.target}ms
                        </Typography>
                      </Box>
                    </Grid>
                    {/* @ts-expect-error - MUI Grid item prop type issue */}
                    <Grid item xs={4}>
                      <Box textAlign="center">
                        <Typography variant="h4" color={getStatusColor(metrics.latency.p95.status)}>
                          {metrics.latency.p95.current}ms
                        </Typography>
                        <Typography variant="body2" color="text.secondary">P95</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Target: {metrics.latency.p95.target}ms
                        </Typography>
                      </Box>
                    </Grid>
                    {/* @ts-expect-error - MUI Grid item prop type issue */}
                    <Grid item xs={4}>
                      <Box textAlign="center">
                        <Typography variant="h4" color={getStatusColor(metrics.latency.p99.status)}>
                          {metrics.latency.p99.current}ms
                        </Typography>
                        <Typography variant="body2" color="text.secondary">P99</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Target: {metrics.latency.p99.target}ms
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      Average Latency: {metrics.latency.average}ms
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            {endpointsLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <EndpointMetricsTable endpoints={endpointsData?.endpoints || []} />
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default SLODashboardPage;
