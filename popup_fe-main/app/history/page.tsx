"use client";

import { ThumbsUpIcon, MapPin, Calendar, Clock, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import Modal from "@/components/ui/modal";
import { useAuth } from "@/components/AuthContext";
import { useEffect, useState } from "react";

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`/api/history?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setHistory(data.history || []);
        setError("");
      })
      .catch(() => setError("Failed to load history."))
      .finally(() => setLoading(false));
  }, [user]);

  const handleDetailsClick = (rental: any) => {
    setSelectedRental(rental);
    setShowDetailsModal(true);
  };

  const handleInvoiceClick = (rental: any) => {
    setSelectedRental(rental);
    setShowInvoiceModal(true);
  };

  const generateInvoice = (rental: any) => {
    const startDate = new Date(rental.rented_at);
    const endDate = rental.returned_at ? new Date(rental.returned_at) : new Date();
    const duration = endDate.getTime() - startDate.getTime();
    const hours = Math.ceil(duration / (1000 * 60 * 60));
    const ratePerHour = 5; // NPR per hour
    const totalAmount = hours * ratePerHour;

    const invoiceData = {
      invoiceNumber: `INV-${String(rental.id || '').slice(-6)}`,
      date: new Date().toLocaleDateString(),
      customerName: user?.name || 'Customer',
      customerEmail: user?.email || '',
      umbrellaDescription: rental.umbrella_description || 'Umbrella',
      location: rental.umbrella_location || 'Unknown Location',
      startTime: formatDate(rental.rented_at),
      endTime: rental.returned_at ? formatDate(rental.returned_at) : 'Ongoing',
      duration: `${hours} hour(s)`,
      ratePerHour: ratePerHour,
      totalAmount: totalAmount
    };

    // Create invoice content
    const invoiceContent = `
INVOICE

Invoice Number: ${invoiceData.invoiceNumber}
Date: ${invoiceData.date}

CUSTOMER DETAILS:
Name: ${invoiceData.customerName}
Email: ${invoiceData.customerEmail}

RENTAL DETAILS:
Umbrella: ${invoiceData.umbrellaDescription}
Location: ${invoiceData.location}
Start Time: ${invoiceData.startTime}
End Time: ${invoiceData.endTime}
Duration: ${invoiceData.duration}

CHARGES:
Rate per hour: NPR ${invoiceData.ratePerHour}
Total Amount: NPR ${invoiceData.totalAmount}

Thank you for using PopUp Umbrella Rental!
    `;

    // Create and download invoice
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoiceData.invoiceNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!user) return <div className="p-4">Please log in to view your rental history.</div>;
  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  if (history.length === 0) {
    return <div className="p-4">No rental history found.</div>;
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return 'N/A';
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffMs = end.getTime() - start.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diffHours > 0) {
        return `${diffHours}h ${diffMinutes}m`;
      }
      return `${diffMinutes}m`;
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <h1 className="text-2xl font-bold mb-4">Rental History</h1>
      {history.map((rental) => (
        <Card
          key={`history-card-${rental?.id || 'unknown'}`}
          bodyRender={
            <div className="flex flex-col gap-4">
              {/* Umbrella Details */}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="font-semibold">{rental?.umbrella_description || 'Umbrella'}</span>
                <span className="text-sm text-gray-500">({rental?.umbrella_location || 'Unknown Location'})</span>
              </div>

              {/* Rental Period */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Rental Period:</span>
                </div>
                <div className="ml-6 space-y-1 text-sm">
                  <div><span className="font-medium">From:</span> {formatDate(rental?.rented_at)}</div>
                  {rental?.returned_at && (
                    <div><span className="font-medium">To:</span> {formatDate(rental.returned_at)}</div>
                  )}
                </div>
              </div>

              {/* Duration */}
              {rental?.rented_at && rental?.returned_at && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">
                    <span className="font-medium">Duration:</span> {calculateDuration(rental.rented_at, rental.returned_at)}
                  </span>
                </div>
              )}

              {/* Status */}
              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 text-xs rounded ${
                  rental?.status === 'active' ? 'bg-green-100 text-green-800' :
                  rental?.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {(rental?.status || 'Unknown').charAt(0).toUpperCase() + (rental?.status || 'Unknown').slice(1)}
                </span>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleDetailsClick(rental)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    Details
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleInvoiceClick(rental)}
                    className="flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Invoice
                  </Button>
                </div>
              </div>
            </div>
          }
          className="w-full max-w-md"
          titleRender={
            <div className="flex justify-between w-full items-center">
              <h3 className="font-bold text-lg">Rental #{String(rental?.id || '').slice(-6)}</h3>
              <ThumbsUpIcon className="w-5 h-5 text-green-500" />
            </div>
          }
        />
      ))}

      {/* Details Modal */}
      {showDetailsModal && selectedRental && (
        <Modal 
          isOpen={showDetailsModal} 
          onClose={() => setShowDetailsModal(false)}
          title="Rental Details"
          size="2xl"
        >
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700">Rental Information</h4>
                <div className="space-y-2 mt-2">
                  <div><span className="font-medium">Rental ID:</span> {String(selectedRental.id || '').slice(-6)}</div>
                  <div><span className="font-medium">Status:</span> {selectedRental.status}</div>
                  <div><span className="font-medium">Umbrella:</span> {selectedRental.umbrella_description || 'N/A'}</div>
                  <div><span className="font-medium">Location:</span> {selectedRental.umbrella_location || 'N/A'}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700">Timing Details</h4>
                <div className="space-y-2 mt-2">
                  <div><span className="font-medium">Rented At:</span> {formatDate(selectedRental.rented_at)}</div>
                  {selectedRental.returned_at && (
                    <div><span className="font-medium">Returned At:</span> {formatDate(selectedRental.returned_at)}</div>
                  )}
                  {selectedRental.rented_at && selectedRental.returned_at && (
                    <div><span className="font-medium">Duration:</span> {calculateDuration(selectedRental.rented_at, selectedRental.returned_at)}</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-700 mb-2">Additional Information</h4>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• This rental was processed through the PopUp umbrella rental system</p>
                <p>• All timings are based on your local timezone</p>
                <p>• User are required to return umbrella on the allocated time period</p>
                <p>• For support, contact our customer service team: 9080378800</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && selectedRental && (
        <Modal 
          isOpen={showInvoiceModal} 
          onClose={() => setShowInvoiceModal(false)}
          title="Generate Invoice"
        >
          <div className="p-6 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Invoice Preview</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Invoice #:</span> INV-{String(selectedRental.id || '').slice(-6)}</div>
                <div><span className="font-medium">Customer:</span> {user?.name || 'N/A'}</div>
                <div><span className="font-medium">Umbrella:</span> {selectedRental.umbrella_description || 'N/A'}</div>
                <div><span className="font-medium">Location:</span> {selectedRental.umbrella_location || 'N/A'}</div>
                <div><span className="font-medium">Duration:</span> {selectedRental.rented_at && selectedRental.returned_at ? calculateDuration(selectedRental.rented_at, selectedRental.returned_at) : 'Ongoing'}</div>
                <div><span className="font-medium">Rate:</span> NPR 5/hour</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                onClick={() => setShowInvoiceModal(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  generateInvoice(selectedRental);
                  setShowInvoiceModal(false);
                }}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Invoice
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
