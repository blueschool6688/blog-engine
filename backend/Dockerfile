FROM golang:1.25-alpine AS deps
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download && go mod verify

FROM deps AS builder
WORKDIR /app
COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -trimpath \
    -o /out/cms ./cmd/api/main.go

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -trimpath \
    -o /out/worker ./cmd/worker/main.go

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -trimpath \
    -o /out/migrate ./cmd/migrate/main.go

FROM gcr.io/distroless/static-debian12 AS runtime
WORKDIR /app

COPY --from=builder /out/cms     /cms
COPY --from=builder /out/worker  /worker
COPY --from=builder /out/migrate /migrate
COPY --from=builder /app/migrations /app/migrations

EXPOSE 8080

CMD ["/cms"]
