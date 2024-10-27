package models

import "sync"

type userBalance struct {
	Balance int `json:"balance"`
	Locked  int `json:"locked"`
}

var INRBALANCE sync.Map
