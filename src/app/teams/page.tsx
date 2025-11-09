"use client";

import { useEffect, useState } from "react";

export default function TimezoneDetector() {
  const [timezone, setTimezone] = useState<string | null>(null);

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(tz);
  }, []);

  return <div>Your timezone: {timezone ?? "Detecting..."}</div>;
}
