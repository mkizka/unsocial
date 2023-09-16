export class UserServiceError extends Error {}

export class UserNotFoundError extends UserServiceError {
  name = "UserNotFoundError";
}

export class ActorFailError extends UserServiceError {
  name = "ActorFailError";
}

export class WebfingerValidationError extends UserServiceError {
  name = "WebfingerValidationError";
}
