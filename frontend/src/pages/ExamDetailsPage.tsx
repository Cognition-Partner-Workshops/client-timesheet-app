import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  Chip,
  TextField,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import {
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

interface ExamSchedule {
  id: number;
  examName: string;
  examCode: string;
  date: string;
  time: string;
  duration: string;
  venue: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

interface ExamFee {
  examCode: string;
  examName: string;
  registrationFee: number;
  lateFee: number;
  rescheduleFee: number;
  currency: string;
}

interface ExamScoring {
  examCode: string;
  examName: string;
  totalMarks: number;
  passingMarks: number;
  passingPercentage: number;
  gradingScale: string;
}

const mockExamSchedules: ExamSchedule[] = [
  {
    id: 1,
    examName: 'AWS Solutions Architect',
    examCode: 'SAA-C03',
    date: '2026-03-15',
    time: '09:00 AM',
    duration: '130 minutes',
    venue: 'Testing Center A',
    status: 'upcoming',
  },
  {
    id: 2,
    examName: 'Azure Administrator',
    examCode: 'AZ-104',
    date: '2026-03-20',
    time: '02:00 PM',
    duration: '120 minutes',
    venue: 'Testing Center B',
    status: 'upcoming',
  },
  {
    id: 3,
    examName: 'Google Cloud Professional',
    examCode: 'GCP-ACE',
    date: '2026-02-01',
    time: '10:00 AM',
    duration: '120 minutes',
    venue: 'Testing Center A',
    status: 'completed',
  },
  {
    id: 4,
    examName: 'Kubernetes Administrator',
    examCode: 'CKA',
    date: '2026-04-10',
    time: '11:00 AM',
    duration: '120 minutes',
    venue: 'Online Proctored',
    status: 'upcoming',
  },
];

const mockExamFees: ExamFee[] = [
  {
    examCode: 'SAA-C03',
    examName: 'AWS Solutions Architect',
    registrationFee: 150,
    lateFee: 50,
    rescheduleFee: 30,
    currency: 'USD',
  },
  {
    examCode: 'AZ-104',
    examName: 'Azure Administrator',
    registrationFee: 165,
    lateFee: 55,
    rescheduleFee: 35,
    currency: 'USD',
  },
  {
    examCode: 'GCP-ACE',
    examName: 'Google Cloud Professional',
    registrationFee: 200,
    lateFee: 60,
    rescheduleFee: 40,
    currency: 'USD',
  },
  {
    examCode: 'CKA',
    examName: 'Kubernetes Administrator',
    registrationFee: 395,
    lateFee: 75,
    rescheduleFee: 50,
    currency: 'USD',
  },
];

const mockExamScoring: ExamScoring[] = [
  {
    examCode: 'SAA-C03',
    examName: 'AWS Solutions Architect',
    totalMarks: 1000,
    passingMarks: 720,
    passingPercentage: 72,
    gradingScale: 'Scaled Score (100-1000)',
  },
  {
    examCode: 'AZ-104',
    examName: 'Azure Administrator',
    totalMarks: 1000,
    passingMarks: 700,
    passingPercentage: 70,
    gradingScale: 'Scaled Score (100-1000)',
  },
  {
    examCode: 'GCP-ACE',
    examName: 'Google Cloud Professional',
    totalMarks: 100,
    passingMarks: 70,
    passingPercentage: 70,
    gradingScale: 'Percentage (0-100%)',
  },
  {
    examCode: 'CKA',
    examName: 'Kubernetes Administrator',
    totalMarks: 100,
    passingMarks: 66,
    passingPercentage: 66,
    gradingScale: 'Percentage (0-100%)',
  },
];

const ExamDetailsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState<string | null>(null);

  const filteredSchedules = mockExamSchedules.filter(
    (exam) =>
      exam.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.examCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getExamFee = (examCode: string) => {
    return mockExamFees.find((fee) => fee.examCode === examCode);
  };

  const getExamScoring = (examCode: string) => {
    return mockExamScoring.find((scoring) => scoring.examCode === examCode);
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <SchoolIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4">Candidate Exam Details</Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        View exam schedules, fees, and scoring criteria. Click on an exam to see detailed information.
      </Alert>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            fullWidth
            label="Search Exams"
            placeholder="Search by exam name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              },
            }}
          />
          <Button
            variant="outlined"
            onClick={() => {
              setSearchTerm('');
              setSelectedExam(null);
            }}
          >
            Clear
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <ScheduleIcon color="primary" />
                <Typography variant="h6">Total Exams</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {mockExamSchedules.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <ScheduleIcon color="success" />
                <Typography variant="h6">Upcoming</Typography>
              </Box>
              <Typography variant="h3" color="success.main">
                {mockExamSchedules.filter((e) => e.status === 'upcoming').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AssessmentIcon color="info" />
                <Typography variant="h6">Completed</Typography>
              </Box>
              <Typography variant="h3" color="info.main">
                {mockExamSchedules.filter((e) => e.status === 'completed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Exam Schedule
      </Typography>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Exam Code</TableCell>
                <TableCell>Exam Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Venue</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSchedules.map((exam) => (
                <TableRow
                  key={exam.id}
                  hover
                  selected={selectedExam === exam.examCode}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setSelectedExam(exam.examCode)}
                >
                  <TableCell>
                    <Typography fontWeight="bold">{exam.examCode}</Typography>
                  </TableCell>
                  <TableCell>{exam.examName}</TableCell>
                  <TableCell>{new Date(exam.date).toLocaleDateString()}</TableCell>
                  <TableCell>{exam.time}</TableCell>
                  <TableCell>{exam.duration}</TableCell>
                  <TableCell>{exam.venue}</TableCell>
                  <TableCell>
                    <Chip
                      label={exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                      color={getStatusColor(exam.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExam(exam.examCode);
                      }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {selectedExam && (
        <>
          <Divider sx={{ my: 4 }} />

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Exam Fees
              </Typography>
              <Paper sx={{ p: 3 }}>
                {(() => {
                  const fee = getExamFee(selectedExam);
                  if (!fee) return <Typography>No fee information available</Typography>;
                  return (
                    <Box>
                      <Typography variant="h6" gutterBottom color="primary">
                        {fee.examName} ({fee.examCode})
                      </Typography>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell>Registration Fee</TableCell>
                            <TableCell align="right">
                              <Typography fontWeight="bold" color="primary">
                                ${fee.registrationFee} {fee.currency}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Late Registration Fee</TableCell>
                            <TableCell align="right">
                              <Typography color="warning.main">
                                +${fee.lateFee} {fee.currency}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Reschedule Fee</TableCell>
                            <TableCell align="right">
                              <Typography color="text.secondary">
                                ${fee.rescheduleFee} {fee.currency}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Box>
                  );
                })()}
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Scoring Criteria
              </Typography>
              <Paper sx={{ p: 3 }}>
                {(() => {
                  const scoring = getExamScoring(selectedExam);
                  if (!scoring) return <Typography>No scoring information available</Typography>;
                  return (
                    <Box>
                      <Typography variant="h6" gutterBottom color="primary">
                        {scoring.examName} ({scoring.examCode})
                      </Typography>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell>Total Marks</TableCell>
                            <TableCell align="right">
                              <Typography fontWeight="bold">{scoring.totalMarks}</Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Passing Marks</TableCell>
                            <TableCell align="right">
                              <Typography fontWeight="bold" color="success.main">
                                {scoring.passingMarks}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Passing Percentage</TableCell>
                            <TableCell align="right">
                              <Chip
                                label={`${scoring.passingPercentage}%`}
                                color="success"
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Grading Scale</TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color="text.secondary">
                                {scoring.gradingScale}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Box>
                  );
                })()}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default ExamDetailsPage;
