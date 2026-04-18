import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { GAME_CONFIG } from '../../config/GameConfig';

const ProfileScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile Screen</Text>
        <Text style={styles.subtitle}>Coming Soon...</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GAME_CONFIG.COLORS.BACKGROUND,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: GAME_CONFIG.SPACING.LG,
  },
  title: {
    fontSize: GAME_CONFIG.FONTS.SIZE.XXXLARGE,
    fontWeight: GAME_CONFIG.FONTS.WEIGHT.BOLD,
    color: GAME_CONFIG.COLORS.TEXT_PRIMARY,
    marginBottom: GAME_CONFIG.SPACING.SM,
  },
  subtitle: {
    fontSize: GAME_CONFIG.FONTS.SIZE.LARGE,
    color: GAME_CONFIG.COLORS.TEXT_SECONDARY,
  },
});

export default ProfileScreen;
