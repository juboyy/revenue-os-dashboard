"use client";

import { useEffect } from "react";
import { useDashboardStore } from "../lib/store";

export default function StoreInitializer() {
  const initialize = useDashboardStore((s) => s.initialize);
  useEffect(() => { initialize(); }, [initialize]);
  return null;
}
