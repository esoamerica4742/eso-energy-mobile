import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AccessBrandHeader } from '@/screens/access/components/AccessBrandHeader';
import { AccessEntrance } from '@/screens/access/components/AccessEntrance';
import { AccessPlatformCard } from '@/screens/access/components/AccessPlatformCard';
import { AccessSignInFooter } from '@/screens/access/components/AccessSignInFooter';
import { COMMAND_CENTER_MODULES } from '@/screens/access/platformModules';
import { ACCESS_FONTS, ACCESS_LAYOUT, ACCESS_THEME } from '@/screens/access/theme';
import { useCommandCenterNavigation } from '@/screens/access/useCommandCenterNavigation';
import { headerTopExtra } from '@/lib/layout/safeArea';

const CARD_STAGGER_BASE_MS = 450;
const CARD_STAGGER_STEP_MS = 130;

function BackgroundAtmosphere() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['rgba(201,168,76,0.05)', 'rgba(201,168,76,0.015)', 'transparent']}
        locations={[0, 0.35, 0.72]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.bloomGradient}
      />
    </View>
  );
}

function EnterpriseLabel() {
  return (
    <AccessEntrance
      delay={100}
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={styles.eyebrowRow}
    >
      <Text style={styles.eyebrow}>ENTERPRISE PLATFORMS</Text>
      <View style={styles.eyebrowLine} />
    </AccessEntrance>
  );
}

function HeroBlock() {
  return (
    <View style={styles.heroBlock}>
      <AccessEntrance
        delay={200}
        from={{ opacity: 0, translateY: 18 }}
        animate={{ opacity: 1, translateY: 0 }}
      >
        <Text style={styles.headline}>
          Choose your <Text style={styles.headlineItalic}>command center.</Text>
        </Text>
      </AccessEntrance>

      <AccessEntrance
        delay={350}
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={styles.subWrap}
      >
        <Text style={styles.subtext}>
          Select the ESO module you want to access. Each dashboard runs independently with its
          own data and workflows.
        </Text>
      </AccessEntrance>
    </View>
  );
}

export default function AccessScreen() {
  const insets = useSafeAreaInsets();
  const { navigateToProduct, openSignIn } = useCommandCenterNavigation();

  const headerTopPad = headerTopExtra(ACCESS_LAYOUT.headerTopExtra);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.root}>
        <BackgroundAtmosphere />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={Platform.OS !== 'web'}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          bounces
        >
          <AccessBrandHeader topInset={headerTopPad} />
          <EnterpriseLabel />
          <HeroBlock />

          <View style={styles.cards}>
            {COMMAND_CENTER_MODULES.map((module, index) => (
              <AccessPlatformCard
                key={module.id}
                module={module}
                delay={CARD_STAGGER_BASE_MS + index * CARD_STAGGER_STEP_MS}
                onPress={() => void navigateToProduct(module.product)}
              />
            ))}
          </View>

          <AccessSignInFooter bottomInset={insets.bottom} onSignIn={openSignIn} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: ACCESS_THEME.bg,
  },
  root: {
    flex: 1,
    backgroundColor: ACCESS_THEME.bg,
    width: '100%',
    maxWidth: ACCESS_LAYOUT.maxContentWidth,
    alignSelf: 'center',
  },
  bloomGradient: {
    position: 'absolute',
    top: -80,
    left: '50%',
    marginLeft: -220,
    width: 440,
    height: 360,
    borderRadius: 220,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: ACCESS_LAYOUT.horizontalPad,
    paddingBottom: 8,
  },
  eyebrowRow: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eyebrow: {
    fontFamily: ACCESS_FONTS.uiMedium,
    fontSize: 10,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: ACCESS_THEME.goldDim,
  },
  eyebrowLine: {
    flex: 1,
    height: 1,
    backgroundColor: ACCESS_THEME.border,
  },
  heroBlock: {
    marginTop: 12,
  },
  headline: {
    fontFamily: ACCESS_FONTS.headline,
    fontSize: 50,
    lineHeight: 52.5,
    letterSpacing: -0.3,
    color: ACCESS_THEME.white,
  },
  headlineItalic: {
    fontFamily: ACCESS_FONTS.headlineItalic,
    fontSize: 50,
    lineHeight: 52.5,
    letterSpacing: -0.3,
    color: ACCESS_THEME.white,
  },
  subWrap: {
    marginTop: 10,
  },
  subtext: {
    fontFamily: ACCESS_FONTS.ui,
    fontSize: 14,
    lineHeight: 23.1,
    color: ACCESS_THEME.body,
  },
  cards: {
    marginTop: 18,
    gap: 10,
  },
});
