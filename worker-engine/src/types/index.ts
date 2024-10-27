export interface responseType {
  type: string;
  data: any;
}

export interface messageToApi {
  clientId: string;
  responseData: any;
}

export interface WsMessage {
  eventId: string;
  data: any;
}

export interface DBmessage {
  type: string;
  data: any;
}
