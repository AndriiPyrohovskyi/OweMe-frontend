import { Platform } from 'react-native';

const typography = {
    h1: {
        fontFamily: Platform.select({
            ios: 'Poppins-Bold',
            android: 'Poppins-Bold',
            default: 'System'
        }),
        fontSize: 28,
        fontWeight: '700' as const,
        lineHeight: 36,
    },
    h2: {
        fontFamily: Platform.select({
            ios: 'Poppins-SemiBold',
            android: 'Poppins-SemiBold',
            default: 'System'
        }),
        fontSize: 22,
        fontWeight: '600' as const,
        lineHeight: 29,
    },
    h3: {
        fontFamily: Platform.select({
            ios: 'Nunito-Medium',
            android: 'Nunito-Medium',
            default: 'System'
        }),
        fontSize: 18,
        fontWeight: '500' as const,
        lineHeight: 23,
    },
    main: {
        fontFamily: Platform.select({
            ios: 'Nunito-Regular',
            android: 'Nunito-Regular',
            default: 'System'
        }),
        fontSize: 15,
        fontWeight: '400' as const,
        lineHeight: 20,
    },
    secondary: {
        fontFamily: Platform.select({
            ios: 'Inter-Regular',
            android: 'Inter-Regular',
            default: 'System'
        }),
        fontSize: 13,
        fontWeight: '400' as const,
        lineHeight: 17,
    },
    secondary2: {
        fontFamily: Platform.select({
            ios: 'Inter-Regular',
            android: 'Inter-Regular',
            default: 'System'
        }),
        fontSize: 10,
        fontWeight: '400' as const,
        lineHeight: 13,
    },
    numbers: {
        fontFamily: Platform.select({
            ios: 'Poppins-Bold',
            android: 'Poppins-Bold',
            default: 'System'
        }),
        fontSize: 18,
        fontWeight: '700' as const,
        lineHeight: 20,
    },
    CTA: {
        fontFamily: Platform.select({
            ios: 'Inter-SemiBold',
            android: 'Inter-SemiBold',
            default: 'System'
        }),
        fontSize: 16,
        fontWeight: '600' as const,
        lineHeight: 19,
    }
};

export default typography;