// components/TrackFriendScreen.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

interface Props {
  inputCode: string;
  setInputCode: (text: string) => void;
  onStartTracking: () => void;
  onBack: () => void;
}

export default function TrackFriendScreen({
  inputCode,
  setInputCode,
  onStartTracking,
  onBack,
}: Props) {
  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-5">
      <View className="bg-white rounded-lg p-8 shadow-lg w-full max-w-md">
        <Text className="text-xl font-semibold mb-4">Enter Friend’s Code:</Text>
        <TextInput
          value={inputCode}
          onChangeText={setInputCode}
          maxLength={6}
          autoCapitalize="characters"
          className="border border-gray-400 rounded-md p-3 mb-6"
          placeholder="ABC123"
        />
        <TouchableOpacity
          onPress={onStartTracking}
          className="bg-green-600 w-full py-3 rounded-md mb-4"
        >
          <Text className="text-white text-center font-semibold">Start Tracking</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onBack}
          className="bg-gray-400 w-full py-3 rounded-md"
        >
          <Text className="text-white text-center font-semibold">Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
