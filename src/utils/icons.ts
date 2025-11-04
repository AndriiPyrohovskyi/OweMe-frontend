import React from 'react';
import { SvgProps } from 'react-native-svg';
import DropdownIcon from '../assets/icons/dropdown-arrow.svg';

export const icons: Record<string, React.FC<SvgProps>> = {
    dropdownIcon: DropdownIcon as React.FC<SvgProps>,
};

export default icons;
