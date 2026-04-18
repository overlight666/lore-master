import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { GAME_CONFIG } from '../../config/GameConfig';

const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={GAME_CONFIG.COLORS.PRIMARY} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: GAME_CONFIG.COLORS.BACKGROUND,
  },
  loadingText: {
    marginTop: GAME_CONFIG.SPACING.MD,
    fontSize: GAME_CONFIG.FONTS.SIZE.MEDIUM,
    color: GAME_CONFIG.COLORS.TEXT_PRIMARY,
    fontWeight: GAME_CONFIG.FONTS.WEIGHT.NORMAL,
  },
});

export default LoadingScreen;
