const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatResumeDateRange = (value: string | undefined): string => {
  const input = String(value || '');

  return input
    .replace(/\b(0?[1-9]|1[0-2])\s*[\/-]\s*(\d{4})\b/g, (_, month, year) => `${MONTHS[Number(month) - 1]}-${year}`)
    .replace(/\b(\d{4})\s*[\/-]\s*(0?[1-9]|1[0-2])\b/g, (_, year, month) => `${MONTHS[Number(month) - 1]}-${year}`);
};