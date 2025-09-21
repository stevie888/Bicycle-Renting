"use client";

// Force dynamic rendering to prevent prerendering issues
export const dynamic = "force-dynamic";

import { useState } from "react";
import { api } from "@/lib/api";

export default function TestAPIsPage() {
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runAllTests = async () => {
    setLoading(true);
    const results: any = {};

    try {
      console.log("🧪 Starting comprehensive API tests...");

      // Test User APIs
      console.log("\n=== Testing User APIs ===");
      try {
        results.userPagination = await api.user.getPaginated(1, 5);
        console.log("✅ User Pagination:", results.userPagination);
      } catch (error) {
        results.userPagination = { error: String(error) };
        console.error("❌ User Pagination failed:", error);
      }

      try {
        results.customerUsers = await api.user.getCustomerUsers({ search: "samir" });
        console.log("✅ Customer Users:", results.customerUsers);
      } catch (error) {
        results.customerUsers = { error: String(error) };
        console.error("❌ Customer Users failed:", error);
      }

      try {
        results.adminUsers = await api.user.getAdminUsers();
        console.log("✅ Admin Users:", results.adminUsers);
      } catch (error) {
        results.adminUsers = { error: String(error) };
        console.error("❌ Admin Users failed:", error);
      }

      try {
        results.allUsersStatus = await api.user.getAllUsersStatus();
        console.log("✅ All Users Status:", results.allUsersStatus);
      } catch (error) {
        results.allUsersStatus = { error: String(error) };
        console.error("❌ All Users Status failed:", error);
      }

      // Test Station APIs
      console.log("\n=== Testing Station APIs ===");
      try {
        results.stationList = await api.stations.list({ search: "Station", page: 1, limit: 5 });
        console.log("✅ Station List:", results.stationList);
      } catch (error) {
        results.stationList = { error: String(error) };
        console.error("❌ Station List failed:", error);
      }

      try {
        results.stationServicesDetails = await api.stations.getAllStationsServicesDetails();
        console.log("✅ Station Services Details:", results.stationServicesDetails);
      } catch (error) {
        results.stationServicesDetails = { error: String(error) };
        console.error("❌ Station Services Details failed:", error);
      }

      try {
        results.stationServicesStatus = await api.stations.getAllStationsServicesStatus();
        console.log("✅ Station Services Status:", results.stationServicesStatus);
      } catch (error) {
        results.stationServicesStatus = { error: String(error) };
        console.error("❌ Station Services Status failed:", error);
      }

      try {
        results.slotStats = await api.stations.getSlotStats("1");
        console.log("✅ Slot Stats:", results.slotStats);
      } catch (error) {
        results.slotStats = { error: String(error) };
        console.error("❌ Slot Stats failed:", error);
      }

      // Test Rental APIs
      console.log("\n=== Testing Rental APIs ===");
      try {
        results.rentals = await api.rental.getRentals({ page: 1, limit: 5 });
        console.log("✅ Rentals:", results.rentals);
      } catch (error) {
        results.rentals = { error: String(error) };
        console.error("❌ Rentals failed:", error);
      }

      // Test existing APIs
      console.log("\n=== Testing Existing APIs ===");
      try {
        results.stations = await api.stations.getAll();
        console.log("✅ Stations:", results.stations);
      } catch (error) {
        results.stations = { error: String(error) };
        console.error("❌ Stations failed:", error);
      }

      try {
        results.services = await api.services.getAll();
        console.log("✅ Services:", results.services);
      } catch (error) {
        results.services = { error: String(error) };
        console.error("❌ Services failed:", error);
      }

      try {
        results.s3Url = await api.aws.getS3PresignedUrl("test.jpg", "image/jpeg");
        console.log("✅ S3 URL:", results.s3Url);
      } catch (error) {
        results.s3Url = { error: String(error) };
        console.error("❌ S3 URL failed:", error);
      }

      // Test Auth APIs
      console.log("\n=== Testing Auth APIs ===");
      try {
        // Test with existing user
        results.authTest = await api.auth.login("9869251081", "123");
        console.log("✅ Auth Login:", results.authTest);
      } catch (error) {
        results.authTest = { error: String(error) };
        console.error("❌ Auth Login failed:", error);
      }

      console.log("\n✅ All API tests completed!");
      setTestResults(results);

    } catch (error) {
      console.error("❌ Test suite failed:", error);
      setTestResults({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testExternalAPIs = async () => {
    setLoading(true);
    const results: any = {};

    try {
      console.log("🌐 Testing external API endpoints...");
      const baseUrl = process.env.NEXT_PUBLIC_EXTERNAL_API_BASE_URL || "http://13.204.148.32";
      
      const endpoints = [
        { url: `${baseUrl}/user?page=1&limit=5`, method: "GET", name: "User Pagination" },
        { url: `${baseUrl}/user/customer-users`, method: "GET", name: "Customer Users" },
        { url: `${baseUrl}/user/admin-users`, method: "GET", name: "Admin Users" },
        { url: `${baseUrl}/user/all-users-status`, method: "GET", name: "All Users Status" },
        { url: `${baseUrl}/stations/list?page=1&limit=5`, method: "GET", name: "Station List" },
        { url: `${baseUrl}/stations/all-stations-services-details`, method: "GET", name: "Station Services Details" },
        { url: `${baseUrl}/stations/all-stations-services-status`, method: "GET", name: "Station Services Status" },
        { url: `${baseUrl}/stations/slot-stats`, method: "GET", name: "Slot Stats" },
        { url: `${baseUrl}/rentals?page=1&limit=5`, method: "GET", name: "Rentals" },
        { url: `${baseUrl}/stations`, method: "GET", name: "Stations" },
        { url: `${baseUrl}/services`, method: "GET", name: "Services" },
        { url: `${baseUrl}/aws-services/s3-presigned-url`, method: "POST", name: "S3 Presigned URL" },
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: endpoint.method,
            headers: { "Content-Type": "application/json" },
            body: endpoint.method === "POST" ? JSON.stringify({ fileName: "test.jpg", fileType: "image/jpeg" }) : undefined,
          });
          results[endpoint.name] = {
            status: response.status,
            statusText: response.statusText,
            success: response.ok
          };
          console.log(`${endpoint.name}: ${response.status} ${response.statusText}`);
        } catch (error) {
          results[endpoint.name] = { error: String(error), success: false };
          console.log(`${endpoint.name}: Failed - ${error}`);
        }
      }
      
      console.log("✅ External API tests completed!");
      setTestResults(results);

    } catch (error) {
      console.error("❌ External API test failed:", error);
      setTestResults({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API Integration Test Suite</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={runAllTests}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium"
          >
            {loading ? "Testing..." : "Test All APIs (Local + Fallback)"}
          </button>
          
          <button
            onClick={testExternalAPIs}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-medium"
          >
            {loading ? "Testing..." : "Test External APIs Only"}
          </button>
        </div>

        {Object.keys(testResults).length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
            <div className="space-y-4">
              {Object.entries(testResults).map(([key, value]) => (
                <div key={key} className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{key}</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Available Test Functions</h3>
          <p className="text-blue-800 mb-4">You can also test APIs directly in the browser console:</p>
          <div className="space-y-2 text-sm font-mono bg-blue-100 p-3 rounded">
            <div>testAllNewAPIs() - Test all new APIs locally</div>
            <div>testExternalAllAPIs() - Test external API endpoints</div>
            <div>api.user.getPaginated(1, 5) - Test user pagination</div>
            <div>api.stations.list({`{search: "Station"}`}) - Test station search</div>
            <div>api.rental.getRentals({`{page: 1, limit: 10}`}) - Test rentals</div>
          </div>
        </div>
      </div>
    </div>
  );
}
