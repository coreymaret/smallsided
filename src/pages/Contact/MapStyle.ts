export const mapStyle = [
  { elementType: "geometry", stylers: [{ color: "#3a3a42" }] }, // Lighter base
  { elementType: "labels.text.fill", stylers: [{ color: "#d1d5db" }] }, // Much brighter text
  { elementType: "labels.text.stroke", stylers: [{ color: "#4a4a52" }] }, // Lighter stroke for contrast

  { featureType: "road", elementType: "geometry", stylers: [{ color: "#52525a" }] }, // Lighter roads
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#3a3a42" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#e5e7eb" }] }, // Even brighter for roads

  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#4a4a52" }] }, // Lighter highways
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#52525a" }] },

  { featureType: "water", elementType: "geometry", stylers: [{ color: "#2a2a35" }] }, // Lighter water
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#d1d5db" }] },

  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#4a4a52" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d1d5db" }] },

  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#42424a" }] }, // Lighter parks
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#d1d5db" }] },

  { featureType: "road.local", elementType: "geometry", stylers: [{ color: "#98ED66" }] }, // Your accent color
  { featureType: "transit.station", elementType: "labels.icon", stylers: [{ color: "#98ED66" }] },
];