import React from 'react';
import { SvgProps } from 'react-native-svg';
import icons from '../utils/icons';
import colors from '../theme/colors';

// Тип для назв іконок
export type IconName = keyof typeof icons;

interface IconProps extends SvgProps {
  name: IconName;
  size?: number;
  color?: string;
}

/**
 * Універсальний компонент для відображення SVG іконок
 * 
 * @example
 * // Використання:
 * <Icon name="dropdownIcon" size={24} color={colors.primary} />
 */
export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  color = colors.text,
  ...props 
}) => {
  const IconComponent = icons[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  // Type check to ensure we have a valid component
  if (typeof IconComponent !== 'function') {
    console.error(`Icon "${name}" is not a valid component. Got type: ${typeof IconComponent}`, IconComponent);
    return null;
  }

  return <IconComponent width={size} height={size} fill={color} {...props} />;
};

export default Icon;
