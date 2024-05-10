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

	res = <-client.SetAsync("apples", "oranges")
	if err != nil {
		log.Fatal("Glide example failed with an error: ", err)
	}
	fmt.Println("SET(apples, oranges):", res)

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

	resint, err = client.Exists([]string{"apples", "foo", "bar"})
	if err != nil {
		log.Fatal("Glide example failed with an error: ", err)
	}

	fmt.Println("Exists(apples, foo, bar):", resint)

	client.Close()
}
