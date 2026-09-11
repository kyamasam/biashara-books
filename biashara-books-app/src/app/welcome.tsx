import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  type ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/button';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

const SLIDES = [
  {
    id: '1',
    image: require('../../assets/images/backgrounds/landing/clothing-store.png') as number,
    headline: 'Know Your Business Numbers',
    copy: 'Tag every sale, track every shilling — from the till and M-PESA.',
  },
  {
    id: '2',
    image: require('../../assets/images/backgrounds/landing/petrol-station.png') as number,
    headline: 'Manage Expenses Effortlessly',
    copy: 'Log stock, rent, salaries and supplier payments in one tap.',
  },
  {
    id: '3',
    image: require('../../assets/images/backgrounds/landing/hardware-shop.png') as number,
    headline: 'Get Credit-Ready',
    copy: 'Auto-generate P&L and cash-flow reports lenders actually want.',
  },
] as const;

type Slide = (typeof SLIDES)[number];

function SlideItem({ item }: { item: Slide }) {
  if (item.image) {
    return (
      <ImageBackground source={item.image} style={styles.slide} resizeMode="cover">
        <View style={styles.slideOverlay} />
      </ImageBackground>
    );
  }

  return (
    <View style={[styles.slide, styles.solidSlide]}>
      <View style={styles.slideOverlay} />
    </View>
  );
}

export default function WelcomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % SLIDES.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const current = SLIDES[currentIndex];

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SlideItem item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        scrollEventThrottle={16}
        scrollEnabled
      />

      {/* Overlay: wordmark, slide text, dots, CTA — sits on top of the slider */}
      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        <Text style={styles.brand}>Biashara Books</Text>

        <View style={styles.slideText}>
          <Text style={styles.headline}>{current.headline}</Text>
          <Text style={styles.copy}>{current.copy}</Text>
        </View>

        <View style={styles.cta}>
          <View style={styles.buttons}>
            <AppButton
              label="LOGIN"
              variant="primary"
              size="lg"
              fullWidth
              color="#35A839"
              onPress={() => router.replace('/login')}
            />
            <AppButton
              label="CREATE ACCOUNT"
              variant="ghost"
              size="lg"
              fullWidth
              color="transparent"
              textColor="#FFFFFF"
              style={styles.outlineButton}
              onPress={() => router.replace('/register')}
            />
          </View>

          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => (
              <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
            ))}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A3D1F',
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  solidSlide: {
    backgroundColor: '#35A839',
  },
  slideOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 50, 15, 0.55)',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  slideText: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 32,
    gap: 12,
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 39,
  },
  copy: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.80)',
    lineHeight: 24,
  },
  cta: {
    gap: 16,
  },
  buttons: {
    gap: 12,
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});
