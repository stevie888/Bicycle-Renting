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
  status: 'available' | 'rented' | 'out_of_stock';
}

interface UserRental {
  id: string;
  umbrella_id: string;
  rented_at: string;
  returned_at: string | null;
  status: string;
}

export default function UmbrellasPage() {
  const [umbrellas, setUmbrellas] = useState<Umbrella[]>([]);
  const [userRentals, setUserRentals] = useState<UserRental[]>([]);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    location: ""
  });
  const [viewUmbrella, setViewUmbrella] = useState<Umbrella | null>(null);
  const [viewRental, setViewRental] = useState<UserRental | null>(null);
  const [rentingId, setRentingId] = useState<string | null>(null);
  const [rentError, setRentError] = useState("");
  const [rentSuccess, setRentSuccess] = useState<{ station?: string, startTime?: string, endTime?: string, remainingCredits?: number } | null>(null);
  const [rentModal, setRentModal] = useState<{ umbrella: Umbrella | null, start: string, end: string, error: string } | null>(null);
  const { user } = useAuth(); // Get current user

  useEffect(() => {
    loadUmbrellas();
    if (user) {
      loadUserRentals();
      loadUserCredits();
      // Check and update expired rentals
      checkAndUpdateExpiredRentals();
    }
  }, [filters, user]);

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

  const loadUserRentals = async () => {
    if (!user) return;
    
    try {
      const response = await api.rental.getAll({ userId: user.id, status: 'active' });
      setUserRentals(response.rentals || []);
    } catch (error) {
      console.error('Error loading user rentals:', error);
    }
  };

  const getUserRentalForUmbrella = (umbrellaId: string): UserRental | null => {
    return userRentals.find(rental => rental.umbrella_id === umbrellaId) || null;
  };

  const loadUserCredits = async () => {
    if (!user) return;
    
    try {
      const response = await api.credits.getBalance(user.id);
      setUserCredits(response.credits || 0);
    } catch (error) {
      console.error('Error loading user credits:', error);
    }
  };

  const markAsReturned = async (rentalId: string) => {
    try {
      const response = await fetch(`/api/rentals/${rentalId}/return`, {
        method: 'PATCH',
      });
      
      if (response.ok) {
        // Refresh data
        await loadUserRentals();
        await loadUmbrellas();
        setViewRental(null);
        alert('Umbrella returned successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to return umbrella');
      }
    } catch (error) {
      console.error('Error returning umbrella:', error);
      alert('Failed to return umbrella');
    }
  };

  const checkAndUpdateExpiredRentals = async () => {
    try {
      const response = await fetch('/api/rentals/auto-update', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.updatedCount > 0) {
          // Refresh data if any rentals were updated
          await loadUserRentals();
          await loadUmbrellas();
        }
      }
    } catch (error) {
      console.error('Error updating expired rentals:', error);
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
      // Refresh user rentals and credits after successful rental
      await loadUserRentals();
      await loadUserCredits();
      setRentSuccess({ 
        station: umbrella.location, 
        startTime: start.toLocaleString('en-US', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }), 
        endTime: end.toLocaleString('en-US', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        remainingCredits: userCredits - 50 // 50 credits per rental
      });
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Umbrellas</h1>
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-lg">
              <span className="text-yellow-800 font-semibold">Credits:</span>
              <span className="text-yellow-900 font-bold text-lg">{userCredits}</span>
              <span className="text-yellow-600 text-sm">(50 per rental)</span>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => window.open('/manage-rentals.html', '_blank')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              🔍 Check Expired Rentals
            </Button>
          </div>
        )}
      </div>
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
            <option value="out_of_stock">Out of Stock</option>
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
                getUserRentalForUmbrella(umbrella.id) ? 'bg-orange-100 text-orange-700' :
                umbrella.status === 'available' ? 'bg-green-100 text-green-700' :
                umbrella.status === 'out_of_stock' ? 'bg-red-100 text-red-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {getUserRentalForUmbrella(umbrella.id) ? 'Rented' :
                 umbrella.status === 'out_of_stock' ? 'Out of Stock' : 
                 umbrella.status.charAt(0).toUpperCase() + umbrella.status.slice(1)}
              </span>
              <div className="text-sm text-gray-600 mb-2">{umbrella.description}</div>
              <div className="flex gap-2 mt-2">
                <Button className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600" onClick={() => setViewUmbrella(umbrella)}>View</Button>
                {umbrella.status === 'available' && !getUserRentalForUmbrella(umbrella.id) && userCredits >= 50 && (
                  <Button
                    className={`px-4 py-1 rounded ${
                      userCredits >= 50 
                        ? 'bg-green-500 text-white hover:bg-green-600' 
                        : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    }`}
                    onClick={() => {
                      if (userCredits < 50) {
                        setRentError("Insufficient credits. You need 50 credits to rent an umbrella.");
                        return;
                      }
                      const now = new Date();
                      const defaultEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                      setRentModal({
                        umbrella,
                        start: now.toISOString().slice(0, 16),
                        end: defaultEnd.toISOString().slice(0, 16),
                        error: ""
                      });
                    }}
                    disabled={rentingId === umbrella.id || userCredits < 50}
                  >
                    {userCredits >= 50 ? 'Rent Now' : 'Insufficient Credits'}
                  </Button>
                )}
                {getUserRentalForUmbrella(umbrella.id) && (
                  <Button
                    className="bg-orange-500 text-white px-4 py-1 rounded hover:bg-orange-600"
                    onClick={() => setViewRental(getUserRentalForUmbrella(umbrella.id))}
                  >
                    View Rental
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
            <div className="mb-2"><strong>Status:</strong> {getUserRentalForUmbrella(viewUmbrella.id) ? 'Rented' : viewUmbrella.status}</div>
            <Button className="mt-4" onClick={() => setViewUmbrella(null)}>Close</Button>
          </div>
        </Modal>
      )}
      {/* Rental View Modal */}
      {viewRental && (
        <Modal isOpen={!!viewRental} onClose={() => setViewRental(null)}>
          <div className="p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-2">Your Rental Details</h2>
            <div className="mb-2">
              <strong>Rental ID:</strong> {viewRental.id}
            </div>
            <div className="mb-2">
              <strong>Rented At:</strong> {new Date(viewRental.rented_at).toLocaleString()}
            </div>
            <div className="mb-2">
              <strong>Return Deadline:</strong> {viewRental.returned_at ? new Date(viewRental.returned_at).toLocaleString() : 'Not specified'}
            </div>
            <div className="mb-2">
              <strong>Status:</strong> 
              <span className={`ml-2 px-2 py-1 text-xs rounded ${
                viewRental.status === 'active' ? 'bg-green-100 text-green-700' :
                viewRental.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {viewRental.status.charAt(0).toUpperCase() + viewRental.status.slice(1)}
              </span>
            </div>
            
            {/* Check if rental is expired */}
            {viewRental.returned_at && new Date(viewRental.returned_at) < new Date() && viewRental.status === 'active' && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
                <strong>⚠️ Overdue:</strong> This rental has passed its return deadline.
              </div>
            )}
            
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
              <strong>Important:</strong> Please return your umbrella by the deadline to avoid late fees.
            </div>
            
            <div className="flex gap-2 mt-4">
              {viewRental.status === 'active' && (
                <Button 
                  className="bg-green-500 text-white hover:bg-green-600"
                  onClick={() => markAsReturned(viewRental.id)}
                >
                  Mark as Returned
                </Button>
              )}
              <Button variant="ghost" onClick={() => setViewRental(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
      {rentSuccess && (
        <Modal isOpen={!!rentSuccess} onClose={() => setRentSuccess(null)} title="Rental Successful!">
          <div className="p-4 text-center">
            <div className="text-lg font-semibold mb-2">Umbrella rented successfully!</div>
            <div className="mb-2">Station: <span className="font-bold">{rentSuccess.station}</span></div>
            <div className="mb-2">
              <div className="text-sm text-gray-600 mb-1">Rental Period:</div>
              <div className="font-bold">
                <div>From: {rentSuccess.startTime}</div>
                <div>To: {rentSuccess.endTime}</div>
              </div>
            </div>
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
              <div className="text-green-800 font-semibold">Credits Updated</div>
              <div className="text-green-700">Remaining Credits: <span className="font-bold">{rentSuccess.remainingCredits}</span></div>
            </div>
            <Button className="mt-4" onClick={() => setRentSuccess(null)}>OK</Button>
          </div>
        </Modal>
      )}
      {/* Rent Modal */}
      {rentModal && rentModal.umbrella && (
        <Modal isOpen={!!rentModal} onClose={() => setRentModal(null)} title="Select Rental Time Frame">
          <div className="p-4">
            <div className="mb-2 font-semibold">Station: {rentModal.umbrella.location}</div>
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex justify-between items-center">
                <span className="text-yellow-800 font-semibold">Credit Cost:</span>
                <span className="text-yellow-900 font-bold">50 credits</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-yellow-600">Your Balance:</span>
                <span className="text-yellow-700 font-semibold">{userCredits} credits</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-yellow-600">Remaining After Rental:</span>
                <span className="text-yellow-700 font-semibold">{userCredits - 50} credits</span>
              </div>
            </div>
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