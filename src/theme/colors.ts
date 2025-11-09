const colors = {
    primary: '#C4B5FD',
    primary15: 'rgba(196, 181, 253, 0.15)',
    primary70: 'rgba(196, 181, 253, 0.7)',
    dark_primary: '#A78BFA',
    dark_primary15: 'rgba(167, 139, 250, 0.15)',
    dark_primary70: 'rgba(167, 139, 250, 0.7)',
    text: '#1D2839',
    text70: 'rgba(29, 40, 57, 0.7)',
    green: '#48D87D',
    green15: 'rgba(72, 216, 125, 0.15)',
    green70: 'rgba(72, 216, 125, 0.7)',
    yellow: '#F4C714',
    yellow15: 'rgba(244, 199, 20, 0.15)',
    yellow70: 'rgba(244, 199, 20, 0.7)',
    coral: '#E76565',
    coral15: 'rgba(231, 101, 101, 0.15)',
    coral70: 'rgba(231, 101, 101, 0.7)',
    background: '#EFF4F9',
    card_surface: '#FFFFFF',
    border_divider: '#DCE2EA',
};

// Додаємо алі��си для зручності
export default {
    ...colors,
    border: colors.border_divider,
    text: {
        primary: colors.text,
        secondary: colors.text70,
    },
    background: {
        primary: colors.background,
        secondary: colors.card_surface,
    },
} as typeof colors & {
    border: string;
    text: { primary: string; secondary: string } & string;
    background: { primary: string; secondary: string } & string;
};