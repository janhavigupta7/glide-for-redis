import { BabushkaInternal } from "../";
import * as net from "net";
var protobuf = require("protobufjs/minimal");
import { babushkaproto } from "./compiled.js";
const {
    StartSocketConnection,
    HEADER_LENGTH_IN_BYTES,
    ResponseType,
    RequestType,
} = BabushkaInternal;

type RequestType = BabushkaInternal.RequestType;
type ResponseType = BabushkaInternal.ResponseType;
type PromiseFunction = (value?: any) => void;

type WriteRequest = {
    callbackIdx: number;
    requestType: number;
    arg: string[];
};

export class SocketConnection {
    private socket: net.Socket;
    private readonly promiseCallbackFunctions: [
        PromiseFunction,
        PromiseFunction
    ][] = [];
    private readonly availableCallbackSlots: number[] = [];
    private readonly encoder = new TextEncoder();
    private backingReadBuffer = new ArrayBuffer(1024);
    private backingWriteBuffer = new ArrayBuffer(1024);
    private bufferedWriteRequests: Uint8Array[] = [];
    private writeInProgress = false;
    private remainingReadData: Uint8Array | undefined;

    private handleReadData(data: Buffer) {
        const dataArray = this.remainingReadData
            ? this.concatBuffers(this.remainingReadData, data)
            : new Uint8Array(data.buffer, data.byteOffset, data.length);

        let counter = 0;
        while (counter <= dataArray.byteLength - HEADER_LENGTH_IN_BYTES) {
            const header = new DataView(dataArray.buffer, counter, HEADER_LENGTH_IN_BYTES);
            const length = header.getUint32(0, true);
            if (length === 0) {
                throw new Error("length 0");
            }
            if (counter + length + HEADER_LENGTH_IN_BYTES > dataArray.byteLength) {
                this.remainingReadData = new Uint8Array(
                    dataArray.buffer,
                    counter,
                    dataArray.byteLength - counter
                );
                break;
            }
            const msgBytes = Buffer.from(
                dataArray.buffer,
                counter + HEADER_LENGTH_IN_BYTES,
                length
            );
            var message = babushkaproto.CommandReply.decode(msgBytes);
            const [resolve, reject] =
                this.promiseCallbackFunctions[message.callbackIdx];
            this.availableCallbackSlots.push(message.callbackIdx);
            if (message.error !== null) {
                reject(message.error);
            } else {
                resolve(message.response);
            }
            counter = counter + length + HEADER_LENGTH_IN_BYTES;
        }

        if (counter == dataArray.byteLength) {
            this.remainingReadData = undefined;
        } else {
            this.remainingReadData = new Uint8Array(
                dataArray.buffer,
                counter,
                dataArray.byteLength - counter
            );
        }
    }

    private constructor(socket: net.Socket) {
        this.socket = socket;
        this.socket
            .on("data", (data) => this.handleReadData(data))
            .on("error", (err) => {
                console.error(`Server closed: ${err}`);
                this.dispose();
            });
    }

    private concatBuffers(priorBuffer: Uint8Array, data: Buffer): Uint8Array {
        const requiredLength = priorBuffer.length + data.byteLength;

        if (this.backingReadBuffer.byteLength < requiredLength) {
            this.backingReadBuffer = new ArrayBuffer(requiredLength);
        }
        const array = new Uint8Array(this.backingReadBuffer, 0, requiredLength);
        array.set(priorBuffer);
        array.set(data, priorBuffer.byteLength);
        return array;
    }

    private getCallbackIndex(): number {
        return (
            this.availableCallbackSlots.pop() ??
            this.promiseCallbackFunctions.length + 1 // TODO: check if 0 index really had issues
        );
    }

    private writeHeaderToWriteBuffer(
        length: number,
        callbackIndex: number,
        operationType: RequestType,
        headerLength: number,
        argLengths: number[],
        offset: number
    ) {
        const headerView = new DataView(
            this.backingWriteBuffer,
            offset,
            headerLength
        );
        headerView.setUint32(0, length, true);
        headerView.setUint32(4, callbackIndex, true);
        headerView.setUint32(8, operationType, true);

        for (let i = 0; i < argLengths.length - 1; i++) {
            const argLength = argLengths[i];
            headerView.setUint32(
                HEADER_LENGTH_IN_BYTES + 4 * i,
                argLength,
                true
            );
        }
    }

    private getHeaderLength(writeRequest: WriteRequest) {
        return HEADER_LENGTH_IN_BYTES + 4 * (writeRequest.arg.length - 1);
    }

    private lengthOfStrings(request: WriteRequest) {
        return request.arg.reduce((sum, arg) => sum + arg.length, 0);
    }

    private encodeStringToWriteBuffer(str: string, byteOffset: number): number {
        const encodeResult = this.encoder.encodeInto(
            str,
            new Uint8Array(this.backingWriteBuffer, byteOffset)
        );
        return encodeResult.written ?? 0;
    }

    private getRequiredBufferLength(writeRequests: Uint8Array[]): number {
        return writeRequests.reduce((sum, request) => {
            return ( sum + request.byteLength + HEADER_LENGTH_IN_BYTES
            );
        }, 0);
    }

    private writeBufferedRequestsToSocket() {
        this.writeInProgress = true;
        const writeRequests = this.bufferedWriteRequests.splice(
            0,
            this.bufferedWriteRequests.length
        );
        const requiredBufferLength =
            this.getRequiredBufferLength(writeRequests);

        if (
            !this.backingWriteBuffer ||
            this.backingWriteBuffer.byteLength < requiredBufferLength
        ) {
            this.backingWriteBuffer = new ArrayBuffer(requiredBufferLength);
        }
        let cursor = 0;
        for (const request of writeRequests) {
            const headerView = new DataView(
                this.backingWriteBuffer,
                cursor,
                HEADER_LENGTH_IN_BYTES
            );
            headerView.setUint32(0, request.byteLength, true);
            let payloadView = new Uint8Array(this.backingWriteBuffer, cursor + HEADER_LENGTH_IN_BYTES, request.byteLength);
            payloadView.set(request);
            cursor += request.byteLength + HEADER_LENGTH_IN_BYTES;
        }

        const uint8Array = new Uint8Array(this.backingWriteBuffer, 0, cursor);
        this.socket.write(uint8Array, undefined, () => {
            if (this.bufferedWriteRequests.length > 0) {
                this.writeBufferedRequestsToSocket();
            } else {
                this.writeInProgress = false;
            }
        });
    }

    private writeOrBufferRequest(callbackIdx: number, requestType: number, args: string[]) {
        var message = babushkaproto.Request.create({
            callbackIdx: callbackIdx,
            requestType: requestType,
            arg: args

        });
        var request = babushkaproto.Request.encode(message).finish();
        this.bufferedWriteRequests.push(request);
        if (this.writeInProgress) {
            return;
        }
        this.writeBufferedRequestsToSocket();
    }

    public get(key: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const callbackIndex = this.getCallbackIndex();
            this.promiseCallbackFunctions[callbackIndex] = [resolve, reject];
            this.writeOrBufferRequest(callbackIndex, RequestType.GetString, [key]);
        });
    }

    public set(key: string, value: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const callbackIndex = this.getCallbackIndex();
            this.promiseCallbackFunctions[callbackIndex] = [resolve, reject];
            this.writeOrBufferRequest(callbackIndex, RequestType.SetString, [key, value]);
        });
    }

    private setServerAddress(address: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const callbackIndex = this.getCallbackIndex();
            this.promiseCallbackFunctions[callbackIndex] = [resolve, reject];
            this.writeOrBufferRequest(callbackIndex, RequestType.ServerAddress, [address]);
        });
    }

    public dispose(errorMessage?: string): void {
        this.promiseCallbackFunctions.forEach(([_resolve, reject], _index) => {
            reject(errorMessage);
        });
        this.socket.end();
    }

    static async __CreateConnection(
        address: string,
        connectedSocket: net.Socket
    ): Promise<SocketConnection> {
        const connection = new SocketConnection(connectedSocket);
        await connection.setServerAddress(address);
        return connection;
    }

    private static GetSocket(path: string): Promise<net.Socket> {
        return new Promise((resolve, reject) => {
            const socket = new net.Socket();
            socket
                .connect(path)
                .once("connect", () => resolve(socket))
                .once("error", reject);
        });
    }

    public static async CreateConnection(
        address: string
    ): Promise<SocketConnection> {
        const path = await StartSocketConnection();
        const socket = await this.GetSocket(path);
        return await this.__CreateConnection(address, socket);
    }
}
