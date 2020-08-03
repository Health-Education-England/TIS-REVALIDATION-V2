import { IGetRecordsResponse } from "../records/records.interfaces";

export interface IGetConnectionsResponse extends IGetRecordsResponse {
  connectionsInfo: IConnection[];
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
}

export enum ConnectionsFilterType {
  ADD_CONNECTION = "Add Connection",
  REMOVE_CONNECTION = "Remove Connection",
  EXCEPTIONS_QUEUE = "Exceptions Queue",
  ALL = "All",
  HIDDEN = "Hidden"
}
