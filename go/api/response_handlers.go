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

func handleStringResponse(response *C.struct_CommandResponse) (string, error) {
	defer C.free_command_response(response)
	if response == nil {
		return "", nil
	}
	return handleRedisResponse[string](reflect.TypeOf(""), false, C.GoString(response.string_value))
}

func handleStringArrayResponse(response *C.struct_CommandResponse) ([]string, error) {
	defer C.free_command_response(response)
	var slice []string
	for _, v := range unsafe.Slice(response.array_value, response.int_value) {
		if v == nil {
			slice = append(slice, "")
		} else {
			slice = append(slice, C.GoString(v))
		}
	}
	return handleRedisResponse[[]string](reflect.TypeOf([]string{}), false, slice)
}

func handleLongResponse(response *C.struct_CommandResponse) (int64, error) {
	defer C.free_command_response(response)
	var i int64
	return handleRedisResponse[int64](reflect.TypeOf(i), false, int64(response.int_value))
}
