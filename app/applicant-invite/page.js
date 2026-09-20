"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getLanguageDirection,
  getTranslation,
  normalizeLanguage,
} from "../lib/translations";

function ApplicantInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    const saved = normalizeLanguage(
      typeof window !== "undefined"
        ? window.localStorage.getItem("unitvero-language")
        : null,
    );
    setLocale(saved);
    verifyInvitation();
  }, [token]);

  const dir = getLanguageDirection(locale);
  const text = (key, fallback = "") => getTranslation(locale, key) || fallback;

  async function verifyInvitation() {
    setLoading(true);
    setError("");

    if (!token) {
      setError(text("invalidToken", "This invitation link is missing its secure invitation token."));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/applicant-invitations?token=${encodeURIComponent(token)}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || text("invitationUnavailable", "This invitation could not be verified."));
      }

      setInvitation(result.invitation);
    } catch (err) {
      console.error(err);
      setError(err?.message || text("invitationUnavailable", "This invitation could not be verified."));
    } finally {
      setLoading(false);
    }
  }

  async function submitApplication(e) {
    e.preventDefault();
    setWorking(true);
    setError("");

    try {
      const form = new FormData(e.currentTarget);
      const payload = {
        token,
        applicantName: String(form.get("applicantName") || "").trim(),
        applicantEmail: String(form.get("applicantEmail") || "").trim().toLowerCase(),
        applicantPhone: String(form.get("applicantPhone") || "").trim(),
        desiredMoveInDate: String(form.get("desiredMoveInDate") || "").trim(),
        currentAddress: String(form.get("currentAddress") || "").trim(),
        currentCity: String(form.get("currentCity") || "").trim(),
        currentState: String(form.get("currentState") || "").trim(),
        currentZip: String(form.get("currentZip") || "").trim(),
        employerName: String(form.get("employerName") || "").trim(),
        jobTitle: String(form.get("jobTitle") || "").trim(),
        monthlyIncome: String(form.get("monthlyIncome") || "").trim(),
        currentLandlordName: String(form.get("currentLandlordName") || "").trim(),
        currentLandlordPhone: String(form.get("currentLandlordPhone") || "").trim(),
        currentRent: String(form.get("currentRent") || "").trim(),
        referencesDetails: String(form.get("referencesDetails") || "").trim(),
        previousAddress: String(form.get("previousAddress") || "").trim(),
        additionalNotes: String(form.get("additionalNotes") || "").trim(),
        occupantsCount: String(form.get("occupantsCount") || "1").trim(),
        occupantsDetails: String(form.get("occupantsDetails") || "").trim(),
        hasPets: String(form.get("hasPets") || "no"),
        petsDetails: String(form.get("petsDetails") || "").trim(),
        vehiclesDetails: String(form.get("vehiclesDetails") || "").trim(),
        applicantConsent: form.get("applicantConsent") === "on",
      };

      if (!payload.applicantName || !payload.applicantEmail) {
        throw new Error(text("applicantNameRequired", "Please enter your full name and email address."));
      }

      if (!payload.applicantConsent) {
        throw new Error(text("consentRequired", "You must confirm the application information before submitting."));
      }

      if (
        invitation?.applicantEmail &&
        payload.applicantEmail.toLowerCase() !== invitation.applicantEmail.toLowerCase()
      ) {
        throw new Error(
          `This invitation was sent to ${invitation.applicantEmail}. Please use that email address.`,
        );
      }

      const response = await fetch("/api/applicant-invitations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || text("submissionFailed", "Your application could not be submitted."));
      }

      alert(text("submissionSuccess", "Application submitted successfully."));
      router.replace("/");
    } catch (err) {
      console.error(err);
      setError(err?.message || text("submissionFailed", "Your application could not be submitted."));
    } finally {
      setWorking(false);
    }
  }

  const pageStyle = {
    padding: "32px 16px 64px",
    fontFamily: "sans-serif",
    direction: dir,
    background: "linear-gradient(180deg, #0a0c0d 0%, #121516 100%)",
    color: "#f5efe3",
    minHeight: "100vh",
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div
          style={{
            maxWidth: 920,
            margin: "0 auto",
            border: "1px solid rgba(212,176,96,0.35)",
            borderRadius: 18,
            padding: "30px 22px",
            background: "rgba(18, 21, 22, 0.92)",
            boxShadow: "0 18px 50px rgba(0,0,0,0.32)",
          }}
        >
          {text("loadingWorkspace", "Verifying your invitation…")}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            border: "1px solid rgba(212,176,96,0.35)",
            borderRadius: 18,
            padding: "28px 22px",
            background: "rgba(18, 21, 22, 0.92)",
            boxShadow: "0 18px 50px rgba(0,0,0,0.32)",
          }}
        >
          <div style={{ color: "#d4b060", letterSpacing: 2, fontSize: 12, textTransform: "uppercase", marginBottom: 8 }}>
            {text("invitationUnavailable", "Invitation unavailable")}
          </div>
          <h1 style={{ fontSize: "2rem", margin: 0, marginBottom: 12, color: "#f5efe3" }}>{text("invitationUnavailable", "Invitation unavailable")}</h1>
          <p style={{ margin: 0, lineHeight: 1.7, color: "#dad5ca" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gap: 20,
            border: "1px solid rgba(212,176,96,0.35)",
            borderRadius: 22,
            padding: "28px 20px 24px",
            background: "rgba(18, 21, 22, 0.94)",
            boxShadow: "0 18px 50px rgba(0,0,0,0.32)",
          }}
        >
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ color: "#d4b060", letterSpacing: 2, fontSize: 12, textTransform: "uppercase" }}>UNITVERO</div>
            <h1 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3.1rem)", color: "#f5efe3" }}>
              {text("completeApplication", "Complete your rental application")}
            </h1>
            <p style={{ margin: 0, color: "#dad5ca", lineHeight: 1.6 }}>
              <span>{text("invitedFor", "Invited for")}: </span>
              <strong style={{ color: "#f7d37f" }}>{invitation?.applicantName || text("applicant", "Applicant")}</strong>
              <span> · {invitation?.applicantEmail}</span>
            </p>
          </div>

          <form onSubmit={submitApplication} style={{ display: "grid", gap: 18 }}>
            <section style={{ border: "1px solid rgba(212,176,96,0.26)", borderRadius: 18, padding: 20, background: "rgba(11,13,14,0.7)" }}>
              <h2 style={{ margin: "0 0 18px", color: "#f5efe3" }}>{text("applicantInformation", "Applicant Information")}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                <label style={fieldStyle}> {text("fullName", "Full Name")} *
                  <input name="applicantName" type="text" defaultValue={invitation?.applicantName || ""} required style={inputStyle} />
                </label>
                <label style={fieldStyle}> {text("emailAddress", "Email Address")} *
                  <input name="applicantEmail" type="email" defaultValue={invitation?.applicantEmail || ""} required style={inputStyle} />
                </label>
                <label style={fieldStyle}> {text("phoneNumber", "Phone Number")}
                  <input name="applicantPhone" type="tel" style={inputStyle} />
                </label>
                <label style={fieldStyle}> {text("desiredMoveInDate", "Desired Move-In Date")}
                  <input name="desiredMoveInDate" type="date" style={inputStyle} />
                </label>
                <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}> {text("currentStreetAddress", "Current Street Address")}
                  <input name="currentAddress" type="text" style={inputStyle} />
                </label>
                <label style={fieldStyle}> {text("city", "City")}
                  <input name="currentCity" type="text" style={inputStyle} />
                </label>
                <label style={fieldStyle}> {text("state", "State")}
                  <input name="currentState" type="text" style={inputStyle} />
                </label>
                <label style={fieldStyle}> {text("zipCode", "ZIP Code")}
                  <input name="currentZip" type="text" style={inputStyle} />
                </label>
              </div>
            </section>

            <section style={{ border: "1px solid rgba(212,176,96,0.26)", borderRadius: 18, padding: 20, background: "rgba(11,13,14,0.7)" }}>
              <h2 style={{ margin: "0 0 18px", color: "#f5efe3" }}>{text("employmentAndIncome", "Employment & Income")}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                <label style={fieldStyle}> {text("employer", "Employer")}
                  <input name="employerName" type="text" style={inputStyle} />
                </label>
                <label style={fieldStyle}> {text("jobTitle", "Job Title")}
                  <input name="jobTitle" type="text" style={inputStyle} />
                </label>
                <label style={fieldStyle}> {text("monthlyIncome", "Monthly Income")}
                  <input name="monthlyIncome" type="number" min="0" step="0.01" style={inputStyle} />
                </label>
              </div>
            </section>

            <section style={{ border: "1px solid rgba(212,176,96,0.26)", borderRadius: 18, padding: 20, background: "rgba(11,13,14,0.7)" }}>
              <h2 style={{ margin: "0 0 18px", color: "#f5efe3" }}>{text("rentalHistory", "Rental History")}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                <label style={fieldStyle}> {text("currentLandlord", "Current Landlord")}
                  <input name="currentLandlordName" type="text" style={inputStyle} />
                </label>
                <label style={fieldStyle}> {text("landlordPhone", "Landlord Phone")}
                  <input name="currentLandlordPhone" type="tel" style={inputStyle} />
                </label>
                <label style={fieldStyle}> {text("currentMonthlyRent", "Current Monthly Rent")}
                  <input name="currentRent" type="number" min="0" step="0.01" style={inputStyle} />
                </label>
                <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}> {text("references", "References")}
                  <textarea name="referencesDetails" rows="3" style={textareaStyle} />
                </label>
                <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}> {text("previousAddress", "Previous Address")}
                  <input name="previousAddress" type="text" style={inputStyle} />
                </label>
              </div>
            </section>

            <section style={{ border: "1px solid rgba(212,176,96,0.26)", borderRadius: 18, padding: 20, background: "rgba(11,13,14,0.7)" }}>
              <h2 style={{ margin: "0 0 18px", color: "#f5efe3" }}>{text("household", "Household")}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                <label style={fieldStyle}> {text("numberOfOccupants", "Number of Occupants")}
                  <input name="occupantsCount" type="number" min="1" defaultValue="1" style={inputStyle} />
                </label>
                <label style={fieldStyle}> {text("pets", "Pets")}
                  <select name="hasPets" defaultValue="no" style={inputStyle}>
                    <option value="no">{text("no", "No")}</option>
                    <option value="yes">{text("yes", "Yes")}</option>
                  </select>
                </label>
                <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}> {text("occupantDetails", "Occupant Details")}
                  <textarea name="occupantsDetails" rows="3" style={textareaStyle} />
                </label>
                <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}> {text("petDetails", "Pet Details")}
                  <textarea name="petsDetails" rows="3" style={textareaStyle} />
                </label>
                <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}> {text("vehicles", "Vehicles")}
                  <textarea name="vehiclesDetails" rows="3" style={textareaStyle} />
                </label>
                <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}> {text("additionalNotes", "Additional Notes")}
                  <textarea name="additionalNotes" rows="4" style={textareaStyle} />
                </label>
              </div>
            </section>

            <div style={{ border: "1px solid rgba(212,176,96,0.3)", borderRadius: 14, padding: 16, background: "rgba(25, 27, 24, 0.75)", display: "grid", gap: 12 }}>
              <strong style={{ color: "#f7d37f" }}>{text("consentConfirmation", "Please confirm the information below before submitting.")}</strong>
              <p style={{ margin: 0, lineHeight: 1.7, color: "#dad5ca" }}>
                {text("consentText", "I confirm that the information provided is accurate and I consent to submitting this rental application electronically.")}
              </p>
              <label style={{ display: "flex", alignItems: "center", gap: 10, color: "#f5efe3", fontWeight: 600 }}>
                <input name="applicantConsent" type="checkbox" value="on" />
                <span>{text("consentCheckbox", "I agree and confirm")}</span>
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, flexWrap: "wrap" }}>
              <button type="button" onClick={() => router.replace("/")} style={secondaryButtonStyle}>
                {text("cancel", "Cancel")}
              </button>
              <button type="submit" disabled={working} style={primaryButtonStyle}>
                {working ? text("submitting", "Submitting…") : text("submitApplication", "Submit Application")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const fieldStyle = {
  display: "grid",
  gap: 8,
  color: "#f5efe3",
  fontWeight: 600,
  fontSize: 14,
};

const inputStyle = {
  display: "block",
  width: "100%",
  marginTop: 2,
  padding: "11px 12px",
  borderRadius: 10,
  border: "1px solid rgba(212,176,96,0.4)",
  background: "rgba(14,17,18,0.8)",
  color: "#f5efe3",
  fontSize: 14,
  boxSizing: "border-box",
};

const textareaStyle = {
  ...inputStyle,
  minHeight: 90,
  resize: "vertical",
};

const primaryButtonStyle = {
  border: "none",
  borderRadius: 10,
  padding: "12px 20px",
  fontWeight: 700,
  fontSize: 14,
  background: "linear-gradient(135deg, #ceb16a 0%, #d9b863 35%, #765b24 100%)",
  color: "#120f0a",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  border: "1px solid rgba(212,176,96,0.4)",
  borderRadius: 10,
  padding: "12px 20px",
  fontWeight: 700,
  fontSize: 14,
  background: "transparent",
  color: "#f5efe3",
  cursor: "pointer",
};

export default function ApplicantInvitePage() {
  return (
    <Suspense fallback={<div style={{ padding: 32, color: "#f5efe3", background: "#0a0c0d" }}>Loading invitation…</div>}>
      <ApplicantInviteContent />
    </Suspense>
  );
}
