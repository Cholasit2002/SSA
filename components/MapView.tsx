import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Rectangle, useMap } from 'react-leaflet';
import L from 'leaflet';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { LaunchSite, AnalysisResult } from '../types';
import { THAILAND_BOUNDS } from '../constants';

// Fix Leaflet marker icons using CDN URLs for browser compatibility
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconShadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: iconUrl,
  shadowUrl: iconShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  mode: '2D' | '3D';
  selectedSite: LaunchSite | null;
  analysis: AnalysisResult | null;
}

const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 5);
  }, [center, map]);
  return null;
};

const MapView: React.FC<MapViewProps> = ({ mode, selectedSite, analysis }) => {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [globeReady, setGlobeReady] = useState(false);

  // Data for Globe
  const arcsData = useMemo(() => {
    if (!selectedSite || !analysis) return [];
    // Draw a simple arc from start to end of the trajectory
    const endPoint = analysis.trajectory[analysis.trajectory.length - 1];
    return [{
      startLat: selectedSite.lat,
      startLng: selectedSite.lng,
      endLat: endPoint.lat,
      endLng: endPoint.lng,
      color: '#f59e0b'
    }];
  }, [selectedSite, analysis]);

  const ringsData = useMemo(() => {
    if (!analysis) return [];
    return analysis.dangerZones.map(dz => ({
      lat: dz.lat,
      lng: dz.lng,
      maxR: Math.max(dz.width, dz.height) * 2, // Scale needed for globe viz
      color: 'rgba(239, 68, 68, 0.8)'
    }));
  }, [analysis]);

  useEffect(() => {
    if (mode === '3D' && selectedSite && globeRef.current) {
        // slight delay to ensure ref is mounted
        setTimeout(() => {
             globeRef.current?.pointOfView({ lat: selectedSite.lat, lng: selectedSite.lng, altitude: 2.5 }, 1000);
        }, 500);
    }
  }, [mode, selectedSite]);

  if (mode === '3D') {
    return (
      <div className="w-full h-full bg-black relative overflow-hidden">
        <Globe
          ref={globeRef}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          arcsData={arcsData}
          arcColor={'color'}
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={1500}
          ringsData={ringsData}
          ringColor={'color'}
          ringMaxRadius={'maxR'}
          ringPropagationSpeed={2}
          ringRepeatPeriod={1000}
          pointsData={selectedSite ? [{lat: selectedSite.lat, lng: selectedSite.lng, name: selectedSite.name}] : []}
          pointLabel="name"
          pointColor={() => '#10b981'}
          pointAltitude={0.1}
          pointRadius={0.5}
          onGlobeReady={() => setGlobeReady(true)}
        />
         {/* Overlay Instructions for 3D */}
         <div className="absolute bottom-4 left-4 bg-black/50 p-2 text-xs text-zinc-400 rounded backdrop-blur-sm pointer-events-none z-10">
            Left Click: Rotate | Right Click: Pan | Wheel: Zoom
        </div>
      </div>
    );
  }

  // 2D Map Configuration
  const mapCenter: [number, number] = selectedSite 
    ? [selectedSite.lat, selectedSite.lng] 
    : [13.75, 100.50]; // Default to Thailand

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={mapCenter} 
        zoom={4} 
        style={{ height: '100%', width: '100%', background: '#111' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        <TileLayer
           attribution='Labels'
           url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        />
        
        {selectedSite && <MapController center={mapCenter} />}

        {/* Launch Site Marker */}
        {selectedSite && (
          <Marker position={[selectedSite.lat, selectedSite.lng]}>
            <Popup>
              <div className="text-zinc-900">
                <strong>{selectedSite.name}</strong><br/>
                {selectedSite.country}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Trajectory Polyline */}
        {analysis && (
          <Polyline 
            positions={analysis.trajectory.map(p => [p.lat, p.lng])}
            pathOptions={{ color: '#f59e0b', weight: 3, dashArray: '10, 10' }} 
          />
        )}

        {/* Danger Zones */}
        {analysis && analysis.dangerZones.map((zone, idx) => (
          <Rectangle
            key={zone.id || idx}
            bounds={[
              [zone.lat - zone.height/2, zone.lng - zone.width/2],
              [zone.lat + zone.height/2, zone.lng + zone.width/2]
            ]}
            pathOptions={{ 
              color: zone.type === 'stage1' ? '#ef4444' : '#eab308', 
              fillColor: zone.type === 'stage1' ? '#ef4444' : '#eab308',
              fillOpacity: 0.3,
              weight: 1
            }}
          >
            <Popup>
              <div className="text-zinc-900">
                <strong>{zone.type.toUpperCase()}</strong><br/>
                {zone.description}
              </div>
            </Popup>
          </Rectangle>
        ))}

        {/* Thailand Border (Highlight Yellow) */}
        <Rectangle
           bounds={[
             [THAILAND_BOUNDS.south, THAILAND_BOUNDS.west],
             [THAILAND_BOUNDS.north, THAILAND_BOUNDS.east]
           ]}
           pathOptions={{ 
             color: '#facc15', // Yellow-400
             fillColor: '#facc15', 
             fillOpacity: 0.1, 
             weight: 2, 
             dashArray: '10, 5' 
           }}
        >
             <Popup>
               <div className="text-zinc-900 font-semibold">Thailand Monitoring Region</div>
             </Popup>
        </Rectangle>
      </MapContainer>
    </div>
  );
};

export default MapView;