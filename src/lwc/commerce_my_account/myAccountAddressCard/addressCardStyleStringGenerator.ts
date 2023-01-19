// @ts-ignore
import { SimpleStyleMap, StyleStringGenerator } from 'community_styling/inlineStyles';

const defaultBadgeStyles = new SimpleStyleMap({
    'background-color': 'default-badge-bg-color',
    'border-radius': 'default-badge-border-radius',
});

// Export the generators.
export default {
    defaultBadgeStyle: new StyleStringGenerator([defaultBadgeStyles]),
};
