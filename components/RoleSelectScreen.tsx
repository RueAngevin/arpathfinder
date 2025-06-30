// components/RoleSelectScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  onShare: () => void;
  onTrack: () => void;
}

export default function RoleSelectScreen({ onShare, onTrack }: Props) {
  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-5">
      <View className="bg-white rounded-lg p-8 shadow-lg w-full max-w-md items-center">
        <Text className="text-xl font-semibold mb-6">Select your role</Text>
        <TouchableOpacity
          onPress={onShare}
          className="bg-blue-600 w-full py-3 rounded-md mb-4"
        >
          <Text className="text-white text-center font-semibold">Share Location</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onTrack}
          className="bg-green-600 w-full py-3 rounded-md"
        >
          <Text className="text-white text-center font-semibold">Track Friend</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
