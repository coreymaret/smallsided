import { GoogleMap, LoadScript, OverlayView } from "@react-google-maps/api";
import { useEffect, useRef } from "react";
import { mapStyle } from "./MapStyle";

const containerStyle = {
  width: "100%",
  height: "400px",
} as const;

// Coordinates for 10165 McKinley Dr, Tampa, FL 33612
const center = { lat: 28.0339, lng: -82.4528 };

export default function ContactMap() {
  const mapRef = useRef<google.maps.Map | null>(null);

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  const handleMarkerClick = () => {
    const address = encodeURIComponent("10165 McKinley Dr, Tampa, FL 33612");
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const fixControls = () => {
      const buttons = document.querySelectorAll('button.gm-control-active') as NodeListOf<HTMLButtonElement>;
      
      buttons.forEach((button) => {
        const bgPosition = button.style.backgroundPosition;
        
        if (bgPosition && bgPosition.includes('6px')) {
          button.style.background = button.style.background.replace('6px center', 'center center');
        }
        
        const imgs = button.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
        imgs.forEach(img => {
          img.style.cssText = `
            position: absolute !important; 
            top: 6px !important; 
            left: 6px !important; 
            width: 28px !important;
            height: 28px !important;
            margin: 0 !important; 
            padding: 0 !important;
            transform: none !important;
          `;
        });
      });
    };

    setTimeout(fixControls, 1000);
    setTimeout(fixControls, 2000);
  }, []);

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        onLoad={onMapLoad}
        options={{
          styles: mapStyle,
          zoomControl: false,
          panControl: true,
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          gestureHandling: 'cooperative',
        }}
      >
        <OverlayView
          position={center}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          <div
            onClick={handleMarkerClick}
            style={{
              position: 'absolute',
              transform: 'translate(-50%, -100%)',
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              backgroundColor: '#98ED66',
              border: '4px solid #15141a',
              borderRadius: '50% 50% 50% 0',
              transform: 'rotate(-45deg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
            }}>
              <span style={{
                transform: 'rotate(45deg)',
                fontSize: '24px',
              }}>⚽</span>
            </div>
          </div>
        </OverlayView>
      </GoogleMap>
    </LoadScript>
  );
}