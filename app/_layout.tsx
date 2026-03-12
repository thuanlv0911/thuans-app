import { Stack } from 'expo-router';

import { CartProvider } from '@/context/CardContext';
import { WishlistProvider } from '@/context/WishlistContext';
import '@/global.css';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {

  return (

    <GestureHandlerRootView style={{ flex: 1 }}>
      <CartProvider>
        <WishlistProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </WishlistProvider>
      </CartProvider>
    </GestureHandlerRootView>
  );
}
