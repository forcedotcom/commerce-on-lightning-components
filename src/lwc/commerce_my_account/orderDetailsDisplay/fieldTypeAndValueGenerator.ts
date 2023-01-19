import type { OrderData } from 'commerce/orderApi';
import fieldValueProcessor from './fieldValueProcessor';
import type { InputField } from 'commerce_my_account/orderDetails';

/**
 * @description Method to fetch the type and value of the field passed.
 */
export default function getFieldTypeAndValue(
    detailsData: OrderData | undefined,
    inputField: InputField
): [null | object | string, string] {
    if (inputField.entity === 'OrderSummary') {
        const fieldObj = detailsData?.fields[inputField.name];
        if (fieldObj && fieldObj.type && fieldObj.text) {
            const type = fieldObj.type === 'location' ? 'geolocation' : fieldObj.type;
            return [fieldValueProcessor(fieldObj, type), type];
        }
    }
    return ['', ''];
}
