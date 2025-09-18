"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function APITestComponent() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testAllAPIs = async () => {
    setLoading(true);
    setResults(null);

    try {
      const testResults = {
        stations: null as any,
        services: null as any,
        aws: null as any,
        error: null as string | null,
      };

      // Test Stations API
      try {
        const stations = await api.stations.getAll();
        testResults.stations = stations;
        console.log("✅ Stations API working:", stations);
      } catch (error) {
        console.error("❌ Stations API failed:", error);
        testResults.error = String(error);
      }

      // Test Services API
      try {
        const services = await api.services.getAll();
        testResults.services = services;
        console.log("✅ Services API working:", services);
      } catch (error) {
        console.error("❌ Services API failed:", error);
        testResults.error = String(error);
      }

      // Test AWS API
      try {
        const s3Url = await api.aws.getS3PresignedUrl("test-image.jpg", "image/jpeg");
        testResults.aws = s3Url;
        console.log("✅ AWS API working:", s3Url);
      } catch (error) {
        console.error("❌ AWS API failed:", error);
        testResults.error = String(error);
      }

      setResults(testResults);
    } catch (error) {
      console.error("❌ API test failed:", error);
      setResults({ error: error });
    } finally {
      setLoading(false);
    }
  };

  const createTestStation = async () => {
    setLoading(true);
    try {
      const newStation = await api.stations.create({
        name: "Test Station",
        location: "Test Location",
        capacity: 25,
        status: "ACTIVE",
      });
      console.log("✅ Station created:", newStation);
      alert("Station created successfully! Check console for details.");
    } catch (error) {
      console.error("❌ Failed to create station:", error);
      alert("Failed to create station. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const createTestService = async () => {
    setLoading(true);
    try {
      const newService = await api.services.create({
        name: "Test Service",
        stationId: 1,
        serviceType: "Rental",
        status: "ACTIVE",
      });
      console.log("✅ Service created:", newService);
      alert("Service created successfully! Check console for details.");
    } catch (error) {
      console.error("❌ Failed to create service:", error);
      alert("Failed to create service. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">API Integration Test</h2>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={testAllAPIs}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test All APIs"}
          </button>
          
          <button
            onClick={createTestStation}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Create Test Station
          </button>
          
          <button
            onClick={createTestService}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Create Test Service
          </button>
        </div>

        {results && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
            <div className="bg-gray-100 p-4 rounded">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Available APIs:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><code>api.stations.getAll()</code> - Get all stations</li>
            <li><code>api.stations.create(data)</code> - Create new station</li>
            <li><code>api.stations.getById(id)</code> - Get station by ID</li>
            <li><code>api.services.getAll()</code> - Get all services</li>
            <li><code>api.services.create(data)</code> - Create new service</li>
            <li><code>api.services.getById(id)</code> - Get service by ID</li>
            <li><code>api.services.getByStationId(id)</code> - Get services by station</li>
            <li><code>api.aws.getS3PresignedUrl(fileName, fileType)</code> - Get S3 presigned URL</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
