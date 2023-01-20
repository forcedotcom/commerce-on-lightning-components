import { SimpleStyleMap, StyleStringGenerator } from 'community_styling/inlineStyles';

// Build up the mapped and dynamically-generated styles.
const containerMappedStyles = new SimpleStyleMap({
    'background-color': 'container-background-color',
    'border-color': 'container-border-color',
    'border-radius': 'container-border-radius',
});
const contentMappedStyles = new SimpleStyleMap({
    'align-self': 'content-align-self',
    'justify-self': 'content-justify-self',
});
const imageMappedStyles = new SimpleStyleMap({
});

// Return the style string generators.
export const container = new StyleStringGenerator([containerMappedStyles]);
export const content = new StyleStringGenerator([contentMappedStyles]);
export const image = new StyleStringGenerator([contentMappedStyles, imageMappedStyles]); // Composed of content and image styles
