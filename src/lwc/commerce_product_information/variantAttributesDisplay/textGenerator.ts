import labels from './labels';

const { nameValueWithSeparator } = labels;

/*
 * returns a localized string describing the variant product attribute set. ( name:value )
 */
export default function generateText(name: string, value: string): string {
    return nameValueWithSeparator.replace('{name}', name).replace('{value}', value);
}
