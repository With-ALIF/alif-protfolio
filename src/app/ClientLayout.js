"use client";

import { useEffect, useState } from "react";

export default function ClientLayout({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div data-theme="" className={`min-h-screen ${mounted ? "" : ""}`}>
      {children}
    </div>
  );
}
