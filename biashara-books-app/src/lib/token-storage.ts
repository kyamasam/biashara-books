import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export async function getStoredToken(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return canUseLocalStorage() ? window.localStorage.getItem(key) : null;
  }

  return SecureStore.getItemAsync(key);
}

export async function setStoredToken(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (canUseLocalStorage()) {
      window.localStorage.setItem(key, value);
    }
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

export async function deleteStoredToken(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (canUseLocalStorage()) {
      window.localStorage.removeItem(key);
    }
    return;
  }

  await SecureStore.deleteItemAsync(key);
}
