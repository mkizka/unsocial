export class FindOrFetchUserError extends Error {}

export class UserNotFoundError extends FindOrFetchUserError {
  name = "UserNotFoundError";
}

export class WebfingerFailError extends FindOrFetchUserError {
  name = "WebfingerFailError";
}

export class ActorFailError extends FindOrFetchUserError {
  name = "ActorFailError";
}
