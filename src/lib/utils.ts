import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDate, formatDistanceToNowStrict } from "date-fns";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function formatRelativeDate(from: Date) {
  const now = new Date();
  if (now.getTime() - from.getTime() < 24 * 60 * 60 * 1000) {
    // chưa đến 1 ngày
    return formatDistanceToNowStrict(from, { addSuffix: true });
  } else {
    //cùng năm
    if (now.getFullYear() === from.getFullYear()) {
      return formatDate(from, "MMM d");
    } else {
      // khác năm
      return formatDate(from, "MMM d, yyyy");
    }
  }
}
