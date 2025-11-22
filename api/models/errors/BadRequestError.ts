import {RootError} from "@/api/models/errors/RootError";

export class BadRequestError extends RootError {
    public constructor(message?: string) {
        super("BadRequestError", message);
    }
}
