export default async function AccessPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message =
    error === "missing"
      ? "Password protection is not configured yet."
      : error === "invalid"
        ? "Incorrect password. Please try again."
        : "";

  return (
    <main className="access-page">
      <section className="access-panel" aria-labelledby="access-title">
        <p className="access-kicker">Jotform Enterprise</p>
        <h1 id="access-title">Quote Generator</h1>
        <form className="access-form" action="/api/access" method="post">
          <label className="field-label">
            Password
            <input
              className="field"
              name="password"
              type="password"
              autoComplete="current-password"
              autoFocus
              required
            />
          </label>
          {message ? (
            <p className="access-error" role="alert">
              {message}
            </p>
          ) : null}
          <button className="primary-button" type="submit">
            Continue
          </button>
        </form>
      </section>
    </main>
  );
}
