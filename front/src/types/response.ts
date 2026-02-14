import { ValidationError } from "yup";

export type ErrorResponse = {
  message: string;
};

export type ValidationErrorResponse = {
  errors: ValidationError;
};
