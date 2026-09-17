export type PublicEnvironmentConfig = {
  environment: {
    basePath: string;
  };
  auth: {
    issuerUri: string;
  };
  /** Where this app lives: the root (landing, step 1, trial) and every company at `<subdomain>.<rootDomain>`. */
  web: {
    scheme: string;
    rootDomain: string;
  };
};
