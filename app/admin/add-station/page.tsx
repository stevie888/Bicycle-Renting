"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useLanguage } from "@/components/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { 
  ArrowLeftIcon,
  MapPinIcon,
  BikeIcon,
  PlusIcon,
  BuildingIcon,
  MapIcon,
  DollarSignIcon,
  SaveIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  Trash2Icon,
  EditIcon,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Station {
  id: string;
  name: string;
  location: string;
  bikeCount: number;
  hourlyRate: number;
  dailyRate: number;
  status: string;
  createdAt: string;
}

function AddStationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'add' | 'pricing'>('add');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    bikeCount: 10,
    hourlyRate: 25,
    dailyRate: 250
  });
  const [stations, setStations] = useState<Station[]>([]);
  const [savingPricing, setSavingPricing] = useState(false);
  const [editingStation, setEditingStation] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Check if user is admin, if not redirect to home
  if (user && user.role !== 'admin') {
    router.push('/');
    return null;
  }

  useEffect(() => {
    loadStations();
  }, []);



  const loadStations = () => {
    try {
      const bicycles = JSON.parse(localStorage.getItem('pedalnepal_bicycles') || '[]');
      
      // Group bicycles by station name to get unique stations
      const stationMap = new Map<string, Station>();
      
      bicycles.forEach((bicycle: any, index: number) => {
        const stationName = bicycle.name || bicycle.description;
        if (!stationMap.has(stationName)) {
          stationMap.set(stationName, {
            id: `station_${stationName}_${index}`, // Ensure unique ID
            name: stationName,
            location: bicycle.location,
            bikeCount: 1, // Will be calculated
            hourlyRate: bicycle.hourlyRate || 25,
            dailyRate: bicycle.dailyRate || 250,
            status: bicycle.status,
            createdAt: bicycle.createdAt
          });
        } else {
          // Increment bike count for existing station
          const existing = stationMap.get(stationName)!;
          existing.bikeCount += 1;
          // Use the pricing from the first bike in the station (they should all have same pricing)
          if (bicycle.hourlyRate && bicycle.dailyRate) {
            existing.hourlyRate = bicycle.hourlyRate;
            existing.dailyRate = bicycle.dailyRate;
          }
        }
      });
      
      const uniqueStations = Array.from(stationMap.values());
      setStations(uniqueStations);
    } catch (error) {
      console.error('Error loading stations:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get existing bicycles
      const bicycles = JSON.parse(localStorage.getItem('pedalnepal_bicycles') || '[]');
      
      if (editingStation) {
        // Update existing station
        const updatedBicycles = bicycles.map((bicycle: any) => {
          if (bicycle.name === formData.name) {
            return {
              ...bicycle,
              location: formData.location,
              hourlyRate: formData.hourlyRate,
              dailyRate: formData.dailyRate
            };
          }
          return bicycle;
        });
        
        localStorage.setItem('pedalnepal_bicycles', JSON.stringify(updatedBicycles));
        alert(`Successfully updated station "${formData.name}"`);
        
        // Reset editing state
        setEditingStation(null);
      } else {
        // Create new station
        for (let i = 0; i < formData.bikeCount; i++) {
          const newBicycle = {
            id: (bicycles.length + i + 1).toString(),
            name: formData.name,
            description: formData.name,
            location: formData.location,
            status: 'available',
            hourlyRate: formData.hourlyRate,
            dailyRate: formData.dailyRate,
            image: '/bicycle-placeholder.jpg',
            createdAt: new Date().toISOString(),
          };
          
          bicycles.push(newBicycle);
        }
        
        localStorage.setItem('pedalnepal_bicycles', JSON.stringify(bicycles));
        alert(`Successfully created station "${formData.name}" with ${formData.bikeCount} bike(s)`);
      }
      
      // Reset form
      setFormData({
        name: '',
        location: '',
        bikeCount: 10,
        hourlyRate: 25,
        dailyRate: 250
      });
      
      // Update local state to include the new station
      setTimeout(() => {
        if (!editingStation) {
          const newStation: Station = {
            id: (bicycles.length + 1).toString(),
            name: formData.name,
            location: formData.location,
            bikeCount: formData.bikeCount,
            hourlyRate: formData.hourlyRate,
            dailyRate: formData.dailyRate,
            status: 'active',
            createdAt: new Date().toISOString()
          };
          setStations(prev => [...prev, newStation]);
        } else {
          // Update existing station in local state
          setStations(prev => prev.map(station => 
            station.name === formData.name 
              ? { ...station, location: formData.location, hourlyRate: formData.hourlyRate, dailyRate: formData.dailyRate }
              : station
          ));
        }
      }, 0);
    } catch (error) {
      console.error('Error saving station:', error);
      alert('Error saving station. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePricingChange = (stationName: string, field: 'hourlyRate' | 'dailyRate', value: number) => {
    // Validate input
    if (value < 0) {
      alert('Pricing cannot be negative');
      return;
    }

    // Use setTimeout to avoid setState during render
    setTimeout(() => {
      // Update local state
      setStations(prev => prev.map(station => 
        station.name === stationName 
          ? { ...station, [field]: value }
          : station
      ));

      // Update localStorage
      try {
        const bicycles = JSON.parse(localStorage.getItem('pedalnepal_bicycles') || '[]');
        const updatedBicycles = bicycles.map((bicycle: any) => {
          if (bicycle.name === stationName) {
            return {
              ...bicycle,
              [field]: value
            };
          }
          return bicycle;
        });
        localStorage.setItem('pedalnepal_bicycles', JSON.stringify(updatedBicycles));
        
        // Show success feedback
        setLastSaved(`${stationName} - ${field} updated to रू${value}`);
        setTimeout(() => setLastSaved(null), 3000); // Clear after 3 seconds
      } catch (error) {
        console.error('Error updating pricing:', error);
        alert('Failed to update pricing. Please try again.');
      }
    }, 0);
  };

  const handleSavePricing = async () => {
    setSavingPricing(true);
    
    try {
      const bicycles = JSON.parse(localStorage.getItem('pedalnepal_bicycles') || '[]');
      
      // Update pricing for all bicycles in each station
      const updatedBicycles = bicycles.map((bicycle: any) => {
        const station = stations.find(s => s.name === bicycle.name);
        
        if (station) {
          return {
            ...bicycle,
            hourlyRate: station.hourlyRate,
            dailyRate: station.dailyRate
          };
        }
        return bicycle;
      });
      
      localStorage.setItem('pedalnepal_bicycles', JSON.stringify(updatedBicycles));
      
      alert('Pricing updated successfully!');
    } catch (error) {
      console.error('Error saving pricing:', error);
      alert('Failed to update pricing. Please try again.');
    } finally {
      setSavingPricing(false);
    }
  };

  const resetToDefaults = () => {
    // Update local state
    setStations(prev => prev.map(station => ({
      ...station,
      hourlyRate: 25,
      dailyRate: 250
    })));

    // Use setTimeout to avoid setState during render
    setTimeout(() => {
      // Immediately update localStorage
      try {
        const bicycles = JSON.parse(localStorage.getItem('pedalnepal_bicycles') || '[]');
        const updatedBicycles = bicycles.map((bicycle: any) => ({
          ...bicycle,
          hourlyRate: 25,
          dailyRate: 250
        }));
        localStorage.setItem('pedalnepal_bicycles', JSON.stringify(updatedBicycles));
        alert('Pricing reset to defaults successfully!');
      } catch (error) {
        console.error('Error resetting pricing:', error);
        alert('Failed to reset pricing. Please try again.');
      }
    }, 0);
  };

  const deleteStation = (stationName: string) => {
    if (confirm(`Are you sure you want to delete station "${stationName}" and all its bikes?`)) {
      try {
        const bicycles = JSON.parse(localStorage.getItem('pedalnepal_bicycles') || '[]');
        const updatedBicycles = bicycles.filter((bicycle: any) => bicycle.name !== stationName);
        localStorage.setItem('pedalnepal_bicycles', JSON.stringify(updatedBicycles));
        
        // Update local state to remove the deleted station
        setTimeout(() => {
          setStations(prev => prev.filter(station => station.name !== stationName));
        }, 0);
        
        alert(`Station "${stationName}" deleted successfully!`);
      } catch (error) {
        console.error('Error deleting station:', error);
        alert('Failed to delete station. Please try again.');
      }
    }
  };

  const editStation = (station: Station) => {
    // Use setTimeout to avoid setState during render
    setTimeout(() => {
      setEditingStation(station.id);
      setFormData({
        name: station.name,
        location: station.location,
        bikeCount: station.bikeCount,
        hourlyRate: station.hourlyRate,
        dailyRate: station.dailyRate
      });
      setActiveTab('add'); // Switch to add tab for editing
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-600 transition-all duration-200 border border-primary-200 hover:border-primary-300"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Station Management
                </h1>
                <p className="text-gray-600 text-sm">Create new stations and manage slots, pricing, and operations</p>
              </div>
            </div>
                         <div className="flex items-center space-x-4">
               <Button
                 onClick={() => setActiveTab('pricing')}
                 className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
               >
                 <Settings className="w-5 h-5 mr-2" />
                 Manage Stations
               </Button>
               <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                 <MapPinIcon className="w-6 h-6 text-white" />
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-8">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'add'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <PlusIcon className="w-4 h-4 inline mr-2" />
            Add New Station
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'pricing'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Manage Stations
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'add' ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <BikeIcon className="w-6 h-6 mr-3" />
                {editingStation ? 'Edit Station' : 'Create New Station'}
              </h2>
              <p className="text-green-100 mt-2">
                {editingStation ? 'Update station details and pricing' : 'Add a new bike rental station with bikes'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Station Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <BuildingIcon className="w-4 h-4 mr-2" />
                    Station Name
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter station name"
                    required
                    className="w-full"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <MapIcon className="w-4 h-4 mr-2" />
                    Location
                  </label>
                  <Input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter location"
                    required
                    className="w-full"
                  />
                </div>

                {/* Number of Bikes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <BikeIcon className="w-4 h-4 mr-2" />
                    Number of Bikes
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={formData.bikeCount.toString()}
                    onChange={(e) => setFormData({ ...formData, bikeCount: Number(e.target.value) })}
                    placeholder="Enter number of bikes"
                    required
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Number of bikes to add to this station (1-50)</p>
                </div>

                {/* Initial Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Initial Status
                  </label>
                  <select
                    value="available"
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700"
                  >
                    <option value="available">Available</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">All bikes start as available</p>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSignIcon className="w-5 h-5 mr-2 text-orange-600" />
                  Set Pricing for This Station
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hourly Rate (रू)
                    </label>
                                         <div className="relative">
                       <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">रू</span>
                       <Input
                         type="number"
                         min="1"
                         max="1000"
                         value={formData.hourlyRate.toString()}
                         onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                         className="pl-8"
                         placeholder="25"
                         required
                       />
                     </div>
                     <p className="text-xs text-gray-500 mt-1">per hour</p>
                   </div>

                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">
                       Daily Rate (रू)
                     </label>
                     <div className="relative">
                       <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">रू</span>
                                             <Input
                         type="number"
                         min="1"
                         max="10000"
                         value={formData.dailyRate.toString()}
                         onChange={(e) => setFormData({ ...formData, dailyRate: Number(e.target.value) })}
                         className="pl-8"
                         placeholder="250"
                         required
                       />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">per day</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={() => {
                    if (editingStation) {
                      setEditingStation(null);
                      setFormData({
                        name: '',
                        location: '',
                        bikeCount: 10,
                        hourlyRate: 25,
                        dailyRate: 250
                      });
                    } else {
                      router.push('/admin');
                    }
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                >
                  {editingStation ? 'Cancel Edit' : 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                >
                  {loading ? (editingStation ? 'Updating...' : 'Creating...') : (editingStation ? 'Update Station' : 'Create Station')}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Settings className="w-6 h-6 mr-3" />
                Manage Stations
              </h2>
              <p className="text-orange-100 mt-2">Manage slots, pricing, and station operations</p>
            </div>

            <div className="p-8">
                             {/* Action Buttons */}
               <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center space-x-4">
                   <Button
                     onClick={resetToDefaults}
                     className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                   >
                     <RefreshCwIcon className="w-4 h-4 mr-2" />
                     Reset to Defaults
                   </Button>
                   <span className="text-sm text-gray-500">
                     Default: रू25/hour, रू250/day
                   </span>
                 </div>
                 <div className="flex items-center space-x-4">
                   {lastSaved && (
                     <div className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm">
                       ✓ {lastSaved}
                     </div>
                   )}
                   <Button
                     onClick={handleSavePricing}
                     disabled={savingPricing}
                     className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                   >
                     <SaveIcon className="w-4 h-4 mr-2" />
                     {savingPricing ? 'Saving...' : 'Save All Changes'}
                   </Button>
                 </div>
               </div>

              {/* Stations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stations.map((station) => (
                  <div key={station.id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                          <BikeIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{station.name}</h3>
                          <p className="text-sm text-gray-600">{station.location}</p>
                          <p className="text-xs text-gray-500">{station.bikeCount} bikes</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/admin/manage-slots?stationId=${station.name}_${station.location}`)}
                          className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                          title={t('admin.manageSlotsTitle')}
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => editStation(station)}
                          className="p-1 text-green-500 hover:text-green-700 transition-colors"
                          title={t('admin.editStationTitle')}
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteStation(station.name)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                          title={t('admin.deleteStationTitle')}
                        >
                          <Trash2Icon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Hourly Rate */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Hourly Rate (रू)
                        </label>
                                                 <div className="relative">
                           <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">रू</span>
                           <Input
                             type="number"
                             min="1"
                             max="1000"
                             value={station.hourlyRate.toString()}
                             onChange={(e) => handlePricingChange(station.name, 'hourlyRate', Number(e.target.value))}
                             className="pl-8"
                             placeholder="25"
                           />
                         </div>
                         <p className="text-xs text-gray-500 mt-1">per hour</p>
                       </div>

                       {/* Daily Rate */}
                       <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-2">
                           Daily Rate (रू)
                         </label>
                         <div className="relative">
                           <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">रू</span>
                                                     <Input
                             type="number"
                             min="1"
                             max="10000"
                             value={station.dailyRate.toString()}
                             onChange={(e) => handlePricingChange(station.name, 'dailyRate', Number(e.target.value))}
                             className="pl-8"
                             placeholder="250"
                           />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">per day</p>
                      </div>

                      {/* Slot Management Summary */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-xs text-gray-600 mb-2">Slot Status:</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Slots:</span>
                            <span className="font-semibold text-blue-600">10</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Available:</span>
                            <span className="font-semibold text-green-600">8</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Maintenance:</span>
                            <span className="font-semibold text-orange-600">2</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Occupied:</span>
                            <span className="font-semibold text-red-600">0</span>
                          </div>
                        </div>
                      </div>

                      {/* Price Summary */}
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 border border-orange-200">
                        <div className="text-xs text-gray-600 mb-2">Current Pricing:</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                     <div className="flex justify-between">
                             <span className="text-gray-600">Hourly:</span>
                             <span className="font-semibold text-orange-600">
                               रू{station.hourlyRate}
                             </span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-gray-600">Daily:</span>
                             <span className="font-semibold text-orange-600">
                               रू{station.dailyRate}
                             </span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSignIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Pricing Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="text-gray-600">Total Stations</div>
                    <div className="font-semibold text-blue-600">{stations.length}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-gray-600">Average Hourly Rate</div>
                                         <div className="font-semibold text-green-600">
                       रू{stations.length > 0 ? Math.round(stations.reduce((sum, station) => sum + station.hourlyRate, 0) / stations.length) : 0}
                     </div>
                   </div>
                   <div className="bg-white rounded-lg p-3 border border-purple-200">
                     <div className="text-gray-600">Average Daily Rate</div>
                     <div className="font-semibold text-purple-600">
                       रू{stations.length > 0 ? Math.round(stations.reduce((sum, station) => sum + station.dailyRate, 0) / stations.length) : 0}
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AddStationPageWithProtection() {
  return (
    <ProtectedRoute requireAuth={true} requireAdmin={true}>
      <AddStationPage />
    </ProtectedRoute>
  );
}
