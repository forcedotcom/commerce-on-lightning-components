import { SimpleStyleMap, StyleStringGenerator } from 'community_styling/inlineStyles';

// Build up the mapped and dynamically-generated styles.
const negotiatedMappedStyles = new SimpleStyleMap({
    color: 'negotiated-color',
});

const originalMappedStyles = new SimpleStyleMap({
    color: 'original-color',
});

// Return the style string generators.
export const negotiated = new StyleStringGenerator([negotiatedMappedStyles]);
export const original = new StyleStringGenerator([originalMappedStyles]);
