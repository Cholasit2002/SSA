import { LaunchSite } from './types';

export const LAUNCH_SITES: LaunchSite[] = [
  {
    id: 'jiuquan',
    name: 'Jiuquan Satellite Launch Center',
    country: 'China',
    lat: 40.963,
    lng: 100.291,
    rockets: ['Long March 2D', 'Kuaizhou-1A'],
    subSites: ['Launch Site A', 'Launch Site B'],
  },
  {
    id: 'xichang',
    name: 'Xichang Satellite Launch Center',
    country: 'China',
    lat: 28.243,
    lng: 102.026,
    rockets: ['Long March 3B', 'Long March 2C'],
    subSites: ['Launch Complex 3', 'Launch Complex 4'],
  },
  {
    id: 'taiyuan',
    name: 'Taiyuan Satellite Launch Center',
    country: 'China',
    lat: 38.847,
    lng: 111.609,
    rockets: ['Long March 4B', 'Kuaizhou-1A'],
    subSites: ['Main Pad', 'Auxiliary Pad'],
  },
  {
    id: 'wenchang',
    name: 'Wenchang Satellite Launch Center',
    country: 'China',
    lat: 19.615,
    lng: 110.860,
    rockets: ['Long March 5', 'Long March 7'],
    subSites: ['LC-101', 'LC-201'],
  },
  {
    id: 'sdsc',
    name: 'Satish Dhawan Space Centre',
    country: 'India',
    lat: 13.736,
    lng: 80.230,
    rockets: ['PSLV', 'GSLV'],
    subSites: ['Second Launch Pad (SLP)', 'First Launch Pad (FLP)'],
  },
  {
    id: 'terls',
    name: 'Thumba Equatorial Rocket Launching Station',
    country: 'India',
    lat: 8.524,
    lng: 76.868,
    rockets: ['Rohini Sounding Rocket'],
    subSites: ['Sounding Rocket Pad'],
  },
];

export const THAILAND_BOUNDS = {
  north: 20.46,
  south: 5.61,
  west: 97.35,
  east: 105.64,
  centerLat: 13.75,
  centerLng: 100.50
};
