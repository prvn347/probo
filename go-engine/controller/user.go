package controller

import "fmt"

type userResponseType struct {
	Type string      `json:"type"` // Note: Use `Type` instead of `types` to follow Go naming conventions
	Data *userCreate `json:"data"`
}

type userCreate struct {
	EventID string `json:"eventId"`
	UserID  string `json:"userId"`
}

func createUser(userData userCreate) {
	fmt.Printf("Creating user with ID: %s, Event ID: %s\n", userData.UserID, userData.EventID)
}
