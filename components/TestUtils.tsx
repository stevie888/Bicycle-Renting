"use client";

import { useEffect } from "react";

export default function TestUtils() {
  useEffect(() => {
    // Load test utilities only in development
    if (process.env.NODE_ENV === "development") {
      import("@/lib/testUsers").then(() => {
        console.log("Test utilities loaded. Available functions:");
        console.log("- createTestUsers(): Create test users");
        console.log("- clearTestData(): Clear all test data");
      });
    }
  }, []);

  return null; // This component doesn't render anything
}
