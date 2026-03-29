"use client";

import { useState, useEffect } from "react";
import { NotificationSheet } from "./notification-sheet";

export function NotificationListener() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => setShow(true);
    window.addEventListener("header:notify", handler);
    return () => window.removeEventListener("header:notify", handler);
  }, []);

  if (!show) return null;
  return <NotificationSheet onClose={() => setShow(false)} />;
}
