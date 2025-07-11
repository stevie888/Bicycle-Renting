"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Umbrella {
  id: string;
  description: string;
  location: string;
  status: 'available' | 'rented';
}

export default function UmbrellasPage() {
  const [umbrellas, setUmbrellas] = useState<Umbrella[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    location: ""
  });

  useEffect(() => {
    loadUmbrellas();
  }, [filters]);

  const loadUmbrellas = async () => {
    try {
      setLoading(true);
      const response = await api.umbrella.getAll({
        status: filters.status || undefined,
        location: filters.location || undefined
      });
      setUmbrellas(response.umbrellas || []);
    } catch (error) {
      console.error('Error loading umbrellas:', error);
      setError("Failed to load umbrellas");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6">
        <div className="text-center">Loading umbrellas...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-6">Umbrellas</h1>
      
      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-800 border border-red-300">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border px-3 py-2 rounded-md"
          >
            <option value="">All</option>
            <option value="available">Available</option>
            <option value="rented">Rented</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <Input
            placeholder="Filter by location"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          />
        </div>
      </div>

      {/* Umbrellas List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {umbrellas.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No umbrellas found.
          </div>
        ) : (
          umbrellas.map((umbrella) => (
            <div key={umbrella.id} className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center hover:shadow-lg transition">
              <div className="text-gray-700 font-bold mb-1">{umbrella.location}</div>
              <span className={`px-2 py-1 rounded text-xs font-semibold mb-2 ${
                umbrella.status === 'available' ? 'bg-green-100 text-green-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {umbrella.status.charAt(0).toUpperCase() + umbrella.status.slice(1)}
              </span>
              <div className="text-sm text-gray-600 mb-2">{umbrella.description}</div>
              <div className="flex gap-2 mt-2">
                <Button className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">View</Button>
                {umbrella.status === 'available' && (
                  <Button className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600">Rent Now</Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 