export interface LaunchSite {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  rockets: string[];
  subSites: string[];
}

export interface DangerZone {
  id: string;
  lat: number;
  lng: number;
  width: number; // in degrees
  height: number; // in degrees
  description: string;
  type: 'stage1' | 'stage2' | 'fairing' | 'reentry';
}

export interface TrajectoryPoint {
  lat: number;
  lng: number;
  altitude?: number;
}

export interface AnalysisResult {
  trajectory: TrajectoryPoint[];
  dangerZones: DangerZone[];
  stages: number;
  passesThailand: boolean;
  notes: string;
}

export interface LaunchEvent {
  mission: string;
  rocket: string;
  siteId: string;
  date: string;
}
