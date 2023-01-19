export async function importComponent(componentName: string): Promise<string> {
    let constructor = await import(componentName);
    while (constructor && constructor.default) {
        // the 'await import' returns object.default in local and object.default.default in production
        constructor = constructor.default;
    }
    return constructor;
}
