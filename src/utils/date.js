const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfLocalDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isToday(value) {
  if (!value) {
    return false;
  }

  return startOfLocalDay(new Date(value)).getTime() === startOfLocalDay().getTime();
}

export function isYesterday(value) {
  if (!value) {
    return false;
  }

  return startOfLocalDay(new Date(value)).getTime() === startOfLocalDay().getTime() - DAY_MS;
}

export function getNextLocalMidnight() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
}

export function formatArabicTimeUntil(date) {
  const diff = Math.max(0, date.getTime() - Date.now());
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const minutes = Math.ceil((diff % (60 * 60 * 1000)) / (60 * 1000));

  if (hours <= 0) {
    return `${minutes} دقيقة`;
  }

  return `${hours} ساعة و ${minutes} دقيقة`;
}
