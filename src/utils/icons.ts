import React from 'react';
import { SvgProps } from 'react-native-svg';
import Svg, { Path, Circle, G } from 'react-native-svg';
import DropdownIcon from '../assets/icons/dropdown-arrow.svg';
import HomeIcon from '../assets/icons/home.svg';
import FriendsIcon from '../assets/icons/friends.svg';
import GroupsIcon from '../assets/icons/groups.svg';
import SettingsIcon from '../assets/icons/settings.svg';
import OtherIcon from '../assets/icons/other.svg';

// // Додаткові іконки як SVG компоненти
// const ArrowLeftIcon: React.FC<SvgProps> = (props) => (
//   <Svg width={props.width || 24} height={props.height || 24} viewBox="0 0 24 24" fill="none" {...props}>
//     <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//   </Svg>
// );

// const CameraIcon: React.FC<SvgProps> = (props) => (
//   <Svg width={props.width || 24} height={props.height || 24} viewBox="0 0 24 24" fill="none" {...props}>
//     <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//     <Circle cx="12" cy="13" r="4" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//   </Svg>
// );

// const EditIcon: React.FC<SvgProps> = (props) => (
//   <Svg width={props.width || 24} height={props.height || 24} viewBox="0 0 24 24" fill="none" {...props}>
//     <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//     <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//   </Svg>
// );

// const ShareIcon: React.FC<SvgProps> = (props) => (
//   <Svg width={props.width || 24} height={props.height || 24} viewBox="0 0 24 24" fill="none" {...props}>
//     <Circle cx="18" cy="5" r="3" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//     <Circle cx="6" cy="12" r="3" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//     <Circle cx="18" cy="19" r="3" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//     <Path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//   </Svg>
// );

// const ArrowUpIcon: React.FC<SvgProps> = (props) => (
//   <Svg width={props.width || 24} height={props.height || 24} viewBox="0 0 24 24" fill="none" {...props}>
//     <Path d="M12 19V5M5 12l7-7 7 7" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//   </Svg>
// );

// const ArrowDownIcon: React.FC<SvgProps> = (props) => (
//   <Svg width={props.width || 24} height={props.height || 24} viewBox="0 0 24 24" fill="none" {...props}>
//     <Path d="M12 5v14M19 12l-7 7-7-7" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//   </Svg>
// );

// const CheckCircleIcon: React.FC<SvgProps> = (props) => (
//   <Svg width={props.width || 24} height={props.height || 24} viewBox="0 0 24 24" fill="none" {...props}>
//     <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//     <Path d="M22 4L12 14.01l-3-3" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//   </Svg>
// );

// const SearchIcon: React.FC<SvgProps> = (props) => (
//   <Svg width={props.width || 24} height={props.height || 24} viewBox="0 0 24 24" fill="none" {...props}>
//     <Circle cx="11" cy="11" r="8" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//     <Path d="m21 21-4.35-4.35" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//   </Svg>
// );

// const AddUserIcon: React.FC<SvgProps> = (props) => (
//   <Svg width={props.width || 24} height={props.height || 24} viewBox="0 0 24 24" fill="none" {...props}>
//     <Path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//     <Circle cx="8.5" cy="7" r="4" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//     <Path d="M20 8v6M23 11h-6" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//   </Svg>
// );

// const WarningIcon: React.FC<SvgProps> = (props) => (
//   <Svg width={props.width || 24} height={props.height || 24} viewBox="0 0 24 24" fill="none" {...props}>
//     <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//     <Path d="M12 9v4M12 17h.01" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//   </Svg>
// );

// const HeartIcon: React.FC<SvgProps> = (props) => (
//   <Svg width={props.width || 24} height={props.height || 24} viewBox="0 0 24 24" fill="none" {...props}>
//     <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//   </Svg>
// );

// const DiamondIcon: React.FC<SvgProps> = (props) => (
//   <Svg width={props.width || 24} height={props.height || 24} viewBox="0 0 24 24" fill="none" {...props}>
//     <Path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//   </Svg>
// );

// const MessageIcon: React.FC<SvgProps> = (props) => (
//   <Svg width={props.width || 24} height={props.height || 24} viewBox="0 0 24 24" fill="none" {...props}>
//     <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//   </Svg>
// );

// const MenuIcon: React.FC<SvgProps> = (props) => (
//   <Svg width={props.width || 24} height={props.height || 24} viewBox="0 0 24 24" fill="none" {...props}>
//     <Circle cx="12" cy="12" r="1" fill={props.color || "currentColor"}/>
//     <Circle cx="12" cy="5" r="1" fill={props.color || "currentColor"}/>
//     <Circle cx="12" cy="19" r="1" fill={props.color || "currentColor"}/>
//   </Svg>
// );

// const PlusIcon: React.FC<SvgProps> = (props) => (
//   <Svg width={props.width || 24} height={props.height || 24} viewBox="0 0 24 24" fill="none" {...props}>
//     <Path d="M12 5v14M5 12h14" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//   </Svg>
// );

export const icons: Record<string, React.FC<SvgProps>> = {
    dropdownIcon: DropdownIcon as React.FC<SvgProps>,
    homeIcon: HomeIcon as React.FC<SvgProps>,
    friendsIcon: FriendsIcon as React.FC<SvgProps>,
    groupsIcon: GroupsIcon as React.FC<SvgProps>,
    settingsIcon: SettingsIcon as React.FC<SvgProps>,
    otherIcon: OtherIcon as React.FC<SvgProps>,
    arrowLeft: HomeIcon,
    camera: HomeIcon as React.FC<SvgProps>,
    edit: HomeIcon as React.FC<SvgProps>,
    share: HomeIcon as React.FC<SvgProps>,
    arrowUp: HomeIcon as React.FC<SvgProps>,
    arrowDown: HomeIcon as React.FC<SvgProps>,
    checkCircle: HomeIcon as React.FC<SvgProps>,
    search: HomeIcon as React.FC<SvgProps>,
    addUser: HomeIcon as React.FC<SvgProps>,
    warning: HomeIcon as React.FC<SvgProps>,
    heart: HomeIcon as React.FC<SvgProps>,
    diamond: HomeIcon as React.FC<SvgProps>,
    message: HomeIcon as React.FC<SvgProps>,
    menu: HomeIcon as React.FC<SvgProps>,
    plus: HomeIcon as React.FC<SvgProps>,
};

export default icons;
