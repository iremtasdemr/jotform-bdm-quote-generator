import Image from "next/image";

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
        <div className="site-brand access-brand">
          <Image
            className="site-brand-logo"
            src="/jotform-logo.png"
            alt=""
            aria-hidden="true"
            width={51}
            height={50}
            unoptimized
          />
          <div>
            <p className="access-kicker">Jotform Enterprise</p>
            <h1 id="access-title">Quote Generator</h1>
          </div>
        </div>
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
