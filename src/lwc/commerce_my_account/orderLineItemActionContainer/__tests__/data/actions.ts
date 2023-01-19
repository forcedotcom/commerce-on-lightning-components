import type { OrderAction } from 'commerce_my_account/orders';
import { startReorderAssistiveText } from '../../labels';

export const mockActions: OrderAction[] = [
    {
        name: 'Reorder',
        eventName: 'reorder',
        assistiveText: startReorderAssistiveText,
    },
];
