import { IEnvironment } from "./environment.interface";

export const APP_URLS_CONFIG: IEnvironment["appUrls"] = {
  addConcern: "api/concerns",
  allocateAdmin: `api/v1/doctors/assign-admin`,
  authRedirect: ``,
  deleteFile: `api/storage/delete`,
  downloadFile: `api/storage/download`,
  getConcern: `/api/concerns`,
  getConcerns: `api/concerns`,
  getConnections: `api/connection`,
  getDetails: `api/trainee`,
  getNotes: `mocky/5ea2da614f00006c00d9f540`, // TODO replace with appropriate api url once is available
  getRecommendation: `api/recommendation`,
  getRecommendations: `api/v1/doctors`,
  listAdmins: `api/admins`,
  listFiles: `api/storage/list`,
  login: ``,
  saveRecommendation: `api/recommendation`,
  submitToGMC: `api/recommendation`,
  upload: `api/storage/upload`
};

export const AWS_CONFIG: IEnvironment["awsConfig"] = {
  authenticationFlowType: "USER_PASSWORD_AUTH",
  bucketName: "",
  domain: "stage-auth.tis.nhs.uk",
  mandatorySignIn: null,
  redirectSignIn: "",
  redirectSignOut: "",
  region: "eu-west-2",
  responseType: "token",
  scope: ["openid", "aws.cognito.signin.user.admin"],
  userPoolId: "eu-west-2_RbRAiJbHM",
  userPoolWebClientId: "12ciiltk1e53081oh57lm9591q"
};

export const LONDON_DBCS: string[] = [
  "1-AIIDWA",
  "1-AIIDVS",
  "1-AIIDWI",
  "1-AIIDR8",
  "LDN-MOCK-DBC"
];
