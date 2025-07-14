"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import { useAuth } from "@/components/AuthContext";

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
  const [viewUmbrella, setViewUmbrella] = useState<Umbrella | null>(null);
  const [rentingId, setRentingId] = useState<string | null>(null);
  const [rentError, setRentError] = useState("");
  const [rentSuccess, setRentSuccess] = useState<{ station?: string, time?: string } | null>(null);
  const [rentModal, setRentModal] = useState<{ umbrella: Umbrella | null, start: string, end: string, error: string } | null>(null);
  const { user } = useAuth(); // Get current user

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

  const handleRent = async (umbrella: Umbrella, startTime?: string, endTime?: string) => {
    if (!user) {
      setRentError("You must be logged in to rent an umbrella.");
      return;
    }
    setRentingId(umbrella.id);
    setRentError("");
    try {
      const now = new Date();
      const start = startTime ? new Date(startTime) : now;
      const end = endTime ? new Date(endTime) : new Date(start.getTime() + 24 * 60 * 60 * 1000);
      await api.rental.create({ userId: user.id, umbrellaId: umbrella.id, startTime: start.toISOString(), endTime: end.toISOString() });
      setUmbrellas((prev) => prev.map(u => u.id === umbrella.id ? { ...u, status: 'rented' } : u));
      setRentSuccess({ station: umbrella.location, time: start.toLocaleString() });
      setRentModal(null);
    } catch (err: any) {
      setRentError(err?.message || "Failed to rent umbrella");
    } finally {
      setRentingId(null);
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
                <Button className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600" onClick={() => setViewUmbrella(umbrella)}>View</Button>
                {umbrella.status === 'available' && (
                  <Button
                    className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                    onClick={() => {
                      const now = new Date();
                      const defaultEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                      setRentModal({
                        umbrella,
                        start: now.toISOString().slice(0, 16),
                        end: defaultEnd.toISOString().slice(0, 16),
                        error: ""
                      });
                    }}
                    disabled={rentingId === umbrella.id}
                  >
                    Rent Now
                  </Button>
                )}
              </div>
              {rentError && rentingId === umbrella.id && (
                <div className="text-xs text-red-500 mt-1">{rentError}</div>
              )}
            </div>
          ))
        )}
      </div>
      {/* View Modal */}
      {viewUmbrella && (
        <Modal isOpen={!!viewUmbrella} onClose={() => setViewUmbrella(null)}>
          <div className="p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-2">Umbrella Details</h2>
            <div className="mb-2"><strong>Location:</strong> {viewUmbrella.location}</div>
            <div className="mb-2"><strong>Description:</strong> {viewUmbrella.description}</div>
            <div className="mb-2"><strong>Status:</strong> {viewUmbrella.status}</div>
            <Button className="mt-4" onClick={() => setViewUmbrella(null)}>Close</Button>
          </div>
        </Modal>
      )}
      {rentSuccess && (
        <Modal isOpen={!!rentSuccess} onClose={() => setRentSuccess(null)} title="Rental Successful!">
          <div className="p-4 text-center">
            <div className="text-lg font-semibold mb-2">Umbrella rented successfully!</div>
            <div>Station: <span className="font-bold">{rentSuccess.station}</span></div>
            <div>Time: <span className="font-bold">{rentSuccess.time}</span></div>
            <Button className="mt-4" onClick={() => setRentSuccess(null)}>OK</Button>
          </div>
        </Modal>
      )}
      {/* Rent Modal */}
      {rentModal && rentModal.umbrella && (
        <Modal isOpen={!!rentModal} onClose={() => setRentModal(null)} title="Select Rental Time Frame">
          <div className="p-4">
            <div className="mb-2 font-semibold">Station: {rentModal.umbrella.location}</div>
            <div className="mb-2">Select start and end time (max 2 days):</div>
            <div className="flex flex-col gap-2 mb-2">
              <label>
                Start:
                <input
                  type="datetime-local"
                  value={rentModal.start}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={e => setRentModal(m => m && { ...m, start: e.target.value })}
                  className="border rounded px-2 py-1 ml-2"
                />
              </label>
              <label>
                End:
                <input
                  type="datetime-local"
                  value={rentModal.end}
                  min={rentModal.start}
                  max={(() => {
                    const max = new Date(rentModal.start);
                    max.setDate(max.getDate() + 2);
                    return max.toISOString().slice(0, 16);
                  })()}
                  onChange={e => setRentModal(m => m && { ...m, end: e.target.value })}
                  className="border rounded px-2 py-1 ml-2"
                />
              </label>
            </div>
            {rentModal.error && <div className="text-red-500 mb-2">{rentModal.error}</div>}
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setRentModal(null)}>Cancel</Button>
              <Button
                className="bg-green-500 text-white"
                onClick={() => {
                  const start = new Date(rentModal.start);
                  const end = new Date(rentModal.end);
                  if (end <= start) {
                    setRentModal(m => m && { ...m, error: "End time must be after start time." });
                    return;
                  }
                  if ((end.getTime() - start.getTime()) > 2 * 24 * 60 * 60 * 1000) {
                    setRentModal(m => m && { ...m, error: "Cannot rent for more than 2 days." });
                    return;
                  }
                  handleRent(rentModal.umbrella!, rentModal.start, rentModal.end);
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
} 