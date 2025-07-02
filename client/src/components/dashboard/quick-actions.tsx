import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileUp, Search, DollarSign } from 'lucide-react';
import { NewBookingModal } from '@/components/modals/new-booking-modal';
import { PDFImportModal } from '@/components/PDFImportModal';

export function QuickActions() {
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [showPDFImportModal, setShowPDFImportModal] = useState(false);

  const handleImportWR = () => {
    setShowPDFImportModal(true);
  };

  const handleImportComplete = (data: any) => {
    // Refresh warehouse data or navigate to warehouse section
    console.log('Warehouse receipt imported successfully:', data);
    // You could trigger a page refresh or emit an event here
    window.location.reload();
  };

  const handleTrackShipment = () => {
    // TODO: Implement shipment tracking
    console.log('Track Shipment clicked');
  };

  const handleGetQuote = () => {
    // TODO: Implement quote request
    console.log('Get Quote clicked');
  };

  return (
    <>
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => setShowNewBookingModal(true)}
              className="w-full bg-primary-custom text-white hover:bg-primary-custom/90 transition-colors"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              New Booking
            </Button>
            
            <Button
              onClick={handleImportWR}
              variant="outline"
              className="w-full bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors border border-gray-300"
            >
              <FileUp className="w-4 h-4 mr-2" />
              Import WR
            </Button>
            
            <Button
              onClick={handleTrackShipment}
              variant="outline"
              className="w-full bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors border border-gray-300"
            >
              <Search className="w-4 h-4 mr-2" />
              Track Shipment
            </Button>
            
            <Button
              onClick={handleGetQuote}
              variant="outline"
              className="w-full bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors border border-gray-300"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Get a Quote
            </Button>
          </div>
        </CardContent>
      </Card>

      <NewBookingModal 
        open={showNewBookingModal} 
        onOpenChange={setShowNewBookingModal} 
      />

      <PDFImportModal
        open={showPDFImportModal}
        onOpenChange={setShowPDFImportModal}
        onImportComplete={handleImportComplete}
      />
    </>
  );
}
