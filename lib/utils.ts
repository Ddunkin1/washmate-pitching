import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PLATFORM_FEE_RATE = 0.10;
export const runnerEarnings = (price: number) => price * (1 - PLATFORM_FEE_RATE);
export const platformFee = (price: number) => price * PLATFORM_FEE_RATE;

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Waiting for Runner",
  ACCEPTED: "Runner Assigned",
  PICKED_UP: "Picked Up",
  WASHING: "Being Washed",
  READY: "Ready for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export type LaundryItem = { name: string; qty: number };

export function parseItems(raw: string): LaundryItem[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) =>
      typeof item === "string" ? { name: item, qty: 1 } : item
    );
  } catch {
    return [];
  }
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-blue-100 text-blue-800",
  PICKED_UP: "bg-indigo-100 text-indigo-800",
  WASHING: "bg-purple-100 text-purple-800",
  READY: "bg-teal-100 text-teal-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};
