export class UserServiceError extends Error {}

export class UserNotFoundError extends UserServiceError {
  name = "UserNotFoundError";
}

export class WebfingerValidationError extends UserServiceError {
  name = "WebfingerValidationError";
}

export class ActorValidationError extends UserServiceError {
  name = "ActorValidationError";
}

export class NoActorInWebFingerError extends UserServiceError {
  name = "NoActorInWebFingerError";
}
