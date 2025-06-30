// components/ShareLocationScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import { shareLocationOnce } from '../utils/LocationSharing';

interface Props {
  code: string;
  onBack: () => void;
}

export default function ShareLocationScreen({ code, onBack }: Props) {
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Cannot share location without permission.');
        onBack();
        return;
      }

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 1000,
          distanceInterval: 0.5,
        },
        (location) => {
          shareLocationOnce(code, {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }).catch((err) => {
            console.error('Error sharing location:', err);
          });
        }
      );
    })();

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
    };
  }, [code]);

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-5">
      <Text className="text-lg mb-4">Your code to share:</Text>
      <View className="bg-white rounded-lg p-8 shadow-lg w-full max-w-md items-center">
        <Text className="text-3xl font-bold mb-6">{code}</Text>
        <TouchableOpacity
          onPress={() => {
            if (locationSubscription.current) {
              locationSubscription.current.remove();
              locationSubscription.current = null;
            }
            onBack();
          }}
          className="bg-gray-400 w-full py-3 rounded-md"
        >
          <Text className="text-white text-center font-semibold">Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
