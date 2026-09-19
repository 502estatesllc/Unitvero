"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

function TenantInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState("");

  const [mode, setMode] = useState("signup");
  const [working, setWorking] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    verifyInvitation();
  }, [token]);

  async function verifyInvitation() {
    setLoading(true);
    setError("");

    if (!token) {
      setError(
        "This invitation link is missing its secure invitation token.",
      );
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/tenant-invitations?token=${encodeURIComponent(token)}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error || "This invitation could not be verified.",
        );
      }

      setInvitation(result.invitation);

      const s = supabase();

      const {
        data: { user },
      } = await s.auth.getUser();

      setCurrentUser(user || null);

      if (user) {
        setMode("accept");
      }
    } catch (err) {
      console.error(err);

      setError(
        err?.message || "This invitation could not be verified.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function acceptInvitation(accessToken) {
    setWorking(true);
    setError("");

    try {
      const response = await fetch("/api/tenant-invitations", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },

        body: JSON.stringify({
          token,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error || "The invitation could not be accepted.",
        );
      }

      router.replace("/dashboard");
    } catch (err) {
      console.error(err);

      setError(
        err?.message || "The invitation could not be accepted.",
      );
    } finally {
      setWorking(false);
    }
  }

  async function acceptAsCurrentUser() {
    const s = supabase();

    const {
      data: { session },
      error: sessionError,
    } = await s.auth.getSession();

    if (sessionError || !session?.access_token) {
      setError("Please sign in before accepting this invitation.");
      setCurrentUser(null);
      setMode("login");
      return;
    }

    await acceptInvitation(session.access_token);
  }

  async function signIn(e) {
    e.preventDefault();

    setWorking(true);
    setError("");

    try {
      const form = new FormData(e.currentTarget);

      const email = String(form.get("email") || "")
        .trim()
        .toLowerCase();

      const password = String(form.get("password") || "");

      if (!email || !password) {
        throw new Error("Enter your email and password.");
      }

      if (
        invitation?.tenantEmail &&
        email !== invitation.tenantEmail.toLowerCase()
      ) {
        throw new Error(
          `This invitation was sent to ${invitation.tenantEmail}. Please sign in with that email address.`,
        );
      }

      const s = supabase();

      const { data, error: loginError } =
        await s.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) {
        throw loginError;
      }

      if (!data?.session?.access_token) {
        throw new Error(
          "You signed in, but a valid session could not be created.",
        );
      }

      setCurrentUser(data.user);

      await acceptInvitation(data.session.access_token);
    } catch (err) {
      console.error(err);

      setError(err?.message || "Could not sign in.");
      setWorking(false);
    }
  }

  async function signUp(e) {
    e.preventDefault();

    setWorking(true);
    setError("");

    try {
      const form = new FormData(e.currentTarget);

      const name = String(form.get("name") || "").trim();

      const email = String(form.get("email") || "")
        .trim()
        .toLowerCase();

      const password = String(form.get("password") || "");

      const confirmPassword = String(
        form.get("confirmPassword") || "",
      );

      if (!name) {
        throw new Error("Enter your full name.");
      }

      if (!email) {
        throw new Error("Enter your email address.");
      }

      if (
        invitation?.tenantEmail &&
        email !== invitation.tenantEmail.toLowerCase()
      ) {
        throw new Error(
          `This invitation was sent to ${invitation.tenantEmail}. Please create your account using that email address.`,
        );
      }

      if (password.length < 6) {
        throw new Error(
          "Your password must contain at least 6 characters.",
        );
      }

      if (password !== confirmPassword) {
        throw new Error("Your passwords do not match.");
      }

      const s = supabase();

      const { data, error: signupError } = await s.auth.signUp({
        email,
        password,

        options: {
          data: {
            name,
            full_name: name,
            role: "tenant",
          },
        },
      });

      if (signupError) {
        throw signupError;
      }

      /*
       * If Supabase gives us a session immediately,
       * accept the invitation right away.
       */
      if (data?.session?.access_token) {
        setCurrentUser(data.user);

        await acceptInvitation(data.session.access_token);
        return;
      }

      /*
       * If email confirmation is enabled in Supabase,
       * the user must confirm the email before signing in.
       */
      setMode("confirm");

      setError("");
    } catch (err) {
      console.error(err);

      setError(err?.message || "Could not create your account.");
    } finally {
      setWorking(false);
    }
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <section style={styles.card}>
          <div style={styles.logo}>UNITVERO</div>

          <h1 style={styles.title}>Checking invitation...</h1>

          <p style={styles.subtitle}>
            Please wait while we verify your secure invitation.
          </p>
        </section>
      </main>
    );
  }

  if (error && !invitation) {
    return (
      <main style={styles.page}>
        <section style={styles.card}>
          <div style={styles.logo}>UNITVERO</div>

          <div style={styles.errorIcon}>!</div>

          <h1 style={styles.title}>Invitation unavailable</h1>

          <p style={styles.subtitle}>{error}</p>

          <button
            style={styles.secondaryButton}
            onClick={() => router.push("/login")}
          >
            Go to Sign In
          </button>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.logo}>UNITVERO</div>

        <div style={styles.badge}>TENANT INVITATION</div>

        <h1 style={styles.title}>
          Welcome to Unitvero
        </h1>

        <p style={styles.subtitle}>
          Your landlord invited you to securely access your rental
          information.
        </p>

        <div style={styles.inviteBox}>
          <div>
            <span style={styles.label}>Tenant</span>

            <strong style={styles.value}>
              {invitation?.tenantName || "Tenant"}
            </strong>
          </div>

          <div>
            <span style={styles.label}>Email</span>

            <strong style={styles.value}>
              {invitation?.tenantEmail}
            </strong>
          </div>

          <div>
            <span style={styles.label}>Invitation status</span>

            <strong style={styles.status}>
              {invitation?.status || "pending"}
            </strong>
          </div>
        </div>

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {mode === "accept" && currentUser && (
          <div>
            <div style={styles.signedInBox}>
              <span style={styles.label}>
                Signed in as
              </span>

              <strong style={styles.value}>
                {currentUser.email}
              </strong>
            </div>

            <button
              style={styles.primaryButton}
              type="button"
              disabled={working}
              onClick={acceptAsCurrentUser}
            >
              {working
                ? "Connecting your account..."
                : "Accept Invitation"}
            </button>

            <button
              style={styles.linkButton}
              type="button"
              onClick={async () => {
                const s = supabase();

                await s.auth.signOut();

                setCurrentUser(null);
                setMode("login");
                setError("");
              }}
            >
              Use a different account
            </button>
          </div>
        )}

        {mode === "signup" && !currentUser && (
          <form onSubmit={signUp}>
            <div style={styles.formGrid}>
              <label style={styles.field}>
                <span style={styles.label}>
                  Full Name
                </span>

                <input
                  style={styles.input}
                  name="name"
                  type="text"
                  defaultValue={invitation?.tenantName || ""}
                  autoComplete="name"
                  required
                />
              </label>

              <label style={styles.field}>
                <span style={styles.label}>
                  Email Address
                </span>

                <input
                  style={styles.input}
                  name="email"
                  type="email"
                  defaultValue={invitation?.tenantEmail || ""}
                  autoComplete="email"
                  readOnly
                  required
                />
              </label>

              <label style={styles.field}>
                <span style={styles.label}>
                  Create Password
                </span>

                <input
                  style={styles.input}
                  name="password"
                  type="password"
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  required
                />
              </label>

              <label style={styles.field}>
                <span style={styles.label}>
                  Confirm Password
                </span>

                <input
                  style={styles.input}
                  name="confirmPassword"
                  type="password"
                  placeholder="Enter password again"
                  autoComplete="new-password"
                  required
                />
              </label>
            </div>

            <button
              style={styles.primaryButton}
              type="submit"
              disabled={working}
            >
              {working
                ? "Creating account..."
                : "Create Account & Accept Invitation"}
            </button>

            <p style={styles.switchText}>
              Already have a Unitvero account?{" "}

              <button
                type="button"
                style={styles.inlineButton}
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
              >
                Sign in
              </button>
            </p>
          </form>
        )}

        {mode === "login" && !currentUser && (
          <form onSubmit={signIn}>
            <div style={styles.formGrid}>
              <label style={styles.field}>
                <span style={styles.label}>
                  Email Address
                </span>

                <input
                  style={styles.input}
                  name="email"
                  type="email"
                  defaultValue={invitation?.tenantEmail || ""}
                  autoComplete="email"
                  required
                />
              </label>

              <label style={styles.field}>
                <span style={styles.label}>
                  Password
                </span>

                <input
                  style={styles.input}
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </label>
            </div>

            <button
              style={styles.primaryButton}
              type="submit"
              disabled={working}
            >
              {working
                ? "Signing in..."
                : "Sign In & Accept Invitation"}
            </button>

            <p style={styles.switchText}>
              Need an account?{" "}

              <button
                type="button"
                style={styles.inlineButton}
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
              >
                Create one
              </button>
            </p>
          </form>
        )}

        {mode === "confirm" && (
          <div style={styles.confirmBox}>
            <div style={styles.successIcon}>✓</div>

            <h2 style={styles.confirmTitle}>
              Check your email
            </h2>

            <p style={styles.subtitle}>
              Your account was created. Confirm your email address,
              then return to this invitation and sign in to finish
              connecting your rental.
            </p>

            <button
              type="button"
              style={styles.primaryButton}
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              I Confirmed My Email
            </button>
          </div>
        )}

        <div style={styles.security}>
          <span>🔒</span>

          <span>
            This invitation is securely tied to the email address
            selected by your landlord.
          </span>
        </div>
      </section>
    </main>
  );
}

export default function TenantInvitePage() {
  return (
    <Suspense
      fallback={
        <main style={styles.page}>
          <section style={styles.card}>
            <div style={styles.logo}>UNITVERO</div>
            <h1 style={styles.title}>Loading invitation...</h1>
          </section>
        </main>
      }
    >
      <TenantInviteContent />
    </Suspense>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(145deg, #f7faf9 0%, #edf5f2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "620px",
    background: "#ffffff",
    border: "1px solid #e5ece9",
    borderRadius: "24px",
    padding: "42px",
    boxShadow: "0 24px 70px rgba(20, 55, 45, 0.08)",
  },

  logo: {
    fontWeight: "800",
    letterSpacing: "0.18em",
    color: "#173f35",
    marginBottom: "28px",
  },

  badge: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.12em",
    color: "#28816b",
    background: "#eaf7f3",
    padding: "7px 10px",
    borderRadius: "999px",
    marginBottom: "14px",
  },

  title: {
    margin: "0 0 10px",
    fontSize: "34px",
    lineHeight: "1.1",
    color: "#16372f",
  },

  subtitle: {
    color: "#71807b",
    lineHeight: "1.65",
    margin: "0 0 25px",
  },

  inviteBox: {
    display: "grid",
    gap: "18px",
    background: "#f8fbfa",
    border: "1px solid #e6efec",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "24px",
  },

  signedInBox: {
    display: "grid",
    gap: "5px",
    padding: "15px",
    background: "#f8fbfa",
    borderRadius: "12px",
    marginBottom: "16px",
  },

  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: "700",
    color: "#74827d",
    marginBottom: "7px",
  },

  value: {
    color: "#1c3f36",
    fontSize: "15px",
  },

  status: {
    color: "#25836b",
    textTransform: "capitalize",
  },

  formGrid: {
    display: "grid",
    gap: "17px",
  },

  field: {
    display: "block",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px",
    border: "1px solid #dce6e2",
    borderRadius: "11px",
    fontSize: "15px",
    outline: "none",
    background: "#ffffff",
  },

  primaryButton: {
    width: "100%",
    marginTop: "20px",
    border: "none",
    borderRadius: "12px",
    padding: "15px 18px",
    background: "#2a8b72",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "750",
    cursor: "pointer",
  },

  secondaryButton: {
    width: "100%",
    border: "1px solid #dce6e2",
    borderRadius: "12px",
    padding: "14px",
    background: "#ffffff",
    color: "#24483e",
    fontWeight: "700",
    cursor: "pointer",
  },

  linkButton: {
    width: "100%",
    border: "none",
    background: "transparent",
    marginTop: "14px",
    color: "#477267",
    cursor: "pointer",
  },

  inlineButton: {
    border: "none",
    background: "transparent",
    color: "#26826b",
    fontWeight: "800",
    cursor: "pointer",
    padding: "0",
  },

  switchText: {
    textAlign: "center",
    color: "#75837e",
    fontSize: "14px",
    marginTop: "18px",
  },

  errorBox: {
    padding: "13px 15px",
    background: "#fff4f2",
    border: "1px solid #f3d4ce",
    borderRadius: "11px",
    color: "#9a4438",
    marginBottom: "18px",
    lineHeight: "1.5",
  },

  errorIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "#fff0ed",
    color: "#a34c40",
    fontWeight: "900",
    fontSize: "22px",
    marginBottom: "20px",
  },

  successIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "#eaf7f3",
    color: "#27836b",
    fontWeight: "900",
    fontSize: "22px",
    marginBottom: "16px",
  },

  confirmBox: {
    textAlign: "center",
  },

  confirmTitle: {
    color: "#173f35",
    marginBottom: "10px",
  },

  security: {
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
    marginTop: "26px",
    paddingTop: "20px",
    borderTop: "1px solid #edf1ef",
    color: "#84908c",
    fontSize: "12px",
    lineHeight: "1.5",
  },
};
