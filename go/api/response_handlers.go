// Copyright GLIDE-for-Redis Project Contributors - SPDX Identifier: Apache-2.0

package api

// #cgo LDFLAGS: -L../target/release -lglide_rs
// #include "../lib.h"
import "C"

import (
	"fmt"
	"go/types"
	"reflect"
	"unsafe"
)

type redisResponse interface {
	interface{} | string | types.Nil
}

func handleRedisResponse[T redisResponse](t reflect.Type, response interface{}) (T, error) {
	if reflect.TypeOf(response) == t {
		return reflect.ValueOf(response).Interface().(T), nil
	}

	var responseTypeName string
	if response == nil {
		responseTypeName = "nil"
	} else {
		responseTypeName = reflect.TypeOf(response).Name()
	}

	return reflect.Zero(t).Interface().(T), &RequestError{
		fmt.Sprintf("Unexpected return type from Redis: got %s, expected %s", responseTypeName, t),
	}
}

func convertCharArrayToString(arr *C.char, length C.long) string {
	byteSlice := C.GoBytes(unsafe.Pointer(arr), C.int(int64(length)))
	// Create Go string from byte slice (preserving null characters)
	goStr := string(byteSlice)
	return goStr
}

func handleStringResponse(response *C.struct_CommandResponse) (string, error) {
	defer C.free_command_response(response)
	var res string = convertCharArrayToString(response.string_value, response.string_value_len)
	return handleRedisResponse[string](reflect.TypeOf(""), res)
}

func handleStringOrNullResponse(response *C.struct_CommandResponse) (string, error) {
	if response == nil {
		return "", nil
	}
	return handleStringResponse(response)
}

func handleStringArrayResponse(response *C.struct_CommandResponse) ([]string, error) {
	defer C.free_command_response(response)
	var len []C.long
	len = append(len, unsafe.Slice(response.array_elements_len, response.array_value_len)...)
	var slice []string
	for k, v := range unsafe.Slice(response.array_value, response.array_value_len) {
		if v == nil {
			slice = append(slice, "")
		} else {
			slice = append(slice, convertCharArrayToString(v, len[k]))
		}
	}
	return handleRedisResponse[[]string](reflect.TypeOf([]string{}), slice)
}

func handleStringArrayOrNullResponse(response *C.struct_CommandResponse) ([]string, error) {
	if response == nil {
		return []string{}, nil
	}
	return handleStringArrayResponse(response)
}

func handleLongResponse(response *C.struct_CommandResponse) (int64, error) {
	defer C.free_command_response(response)
	var i int64
	return handleRedisResponse[int64](reflect.TypeOf(i), int64(response.int_value))
}

func handleDoubleResponse(response *C.struct_CommandResponse) (float64, error) {
	defer C.free_command_response(response)
	var i float64
	return handleRedisResponse[float64](reflect.TypeOf(i), float64(response.float_value))
}

func handleBooleanResponse(response *C.struct_CommandResponse) (bool, error) {
	defer C.free_command_response(response)
	return handleRedisResponse[bool](reflect.TypeOf(false), bool(response.bool_value))
}
