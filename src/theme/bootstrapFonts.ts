import { Text, TextInput } from 'react-native';
import { inter } from '@/theme/fonts';

/** Apply Inter as the default RN text face (call once after fonts load). */
export function applyGlobalInterFontDefaults() {
  const base = { fontFamily: inter.regular };

  Text.defaultProps = Text.defaultProps ?? {};
  Text.defaultProps.style = [base, Text.defaultProps.style];

  TextInput.defaultProps = TextInput.defaultProps ?? {};
  TextInput.defaultProps.style = [base, TextInput.defaultProps.style];
}
