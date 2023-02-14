/* tslint:disable */
/* eslint-disable */

/* auto-generated by NAPI-RS */

export const enum Level {
  Debug = 3,
  Error = 0,
  Info = 2,
  Trace = 4,
  Warn = 1
}
export const enum RequestType {
  /** Type of a server address request */
  ServerAddress = 1,
  /** Type of a get string request. */
  GetString = 2,
  /** Type of a set string request. */
  SetString = 3
}
export const enum ResponseType {
  /** Type of a response that returns a null. */
  Null = 0,
  /** Type of a response that returns a value which isn't an error. */
  Value = 1,
  /** Type of response containing an error that impacts a single request. */
  RequestError = 2,
  /** Type of response containing an error causes the connection to close. */
  ClosingError = 3
}
export const HEADER_LENGTH_IN_BYTES: number
export function StartLegacySocketConnection(): Promise<string>
export function log(logLevel: Level, logIdentifier: string, message: string): void
export function InitInternalLogger(level?: Level | undefined | null, fileName?: string | undefined | null): Level
export function valueFromPointer(pointerAsBigint: bigint): null | string | number | any[]
export function stringFromPointer(pointerAsBigint: bigint): string
/**
 * This function is for tests that require a value allocated on the heap.
 * Should NOT be used in production.
 */
export function createLeakedValue(message: string): bigint
/**
 * This function is for tests that require a string allocated on the heap.
 * Should NOT be used in production.
 */
export function createLeakedString(message: string): bigint
export class AsyncClient {
  static CreateConnection(connectionAddress: string): AsyncClient
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
}
