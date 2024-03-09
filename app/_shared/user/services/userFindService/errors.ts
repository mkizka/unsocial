// Stryker disable all
export class UserNotFoundError extends Error {
  name = "UserNotFoundError";
}

export class WebfingerValidationError extends Error {
  name = "WebfingerValidationError";
}

export class ActorValidationError extends Error {
  name = "ActorValidationError";
}
