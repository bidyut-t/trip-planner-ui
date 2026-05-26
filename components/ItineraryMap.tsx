"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ItineraryActivity } from '@/types';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom green marker for included activities
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom red marker for excluded activities
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface ActivityLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  included: boolean;
  reason?: string;
  activity?: ItineraryActivity;
  day?: number;
  timeBlock?: string;
}

interface Props {
  activities: ItineraryActivity[];
  excludedActivities?: ActivityLocation[];
}

// Helper to get mock coordinates (in real app, these would come from API)
function getActivityCoordinates(activityId: string): [number, number] {
  const coordinates: Record<string, [number, number]> = {
    'nyc-empire-state-top-rock': [40.7484, -73.9857],
    'nyc-breakfast-jacks-wife-freda': [40.7259, -73.9965],
    'nyc-central-park-bike': [40.7829, -73.9654],
    'nyc-dinner-le-bernardin': [40.7614, -73.9776],
    'nyc-breakfast-balthazar': [40.7223, -73.9987],
    'nyc-met-museum-tour': [40.7794, -73.9632],
    'nyc-lunch-katzs': [40.7223, -73.9873],
    'nyc-brooklyn-bridge-walk': [40.7061, -73.9969],
    'nyc-dinner-gramercy-tavern': [40.7388, -73.9877],
    'nyc-brunch-clinton-street': [40.7215, -73.9842],
    'nyc-moma-american-museum': [40.7614, -73.9776],
    'nyc-high-line-chelsea': [40.7480, -74.0048],
    'nyc-dinner-eleven-madison': [40.7425, -73.9870],
    // Excluded activities (outside radius or not partner)
    'nyc-statue-liberty': [40.6892, -74.0445],
    'nyc-bronx-zoo': [40.8506, -73.8769],
    'nyc-coney-island': [40.5755, -73.9707],
  };
  return coordinates[activityId] || [40.7580, -73.9855]; // Default to Times Square
}

// Component to fit bounds to all markers
function MapBounds({ locations }: { locations: ActivityLocation[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(
        locations.map(loc => [loc.lat, loc.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);
  
  return null;
}

export default function ItineraryMap({ activities, excludedActivities = [] }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[500px] glass-dark rounded-2xl flex items-center justify-center">
        <p className="text-white/70">Loading map...</p>
      </div>
    );
  }

  // Prepare included activities with coordinates
  const includedLocations: ActivityLocation[] = [];
  const routeCoordinates: [number, number][] = [];
  let dayCounter = 1;
  let activitiesInCurrentDay = 0;
  const activitiesPerDay = Math.ceil(activities.length / 3); // Assuming 3 days
  
  activities.forEach((activity, index) => {
    if (activitiesInCurrentDay >= activitiesPerDay && dayCounter < 3) {
      dayCounter++;
      activitiesInCurrentDay = 0;
    }
    
    // Try to get coordinates from API response first, fallback to hardcoded
    let coords: [number, number];
    if (activity.activity.latitude && activity.activity.longitude) {
      coords = [activity.activity.latitude, activity.activity.longitude];
    } else {
      coords = getActivityCoordinates(activity.activity.id);
    }
    
    const location: ActivityLocation = {
      id: activity.activity.id,
      name: activity.activity.name,
      lat: coords[0],
      lng: coords[1],
      included: true,
      activity,
      day: dayCounter,
      timeBlock: activity.timeBlock,
    };
    includedLocations.push(location);
    routeCoordinates.push(coords);
    activitiesInCurrentDay++;
  });

  // Mock excluded activities (activities considered but not included)
  const mockExcludedActivities: ActivityLocation[] = [
    {
      id: 'nyc-strawberry-fields',
      name: 'Strawberry Fields (John Lennon Memorial)',
      lat: 40.7756,
      lng: -73.9754,
      included: false,
      reason: 'Not from integrated Marriott partner',
    },
    {
      id: 'nyc-statue-liberty',
      name: 'Statue of Liberty',
      lat: 40.6892,
      lng: -74.0445,
      included: false,
      reason: 'Too far from route (12km from nearest stop)',
    },
    {
      id: 'nyc-bronx-zoo',
      name: 'Bronx Zoo',
      lat: 40.8506,
      lng: -73.8769,
      included: false,
      reason: 'Outside NEARBY_CATALOG_RADIUS_KM (15km threshold)',
    },
    {
      id: 'nyc-times-square-diner',
      name: 'Times Square Local Diner',
      lat: 40.7590,
      lng: -73.9845,
      included: false,
      reason: 'Not from integrated Marriott partner',
    },
  ];

  const allLocations = [...includedLocations, ...mockExcludedActivities];
  const center: [number, number] = [40.7580, -73.9855]; // NYC center

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="glass-dark rounded-2xl p-4 flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white shadow-lg"></div>
          <span className="text-white text-sm font-medium">Included in your plan</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white shadow-lg"></div>
          <span className="text-white text-sm font-medium">Considered but excluded</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-1 bg-blue-900"></div>
          <span className="text-white text-sm font-medium">Route path</span>
        </div>
      </div>

      {/* Map */}
      <div className="glass-dark rounded-2xl overflow-hidden" style={{ height: '500px' }}>
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Included activities (green pins) */}
          {includedLocations.map((location, index) => (
            <Marker 
              key={location.id} 
              position={[location.lat, location.lng]}
              icon={greenIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-sm mb-1">
                    Day {location.day} - Stop {index + 1}
                  </h3>
                  <p className="font-medium">{location.name}</p>
                  {location.timeBlock && (
                    <p className="text-xs text-gray-600 mt-1">⏰ {location.timeBlock}</p>
                  )}
                  {location.activity && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Marriott Partner - Earn {location.activity.activity.earnPoints} pts
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Excluded activities (red pins) */}
          {mockExcludedActivities.map((location) => (
            <Marker 
              key={location.id} 
              position={[location.lat, location.lng]}
              icon={redIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-sm mb-1">Not Included</h3>
                  <p className="font-medium">{location.name}</p>
                  {location.reason && (
                    <p className="text-xs text-red-600 mt-1">
                      ✗ {location.reason}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Route path connecting green pins - solid blue line */}
          {routeCoordinates.length > 1 && (
            <Polyline 
              positions={routeCoordinates}
              color="#1e40af"
              weight={4}
              opacity={0.8}
            />
          )}

          <MapBounds locations={allLocations} />
        </MapContainer>
      </div>
    </div>
  );
}
