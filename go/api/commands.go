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

	// Get a pointer to the value associated with the given key, or nil if no such value exists
	//
	// See [redis.io] for details.
	//
	// For example:
	//
	//	result := client.Set("key", "value")
	//
	// [redis.io]: https://redis.io/commands/set/
	Get(key string) (string, error)

	MSet(keyValueMap map[string]string) (string, error)

	MGet(keys []string) ([]string, error)

	Incr(key string) (int64, error)

	IncrBy(key string, amount int64) (int64, error)

	IncrByFloat(key string, amount float64) (float64, error)

	Decr(key string) (int64, error)

	DecrBy(key string, amount int64) (int64, error)

	Strlen(key string) (int64, error)

	SetRange(key string, offset int, value string) (int64, error)

	GetRange(key string, start int64, end int64) (string, error)
}

type GenericBaseCommands interface {
	Del(keys []string) (int64, error)

	Exists(keys []string) (int64, error)
}

// TODO: Test the working of the list commands.
type ListBaseCommands interface {
	LPush(key string, elements []string) (int64, error)

	LPop(key string) (string, error)

	LRange(key string, start int64, end int64) ([]string, error)

	Lindex(key string, index int64) (string, error)

	LTrim(key string, start int64, end int64) (string, error)

	LLen(key string) (int64, error)

	LRem(key string, count int64, element string) (int64, error)

	RPush(key string, elements []string) (int64, error)

	RPop(key string) (string, error)

	// TODO: LInsert(key string, position *InsertPosition, pivot string, element string) (int64, error)

	BLPop(keys []string, timeout float64) ([]string, error)

	BRPop(keys []string, timeout float64) ([]string, error)

	RPushX(key string, elements []string) (int64, error)

	LPushX(key string, elements []string) (int64, error)
}
