import {RootError} from "@/api/models/errors";

export enum AuthErrorMessage {
    DEFAULT = "An unexpected error occurred while validating JWT token.",
    MALFORMED = "The JWT token is malformed.",
    EXPIRED = "The JWT token has expired.",
    INVALID = "The JWT token signature is invalid."
}

export class UnauthorizedError extends RootError {
    public constructor(message: AuthErrorMessage, cause?: unknown) {
        super("UnauthorizedError", message, cause);
    }
}