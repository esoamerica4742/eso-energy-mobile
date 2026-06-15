import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'esopay_betting_legal_ack_v2026_06';

export async function hasBettingLegalAck(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEY)) === '1';
}

export async function setBettingLegalAck(): Promise<void> {
  await AsyncStorage.setItem(KEY, '1');
}
