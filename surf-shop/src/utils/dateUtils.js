// Format a Date object as YYYY-MM-DD in local time (avoids UTC rollover bugs from toISOString)
export const formatLocalDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Parse a YYYY-MM-DD string as local midnight (avoids UTC midnight shift from new Date("YYYY-MM-DD"))
export const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) {
    return new Date(dateStr.getFullYear(), dateStr.getMonth(), dateStr.getDate());
  }
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(dateStr);
};

// Calculate number of rental days between two YYYY-MM-DD date strings (minimum 1 day)
export const calculateDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 1;
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays || 1;
};

// Format a range of YYYY-MM-DD strings into "Mon DD - Mon DD"
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return 'Date not set';
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  const options = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
};
