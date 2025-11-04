import React from 'react';
import { SvgProps } from 'react-native-svg';
import DropdownIcon from '../assets/icons/dropdown-arrow.svg';
import HomeIcon from '../assets/icons/home.svg';
import FriendsIcon from '../assets/icons/friends.svg';
import GroupsIcon from '../assets/icons/groups.svg';
import SettingsIcon from '../assets/icons/settings.svg';
import OtherIcon from '../assets/icons/other.svg';



export const icons: Record<string, React.FC<SvgProps>> = {
    dropdownIcon: DropdownIcon as React.FC<SvgProps>,
    homeIcon: HomeIcon as React.FC<SvgProps>,
    friendsIcon: FriendsIcon as React.FC<SvgProps>,
    groupsIcon: GroupsIcon as React.FC<SvgProps>,
    settingsIcon: SettingsIcon as React.FC<SvgProps>,
    otherIcon: OtherIcon as React.FC<SvgProps>
};

export default icons;
