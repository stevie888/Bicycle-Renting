"use client";
import { useDisclosure } from "@heroui/modal";
import { FlameIcon, UmbrellaIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface StationData {
  id: string;
  name: string;
  location: string;
  totalUmbrellas: number;
  rentedUmbrellas: number;
  availableUmbrellas: number;
}

export default function PopUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stationId = searchParams.get("id");
  const [stationData, setStationData] = useState<StationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const { isOpen, onClose } = useDisclosure({
    isOpen: true,
    onClose: () => {
      router.back();
    },
  });

  useEffect(() => {
    if (stationId) {
      fetchStationData();
    }
  }, [stationId]);

  const fetchStationData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stations/${stationId}`);
      const data = await response.json();
      
      if (data.success) {
        setStationData(data.station);
      } else {
        setError(data.error || 'Failed to load station data');
      }
    } catch (error) {
      console.error('Error fetching station data:', error);
      setError('Failed to load station data');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = async () => {
    try {
      setBookingLoading(true);
      setBookingError("");

      // Check if user is logged in by getting from localStorage
      const storedUser = localStorage.getItem("popup_user");
      if (!storedUser) {
        // Show message and redirect to login
        setBookingError("Please log in to book umbrellas. Redirecting to login page...");
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        return;
      }

      const user = JSON.parse(storedUser);
      const authResponse = await fetch(`/api/auth/current-user?userId=${user.id}`);
      const authData = await authResponse.json();
      
      if (!authData.success) {
        setBookingError("Authentication failed. Please log in again.");
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        return;
      }

      if (!stationData || stationData.availableUmbrellas <= 0) {
        setBookingError("No umbrellas available for booking.");
        return;
      }

      // Get the umbrella ID for this station
      const umbrellaResponse = await fetch(`/api/umbrellas?location=${stationData.location}&status=available`);
      const umbrellaData = await umbrellaResponse.json();
      
      if (!umbrellaData.success || !umbrellaData.umbrellas || umbrellaData.umbrellas.length === 0) {
        setBookingError("No available umbrellas found at this station.");
        return;
      }

      const umbrella = umbrellaData.umbrellas[0]; // Get the first available umbrella
      const now = new Date();
      const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

      // Create the rental
      const rentalResponse = await fetch('/api/rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: authData.user.id,
          umbrellaId: umbrella.id,
          startTime: now.toISOString(),
          endTime: endTime.toISOString()
        })
      });

      const rentalData = await rentalResponse.json();

      if (rentalData.success) {
        setBookingSuccess(true);
        // Refresh station data to update inventory
        await fetchStationData();
      } else {
        setBookingError(rentalData.error || "Failed to book umbrella.");
      }
    } catch (error) {
      console.error('Booking error:', error);
      setBookingError("Failed to book umbrella. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} title="Loading..." onClose={onClose}>
        <div className="p-6">
          <div className="text-center">Loading station data...</div>
        </div>
      </Modal>
    );
  }

  if (error || !stationData) {
    return (
      <Modal isOpen={isOpen} title="Error" onClose={onClose}>
        <div className="p-6">
          <div className="text-center text-red-600">{error || 'Failed to load station data'}</div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} title={stationData.name} onClose={onClose}>
      <div className="freestyle-script">
        <div className="bg-gray-200 flex justify-center items-center h-[10rem]">
          <FlameIcon color="#9ca3af" size={50} />
        </div>
        <p>NPR: 10/hr</p>
        
        {/* Booking Error */}
        {bookingError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {bookingError}
          </div>
        )}
        
        {/* Booking Success */}
        {bookingSuccess && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
            ✅ Umbrella booked successfully! You can view your rental in the Umbrellas page.
          </div>
        )}
        
        <div className="flex gap-4 flex-wrap">
          {[...new Array(stationData.totalUmbrellas).fill(null)].map((el, i) => (
            <Button
              key={`popup_icon_${i}`}
              color={i < stationData.availableUmbrellas ? "primary" : "danger"}
              isIconOnly={true}
              variant="light"
            >
              <UmbrellaIcon />
            </Button>
          ))}
        </div>
        
        <div className="mt-4">
          <Button 
            color="primary" 
            variant="solid" 
            onClick={handleBookNow}
            disabled={bookingLoading}
            className="w-full"
          >
            {bookingLoading ? "Booking..." : "Book now"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
