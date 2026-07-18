package validator

import (
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

// ValidationError represents a single validation error on a struct field.
type ValidationError struct {
	Field string `json:"field"`
	Rule  string `json:"rule"`
	Value string `json:"value,omitempty"`
}

// ValidationErrors represents a collection of validation errors.
type ValidationErrors []ValidationError

func (ve ValidationErrors) Error() string {
	var errs []string
	for _, e := range ve {
		errs = append(errs, fmt.Sprintf("Field '%s' failed validation for rule '%s'", e.Field, e.Rule))
	}
	return strings.Join(errs, "; ")
}

// Validate validates a struct payload based on validator tags and returns ValidationErrors (as error interface) if invalid.
func Validate(payload interface{}) error {
	err := validate.Struct(payload)
	if err == nil {
		return nil
	}

	if _, ok := err.(*validator.InvalidValidationError); ok {
		return err
	}

	var errorsList ValidationErrors
	for _, err := range err.(validator.ValidationErrors) {
		errorsList = append(errorsList, ValidationError{
			Field: strings.ToLower(err.Field()), // Field name, e.g. "email"
			Rule:  err.Tag(),                  // Rule that failed, e.g. "required"
			Value: fmt.Sprintf("%v", err.Value()),
		})
	}
	return errorsList
}
