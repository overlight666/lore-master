import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList, StoreItem } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';
import AnimatedBackground from '../../components/AnimatedBackground';
import ParticleSystem from '../../components/ParticleSystem';
import GameStatusBar from '../../components/GameStatusBar';
import GameButton from '../../components/GameButton';
import GameCard from '../../components/GameCard';
import AudioService from '../../services/AudioService';
import ApiService from '../../services/ApiService';

type StoreScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Store'>;

interface Props {
  navigation: StoreScreenNavigationProp;
}

const StoreScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { energy, loadEnergyStatus } = useGame();
  const [storeItems, setStoreItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [coins, setCoins] = useState(500); // Mock coins for now

  useEffect(() => {
    loadStoreItems();
  }, []);

  const loadStoreItems = async () => {
    try {
      setLoading(true);
      const items = await ApiService.getStoreItems();
      setStoreItems(items);
    } catch (error) {
      console.error('Failed to load store items:', error);
      // Mock data for development
      setStoreItems([
        { id: 'energy-refill', name: 'Energy Refill', cost: 100, type: 'energy', description: 'Restore full energy instantly!' },
        { id: 'double-coins', name: 'Double Coins', cost: 250, type: 'powerup', description: 'Double coin rewards for 24 hours!' },
        { id: 'hint-pack', name: 'Hint Pack (5x)', cost: 150, type: 'hint', description: 'Get 5 helpful hints for tough questions!' },
        { id: 'time-freeze', name: 'Time Freeze', cost: 200, type: 'powerup', description: 'Stop the timer for 10 seconds!' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (item: any) => {
    if (!user) return;

    // Check if user has enough coins
    if (coins < item.cost) {
      AudioService.playErrorSound();
      Alert.alert('Insufficient Coins', `You need ${item.cost} coins to purchase this item.`);
      return;
    }

    try {
      setPurchasing(item.id);
      AudioService.playClickSound();
      
      const item_type: 'energy' | 'fiftyFifty' | 'callFriend' =
        item.type === 'energy'
          ? 'energy'
          : item.type === 'hint'
            ? 'callFriend'
            : 'fiftyFifty';
      await ApiService.purchaseItem({
        item_type,
        quantity: 1,
        price: item.cost,
      });
      
      AudioService.playSuccessSound();
      Alert.alert('Purchase Successful!', `You've purchased ${item.name}!`);
      
      // Reload energy status if it was an energy item
      if (item.type === 'energy') {
        loadEnergyStatus();
      }
      
      // Update coins
      setCoins(prev => prev - item.cost);
      
    } catch (error) {
      AudioService.playErrorSound();
      Alert.alert('Purchase Failed', 'There was an error processing your purchase.');
      console.error('Purchase error:', error);
    } finally {
      setPurchasing(null);
    }
  };

  const handleBack = () => {
    AudioService.playClickSound();
    navigation.goBack();
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'energy': return '⚡';
      case 'powerup': return '💎';
      case 'hint': return '💡';
      default: return '🎁';
    }
  };

  return (
    <AnimatedBackground variant="mystical">
      <ParticleSystem count={10} emoji="💎" duration={5000} />
      <ParticleSystem count={8} emoji="⭐" duration={4000} />
      <SafeAreaView style={styles.container}>
        {/* Status Bar */}
        <GameStatusBar
          onEnergyPress={() => {}}
          onCoinsPress={() => {}}
          onStarPress={() => {}}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🛒 Mystical Store</Text>
          <Text style={styles.subtitle}>Enhance your quest with magical items!</Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>🔮 Loading magical items...</Text>
            </View>
          ) : (
            <View style={styles.itemsGrid}>
              {storeItems.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemIcon}>{getItemIcon(item.type)}</Text>
                    <Text style={styles.itemName}>{item.name}</Text>
                  </View>
                  
                  <Text style={styles.itemDescription}>{item.description}</Text>
                  
                  <View style={styles.itemFooter}>
                    <View style={styles.priceContainer}>
                      <Text style={styles.priceText}>{item.cost}</Text>
                      <Text style={styles.coinIcon}>🪙</Text>
                    </View>
                    
                    <GameButton
                      title={purchasing === item.id ? "⏳" : "Buy"}
                      onPress={() => handlePurchase(item)}
                      variant="primary"
                      size="small"
                      disabled={purchasing === item.id || coins < item.cost}
                      style={styles.buyButton}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
          
          {/* Special Offers Section */}
          <View style={styles.specialSection}>
            <Text style={styles.sectionTitle}>🌟 Special Offers</Text>
            <GameCard
              title="🎯 Daily Energy Pack"
              subtitle="Get 3 energy refills for the price of 2!"
              icon="⚡"
              onPress={() => {
                AudioService.playClickSound();
                Alert.alert('Coming Soon!', 'Daily deals will be available soon!');
              }}
              size="medium"
              variant="premium"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFD700',
    textAlign: 'center',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  itemsGrid: {
    gap: 16,
  },
  itemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  itemName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  itemDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    lineHeight: 20,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFD700',
    marginRight: 4,
  },
  coinIcon: {
    fontSize: 20,
  },
  buyButton: {
    minWidth: 80,
  },
  disabledButton: {
    opacity: 0.5,
  },
  specialSection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default StoreScreen;
