import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

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

  const glowOpacity = useRef(new Animated.Value(0)).current;

  const cameraRef = useRef<CameraViewRef>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const simulationTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const dialogTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');
    })();

    return () => {
      locationSubscription.current?.remove();
    };
  }, []);

  const startSimulation = () => {
    setSimulationStarted(true);
    // showDialogMessage('🔁 Simulation started...');

    const steps = [
      { delay: 7000, message: '🚪 Open the door and get inside' },
      { delay: 17000, direction: 'right' },
      { delay: 25000, direction: 'right' },
      { delay: 29000, direction: 'right' },
      { delay: 31000, message: 'Friend is right here!' },
    ];

    simulationTimers.current = steps.map((step) =>
      setTimeout(() => {
        if (step.message) {
          showDialogMessage(step.message);
        } else if (step.direction) {
          animateGlow(step.direction);
        }
      }, step.delay)
    );
  };

  const showDialogMessage = (message: string) => {
    setDialogMessage(message);
    if (dialogTimer.current) clearTimeout(dialogTimer.current);
    dialogTimer.current = setTimeout(() => {
      setDialogMessage(null);
    }, 3000);
  };

  const animateGlow = (dir: string) => {
    setDirection(dir);
    glowOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(800),
      Animated.timing(glowOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => setDirection(null));
  };

  useEffect(() => {
    return () => {
      simulationTimers.current.forEach(clearTimeout);
      if (dialogTimer.current) clearTimeout(dialogTimer.current);
    };
  }, []);

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
        <TouchableOpacity onPress={onExit} style={styles.button}>
          <Text className="text-white">Exit</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="back" />

      {/* Meters Display */}
      <View style={styles.meterBox}>
        <Text style={styles.meterText}>0.0 meters away</Text>
      </View>

      {/* Dialog Message */}
      {dialogMessage && (
        <View style={styles.centerDialog}>
          <Text style={styles.dialogText}>{dialogMessage}</Text>
        </View>
      )}

      {/* Glow Directions */}
      {getDirectionOverlay(direction)}

      {/* Start Button */}
      {!simulationStarted && (
        <View style={styles.centeredRow}>
          <TouchableOpacity onPress={startSimulation} style={styles.playButton}>
            <Ionicons name="play" size={28} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Exit Button */}
      <View style={styles.centeredRowBottom}>
        <TouchableOpacity onPress={onExit} style={styles.exitButton}>
          <Text style={styles.exitText}>Exit AR</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  centeredRow: {
    position: 'absolute',
    bottom: 110,
    width: '100%',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: 'rgba(0,60,150,0.3)',
    borderColor: 'rgba(0,150,255,0.5)',
    borderWidth: 1,
    padding: 12,
    borderRadius: 50,
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
});
