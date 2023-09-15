export class UserServiceError extends Error {}

export class UserNotFoundError extends UserServiceError {
  name = "UserNotFoundError";
}

export class WebfingerFailError extends UserServiceError {
  name = "WebfingerFailError";
}

export class ActorFailError extends UserServiceError {
  name = "ActorFailError";
}

export class RedirectError extends UserServiceError {
  name = "RedirectError";
  constructor(public url: string) {
    super();
  }
}
