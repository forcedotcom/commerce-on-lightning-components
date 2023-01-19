import type { OrderAction } from 'commerce_my_account/orders';
import { startReorderAssistiveText } from 'commerce_my_account/orderLineItemActionContainer';

export const mockActions: OrderAction[] = [
    {
        name: 'Reorder',
        eventName: 'reorder',
        assistiveText: startReorderAssistiveText,
    },
];
