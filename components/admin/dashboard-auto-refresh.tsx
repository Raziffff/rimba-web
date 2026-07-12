"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

type DashboardAutoRefreshProps = {
  intervalMs?: number;
};

export default function DashboardAutoRefresh({
  intervalMs = 10000,
}: DashboardAutoRefreshProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/admin") {
      return;
    }

    const intervalId = window.setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [intervalMs, pathname, router]);

  return null;
}
