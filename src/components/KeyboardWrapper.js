import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';

/**
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {object} [props.style]
 * @param {boolean} [props.dismissKeyboardOnTap] When false, taps (e.g. OTP boxes) won't dismiss the keyboard.
 */
export function KeyboardWrapper({ children, style, dismissKeyboardOnTap = true }) {
  const scroll = (
    <ScrollView
      keyboardShouldPersistTaps={dismissKeyboardOnTap ? 'handled' : 'always'}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {children}
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 20}
    >
      {dismissKeyboardOnTap ? (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          {scroll}
        </TouchableWithoutFeedback>
      ) : (
        scroll
      )}
    </KeyboardAvoidingView>
  );
}
