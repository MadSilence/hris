import {RootError} from "@/api/models/errors/RootError";

export class NotFoundError extends RootError {
    public constructor(message?: string) {
        super("NotFoundError", message);
    }
}
