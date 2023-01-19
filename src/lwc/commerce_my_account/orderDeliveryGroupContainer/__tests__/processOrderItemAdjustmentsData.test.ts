import {
    processOrderItemAdjustmentsData,
    transformAdjustmentFieldsForDisplay,
} from '../processOrderItemAdjustmentsData';
import {
    transformAdjustmentFieldsForDisplayInputData,
    adjustmentsAdapterResponse,
    transformedAdjustmentsAdapterData,
} from './data/adjustmentsData';

describe('processOrderItemAdjustmentsData/transformAdjustmentFieldsForDisplay', () => {
    const transformedAdjustments = processOrderItemAdjustmentsData(adjustmentsAdapterResponse, 'other');
    it('returns a map of tranformed adjustments adapter data', () => {
        expect(transformedAdjustments).toStrictEqual(transformedAdjustmentsAdapterData);
    });
});

describe('processOrderItemAdjustmentsData/processOrderItemAdjustmentsData', () => {
    const transformedAdjustment = transformAdjustmentFieldsForDisplay(
        transformAdjustmentFieldsForDisplayInputData,
        'other'
    );
    it('transforms the adjustments name when the type is `other`', () => {
        expect(transformedAdjustment[0].name).toBe('other');
    });
});
