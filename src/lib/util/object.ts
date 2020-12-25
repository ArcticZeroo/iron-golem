export type ObjectKey = string | number | symbol;

export abstract class ObjectUtil {
    public static safeGet<K extends ObjectKey, V>(obj: Record<K, V>, key: K, defaultValue: V) {
        return obj[key] ?? defaultValue;
    }

    public static isKeyOf<T extends Record<ObjectKey, unknown>>(obj: T, key: ObjectKey): key is keyof T {
        return obj.hasOwnProperty(key);
    }
}