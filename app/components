"use client";

// Save as app/components/AuthForm.js.
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function AuthForm({ mode = "login" }) {
  const signup = mode === "signup";
  const router = useRouter();
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function finishSignIn(client, user) {
    // Keep existing profiles intact, including server-managed roles.
    const { data: profile, error: readError } = await client
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (readError)
      throw new Error(
        "You are signed in, but your profile could not be loaded. Please try signing in again. If this continues, the profile access rules need checking.",
      );
    if (!profile) {
      const metadata = user.user_metadata || {};
      const role = metadata.role === "tenant" ? "tenant" : "landlord";
      // Role selection is profile information, not permission to access others' data.
      // Database policies must enforce ownership and tenant membership separately.
      const { error } = await client
        .from("profiles")
        .upsert(
          { id: user.id, full_name: metadata.full_name || "", role },
          { onConflict: "id", ignoreDuplicates: true },
        );
      if (error)
        throw new Error(
          "Your account is signed in, but profile setup could not finish. Please sign in again to retry. If this continues, the profile access rules need checking.",
        );
    }
    setNotice({
      type: "success",
      text: "You’re signed in. Opening your dashboard…",
    });
    router.replace("/dashboard");
    router.refresh();
  }

  async function submit(event) {
    event.preventDefault();
    if (submitting.current || confirmationSent) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const email = String(fields.get("email") || "").trim();
    const password = String(fields.get("password") || "");
    const fullName = String(fields.get("name") || "").trim();
    const role = String(fields.get("role") || "landlord");
    setNotice(null);
    if (signup && !fullName) {
      setNotice({ type: "error", text: "Please enter your full name." });
      return;
    }
    if (signup && password !== fields.get("confirmPassword")) {
      setNotice({ type: "error", text: "Your passwords do not match." });
      return;
    }
    if (signup && !["landlord", "tenant"].includes(role)) return;
    submitting.current = true;
    setBusy(true);
    try {
      const client = supabase();
      if (signup) {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, role } },
        });
        if (error) throw error;
        if (!data?.session) {
          // Confirmation-enabled signup has no authenticated session yet.
          // Do not attempt an anonymous write to profiles.
          form.reset();
          setConfirmationSent(true);
          setNotice({
            type: "success",
            text: "Check your inbox for a confirmation email if confirmation is required. After confirming, return here to sign in. If you already have an account, use Sign in instead.",
          });
          return;
        }
        if (!data.user)
          throw new Error(
            "The account response was incomplete. Please try signing in.",
          );
        await finishSignIn(client, data.user);
      } else {
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (!data?.user || !data.session)
          throw new Error("Sign-in did not complete. Please try again.");
        await finishSignIn(client, data.user);
      }
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error?.message ||
          "We couldn’t connect. Check your connection and try again.",
      });
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
    <main className="uvAuth">
      <aside className="uvAuthStory">
        <Link className="uvAuthBrand" href="/" aria-label="Unitvero home">
          unit<span>vero</span>
          <span className="uvAuthBrandDot" />
        </Link>
        <div className="uvAuthStoryBody">
          <p className="uvAuthEyebrow">YOUR RENTAL WORKSPACE</p>
          <h2>
            A little more clarity.
            <br />
            <em>A lot more control.</em>
          </h2>
          <p>
            One place for your properties, rent records, and tenant
            conversations. Make room for what comes next.
          </p>
          <div className="uvAuthWorkspace" aria-label="Workspace features">
            <div className="uvAuthWorkspaceTop">
              <span className="uvAuthBuilding" aria-hidden="true">
                ⌂
              </span>
              <div>
                <strong>Your portfolio, together</strong>
                <small>Organized around your day</small>
              </div>
            </div>
            <div className="uvAuthWorkspaceRow">
              <span>Properties &amp; units</span>
              <span aria-hidden="true">↗</span>
            </div>
            <div className="uvAuthWorkspaceRow">
              <span>Rent &amp; payment records</span>
              <span aria-hidden="true">↗</span>
            </div>
            <div className="uvAuthWorkspaceRow">
              <span>Tenant conversations</span>
              <span aria-hidden="true">↗</span>
            </div>
          </div>
        </div>
        <p className="uvAuthStoryFooter">
          Built for the everyday work of managing rentals.
        </p>
      </aside>

      <section className="uvAuthMain" aria-labelledby="uvAuthTitle">
        <Link href="/" className="uvAuthBack">
          ← Back to home
        </Link>
        <div className="uvAuthCard">
          <div className="uvAuthTabs" aria-label="Account pages">
            <Link href="/login" aria-current={!signup ? "page" : undefined}>
              Sign in
            </Link>
            <Link href="/signup" aria-current={signup ? "page" : undefined}>
              Get started
            </Link>
          </div>
          <p className="uvAuthEyebrow">
            {signup ? "START WITH UNITVERO" : "WELCOME TO UNITVERO"}
          </p>
          <h1 id="uvAuthTitle">
            {signup ? "Create your account." : "Welcome back."}
          </h1>
          <p className="uvAuthIntro">
            {signup
              ? "A more organized rental business starts here."
              : "Sign in to pick up where you left off."}
          </p>

          {notice && (
            <div
              className={`uvAuthNotice ${notice.type}`}
              role={notice.type === "error" ? "alert" : "status"}
            >
              {notice.text}
            </div>
          )}

          {confirmationSent ? (
            <div className="uvAuthConfirmation">
              <h2>Next stop: your inbox.</h2>
              <p>
                Check your spam folder too. You can sign in once your email has
                been confirmed.
              </p>
              <Link className="uvAuthSubmit" href="/login">
                Go to sign in →
              </Link>
              <button
                type="button"
                className="uvAuthTryAgain"
                onClick={() => {
                  setConfirmationSent(false);
                  setNotice(null);
                }}
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={submit} aria-busy={busy}>
              <fieldset disabled={busy}>
                {signup && (
                  <>
                    <label htmlFor="uvName">Full name</label>
                    <input
                      id="uvName"
                      name="name"
                      autoComplete="name"
                      placeholder="Your full name"
                      maxLength={120}
                      required
                    />
                    <label htmlFor="uvRole">I am a</label>
                    <select id="uvRole" name="role" defaultValue="landlord">
                      <option value="landlord">
                        Landlord / property manager
                      </option>
                      <option value="tenant">Tenant</option>
                    </select>
                  </>
                )}
                <label htmlFor="uvEmail">Email address</label>
                <input
                  id="uvEmail"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="you@example.com"
                  required
                />
                <label htmlFor="uvPassword">Password</label>
                <div className="uvAuthPassword">
                  <input
                    id="uvPassword"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={signup ? "new-password" : "current-password"}
                    minLength={signup ? 8 : undefined}
                    aria-describedby={signup ? "uvPasswordHint" : undefined}
                    placeholder={
                      signup ? "Create a password" : "Enter your password"
                    }
                    required
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {signup && (
                  <>
                    <p className="uvAuthHint" id="uvPasswordHint">
                      Use at least 8 characters. Avoid a password you use
                      elsewhere.
                    </p>
                    <label htmlFor="uvConfirmPassword">Confirm password</label>
                    <input
                      id="uvConfirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      minLength={8}
                      placeholder="Re-enter your password"
                      required
                    />
                  </>
                )}
                <button className="uvAuthSubmit" type="submit">
                  {busy
                    ? "Please wait…"
                    : signup
                      ? "Create account →"
                      : "Sign in →"}
                </button>
              </fieldset>
            </form>
          )}
          <p className="uvAuthSwitch">
            {signup ? "Already have an account? " : "New to Unitvero? "}
            <Link href={signup ? "/login" : "/signup"}>
              {signup ? "Sign in" : "Create an account"}
            </Link>
          </p>
          <p className="uvAuthFootnote">
            Your existing account and password still work here.
          </p>
        </div>
      </section>

      <style jsx global>{`
        .uvAuth,
        .uvAuth * {
          box-sizing: border-box;
        }
        body:has(.uvAuth) {
          margin: 0;
        }
        .uvAuth {
          min-height: 100vh;
          min-height: 100dvh;
          display: grid;
          grid-template-columns: minmax(340px, 0.95fr) minmax(420px, 1.05fr);
          background: #f8fafc;
          color: #152340;
          font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 16px;
          line-height: 1.5;
        }
        .uvAuth a {
          text-decoration: none;
        }
        .uvAuth button,
        .uvAuth input,
        .uvAuth select {
          font: inherit;
          letter-spacing: normal;
        }
        .uvAuth button,
        .uvAuth a {
          -webkit-tap-highlight-color: transparent;
        }
        .uvAuth :focus-visible {
          outline: 3px solid #72a1f7;
          outline-offset: 3px;
        }
        .uvAuthStory {
          padding: 42px clamp(28px, 4vw, 68px);
          display: flex;
          flex-direction: column;
          background:
            radial-gradient(ellipse at 5% 0%, #264b87 0%, transparent 55%),
            linear-gradient(160deg, #172f58, #101e38);
          color: #fff;
          position: relative;
          overflow: hidden;
        }
        .uvAuthBrand {
          color: white;
          font-size: 29px;
          font-weight: 800;
          letter-spacing: -1.5px;
          display: inline-flex;
          align-items: center;
          align-self: flex-start;
        }
        .uvAuthBrand > span:first-child {
          color: #95b9ff;
        }
        .uvAuthBrandDot {
          width: 7px;
          height: 7px;
          background: #8edec6;
          border-radius: 50%;
          margin: 13px 0 0 5px;
        }
        .uvAuthStoryBody {
          margin: auto 0;
          padding: 52px 0;
          max-width: 470px;
        }
        .uvAuth .uvAuthEyebrow {
          margin: 0 0 14px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.6px;
          color: #4266a2;
        }
        .uvAuthStory .uvAuthEyebrow {
          color: #a9c7ff;
        }
        .uvAuthStory h2 {
          margin: 0 0 22px;
          font-size: clamp(34px, 3.8vw, 54px);
          line-height: 1.12;
          letter-spacing: -1.8px;
          font-weight: 650;
        }
        .uvAuthStory h2 em {
          color: #a9c7ff;
          font-style: normal;
        }
        .uvAuthStoryBody > p:not(.uvAuthEyebrow) {
          color: #c0cce0;
          max-width: 400px;
          line-height: 1.8;
        }
        .uvAuthWorkspace {
          margin-top: 38px;
          padding: 23px;
          background: #ffffff09;
          border: 1px solid #ffffff26;
          border-radius: 18px;
          box-shadow: 0 22px 50px #07122640;
        }
        .uvAuthWorkspaceTop {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-bottom: 20px;
        }
        .uvAuthBuilding {
          background: #90b8ff20;
          color: #b7d1ff;
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          font-size: 27px;
          border-radius: 12px;
        }
        .uvAuthWorkspaceTop strong {
          display: block;
          font-size: 14px;
          font-weight: 650;
        }
        .uvAuthWorkspaceTop small {
          display: block;
          color: #abbcd6;
          font-size: 12px;
          margin-top: 2px;
        }
        .uvAuthWorkspaceRow {
          border-top: 1px solid #ffffff16;
          padding: 13px 0;
          font-size: 13px;
          color: #d4deed;
          display: flex;
          justify-content: space-between;
        }
        .uvAuthWorkspaceRow:last-child {
          padding-bottom: 0;
        }
        .uvAuthStoryFooter {
          color: #a8bbd6;
          font-size: 12px;
          margin: 0;
        }
        .uvAuthMain {
          min-width: 0;
          padding: 38px clamp(24px, 5vw, 90px);
          display: flex;
          flex-direction: column;
        }
        .uvAuthBack {
          color: #5c6b81;
          font-size: 13px;
          align-self: flex-start;
        }
        .uvAuthCard {
          width: 100%;
          max-width: 430px;
          margin: auto;
          padding: 34px 0;
        }
        .uvAuthTabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          padding: 4px;
          margin-bottom: 34px;
          background: #eaf0f7;
          border-radius: 12px;
        }
        .uvAuthTabs a {
          padding: 10px;
          text-align: center;
          font-size: 13px;
          font-weight: 650;
          color: #5c6b81;
          border-radius: 9px;
        }
        .uvAuthTabs a[aria-current="page"] {
          background: #fff;
          color: #1c417c;
          box-shadow: 0 2px 7px #14274410;
        }
        .uvAuthCard h1 {
          font-size: clamp(30px, 3vw, 38px);
          font-weight: 700;
          letter-spacing: -1.3px;
          line-height: 1.2;
          margin: 0 0 12px;
          color: #152340;
        }
        .uvAuthIntro {
          color: #607087;
          margin: 0 0 28px;
          font-size: 14px;
        }
        .uvAuth fieldset {
          border: 0;
          margin: 0;
          padding: 0;
          min-width: 0;
        }
        .uvAuth label {
          display: block;
          margin: 18px 0 7px;
          color: #34445d;
          font-size: 13px;
          font-weight: 650;
        }
        .uvAuth fieldset > label:first-child {
          margin-top: 0;
        }
        .uvAuth input,
        .uvAuth select {
          display: block;
          width: 100%;
          min-height: 49px;
          padding: 12px 14px;
          border: 1px solid #ccd6e3;
          border-radius: 10px;
          color: #172a46;
          background: #fff;
          font-size: 16px;
          box-shadow: 0 1px 2px #13244504;
        }
        .uvAuth input::placeholder {
          color: #79889a;
          opacity: 1;
        }
        .uvAuthPassword {
          position: relative;
        }
        .uvAuthPassword input {
          padding-right: 70px;
        }
        .uvAuthPassword button {
          position: absolute;
          inset: 4px 5px 4px auto;
          padding: 0 12px;
          border: 0;
          background: transparent;
          color: #31578f;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          border-radius: 6px;
        }
        .uvAuth .uvAuthSubmit {
          border: 0;
          min-height: 50px;
          padding: 13px 18px;
          border-radius: 10px;
          width: 100%;
          margin-top: 25px;
          background: #285cc2;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 15px #285cc222;
        }
        .uvAuth .uvAuthSubmit:hover {
          background: #204fa9;
        }
        .uvAuth fieldset:disabled {
          opacity: 0.65;
        }
        .uvAuth fieldset:disabled button {
          cursor: wait;
        }
        .uvAuthHint {
          margin: 7px 0 0;
          color: #65758b;
          font-size: 12px;
        }
        .uvAuthSwitch {
          color: #617087;
          font-size: 13px;
          text-align: center;
          margin: 25px 0 0;
        }
        .uvAuthSwitch a {
          color: #2855a2;
          font-weight: 750;
        }
        .uvAuthFootnote {
          padding-top: 24px;
          margin: 26px 0 0;
          border-top: 1px solid #e2e8f0;
          color: #66768c;
          font-size: 11px;
          text-align: center;
        }
        .uvAuthNotice {
          border-radius: 10px;
          padding: 13px 15px;
          font-size: 13px;
          margin-bottom: 20px;
          overflow-wrap: anywhere;
        }
        .uvAuthNotice.error {
          border: 1px solid #efc5c5;
          background: #fff1f1;
          color: #912a2a;
        }
        .uvAuthNotice.success {
          border: 1px solid #b8ddd1;
          background: #edf9f3;
          color: #24614e;
        }
        .uvAuthConfirmation h2 {
          font-size: 23px;
          letter-spacing: -0.6px;
        }
        .uvAuthConfirmation p {
          color: #607087;
          font-size: 14px;
        }
        .uvAuthTryAgain {
          display: block;
          margin: 18px auto 0;
          border: 0;
          background: transparent;
          color: #31578f;
          font-size: 13px;
          cursor: pointer;
          padding: 10px;
        }
        @media (max-width: 800px) {
          .uvAuth {
            grid-template-columns: 1fr;
          }
          .uvAuthStory {
            padding: 23px 25px;
          }
          .uvAuthStoryBody,
          .uvAuthStoryFooter {
            display: none;
          }
          .uvAuthMain {
            padding: 24px;
          }
          .uvAuthCard {
            padding-top: 28px;
          }
        }
        @media (max-width: 380px) {
          .uvAuthMain {
            padding: 20px 18px;
          }
        }
      `}</style>
    </main>
  );
}

