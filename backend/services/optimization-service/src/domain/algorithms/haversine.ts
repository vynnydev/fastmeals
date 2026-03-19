/**
 * Haversine Formula
 *
 * Calculates the great-circle distance between two points on Earth
 * given their latitude and longitude in decimal degrees.
 *
 * Formula:
 *   a = sin²((lat2 - lat1) / 2) + cos(lat1) * cos(lat2) * sin²((lon2 - lon1) / 2)
 *   c = 2 * atan2(sqrt(a), sqrt(1 - a))
 *   d = R * c   (where R = 6371 km, Earth's mean radius)
 *
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 *
 * @param lat1 - Latitude of point 1 (degrees)
 * @param lon1 - Longitude of point 1 (degrees)
 * @param lat2 - Latitude of point 2 (degrees)
 * @param lon2 - Longitude of point 2 (degrees)
 * @returns Distance in kilometers
 */

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const radLat1 = toRadians(lat1);
  const radLat2 = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}