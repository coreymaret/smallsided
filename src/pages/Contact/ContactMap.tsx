import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useEffect, useState, useRef } from "react";
import { mapStyle } from "./MapStyle";

const containerStyle = {
  width: "100%",
  height: "400px",
} as const;

const center = { lat: 28.043893, lng: -82.402916 };

export default function ContactMap() {
  const [mapsApiLoaded, setMapsApiLoaded] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    setMapsApiLoaded(true);
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const fixControls = () => {
      const buttons = document.querySelectorAll('button.gm-control-active') as NodeListOf<HTMLButtonElement>;
      
      buttons.forEach((button) => {
        const bgPosition = button.style.backgroundPosition;
        
        // Check if it has the '6px center' background position (pan buttons)
        if (bgPosition && bgPosition.includes('6px')) {
          // Fix the background position to center
          button.style.background = button.style.background.replace('6px center', 'center center');
        }
        
        // Fix ALL image positions (both zoom and pan buttons have images)
        const imgs = button.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
        imgs.forEach(img => {
          // Override width: 100% and transform that's causing misalignment
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
  }, [mapsApiLoaded]);

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onLoad={onMapLoad}
        options={{
          styles: mapStyle,
          zoomControl: true,
          zoomControlOptions: {
            position: window.google?.maps.ControlPosition.RIGHT_CENTER,
          },
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        {mapsApiLoaded && window.google && (
          <Marker
            position={center}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: "#98ED66",
              fillOpacity: 1,
              strokeColor: "#15141a",
              strokeWeight: 3,
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
}