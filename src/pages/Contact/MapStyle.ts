export const mapStyle = [
  { elementType: "geometry", stylers: [{ color: "#15141a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#15141a" }] },

  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2930" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1a1a1a" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },

  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#2a2930" }] },

  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f0f11" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },

  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },

  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1d1d24" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },

  { featureType: "road.local", elementType: "geometry", stylers: [{ color: "#98ED66" }] },
  { featureType: "transit.station", elementType: "labels.icon", stylers: [{ color: "#98ED66" }] },
];
