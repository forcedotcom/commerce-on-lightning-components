import { SimpleStyleMap, StyleStringGenerator } from 'community_styling/inlineStyles';

// Build up the mapped and dynamically-generated styles.
const mappedStyles = new SimpleStyleMap({
    color: 'header-color',
    'background-color': 'header-background-color',
});

// Return the style string generator.
export default new StyleStringGenerator([mappedStyles]);
