import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

export async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
      return globalThis.localStorage.getItem(key);
    }
    return null;
  }

  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
      return globalThis.localStorage.getItem(key);
    }
    return null;
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
      globalThis.localStorage.setItem(key, value);
    }
    return;
  }

  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
      globalThis.localStorage.setItem(key, value);
    }
  }
}

export async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
      globalThis.localStorage.removeItem(key);
    }
    return;
  }

  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
      globalThis.localStorage.removeItem(key);
    }
  }
}
