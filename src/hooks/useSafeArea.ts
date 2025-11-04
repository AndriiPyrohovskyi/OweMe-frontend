import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Custom hook для роботи з Safe Area
 * Повертає відступи для верхньої та нижньої частини екрану,
 * які автоматично підлаштовуються під вирізи (notch) та системні кнопки
 */
export const useSafeArea = () => {
  const insets = useSafeAreaInsets();

  return {
    top: insets.top,
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
    // Корисні готові стилі
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };
};
