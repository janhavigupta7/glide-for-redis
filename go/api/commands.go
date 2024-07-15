// Copyright GLIDE-for-Redis Project Contributors - SPDX Identifier: Apache-2.0

package api

// StringCommands defines an interface for the "String Commands" group of Redis commands for standalone and cluster clients.
//
// See [redis.io] for details.
//
// [redis.io]: https://redis.io/commands/?group=string
type StringCommands interface {
	// Set the given key with the given value. The return value is a response from Redis containing the string "OK".
	//
	// See [redis.io] for details.
	//
	// For example:
	//
	//	result := client.Set("key", "value")
	//
	// [redis.io]: https://redis.io/commands/set/
	Set(key string, value string) (string, error)

	// SetWithOptions sets the given key with the given value using the given options. The return value is dependent on the
	// passed options. If the value is successfully set, "OK" is returned. If value isn't set because of [OnlyIfExists] or
	// [OnlyIfDoesNotExist] conditions, a zero-value string is returned (""). If [SetOptions#ReturnOldValue] is set, the old
	// value is returned.
	//
	// See [redis.io] for details.
	//
	// For example:
	//
	//  result, err := client.SetWithOptions("key", "value", &api.SetOptions{
	//      ConditionalSet: api.OnlyIfExists,
	//      Expiry: &api.Expiry{
	//          Type: api.Seconds,
	//          Count: uint64(5),
	//      },
	//  })
	//
	// [redis.io]: https://redis.io/commands/set/
	SetWithOptions(key string, value string, options *SetOptions) (string, error)

	// Get string value associated with the given key, or a zero-value string is returned ("") if no such value exists
	//
	// See [redis.io] for details.
	//
	// For example:
	//
	//	result := client.Get("key")
	//
	// [redis.io]: https://redis.io/commands/get/
	Get(key string) (string, error)

	// GetDel(key string) (string, error)

	// GetEx(key string) (string, error)

	// GetExWithOptions(key string, options *GetExOptions) (string, error)

	MSet(keyValueMap map[string]string) (string, error)

	MGet(keys []string) ([]string, error)

	MSetNX(keyValueMap map[string]string) (int64, error)

	Incr(key string) (int64, error)

	IncrBy(key string, amount int64) (int64, error)

	IncrByFloat(key string, amount float64) (float64, error)

	Decr(key string) (int64, error)

	DecrBy(key string, amount int64) (int64, error)

	Strlen(key string) (int64, error)

	SetRange(key string, offset int, value string) (int64, error)

	GetRange(key string, start int, end int) (string, error)

	Append(key string, value string) (int64, error)

	LCS(key1 string, key2 string) (string, error)
}

type GenericBaseCommands interface {
}

// TODO: Test the working of the list commands.
type ListBaseCommands interface {
}
