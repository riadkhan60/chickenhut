import { toZonedTime, format } from 'date-fns-tz';

// Convert a date to Bangladesh timezone
export const localDateFunc = (date: Date) => {
  // Convert to Bangladesh time zone
  const localDate = toZonedTime(date, 'Asia/Dhaka');
  return localDate;
};

// Format a UTC date from database to display in Bangladesh timezone
export const formatDBDateToBangladesh = (dbDate: Date | string | null) => {
  if (!dbDate) return '';

  // Convert the DB date (in UTC) to a Date object
  const date = new Date(dbDate);

  // Convert to Bangladesh timezone
  const bangladeshDate = toZonedTime(date, 'Asia/Dhaka');

  // Format the date as desired (e.g., YYYY-MM-DD HH:MM:SS)
  return format(bangladeshDate, 'yyyy-MM-dd HH:mm:ss', {
    timeZone: 'Asia/Dhaka',
  });
};
