import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import * as Location from 'expo-location';

interface Props {
  onExit: () => void;
  code: string;
}

type CameraViewRef = React.ElementRef<typeof CameraView>;

export default function CameraPreview({ onExit }: Props) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [direction, setDirection] = useState<string | null>(null);
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [firstTapHappened, setFirstTapHappened] = useState(false);

  const glowOpacity = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef<CameraViewRef>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const dialogTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const steps = [
    { type: 'message', value: '🚪 Open the door and get inside' },
    { type: 'direction', value: 'right' },
    { type: 'direction', value: 'right' },
    { type: 'direction', value: 'right' },
    { type: 'message', value: '🎯 Oanh is right here!' },
  ];

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');
    })();

    return () => {
      locationSubscription.current?.remove();
    };
  }, []);

  const showDialogMessage = (message: string) => {
    setDialogMessage(message);
    if (dialogTimer.current) clearTimeout(dialogTimer.current);
    dialogTimer.current = setTimeout(() => setDialogMessage(null), 3000);
  };

  const animateGlow = (dir: string) => {
    setDirection(dir);
    glowOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(glowOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(800),
      Animated.timing(glowOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start(() => setDirection(null));
  };

  const handleScreenPress = () => {
    if (!firstTapHappened) {
      setNotificationVisible(true);
      setFirstTapHappened(true);
      return;
    }

    if (notificationVisible || !simulationStarted || currentStepIndex >= steps.length) return;

    const step = steps[currentStepIndex];
    if (step.type === 'message') showDialogMessage(step.value);
    if (step.type === 'direction') animateGlow(step.value);
    setCurrentStepIndex((prev) => prev + 1);
  };

  const getDirectionOverlay = (dir: string | null) => {
    if (!dir) return null;
    const animatedStyle = { opacity: glowOpacity };
    if (dir === 'right') return <Animated.View style={[styles.rightGlow, animatedStyle]} />;
    if (dir === 'left') return <Animated.View style={[styles.leftGlow, animatedStyle]} />;
    if (dir === 'top') return <Animated.View style={[styles.topGlow, animatedStyle]} />;
    if (dir === 'bottom') return <Animated.View style={[styles.bottomGlow, animatedStyle]} />;
    return null;
  };

  if (hasCameraPermission === null || hasLocationPermission === null) {
    return (
      <View style={styles.centered}>
        <Text className="text-white">Requesting permissions...</Text>
      </View>
    );
  }

  if (!hasCameraPermission || !hasLocationPermission) {
    return (
      <View style={styles.centered}>
        <Text className="text-white mb-4">Permission denied.</Text>
        <TouchableOpacity onPress={onExit} style={styles.exitButton}>
          <Text style={styles.exitText}>Exit</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Pressable style={StyleSheet.absoluteFillObject} onPress={handleScreenPress}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="back" />

      {/* Meters Display */}
      {simulationStarted && (
        <View style={styles.meterBox} pointerEvents="none">
          <Text style={styles.meterText}>0.0 meters away</Text>
        </View>
      )}

      {/* Dialog Message */}
      {dialogMessage && (
        <View style={styles.centerDialog} pointerEvents="none">
          <Text style={styles.dialogText}>{dialogMessage}</Text>
        </View>
      )}

      {/* Glow Directions */}
      {getDirectionOverlay(direction)}

      {/* Exit Button */}
      {simulationStarted && (
        <View style={styles.centeredRowBottom} pointerEvents="box-none">
          <TouchableOpacity onPress={onExit} style={styles.exitButton}>
            <Text style={styles.exitText}>Exit AR</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notification Box */}
      {notificationVisible && (
        <View style={styles.notificationBox}>
          <Text style={styles.notificationText}>
            Hey Olari we noticed that you're getting a bit bored.. We recognized that, Oanh who you met at a pub a month ago is also here alone and she is dancing in the middle of the crowd. She's open to connecting. Do you wanna go find her?
          </Text>
          <View style={styles.notificationButtons}>
            <TouchableOpacity
              onPress={() => {
                setNotificationVisible(false);
                setSimulationStarted(true);
                setCurrentStepIndex(0);
              }}
              style={styles.playButton}
            >
              <Text style={{ color: 'white' }}>Yes, start tracking</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setNotificationVisible(false)}
              style={styles.exitButton}
            >
              <Text style={{ color: 'white' }}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  meterBox: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,60,150,0.3)',
    borderColor: 'rgba(0,150,255,0.5)',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  meterText: {
    color: 'white',
    fontSize: 18,
  },
  centerDialog: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0,60,150,0.3)',
    borderColor: 'rgba(0,150,255,0.5)',
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    marginHorizontal: 40,
  },
  dialogText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  centeredRowBottom: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  exitButton: {
    backgroundColor: 'rgba(0,60,150,0.3)',
    borderColor: 'rgba(0,150,255,0.5)',
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  exitText: {
    color: 'white',
    fontSize: 18,
  },
  playButton: {
    backgroundColor: 'rgba(0,60,150,0.3)',
    borderColor: 'rgba(0,150,255,0.5)',
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  rightGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 60,
    height: '100%',
    backgroundColor: 'rgba(72, 135, 202, 0.4)',
  },
  leftGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 60,
    height: '100%',
    backgroundColor: 'rgba(255,0,100,0.4)',
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 60,
    backgroundColor: 'rgba(255,255,0,0.4)',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 60,
    backgroundColor: 'rgba(0,255,100,0.4)',
  },
  notificationBox: {
    position: 'absolute',
    top: 80,
    marginHorizontal: 20,
    backgroundColor: 'rgba(0,60,150,0.3)',
    borderColor: 'rgba(0,150,255,0.5)',
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 20,
  },
  notificationText: {
    color: 'white',
    fontSize: 15,
    textAlign: 'left',
  },
  notificationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
});
