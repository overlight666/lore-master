import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';

interface LottieAnimationProps {
  source: any; // Lottie animation JSON or URL
  style?: ViewStyle;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  onAnimationFinish?: () => void;
  onAnimationStart?: () => void;
  progress?: number;
  resizeMode?: 'contain' | 'cover' | 'center';
  duration?: number;
  repeatCount?: number;
  colorFilters?: Array<{
    keypath: string;
    color: string;
  }>;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  source,
  style,
  autoPlay = true,
  loop = true,
  speed = 1,
  onAnimationFinish,
  onAnimationStart,
  progress,
  resizeMode = 'contain',
  duration,
  repeatCount,
  colorFilters,
}) => {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (autoPlay && animationRef.current) {
      animationRef.current.play();
    }
  }, [autoPlay]);

  useEffect(() => {
    if (progress !== undefined && animationRef.current) {
      animationRef.current.play(progress, progress);
    }
  }, [progress]);

  const handleAnimationFinish = () => {
    onAnimationFinish?.();
  };

  return (
    <View style={[styles.container, style]}>
      <LottieView
        ref={animationRef}
        source={source}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        style={styles.animation}
        resizeMode={resizeMode}
        onAnimationFinish={handleAnimationFinish}
        duration={duration}
        colorFilters={colorFilters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});

export default LottieAnimation;
