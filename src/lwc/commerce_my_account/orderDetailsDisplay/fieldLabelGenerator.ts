import labels from './labels';

const { keyValueSeparatorWithSpace } = labels;

/**
 * @description Method to determine the field's label
 */
export default function getFieldLabel(fieldLabel: string | null | undefined): string {
    return fieldLabel ? fieldLabel.concat(keyValueSeparatorWithSpace) : '';
}
