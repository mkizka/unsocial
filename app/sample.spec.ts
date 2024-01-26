import { userSignUpService } from "./_shared/user/services/userSignUpService";

console.log(process.env.UNSOCIAL_DATABASE_URL);

describe("Sample test", () => {
  it("should be true", async () => {
    await userSignUpService.signUpUser({
      preferredUsername: "test",
      password: "test",
    });
  });
});
