import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

class AudioService {
  private static instance: AudioService;
  private backgroundMusic: Audio.Sound | null = null;
  private soundEffects: { [key: string]: Audio.Sound } = {};
  private isMuted = false;
  private musicVolume = 0.3;
  private effectsVolume = 0.7;

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  async initialize(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: 1, // Use 1 for DO_NOT_MIX, or use Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX if available
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: 1, // Use 1 for DO_NOT_MIX
        playThroughEarpieceAndroid: false,
      });

      // Preload sound effects
      await this.preloadSounds();
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  private async preloadSounds(): Promise<void> {
    try {
      // Create simple beep sounds using data URIs or use built-in system sounds
      // For now, we'll use haptic feedback as sound replacement
      console.log('Audio service initialized - using haptic feedback for sound effects');
    } catch (error) {
      console.error('Error preloading sounds:', error);
    }
  }

  async playBackgroundMusic(): Promise<void> {
    if (this.isMuted || this.backgroundMusic) return;

    try {
      // For demo purposes, we'll use a simple looping tone
      // In production, you'd load actual music files
      console.log('Background music would start playing here');
    } catch (error) {
      console.error('Error playing background music:', error);
    }
  }

  async stopBackgroundMusic(): Promise<void> {
    if (this.backgroundMusic) {
      try {
        await this.backgroundMusic.stopAsync();
        await this.backgroundMusic.unloadAsync();
        this.backgroundMusic = null;
      } catch (error) {
        console.error('Error stopping background music:', error);
      }
    }
  }

  async playClickSound(): Promise<void> {
    if (this.isMuted) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error playing click sound:', error);
    }
  }

  async playSuccessSound(): Promise<void> {
    if (this.isMuted) return;
    
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error playing success sound:', error);
    }
  }

  async playErrorSound(): Promise<void> {
    if (this.isMuted) return;
    
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.error('Error playing error sound:', error);
    }
  }

  async playWarningSound(): Promise<void> {
    if (this.isMuted) return;
    
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.error('Error playing warning sound:', error);
    }
  }

  async playPowerUpSound(): Promise<void> {
    if (this.isMuted) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.error('Error playing power-up sound:', error);
    }
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stopBackgroundMusic();
    }
  }

  isMusicMuted(): boolean {
    return this.isMuted;
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.backgroundMusic) {
      this.backgroundMusic.setVolumeAsync(this.musicVolume);
    }
  }

  setEffectsVolume(volume: number): void {
    this.effectsVolume = Math.max(0, Math.min(1, volume));
  }

  cleanup(): void {
    this.stopBackgroundMusic();
    Object.values(this.soundEffects).forEach(sound => {
      sound.unloadAsync().catch(console.error);
    });
    this.soundEffects = {};
  }
}

export default AudioService.getInstance();
