/**
 * Recursive makes an object partial.
 * @see Partial
 */
export type DeepPartial<TValue> = TValue extends object
    ? {
          [TKey in keyof TValue]?: DeepPartial<TValue[TKey]>;
      }
    : TValue;
