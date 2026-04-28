"use client";

import Link from "next/link";
import { PlusIcon } from "lucide-react";

export function NewOrderFab() {
  return (
    <Link
      href="/orders/new"
      className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95 transition-all lg:bottom-6 lg:right-6"
      aria-label="New Order"
    >
      <PlusIcon className="h-6 w-6" strokeWidth={2.5} />
    </Link>
  );
}
