import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
  Image,
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
  const [metersAway, setMetersAway] = useState(25)

  const glowOpacity = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef<CameraViewRef>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const dialogTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pressCooldownRef = useRef<number>(0);


  const steps = [
    { type: 'message', value: '🚪 Open the door and get inside' },
    { type: 'direction', value: 'top' },
    { type: 'direction', value: 'right' },
    { type: 'direction', value: 'top' },
    { type: 'direction', value: 'right' },
    { type: 'direction', value: 'top' },
    { type: 'direction', value: 'right' },
    { type: 'message', value: '🎯 Oanh is right behind the door!' },
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
    glowOpacity.setValue(100)
    if (dir === 'top') {
      return
    }
    glowOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(glowOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(800),
      Animated.timing(glowOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start(() => setDirection(null));
  };

  const handleScreenPress = () => {
    const now = Date.now();
    if (now - pressCooldownRef.current < 2000) {
      // Cooldown not passed
      return;
    }
    pressCooldownRef.current = now;

    if (!firstTapHappened) {
      setNotificationVisible(true);
      setFirstTapHappened(true);
      return;
    }

    if (notificationVisible || !simulationStarted) {
      setFirstTapHappened(false)
      return
    }

    if (currentStepIndex >= steps.length) {
      setCurrentStepIndex(0)
      setFirstTapHappened(false)
      setNotificationVisible(false)
      setSimulationStarted(false)
      setMetersAway(25)
      return
    }

    const step = steps[currentStepIndex];
    if (step.type === 'message') showDialogMessage(step.value);
    if (step.type === 'direction') animateGlow(step.value);
    setCurrentStepIndex((prev) => prev + 1);
    if (step.value === 'top') {
      const steps = 26; // 3 seconds at 125ms per step
      const totalChange = 8;
      const changePerStep = totalChange / steps;

      setTimeout(() => {
        let currentStep = 0;
        const interval = setInterval(() => {
          setMetersAway(prev => {
            const next = prev - changePerStep;
            return parseFloat(next.toFixed(1)); // Limit to 1 decimal place
          });

          currentStep++;
          if (currentStep >= steps) clearInterval(interval);
        }, 150); // 100ms per step
      }, 1500); // 1 second delay before starting the countdown

    }};


    const getDirectionOverlay = (dir: string | null) => {
      if (!dir) return null;

      const rotationMap: Record<string, string> = {
        top: '0deg',
        right: '90deg',
        bottom: '180deg',
        left: '270deg',
      };

      const rotation = rotationMap[dir] || '0deg';

      return (
        <Animated.View
          style={[
            styles.arrowContainer,
            { opacity: glowOpacity, transform: [{ rotate: rotation }] },
          ]}
        >
          <Image source={require('../assets/uparrowpng.png')} style={styles.arrow} />
        </Animated.View>
      );
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
            <Text style={styles.meterText}>{metersAway} meters away</Text>
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
    arrowContainer: {
      position: 'absolute',
      top: '45%',
      left: '45%',
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
    arrow: {
      width: 500,
      height: 500,
      tintColor: 'red', // Optional: changes the color of the arrow if it's a monochrome image
    },

  });
