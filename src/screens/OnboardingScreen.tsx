import { useCallback, useRef, useState } from 'react';

import { StatusBar, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { router } from 'expo-router';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import Animated, {

  useAnimatedScrollHandler,

  useDerivedValue,

  useSharedValue,

} from 'react-native-reanimated';

import * as Haptics from 'expo-haptics';

import { setOnboardingComplete } from '@/lib/onboardingStorage';

import { ACCESS_ROUTE } from '@/lib/navigation/productRoutes';

import { headerTopExtra } from '@/lib/layout/safeArea';

import { OnboardingBackground } from '@/screens/onboarding/components/OnboardingBackground';

import { OnboardingBottomNav } from '@/screens/onboarding/components/OnboardingBottomNav';

import { OnboardingSlideHeader } from '@/screens/onboarding/components/OnboardingSlideHeader';

import { OnboardingSlidePage } from '@/screens/onboarding/components/OnboardingSlidePage';

import { ONBOARDING_SLIDES } from '@/screens/onboarding/slides';

import { ONBOARDING_COLORS as C, SCREEN_WIDTH as W } from '@/screens/onboarding/theme';



export default function OnboardingScreen() {

  const insets = useSafeAreaInsets();

  const scrollRef = useRef<Animated.ScrollView>(null);

  const scrollX = useSharedValue(0);

  const [index, setIndex] = useState(0);



  const progress = useDerivedValue(() => scrollX.value / W);



  const onScroll = useAnimatedScrollHandler({

    onScroll: (e) => {

      scrollX.value = e.contentOffset.x;

    },

  });



  const syncIndex = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {

    const nextIndex = Math.round(e.nativeEvent.contentOffset.x / W);

    setIndex(nextIndex);

  }, []);



  const finish = useCallback(async () => {

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    await setOnboardingComplete();

    router.replace(ACCESS_ROUTE);

  }, []);



  const skip = useCallback(() => {

    void finish();

  }, [finish]);



  const next = useCallback(() => {

    void Haptics.selectionAsync();

    if (index >= ONBOARDING_SLIDES.length - 1) {

      void finish();

      return;

    }

    scrollRef.current?.scrollTo({ x: (index + 1) * W, y: 0, animated: true });

  }, [finish, index]);



  return (

    <View className="flex-1 overflow-hidden" style={{ backgroundColor: C.navy3 }}>

      <StatusBar barStyle="light-content" />

      <OnboardingBackground progress={progress} />



      <SafeAreaView className="flex-1" style={{ zIndex: 1 }} edges={['top', 'left', 'right']}>

        <View className="px-5" style={{ paddingTop: headerTopExtra() }}>

          <OnboardingSlideHeader index={index} />

        </View>



        <Animated.ScrollView

          ref={scrollRef}

          horizontal

          pagingEnabled

          showsHorizontalScrollIndicator={false}

          onScroll={onScroll}

          onMomentumScrollEnd={syncIndex}

          scrollEventThrottle={16}

          className="flex-1"

          decelerationRate="fast"

        >

          {ONBOARDING_SLIDES.map((slide, slideIndex) => (

            <OnboardingSlidePage

              key={slide.id}

              slide={slide}

              index={slideIndex}

              scrollX={scrollX}

            />

          ))}

        </Animated.ScrollView>



        <OnboardingBottomNav

          index={index}

          bottomInset={insets.bottom}

          onSkip={skip}

          onNext={next}

        />

      </SafeAreaView>

    </View>

  );

}


