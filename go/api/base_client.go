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

	C.command(client.coreClient, C.uintptr_t(resultChannelPtr), requestType, C.uintptr_t(len(args)), &cArgs[0])
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
	result, err := client.executeCommand(C.SetString, []string{key, value})
	if err != nil {
		return "", err
	}

	return handleStringResponse(result)
}

// SetWithOptions sets the given key with the given value using the given options. The return value is dependent on the passed
// options. If the value is successfully set, "OK" is returned. If value isn't set because of [OnlyIfExists] or
// [OnlyIfDoesNotExist] conditions, an zero-value string is returned (""). If [api.SetOptions.ReturnOldValue] is set, the old
// value is returned.
//
// See [redis.io] for details.
//
// For example:
//
//	result, err := client.SetWithOptions("key", "value", &api.SetOptions{
//	    ConditionalSet: api.OnlyIfExists,
//	    Expiry: &api.Expiry{
//	        Type: api.Seconds,
//	        Count: uint64(5),
//	    },
//	})
//
// [redis.io]: https://redis.io/commands/set/
func (client *baseClient) SetWithOptions(key string, value string, options *SetOptions) (string, error) {
	result, err := client.executeCommand(C.SetString, append([]string{key, value}, options.toArgs()...))
	if err != nil {
		return "", nil
	}

	return handleStringResponse(result)
}

// Get a pointer to the value associated with the given key, or nil if no such value exists.
//
// See [redis.io] for details.
//
// For example:
//
//	result := client.Set("key", "value")
//
// [redis.io]: https://redis.io/commands/set/
func (client *baseClient) Get(key string) (string, error) {
	result, err := client.executeCommand(C.GetString, []string{key})
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
		flat = append(flat, key)
		flat = append(flat, value)
	}
	result, err := client.executeCommand(C.MSet, flat)
	if err != nil {
		return "", err
	}

	return handleStringResponse(result)
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

func (client *baseClient) LPush(key string, elements []string) (int64, error) {
	result, err := client.executeCommand(C.LPush, append([]string{key}, elements...))
	if err != nil {
		return 0, err
	}

	return handleLongResponse(result)
}

func (client *baseClient) LPop(key string) (string, error) {
	result, err := client.executeCommand(C.LPop, []string{key})
	if err != nil {
		return "", err
	}

	return handleStringOrNullResponse(result)
}

func (client *baseClient) LRange(key string, start int64, end int64) ([]string, error) {
	result, err := client.executeCommand(C.LRange, []string{key, strconv.FormatInt(start, 10), strconv.FormatInt(end, 10)})
	if err != nil {
		return []string{}, err
	}

	return handleStringArrayOrNullResponse(result)
}

func (client *baseClient) Lindex(key string, index int64) (string, error) {
	result, err := client.executeCommand(C.Lindex, []string{key, strconv.FormatInt(index, 10)})
	if err != nil {
		return "", err
	}

	return handleStringOrNullResponse(result)
}

func (client *baseClient) LTrim(key string, start int64, end int64) (string, error) {
	result, err := client.executeCommand(C.LTrim, []string{key, strconv.FormatInt(start, 10), strconv.FormatInt(end, 10)})
	if err != nil {
		return "", err
	}

	return handleStringResponse(result)
}

func (client *baseClient) LLen(key string) (int64, error) {
	result, err := client.executeCommand(C.LLen, []string{key})
	if err != nil {
		return 0, err
	}

	return handleLongResponse(result)
}

func (client *baseClient) LRem(key string, count int64, element string) (int64, error) {
	result, err := client.executeCommand(C.LRem, []string{key, strconv.FormatInt(count, 10), element})
	if err != nil {
		return 0, err
	}

	return handleLongResponse(result)
}

func (client *baseClient) RPush(key string, elements []string) (int64, error) {
	result, err := client.executeCommand(C.RPush, append([]string{key}, elements...))
	if err != nil {
		return 0, err
	}

	return handleLongResponse(result)
}

func (client *baseClient) RPop(key string) (string, error) {
	result, err := client.executeCommand(C.RPop, []string{key})
	if err != nil {
		return "", err
	}

	return handleStringOrNullResponse(result)
}

func (client *baseClient) BLPop(keys []string, timeout float64) ([]string, error) {
	var arg []string
	arg = append(arg, keys...)
	arg = append(arg, strconv.FormatFloat(timeout, 'f', -1, 64))
	result, err := client.executeCommand(C.BLPop, arg)
	if err != nil {
		return []string{}, err
	}

	return handleStringArrayOrNullResponse(result)
}

func (client *baseClient) BRPop(keys []string, timeout float64) ([]string, error) {
	var arg []string
	arg = append(arg, keys...)
	arg = append(arg, strconv.FormatFloat(timeout, 'f', -1, 64))
	result, err := client.executeCommand(C.BRPop, arg)
	if err != nil {
		return []string{}, err
	}

	return handleStringArrayOrNullResponse(result)
}

func (client *baseClient) RPushX(key string, elements []string) (int64, error) {
	result, err := client.executeCommand(C.RPushX, append([]string{key}, elements...))
	if err != nil {
		return 0, err
	}

	return handleLongResponse(result)
}

func (client *baseClient) LPushX(key string, elements []string) (int64, error) {
	result, err := client.executeCommand(C.LPushX, append([]string{key}, elements...))
	if err != nil {
		return 0, err
	}

	return handleLongResponse(result)
}
