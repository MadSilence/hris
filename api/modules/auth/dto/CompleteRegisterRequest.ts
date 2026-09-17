export type CompleteRegisterRequest = {
  token: string;
  password: string;
}

/** The new owner's id, and the address their company signs in at. */
export type CompleteRegisterResponse = {
  id: string;
  subdomain: string;
}
