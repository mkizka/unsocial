// https://vercel.com/guides/how-do-i-use-the-ignored-build-step-field-on-vercel
// https://zenn.dev/catnose99/articles/b37104fc7ef214

if (
  process.env.VERCEL_GIT_COMMIT_REF == "renovate-pr" ||
  process.env.VERCEL_GIT_COMMIT_REF?.startsWith("renovate/")
) {
  console.log("🛑 - Build cancelled");
  process.exit(0);
} else {
  console.log("✅ - Build can proceed");
  process.exit(1);
}
