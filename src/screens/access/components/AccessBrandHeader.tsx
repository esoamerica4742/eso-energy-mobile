import { StyleSheet, Text, View } from 'react-native';
import { ACCESS_FONTS, ACCESS_THEME } from '@/screens/access/theme';
import { AccessEntrance } from '@/screens/access/components/AccessEntrance';

type Props = {
  topInset: number;
};

export function AccessBrandHeader({ topInset }: Props) {
  return (
    <AccessEntrance
      delay={0}
      from={{ opacity: 0, translateY: -14 }}
      animate={{ opacity: 1, translateY: 0 }}
      style={[styles.brandRow, { paddingTop: topInset }]}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarLetter}>E</Text>
      </View>
      <Text style={styles.wordmark}>ESO ENERGY</Text>
    </AccessEntrance>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  avatarLetter: {
    fontFamily: ACCESS_FONTS.display,
    fontSize: 18,
    color: ACCESS_THEME.bg,
    marginTop: -1,
  },
  wordmark: {
    marginLeft: 12,
    fontFamily: ACCESS_FONTS.uiBold,
    fontSize: 13,
    color: ACCESS_THEME.text,
    letterSpacing: 2.6,
  },
});
