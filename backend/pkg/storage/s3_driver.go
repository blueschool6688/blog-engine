package storage

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"strings"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

type S3Storage struct {
	driverName string // s3, minio, cloudfly, v.v.
	client     *s3.S3
	bucket     string
	publicURL  string
}

func NewS3Storage(driverName, endpoint, region, bucket, accessKey, secretKey string) (*S3Storage, error) {
	s3Config := &aws.Config{
		Credentials: credentials.NewStaticCredentials(accessKey, secretKey, ""),
		Endpoint:    aws.String(endpoint),
		Region:      aws.String(region),
	}

	newSession := session.New(s3Config)

	client := s3.New(newSession)

	publicURL := strings.TrimRight(endpoint, "/") + "/" + bucket

	return &S3Storage{
		driverName: driverName,
		client:     client,
		bucket:     bucket,
		publicURL:  publicURL,
	}, nil
}

func (s *S3Storage) DriverName() string {
	return s.driverName
}

func (s *S3Storage) UploadFile(ctx context.Context, key string, reader io.Reader, contentType string) error {
	data, err := io.ReadAll(reader)
	if err != nil {
		return fmt.Errorf("s3 read all: %w", err)
	}

	_, err = s.client.PutObjectWithContext(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		Body:        bytes.NewReader(data),
		ContentType: aws.String(contentType),
		ACL:         aws.String("public-read"),
	})
	if err != nil {
		return fmt.Errorf("s3 upload %q: %w", key, err)
	}
	return nil
}

func (s *S3Storage) DeleteObject(ctx context.Context, key string) error {
	if key == "" {
		return nil
	}
	_, err := s.client.DeleteObjectWithContext(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return fmt.Errorf("s3 delete %q: %w", key, err)
	}
	return nil
}

func (s *S3Storage) GetPublicURL(key string) string {
	return s.publicURL + "/" + key
}

func (s *S3Storage) DownloadFile(ctx context.Context, key string) (io.ReadCloser, error) {
	result, err := s.client.GetObjectWithContext(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, fmt.Errorf("s3 download %q: %w", key, err)
	}
	return result.Body, nil
}
