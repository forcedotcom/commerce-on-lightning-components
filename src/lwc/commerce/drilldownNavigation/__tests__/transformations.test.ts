import { toMenuItems } from '../transformation';
import { uuidv4 } from 'experience/util';
import type { MenuItemApi } from '../../navigationMenu/types';
import type { MenuItem } from '../types';

const mockUuid4 = <jest.Mock>uuidv4;

jest.mock('experience/util', () => ({
    uuidv4: jest.fn(),
}));

jest.mock(
    '@salesforce/label/NavigationMenuItemDefaults.OpensInNewTab',
    () => {
        return { default: '{0}, opens in a new tab' };
    },
    { virtual: true }
);

describe('Menu Transformation', () => {
    const uuid = 'some-unique-id';

    beforeEach(() => {
        mockUuid4.mockReturnValue(uuid);
    });

    it('should return empty array for an empty data set', () => {
        for (const emptyData of [[], null, undefined, 0, 'invalid']) {
            expect(toMenuItems(<MenuItemApi[]>emptyData)).toEqual([]);
        }
    });

    it('should not add the subItem if empty array', () => {
        const data = {
            label: 'some-label',
            actionValue: '/path/to/category',
            actionType: 'link',
            target: '',
            imageUrl: '',
            subMenu: [],
        };
        const [parent] = toMenuItems([data]);
        expect(parent.subMenu).toBeUndefined();
    });

    it('should add a property with a uuid to the object that was passed', function () {
        const [result] = toMenuItems([{} as MenuItemApi]);
        expect(result.id).toEqual(uuid);
    });

    it('should copy all properties', () => {
        const data = {
            label: 'some-label',
            actionValue: '/path/to/category',
            actionType: 'link',
            target: 'CurrentWindow',
            imageUrl: '',
        };
        const [actual] = toMenuItems([data]);
        expect(actual.label).toEqual(data.label);
        expect(actual.href).toEqual(data.actionValue);
        expect(actual.type).toEqual(data.actionType);
        expect(actual.ariaLabel).toBeUndefined();
        expect(actual.target).toBe('_self');
    });

    it('should update target to _blank when target is NewWindow', () => {
        const data = {
            label: 'Salesforce Home Page',
            actionValue: 'https://wwww.salesforce.com',
            actionType: 'link',
            target: 'NewWindow',
            imageUrl: '',
            subMenu: [],
        };

        const [actual] = toMenuItems([data]);
        expect(actual.target).toBe('_blank');
    });

    it('should add the ariaLabel new tab text when target is NewWindow', () => {
        const data = {
            label: 'Salesforce Home Page',
            actionValue: 'https://www.salesforce.com',
            actionType: 'link',
            target: 'NewWindow',
            imageUrl: '',
        };
        const [actual] = toMenuItems([data]);
        expect(actual.ariaLabel).toEqual(data.label + ', opens in a new tab');
    });

    it('should make a copy of all nested subMenus and copy all child items and their children', () => {
        const apiItem = {
            subMenu: [
                {
                    label: 'some-label-1',
                    actionType: 'some-type',
                    target: 'CurrentWindow',
                    subMenu: [{ label: 'some-label-2', actionType: 'some-type' }],
                },
            ],
        } as MenuItemApi;
        const [parent] = toMenuItems([apiItem]);
        expect(parent).toEqual({
            href: undefined,
            id: 'some-unique-id',
            label: undefined,
            type: undefined,
            target: '_self',
            subMenu: [
                {
                    id: uuid,
                    label: 'some-label-1',
                    href: undefined,
                    type: 'some-type',
                    target: '_self',
                    subMenu: [
                        {
                            id: uuid,
                            label: 'some-label-2',
                            href: undefined,
                            type: 'some-type',
                            target: '_self',
                        },
                    ],
                },
            ],
        });
    });

    for (const d of [[], undefined, null, NaN, '', '123', 1, 0]) {
        it(`should ignore invalid submenus, such as ${d}`, () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const apiItem: any = {
                label: 'some-label-1',
                actionType: 'some-type',
                actionValue: 'some-value',
                target: 'CurrentWindow',
                imageUrl: '',
                subMenu: d,
            };

            const [parent] = toMenuItems([apiItem]);

            expect(parent).toEqual({
                href: 'some-value',
                id: 'some-unique-id',
                label: 'some-label-1',
                type: 'some-type',
                target: '_self',
            });
        });
    }

    const countLevels = (item: MenuItem, n = 0): number => {
        if (!item.subMenu) {
            return n + 1;
        }
        return countLevels(item.subMenu[0], n + 1);
    };

    it('should restrict the menu depth to 5 submenus', () => {
        const apiItem = [
            {
                subMenu: [
                    {
                        subMenu: [
                            {
                                subMenu: [
                                    {
                                        label: 'should-get-here',
                                        subMenu: [{ subMenu: [{ subMenu: [{ label: 'should-not-get-here' }] }] }],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ];

        expect(countLevels(toMenuItems(apiItem as MenuItemApi[])[0])).toBe(5);
    });
});
