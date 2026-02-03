import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

interface Holiday {
  date: string;
  name: string;
  type: 'public' | 'local';
}

const getHolidaysForYear = (year: number): Holiday[] => {
  const holidays: Holiday[] = [
    { date: `${year}-01-01`, name: "New Year's Day", type: 'public' },
    { date: `${year}-01-20`, name: 'Martin Luther King Jr. Day', type: 'public' },
    { date: `${year}-02-17`, name: "Presidents' Day", type: 'public' },
    { date: `${year}-05-26`, name: 'Memorial Day', type: 'public' },
    { date: `${year}-06-19`, name: 'Juneteenth', type: 'public' },
    { date: `${year}-07-04`, name: 'Independence Day', type: 'public' },
    { date: `${year}-09-01`, name: 'Labor Day', type: 'public' },
    { date: `${year}-10-13`, name: 'Columbus Day', type: 'public' },
    { date: `${year}-11-11`, name: 'Veterans Day', type: 'public' },
    { date: `${year}-11-27`, name: 'Thanksgiving Day', type: 'public' },
    { date: `${year}-12-25`, name: 'Christmas Day', type: 'public' },
    { date: `${year}-02-14`, name: "Valentine's Day", type: 'local' },
    { date: `${year}-03-17`, name: "St. Patrick's Day", type: 'local' },
    { date: `${year}-10-31`, name: 'Halloween', type: 'local' },
    { date: `${year}-11-28`, name: 'Black Friday', type: 'local' },
  ];
  return holidays;
};

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

const formatDateString = (year: number, month: number, day: number): string => {
  const monthStr = String(month + 1).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  return `${year}-${monthStr}-${dayStr}`;
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HolidayCalendarPage: React.FC = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const holidays = useMemo(() => getHolidaysForYear(currentYear), [currentYear]);

  const holidayMap = useMemo(() => {
    const map = new Map<string, Holiday>();
    holidays.forEach(holiday => {
      map.set(holiday.date, holiday);
    });
    return map;
  }, [holidays]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  }, [daysInMonth, firstDayOfMonth]);

  const { workingDays, holidayCount, weekendCount } = useMemo(() => {
    let working = 0;
    let holidays = 0;
    let weekends = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay();
      const dateString = formatDateString(currentYear, currentMonth, day);
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = holidayMap.has(dateString);

      if (isWeekend) {
        weekends++;
      } else if (isHoliday) {
        holidays++;
      } else {
        working++;
      }
    }

    return { workingDays: working, holidayCount: holidays, weekendCount: weekends };
  }, [currentYear, currentMonth, daysInMonth, holidayMap]);

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthHolidays = holidays.filter(holiday => {
    const holidayDate = new Date(holiday.date);
    return holidayDate.getMonth() === currentMonth;
  });

  const isToday = (day: number): boolean => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Holiday Calendar
      </Typography>

      <Box display="flex" alignItems="center" justifyContent="center" mb={3} gap={2}>
        <IconButton onClick={handlePreviousMonth} aria-label="Previous month">
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h5" sx={{ minWidth: 200, textAlign: 'center' }}>
          {MONTH_NAMES[currentMonth]} {currentYear}
        </Typography>
        <IconButton onClick={handleNextMonth} aria-label="Next month">
          <ChevronRightIcon />
        </IconButton>
      </Box>

      <Box display="flex" gap={3} flexWrap="wrap" mb={3}>
        <Card sx={{ minWidth: 150 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Working Days
            </Typography>
            <Typography variant="h4" color="primary">
              {workingDays}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 150 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Holidays
            </Typography>
            <Typography variant="h4" color="error">
              {holidayCount}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 150 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Weekends
            </Typography>
            <Typography variant="h4" color="secondary">
              {weekendCount}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          display="grid"
          gridTemplateColumns="repeat(7, 1fr)"
          gap={1}
          sx={{ textAlign: 'center' }}
        >
          {DAY_NAMES.map(day => (
            <Typography
              key={day}
              variant="subtitle2"
              sx={{
                fontWeight: 'bold',
                py: 1,
                color: day === 'Sun' || day === 'Sat' ? 'error.main' : 'text.primary',
              }}
            >
              {day}
            </Typography>
          ))}

          {calendarDays.map((day, index) => {
            if (day === null) {
              return <Box key={`empty-${index}`} />;
            }

            const dateString = formatDateString(currentYear, currentMonth, day);
            const holiday = holidayMap.get(dateString);
            const date = new Date(currentYear, currentMonth, day);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isTodayDate = isToday(day);

            return (
              <Box
                key={day}
                sx={{
                  p: 1,
                  minHeight: 80,
                  border: '1px solid',
                  borderColor: isTodayDate ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  backgroundColor: holiday
                    ? holiday.type === 'public'
                      ? 'error.light'
                      : 'warning.light'
                    : isWeekend
                    ? 'grey.100'
                    : 'background.paper',
                  position: 'relative',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isTodayDate ? 'bold' : 'normal',
                    color: isWeekend || holiday ? 'error.main' : 'text.primary',
                  }}
                >
                  {day}
                </Typography>
                {holiday && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      fontSize: '0.65rem',
                      lineHeight: 1.2,
                      mt: 0.5,
                      color: 'text.secondary',
                    }}
                  >
                    {holiday.name}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      </Paper>

      {monthHolidays.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Holidays in {MONTH_NAMES[currentMonth]}
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {monthHolidays.map(holiday => (
              <Chip
                key={holiday.date}
                label={`${new Date(holiday.date).getDate()} - ${holiday.name}`}
                color={holiday.type === 'public' ? 'error' : 'warning'}
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default HolidayCalendarPage;
