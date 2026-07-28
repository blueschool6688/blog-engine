package discord

// Discord interaction types.
const (
	InteractionTypePing               = 1
	InteractionTypeApplicationCommand = 2
)

// Discord interaction response types.
const (
	InteractionResponsePong                     = 1
	InteractionResponseDeferredChannelMessage = 5
)

// Discord Interaction Payload.
type Interaction struct {
	ID            string          `json:"id"`
	ApplicationID string          `json:"application_id"`
	Type          int             `json:"type"`
	Token         string          `json:"token"`
	Data          InteractionData `json:"data"`
}

type InteractionData struct {
	ID      string              `json:"id"`
	Name    string              `json:"name"`
	Type    int                 `json:"type"`
	Options []InteractionOption `json:"options"`
}

type InteractionOption struct {
	Name  string      `json:"name"`
	Type  int         `json:"type"`
	Value interface{} `json:"value"`
}

// Response sent back synchronously to Discord.
type InteractionResponse struct {
	Type int `json:"type"`
}

// Followup payload to edit the original deferred message.
type FollowupMessage struct {
	Content string `json:"content"`
}
