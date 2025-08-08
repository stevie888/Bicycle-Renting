"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { 
  BikeIcon, 
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  CalendarIcon
} from "lucide-react";

interface Rental {
  id: string;
  bikeId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  status: string;
  price: number;
  duration: 'hourly' | 'daily';
  hours?: number;
  bikeName: string;
  station: string;
  slotNumber: number;
}

export default function MyRentalsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Get rentals for the current user
    const allRentals = JSON.parse(localStorage.getItem('paddlenepal_rentals') || '[]');
    const userRentals = allRentals.filter((rental: any) => rental.userId === user.id);
    setRentals(userRentals);
    setLoading(false);
  }, [user, router]);

  const formatDuration = (duration: 'hourly' | 'daily', hours?: number) => {
    if (duration === 'hourly') {
      return hours && hours > 1 ? `${hours} Hours` : '1 Hour';
    }
    return 'Daily';
  };

  const formatPrice = (price: number, duration: 'hourly' | 'daily', hours?: number) => {
    if (duration === 'hourly') {
      return hours && hours > 1 ? `रू${price} (रू25 × ${hours} hours)` : `रू${price}/hour`;
    }
    return `रू${price}/day`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'cancelled':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your rentals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/rental-confirmation')}
            className="group flex items-center gap-3 px-4 py-2 bg-white hover:bg-primary-50 text-primary-600 hover:text-primary-700 font-medium rounded-lg border border-gray-200 hover:border-primary-300 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-x-1"
          >
            <ArrowLeftIcon className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>Back</span>
          </button>
        </div>
        {rentals.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
            <BikeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rentals Yet</h3>
            <p className="text-gray-600 mb-6">You haven't rented any bikes yet. Start your adventure today!</p>
            <button
              onClick={() => router.push('/bicycles')}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Rent a Bike
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                <h2 className="text-white font-semibold flex items-center">
                  <BikeIcon className="w-5 h-5 mr-2" />
                  Rental History
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {rentals.map((rental) => (
                  <div key={rental.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{rental.bikeName}</h3>
                          <span className={`px-3 py-1 text-xs rounded-full font-medium border ${getStatusColor(rental.status)}`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(rental.status)}
                              {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                            </div>
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPinIcon className="w-4 h-4" />
                              <span>{rental.station}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <ClockIcon className="w-4 h-4" />
                              <span>{formatDuration(rental.duration, rental.hours)} Rental</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <CalendarIcon className="w-4 h-4" />
                              <span>Slot {rental.slotNumber}</span>
                            </div>
                            {rental.duration === 'hourly' && rental.hours && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="text-orange-600 font-medium">•</span>
                                <span>{rental.hours} hour{rental.hours !== 1 ? 's' : ''} period</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="text-gray-600">Start Time: </span>
                              <span className="font-medium">{new Date(rental.startTime).toLocaleString()}</span>
                            </div>
                            {rental.endTime && (
                              <div className="text-sm">
                                <span className="text-gray-600">End Time: </span>
                                <span className="font-medium">{new Date(rental.endTime).toLocaleString()}</span>
                              </div>
                            )}
                            <div className="text-sm">
                              <span className="text-gray-600">Price: </span>
                              <span className="font-semibold text-primary-600">{formatPrice(rental.price, rental.duration, rental.hours)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4 text-right">
                        <div className="text-2xl font-bold text-primary-600">₹{rental.price}</div>
                        <div className="text-xs text-gray-500">Rental ID: {rental.id}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Action Button */}
            <div className="text-center">
              <button
                onClick={() => router.push('/bicycles')}
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Rent Another Bike
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
