// utils/LocationSharing.ts
import { ref, set, onValue } from 'firebase/database';
import { database } from '../firebaseConfig';

export function shareLocationOnce(code: string, location: { latitude: number; longitude: number }) {
  const locationRef = ref(database, `locations/${code}`);
  return set(locationRef, {
    latitude: location.latitude,
    longitude: location.longitude,
    timestamp: Date.now(),
  });
}

export function subscribeToLocationUpdates(
  code: string,
  callback: (location: { latitude: number; longitude: number } | null) => void
) {
  const locationRef = ref(database, `locations/${code}`);
  return onValue(locationRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback({ latitude: data.latitude, longitude: data.longitude });
    } else {
      callback(null);
    }
  });
}
