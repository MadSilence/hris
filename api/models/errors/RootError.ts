export class RootError extends Error {
    public constructor(name: string, message?: string, cause?: unknown) {
        const causeValue = cause instanceof Error ? { cause } : undefined;
        super(message, causeValue);
        this.name = name;
    }

}