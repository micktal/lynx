// Simple GeoJSON loader for France regions & departments via CDN
export const REGIONS_GEOJSON_CDN = 'https://cdn.jsdelivr.net/gh/gregoiredavid/france-geojson@master/regions/regions.geojson';
export const DEPARTMENTS_GEOJSON_CDN = 'https://cdn.jsdelivr.net/gh/gregoiredavid/france-geojson@master/departements/departements.geojson';

export async function fetchRegionsGeoJSON(): Promise<any> {
  const res = await fetch(REGIONS_GEOJSON_CDN, { cache: 'force-cache' });
  if (!res.ok) throw new Error('Failed to load regions GeoJSON');
  return res.json();
}

export async function fetchDepartmentsGeoJSON(): Promise<any> {
  const res = await fetch(DEPARTMENTS_GEOJSON_CDN, { cache: 'force-cache' });
  if (!res.ok) throw new Error('Failed to load departments GeoJSON');
  return res.json();
}
