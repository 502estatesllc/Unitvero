"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ApplicantInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    verifyInvitation();
  }, [token]);

  async function verifyInvitation() {
    setLoading(true);
    setError("");

    if (!token) {
      setError("This invitation link is missing its secure invitation token.");
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
        throw new Error(result?.error || "This invitation could not be verified.");
      }

      setInvitation(result.invitation);
    } catch (err) {
      console.error(err);
      setError(err?.message || "This invitation could not be verified.");
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
        previousAddress: String(form.get("previousAddress") || "").trim(),
        occupantsCount: String(form.get("occupantsCount") || "1").trim(),
        occupantsDetails: String(form.get("occupantsDetails") || "").trim(),
        hasPets: String(form.get("hasPets") || "no"),
        petsDetails: String(form.get("petsDetails") || "").trim(),
        vehiclesDetails: String(form.get("vehiclesDetails") || "").trim(),
      };

      if (!payload.applicantName || !payload.applicantEmail) {
        throw new Error("Please enter your full name and email address.");
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
        throw new Error(result?.error || "Your application could not be submitted.");
      }

      alert("Application submitted successfully.");
      router.replace("/");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Your application could not be submitted.");
    } finally {
      setWorking(false);
    }
  }

  if (loading) {
    return <div style={{ padding: 32, fontFamily: "sans-serif" }}>Verifying your invitation…</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 32, fontFamily: "sans-serif", maxWidth: 640, margin: "0 auto" }}>
        <h1>Invitation unavailable</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, fontFamily: "sans-serif", maxWidth: 900, margin: "0 auto" }}>
      <h1>Complete your rental application</h1>
      <p>
        Invited for: <strong>{invitation?.applicantName || "Applicant"}</strong> · {invitation?.applicantEmail}
      </p>

      <form onSubmit={submitApplication} style={{ display: "grid", gap: 16 }}>
        <section style={{ border: "1px solid #dfe7e4", borderRadius: 12, padding: 20 }}>
          <h2>Applicant Information</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <label>Full Name *<input name="applicantName" type="text" defaultValue={invitation?.applicantName || ""} required style={{ display: "block", width: "100%", marginTop: 6, padding: 10 }} /></label>
            <label>Email Address *<input name="applicantEmail" type="email" defaultValue={invitation?.applicantEmail || ""} required style={{ display: "block", width: "100%", marginTop: 6, padding: 10 }} /></label>
            <label>Phone Number<input name="applicantPhone" type="tel" style={{ display: "block", width: "100%", marginTop: 6, padding: 10 }} /></label>
            <label>Current Street Address<input name="currentAddress" type="text" style={{ display: "block", width: "100%", marginTop: 6, padding: 10 }} /></label>
            <label>City<input name="currentCity" type="text" style={{ display: "block", width: "100%", marginTop: 6, padding: 10 }} /></label>
            <label>State<input name="currentState" type="text" style={{ display: "block", width: "100%", marginTop: 6, padding: 10 }} /></label>
            <label>ZIP Code<input name="currentZip" type="text" style={{ display: "block", width: "100%", marginTop: 6, padding: 10 }} /></label>
          </div>
        </section>

        <section style={{ border: "1px solid #dfe7e4", borderRadius: 12, padding: 20 }}>
          <h2>Employment & Income</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <label>Employer<input name="employerName" type="text" style={{ display: "block", width: "100%", marginTop: 6, padding: 10 }} /></label>
            <label>Job Title<input name="jobTitle" type="text" style={{ display: "block", width: "100%", marginTop: 6, padding: 10 }} /></label>
            <label>Monthly Income<input name="monthlyIncome" type="number" min="0" step="0.01" style={{ display: "block", width: "100%", marginTop: 6, padding: 10 }} /></label>
          </div>
        </section>

        <section style={{ border: "1px solid #dfe7e4", borderRadius: 12, padding: 20 }}>
          <h2>Rental History</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <label>Current Landlord<input name="currentLandlordName" type="text" style={{ display: "block", width: "100%", marginTop: 6, padding: 10 }} /></label>
            <label>Landlord Phone<input name="currentLandlordPhone" type="tel" style={{ display: "block", width: "100%", marginTop: 6, padding: 10 }} /></label>
            <label>Current Monthly Rent<input name="currentRent" type="number" min="0" step="0.01" style={{ display: "block", width: "100%", marginTop: 6, padding: 10 }} /></label>
            <label style={{ gridColumn: "1 / -1" }}>Previous Address<input name="previousAddress" type="text" style={{ display: "block", width: "100%", marginTop: 6, padding: 10 }} /></label>
          </div>
        </section>

        <section style={{ border: "1px solid #dfe7e4", borderRadius: 12, padding: 20 }}>
          <h2>Household</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <label>Number of Occupants<input name="occupantsCount" type="number" min="1" defaultValue="1" style={{ display: "block", width: "100%", marginTop: 6, padding: 10 }} /></label>
            <label>Pets<select name="hasPets" defaultValue="no" style={{ display: "block", width: "100%", marginTop: 6, padding: 10 }}><option value="no">No</option><option value="yes">Yes</option></select></label>
            <label style={{ gridColumn: "1 / -1" }}>Occupant Details<textarea name="occupantsDetails" rows="3" style={{ display: "block", width: "100%", marginTop: 6, padding: 10 }} /></label>
            <label style={{ gridColumn: "1 / -1" }}>Pet Details<textarea name="petsDetails" rows="3" style={{ display: "block", width: "100%", marginTop: 6, padding: 10 }} /></label>
            <label style={{ gridColumn: "1 / -1" }}>Vehicles<textarea name="vehiclesDetails" rows="3" style={{ display: "block", width: "100%", marginTop: 6, padding: 10 }} /></label>
          </div>
        </section>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button type="button" onClick={() => router.replace("/")}>Cancel</button>
          <button type="submit" disabled={working} style={{ padding: "10px 18px", background: "#1d7d68", color: "#fff", border: "none", borderRadius: 8 }}>
            {working ? "Submitting…" : "Submit Application"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ApplicantInvitePage() {
  return (
    <Suspense fallback={<div style={{ padding: 32 }}>Loading invitation…</div>}>
      <ApplicantInviteContent />
    </Suspense>
  );
}
