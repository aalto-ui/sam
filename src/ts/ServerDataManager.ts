// Raw data type, as returned by the server
// As it expects JSON data, this must be an alias to `string`
export type RawServerData = string;

// Server data is an object built from given JSON
export type ServerData = object;



export class ServerDataManager {
  // Raw data given by the server
  readonly rawData: RawServerData;

  // Parsed data
  // This is the data which should be provided to other components
  data: ServerData;

  constructor (rawData: RawServerData) {
    this.rawData = rawData;
    this.data = ServerDataManager.parseRawData(rawData);
  }

  static parseRawData (rawData: RawServerData): ServerData {
    // TODO

    return null;
  }
}
