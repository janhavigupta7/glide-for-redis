// Copyright GLIDE-for-Redis Project Contributors - SPDX Identifier: Apache-2.0

package main

import (
	"fmt"
	"log"

	"github.com/aws/glide-for-redis/go/glide/api"
)

func main() {
	host := "localhost"
	port := 6379

	config := api.NewRedisClientConfiguration().
		WithAddress(&api.NodeAddress{Host: host, Port: port})

	client, err := api.NewRedisClient(config)
	if err != nil {
		log.Fatal("error connecting to database: ", err)
	}

	res, err := client.CustomCommand([]string{"PING"})
	if err != nil {
		log.Fatal("Glide example failed with an error: ", err)
	}
	fmt.Println("PING:", res)

	res = <-client.Set("apples", "oranges")
	if err != nil {
		log.Fatal("Glide example failed with an error: ", err)
	}
	fmt.Println("SET(apples, oranges):", res)

	res, err = client.Get("invalidKey")
	if err != nil {
		log.Fatal("Glide example failed with an error: ", err)
	}
	fmt.Println("GET(invalidKey):", res)

	res, err = client.Get("apples")
	if err != nil {
		log.Fatal("Glide example failed with an error: ", err)
	}
	fmt.Println("GET(apples):", res)
	resint, err := client.Del([]string{"apples"})
	if err != nil {
		log.Fatal("Glide example failed with an error: ", err)
	}

	fmt.Println("Del(apples):", resint)
	res, err = client.MSet(map[string]string{
		"foo": "Dog",
		"bar": "Cat",
	})
	if err != nil {
		log.Fatal("Glide example failed with an error: ", err)
	}
	fmt.Println("MSet(foo:Dog, bar:Cat):", res)

	resarray, err := client.MGet([]string{"apples", "foo", "bar"})
	if err != nil {
		log.Fatal("Glide example failed with an error: ", err)
	}
	fmt.Println("MGet(apples, foo, bar):", resarray)

	resarray, err = client.MGet([]string{"invalidKey"})
	if err != nil {
		log.Fatal("Glide example failed with an error: ", err)
	}
	fmt.Println("MGet(invalidKey):", resarray)

	resint, err = client.Exists([]string{"apples", "foo", "bar"})
	if err != nil {
		log.Fatal("Glide example failed with an error: ", err)
	}

	fmt.Println("Exists(apples, foo, bar):", resint)

	res, err = client.Incr("pear")
	if err != nil {
		log.Fatal("Glide example failed with an error: ", err)
	}
	fmt.Println("Incr(pear):", res)

	res, err = client.IncrBy("pear", 4)
	if err != nil {
		log.Fatal("Glide example failed with an error: ", err)
	}
	fmt.Println("IncrBy(pear, 4):", res)

	res, err = client.IncrByFloat("mango", 4.3456)
	if err != nil {
		log.Fatal("Glide example failed with an error: ", err)
	}
	fmt.Println("IncrByFloat(mango, 4.3456):", res)

	res, err = client.Decr("banana")
	if err != nil {
		log.Fatal("Glide example failed with an error: ", err)
	}
	fmt.Println("Decr(banana):", res)

	res, err = client.DecrBy("banana", 4)
	if err != nil {
		log.Fatal("Glide example failed with an error: ", err)
	}
	fmt.Println("DecrBy(banana, 4):", res)

	resint, err = client.Strlen("foo")
	if err != nil {
		log.Fatal("Glide example failed with an error: ", err)
	}
	fmt.Println("Strlen(foo):", resint)

	res, err = client.SetRange("foo", 5, "tail")
	if err != nil {
		log.Fatal("Glide example failed with an error: ", err)
	}
	fmt.Println("SetRange(foo, 5, tail)):", res)

	res, err = client.GetRange("foo", 4, 6)
	if err != nil {
		log.Fatal("Glide example failed with an error: ", err)
	}
	fmt.Println("GetRange(foo, 4, 6)):", res)

	res, err = client.Get("foo")
	if err != nil {
		log.Fatal("Glide example failed with an error: ", err)
	}
	fmt.Println("Get(foo)):", res)
	client.Close()
}
