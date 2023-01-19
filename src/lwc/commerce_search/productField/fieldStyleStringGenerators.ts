import { SimpleStyleMap, StyleStringGenerator } from 'community_styling/inlineStyles';

// Build up the mapped and dynamically-generated styles.
const contentMappedStyles = new SimpleStyleMap({
    color: 'color',
    'align-self': 'align-self',
    'justify-self': 'justify-self',
});

// Return the style string generators.
export const content = new StyleStringGenerator([contentMappedStyles]);
