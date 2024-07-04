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

func handleRedisResponse[T redisResponse](t reflect.Type, isNilable bool, response interface{}) (T, error) {
	if isNilable && response == nil {
		return reflect.ValueOf(nil).Interface().(T), nil
	}

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
	var res string = convertCharArrayToString(response.string_value, response.int_value)
	return handleRedisResponse[string](reflect.TypeOf(""), false, res)
}

func handleStringOrNullResponse(response *C.struct_CommandResponse) (string, error) {
	if response != nil {
		defer C.free_command_response(response)
	}
	var res string = ""
	if response != nil {
		res = convertCharArrayToString(response.string_value, response.int_value)
	}
	return handleRedisResponse[string](reflect.TypeOf(""), false, res)
}

func handleStringArrayResponse(response *C.struct_CommandResponse) ([]string, error) {
	defer C.free_command_response(response)
	var len []C.long
	len = append(len, unsafe.Slice(response.int_array_value, response.int_value)...)
	var slice []string
	for k, v := range unsafe.Slice(response.array_value, response.int_value) {
		if v == nil {
			slice = append(slice, "")
		} else {
			var res string = convertCharArrayToString(v, len[k])
			slice = append(slice, res)
		}
	}
	return handleRedisResponse[[]string](reflect.TypeOf([]string{}), false, slice)
}

func handleStringArrayOrNullResponse(response *C.struct_CommandResponse) ([]string, error) {
	if response != nil {
		defer C.free_command_response(response)
	}
	var slice []string
	if response != nil {
		var len []C.long
		len = append(len, unsafe.Slice(response.int_array_value, response.int_value)...)
		for k, v := range unsafe.Slice(response.array_value, response.int_value) {
			if v == nil {
				slice = append(slice, "")
			} else {
				var res string = convertCharArrayToString(v, len[k])
				slice = append(slice, res)
			}
		}
	}
	return handleRedisResponse[[]string](reflect.TypeOf([]string{}), false, slice)
}

func handleLongResponse(response *C.struct_CommandResponse) (int64, error) {
	defer C.free_command_response(response)
	var i int64
	return handleRedisResponse[int64](reflect.TypeOf(i), false, int64(response.int_value))
}

func handleDoubleResponse(response *C.struct_CommandResponse) (float64, error) {
	defer C.free_command_response(response)
	var i float64
	return handleRedisResponse[float64](reflect.TypeOf(i), false, float64(response.float_value))
}
