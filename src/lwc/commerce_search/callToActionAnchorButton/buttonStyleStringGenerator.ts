import { DynamicStyleMap, SimpleStyleMap, StyleStringGenerator } from 'community_styling/inlineStyles';

// Build up the mapped and dynamically-generated styles.
const mappedButtonStyles = new SimpleStyleMap({
    'border-color': 'border-color',
    'border-radius': 'border-radius',
});
const dynamicButtonStyles = new DynamicStyleMap({
    'background-color': DynamicStyleMap.createStatefulStyleSelector(
        'background-color',
        'background-hover-color',
        'isHovering'
    ),
    color: DynamicStyleMap.createStatefulStyleSelector('text-color', 'text-hover-color', 'isHovering'),
});

// Return the style string generator for all the button-related styles.
export default new StyleStringGenerator([mappedButtonStyles, dynamicButtonStyles]);
