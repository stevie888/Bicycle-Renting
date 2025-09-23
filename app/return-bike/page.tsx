"use client";

// Force dynamic rendering to prevent prerendering issues
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useLanguage } from "@/components/LanguageContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  MapPin,
  Bike,
  CheckCircle,
  AlertTriangle,
  Clock,
  Star,
  Send,
} from "lucide-react";

interface Station {
  id: string;
  name: string;
  location: string;
  image: string;
}

interface Slot {
  id: string;
  slotNumber: number;
  status: "active" | "in-maintenance" | "reserved";
  lastUpdated: string;
  notes?: string;
}

interface Rental {
  id: string;
  userId: string;
  bikeId: string;
  startTime: string;
  endTime?: string;
  status: "active" | "completed";
  price: number;
  duration: string;
  hours?: number;
  bikeName: string;
  station: string;
  slotNumber: number;
  payAsYouGo?: boolean;
}

function ReturnBikePage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [currentRental, setCurrentRental] = useState<Rental | null>(null);
  const [isEndingRide, setIsEndingRide] = useState(false);
  const [rentalDuration, setRentalDuration] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [formattedDuration, setFormattedDuration] = useState("");
  const [totalCost, setTotalCost] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    fetchStations();
    fetchCurrentRental();
  }, [user, loading, router]);

  const fetchStations = () => {
    try {
      const bicycles = JSON.parse(
        localStorage.getItem("pedalnepal_bicycles") || "[]",
      );
      const uniqueStations = new Map<string, Station>();

      bicycles.forEach((bike: any) => {
        const stationKey = `${bike.description}_${bike.location}`;
        if (!uniqueStations.has(stationKey)) {
          uniqueStations.set(stationKey, {
            id: stationKey,
            name: bike.description, // Use description as name
            location: bike.location,
            image: bike.image || "/bicycle-placeholder.jpg",
          });
        }
      });

      setStations(Array.from(uniqueStations.values()));
    } catch (error) {
      console.error("Error fetching stations:", error);
    }
  };

  const fetchCurrentRental = () => {
    try {
      const rentals = JSON.parse(
        localStorage.getItem("pedalnepal_rentals") || "[]",
      );
      const userActiveRental = rentals.find(
        (rental: Rental) =>
          rental.userId === user?.id && rental.status === "active",
      );

      if (userActiveRental) {
        setCurrentRental(userActiveRental);

        // Calculate rental duration
        const startTime = new Date(userActiveRental.startTime);
        const currentTime = new Date();
        const durationMs = currentTime.getTime() - startTime.getTime();
        const durationMinutes = Math.floor(durationMs / (1000 * 60));
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const remainingMinutes = durationMinutes % 60;

        // Format duration for display
        let formattedDuration = "";
        if (durationHours > 0) {
          formattedDuration = `${durationHours} hour${durationHours !== 1 ? "s" : ""}`;
          if (remainingMinutes > 0) {
            formattedDuration += ` ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}`;
          }
        } else {
          formattedDuration = `${durationMinutes} minute${durationMinutes !== 1 ? "s" : ""}`;
        }

        // Ensure minimum 1 hour duration for display
        const displayDuration = Math.max(1, durationMs / (1000 * 60 * 60));
        setRentalDuration(displayDuration);
        setDurationMinutes(durationMinutes);
        setFormattedDuration(formattedDuration);

        // Calculate cost (25 rupees per hour) - minimum 1 hour
        const cost = Math.max(
          25,
          Math.ceil(durationMs / (1000 * 60 * 60)) * 25,
        );
        setTotalCost(cost);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching current rental:", error);
    }
  };

  const handleStationSelect = (station: Station) => {
    setSelectedStation(station);
    setSelectedSlot(null);
    fetchAvailableSlots(station.id);
  };

  const fetchAvailableSlots = (stationId: string) => {
    try {
      const slotsKey = `pedalnepal_slots_${stationId}`;
      
      // Mobile-specific localStorage handling
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      console.log("🔍 Mobile device detected:", isMobile);
      console.log("🔍 Station ID:", stationId);
      console.log("🔍 Current rental:", currentRental);
      
      let allSlots = [];
      
      // Try to get slots from localStorage with mobile fallback
      try {
        const storedSlots = localStorage.getItem(slotsKey);
        if (storedSlots) {
          allSlots = JSON.parse(storedSlots);
          console.log("✅ Retrieved slots from localStorage:", allSlots.length);
        } else {
          console.log("⚠️ No slots in localStorage, will create default");
        }
      } catch (localStorageError) {
        console.error("❌ localStorage access failed:", localStorageError);
        // Continue with empty array - we'll create default slots
        allSlots = [];
      }

      // If no slots exist, create default slots for this station
      if (allSlots.length === 0) {
        console.log("🔧 Creating default slots for station:", stationId);
        allSlots = [];
        for (let i = 1; i <= 10; i++) {
          allSlots.push({
            id: `${stationId}_slot_${i}`,
            slotNumber: i,
            status: i >= 9 ? "reserved" : "active", // Slots 9-10 are reserved for returns
            lastUpdated: new Date().toISOString(),
            notes: i >= 9 ? "Available for bike returns" : "Bike available for rental",
          });
        }
        
        // Try to save to localStorage, but don't fail if it doesn't work
        try {
          localStorage.setItem(slotsKey, JSON.stringify(allSlots));
          console.log("✅ Saved default slots to localStorage");
        } catch (saveError) {
          console.warn("⚠️ Could not save to localStorage:", saveError);
          // Continue anyway - we have the slots in memory
        }
        
        console.log("🔧 Created default slots:", allSlots);
      }

      // Get slots that are available for return:
      // 1. User's original rental slot (where they rented from) - always available
      // 2. Reserved slots (slots 9-10) - always available for returns
      // 3. Empty slots (slots 1-8 that are not occupied)
      const returnSlots = allSlots.filter((slot: Slot) => {
        // Always include the user's original rental slot
        if (currentRental && slot.slotNumber === currentRental.slotNumber) {
          console.log(`Including original rental slot: ${slot.slotNumber}`);
          return true;
        }

        // Include reserved slots (slots 9-10) - these are always available for returns
        if (slot.status === "reserved" && slot.slotNumber >= 9) {
          console.log(`Including reserved slot: ${slot.slotNumber} (${slot.status})`);
          return true;
        }

        // Include empty slots (slots 1-8 that are not occupied)
        if (
          slot.slotNumber <= 8 &&
          slot.status === "active" &&
          !slot.notes?.includes("Bike rented") &&
          !slot.notes?.includes("Occupied")
        ) {
          console.log(
            `Including empty slot: ${slot.slotNumber} (${slot.status}, ${slot.notes})`,
          );
          return true;
        }

        console.log(
          `Excluding slot: ${slot.slotNumber} (${slot.status}, ${slot.notes})`,
        );
        return false;
      });

      console.log("Available return slots:", returnSlots);
      
      // MOBILE-SPECIFIC FALLBACK: Always ensure we have return slots
      // This is critical for mobile devices where localStorage might fail
      if (returnSlots.length === 0) {
        console.log("🚨 No return slots found, creating MOBILE FALLBACK slots");
        const fallbackSlots = [];
        
        // Always include the user's original rental slot
        if (currentRental) {
          fallbackSlots.push({
            id: `${stationId}_slot_${currentRental.slotNumber}`,
            slotNumber: currentRental.slotNumber,
            status: "reserved" as const,
            lastUpdated: new Date().toISOString(),
            notes: "Your original rental slot",
          });
        }
        
        // Add guaranteed return slots (9-10) - these are ALWAYS available
        for (let i = 9; i <= 10; i++) {
          fallbackSlots.push({
            id: `${stationId}_slot_${i}`,
            slotNumber: i,
            status: "reserved" as const,
            lastUpdated: new Date().toISOString(),
            notes: "Available for bike returns",
          });
        }
        
        console.log("🔧 MOBILE FALLBACK slots created:", fallbackSlots);
        setAvailableSlots(fallbackSlots);
      } else {
        console.log("✅ Using existing return slots:", returnSlots.length);
        setAvailableSlots(returnSlots);
      }
    } catch (error) {
      console.error("❌ CRITICAL ERROR in fetchAvailableSlots:", error);
      
      // MOBILE EMERGENCY FALLBACK: Always provide return slots
      // This ensures the app NEVER fails on mobile devices
      const emergencySlots = [];
      
      // Always include the user's original rental slot
      if (currentRental) {
        emergencySlots.push({
          id: `${stationId}_slot_${currentRental.slotNumber}`,
          slotNumber: currentRental.slotNumber,
          status: "reserved" as const,
          lastUpdated: new Date().toISOString(),
          notes: "Your original rental slot",
        });
      }
      
      // Add guaranteed return slots (9-10)
      for (let i = 9; i <= 10; i++) {
        emergencySlots.push({
          id: `${stationId}_slot_${i}`,
          slotNumber: i,
          status: "reserved" as const,
          lastUpdated: new Date().toISOString(),
          notes: "Available for bike returns",
        });
      }
      
      console.log("🚨 EMERGENCY FALLBACK slots created:", emergencySlots);
      setAvailableSlots(emergencySlots);
    }
  };

  const handleSlotSelect = (slot: Slot) => {
    setSelectedSlot(slot);
  };

  const handleEndRide = async () => {
    if (!currentRental || !user) return;

    setIsEndingRide(true);

    try {
      const endTime = new Date().toISOString();
      const startTime = new Date(currentRental.startTime);
      const endTimeDate = new Date(endTime);

      // Calculate rental duration
      const durationMs = endTimeDate.getTime() - startTime.getTime();
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      const durationMinutes = Math.floor(
        (durationMs % (1000 * 60 * 60)) / (1000 * 60),
      );

      // Format times for display
      const startTimeFormatted = startTime.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const endTimeFormatted = endTimeDate.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      // Update the rental with end time and completed status
      const rentals = JSON.parse(
        localStorage.getItem("pedalnepal_rentals") || "[]",
      );
      const updatedRentals = rentals.map((rental: any) => {
        if (rental.id === currentRental.id) {
          return {
            ...rental,
            endTime: endTime,
            status: "completed",
            returnStation: selectedStation?.name,
            returnSlotNumber: selectedSlot?.slotNumber,
          };
        }
        return rental;
      });

      // Update the bike status to available
      const bicycles = JSON.parse(
        localStorage.getItem("pedalnepal_bicycles") || "[]",
      );
      const updatedBicycles = bicycles.map((bicycle: any) => {
        if (bicycle.name === currentRental.bikeName) {
          return {
            ...bicycle,
            status: "available",
          };
        }
        return bicycle;
      });

      // Update slot status if station and slot are selected
      if (selectedStation && selectedSlot) {
        const slotsKey = `pedalnepal_slots_${selectedStation.id}`;
        const allSlots = JSON.parse(localStorage.getItem(slotsKey) || "[]");

        // Create updated slots array
        const updatedSlots = allSlots.map((slot: Slot) => {
          // Mark the return slot as having a bike returned (available for rental)
          if (slot.id === selectedSlot.id) {
            return {
              ...slot,
              status: "active" as const,
              lastUpdated: new Date().toISOString(),
              notes: "Bike returned",
            };
          }

          // Mark the original rental slot as empty (available for returns)
          if (currentRental && slot.slotNumber === currentRental.slotNumber) {
            return {
              ...slot,
              status: "reserved" as const,
              lastUpdated: new Date().toISOString(),
              notes: "Available for bike returns",
            };
          }

          // If returning to a reserved slot (9-10), mark it as having a bike returned
          if (selectedSlot.slotNumber >= 9 && slot.slotNumber === selectedSlot.slotNumber) {
            return {
              ...slot,
              status: "active" as const,
              lastUpdated: new Date().toISOString(),
              notes: "Bike returned",
            };
          }

          return slot;
        });

        localStorage.setItem(slotsKey, JSON.stringify(updatedSlots));
      }

      // Save updated data
      localStorage.setItem(
        "pedalnepal_rentals",
        JSON.stringify(updatedRentals),
      );
      localStorage.setItem(
        "pedalnepal_bicycles",
        JSON.stringify(updatedBicycles),
      );

      // Update local state
      setCurrentRental({
        ...currentRental,
        endTime: endTime,
        status: "completed",
      });

      // Calculate final price - use the same calculation as displayed cost
      let finalPrice = Math.max(
        25,
        Math.ceil(durationMs / (1000 * 60 * 60)) * 25,
      );

      // Update the rental with the calculated price
      const updatedRentalsWithPrice = updatedRentals.map((rental: any) => {
        if (rental.id === currentRental.id) {
          return {
            ...rental,
            price: finalPrice,
          };
        }
        return rental;
      });
      localStorage.setItem(
        "pedalnepal_rentals",
        JSON.stringify(updatedRentalsWithPrice),
      );

      // Deduct credits from user account
      const updatedUser = {
        ...user,
        credits: (user.credits || 0) - finalPrice,
      };
      localStorage.setItem(
        "pedalnepal_current_user",
        JSON.stringify(updatedUser),
      );

      // Also update the main users array for admin dashboard
      const allUsers = JSON.parse(
        localStorage.getItem("pedalnepal_users") || "[]",
      );
      const updatedUsers = allUsers.map((u: any) =>
        u.id === user.id ? { ...u, credits: updatedUser.credits } : u,
      );
      localStorage.setItem("pedalnepal_users", JSON.stringify(updatedUsers));

      // Show completion message
      alert(`🎉 Ride Completed Successfully!

📅 Rental Period:
   Start: ${startTimeFormatted}
   End: ${endTimeFormatted}
   Duration: ${durationHours}h ${durationMinutes}m

💰 Total Cost: रू${finalPrice}

${selectedStation && selectedSlot ? `📍 Returned to: ${selectedStation.name} at slot ${selectedSlot.slotNumber}` : ""}

Thank you for using Pedal Nepal! 🚴‍♂️`);

      // Show rating section instead of redirecting immediately
      if (selectedStation && selectedSlot) {
        setShowRating(true);
      } else {
        router.push("/my-rentals");
      }
    } catch (error) {
      console.error("Error ending ride:", error);
      alert("Error ending ride. Please try again.");
    } finally {
      setIsEndingRide(false);
    }
  };

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating before submitting.");
      return;
    }

    setIsSubmittingReview(true);

    try {
      // Save review to localStorage
      const reviews = JSON.parse(
        localStorage.getItem("pedalnepal_reviews") || "[]",
      );
      const newReview = {
        id: Date.now().toString(),
        userId: user?.id,
        userName: user?.name,
        rentalId: currentRental?.id,
        stationId: selectedStation?.id,
        stationName: selectedStation?.name,
        rating,
        review,
        createdAt: new Date().toISOString(),
        bikeName: currentRental?.bikeName,
        duration: formattedDuration,
        cost: totalCost,
      };

      reviews.push(newReview);
      localStorage.setItem("pedalnepal_reviews", JSON.stringify(reviews));

      // Dispatch event to notify admin dashboard of new review
      window.dispatchEvent(new CustomEvent("reviewsUpdated"));

      // Show success message
      alert(
        "Thank you for your review! Your feedback helps us improve our service.",
      );

      // Redirect to return confirmation
      router.push("/return-confirmation");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Error submitting review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSkipReview = () => {
    router.push("/return-confirmation");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentRental) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No Active Rental
          </h1>
          <p className="text-gray-600 mb-6">
            You don't have an active bike rental to return.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-gray-100 sticky top-0 z-20">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {t("return.title")}
                </h1>
                <p className="text-gray-600 text-sm">
                  {t("return.selectStation")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Current Rental Info */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Bike className="w-5 h-5 mr-2 text-blue-600" />
            Current Rental
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Slot</p>
              <p className="font-semibold">Slot {currentRental.slotNumber}</p>
            </div>
            <div>
              <p className="text-gray-500">Duration</p>
              <p className="font-semibold">{formattedDuration}</p>
            </div>
            <div>
              <p className="text-gray-500">Cost</p>
              <p className="font-semibold text-red-600">₹{totalCost}</p>
            </div>
            <div>
              <p className="text-gray-500">Credits</p>
              <p className="font-semibold text-green-600">
                ₹{user?.credits || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Station Selection */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-green-600" />
            Select Return Station
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stations.map((station) => (
              <div
                key={station.id}
                onClick={() => handleStationSelect(station)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedStation?.id === station.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {station.name}
                    </h3>
                    <p className="text-sm text-gray-500">{station.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slot Selection */}
        {selectedStation && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-purple-600" />
              Select Return Slot
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              You can return your bike to your original rental slot (Slot{" "}
              {currentRental?.slotNumber}) or any empty slot. This ensures
              efficient slot management.
            </p>
            {availableSlots.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <p className="text-gray-600">
                  No return slots available at this station.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Please select another station.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {availableSlots.map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() => handleSlotSelect(slot)}
                    className={`aspect-square p-4 rounded-xl border-2 cursor-pointer transition-all text-center flex flex-col items-center justify-center ${
                      selectedSlot?.id === slot.id
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-2">
                      <span className="text-white font-semibold text-sm">
                        {slot.slotNumber}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      Slot {slot.slotNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentRental &&
                      slot.slotNumber === currentRental.slotNumber
                        ? "Your Rental Slot"
                        : "Available for Return"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Return Button */}
        {selectedStation && selectedSlot && !showRating && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirm Return
              </h3>
              <p className="text-gray-600 mb-4">
                Return your bike to {selectedStation.name} at slot{" "}
                {selectedSlot.slotNumber}
              </p>
              <button
                onClick={handleEndRide}
                disabled={
                  isEndingRide ||
                  (currentRental?.status as string) === "completed"
                }
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-3 border-0"
              >
                {isEndingRide ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Ending Ride...
                  </div>
                ) : (
                  <>
                    <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                    End My Ride - ₹{totalCost}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Rating Modal */}
        {showRating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
              {/* Modal Header */}
              <div className="relative p-6 border-b border-gray-100">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-white fill-current" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Rate Your Experience
                  </h3>
                  <p className="text-gray-600 text-sm">
                    How was your ride with{" "}
                    <span className="font-semibold">
                      {currentRental?.bikeName}
                    </span>
                    ?
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={handleSkipReview}
                  className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Star Rating */}
                <div className="flex justify-center mb-6">
                  <div className="flex space-x-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-all duration-200 transform hover:scale-125"
                      >
                        <Star
                          className={`w-12 h-12 ${
                            star <= (hoverRating || rating)
                              ? "text-yellow-400 fill-current drop-shadow-lg"
                              : "text-gray-300 hover:text-yellow-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating Labels */}
                <div className="text-center mb-6">
                  <p className="text-lg font-medium text-gray-800">
                    {rating === 0 && "Select a rating"}
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Very Good"}
                    {rating === 5 && "Excellent"}
                  </p>
                  {rating > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {rating === 1 && "We're sorry to hear that"}
                      {rating === 2 && "We'll work to improve"}
                      {rating === 3 && "Thanks for your feedback"}
                      {rating === 4 && "We're glad you enjoyed it"}
                      {rating === 5 && "We're thrilled you loved it"}
                    </p>
                  )}
                </div>

                {/* Review Text Area */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Share your experience (optional)
                  </label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Tell us about your ride experience, any issues, or suggestions for improvement..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                    rows={4}
                    maxLength={500}
                  />
                  <div className="text-right mt-2">
                    <span className="text-xs text-gray-500">
                      {review.length}/500 characters
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSkipReview}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:shadow-md"
                  >
                    Skip Review
                  </button>
                  <button
                    onClick={handleRatingSubmit}
                    disabled={rating === 0 || isSubmittingReview}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {isSubmittingReview ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Review
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReturnBikePageWrapper() {
  return (
    <ErrorBoundary>
      <ReturnBikePage />
    </ErrorBoundary>
  );
}
