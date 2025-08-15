'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, CheckCircle, Wrench, AlertTriangle } from 'lucide-react';

interface Slot {
  id: string;
  slotNumber: number;
  status: 'active' | 'in-maintenance';
  lastUpdated: string;
  notes?: string;
}

function ManageSlots() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const stationId = searchParams.get('stationId');
  
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [stationName, setStationName] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [newStatus, setNewStatus] = useState<'active' | 'in-maintenance'>('active');
  const [maintenanceNotes, setMaintenanceNotes] = useState('');

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }
    
    if (stationId) {
      fetchStationData();
      fetchSlots();
    }
  }, [user, stationId, router]);

  const fetchStationData = () => {
    try {
      if (!stationId) return;
      
      // Parse the station key to get name and location
      const [stationName, stationLocation] = stationId.split('_');
      setStationName(stationName);
    } catch (error) {
      console.error('Error fetching station data:', error);
    }
  };

  const fetchSlots = () => {
    try {
      if (!stationId) {
        console.error('No station ID provided');
        setLoading(false);
        return;
      }

      // Get slots from localStorage or create default ones
      const slotsKey = `paddlenepal_slots_${stationId}`; // stationId is now a station key like "StationName_Location"
      let existingSlots = JSON.parse(localStorage.getItem(slotsKey) || '[]');

      // Parse the station key to get name and location
      const [stationName, stationLocation] = stationId.split('_');
      
      // Always use 10 slots per station for consistency
      const targetSlotCount = 10;

      // If no slots exist or if we need to reset to the correct count, create new slots
      if (existingSlots.length === 0 || existingSlots.length !== targetSlotCount) {
        existingSlots = Array.from({ length: targetSlotCount }, (_, index) => ({
          id: `slot_${stationId}_${index + 1}`,
          slotNumber: index + 1,
          // Keep slots 9 and 10 empty for bike returns
          status: (index >= 8) ? 'in-maintenance' as const : 'active' as const,
          lastUpdated: new Date().toISOString(),
          notes: index >= 8 ? 'Reserved for bike returns' : ''
        }));
        localStorage.setItem(slotsKey, JSON.stringify(existingSlots));
      }

      setSlots(existingSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const openStatusChangeModal = (slot: Slot, newStatus: 'active' | 'in-maintenance') => {
    setSelectedSlot(slot);
    setNewStatus(newStatus);
    setMaintenanceNotes('');
    setShowConfirmModal(true);
  };

  const confirmStatusChange = () => {
    if (!selectedSlot) return;

    try {
      const updatedSlots = slots.map(slot => 
        slot.id === selectedSlot.id 
          ? {
              ...slot,
              status: newStatus,
              lastUpdated: new Date().toISOString(),
              notes: newStatus === 'in-maintenance' ? maintenanceNotes : ''
            }
          : slot
      );
      
      // Save to localStorage
      const slotsKey = `paddlenepal_slots_${stationId}`;
      localStorage.setItem(slotsKey, JSON.stringify(updatedSlots));
      
      setSlots(updatedSlots);
      setShowConfirmModal(false);
      setSelectedSlot(null);
      setMaintenanceNotes('');
      
      // Show success message
      alert(`Slot ${selectedSlot.slotNumber} status updated to ${newStatus === 'active' ? 'Active' : 'In-Maintenance'}`);
      
      // Trigger a custom event to notify parent page of changes
      window.dispatchEvent(new CustomEvent('slotStatusChanged', {
        detail: { stationId, slotNumber: selectedSlot.slotNumber, newStatus }
      }));
    } catch (error) {
      console.error('Error updating slot status:', error);
      alert('Failed to update slot status');
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 border border-green-300'
      : 'bg-orange-100 text-orange-800 border border-orange-300';
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' ? CheckCircle : Wrench;
  };

  const resetTo10Slots = () => {
    if (confirm('This will reset all slots to exactly 10 slots. Continue?')) {
      try {
        const slotsKey = `paddlenepal_slots_${stationId}`;
        
        // Create exactly 10 slots
        const newSlots = Array.from({ length: 10 }, (_, index) => ({
          id: `slot_${stationId}_${index + 1}`,
          slotNumber: index + 1,
          status: 'active' as const,
          lastUpdated: new Date().toISOString(),
          notes: ''
        }));
        
        localStorage.setItem(slotsKey, JSON.stringify(newSlots));
        setSlots(newSlots);
        alert('Reset to 10 slots successfully!');
      } catch (error) {
        console.error('Error resetting slots:', error);
        alert('Failed to reset slots');
      }
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">Loading Slot Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-gray-100 sticky top-0 z-20">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  Slot Management
                </h1>
                <p className="text-gray-600 text-xs">{stationName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={resetTo10Slots}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
              >
                Reset to 10 Slots
              </button>
              <div className="text-right">
                <div className="text-xs text-gray-500">Total Slots</div>
                <div className="text-sm font-semibold text-gray-900">{slots.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-xl">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">
                {slots.filter(slot => slot.status === 'active' && !slot.notes?.includes('Reserved for bike returns')).length}
              </div>
              <div className="text-xs text-green-100">Available Slots</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-xl">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">
                {slots.filter(slot => slot.notes?.includes('Reserved for bike returns')).length}
              </div>
              <div className="text-xs text-purple-100">Reserved for Returns</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white shadow-xl">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">
                {slots.filter(slot => slot.status === 'in-maintenance' && !slot.notes?.includes('Reserved for bike returns')).length}
              </div>
              <div className="text-xs text-orange-100">In Maintenance</div>
            </div>
          </div>
        </div>

        {/* Slots Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
            <h3 className="text-white font-semibold flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Slot Management - {stationName}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {slots.map((slot) => {
                  const StatusIcon = getStatusIcon(slot.status);
                  return (
                    <tr key={slot.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                            {slot.slotNumber}
                          </div>
                          <div className="text-sm font-medium text-gray-900">Slot {slot.slotNumber}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs rounded-full font-semibold flex items-center w-fit ${getStatusColor(slot.status)}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {slot.notes?.includes('Reserved for bike returns') ? 'Reserved for Returns' : (slot.status === 'active' ? 'Active' : 'In-Maintenance')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(slot.lastUpdated).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className={`truncate ${slot.notes?.includes('Reserved for bike returns') ? 'font-semibold text-purple-600' : ''}`}>
                          {slot.notes || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {slot.notes?.includes('Reserved for bike returns') ? (
                            <span className="text-purple-600 text-xs font-medium px-2 py-1 bg-purple-100 rounded-lg">
                              Reserved
                            </span>
                          ) : slot.status === 'active' ? (
                            <button
                              onClick={() => openStatusChangeModal(slot, 'in-maintenance')}
                              className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-lg text-xs flex items-center"
                            >
                              <Wrench className="w-3 h-3 mr-1" />
                              Set Maintenance
                            </button>
                          ) : (
                            <button
                              onClick={() => openStatusChangeModal(slot, 'active')}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs flex items-center"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Set Active
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {slots.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Slots Found</h3>
            <p className="text-gray-600">No slots available for this station.</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm Status Change</h3>
              <p className="text-gray-600">Change slot {selectedSlot.slotNumber} status</p>
            </div>
            
            {/* Current Status */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">Slot {selectedSlot.slotNumber}</div>
                  <div className="text-sm text-gray-600">Current: {selectedSlot.status === 'active' ? 'Active' : 'In-Maintenance'}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">New Status</div>
                  <div className={`text-lg font-bold ${newStatus === 'active' ? 'text-green-600' : 'text-orange-600'}`}>
                    {newStatus === 'active' ? 'Active' : 'In-Maintenance'}
                  </div>
                </div>
              </div>
            </div>

            {/* Maintenance Notes (if setting to maintenance) */}
            {newStatus === 'in-maintenance' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Maintenance Notes (Optional)</label>
                <textarea
                  value={maintenanceNotes}
                  onChange={(e) => setMaintenanceNotes(e.target.value)}
                  placeholder="Enter maintenance details..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white resize-none"
                  rows={3}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmStatusChange}
                className={`flex-1 py-3 px-4 rounded-xl font-medium text-white ${
                  newStatus === 'active'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                    : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
                }`}
              >
                Confirm Change
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ManageSlotsWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <ManageSlots />
    </ErrorBoundary>
  );
}
