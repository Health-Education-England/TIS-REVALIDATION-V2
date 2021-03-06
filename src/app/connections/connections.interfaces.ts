import { IGetRecordsResponse } from "../records/records.interfaces";

export interface IGetConnectionsResponse extends IGetRecordsResponse {
  connections: IConnection[];
}

export interface IConnection {
  checked?: boolean;
  connectionStatus: string;
  designatedBody: string;
  doctorFirstName: string;
  doctorLastName: string;
  gmcReferenceNumber: string;
  programmeMembershipEndDate: string;
  programmeMembershipStartDate: string;
  programmeMembershipType: string;
  programmeName: string;
  programmeOwner: string;
  submissionDate: string;
  tcsDesignatedBody: string;
}

export enum ConnectionsFilterType {
  DISCONNECTED = "disconnected",
  CONNECTED = "connected",
  EXCEPTIONS_QUEUE = "exceptionsQueue",
  ALL = "all",
  HIDDEN = "hidden"
}
