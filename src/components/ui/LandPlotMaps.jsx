import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { ExternalLink } from 'lucide-react';

// --- Konfigurasi Komponen Peta Utama ---
const containerStyle = {
  width: '100%',
  height: '100%'
};

const mapCenter = {
  lat: 3.507431,
  lng: 101.1077
};

// --- DATA DUMMY untuk 9 petak lahan jeruk ---
const landPlotsData = [
  { id: 1, position: { lat: 3.5360, lng: 101.1340 }, title: "Field 1 - Valencia Orange", description: "Mature Valencia orange trees (8-10 years). High-yield variety with excellent fruit quality. Drip irrigation system installed.", imageUrl: "https://images.unsplash.com/photo-1574856344991-aaa31b6f4ce3?q=80&w=2070&auto=format&fit=crop" },
  { id: 2, position: { lat: 3.5170, lng: 101.1060 }, title: "Field 2 - Navel Orange", description: "Premium navel orange grove with optimal spacing. Clay-loam soil provides excellent water retention for citrus growth.", imageUrl: "https://images.unsplash.com/photo-1530841344095-37bae0bbe7a7?q=80&w=2070&auto=format&fit=crop" },
  { id: 3, position: { lat: 3.5070, lng: 101.1120 }, title: "Field 3 - Blood Orange", description: "Specialty blood orange plantation. Eastern exposure provides ideal morning sunlight. Organic certified field.", imageUrl: "https://images.unsplash.com/photo-1605375109313-2647c4c9594f?q=80&w=2070&auto=format&fit=crop" },
  { id: 4, position: { lat: 3.5014, lng: 101.1320 }, title: "Field 4 - Mandarin Grove", description: "Young mandarin trees (3-5 years). High-density planting with micro-sprinkler irrigation. Excellent soil fertility.", imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2070&auto=format&fit=crop" },
  { id: 5, position: { lat: 3.5074, lng: 101.1477 }, title: "Field 5 - Main Hub Orange", description: "Central monitoring station with mixed orange varieties. Primary sensor network location for soil and weather monitoring.", imageUrl: "https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=2074&auto=format&fit=crop" },
  { id: 6, position: { lat: 3.5254, lng: 101.1484 }, title: "Field 6 - Lime Production", description: "Key lime and Persian lime trees. Well-established grove with consistent production. Natural windbreak protection.", imageUrl: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?q=80&w=2064&auto=format&fit=crop" },
  { id: 7, position: { lat: 3.5163, lng: 101.1370 }, title: "Field 7 - Grapefruit Section", description: "Pink and white grapefruit varieties. Sandy-loam soil ideal for citrus root development. Integrated pest management zone.", imageUrl: "https://images.unsplash.com/photo-1624511037223-28f8f047432f?q=80&w=2070&auto=format&fit=crop" },
  { id: 8, position: { lat: 3.5163, lng: 101.1577 }, title: "Field 8 - Lemon Grove", description: "Eureka and Lisbon lemon varieties. Located near water reservoir for optimal irrigation. Consistently high production yield.", imageUrl: "https://images.unsplash.com/photo-1553906297-dac2b76a5ceb?q=80&w=2070&auto=format&fit=crop" },
  { id: 9, position: { lat: 3.5063, lng: 101.1684 }, title: "Field 9 - Experimental Plot", description: "Research area for new citrus varieties and cultivation techniques. Climate-controlled greenhouse and nursery section.", imageUrl: "https://images.unsplash.com/photo-1589531739832-34f3a73c33a9?q=80&w=2070&auto=format&fit=crop" }
];


const LandPlotsMap = () => {
    // Hook ini memuat skrip Google Maps dan memberitahu Anda saat sudah siap
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
    });

    const [activeMarker, setActiveMarker] = useState(null);

    const handleMarkerClick = (marker) => {
        setActiveMarker(marker);
    };

    if (!isLoaded) return <div className="text-center p-8 bg-white rounded-lg shadow-md border border-gray-200">Loading Map...</div>;

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Land Plots Overview</h3>
            <div className="h-96 w-full rounded-lg overflow-hidden">
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={mapCenter}
                    zoom={17}
                    mapTypeId='satellite'
                    options={{ 
                        mapTypeControl: true, 
                        mapTypeControlOptions: {
                            style: window.google?.maps?.MapTypeControlStyle?.HORIZONTAL_BAR,
                            position: window.google?.maps?.ControlPosition?.TOP_CENTER,
                        },
                        streetViewControl: false, 
                        fullscreenControl: true,
                        zoomControl: true,
                        scaleControl: true,
                        rotateControl: true,
                        tilt: 0
                    }}
                >
                    {landPlotsData.map((plot) => (
                        <Marker
                            key={plot.id}
                            position={plot.position}
                            onClick={() => handleMarkerClick(plot)}
                        />
                    ))}

                    {activeMarker && (
                        <InfoWindow
                            position={activeMarker.position}
                            onCloseClick={() => setActiveMarker(null)}
                            options={{
                                maxWidth: 400,
                                pixelOffset: new window.google.maps.Size(0, -10)
                            }}
                        >
                            <div className="w-96 max-w-sm">
                                <img src={activeMarker.imageUrl} alt={activeMarker.title} className="w-full h-48 object-cover rounded-md shadow-lg" />
                                <h4 className="font-bold text-lg my-3 text-gray-800">{activeMarker.title}</h4>
                                <p className="text-sm text-gray-600 mb-3 leading-relaxed">{activeMarker.description}</p>
                                <div className="flex justify-between items-center">
                                    <a href={`https://www.google.com/maps?q=${activeMarker.position.lat},${activeMarker.position.lng}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-blue-600 hover:underline font-medium">
                                        View in Google Maps <ExternalLink className="w-4 h-4 ml-1" />
                                    </a>
                                    <span className="text-xs text-gray-400">Field ID: {activeMarker.id}</span>
                                </div>
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>
            </div>
        </div>
    );
};

export default LandPlotsMap;