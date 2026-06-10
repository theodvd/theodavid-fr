"use client";

import { useEffect, useState } from "react";

/**
 * Ticking Paris clock for the footer.
 * Renders empty on the server to avoid a hydration mismatch.
 */
export default function LocalTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Europe/Paris",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono tabular-nums" suppressHydrationWarning>
      {time && `PARIS ${time}`}
    </span>
  );
}
