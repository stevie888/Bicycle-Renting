"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { 
  BikeIcon, 
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  CalendarIcon,
  DollarSignIcon,
  HashIcon,
  TrendingUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "lucide-react";

interface Rental {
  id: string;
  bikeId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  status: string;
  price: number;
  duration: 'hourly' | 'daily' | 'pay-as-you-go';
  hours?: number;
  bikeName: string;
  station: string;
  slotNumber: number;
}

function MyRentalsPageContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'recent' | 'completed'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const rentalsPerPage = 5;

  // All hooks must be called before any conditional returns
  useEffect(() => {
    // Wait for authentication to load before checking user
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Get rentals for the current user
    const allRentals = JSON.parse(localStorage.getItem('paddlenepal_rentals') || '[]');
    const userRentals = allRentals.filter((rental: any) => rental.userId === user.id);
    setRentals(userRentals);
    setLoading(false);
  }, [user, router, authLoading]);

  const formatDuration = (duration: 'hourly' | 'daily' | 'pay-as-you-go', hours?: number) => {
    if (duration === 'hourly') {
      return hours && hours > 1 ? `${hours} Hours` : '1 Hour';
    } else if (duration === 'pay-as-you-go') {
      return 'Pay as you go';
    }
    return 'Daily';
  };

  const formatPrice = (price: number, duration: 'hourly' | 'daily' | 'pay-as-you-go', hours?: number) => {
    if (duration === 'hourly') {
      return hours && hours > 1 ? `रू${price} (रू25 × ${hours} hours)` : `रू${price}/hour`;
    } else if (duration === 'pay-as-you-go') {
      return `रू${price} (calculated on return)`;
    }
    return `रू${price}/day`;
  };

  const getStatusColor = (status: string, rental: Rental) => {
    // Check if rental is overdue
    if (status === 'active') {
      const startTime = new Date(rental.startTime);
      const currentTime = new Date();
      const rentalDuration = rental.duration;
      const rentalHours = rental.hours || 1;
      
      let isOverdue = false;
      
      if (rentalDuration === 'hourly') {
        const endTime = new Date(startTime.getTime() + (rentalHours * 60 * 60 * 1000));
        isOverdue = currentTime > endTime;
      } else if (rentalDuration === 'daily') {
        const endTime = new Date(startTime.getTime() + (24 * 60 * 60 * 1000));
        isOverdue = currentTime > endTime;
      } else if (rentalDuration === 'pay-as-you-go') {
        // For pay-as-you-go, consider overdue after 24 hours
        const endTime = new Date(startTime.getTime() + (24 * 60 * 60 * 1000));
        isOverdue = currentTime > endTime;
      }
      
      if (isOverdue) {
        return 'bg-red-100 text-red-800 border-red-200';
      }
    }
    
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

  const getStatusIcon = (status: string, rental: Rental) => {
    // Check if rental is overdue
    if (status === 'active') {
      const startTime = new Date(rental.startTime);
      const currentTime = new Date();
      const rentalDuration = rental.duration;
      const rentalHours = rental.hours || 1;
      
      let isOverdue = false;
      
      if (rentalDuration === 'hourly') {
        const endTime = new Date(startTime.getTime() + (rentalHours * 60 * 60 * 1000));
        isOverdue = currentTime > endTime;
      } else if (rentalDuration === 'daily') {
        const endTime = new Date(startTime.getTime() + (24 * 60 * 60 * 1000));
        isOverdue = currentTime > endTime;
      } else if (rentalDuration === 'pay-as-you-go') {
        // For pay-as-you-go, consider overdue after 24 hours
        const endTime = new Date(startTime.getTime() + (24 * 60 * 60 * 1000));
        isOverdue = currentTime > endTime;
      }
      
      if (isOverdue) {
        return <XCircleIcon className="w-4 h-4" />;
      }
    }
    
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

  const getStatusText = (status: string, rental: Rental) => {
    // Check if rental is overdue
    if (status === 'active') {
      const startTime = new Date(rental.startTime);
      const currentTime = new Date();
      const rentalDuration = rental.duration;
      const rentalHours = rental.hours || 1;
      
      let isOverdue = false;
      let overdueHours = 0;
      
      if (rentalDuration === 'hourly') {
        const endTime = new Date(startTime.getTime() + (rentalHours * 60 * 60 * 1000));
        isOverdue = currentTime > endTime;
        if (isOverdue) {
          overdueHours = Math.floor((currentTime.getTime() - endTime.getTime()) / (60 * 60 * 1000));
        }
      } else if (rentalDuration === 'daily') {
        const endTime = new Date(startTime.getTime() + (24 * 60 * 60 * 1000));
        isOverdue = currentTime > endTime;
        if (isOverdue) {
          overdueHours = Math.floor((currentTime.getTime() - endTime.getTime()) / (60 * 60 * 1000));
        }
      } else if (rentalDuration === 'pay-as-you-go') {
        // For pay-as-you-go, consider overdue after 24 hours
        const endTime = new Date(startTime.getTime() + (24 * 60 * 60 * 1000));
        isOverdue = currentTime > endTime;
        if (isOverdue) {
          overdueHours = Math.floor((currentTime.getTime() - endTime.getTime()) / (60 * 60 * 1000));
        }
      }
      
      if (isOverdue) {
        return `Overdue (${overdueHours}h)`;
      }
    }
    
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filteredRentals = rentals.filter(rental => {
    if (filter === 'all') return true;
    if (filter === 'recent') {
      // Get top 5 most recent rentals
      const sortedRentals = [...rentals].sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
      return sortedRentals.slice(0, 5).some(r => r.id === rental.id);
    }
    return rental.status === filter;
  });

  // Sort filtered rentals by start time (newest first)
  const sortedFilteredRentals = [...filteredRentals].sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  // Pagination logic
  const totalPages = Math.ceil(sortedFilteredRentals.length / rentalsPerPage);
  const startIndex = (currentPage - 1) * rentalsPerPage;
  const endIndex = startIndex + rentalsPerPage;
  const currentRentals = sortedFilteredRentals.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const activeRentals = rentals.filter(r => r.status === 'active').length;
  const completedRentals = rentals.filter(r => r.status === 'completed').length;
  const recentRentals = rentals.length >= 5 ? 5 : rentals.length;
  const totalSpent = rentals.reduce((sum, rental) => sum + rental.price, 0);

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
      <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-3">
        {/* Back Button */}
        <div className="mb-2">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5 text-white" />
          </button>
        </div>

        {rentals.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 text-center">
            <BikeIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">No Rentals Yet</h3>
            <p className="text-sm text-gray-600 mb-3">You haven't rented any bikes yet. Start your adventure today!</p>
            <button
              onClick={() => router.push('/bicycles')}
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm flex items-center justify-center gap-2"
            >
              <div className="w-4 h-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              Rent a Bike
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header with Stats */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-primary-100 p-1.5 rounded-lg">
                    <BikeIcon className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900">Rental History</h1>
                    <p className="text-xs text-gray-600">Track your bike rental activities</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold text-primary-600">रू{totalSpent}</div>
                  <div className="text-xs text-gray-500">Total Spent</div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                  <div className="flex items-center gap-1.5">
                    <div className="bg-green-100 p-1 rounded-lg">
                      <CheckCircleIcon className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-green-600">{recentRentals}</div>
                      <div className="text-xs text-green-700">Recent Top 5</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <div className="flex items-center gap-1.5">
                    <div className="bg-blue-100 p-1 rounded-lg">
                      <TrendingUpIcon className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-blue-600">{completedRentals}</div>
                      <div className="text-xs text-blue-700">Completed</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                  <div className="flex items-center gap-1.5">
                    <div className="bg-purple-100 p-1 rounded-lg">
                      <DollarSignIcon className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-purple-600">{rentals.length}</div>
                      <div className="text-xs text-purple-700">Total Rentals</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1 border-b border-gray-200">
                {[
                  { key: 'all', label: 'All Rentals', count: rentals.length },
                  { key: 'recent', label: 'Recent', count: recentRentals },
                  { key: 'completed', label: 'Completed', count: completedRentals }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as any)}
                    className={`px-2 py-1.5 text-xs font-medium rounded-t-lg transition-colors ${
                      filter === tab.key
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Rental Cards */}
            <div className="space-y-1.5">
              {currentRentals.map((rental) => (
                <div key={rental.id} className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="bg-primary-100 p-1 rounded-lg">
                          <BikeIcon className="w-3.5 h-3.5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">{rental.bikeName}</h3>
                          <p className="text-xs text-gray-600">Rental ID: {rental.id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium border ${getStatusColor(rental.status, rental)}`}>
                          <div className="flex items-center gap-0.5">
                            {getStatusIcon(rental.status, rental)}
                            {getStatusText(rental.status, rental)}
                          </div>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                      {/* Location & Details */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-1.5 text-xs">
                          <MapPinIcon className="w-3 h-3 text-primary-600" />
                          Location Details
                        </h4>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs">
                            <div className="w-1 h-1 bg-primary-600 rounded-full"></div>
                            <span className="text-gray-600">Station:</span>
                            <span className="font-medium">{rental.station}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs">
                            <div className="w-1 h-1 bg-primary-600 rounded-full"></div>
                            <span className="text-gray-600">Slot:</span>
                            <span className="font-medium">#{rental.slotNumber}</span>
                          </div>
                        </div>
                      </div>

                      {/* Rental Information */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-1.5 text-xs">
                          <ClockIcon className="w-3 h-3 text-primary-600" />
                          Rental Info
                        </h4>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs">
                            <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-medium">{formatDuration(rental.duration, rental.hours)}</span>
                          </div>
                          {rental.duration === 'hourly' && rental.hours && (
                            <div className="flex items-center gap-1.5 text-xs">
                              <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                              <span className="text-gray-600">Period:</span>
                              <span className="font-medium">{rental.hours} hour{rental.hours !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-xs">
                            <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                            <span className="text-gray-600">Rate:</span>
                            <span className="font-medium">{formatPrice(rental.price, rental.duration, rental.hours)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Time & Cost */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-1.5 text-xs">
                          <CalendarIcon className="w-3 h-3 text-primary-600" />
                          Time & Cost
                        </h4>
                        <div className="space-y-1">
                          <div className="text-xs">
                            <div className="text-gray-600 mb-0.5">Start Time:</div>
                            <div className="font-medium">{new Date(rental.startTime).toLocaleString()}</div>
                          </div>
                          {rental.endTime && (
                            <div className="text-xs">
                              <div className="text-gray-600 mb-0.5">End Time:</div>
                              <div className="font-medium">{new Date(rental.endTime).toLocaleString()}</div>
                            </div>
                          )}
                          <div className="pt-1.5 border-t border-gray-200">
                            <div className="text-base font-bold text-primary-600">रू{rental.price}</div>
                            <div className="text-xs text-gray-500">Total Cost</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg shadow-md border border-gray-100 p-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, sortedFilteredRentals.length)} of {sortedFilteredRentals.length} rentals
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {/* Previous Button */}
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`p-1 rounded-lg border transition-colors ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-300'
                      }`}
                    >
                      <ChevronLeftIcon className="w-3.5 h-3.5" />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-1.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-primary-600 text-white'
                              : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600 border border-gray-200'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`p-1 rounded-lg border transition-colors ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-300'
                      }`}
                    >
                      <ChevronRightIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Action Button */}
            <div className="text-center pt-1 pb-1">
              <button
                onClick={() => router.push('/bicycles')}
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm flex items-center justify-center gap-2 mx-auto"
              >
                <div className="w-4 h-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                Rent Another Bike
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyRentalsPage() {
  return (
    <ErrorBoundary>
      <MyRentalsPageContent />
    </ErrorBoundary>
  );
}
