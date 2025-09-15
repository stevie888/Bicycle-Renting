"use client";
import {
  Home,
  Scan,
  History,
  User,
  LogOut,
  Bike,
  QrCode,
  Camera,
  X,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function Footer() {
  const { user, logout, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [showQRModal, setShowQRModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [scanResult, setScanResult] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleQRScannerClick = () => {
    setShowQRModal(true);
  };

  const handleScanQR = () => {
    if (isScanning) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
    stopCamera();
  };

  const startCamera = async () => {
    try {
      setIsCameraLoading(true);
      setCameraError("");

      console.log("Starting camera...");

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported in this browser");
      }

      // Simple camera access with basic constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      console.log("Stream obtained:", stream);

      if (videoRef.current) {
        // Set the stream to video element
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        // Try to play immediately
        try {
          await videoRef.current.play();
          console.log("Video started playing successfully");
          setIsScanning(true);
          setIsCameraLoading(false);
        } catch (playError) {
          console.error("Video play failed:", playError);

          // Fallback: wait for metadata and try again
          videoRef.current.onloadedmetadata = async () => {
            try {
              await videoRef.current!.play();
              console.log("Video started playing after metadata loaded");
              setIsScanning(true);
              setIsCameraLoading(false);
            } catch (secondPlayError) {
              console.error(
                "Video play failed after metadata:",
                secondPlayError,
              );
              setCameraError("Failed to play video stream");
              setIsCameraLoading(false);
            }
          };
        }
      } else {
        throw new Error("Video element not found");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setIsCameraLoading(false);
      setIsScanning(false);

      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          setCameraError(
            "Camera access denied. Please allow camera permissions.",
          );
        } else if (error.name === "NotFoundError") {
          setCameraError("No camera found on this device.");
        } else if (error.name === "NotReadableError") {
          setCameraError("Camera is already in use by another application.");
        } else {
          setCameraError(`Camera error: ${error.message}`);
        }
      } else {
        setCameraError("Unable to access camera. Please check permissions.");
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setIsCameraLoading(false);
    setCameraError("");
  };

  // Simulate QR code detection (in real app, you'd use a QR library like jsQR)
  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        // Simulate QR detection - in real implementation, you'd analyze video frames
        const randomChance = Math.random();
        if (randomChance < 0.1) {
          // 10% chance to "detect" a QR code
          const mockQRData = `bike-${Math.floor(Math.random() * 1000)}-station-${Math.floor(Math.random() * 3) + 1}`;
          setScanResult(mockQRData);
          stopCamera();
          // Navigate to bike selection page instead of showing alert
          router.push(
            `/bike-selection?station=${mockQRData.split("-")[2]}&bike=${mockQRData.split("-")[1]}`,
          );
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isScanning, router]);

  // Cleanup camera when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Only show footer when user is logged in
  if (!loading && !user) {
    return null;
  }

  return (
    <>
      <footer className="w-full gap-4 shadow-lg border-t-1 flex items-center justify-center py-2 px-4 bg-white">
        {/* Home Button */}
        <Link href={"/"}>
          <button
            type="button"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title={t("footer.home")}
          >
            <Home className="h-5 w-5" />
          </button>
        </Link>

        {/* My Rentals Button */}
        <Link href="/my-rentals">
          <button
            type="button"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title={t("footer.myRentals")}
          >
            <History className="h-5 w-5" />
          </button>
        </Link>

        {/* QR Scanner Button - Now in 4th position */}
        <button
          type="button"
          className="p-2 rounded-full hover:bg-gray-100 transition-colors bg-primary-50"
          onClick={handleQRScannerClick}
          title={t("footer.qrScanner")}
        >
          <Scan className="h-5 w-5" />
        </button>

        {/* Bicycles/Stations Button */}
        <Link href={"/bicycles"}>
          <button
            type="button"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title={t("footer.availableBikes")}
          >
            <Bike className="h-5 w-5" />
          </button>
        </Link>

        {/* Profile Button */}
        <Link href="/profile">
          <button
            type="button"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title={t("footer.profile")}
          >
            <User className="h-5 w-5" />
          </button>
        </Link>

        {/* Logout Button */}
        {!loading && user && (
          <button
            type="button"
            className="p-2 rounded-full hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
            onClick={handleLogout}
            title={t("footer.logout")}
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </footer>

      {/* QR Scanner Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t("footer.qrScanner")}
              </h3>
              <p className="text-gray-600">{t("footer.scanBikeQRCode")}</p>
            </div>

            {/* Camera View */}
            <div className="bg-gray-100 rounded-xl p-4 mb-6 relative overflow-hidden">
              {/* Video element - always present */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                controls={false}
                className={`w-full h-48 object-cover rounded-lg bg-black ${
                  isScanning && !isCameraLoading && !cameraError
                    ? "block"
                    : "hidden"
                }`}
                onError={(e) => {
                  console.error("Video error:", e);
                  setCameraError("Video playback failed");
                }}
              />

              {/* Loading state */}
              {isCameraLoading && (
                <div className="text-center py-8">
                  <div className="w-32 h-32 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t("footer.startingCamera")}
                  </p>
                </div>
              )}

              {/* Error state */}
              {cameraError && (
                <div className="text-center py-8">
                  <div className="w-32 h-32 bg-red-50 rounded-lg mx-auto mb-4 flex items-center justify-center border-2 border-dashed border-red-300">
                    <X className="w-16 h-16 text-red-400" />
                  </div>
                  <p className="text-sm text-red-600 mb-2">
                    {t("footer.cameraError")}
                  </p>
                  <p className="text-xs text-gray-500">{cameraError}</p>
                  <button
                    onClick={() => {
                      setCameraError("");
                      startCamera();
                    }}
                    className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
                  >
                    {t("footer.tryAgain")}
                  </button>
                </div>
              )}

              {/* Ready state */}
              {!isScanning && !isCameraLoading && !cameraError && (
                <div className="text-center py-8">
                  <div className="w-32 h-32 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center border-2 border-dashed border-gray-300">
                    <Camera className="w-16 h-16 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">
                    {t("footer.cameraReadyToScan")}
                  </p>
                </div>
              )}

              {/* Scanning overlay - only show when camera is active */}
              {isScanning && !isCameraLoading && !cameraError && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-blue-500 rounded-lg relative">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500"></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500"></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500"></div>
                    </div>
                  </div>
                  {/* Scanning indicator */}
                  <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                    {t("footer.scanning")}
                  </div>
                </>
              )}
            </div>

            {/* Scanner Actions */}
            <div className="space-y-3 mb-6">
              <button
                onClick={handleScanQR}
                className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 ${
                  isScanning
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                }`}
              >
                {isScanning ? (
                  <>
                    <X className="w-4 h-4" />
                    {t("footer.stopScanning")}
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    {t("footer.startCamera")}
                  </>
                )}
              </button>
              <button
                onClick={() => alert("Manual station selection coming soon!")}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Bike className="w-4 h-4" />
                {t("footer.selectStationManually")}
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={handleCloseQRModal}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium"
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
