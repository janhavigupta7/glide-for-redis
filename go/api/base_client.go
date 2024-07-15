// Copyright GLIDE-for-Redis Project Contributors - SPDX Identifier: Apache-2.0

package api

// #cgo LDFLAGS: -L../target/release -lglide_rs
// #include "../lib.h"
//
// void successCallback(void *channelPtr, struct CommandResponse *message);
// void failureCallback(void *channelPtr, char *errMessage, RequestErrorType errType);
import "C"

import (
	"strconv"
	"unsafe"

	"github.com/aws/glide-for-redis/go/glide/protobuf"
	"google.golang.org/protobuf/proto"
)

// BaseClient defines an interface for methods common to both [RedisClient] and [RedisClusterClient].
type BaseClient interface {
	StringCommands
	GenericBaseCommands
	ListBaseCommands

	// Close terminates the client by closing all associated resources.
	Close()
}

const OK = "OK"

type payload struct {
	value *C.struct_CommandResponse
	error error
}

//export successCallback
func successCallback(channelPtr unsafe.Pointer, cResponse *C.struct_CommandResponse) {
	// TODO: call lib.rs function to free response
	response := cResponse
	resultChannel := *(*chan payload)(channelPtr)
	resultChannel <- payload{value: response, error: nil}
}

//export failureCallback
func failureCallback(channelPtr unsafe.Pointer, cErrorMessage *C.char, cErrorType C.RequestErrorType) {
	// TODO: call lib.rs function to free response
	resultChannel := *(*chan payload)(channelPtr)
	resultChannel <- payload{value: nil, error: goError(cErrorType, cErrorMessage)}
}

type clientConfiguration interface {
	toProtobuf() *protobuf.ConnectionRequest
}

type baseClient struct {
	coreClient unsafe.Pointer
}

func createClient(config clientConfiguration) (*baseClient, error) {
	request := config.toProtobuf()
	msg, err := proto.Marshal(request)
	if err != nil {
		return nil, err
	}

	byteCount := len(msg)
	requestBytes := C.CBytes(msg)
	cResponse := (*C.struct_ConnectionResponse)(
		C.create_client(
			(*C.uchar)(requestBytes),
			C.uintptr_t(byteCount),
			(C.SuccessCallback)(unsafe.Pointer(C.successCallback)),
			(C.FailureCallback)(unsafe.Pointer(C.failureCallback)),
		),
	)
	defer C.free_connection_response(cResponse)

	cErr := cResponse.connection_error_message
	if cErr != nil {
		message := C.GoString(cErr)
		return nil, &ConnectionError{message}
	}

	return &baseClient{cResponse.conn_ptr}, nil
}

// Close terminates the client by closing all associated resources.
func (client *baseClient) Close() {
	if client.coreClient == nil {
		return
	}

	C.close_client(client.coreClient)
	client.coreClient = nil
}

func (client *baseClient) executeCommand(requestType C.RequestType, args []string) (*C.struct_CommandResponse, error) {
	if client.coreClient == nil {
		return nil, &ClosingError{"The client is closed."}
	}

	cArgs := toCStrings(args)
	defer freeCStrings(cArgs)

	resultChannel := make(chan payload)
	resultChannelPtr := uintptr(unsafe.Pointer(&resultChannel))

	C.command(client.coreClient, C.uintptr_t(resultChannelPtr), uint32(requestType), C.uintptr_t(len(args)), &cArgs[0])
	payload := <-resultChannel
	if payload.error != nil {
		return nil, payload.error
	}
	return payload.value, nil
}

func toCStrings(args []string) []*C.char {
	cArgs := make([]*C.char, len(args))
	for i, arg := range args {
		cString := C.CString(arg)
		cArgs[i] = cString
	}
	return cArgs
}

func freeCStrings(cArgs []*C.char) {
	for _, arg := range cArgs {
		C.free(unsafe.Pointer(arg))
	}
}

func (client *baseClient) Set(key string, value string) (string, error) {
	result, err := client.executeCommand(C.Set, []string{key, value})
	if err != nil {
		return "", err
	}

	return handleStringResponse(result)
}

func (client *baseClient) SetWithOptions(key string, value string, options *SetOptions) (string, error) {
	result, err := client.executeCommand(C.Set, append([]string{key, value}, options.toArgs()...))
	if err != nil {
		return "", err
	}

	return handleStringOrNullResponse(result)
}

func (client *baseClient) Get(key string) (string, error) {
	result, err := client.executeCommand(C.Get, []string{key})
	if err != nil {
		return "", err
	}

	return handleStringOrNullResponse(result)
}

func (client *baseClient) Del(keys []string) (int64, error) {
	result, err := client.executeCommand(C.Del, keys)
	if err != nil {
		return 0, err
	}

	return handleLongResponse(result)
}

func (client *baseClient) Exists(keys []string) (int64, error) {
	result, err := client.executeCommand(C.Exists, keys)
	if err != nil {
		return 0, err
	}
	return handleLongResponse(result)
}

func (client *baseClient) MSet(keyValueMap map[string]string) (string, error) {
	flat := []string{}
	for key, value := range keyValueMap {
		flat = append(flat, key, value)
	}
	result, err := client.executeCommand(C.MSet, flat)
	if err != nil {
		return "", err
	}

	return handleStringResponse(result)
}

func (client *baseClient) MSetNX(keyValueMap map[string]string) (int64, error) {
	flat := []string{}
	for key, value := range keyValueMap {
		flat = append(flat, key, value)
	}
	result, err := client.executeCommand(C.MSetNX, flat)
	if err != nil {
		return 0, err
	}
	return handleLongResponse(result)
}

func (client *baseClient) MGet(keys []string) ([]string, error) {
	result, err := client.executeCommand(C.MGet, keys)
	if err != nil {
		return []string{}, err
	}

	return handleStringArrayResponse(result)
}

func (client *baseClient) Incr(key string) (int64, error) {
	result, err := client.executeCommand(C.Incr, []string{key})
	if err != nil {
		return 0, err
	}
	return handleLongResponse(result)
}

func (client *baseClient) IncrBy(key string, amount int64) (int64, error) {
	result, err := client.executeCommand(C.IncrBy, []string{key, strconv.FormatInt(amount, 10)})
	if err != nil {
		return 0, err
	}

	return handleLongResponse(result)
}

func (client *baseClient) IncrByFloat(key string, amount float64) (float64, error) {
	result, err := client.executeCommand(C.IncrByFloat, []string{key, strconv.FormatFloat(amount, 'f', -1, 64)})
	if err != nil {
		return 0, err
	}

	return handleDoubleResponse(result)
}

func (client *baseClient) Decr(key string) (int64, error) {
	result, err := client.executeCommand(C.Decr, []string{key})
	if err != nil {
		return 0, err
	}

	return handleLongResponse(result)
}

func (client *baseClient) DecrBy(key string, amount int64) (int64, error) {
	result, err := client.executeCommand(C.DecrBy, []string{key, strconv.FormatInt(amount, 10)})
	if err != nil {
		return 0, err
	}

	return handleLongResponse(result)
}

func (client *baseClient) Strlen(key string) (int64, error) {
	result, err := client.executeCommand(C.Strlen, []string{key})
	if err != nil {
		return 0, err
	}

	return handleLongResponse(result)
}

func (client *baseClient) SetRange(key string, offset int, value string) (int64, error) {
	result, err := client.executeCommand(C.SetRange, []string{key, strconv.Itoa(offset), value})
	if err != nil {
		return 0, err
	}

	return handleLongResponse(result)
}

func (client *baseClient) GetRange(key string, start int, end int) (string, error) {
	result, err := client.executeCommand(C.GetRange, []string{key, strconv.Itoa(start), strconv.Itoa(end)})
	if err != nil {
		return "", err
	}

	return handleStringResponse(result)
}

func (client *baseClient) Append(key string, value string) (int64, error) {
	result, err := client.executeCommand(C.Append, []string{key, value})
	if err != nil {
		return 0, err
	}

	return handleLongResponse(result)
}

func (client *baseClient) LCS(key1 string, key2 string) (string, error) {
	result, err := client.executeCommand(C.LCS, []string{key1, key2})
	if err != nil {
		return "", err
	}

	return handleStringResponse(result)
}
