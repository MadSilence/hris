import {RootError} from "@/api/models/errors";

export enum PrivilegeErrorMessage {
    DEFAULT = "An unexpected error occured while validating user permissions.",
    DENIED = "Permission denied. Access to this endpoint is restricted.",
    NO_CONFIG = "Permissions for this endpoint are not configured",
}

export class PrivilegeError extends RootError {
    public constructor(message: PrivilegeErrorMessage, cause?: unknown) {
        super("PrivilegeError", message, cause);
    }
}