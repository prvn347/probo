package main

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
)

func main() {
	ctx := context.Background()

	client := redis.NewClient(
		&redis.Options{
			Addr: "localhost:6379",
		})

	defer client.Close()
	for {

		result, err := client.BRPop(ctx, 0, "message").Result()
		if err != nil {

			fmt.Println("error while setting data")
			return
		}

		message := result[1]
		fmt.Printf("Order popped: %s", message)

	}

}
