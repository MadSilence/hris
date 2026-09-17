export type LoginRequest = {
    email: string;
    password: string;
    /** The company being signed in to — read from the host by the BFF, never taken from the browser's body. */
    subdomain: string;
};
