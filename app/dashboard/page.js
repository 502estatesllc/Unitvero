"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import StripeOnboarding from "./StripeOnboarding";

const COPY = {
  en: {
    overview: "Overview",
    properties: "Properties",
    tenants: "Tenants",
    rent: "Rent",
    payments: "Payments & Payouts",
    leases: "Leases",
    applications: "Applications",
    messages: "Messages",
    documents: "Documents",
    maintenance: "Maintenance",
    greeting: "Good to see you",
    portfolioUpdate: "Here's what’s happening with your portfolio.",
    addProperty: "+ Add Property",
    help: "Help",
    privacy: "Privacy",
  },
  es: {
    overview: "Resumen",
    properties: "Propiedades",
    tenants: "Inquilinos",
    rent: "Alquiler",
    payments: "Pagos y depósitos",
    leases: "Contratos",
    applications: "Solicitudes",
    messages: "Mensajes",
    documents: "Documentos",
    maintenance: "Mantenimiento",
    greeting: "Qué bueno verte",
    portfolioUpdate: "Esto es lo que está pasando con tu portafolio.",
    addProperty: "+ Agregar propiedad",
    help: "Ayuda",
    privacy: "Privacidad",
  },
};

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [accountReady, setAccountReady] = useState(false);
  const [props, setProps] = useState([]);
  const [units, setUnits] = useState([]);
  const [address, setAddress] = useState("");
  const [view, setView] = useState("overview");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedTenancy, setSelectedTenancy] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [tenancies, setTenancies] = useState([]);
  const [editingTenancy, setEditingTenancy] = useState(null);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const [propertySearch, setPropertySearch] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("all");

  const [rentCharges, setRentCharges] = useState([]);
  const [rentPayments, setRentPayments] = useState([]);
  const [paymentAllocations, setPaymentAllocations] = useState([]);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [rentSettings, setRentSettings] = useState(null);
  const [showRentSettings, setShowRentSettings] = useState(false);
  const [stripeOnboardingAccountId, setStripeOnboardingAccountId] =
    useState(null);
  const [paymentAccount, setPaymentAccount] = useState(null);
  const [onlineTransactions, setOnlineTransactions] = useState([]);
  const [landlordPayouts, setLandlordPayouts] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [maintenanceAttachments, setMaintenanceAttachments] = useState([]);
  const [maintenanceExpenses, setMaintenanceExpenses] = useState([]);
  const [bookkeepingYear, setBookkeepingYear] = useState(String(new Date().getFullYear()));
  const [bookkeepingMonth, setBookkeepingMonth] = useState("all");
  const [documents, setDocuments] = useState([]);
  const [documentTemplates, setDocumentTemplates] = useState([]);
  const [documentBuilderOpen, setDocumentBuilderOpen] = useState(false);
  const [documentBuilderType, setDocumentBuilderType] = useState("lease");
  const [documentBuilderPropertyId, setDocumentBuilderPropertyId] = useState("");
  const [documentBuilderState, setDocumentBuilderState] = useState("");
  const [documentBuilderTenancyId, setDocumentBuilderTenancyId] = useState("");
  const [documentBuilderTitle, setDocumentBuilderTitle] = useState("");
  const [documentBuilderNotes, setDocumentBuilderNotes] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signingDocument, setSigningDocument] = useState(null);
  const [signatureName, setSignatureName] = useState("");
  const [signatureImage, setSignatureImage] = useState("");
  const [signatureConsent, setSignatureConsent] = useState(false);
  const [signatureMode, setSignatureMode] = useState("draw");
  const [signatureSubmitting, setSignatureSubmitting] = useState(false);
  const [appLanguage, setAppLanguage] = useState("en");
  const [proScreenOpen, setProScreenOpen] = useState(false);
  const [rentalValueOpen, setRentalValueOpen] = useState(false);
  const [rentalPropertyId, setRentalPropertyId] = useState("");
  const [rentalMonthlyRent, setRentalMonthlyRent] = useState("");
  const [rentalCompRows, setRentalCompRows] = useState([
    { id: 1, address: "", rent: "", beds: "", baths: "", sqft: "" },
    { id: 2, address: "", rent: "", beds: "", baths: "", sqft: "" },
    { id: 3, address: "", rent: "", beds: "", baths: "", sqft: "" },
  ]);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [documentEditorOpen, setDocumentEditorOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [editingDocumentTitle, setEditingDocumentTitle] = useState("");
  const [editingDocumentType, setEditingDocumentType] = useState("custom");
  const [editingDocumentNotes, setEditingDocumentNotes] = useState("");
  const [subscription, setSubscription] = useState(null);
  const [entitlements, setEntitlements] = useState({});
  const [communicationTab, setCommunicationTab] = useState("messages");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [announcementAudience, setAnnouncementAudience] = useState("property");
  const [language, setLanguage] = useState("en");
  const [privacyMode, setPrivacyMode] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpDraft, setHelpDraft] = useState("");
  const [helpMessages, setHelpMessages] = useState([
    {
      id: "welcome",
      sender: "support",
      text: "Hi! I’m Unitvero Help. Ask me about properties, tenants, rent, payments, or applications.",
    },
  ]);

  const r = useRouter();

  const hasFeature = (featureKey) => Boolean(entitlements?.[featureKey]);

  function requirePro(featureKey, featureName) {
    if (hasFeature(featureKey)) return true;
    alert(`${featureName} is included with Unitvero Pro. Subscription checkout will be connected before launch.`);
    return false;
  }

  function bookkeepingDate(value) {
    if (!value) return null;
    const d = new Date(value.includes("T") ? value : `${value}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function bookkeepingMatchesDate(value) {
    const d = bookkeepingDate(value);
    if (!d) return false;
    const yearMatches = d.getFullYear() === Number(bookkeepingYear);
    const monthMatches =
      bookkeepingMonth === "all" ||
      d.getMonth() === Number(bookkeepingMonth);
    return yearMatches && monthMatches;
  }

  function exportBookkeepingCsv() {
    const rows = [
      ["Date", "Type", "Category", "Description", "Property", "Amount", "Tax Deductible"],
    ];

    const propertyName = (propertyId) => {
      const p = props.find((item) => item.id === propertyId);
      return p?.address || "";
    };

    rentPayments
      .filter((payment) => bookkeepingMatchesDate(payment.payment_date))
      .forEach((payment) => {
        rows.push([
          payment.payment_date || "",
          "Income",
          "Rent",
          payment.notes || "Rent payment",
          propertyName(payment.property_id),
          Number(payment.amount || 0).toFixed(2),
          "No",
        ]);
      });

    maintenanceExpenses
      .filter((expense) => bookkeepingMatchesDate(expense.expense_date))
      .forEach((expense) => {
        rows.push([
          expense.expense_date || "",
          "Expense",
          expense.category || "Repairs and maintenance",
          expense.description || "Maintenance expense",
          propertyName(expense.property_id),
          (-Number(expense.total_cost || 0)).toFixed(2),
          expense.include_in_tax_report ? "Yes" : "No",
        ]);
      });

    rows.sort((a, b) => String(a[0]).localeCompare(String(b[0])));

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `unitvero-bookkeeping-${bookkeepingYear}${bookkeepingMonth === "all" ? "" : `-${String(Number(bookkeepingMonth) + 1).padStart(2, "0")}`}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function loadEntitlements(s, landlordId) {
    const featureKeys = [
      "advanced_messaging", "announcements", "document_center",
      "state_template_library", "document_generation", "esignatures",
      "maintenance_accounting", "tax_reporting", "advanced_rent_collection",
      "automation", "advanced_analytics", "priority_support",
      "faster_payouts", "phone_notifications"
    ];
    const results = await Promise.all(featureKeys.map(async (featureKey) => {
      const { data, error } = await s.rpc("unitvero_has_feature", {
        p_landlord_id: landlordId,
        p_feature_key: featureKey,
      });
      return [featureKey, !error && data === true];
    }));
    setEntitlements(Object.fromEntries(results));

    const { data: subscriptionData } = await s
      .from("landlord_subscriptions")
      .select("*")
      .eq("landlord_id", landlordId)
      .maybeSingle();
    setSubscription(subscriptionData || { plan_code: "free", status: "active" });
  }

  const unitveroStates = [
    ["AL", "Alabama"],
    ["AK", "Alaska"],
    ["AZ", "Arizona"],
    ["AR", "Arkansas"],
    ["CA", "California"],
    ["CO", "Colorado"],
    ["CT", "Connecticut"],
    ["DE", "Delaware"],
    ["FL", "Florida"],
    ["GA", "Georgia"],
    ["HI", "Hawaii"],
    ["ID", "Idaho"],
    ["IL", "Illinois"],
    ["IN", "Indiana"],
    ["IA", "Iowa"],
    ["KS", "Kansas"],
    ["KY", "Kentucky"],
    ["LA", "Louisiana"],
    ["ME", "Maine"],
    ["MD", "Maryland"],
    ["MA", "Massachusetts"],
    ["MI", "Michigan"],
    ["MN", "Minnesota"],
    ["MS", "Mississippi"],
    ["MO", "Missouri"],
    ["MT", "Montana"],
    ["NE", "Nebraska"],
    ["NV", "Nevada"],
    ["NH", "New Hampshire"],
    ["NJ", "New Jersey"],
    ["NM", "New Mexico"],
    ["NY", "New York"],
    ["NC", "North Carolina"],
    ["ND", "North Dakota"],
    ["OH", "Ohio"],
    ["OK", "Oklahoma"],
    ["OR", "Oregon"],
    ["PA", "Pennsylvania"],
    ["RI", "Rhode Island"],
    ["SC", "South Carolina"],
    ["SD", "South Dakota"],
    ["TN", "Tennessee"],
    ["TX", "Texas"],
    ["UT", "Utah"],
    ["VT", "Vermont"],
    ["VA", "Virginia"],
    ["WA", "Washington"],
    ["WV", "West Virginia"],
    ["WI", "Wisconsin"],
    ["WY", "Wyoming"],
    ["DC", "District of Columbia"]
  ];

  function getPropertyState(property) {
    return String(
      property?.state_code ||
      property?.state ||
      property?.state_abbreviation ||
      ""
    ).trim().toUpperCase();
  }

  function documentTypeLabel(type) {
    const labels = {
      lease: "Residential Lease",
      lease_renewal: "Lease Renewal",
      late_rent_notice: "Late Rent Notice",
      notice_to_vacate: "Notice to Vacate",
      notice_of_entry: "Notice of Entry",
      rent_change_notice: "Rent Change Notice",
      lease_addendum: "Lease Addendum",
      move_in_out: "Move-In / Move-Out",
      custom: "Custom Document",
    };
    return labels[type] || "Rental Document";
  }

  function escapeDocumentText(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function buildDocumentHtml({ title, type, property, tenancy, notes, stateCode }) {
    const tenantName =
      tenancy?.tenant_name ||
      tenancy?.tenant_email ||
      "Tenant";

    const landlordName =
      profile?.full_name ||
      "Landlord / Property Manager";

    const propertyAddress = [
      property?.address,
      property?.city,
      property?.state,
      property?.zip_code,
    ].filter(Boolean).join(", ");

    const rent =
      tenancy?.rent_amount ??
      tenancy?.monthly_rent ??
      tenancy?.rent ??
      "";

    const deposit =
      tenancy?.security_deposit ??
      tenancy?.deposit_amount ??
      tenancy?.deposit ??
      "";

    const startDate =
      tenancy?.start_date ||
      tenancy?.lease_start ||
      tenancy?.lease_start_date ||
      "";

    const endDate =
      tenancy?.end_date ||
      tenancy?.lease_end ||
      tenancy?.lease_end_date ||
      "";

    const today = new Date().toLocaleDateString();
    const jurisdictionCode =
      String(stateCode || getPropertyState(property) || "").toUpperCase();
    const jurisdictionName =
      unitveroStates.find(([code]) => code === jurisdictionCode)?.[1] ||
      property?.state ||
      "State not selected";

    const safe = (value) =>
      String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const notesHtml = notes
      ? `<div class="section">
          <div class="sectionTitle">Additional Terms / Notes</div>
          <div class="bodyText">${safe(notes).replaceAll("\n", "<br>")}</div>
        </div>`
      : "";

    const signatureBlock = `
      <div class="signatureGrid">
        <div>
          <div class="signatureLine"></div>
          <div class="signatureLabel">${safe(landlordName)}</div>
          <div class="signatureMeta">Landlord / Authorized Representative</div>
          <div class="signatureMeta">Date: ____________________</div>
        </div>
        <div>
          <div class="signatureLine"></div>
          <div class="signatureLabel">${safe(tenantName)}</div>
          <div class="signatureMeta">Tenant / Recipient</div>
          <div class="signatureMeta">Date: ____________________</div>
        </div>
      </div>`;

    const propertySection = `
      <div class="section">
        <div class="sectionTitle">Property & Parties</div>
        <div class="infoGrid">
          <div class="infoItem"><span>Property</span><strong>${safe(propertyAddress || "Rental property")}</strong></div>
          <div class="infoItem"><span>Tenant</span><strong>${safe(tenantName)}</strong></div>
          ${rent !== "" ? `<div class="infoItem"><span>Monthly Rent</span><strong>$${safe(rent)}</strong></div>` : ""}
          ${deposit !== "" ? `<div class="infoItem"><span>Security Deposit</span><strong>$${safe(deposit)}</strong></div>` : ""}
          ${startDate ? `<div class="infoItem"><span>Lease Start</span><strong>${safe(startDate)}</strong></div>` : ""}
          ${endDate ? `<div class="infoItem"><span>Lease End</span><strong>${safe(endDate)}</strong></div>` : ""}
        </div>
      </div>`;

    let body = "";

    switch (type) {
      case "lease":
        body = `
          <div class="section">
            <div class="sectionTitle">Residential Lease Agreement</div>
            <p class="bodyText">This Residential Lease Agreement identifies the rental property, parties, and principal lease terms selected in Unitvero. The final agreement should include all terms required by the applicable jurisdiction and any property-specific addenda.</p>
          </div>
          ${propertySection}
          <div class="section">
            <div class="sectionTitle">Lease Terms</div>
            <div class="numbered">
              <p><b>1. Premises.</b> The rental premises are the property identified above.</p>
              <p><b>2. Rent.</b> The monthly rent shown above is the rent amount entered by the landlord in Unitvero. Payment timing and accepted payment methods should follow the executed lease and applicable requirements.</p>
              <p><b>3. Term.</b> The lease term is the start and end date shown above, subject to the executed agreement and applicable law.</p>
              <p><b>4. Security Deposit.</b> The security deposit amount shown above reflects the amount entered by the landlord and is subject to the applicable rules governing deposits.</p>
              <p><b>5. Property Rules.</b> Any additional property rules, utilities, occupants, pets, smoking restrictions, maintenance responsibilities, or other terms should be stated in the lease or an executed addendum.</p>
              <p><b>6. Notices.</b> Formal notices should be delivered using a method permitted by the applicable lease and jurisdiction.</p>
            </div>
          </div>
          ${notesHtml}
          ${signatureBlock}`;
        break;

      case "lease_renewal":
        body = `
          ${propertySection}
          <div class="section">
            <div class="sectionTitle">Renewal Terms</div>
            <p class="bodyText">The parties acknowledge the renewal information selected above. Any revised rent, term, deposit, utilities, occupants, or other material terms should be clearly stated before execution.</p>
            <div class="numbered">
              <p><b>1. Renewal Term.</b> The renewed term should be the dates entered and accepted by both parties.</p>
              <p><b>2. Rent.</b> The applicable monthly rent should be confirmed by the parties before signing.</p>
              <p><b>3. Continuing Terms.</b> Existing lease provisions remain subject to the original agreement, this renewal, and any applicable law unless expressly changed in writing.</p>
            </div>
          </div>
          ${notesHtml}
          ${signatureBlock}`;
        break;

      case "late_rent_notice":
        body = `
          ${propertySection}
          <div class="noticeBox"><b>PAYMENT NOTICE</b><br>This document records a written notice concerning a rent balance. Complete the balance, due date, and cure information before delivery.</div>
          <div class="section">
            <div class="sectionTitle">Balance Information</div>
            <div class="blankGrid">
              <div>Amount claimed due: <span>________________________</span></div>
              <div>Original due date: <span>________________________</span></div>
              <div>Date of notice: <span>${safe(today)}</span></div>
              <div>Payment / cure deadline: <span>________________________</span></div>
            </div>
          </div>
          <div class="section">
            <div class="sectionTitle">Notice</div>
            <p class="bodyText">Please review the account information above and address any balance using the payment method provided by the landlord. This notice is a record of the information supplied by the landlord and should be used only in a form and manner permitted by the applicable jurisdiction.</p>
          </div>
          ${notesHtml}
          ${signatureBlock}`;
        break;

      case "notice_to_vacate":
        body = `
          ${propertySection}
          <div class="noticeBox"><b>NOTICE TO VACATE / TERMINATION</b><br>Complete the effective date and delivery information before serving this notice.</div>
          <div class="section">
            <div class="sectionTitle">Effective Date</div>
            <div class="blankGrid">
              <div>Date of notice: <span>${safe(today)}</span></div>
              <div>Effective / move-out date: <span>________________________</span></div>
            </div>
          </div>
          <div class="section">
            <div class="sectionTitle">Notice</div>
            <p class="bodyText">This document provides written notice concerning the tenancy identified above. The landlord should confirm that the notice period, reason, delivery method, and wording comply with the applicable lease and jurisdiction before serving it.</p>
          </div>
          ${notesHtml}
          ${signatureBlock}`;
        break;

      case "notice_of_entry":
        body = `
          ${propertySection}
          <div class="section">
            <div class="sectionTitle">Planned Entry</div>
            <div class="blankGrid">
              <div>Entry date: <span>________________________</span></div>
              <div>Approximate time: <span>________________________</span></div>
              <div>Purpose of entry: <span>________________________</span></div>
            </div>
          </div>
          <div class="section">
            <div class="sectionTitle">Notice</div>
            <p class="bodyText">The landlord or authorized representative intends to request access to the premises for the purpose stated above. Entry should be conducted in accordance with the lease and applicable notice and access requirements.</p>
          </div>
          ${notesHtml}
          ${signatureBlock}`;
        break;

      case "rent_change_notice":
        body = `
          ${propertySection}
          <div class="section">
            <div class="sectionTitle">Rent Change</div>
            <div class="blankGrid">
              <div>Current monthly rent: <span>$________________________</span></div>
              <div>New monthly rent: <span>$________________________</span></div>
              <div>Effective date: <span>________________________</span></div>
            </div>
          </div>
          <div class="section">
            <div class="sectionTitle">Notice</div>
            <p class="bodyText">This document records a proposed change to the rental amount. The landlord should confirm the permitted timing, notice period, lease terms, and any applicable restrictions before delivering the notice.</p>
          </div>
          ${notesHtml}
          ${signatureBlock}`;
        break;

      case "lease_addendum":
        body = `
          ${propertySection}
          <div class="section">
            <div class="sectionTitle">Addendum Terms</div>
            <p class="bodyText">This addendum is intended to document additional or amended terms relating to the tenancy identified above. The terms below should be completed and agreed to by all required parties.</p>
            <div class="linedArea"></div>
          </div>
          ${notesHtml}
          ${signatureBlock}`;
        break;

      case "move_in_out":
        body = `
          ${propertySection}
          <div class="section">
            <div class="sectionTitle">Property Condition Checklist</div>
            <div class="checkGrid">
              ${["Entry / Doors","Living Areas","Kitchen","Bathrooms","Bedrooms","Flooring","Walls / Paint","Windows","Appliances","Exterior","Smoke / CO Devices","Other"].map(item => `<div><b>${safe(item)}</b><span>Condition: __________________</span><span>Notes: _____________________</span></div>`).join("")}
            </div>
          </div>
          ${notesHtml}
          ${signatureBlock}`;
        break;

      default:
        body = `
          ${propertySection}
          <div class="section">
            <div class="sectionTitle">Document Content</div>
            <p class="bodyText">Complete the document content below. This document was created from the information selected in Unitvero.</p>
            <div class="linedArea"></div>
          </div>
          ${notesHtml}
          ${signatureBlock}`;
    }

    return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${safe(title)}</title>
<style>
  @page { size: Letter; margin: 0.65in; }
  * { box-sizing:border-box; }
  body { margin:0; font-family: Arial, Helvetica, sans-serif; color:#172033; line-height:1.52; background:#fff; }
  .page { max-width:7.1in; margin:0 auto; }
  .brand { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #172033; padding-bottom:14px; margin-bottom:24px; }
  .brandName { font-size:22px; font-weight:900; letter-spacing:-.4px; }
  .brandSub { font-size:10px; color:#687386; margin-top:3px; text-transform:uppercase; letter-spacing:1.2px; }
  .docMeta { text-align:right; font-size:10px; color:#687386; }
  h1 { margin:0 0 7px; text-align:center; font-size:23px; letter-spacing:-.3px; }
  .subtitle { text-align:center; color:#687386; font-size:11px; margin-bottom:25px; }
  .section { margin:23px 0; break-inside:avoid; }
  .sectionTitle { font-size:12px; font-weight:900; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid #ccd5e1; padding-bottom:7px; margin-bottom:12px; }
  .infoGrid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .infoItem { border:1px solid #dce3ec; border-radius:7px; padding:10px 11px; }
  .infoItem span { display:block; font-size:9px; color:#687386; text-transform:uppercase; letter-spacing:.7px; margin-bottom:3px; }
  .infoItem strong { font-size:12px; }
  .bodyText { font-size:11px; }
  .numbered p { font-size:11px; margin:11px 0; }
  .noticeBox { border:1px solid #c8d3e0; background:#f5f7fa; padding:14px; border-radius:7px; font-size:11px; margin:18px 0; }
  .jurisdictionNotice { border:1px solid #d7e0ec; background:#f7f9fc; border-radius:7px; padding:10px 12px; margin-bottom:20px; font-size:9px; }
  .jurisdictionNotice b { display:block; font-size:10px; margin-bottom:3px; }
  .jurisdictionNotice span { color:#687386; }
  .blankGrid { display:grid; gap:12px; font-size:11px; }
  .blankGrid span { display:inline-block; min-width:220px; border-bottom:1px solid #8d98a8; padding-bottom:2px; }
  .signatureGrid { display:grid; grid-template-columns:1fr 1fr; gap:60px; margin-top:65px; break-inside:avoid; }
  .signatureLine { border-top:1px solid #172033; margin-bottom:7px; }
  .signatureLabel { font-size:11px; font-weight:800; }
  .signatureMeta { font-size:9px; color:#687386; margin-top:3px; }
  .linedArea { min-height:170px; border:1px solid #dce3ec; border-radius:7px; background:repeating-linear-gradient(to bottom, #fff 0, #fff 27px, #dfe5ec 28px); }
  .checkGrid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .checkGrid > div { border:1px solid #dce3ec; border-radius:7px; padding:10px; min-height:75px; }
  .checkGrid b { display:block; font-size:10px; text-transform:uppercase; letter-spacing:.6px; margin-bottom:7px; }
  .checkGrid span { display:block; font-size:9px; color:#5d697a; margin-top:4px; }
  .footer { margin-top:45px; padding-top:10px; border-top:1px solid #dce3ec; display:flex; justify-content:space-between; color:#7b8797; font-size:8px; }
  @media print {
    .page { max-width:none; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="brand">
    <div>
      <div class="brandName">UNITVERO</div>
      <div class="brandSub">Property Management & Rental Documents</div>
    </div>
    <div class="docMeta">
      Prepared ${safe(today)}<br>
      ${safe(jurisdictionName)}
    </div>
  </div>

  <h1>${safe(title)}</h1>
  <div class="subtitle">${safe(documentTypeLabel(type))}</div>

  <div class="jurisdictionNotice">
    <b>${safe(jurisdictionName)} template framework</b>
    <span>
      This document is generated for the selected jurisdiction. State and local
      requirements can change. Unitvero should only publish a jurisdiction-specific
      template as current after its legal/content review process is complete.
    </span>
  </div>

  ${body}

  <div class="footer">
    <span>Generated through Unitvero</span>
    <span>Document ID: ${safe((crypto?.randomUUID?.() || Date.now()).toString())}</span>
  </div>
</div>
</body>
</html>`;
  }

  function openDocumentEditor(documentRecord) {
    if (!documentRecord) return;

    setEditingDocument(documentRecord);
    setEditingDocumentTitle(documentRecord.title || "");
    setEditingDocumentType(documentRecord.document_type || "custom");
    setEditingDocumentNotes(documentRecord.description || "");
    setDocumentEditorOpen(true);
  }

  async function saveEditedDocument(e) {
    e.preventDefault();

    if (!editingDocument) return;

    const title = editingDocumentTitle.trim();
    const notes = editingDocumentNotes.trim();

    if (!title) {
      alert("Enter a document title.");
      return;
    }

    const property =
      props.find((item) => item.id === editingDocument.property_id) || {};
    const tenancy =
      tenancies.find((item) => item.id === editingDocument.tenancy_id) || {};

    const html = buildDocumentHtml({
      title,
      type: editingDocumentType,
      property,
      tenancy,
      notes,
      stateCode: getPropertyState(property),
    });

    const s = supabase();

    const { data: { user } } = await s.auth.getUser();

    if (!user) {
      alert("Please sign in again.");
      return;
    }

    const { data, error } = await s
      .from("documents")
      .update({
        title,
        description: notes,
        document_type: editingDocumentType,
        status: "draft",
        document_html: html,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingDocument.id)
      .eq("landlord_id", user.id)
      .select("*")
      .single();

    if (error) {
      alert("Could not save document changes: " + error.message);
      return;
    }

    const updated = { ...data, document_html: html, generated_html: html };

    setDocuments((current) =>
      current.map((documentRecord) =>
        documentRecord.id === updated.id ? updated : documentRecord
      )
    );

    setSelectedDocument(updated);
    setEditingDocument(updated);
    setDocumentEditorOpen(false);

    alert("Document changes saved.");

    // Give the landlord an immediate review/print option.
    const printWindow = window.open("", "_blank", "width=900,height=900");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
      }, 400);
    }
  }

  async function deleteSavedDocument(documentRecord) {
    if (!documentRecord) return;

    if (
      !window.confirm(
        "Delete this saved document? This cannot be undone."
      )
    ) {
      return;
    }

    const s = supabase();
    const { data: { user } } = await s.auth.getUser();

    if (!user) {
      alert("Please sign in again.");
      return;
    }

    const { error } = await s
      .from("documents")
      .delete()
      .eq("id", documentRecord.id)
      .eq("landlord_id", user.id);

    if (error) {
      alert("Could not delete document: " + error.message);
      return;
    }

    setDocuments((current) =>
      current.filter((documentRecordItem) => documentRecordItem.id !== documentRecord.id)
    );

    if (selectedDocument?.id === documentRecord.id) {
      setSelectedDocument(null);
    }

    alert("Document deleted.");
  }

  function openSignatureModal(documentRecord) {
    if (!documentRecord) return;

    setSigningDocument(documentRecord);
    setSignatureName("");
    setSignatureImage("");
    setSignatureConsent(false);
    setSignatureMode("draw");
    setSignatureModalOpen(true);
  }

  function drawSignatureOnCanvas(canvas, event) {
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const point = event.touches
      ? event.touches[0]
      : event;

    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#172033";

    ctx.lineTo(point.clientX - rect.left, point.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(point.clientX - rect.left, point.clientY - rect.top);
  }

  function clearSignatureCanvas() {
    const canvas = document.getElementById("unitveroSignatureCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
  }

  function captureSignatureCanvas() {
    const canvas = document.getElementById("unitveroSignatureCanvas");
    if (!canvas) return "";

    const blank = document.createElement("canvas");
    blank.width = canvas.width;
    blank.height = canvas.height;

    if (canvas.toDataURL() === blank.toDataURL()) {
      return "";
    }

    return canvas.toDataURL("image/png");
  }

  async function sendDocumentForSignature(documentRecord) {
    if (!documentRecord) return;

    const tenancy = tenancies.find((t) => t.id === documentRecord.tenancy_id);
    const email = tenancy?.tenant_email;

    if (!email) {
      alert("This tenant does not have an email address saved.");
      return;
    }

    const s = supabase();
    const { data: { user } } = await s.auth.getUser();

    if (!user) {
      alert("Please sign in again.");
      return;
    }

    const signingToken =
      crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const { error } = await s
      .from("documents")
      .update({
        status: "awaiting_signature",
        shared_with_tenant: true,
        signing_token: signingToken,
        sent_at: new Date().toISOString(),
      })
      .eq("id", documentRecord.id)
      .eq("landlord_id", user.id);

    if (error) {
      alert(
        "The signature request could not be sent. Your Documents table needs the e-sign fields enabled: " +
        error.message
      );
      return;
    }

    setDocuments((current) =>
      current.map((item) =>
        item.id === documentRecord.id
          ? {
              ...item,
              status: "awaiting_signature",
              shared_with_tenant: true,
              signing_token: signingToken,
              sent_at: new Date().toISOString(),
            }
          : item
      )
    );

    const subject = encodeURIComponent(
      `Signature requested: ${documentRecord.title || "Unitvero document"}`
    );

    const body = encodeURIComponent(
      `Hello ${tenancy?.tenant_name || "Tenant"},\n\n` +
      `A document from your landlord is ready for signature in Unitvero.\n\n` +
      `Document: ${documentRecord.title || "Unitvero document"}\n\n` +
      `Sign in to your Unitvero tenant portal to review and sign it.\n\n` +
      `Please do not reply to this automated message.`
    );

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;

    alert("Signature request created. The document is now awaiting the tenant's signature.");
  }

  async function completeDocumentSignature(e) {
    e.preventDefault();

    if (!signingDocument) return;

    if (!signatureConsent) {
      alert("The signer must agree to use the electronic signature.");
      return;
    }

    if (!signatureName.trim()) {
      alert("Enter the signer's full legal name.");
      return;
    }

    setSignatureSubmitting(true);

    try {
      const image =
        signatureMode === "draw"
          ? captureSignatureCanvas()
          : signatureImage;

      if (!image) {
        alert(
          signatureMode === "draw"
            ? "Draw your signature before signing."
            : "Upload a signature image before signing."
        );
        return;
      }

      const s = supabase();
      const { data: { user } } = await s.auth.getUser();

      if (!user) {
        alert("Please sign in again.");
        return;
      }

      const signatureId =
        crypto?.randomUUID?.() ||
        `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const signedAt = new Date().toISOString();

      // The dedicated signature record keeps the audit trail separate from
      // the document's main text and status.
      const { error: signatureError } = await s
        .from("document_signatures")
        .insert({
          id: signatureId,
          document_id: signingDocument.id,
          signer_id: user.id,
          signer_name: signatureName.trim(),
          signature_image: image,
          signed_at: signedAt,
          consented_to_electronic_signature: true,
          signature_method: signatureMode,
        });

      if (signatureError) {
        alert(
          "The signature could not be saved. Make sure the document_signatures table and its RLS policies are installed."
        );
        return;
      }

      const { data: updatedDocument, error: documentError } = await s
        .from("documents")
        .update({
          status: "signed",
          signed_at: signedAt,
          signed_by: user.id,
        })
        .eq("id", signingDocument.id)
        .select("*")
        .single();

      if (documentError) {
        alert("Signature was saved, but the document status could not be updated: " + documentError.message);
        return;
      }

      setDocuments((current) =>
        current.map((item) =>
          item.id === signingDocument.id
            ? { ...item, ...updatedDocument, signed_at: signedAt }
            : item
        )
      );

      setSignatureModalOpen(false);
      setSigningDocument(null);

      alert("Document signed successfully.");
    } finally {
      setSignatureSubmitting(false);
    }
  }

  async function createUnitveroDocument(e) {
    e.preventDefault();

    if (!hasFeature("document_center")) {
      requirePro("document_center", "Document Center");
      return;
    }

    const property = props.find((item) => item.id === documentBuilderPropertyId);
    const tenancy = tenancies.find((item) => item.id === documentBuilderTenancyId);

    if (!property) {
      alert("Select a property.");
      return;
    }

    if (!tenancy) {
      alert("Select a tenant.");
      return;
    }

    const title =
      documentBuilderTitle.trim() ||
      `${documentTypeLabel(documentBuilderType)} - ${tenancy.tenant_name || "Tenant"}`;

    const selectedStateCode =
      documentBuilderState || getPropertyState(property);

    if (!selectedStateCode) {
      alert("Select the property's state before creating the document.");
      return;
    }

    const html = buildDocumentHtml({
      title,
      type: documentBuilderType,
      property,
      tenancy,
      notes: documentBuilderNotes.trim(),
      stateCode: selectedStateCode,
    });

    const s = supabase();
    const { data: { user } } = await s.auth.getUser();

    if (!user) {
      alert("Please sign in again.");
      return;
    }

    const payload = {
      landlord_id: user.id,
      property_id: property.id,
      tenancy_id: tenancy.id,
      tenant_id: tenancy.tenant_id || null,
      title,
      description: documentBuilderNotes.trim() || documentTypeLabel(documentBuilderType),
      document_type: documentBuilderType,
      status: "draft",
      shared_with_tenant: false,
      document_html: html,
    };

    const { data, error } = await s
      .from("documents")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      alert("Could not save the document: " + error.message);
      return;
    }

    const generated = { ...data, document_html: html, generated_html: html };
    setDocuments((current) => [generated, ...current]);
    setSelectedDocument(generated);
    setDocumentBuilderOpen(false);

    // Open the finished document immediately so the landlord can review or print it.
    const printWindow = window.open("", "_blank", "width=900,height=900");
    if (!printWindow) {
      alert("Document saved. Your browser blocked the print window; open the document from the Documents list.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 400);

    setDocumentBuilderTitle("");
    setDocumentBuilderNotes("");
    setDocumentBuilderPropertyId("");
    setDocumentBuilderTenancyId("");
    setDocumentBuilderState("");
  }

  function printSavedDocument(documentRecord) {
    if (!documentRecord) return;

    const property =
      props.find((item) => item.id === documentRecord.property_id) || {};
    const tenancy =
      tenancies.find((item) => item.id === documentRecord.tenancy_id) || {};

    const html =
      documentRecord.document_html ||
      documentRecord.generated_html ||
      buildDocumentHtml({
        title: documentRecord.title || "Unitvero Document",
        type: documentRecord.document_type || "custom",
        property,
        tenancy,
        notes: documentRecord.description || "",
        stateCode: getPropertyState(property),
      });

    const printWindow = window.open("", "_blank", "width=900,height=900");
    if (!printWindow) {
      alert("Your browser blocked the print window.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 400);
  }

  function emailSavedDocument(documentRecord) {
    if (!documentRecord) return;

    const tenancy =
      tenancies.find((item) => item.id === documentRecord.tenancy_id) || {};
    const email = tenancy.tenant_email;

    if (!email) {
      alert("This tenant does not have an email address saved.");
      return;
    }

    const subject = encodeURIComponent(documentRecord.title || "Unitvero Document");
    const body = encodeURIComponent(
      `Hello ${tenancy.tenant_name || "Tenant"},\\n\\nYour document "${documentRecord.title || "Unitvero Document"}" is available in Unitvero.\\n\\nPlease sign in to your tenant portal to review the document.`
    );

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }


  const unitveroLanguages = [
    ["en", "English"],
    ["es", "Español"],
    ["fr", "Français"],
    ["de", "Deutsch"],
    ["pt", "Português"],
    ["zh", "中文"],
    ["ko", "한국어"],
    ["vi", "Tiếng Việt"],
    ["ar", "العربية"],
    ["ru", "Русский"],
  ];

  const languageLabels = {
    en: {
      help: "Help",
      home: "Home",
      payments: "Payments",
      maintenance: "Maintenance",
      documents: "Documents",
      messages: "Messages",
      bookkeeping: "Bookkeeping",
      upgrade: "Upgrade to Pro",
      propertyValue: "Rent Value",
    },
    es: {
      help: "Ayuda",
      home: "Inicio",
      payments: "Pagos",
      maintenance: "Mantenimiento",
      documents: "Documentos",
      messages: "Mensajes",
      bookkeeping: "Contabilidad",
      upgrade: "Actualizar a Pro",
      propertyValue: "Valor de renta",
    },
  };

  function uiLabel(key) {
    return languageLabels[appLanguage]?.[key] ||
      languageLabels.en[key] ||
      key;
  }

  function calculateRentalSuggestion(rows) {
    const values = rows
      .map((row) => Number(row.rent))
      .filter((value) => Number.isFinite(value) && value > 0);

    if (!values.length) {
      return { low: 0, high: 0, average: 0, median: 0, count: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    const middle = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2
        ? sorted[middle]
        : (sorted[middle - 1] + sorted[middle]) / 2;

    return {
      low: Math.min(...values),
      high: Math.max(...values),
      average,
      median,
      count: values.length,
    };
  }

  function addRentalCompRow() {
    setRentalCompRows((rows) => [
      ...rows,
      {
        id: Date.now(),
        address: "",
        rent: "",
        beds: "",
        baths: "",
        sqft: "",
      },
    ]);
  }

  function updateRentalCompRow(id, field, value) {
    setRentalCompRows((rows) =>
      rows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  }

  function removeRentalCompRow(id) {
    setRentalCompRows((rows) => rows.filter((row) => row.id !== id));
  }

  function openProScreen() {
    setProScreenOpen(true);
    setView("pro");
  }

  async function load() {
    const s = supabase();

    const {
      data: { user },
      error: userError,
    } = await s.auth.getUser();

    if (userError || !user) {
      alert("Auth error: " + (userError?.message || "No user found"));
      return;
    }

    const { data: p } = await s
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const resolvedProfile =
      p || {
        id: user.id,
        full_name: user.user_metadata?.full_name || "",
        role: user.user_metadata?.role || "landlord",
      };

    setProfile(resolvedProfile);
    setAccountReady(true);

    // Tenant accounts use the dedicated tenant portal below.
    // Do not run landlord-only queries for tenant users.
    if (String(resolvedProfile?.role || "").toLowerCase() === "tenant") {
      return;
    }

    await loadEntitlements(s, user.id);

    const { data: properties, error } = await s
      .from("properties")
      .select("*")
      .eq("landlord_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      alert("Could not load properties: " + error.message);
      return;
    }

    setProps(properties || []);

    const { data: unitData, error: unitError } = await s
      .from("units")
      .select("*")
      .eq("landlord_id", user.id)
      .order("unit_name", { ascending: true });

    if (unitError) {
      alert("Could not load units: " + unitError.message);
    } else {
      setUnits(unitData || []);
    }

    const { data: applicationData, error: applicationError } = await s
      .from("rental_applications")
      .select("*")
      .eq("landlord_id", user.id)
      .order("created_at", { ascending: false });

    if (applicationError) {
      alert("Could not load applications: " + applicationError.message);
    } else {
      setApplications(applicationData || []);
    }

    const propertyIds = (properties || []).map((property) => property.id);

    if (propertyIds.length === 0) {
      setTenancies([]);
    } else {
      const { data: tenancyData, error: tenancyError } = await s
        .from("tenancies")
        .select("*")
        .in("property_id", propertyIds);

      if (tenancyError) {
        alert("Could not load tenants: " + tenancyError.message);
      } else {
        setTenancies(tenancyData || []);
      }
    }

    const { data: chargeData, error: chargeError } = await s
      .from("rent_charges")
      .select("*")
      .eq("landlord_id", user.id)
      .order("due_date", { ascending: false });

    if (chargeError) {
      alert("Could not load rent charges: " + chargeError.message);
    } else {
      setRentCharges(chargeData || []);
    }

    const { data: paymentData, error: paymentError } = await s
      .from("rent_payments")
      .select("*")
      .eq("landlord_id", user.id)
      .order("payment_date", { ascending: false });

    if (paymentError) {
      alert("Could not load rent payments: " + paymentError.message);
    } else {
      setRentPayments(paymentData || []);
    }

    const { data: allocationData, error: allocationError } = await s
      .from("payment_allocations")
      .select("*")
      .eq("landlord_id", user.id)
      .order("created_at", { ascending: false });

    if (allocationError) {
      alert("Could not load payment allocations: " + allocationError.message);
    } else {
      setPaymentAllocations(allocationData || []);
    }
    const { data: rentSettingsData, error: rentSettingsError } = await s
      .from("rent_settings")
      .select("*")
      .eq("landlord_id", user.id)
      .maybeSingle();

    if (rentSettingsError) {
      alert("Could not load rent settings: " + rentSettingsError.message);
    } else {
      setRentSettings(rentSettingsData || null);
    }
    // =========================================================
    // UNITVERO PAYMENTS + PAYOUTS
    // =========================================================

    const { data: paymentAccountData, error: paymentAccountError } = await s
      .from("landlord_payment_accounts")
      .select("*")
      .eq("landlord_id", user.id)
      .maybeSingle();

    if (paymentAccountError) {
      console.error("Could not load payment account:", paymentAccountError);
    } else {
      setPaymentAccount(paymentAccountData || null);
    }

    const { data: onlineTransactionData, error: onlineTransactionError } =
      await s
        .from("online_rent_transactions")
        .select("*")
        .eq("landlord_id", user.id)
        .order("created_at", { ascending: false });

    if (onlineTransactionError) {
      console.error(
        "Could not load online transactions:",
        onlineTransactionError,
      );
    } else {
      setOnlineTransactions(onlineTransactionData || []);
    }

    const { data: payoutData, error: payoutError } = await s
      .from("landlord_payouts")
      .select("*")
      .eq("landlord_id", user.id)
      .order("created_at", { ascending: false });

    if (payoutError) {
      console.error("Could not load payouts:", payoutError);
    } else {
      setLandlordPayouts(payoutData || []);
    }

    const { data: paymentSettingsData, error: paymentSettingsError } = await s
      .from("payment_settings")
      .select("*")
      .eq("landlord_id", user.id)
      .maybeSingle();

    if (paymentSettingsError) {
      console.error("Could not load payment settings:", paymentSettingsError);
    } else {
      setPaymentSettings(paymentSettingsData || null);
    }
    // Load landlord conversations
    const { data: conversationData, error: conversationError } = await s
      .from("conversations")
      .select("*")
      .eq("landlord_id", user.id)
      .order("updated_at", { ascending: false });

    if (conversationError) {
      console.error("Could not load conversations:", conversationError);
    } else {
      setConversations(conversationData || []);
    }

    // Load landlord messages
    const { data: messageData, error: messageError } = await s
      .from("messages")
      .select("*")
      .eq("landlord_id", user.id)
      .order("created_at", { ascending: true });

    if (messageError) {
      console.error("Could not load messages:", messageError);
    } else {
      setMessages(messageData || []);
    }

    // Load landlord announcements
    const { data: announcementData, error: announcementError } = await s
      .from("announcements")
      .select("*")
      .eq("landlord_id", user.id)
      .order("created_at", { ascending: false });

    if (announcementError) {
      console.error("Could not load announcements:", announcementError);
    } else {
      setAnnouncements(announcementData || []);
    }

    const [maintenanceResult, expenseResult, documentResult, templateResult] = await Promise.all([
      s.from("maintenance_requests").select("*").order("created_at", { ascending: false }),
      s.from("maintenance_expenses").select("*").eq("landlord_id", user.id).order("expense_date", { ascending: false }),
      s.from("documents").select("*").eq("landlord_id", user.id).order("created_at", { ascending: false }),
      s.from("document_templates").select("*").eq("is_active", true).order("name", { ascending: true }),
    ]);

    if (maintenanceResult.error) console.error("Could not load maintenance:", maintenanceResult.error);
    else setMaintenanceRequests(maintenanceResult.data || []);

    const { data: attachmentData, error: attachmentError } = await s
      .from("maintenance_request_attachments")
      .select("*")
      .order("created_at", { ascending: true });

    if (attachmentError) {
      console.error("Could not load maintenance photos:", attachmentError);
      setMaintenanceAttachments([]);
    } else {
      const signedAttachments = await Promise.all(
        (attachmentData || []).map(async (attachment) => {
          const { data: signedData } = await s.storage
            .from("unitvero-media")
            .createSignedUrl(attachment.file_path, 60 * 60);
          return { ...attachment, signed_url: signedData?.signedUrl || null };
        })
      );
      setMaintenanceAttachments(signedAttachments);
    }

    if (expenseResult.error) console.error("Could not load maintenance expenses:", expenseResult.error);
    else setMaintenanceExpenses(expenseResult.data || []);
    if (documentResult.error) console.error("Could not load documents:", documentResult.error);
    else setDocuments(documentResult.data || []);
    if (templateResult.error) console.error("Could not load templates:", templateResult.error);
    else setDocumentTemplates(templateResult.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("unitvero-language");
    const savedPrivacy = window.localStorage.getItem("unitvero-privacy");

    if (savedLanguage === "en" || savedLanguage === "es") {
      setLanguage(savedLanguage);
    }

    if (savedPrivacy === "true") {
      setPrivacyMode(true);
    }
  }, []);

  function changeLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    window.localStorage.setItem("unitvero-language", nextLanguage);
  }

  function togglePrivacy() {
    setPrivacyMode((current) => {
      const next = !current;
      window.localStorage.setItem("unitvero-privacy", String(next));
      return next;
    });
  }

  async function add(e) {
    e.preventDefault();

    const s = supabase();

    const {
      data: { user },
      error: userError,
    } = await s.auth.getUser();

    if (userError || !user) {
      alert("Authentication error: " + (userError?.message || "No user found"));
      return;
    }

    const { error } = await s.from("properties").insert({
      landlord_id: user.id,
      address: address,
      city: "Louisville",
      state: "KY",
      zip_code: "40211",
      monthly_rent: 0,
    });

    if (error) {
      alert("Could not add property: " + error.message);
      return;
    }

    alert("Property added successfully!");
    setAddress("");
    await load();
  }

  async function updateProperty(e) {
    e.preventDefault();

    if (!selectedProperty) return;

    const form = e.currentTarget;
    const updates = {
      address: form.address.value.trim(),
      city: form.city.value.trim(),
      state: form.state.value.trim().toUpperCase(),
      zip_code: form.zipCode.value.trim(),
      monthly_rent: Number(form.monthlyRent.value || 0),
    };

    const s = supabase();
    const { data, error } = await s
      .from("properties")
      .update(updates)
      .eq("id", selectedProperty.id)
      .select()
      .single();

    if (error) {
      alert("Could not update property: " + error.message);
      return;
    }

    setSelectedProperty(data);
    setProps((current) =>
      current.map((property) => (property.id === data.id ? data : property)),
    );
    setView("propertyDetails");
    alert("Property updated successfully!");
  }

  async function loadTenancy(propertyId) {
    const s = supabase();

    const { data, error } = await s
      .from("tenancies")
      .select("*")
      .eq("property_id", propertyId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (error) {
      alert("Could not load tenant: " + error.message);
      return;
    }

    setSelectedTenancy(data || null);
  }

  async function saveTenant(e) {
    e.preventDefault();

    if (!editingTenancy) return;

    const form = e.currentTarget;

    const tenantName = form.tenantName.value.trim();
    const tenantEmail = form.tenantEmail.value.trim();
    const tenantPhone = form.tenantPhone.value.trim();
    const monthlyRent = Number(form.monthlyRent.value);
    const startDate = form.startDate.value;
    const endDate = form.endDate.value || null;

    if (endDate && endDate < startDate) {
      alert("Lease end date cannot be before the lease start date.");
      return;
    }

    const s = supabase();

    const { data, error } = await s
      .from("tenancies")
      .update({
        tenant_name: tenantName,
        tenant_email: tenantEmail,
        tenant_phone: tenantPhone,
        monthly_rent: monthlyRent,
        start_date: startDate,
        end_date: endDate,
      })
      .eq("id", editingTenancy.id)
      .select()
      .maybeSingle();

    if (error) {
      alert("Could not update tenant: " + error.message);
      return;
    }

    setEditingTenancy(data);

    if (selectedTenancy?.id === data.id) {
      setSelectedTenancy(data);
    }

    await load();
    alert("Tenant updated successfully!");
    setView("tenants");
  }

    async function deleteTenant(tenancy) {
    if (!tenancy?.id) {
      alert("Tenant record could not be found.");
      return;
    }

    const tenantName =
      tenancy.tenant_name ||
      tenancy.tenant_email ||
      "this tenant";

    const confirmed = window.confirm(
      `Delete ${tenantName}?\n\nThis will remove this tenant from the property. This action cannot be undone.`
    );

    if (!confirmed) return;

    const s = supabase();

    const { error } = await s
      .from("tenancies")
      .delete()
      .eq("id", tenancy.id);

    if (error) {
      alert("Could not delete tenant: " + error.message);
      return;
    }

    setTenancies((current) =>
      current.filter((item) => item.id !== tenancy.id)
    );

    if (selectedTenancy?.id === tenancy.id) {
      setSelectedTenancy(null);
    }

    if (editingTenancy?.id === tenancy.id) {
      setEditingTenancy(null);
    }

    alert(`${tenantName} was deleted successfully.`);
  }

  async function openOrCreateConversation(tenancyId) {
    if (!requirePro("advanced_messaging", "Advanced Messaging")) return;
    if (!tenancyId) return;

    const tenancy = tenancies.find((item) => item.id === tenancyId);
    if (!tenancy) {
      alert("Tenant record could not be found.");
      return;
    }

    const existing = conversations.find(
      (conversation) => conversation.tenancy_id === tenancyId,
    );

    if (existing) {
      setSelectedConversation(existing);
      setCommunicationTab("messages");
      setView("messages");
      return;
    }

    const property = props.find(
      (item) => item.id === tenancy.property_id,
    );

    if (!property?.landlord_id) {
      alert("Property owner information could not be found.");
      return;
    }

    const s = supabase();

    const { data, error } = await s
      .from("conversations")
      .insert({
        landlord_id: property.landlord_id,
        property_id: tenancy.property_id,
        tenancy_id: tenancy.id,
        subject: tenancy.tenant_name || tenancy.tenant_email || "Tenant",
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      alert("Could not start conversation: " + error.message);
      return;
    }

    setConversations((current) => [data, ...current]);
    setSelectedConversation(data);
    setCommunicationTab("messages");
    setView("messages");
  }

  async function sendMessage(e) {
    e.preventDefault();

    if (!selectedConversation) {
      alert("Select a conversation first.");
      return;
    }

    const form = e.currentTarget;
    const messageText = form.message.value.trim();

    if (!messageText) return;

    const s = supabase();

    const {
      data: { user },
      error: userError,
    } = await s.auth.getUser();

    if (userError || !user) {
      alert("Authentication error: " + (userError?.message || "No user found"));
      return;
    }

    const { error } = await s.from("messages").insert({
      conversation_id: selectedConversation.id,
      landlord_id: user.id,
      sender_type: "landlord",
      sender_user_id: user.id,
      message: messageText,
    });

    if (error) {
      alert("Could not send message: " + error.message);
      return;
    }

    await s
      .from("conversations")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedConversation.id);

    form.reset();

    const conversationId = selectedConversation.id;

    await load();

    setSelectedConversation((current) =>
      current?.id === conversationId
        ? current
        : conversations.find(
            (conversation) => conversation.id === conversationId,
          ) || selectedConversation,
    );
  }

  async function createAnnouncement(e) {
    e.preventDefault();

    const form = e.currentTarget;

    const title = form.title.value.trim();
    const messageText = form.message.value.trim();
    const priority = form.priority.value;
    const expiresAt = form.expiresAt.value;

    if (!title || !messageText) {
      alert("Enter an announcement title and message.");
      return;
    }

    const s = supabase();

    const {
      data: { user },
      error: userError,
    } = await s.auth.getUser();

    if (userError || !user) {
      alert("Authentication error: " + (userError?.message || "No user found"));
      return;
    }

    let propertyId = null;
    let tenancyId = null;

    if (announcementAudience === "property") {
      propertyId = form.propertyId.value || null;

      if (!propertyId) {
        alert("Select a property.");
        return;
      }
    }

    if (announcementAudience === "tenant") {
      tenancyId = form.tenancyId.value || null;

      if (!tenancyId) {
        alert("Select a tenant.");
        return;
      }

      const tenancy = tenancies.find((item) => item.id === tenancyId);

      propertyId = tenancy?.property_id || null;
    }

    const { error } = await s.from("announcements").insert({
      landlord_id: user.id,
      property_id: propertyId,
      tenancy_id: tenancyId,
      title,
      message: messageText,
      priority,
      audience: announcementAudience,
      expires_at: expiresAt
        ? new Date(expiresAt + "T23:59:59").toISOString()
        : null,
    });

    if (error) {
      alert("Could not create announcement: " + error.message);
      return;
    }

    form.reset();
    setAnnouncementAudience("property");

    await load();

    alert("Announcement created.");
  }
  async function deleteMaintenanceRequest(request) {
    const confirmed = window.confirm(
      "Delete this maintenance request? This will permanently remove the request, its repair expense record, and its uploaded photos."
    );
    if (!confirmed) return;

    const s = supabase();

    const { data: { user } } = await s.auth.getUser();
    if (!user) {
      alert("Please sign in again.");
      return;
    }

    try {
      // Remove uploaded files first so deleted requests do not leave orphaned
      // private storage files behind.
      const attachments = maintenanceAttachments.filter(
        (attachment) => attachment.maintenance_request_id === request.id
      );

      const filePaths = attachments
        .map((attachment) => attachment.file_path)
        .filter(Boolean);

      if (filePaths.length) {
        const { error: storageError } = await s.storage
          .from("unitvero-media")
          .remove(filePaths);

        if (storageError) {
          console.warn("Could not remove some maintenance photos:", storageError);
        }
      }

      // Remove attachment records.
      const { error: attachmentDeleteError } = await s
        .from("maintenance_request_attachments")
        .delete()
        .eq("maintenance_request_id", request.id);

      if (attachmentDeleteError) {
        throw new Error(
          "Could not remove maintenance photo records: " +
          attachmentDeleteError.message
        );
      }

      // Remove bookkeeping/repair-expense records tied to this request.
      const { error: expenseDeleteError } = await s
        .from("maintenance_expenses")
        .delete()
        .eq("maintenance_request_id", request.id);

      if (expenseDeleteError) {
        throw new Error(
          "Could not remove the maintenance expense record: " +
          expenseDeleteError.message
        );
      }

      // Finally remove the maintenance request itself.
      const { error: requestDeleteError } = await s
        .from("maintenance_requests")
        .delete()
        .eq("id", request.id)
        .eq("landlord_id", user.id);

      if (requestDeleteError) {
        throw new Error(
          "Could not delete the maintenance request: " +
          requestDeleteError.message
        );
      }

      alert("Maintenance request deleted.");
      await load();
    } catch (error) {
      console.error("Delete maintenance request failed:", error);
      alert(error?.message || "Could not delete the maintenance request.");
    }
  }

  async function updateMaintenanceStatus(requestId, status) {
    const s = supabase();
    const patch = { status };
    if (status === "completed") patch.completed_at = new Date().toISOString();
    const { error } = await s.from("maintenance_requests").update(patch).eq("id", requestId);
    if (error) return alert("Could not update maintenance request: " + error.message);
    await load();
  }

  async function saveMaintenanceExpense(e, request) {
    e.preventDefault();
    if (!requirePro("maintenance_accounting", "Maintenance Accounting")) return;
    const form = e.currentTarget;
    const s = supabase();
    const { data: { user } } = await s.auth.getUser();
    if (!user) return alert("Please sign in again.");
    const payload = {
      maintenance_request_id: request.id,
      landlord_id: user.id,
      property_id: request.property_id,
      expense_date: form.expenseDate.value || new Date().toISOString().slice(0,10),
      vendor_name: form.vendorName.value.trim() || null,
      description: form.description.value.trim() || null,
      labor_cost: Number(form.laborCost.value || 0),
      material_cost: Number(form.materialCost.value || 0),
      other_cost: Number(form.otherCost.value || 0),
      category: "Repairs and maintenance",
      include_in_tax_report: form.includeTax.checked,
    };
    const existing = maintenanceExpenses.find(x => x.maintenance_request_id === request.id);
    const query = existing
      ? s.from("maintenance_expenses").update(payload).eq("id", existing.id)
      : s.from("maintenance_expenses").insert(payload);
    const { error } = await query;
    if (error) return alert("Could not save repair expense: " + error.message);
    alert("Repair expense saved.");
    await load();
  }

  async function connectStripeAccount() {
    try {
      const s = supabase();

      const {
        data: { user },
        error: userError,
      } = await s.auth.getUser();

      if (userError || !user) {
        alert("Please sign in again.");
        return;
      }

      let accountId = paymentAccount?.stripe_account_id;

      if (!accountId) {
        const response = await fetch("/api/create-connect-account", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not create payout account.");
        }

        accountId = data.accountId;

        const { error: saveError } = await s
          .from("landlord_payment_accounts")
          .upsert(
            {
              landlord_id: user.id,
              provider: "stripe",
              stripe_account_id: accountId,
              onboarding_complete: false,
              charges_enabled: false,
              payouts_enabled: false,
              details_submitted: false,
            },
            {
              onConflict: "landlord_id",
            },
          );

        if (saveError) {
          throw new Error(saveError.message);
        }

        setPaymentAccount((current) => ({
          ...(current || {}),
          landlord_id: user.id,
          provider: "stripe",
          stripe_account_id: accountId,
        }));
      }

      setStripeOnboardingAccountId(accountId);
    } catch (error) {
      console.error("Stripe onboarding error:", error);

      alert(error?.message || "Could not start payout setup.");
    }
  }

  function sendHelpMessage(e) {
    e.preventDefault();

    const text = helpDraft.trim();
    if (!text) return;

    const lower = text.toLowerCase();
    let reply =
      "Thanks — your question is noted. For account-specific help, include the page you are on and what you expected to happen.";

    if (lower.includes("property")) {
      reply =
        "Open Properties to add a property or select one to manage its tenants, rent, units, and market insights.";
    } else if (lower.includes("tenant")) {
      reply =
        "Open Tenants to review renters. You can also open a property first and choose Add Tenant.";
    } else if (lower.includes("rent") || lower.includes("payment")) {
      reply =
        "Use Rent for charges and payment records. Use Payments & Payouts for online transactions and bank deposits.";
    } else if (lower.includes("application")) {
      reply =
        "Open Applications to create, review, approve, or reject a rental application.";
    }

    const sentAt = Date.now();
    setHelpMessages((current) => [
      ...current,
      { id: `user-${sentAt}`, sender: "user", text },
      { id: `support-${sentAt}`, sender: "support", text: reply },
    ]);
    setHelpDraft("");
  }

  async function out() {
    await supabase().auth.signOut();
    r.push("/login");
  }

  function unitsForProperty(propertyId) {
    return units.filter((unit) => unit.property_id === propertyId);
  }

  function isMultiFamily(property) {
    return Number(property.total_units || 1) > 1;
  }

  function activeTenancyForProperty(propertyId) {
    return tenancies.find(
      (tenancy) =>
        tenancy.property_id === propertyId && tenancy.status === "active",
    );
  }

  const occupiedPropertyCount = props.filter((property) =>
    activeTenancyForProperty(property.id),
  ).length;

  const vacantPropertyCount = props.length - occupiedPropertyCount;

  const portfolioMonthlyRent = props.reduce(
    (total, property) => total + Number(property.monthly_rent || 0),
    0,
  );

  const filteredProperties = props.filter((property) => {
    const tenancy = activeTenancyForProperty(property.id);
    const occupied = Boolean(tenancy);

    const searchText = propertySearch.trim().toLowerCase();

    const propertyText = `
      ${property.address || ""}
      ${property.city || ""}
      ${property.state || ""}
      ${property.zip_code || ""}
    `.toLowerCase();

    const matchesSearch = !searchText || propertyText.includes(searchText);

    const matchesFilter =
      propertyFilter === "all" ||
      (propertyFilter === "occupied" && occupied) ||
      (propertyFilter === "vacant" && !occupied);

    return matchesSearch && matchesFilter;
  });
  // REAL DASHBOARD FINANCIAL + OCCUPANCY DATA
  const dashboardCompletedPayments = rentPayments.filter(
    (payment) => payment.status === "completed",
  );

  const dashboardCompletedPaymentIds = new Set(
    dashboardCompletedPayments.map((payment) => payment.id),
  );

  const dashboardActiveCharges = rentCharges.filter(
    (charge) => charge.status !== "waived",
  );

  const dashboardValidAllocations = paymentAllocations.filter((allocation) =>
    dashboardCompletedPaymentIds.has(allocation.payment_id),
  );

  const dashboardTotalCharges = dashboardActiveCharges.reduce(
    (total, charge) => total + Number(charge.amount || 0),
    0,
  );

  const dashboardCollected = dashboardCompletedPayments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0,
  );

  const dashboardAllocated = dashboardValidAllocations.reduce(
    (total, allocation) => total + Number(allocation.amount || 0),
    0,
  );

  const dashboardOutstanding = Math.max(
    dashboardTotalCharges - dashboardAllocated,
    0,
  );

  const dashboardCollectionRate =
    dashboardTotalCharges > 0
      ? Math.min(
          Math.round((dashboardAllocated / dashboardTotalCharges) * 100),
          100,
        )
      : 0;

  const multiFamilyPropertyIds = new Set(
    props
      .filter((property) => isMultiFamily(property))
      .map((property) => property.id),
  );

  const singleFamilyProperties = props.filter(
    (property) => !multiFamilyPropertyIds.has(property.id),
  );

  const occupiedSingleFamily = singleFamilyProperties.filter((property) =>
    activeTenancyForProperty(property.id),
  ).length;

  const occupiedMultiUnits = units.filter(
    (unit) =>
      multiFamilyPropertyIds.has(unit.property_id) &&
      unit.status === "occupied",
  ).length;

  const multiFamilyUnitCount = props
    .filter((property) => multiFamilyPropertyIds.has(property.id))
    .reduce(
      (total, property) =>
        total +
        Math.max(
          Number(property.total_units || 0),
          unitsForProperty(property.id).length,
        ),
      0,
    );

  const dashboardTotalUnits =
    singleFamilyProperties.length + multiFamilyUnitCount;

  const dashboardOccupiedUnits = occupiedSingleFamily + occupiedMultiUnits;

  const dashboardVacantUnits = Math.max(
    dashboardTotalUnits - dashboardOccupiedUnits,
    0,
  );

  const dashboardOccupancyRate =
    dashboardTotalUnits > 0
      ? Math.round((dashboardOccupiedUnits / dashboardTotalUnits) * 100)
      : 0;

  const dashboardMonthData = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();

    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));

    const year = date.getFullYear();
    const month = date.getMonth();

    const amount = dashboardCompletedPayments
      .filter((payment) => {
        const paymentDate = new Date(`${payment.payment_date}T00:00:00`);

        return (
          paymentDate.getFullYear() === year && paymentDate.getMonth() === month
        );
      })
      .reduce((total, payment) => total + Number(payment.amount || 0), 0);

    return {
      label: date.toLocaleDateString("en-US", {
        month: "short",
      }),
      amount,
    };
  });

  const dashboardMaxMonth = Math.max(
    ...dashboardMonthData.map((month) => month.amount),
    1,
  );
  const selectedPropertyCharges = selectedProperty
    ? rentCharges.filter((charge) => charge.property_id === selectedProperty.id)
    : [];

  const selectedPropertyPayments = selectedProperty
    ? rentPayments.filter(
        (payment) =>
          payment.property_id === selectedProperty.id &&
          payment.status === "completed",
      )
    : [];

  const selectedPropertyChargeIds = new Set(
    selectedPropertyCharges.map((charge) => charge.id),
  );

  const selectedPropertyAllocated = paymentAllocations
    .filter((allocation) => selectedPropertyChargeIds.has(allocation.charge_id))
    .reduce((total, allocation) => total + Number(allocation.amount || 0), 0);

  const selectedPropertyTotalCharges = selectedPropertyCharges
    .filter((charge) => charge.status !== "waived")
    .reduce((total, charge) => total + Number(charge.amount || 0), 0);

  const selectedPropertyTotalPayments = selectedPropertyPayments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0,
  );

  const selectedPropertyOutstanding = Math.max(
    selectedPropertyTotalCharges - selectedPropertyAllocated,
    0,
  );

  const t = (key) => COPY[language]?.[key] || COPY.en[key] || key;

  function propertyInsights(property) {
    if (!property) return { value: null, marketRent: null, source: null };

    const rawValue =
      property.estimated_value ??
      property.market_value ??
      property.property_value ??
      null;

    const rawRent =
      property.comp_rent ??
      property.rent_estimate ??
      property.market_rent ??
      null;

    return {
      value: rawValue === null || rawValue === "" ? null : Number(rawValue),
      marketRent: rawRent === null || rawRent === "" ? null : Number(rawRent),
      source: property.valuation_source || property.market_data_source || null,
    };
  }

  const selectedInsights = propertyInsights(selectedProperty);

  if (!accountReady) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f5f7f6",
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#163d34",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 850, letterSpacing: "-1px" }}>
            unit<span style={{ color: "#2c9b7d" }}>vero</span>
          </div>
          <p style={{ color: "#6f7f7a" }}>Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (String(profile?.role || "").toLowerCase() === "tenant") {
    return (
      <TenantPortal
        profile={profile}
        language={language}
        changeLanguage={changeLanguage}
        privacyMode={privacyMode}
        togglePrivacy={togglePrivacy}
        onSignOut={out}
      />
    );
  }

  return (
    <div className={`app unitveroModern ${privacyMode ? "privacyOn" : ""}`}>
      <aside className="sidebar">
        <div className="sidebarBrand">
          <b className="logo">
            unit<span>vero</span>
          </b>
          <span className="brandLabel">PROPERTY MANAGEMENT</span>
        </div>

        <div style={{
          padding:"12px 14px",
          borderBottom:"1px solid #e5e9ef",
          display:"grid",
          gap:8,
        }}>
          <label style={{fontSize:11,fontWeight:800,color:"#687386"}}>
            LANGUAGE
          </label>
          <select
            value={appLanguage}
            onChange={(e) => setAppLanguage(e.target.value)}
            style={{
              minHeight:38,
              border:"1px solid #dbe3ef",
              borderRadius:10,
              padding:"0 9px",
              background:"#fff",
            }}
          >
            {unitveroLanguages.map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={openProScreen}
          style={{
            margin:"12px 14px 4px",
            minHeight:44,
            border:0,
            borderRadius:12,
            background:"linear-gradient(135deg,#172033,#324968)",
            color:"#fff",
            fontWeight:900,
            cursor:"pointer",
          }}
        >
          ★ {uiLabel("upgrade")}
        </button>

        <nav className="sidebarNav">
          <span className="navSection">WORKSPACE</span>

          <a
            className={view === "overview" ? "active" : ""}
            onClick={() => setView("overview")}
          >
            <span className="navIcon">⌂</span>
            <span>{t("overview")}</span>
          </a>

          <a
            className={
              view === "properties" ||
              view === "propertyDetails" ||
              view === "editProperty"
                ? "active"
                : ""
            }
            onClick={() => setView("properties")}
          >
            <span className="navIcon">▦</span>
            <span>{t("properties")}</span>
          </a>

          <a
            className={
              view === "tenants" || view === "editTenant" ? "active" : ""
            }
            onClick={() => setView("tenants")}
          >
            <span className="navIcon">♙</span>
            <span>{t("tenants")}</span>
          </a>

          <a
            className={view === "rent" ? "active" : ""}
            onClick={() => setView("rent")}
          >
            <span className="navIcon">$</span>
            <span>{t("rent")}</span>
          </a>
          <a
            className={view === "payments" ? "active" : ""}
            onClick={() => setView("payments")}
          >
            <span className="navIcon">↗</span>
            <span>{t("payments")}</span>
          </a>

          <span className="navSection navSectionSecond">MANAGEMENT</span>

          <a
            className={view === "leases" ? "active" : ""}
            onClick={() => setView("leases")}
          >
            <span className="navIcon">▤</span>
            <span>{t("leases")}</span>
          </a>

          <a
            className={
              view === "applications" ||
              view === "newApplication" ||
              view === "applicationDetails"
                ? "active"
                : ""
            }
            onClick={() => setView("applications")}
          >
            <span className="navIcon">▣</span>
            <span>{t("applications")}</span>
          </a>

          <a
            className={view === "messages" ? "active" : ""}
            onClick={() => setView("messages")}
          >
            <span className="navIcon">✉</span>
            <span>{t("messages")}</span>

            {messages.filter(
              (message) => message.sender_type === "tenant" && !message.read_at,
            ).length > 0 && (
              <span className="navNotificationBadge">
                {
                  messages.filter(
                    (message) =>
                      message.sender_type === "tenant" && !message.read_at,
                  ).length
                }
              </span>
            )}
          </a>

          <a
            className={view === "documents" ? "active" : ""}
            onClick={() => setView("documents")}
          >
            <span className="navIcon">▧</span>
            <span>{t("documents")}</span>
          </a>

          <a
            className={view === "rental-value" ? "active" : ""}
            onClick={() => setView("rental-value")}
          >
            <span className="navIcon">≈</span>
            <span>{uiLabel("propertyValue")}</span>
          </a>

          <a
            className={view === "maintenance" ? "active" : ""}
            onClick={() => setView("maintenance")}
          >
            <span className="navIcon">◇</span>
            <span>{t("maintenance")}</span>
          </a>

          <a
            className={view === "bookkeeping" ? "active" : ""}
            onClick={() => setView("bookkeeping")}
          >
            <span className="navIcon">▤</span>
            <span>Bookkeeping</span>
          </a>
        </nav>
        <div style={{
          padding:"12px 14px",
          borderTop:"1px solid #e5e9ef",
          display:"grid",
          gap:6,
          fontSize:12,
        }}>
          <button
            type="button"
            onClick={() => setPrivacyOpen(true)}
            style={{
              border:0,
              background:"transparent",
              padding:0,
              textAlign:"left",
              color:"#526174",
              cursor:"pointer",
              fontWeight:700,
            }}
          >
            Privacy Policy
          </button>
          <span style={{color:"#8a95a5"}}>
            Unitvero privacy & data choices
          </span>
        </div>

        <div className="sidebarAccount">
          <div className="accountAvatar">
            {profile?.full_name
              ? profile.full_name.charAt(0).toUpperCase()
              : "L"}
          </div>

          <div className="accountInfo">
            <b>{profile?.full_name || "Landlord"}</b>
            <span>{profile?.role || "Landlord"}</span>
          </div>

          <button type="button" onClick={out} title="Sign out">
            ↗
          </button>
        </div>
      </aside>

      <main className="dash">
        {view === "overview" && (
          <>
            <div className="dashboardHeader">
              <div>
                <small>LANDLORD DASHBOARD</small>

                <h1>
                  {t("greeting")}
                  {profile?.full_name
                    ? ", " + profile.full_name.split(" ")[0]
                    : ""}
                  .
                </h1>

                <p className="dashboardSubtitle">{t("portfolioUpdate")}</p>
              </div>

              <div className="dashboardHeaderTools">
                <select
                  className="languageSelect"
                  value={language}
                  onChange={(event) => changeLanguage(event.target.value)}
                  aria-label="Language"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>

                <button
                  type="button"
                  className="privacyButton"
                  onClick={togglePrivacy}
                  aria-pressed={privacyMode}
                >
                  {privacyMode ? "◉ Show amounts" : "◎ Hide amounts"}
                </button>

                <button
                  type="button"
                  className="primary"
                  onClick={() => setView("properties")}
                >
                  {t("addProperty")}
                </button>
              </div>
            </div>

            <div className="overviewStats overviewStatsEnhanced">
              <article className="overviewStatCard statBlue">
                <span>Total Properties</span>
                <b>{props.length}</b>
                <small>{dashboardTotalUnits} RENTABLE UNITS</small>
              </article>

              <article className="overviewStatCard statGreen">
                <span>Occupied Units</span>
                <b>{dashboardOccupiedUnits}</b>
                <small>{dashboardOccupancyRate}% OCCUPANCY</small>
              </article>

              <article className="overviewStatCard statPurple">
                <span>Monthly Rent</span>
                <b className="privacyValue">
                  ${portfolioMonthlyRent.toLocaleString()}
                </b>
                <small>EXPECTED</small>
              </article>

              <article className="overviewStatCard statOrange">
                <span>Outstanding</span>
                <b className="privacyValue">
                  ${dashboardOutstanding.toLocaleString()}
                </b>
                <small>CURRENT LEDGER</small>
              </article>
            </div>

            <div className="UnitveroChartsGrid">
              <section className="UnitveroChartCard">
                <div className="UnitveroChartHeader">
                  <div>
                    <small>COLLECTION PERFORMANCE</small>
                    <h2>Rent Collection</h2>
                  </div>

                  <strong>{dashboardCollectionRate}%</strong>
                </div>

                <div className="collectionDonutRow">
                  <div
                    className="collectionDonut"
                    style={{
                      "--collection-rate": `${dashboardCollectionRate * 3.6}deg`,
                    }}
                  >
                    <div>
                      <b>{dashboardCollectionRate}%</b>
                      <span>collected</span>
                    </div>
                  </div>

                  <div className="chartLegend">
                    <div>
                      <i className="legendCollected"></i>
                      <span>Collected</span>
                      <b>${dashboardCollected.toLocaleString()}</b>
                    </div>

                    <div>
                      <i className="legendOutstanding"></i>
                      <span>Outstanding</span>
                      <b>${dashboardOutstanding.toLocaleString()}</b>
                    </div>

                    <div>
                      <i className="legendCharges"></i>
                      <span>Total charges</span>
                      <b>${dashboardTotalCharges.toLocaleString()}</b>
                    </div>
                  </div>
                </div>
              </section>

              <section className="UnitveroChartCard">
                <div className="UnitveroChartHeader">
                  <div>
                    <small>PORTFOLIO HEALTH</small>
                    <h2>Occupancy</h2>
                  </div>

                  <strong>{dashboardOccupancyRate}%</strong>
                </div>

                <div className="occupancyVisual">
                  <div className="occupancyTrack">
                    <span
                      style={{
                        width: `${dashboardOccupancyRate}%`,
                      }}
                    ></span>
                  </div>

                  <div className="occupancyNumbers">
                    <div>
                      <b>{dashboardOccupiedUnits}</b>
                      <span>Occupied</span>
                    </div>

                    <div>
                      <b>{dashboardVacantUnits}</b>
                      <span>Vacant</span>
                    </div>

                    <div>
                      <b>{dashboardTotalUnits}</b>
                      <span>Total units</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="UnitveroChartCard UnitveroChartWide">
                <div className="UnitveroChartHeader">
                  <div>
                    <small>LAST 6 MONTHS</small>
                    <h2>Rent Collected</h2>
                  </div>

                  <strong>${dashboardCollected.toLocaleString()}</strong>
                </div>

                <div className="rentBarChart">
                  {dashboardMonthData.map((month) => (
                    <div className="rentBarColumn" key={month.label}>
                      <div className="rentBarValue">
                        {month.amount > 0
                          ? `$${month.amount.toLocaleString()}`
                          : ""}
                      </div>

                      <div className="rentBarTrack">
                        <span
                          style={{
                            height: `${Math.max(
                              (month.amount / dashboardMaxMonth) * 100,
                              month.amount > 0 ? 8 : 2,
                            )}%`,
                          }}
                        ></span>
                      </div>

                      <b>{month.label}</b>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="dashboardProperties">
              {props.slice(0, 4).map((property) => {
                const tenancy = activeTenancyForProperty(property.id);
                const occupied = Boolean(tenancy);

                return (
                  <article
                    className="dashboardPropertyCard identityPropertyCard"
                    key={property.id}
                    onClick={() => {
                      setSelectedProperty(property);
                      setSelectedUnit(null);

                      if (isMultiFamily(property)) {
                        setSelectedTenancy(null);
                      } else {
                        loadTenancy(property.id);
                      }

                      setView("propertyDetails");
                    }}
                  >
                    <div className="propertyIdentityPanel">
                      <div className="propertyBuildingIcon">⌂</div>

                      <span
                        className={
                          occupied
                            ? "portfolioOccupancy occupied"
                            : "portfolioOccupancy vacant"
                        }
                      >
                        <i></i>
                        {occupied ? "Occupied" : "Vacant"}
                      </span>
                    </div>

                    <div className="propertyCardBody">
                      <div className="propertyCardTop">
                        <div>
                          <small>RENTAL PROPERTY</small>

                          <h3>{property.address}</h3>

                          <p>
                            {property.city}, {property.state}{" "}
                            {property.zip_code}
                          </p>
                        </div>

                        <span className="propertyArrow">→</span>
                      </div>

                      <div className="propertyCardDetails">
                        <div>
                          <span>MONTHLY RENT</span>

                          <b>
                            $
                            {Number(
                              property.monthly_rent || 0,
                            ).toLocaleString()}
                          </b>
                        </div>

                        <div>
                          <span>TENANT</span>

                          <b>
                            {tenancy
                              ? tenancy.tenant_name ||
                                tenancy.tenant_email ||
                                "Active tenant"
                              : "No tenant"}
                          </b>
                        </div>
                      </div>

                      <div className="propertyCardFooter">
                        <span>
                          {occupied ? "Active tenancy" : "Ready for tenant"}
                        </span>

                        <b>View Property →</b>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <section className="activityShowcase">
              <div className="showcaseHeader">
                <div>
                  <h2>Recent Activity</h2>
                  <p>Latest updates from your portfolio.</p>
                </div>
              </div>

              <div className="activityList">
                <div className="activityRow">
                  <div className="activityTypeIcon">$</div>

                  <div>
                    <b>Rent collection</b>
                    <span>Payments will appear here</span>
                  </div>

                  <small>Current</small>
                </div>

                <div className="activityRow">
                  <div className="activityTypeIcon">⌂</div>

                  <div>
                    <b>{props.length} properties</b>
                    <span>Currently in your portfolio</span>
                  </div>

                  <small>Portfolio</small>
                </div>

                <div className="activityRow">
                  <div className="activityTypeIcon">✓</div>

                  <div>
                    <b>{occupiedPropertyCount} occupied</b>

                    <span>{vacantPropertyCount} currently vacant</span>
                  </div>

                  <small>Occupancy</small>
                </div>
              </div>
            </section>

            <div className="dashboardBottomGrid">
              <section className="dashboardFeatureCard">
                <div className="featureCardHeader">
                  <div>
                    <h2>Rent Collection</h2>
                    <p>This month&apos;s performance</p>
                  </div>
                </div>

                <div className="rentCollectionContent">
                  <div className="rentCircle">
                    <div>
                      <b>0%</b>
                      <span>Collected</span>
                    </div>
                  </div>

                  <div className="rentLegend">
                    <div>
                      <span className="legendDot collected"></span>
                      <span>Collected</span>
                      <b>$0</b>
                    </div>

                    <div>
                      <span className="legendDot pending"></span>
                      <span>Expected</span>

                      <b>${portfolioMonthlyRent.toLocaleString()}</b>
                    </div>
                  </div>
                </div>
              </section>

              <section className="dashboardFeatureCard">
                <div className="featureCardHeader">
                  <div>
                    <h2>Lease Renewals</h2>
                    <p>Upcoming lease activity</p>
                  </div>
                </div>

                <div className="featureEmpty">
                  <div className="featureEmptyIcon">▤</div>
                  <b>No renewals scheduled</b>

                  <span>Upcoming lease renewals will appear here.</span>
                </div>
              </section>

              <section className="dashboardFeatureCard">
                <div className="featureCardHeader">
                  <div>
                    <h2>Maintenance</h2>
                    <p>Active requests</p>
                  </div>
                </div>

                <div className="featureEmpty">
                  <div className="featureEmptyIcon">◇</div>
                  <b>0 Open Requests</b>
                  <span>You&apos;re all caught up.</span>
                </div>
              </section>
            </div>

            <section className="portfolioBanner">
              <div>
                <span className="bannerIcon">⌂</span>

                <div>
                  <h2>Grow Your Portfolio</h2>

                  <p>
                    Add another property and keep building your rental business.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="primary"
                onClick={() => setView("properties")}
              >
                + Add Property
              </button>
            </section>
          </>
        )}

        {view === "properties" && (
          <section className="portfolioPage">
            <div className="portfolioPageHeader">
              <div>
                <small>PROPERTY PORTFOLIO</small>
                <h1>Properties</h1>

                <p>Manage your rental portfolio, occupancy and monthly rent.</p>
              </div>

              <button
                type="button"
                className="primary"
                onClick={() => {
                  document
                    .getElementById("portfolioAddProperty")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                }}
              >
                + Add Property
              </button>
            </div>

            <div className="portfolioStats">
              <article>
                <span className="portfolioStatIcon">▦</span>

                <div>
                  <small>TOTAL PROPERTIES</small>
                  <b>{props.length}</b>
                  <p>Entire portfolio</p>
                </div>
              </article>

              <article>
                <span className="portfolioStatIcon occupied">✓</span>

                <div>
                  <small>OCCUPIED</small>
                  <b>{occupiedPropertyCount}</b>
                  <p>Active tenants</p>
                </div>
              </article>

              <article>
                <span className="portfolioStatIcon vacant">⌂</span>

                <div>
                  <small>VACANT</small>
                  <b>{vacantPropertyCount}</b>
                  <p>Available units</p>
                </div>
              </article>

              <article>
                <span className="portfolioStatIcon rent">$</span>

                <div>
                  <small>MONTHLY RENT</small>

                  <b>${portfolioMonthlyRent.toLocaleString()}</b>

                  <p>Expected portfolio rent</p>
                </div>
              </article>
            </div>

            <div className="portfolioToolbar">
              <div className="portfolioSearch">
                <span>⌕</span>

                <input
                  type="search"
                  value={propertySearch}
                  onChange={(e) => setPropertySearch(e.target.value)}
                  placeholder="Search by address, city or ZIP..."
                />
              </div>

              <div className="portfolioFilters">
                <button
                  type="button"
                  className={propertyFilter === "all" ? "active" : ""}
                  onClick={() => setPropertyFilter("all")}
                >
                  All
                  <span>{props.length}</span>
                </button>

                <button
                  type="button"
                  className={propertyFilter === "occupied" ? "active" : ""}
                  onClick={() => setPropertyFilter("occupied")}
                >
                  Occupied
                  <span>{occupiedPropertyCount}</span>
                </button>

                <button
                  type="button"
                  className={propertyFilter === "vacant" ? "active" : ""}
                  onClick={() => setPropertyFilter("vacant")}
                >
                  Vacant
                  <span>{vacantPropertyCount}</span>
                </button>
              </div>

              <span className="portfolioResultCount">
                {filteredProperties.length}{" "}
                {filteredProperties.length === 1 ? "property" : "properties"}
              </span>
            </div>

            {filteredProperties.length === 0 ? (
              <div className="portfolioEmpty">
                <div>⌂</div>

                <h2>
                  {props.length === 0
                    ? "Add your first property"
                    : "No properties found"}
                </h2>

                <p>
                  {props.length === 0
                    ? "Start building your Unitvero portfolio below."
                    : "Try changing your search or property filter."}
                </p>
              </div>
            ) : (
              <div className="portfolioPropertyGrid">
                {filteredProperties.map((property) => {
                  const tenancy = activeTenancyForProperty(property.id);

                  const propertyUnits = unitsForProperty(property.id);

                  const multiFamily = isMultiFamily(property);

                  const occupiedUnits = propertyUnits.filter(
                    (unit) => unit.status === "occupied",
                  ).length;

                  const occupied = multiFamily
                    ? occupiedUnits > 0
                    : Boolean(tenancy);

                  return (
                    <article
                      className="portfolioPropertyCard"
                      key={property.id}
                      onClick={() => {
                        setSelectedProperty(property);
                        setSelectedUnit(null);

                        if (isMultiFamily(property)) {
                          setSelectedTenancy(null);
                        } else {
                          loadTenancy(property.id);
                        }

                        setView("propertyDetails");
                      }}
                    >
                      <div className="portfolioCardAccent">
                        <div className="portfolioHouseIcon">⌂</div>

                        <span
                          className={
                            occupied
                              ? "portfolioOccupancy occupied"
                              : "portfolioOccupancy vacant"
                          }
                        >
                          <i></i>
                          {occupied ? "Occupied" : "Vacant"}
                        </span>
                      </div>

                      <div className="portfolioCardContent">
                        <div className="portfolioCardAddress">
                          <small>
                            {multiFamily
                              ? `${property.property_type
                                  ?.replace("_", " ")
                                  .toUpperCase()} • ${property.total_units} UNITS`
                              : "RENTAL PROPERTY"}
                          </small>
                          <h2>{property.address}</h2>

                          <p>
                            {property.city}, {property.state}{" "}
                            {property.zip_code}
                          </p>
                        </div>

                        <div className="portfolioRentAmount">
                          <small>MONTHLY RENT</small>

                          <b>
                            $
                            {Number(
                              property.monthly_rent || 0,
                            ).toLocaleString()}
                          </b>

                          <span>/ month</span>
                        </div>

                        <div className="portfolioCardDetails">
                          <div>
                            <small>TENANT</small>

                            <b>
                              {multiFamily
                                ? `${occupiedUnits} of ${property.total_units} occupied`
                                : tenancy
                                  ? tenancy.tenant_name ||
                                    tenancy.tenant_email ||
                                    "Active tenant"
                                  : "No tenant"}
                            </b>
                          </div>

                          <div>
                            <small>LEASE</small>

                            <b>
                              {tenancy
                                ? tenancy.end_date
                                  ? new Date(
                                      tenancy.end_date + "T00:00:00",
                                    ).toLocaleDateString()
                                  : "Open ended"
                                : "—"}
                            </b>
                          </div>
                        </div>

                        <div className="portfolioCardFooter">
                          <span>
                            {multiFamily
                              ? `${propertyUnits.length} units • ${occupiedUnits} occupied`
                              : occupied
                                ? "Tenant assigned"
                                : "Ready for tenant"}
                          </span>

                          <button type="button">View Property →</button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {profile?.role === "landlord" && (
              <section
                className="portfolioAddProperty"
                id="portfolioAddProperty"
              >
                <div className="portfolioAddIcon">+</div>

                <div className="portfolioAddCopy">
                  <small>GROW YOUR PORTFOLIO</small>
                  <h2>Add a Property</h2>

                  <p>Add another rental property to your Unitvero workspace.</p>
                </div>

                <form className="portfolioAddForm" onSubmit={add}>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter street address"
                    required
                  />

                  <button type="submit" className="primary">
                    Add Property
                  </button>
                </form>
              </section>
            )}
          </section>
        )}

        {view === "propertyDetails" && selectedProperty && (
          <section className="propertyCommandCenter">
            <button
              type="button"
              className="propertyBackButton"
              onClick={() => {
                setSelectedUnit(null);
                setSelectedTenancy(null);
                setView("properties");
              }}
            >
              ← Back to Properties
            </button>

            <div className="commandPropertyHeader">
              <div className="commandPropertyIdentity">
                <div className="commandPropertyIcon">⌂</div>

                <div>
                  <div className="commandPropertyEyebrow">
                    <span>PROPERTY COMMAND CENTER</span>

                    <span
                      className={
                        isMultiFamily(selectedProperty)
                          ? "commandOccupancy occupied"
                          : selectedTenancy
                            ? "commandOccupancy occupied"
                            : "commandOccupancy vacant"
                      }
                    >
                      <i></i>
                      {isMultiFamily(selectedProperty)
                        ? `${unitsForProperty(selectedProperty.id).length} Units`
                        : selectedTenancy
                          ? "Occupied"
                          : "Vacant"}
                    </span>
                  </div>

                  <h1>{selectedProperty.address}</h1>

                  <p>
                    {selectedProperty.city}, {selectedProperty.state}{" "}
                    {selectedProperty.zip_code}
                  </p>
                </div>
              </div>

              <div className="commandHeaderActions">
                {!isMultiFamily(selectedProperty) && !selectedTenancy && (
                  <button
                    type="button"
                    className="commandSecondaryButton"
                    onClick={() => {
                      setSelectedUnit(null);
                      setView("addTenant");
                    }}
                  >
                    + Add Tenant
                  </button>
                )}

                <button
                  type="button"
                  className="primary"
                  onClick={() => setView("editProperty")}
                >
                  Edit Property
                </button>
              </div>
            </div>

            <section className="marketInsightsCard">
              <div className="marketInsightsHeader">
                <div>
                  <small>LOCATION INSIGHTS</small>
                  <h2>Property Value &amp; Comparable Rent</h2>
                  <p>
                    Market information for{" "}
                    {selectedProperty.zip_code || "this location"}.
                  </p>
                </div>
                <span className="marketDataBadge">
                  {selectedInsights.source || "Data connection needed"}
                </span>
              </div>

              <div className="marketInsightsGrid">
                <div>
                  <span>Estimated Property Value</span>
                  <b className="privacyValue">
                    {selectedInsights.value !== null
                      ? `$${selectedInsights.value.toLocaleString()}`
                      : "Not available"}
                  </b>
                  <small>Based on connected valuation data</small>
                </div>

                <div>
                  <span>Comparable Market Rent</span>
                  <b className="privacyValue">
                    {selectedInsights.marketRent !== null
                      ? `$${selectedInsights.marketRent.toLocaleString()}/mo`
                      : "Not available"}
                  </b>
                  <small>Nearby rental comparison estimate</small>
                </div>

                <div>
                  <span>Current Listed Rent</span>
                  <b className="privacyValue">
                    $
                    {Number(
                      selectedProperty.monthly_rent || 0,
                    ).toLocaleString()}
                    /mo
                  </b>
                  <small>
                    {selectedInsights.marketRent !== null
                      ? `${Math.abs(Number(selectedProperty.monthly_rent || 0) - selectedInsights.marketRent).toLocaleString()} difference from market`
                      : "Connect a property-data provider to compare"}
                  </small>
                </div>
              </div>

              {!selectedInsights.source &&
                selectedInsights.value === null &&
                selectedInsights.marketRent === null && (
                  <p className="marketDataNotice">
                    Unitvero will show verified estimates here after a
                    property-data provider is connected. No estimates are
                    guessed or invented.
                  </p>
                )}
            </section>

            {isMultiFamily(selectedProperty) ? (
              <>
                <div className="commandStats">
                  <article>
                    <div className="commandStatIcon">▦</div>
                    <div>
                      <span>Total Units</span>
                      <b>{selectedProperty.total_units || 0}</b>
                      <small>PROPERTY UNITS</small>
                    </div>
                  </article>

                  <article>
                    <div className="commandStatIcon">⌂</div>
                    <div>
                      <span>Occupied</span>
                      <b>
                        {
                          unitsForProperty(selectedProperty.id).filter((unit) =>
                            tenancies.some(
                              (tenancy) =>
                                tenancy.unit_id === unit.id &&
                                tenancy.status === "active",
                            ),
                          ).length
                        }
                      </b>
                      <small>OCCUPIED UNITS</small>
                    </div>
                  </article>

                  <article>
                    <div className="commandStatIcon">◇</div>
                    <div>
                      <span>Vacant</span>
                      <b>
                        {
                          unitsForProperty(selectedProperty.id).filter(
                            (unit) =>
                              !tenancies.some(
                                (tenancy) =>
                                  tenancy.unit_id === unit.id &&
                                  tenancy.status === "active",
                              ),
                          ).length
                        }
                      </b>
                      <small>AVAILABLE UNITS</small>
                    </div>
                  </article>

                  <article>
                    <div className="commandStatIcon">$</div>
                    <div>
                      <span>Scheduled Rent</span>
                      <b>
                        $
                        {unitsForProperty(selectedProperty.id)
                          .reduce((total, unit) => {
                            const tenancy = tenancies.find(
                              (item) =>
                                item.unit_id === unit.id &&
                                item.status === "active",
                            );

                            return (
                              total +
                              Number(
                                tenancy?.monthly_rent || unit.market_rent || 0,
                              )
                            );
                          }, 0)
                          .toLocaleString()}
                      </b>
                      <small>MONTHLY</small>
                    </div>
                  </article>
                </div>

                <section className="commandCard propertyUnitsCard">
                  <div className="commandCardHeader">
                    <div>
                      <span className="commandSectionIcon">▦</span>

                      <div>
                        <h2>Units</h2>
                        <p>
                          Select a unit to manage its tenant, lease, rent and
                          activity.
                        </p>
                      </div>
                    </div>

                    <span className="commandOccupancy occupied">
                      <i></i>
                      {unitsForProperty(selectedProperty.id).length} Units
                    </span>
                  </div>

                  <div className="propertyUnitsGrid">
                    {unitsForProperty(selectedProperty.id).map((unit) => {
                      const unitTenancy = tenancies.find(
                        (tenancy) =>
                          tenancy.unit_id === unit.id &&
                          tenancy.status === "active",
                      );

                      return (
                        <article
                          className="propertyUnitCard"
                          key={unit.id}
                          onClick={() => {
                            setSelectedUnit(unit);
                            setSelectedTenancy(unitTenancy || null);
                            setView("unitDetails");
                          }}
                        >
                          <div className="propertyUnitTop">
                            <div className="propertyUnitIcon">⌂</div>

                            <span
                              className={
                                unitTenancy
                                  ? "portfolioOccupancy occupied"
                                  : "portfolioOccupancy vacant"
                              }
                            >
                              <i></i>
                              {unitTenancy ? "Occupied" : "Vacant"}
                            </span>
                          </div>

                          <div className="propertyUnitBody">
                            <small>UNIT</small>
                            <h3>{unit.unit_name}</h3>

                            <div className="propertyUnitDetails">
                              <div>
                                <span>MONTHLY RENT</span>
                                <b>
                                  $
                                  {Number(
                                    unitTenancy?.monthly_rent ||
                                      unit.market_rent ||
                                      0,
                                  ).toLocaleString()}
                                </b>
                              </div>

                              <div>
                                <span>TENANT</span>
                                <b>
                                  {unitTenancy
                                    ? unitTenancy.tenant_name ||
                                      unitTenancy.tenant_email ||
                                      "Active tenant"
                                    : "No tenant"}
                                </b>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="commandTextButton"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedUnit(unit);
                                setSelectedTenancy(unitTenancy || null);
                                setView("unitDetails");
                              }}
                            >
                              Manage Unit →
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>

                <div className="commandMainGrid">
                  <div className="commandMainColumn">
                    <section className="commandCard">
                      <div className="commandCardHeader">
                        <div>
                          <span className="commandSectionIcon">$</span>
                          <div>
                            <h2>Property Financials</h2>
                            <p>Rent activity across the entire property</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="commandTextButton"
                          onClick={() => setView("rent")}
                        >
                          View Rent →
                        </button>
                      </div>

                      <div className="commandRentSummary">
                        <div>
                          <small>COLLECTED</small>
                          <b>
                            ${selectedPropertyTotalPayments.toLocaleString()}
                          </b>
                        </div>

                        <div>
                          <small>OUTSTANDING</small>
                          <b>${selectedPropertyOutstanding.toLocaleString()}</b>
                        </div>

                        <div>
                          <small>UNITS</small>
                          <b>{unitsForProperty(selectedProperty.id).length}</b>
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="commandSideColumn">
                    <section className="commandCard">
                      <div className="commandCardHeader">
                        <div>
                          <span className="commandSectionIcon">⌂</span>
                          <div>
                            <h2>Property Information</h2>
                            <p>Building details</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="commandTextButton"
                          onClick={() => setView("editProperty")}
                        >
                          Edit →
                        </button>
                      </div>

                      <div className="commandPropertyInfo">
                        <div>
                          <span>Street Address</span>
                          <b>{selectedProperty.address}</b>
                        </div>

                        <div>
                          <span>City</span>
                          <b>{selectedProperty.city}</b>
                        </div>

                        <div>
                          <span>State</span>
                          <b>{selectedProperty.state}</b>
                        </div>

                        <div>
                          <span>ZIP Code</span>
                          <b>{selectedProperty.zip_code}</b>
                        </div>

                        <div>
                          <span>Property Type</span>
                          <b>
                            {selectedProperty.property_type
                              ? selectedProperty.property_type.replaceAll(
                                  "_",
                                  " ",
                                )
                              : "Multi family"}
                          </b>
                        </div>

                        <div>
                          <span>Total Units</span>
                          <b>{selectedProperty.total_units || 1}</b>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="commandStats">
                  <article>
                    <div className="commandStatIcon">$</div>
                    <div>
                      <span>Monthly Rent</span>
                      <b>
                        $
                        {Number(
                          selectedTenancy?.monthly_rent ||
                            selectedProperty.monthly_rent ||
                            0,
                        ).toLocaleString()}
                      </b>
                      <small>EXPECTED PER MONTH</small>
                    </div>
                  </article>

                  <article>
                    <div className="commandStatIcon">◎</div>
                    <div>
                      <span>Outstanding Balance</span>
                      <b>${selectedPropertyOutstanding.toLocaleString()}</b>
                      <small>CURRENT BALANCE</small>
                    </div>
                  </article>

                  <article>
                    <div className="commandStatIcon">▤</div>
                    <div>
                      <span>Lease</span>
                      <b>
                        {selectedTenancy
                          ? selectedTenancy.end_date
                            ? new Date(
                                selectedTenancy.end_date + "T00:00:00",
                              ).toLocaleDateString()
                            : "Open ended"
                          : "No lease"}
                      </b>
                      <small>
                        {selectedTenancy ? "LEASE END" : "NO ACTIVE TENANCY"}
                      </small>
                    </div>
                  </article>

                  <article>
                    <div className="commandStatIcon">◇</div>
                    <div>
                      <span>Maintenance</span>
                      <b>0</b>
                      <small>OPEN REQUESTS</small>
                    </div>
                  </article>
                </div>

                <div className="commandMainGrid">
                  <div className="commandMainColumn">
                    <section className="commandCard">
                      <div className="commandCardHeader">
                        <div>
                          <span className="commandSectionIcon">♙</span>
                          <div>
                            <h2>Current Tenant</h2>
                            <p>Resident and contact information</p>
                          </div>
                        </div>

                        {selectedTenancy && (
                          <button
                            type="button"
                            className="commandTextButton"
                            onClick={() => {
                              setEditingTenancy(selectedTenancy);
                              setView("editTenant");
                            }}
                          >
                            Edit Tenant →
                          </button>
                        )}
                      </div>

                      {selectedTenancy ? (
                        <div className="commandTenant">
                          <div className="commandTenantAvatar">
                            {(
                              selectedTenancy.tenant_name ||
                              selectedTenancy.tenant_email ||
                              "T"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="commandTenantIdentity">
                            <b>
                              {selectedTenancy.tenant_name ||
                                selectedTenancy.tenant_email}
                            </b>
                            <span>Active tenant</span>
                          </div>

                          <div className="commandTenantContact">
                            <div>
                              <small>EMAIL</small>
                              <b>{selectedTenancy.tenant_email || "—"}</b>
                            </div>

                            <div>
                              <small>PHONE</small>
                              <b>
                                {selectedTenancy.tenant_phone || "Not provided"}
                              </b>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="commandEmptyState">
                          <div className="commandEmptyIcon">♙</div>
                          <b>No tenant assigned</b>
                          <p>
                            Add a tenant to begin tracking the lease, rent and
                            resident information.
                          </p>

                          <button
                            type="button"
                            className="primary"
                            onClick={() => {
                              setSelectedUnit(null);
                              setView("addTenant");
                            }}
                          >
                            + Add Tenant
                          </button>
                        </div>
                      )}
                    </section>

                    <section className="commandCard">
                      <div className="commandCardHeader">
                        <div>
                          <span className="commandSectionIcon">▤</span>
                          <div>
                            <h2>Lease</h2>
                            <p>Current rental agreement</p>
                          </div>
                        </div>

                        {selectedTenancy && (
                          <button
                            type="button"
                            className="commandTextButton"
                            onClick={() => {
                              setEditingTenancy(selectedTenancy);
                              setView("editTenant");
                            }}
                          >
                            Manage Lease →
                          </button>
                        )}
                      </div>

                      {selectedTenancy ? (
                        <div className="commandLeaseGrid">
                          <div>
                            <small>LEASE STATUS</small>
                            <b className="commandActiveText">● Active</b>
                          </div>

                          <div>
                            <small>START DATE</small>
                            <b>
                              {selectedTenancy.start_date
                                ? new Date(
                                    selectedTenancy.start_date + "T00:00:00",
                                  ).toLocaleDateString()
                                : "—"}
                            </b>
                          </div>

                          <div>
                            <small>END DATE</small>
                            <b>
                              {selectedTenancy.end_date
                                ? new Date(
                                    selectedTenancy.end_date + "T00:00:00",
                                  ).toLocaleDateString()
                                : "Open ended"}
                            </b>
                          </div>

                          <div>
                            <small>MONTHLY RENT</small>
                            <b>
                              $
                              {Number(
                                selectedTenancy.monthly_rent || 0,
                              ).toLocaleString()}
                            </b>
                          </div>
                        </div>
                      ) : (
                        <div className="commandEmptyState compact">
                          <div className="commandEmptyIcon">▤</div>
                          <b>No active lease</b>
                          <p>
                            Lease information will appear when a tenant is
                            assigned.
                          </p>
                        </div>
                      )}
                    </section>

                    <section className="commandCard">
                      <div className="commandCardHeader">
                        <div>
                          <span className="commandSectionIcon">$</span>
                          <div>
                            <h2>Rent & Ledger</h2>
                            <p>Charges, payments and property balance</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="commandTextButton"
                          onClick={() => setView("rent")}
                        >
                          View Rent →
                        </button>
                      </div>

                      <div className="commandRentSummary">
                        <div>
                          <small>MONTHLY RENT</small>
                          <b>
                            $
                            {Number(
                              selectedTenancy?.monthly_rent ||
                                selectedProperty.monthly_rent ||
                                0,
                            ).toLocaleString()}
                          </b>
                        </div>

                        <div>
                          <small>COLLECTED</small>
                          <b>
                            ${selectedPropertyTotalPayments.toLocaleString()}
                          </b>
                        </div>

                        <div>
                          <small>BALANCE</small>
                          <b>${selectedPropertyOutstanding.toLocaleString()}</b>
                        </div>
                      </div>

                      {selectedPropertyCharges.length === 0 &&
                      selectedPropertyPayments.length === 0 ? (
                        <div className="commandLedgerEmpty">
                          <span>$</span>
                          <div>
                            <b>No ledger activity yet</b>
                            <p>
                              Charges and rent payments will appear here as
                              activity is recorded.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="commandLedgerList">
                          {selectedPropertyCharges.map((charge) => (
                            <div
                              className="commandLedgerRow"
                              key={`charge-${charge.id}`}
                            >
                              <div className="commandLedgerType charge">$</div>

                              <div className="commandLedgerDescription">
                                <b>{charge.description || "Rent charge"}</b>
                                <span>
                                  Due{" "}
                                  {new Date(
                                    charge.due_date + "T00:00:00",
                                  ).toLocaleDateString()}
                                </span>
                              </div>

                              <span
                                className={`commandLedgerStatus ${charge.status}`}
                              >
                                {charge.status}
                              </span>

                              <b className="commandLedgerAmount charge">
                                ${Number(charge.amount || 0).toLocaleString()}
                              </b>
                            </div>
                          ))}

                          {selectedPropertyPayments.map((payment) => (
                            <div
                              className="commandLedgerRow"
                              key={`payment-${payment.id}`}
                            >
                              <div className="commandLedgerType payment">✓</div>

                              <div className="commandLedgerDescription">
                                <b>Rent payment</b>
                                <span>
                                  {new Date(
                                    payment.payment_date + "T00:00:00",
                                  ).toLocaleDateString()}
                                  {" · "}
                                  {payment.payment_method || "manual"}
                                </span>
                              </div>

                              <span
                                className={`commandLedgerStatus ${payment.status}`}
                              >
                                {payment.status}
                              </span>

                              <b className="commandLedgerAmount payment">
                                -$
                                {Number(payment.amount || 0).toLocaleString()}
                              </b>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  </div>

                  <div className="commandSideColumn">
                    <section className="commandCard">
                      <div className="commandCardHeader">
                        <div>
                          <span className="commandSectionIcon">◇</span>
                          <div>
                            <h2>Maintenance</h2>
                            <p>Repair requests</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="commandTextButton"
                          onClick={() => setView("maintenance")}
                        >
                          View All →
                        </button>
                      </div>

                      <div className="commandMiniEmpty">
                        <div className="commandMiniIcon">✓</div>
                        <b>0 Open Requests</b>
                        <span>No maintenance issues reported.</span>
                      </div>
                    </section>

                    <section className="commandCard">
                      <div className="commandCardHeader">
                        <div>
                          <span className="commandSectionIcon">▧</span>
                          <div>
                            <h2>Documents</h2>
                            <p>Property files and agreements</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="commandTextButton"
                          onClick={() => setView("documents")}
                        >
                          View All →
                        </button>
                      </div>

                      <div className="commandMiniEmpty">
                        <div className="commandMiniIcon">▧</div>
                        <b>No property documents</b>
                        <span>
                          Leases, notices, receipts and other files will appear
                          here.
                        </span>
                      </div>
                    </section>

                    <section className="commandCard">
                      <div className="commandCardHeader">
                        <div>
                          <span className="commandSectionIcon">⌂</span>
                          <div>
                            <h2>Property Information</h2>
                            <p>Property details</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="commandTextButton"
                          onClick={() => setView("editProperty")}
                        >
                          Edit →
                        </button>
                      </div>

                      <div className="commandPropertyInfo">
                        <div>
                          <span>Street Address</span>
                          <b>{selectedProperty.address}</b>
                        </div>

                        <div>
                          <span>City</span>
                          <b>{selectedProperty.city}</b>
                        </div>

                        <div>
                          <span>State</span>
                          <b>{selectedProperty.state}</b>
                        </div>

                        <div>
                          <span>ZIP Code</span>
                          <b>{selectedProperty.zip_code}</b>
                        </div>

                        <div>
                          <span>Occupancy</span>
                          <b>{selectedTenancy ? "Occupied" : "Vacant"}</b>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        {view === "editProperty" && selectedProperty && (
          <section className="propertyEditPage">
            <button
              type="button"
              className="propertyBackButton"
              onClick={() => setView("propertyDetails")}
            >
              ← Back to Property
            </button>

            <div className="propertyEditCard">
              <div className="propertyEditHeader">
                <small>PROPERTY SETTINGS</small>
                <h1>Edit Property</h1>
                <p>Update the address and expected monthly rent.</p>
              </div>

              <form className="propertyEditForm" onSubmit={updateProperty}>
                <label>
                  Street Address
                  <input
                    name="address"
                    defaultValue={selectedProperty.address || ""}
                    required
                  />
                </label>

                <div className="propertyEditRow">
                  <label>
                    City
                    <input
                      name="city"
                      defaultValue={selectedProperty.city || ""}
                      required
                    />
                  </label>

                  <label>
                    State
                    <input
                      name="state"
                      defaultValue={selectedProperty.state || ""}
                      maxLength={2}
                      required
                    />
                  </label>

                  <label>
                    ZIP Code
                    <input
                      name="zipCode"
                      defaultValue={selectedProperty.zip_code || ""}
                      inputMode="numeric"
                      required
                    />
                  </label>
                </div>

                <label>
                  Expected Monthly Rent
                  <input
                    name="monthlyRent"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={selectedProperty.monthly_rent || 0}
                  />
                </label>

                <div className="propertyEditActions">
                  <button
                    type="button"
                    onClick={() => setView("propertyDetails")}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary">
                    Save Property
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {view === "unitDetails" &&
          selectedUnit &&
          selectedProperty &&
          (() => {
            const unitTenancy =
              tenancies.find(
                (tenancy) =>
                  tenancy.unit_id === selectedUnit.id &&
                  tenancy.status === "active",
              ) ||
              selectedTenancy ||
              null;

            const unitCharges = rentCharges.filter(
              (charge) => charge.unit_id === selectedUnit.id,
            );

            const unitPayments = rentPayments.filter(
              (payment) =>
                payment.unit_id === selectedUnit.id &&
                payment.status === "completed",
            );

            const unitChargeIds = new Set(
              unitCharges.map((charge) => charge.id),
            );

            const unitPaymentIds = new Set(
              unitPayments.map((payment) => payment.id),
            );

            const unitAllocated = paymentAllocations
              .filter(
                (allocation) =>
                  unitChargeIds.has(allocation.charge_id) &&
                  unitPaymentIds.has(allocation.payment_id),
              )
              .reduce(
                (total, allocation) => total + Number(allocation.amount || 0),
                0,
              );

            const unitTotalCharges = unitCharges.reduce(
              (total, charge) => total + Number(charge.amount || 0),
              0,
            );

            const unitOutstanding = Math.max(
              unitTotalCharges - unitAllocated,
              0,
            );

            const unitCollected = unitPayments.reduce(
              (total, payment) => total + Number(payment.amount || 0),
              0,
            );

            const unitMonthlyRent = Number(
              unitTenancy?.monthly_rent || selectedUnit.market_rent || 0,
            );

            const unitOccupied = Boolean(unitTenancy);

            const formatUnitDate = (value) => {
              if (!value) return "—";

              const date = new Date(`${value}T00:00:00`);

              if (Number.isNaN(date.getTime())) {
                return value;
              }

              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
            };

            const openAddTenantForUnit = () => {
              setSelectedTenancy(null);
              setEditingTenancy(null);
              setView("addTenant");
            };

            const manageUnitTenant = () => {
              if (!unitTenancy) return;

              setSelectedTenancy(unitTenancy);
              setEditingTenancy(unitTenancy);
              setView("editTenant");
            };

            return (
              <section className="propertyCommandCenter">
                <button
                  type="button"
                  className="propertyBackButton"
                  onClick={() => {
                    setSelectedUnit(null);
                    setSelectedTenancy(null);
                    setView("propertyDetails");
                  }}
                >
                  ← Back to {selectedProperty.address}
                </button>

                <div className="commandPropertyHeader">
                  <div className="commandPropertyIdentity">
                    <div className="commandPropertyIcon">⌂</div>

                    <div>
                      <div className="commandPropertyEyebrow">
                        <span>UNIT COMMAND CENTER</span>

                        <span
                          className={
                            unitOccupied
                              ? "commandOccupancy occupied"
                              : "commandOccupancy vacant"
                          }
                        >
                          <i></i>
                          {unitOccupied ? "Occupied" : "Vacant"}
                        </span>
                      </div>

                      <h1>{selectedUnit.unit_name}</h1>

                      <p>
                        {selectedProperty.address}
                        {selectedProperty.city
                          ? ` • ${selectedProperty.city}, ${
                              selectedProperty.state || ""
                            } ${selectedProperty.zip_code || ""}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="commandHeaderActions">
                    {!unitTenancy ? (
                      <button
                        type="button"
                        className="primary"
                        onClick={openAddTenantForUnit}
                      >
                        + Add Tenant
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="commandSecondaryButton"
                          onClick={() => setView("rent")}
                        >
                          View Rent
                        </button>

                        <button
                          type="button"
                          className="primary"
                          onClick={manageUnitTenant}
                        >
                          Manage Tenant
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="commandStats">
                  <article>
                    <div className="commandStatIcon">$</div>

                    <div>
                      <span>Monthly Rent</span>
                      <b>${unitMonthlyRent.toLocaleString()}</b>
                      <small>EXPECTED PER MONTH</small>
                    </div>
                  </article>

                  <article>
                    <div className="commandStatIcon">♙</div>

                    <div>
                      <span>Tenant</span>

                      <b>
                        {unitTenancy
                          ? unitTenancy.tenant_name ||
                            unitTenancy.tenant_email ||
                            "Active Tenant"
                          : "Vacant"}
                      </b>

                      <small>UNIT OCCUPANCY</small>
                    </div>
                  </article>

                  <article>
                    <div className="commandStatIcon">▤</div>

                    <div>
                      <span>Lease</span>

                      <b>
                        {unitTenancy
                          ? unitTenancy.end_date
                            ? formatUnitDate(unitTenancy.end_date)
                            : "Active"
                          : "No lease"}
                      </b>

                      <small>
                        {unitTenancy ? "LEASE STATUS" : "NO ACTIVE LEASE"}
                      </small>
                    </div>
                  </article>

                  <article>
                    <div className="commandStatIcon">$</div>

                    <div>
                      <span>Outstanding</span>

                      <b>${unitOutstanding.toLocaleString()}</b>

                      <small>RENT BALANCE</small>
                    </div>
                  </article>
                </div>

                <div className="commandMainGrid">
                  <div className="commandMainColumn">
                    <section className="commandCard">
                      <div className="commandCardHeader">
                        <div>
                          <span className="commandSectionIcon">♙</span>

                          <div>
                            <h2>Current Tenant</h2>
                            <p>
                              Resident assigned specifically to{" "}
                              {selectedUnit.unit_name}
                            </p>
                          </div>
                        </div>

                        {unitTenancy && (
                          <button
                            type="button"
                            className="commandTextButton"
                            onClick={manageUnitTenant}
                          >
                            Manage →
                          </button>
                        )}
                      </div>

                      {unitTenancy ? (
                        <div className="commandTenantProfile">
                          <div className="commandTenantAvatar">
                            {(
                              unitTenancy.tenant_name ||
                              unitTenancy.tenant_email ||
                              "T"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="commandTenantIdentity">
                            <h3>
                              {unitTenancy.tenant_name || "Active Tenant"}
                            </h3>

                            <p>
                              {unitTenancy.tenant_email || "No email on file"}
                            </p>

                            <p>
                              {unitTenancy.tenant_phone || "No phone on file"}
                            </p>
                          </div>

                          <div className="commandTenantRent">
                            <small>MONTHLY RENT</small>

                            <b>
                              $
                              {Number(
                                unitTenancy.monthly_rent || 0,
                              ).toLocaleString()}
                            </b>

                            <span className="commandStatusGood">Active</span>
                          </div>
                        </div>
                      ) : (
                        <div className="commandEmptyState">
                          <div className="commandEmptyIcon">♙</div>

                          <h3>
                            No tenant assigned to {selectedUnit.unit_name}
                          </h3>

                          <p>
                            Add a tenant to this unit to begin tracking their
                            lease, rent and resident information.
                          </p>

                          <button
                            type="button"
                            className="primary"
                            onClick={openAddTenantForUnit}
                          >
                            + Add Tenant
                          </button>
                        </div>
                      )}
                    </section>

                    <section className="commandCard">
                      <div className="commandCardHeader">
                        <div>
                          <span className="commandSectionIcon">▤</span>

                          <div>
                            <h2>Lease</h2>
                            <p>Rental agreement for {selectedUnit.unit_name}</p>
                          </div>
                        </div>

                        {unitTenancy && (
                          <button
                            type="button"
                            className="commandTextButton"
                            onClick={manageUnitTenant}
                          >
                            Manage →
                          </button>
                        )}
                      </div>

                      {unitTenancy ? (
                        <div className="commandLeaseDetails">
                          <div>
                            <small>LEASE START</small>
                            <b>{formatUnitDate(unitTenancy.start_date)}</b>
                          </div>

                          <div>
                            <small>LEASE END</small>
                            <b>{formatUnitDate(unitTenancy.end_date)}</b>
                          </div>

                          <div>
                            <small>MONTHLY RENT</small>
                            <b>
                              $
                              {Number(
                                unitTenancy.monthly_rent || 0,
                              ).toLocaleString()}
                            </b>
                          </div>

                          <div>
                            <small>STATUS</small>
                            <b>Active</b>
                          </div>
                        </div>
                      ) : (
                        <div className="commandEmptyState">
                          <div className="commandEmptyIcon">▤</div>

                          <h3>No active lease</h3>

                          <p>
                            Lease information will appear after a tenant is
                            assigned to this unit.
                          </p>
                        </div>
                      )}
                    </section>

                    <section className="commandCard">
                      <div className="commandCardHeader">
                        <div>
                          <span className="commandSectionIcon">$</span>

                          <div>
                            <h2>Rent & Ledger</h2>
                            <p>Rent activity for {selectedUnit.unit_name}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="commandTextButton"
                          onClick={() => setView("rent")}
                        >
                          View Rent →
                        </button>
                      </div>

                      <div className="commandRentSummary">
                        <div>
                          <small>MONTHLY RENT</small>

                          <b>${unitMonthlyRent.toLocaleString()}</b>
                        </div>

                        <div>
                          <small>COLLECTED</small>

                          <b>${unitCollected.toLocaleString()}</b>
                        </div>

                        <div>
                          <small>OUTSTANDING</small>

                          <b>${unitOutstanding.toLocaleString()}</b>
                        </div>
                      </div>

                      {unitCharges.length === 0 && unitPayments.length === 0 ? (
                        <div className="commandEmptyState compact">
                          <div className="commandEmptyIcon">$</div>

                          <h3>No rent activity</h3>

                          <p>
                            Rent charges and payments for this unit will appear
                            here.
                          </p>
                        </div>
                      ) : (
                        <div className="commandLedgerPreview">
                          {unitCharges.slice(0, 4).map((charge) => {
                            const paidForCharge = paymentAllocations
                              .filter(
                                (allocation) =>
                                  allocation.charge_id === charge.id &&
                                  unitPaymentIds.has(allocation.payment_id),
                              )
                              .reduce(
                                (total, allocation) =>
                                  total + Number(allocation.amount || 0),
                                0,
                              );

                            const remaining = Math.max(
                              Number(charge.amount || 0) - paidForCharge,
                              0,
                            );

                            return (
                              <div className="commandLedgerRow" key={charge.id}>
                                <div>
                                  <b>{charge.description || "Rent Charge"}</b>

                                  <span>
                                    Due {formatUnitDate(charge.due_date)}
                                  </span>
                                </div>

                                <div>
                                  <b>
                                    $
                                    {Number(
                                      charge.amount || 0,
                                    ).toLocaleString()}
                                  </b>

                                  <span>
                                    {remaining <= 0
                                      ? "Paid"
                                      : `$${remaining.toLocaleString()} due`}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  </div>

                  <div className="commandSideColumn">
                    <section className="commandCard">
                      <div className="commandCardHeader">
                        <div>
                          <span className="commandSectionIcon">◇</span>

                          <div>
                            <h2>Maintenance</h2>
                            <p>{selectedUnit.unit_name} repair requests</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="commandTextButton"
                          onClick={() => setView("maintenance")}
                        >
                          View All →
                        </button>
                      </div>

                      <div className="commandEmptyState compact">
                        <div className="commandEmptyIcon">✓</div>

                        <h3>0 Open Requests</h3>

                        <p>No maintenance issues reported for this unit.</p>
                      </div>
                    </section>

                    <section className="commandCard">
                      <div className="commandCardHeader">
                        <div>
                          <span className="commandSectionIcon">▧</span>

                          <div>
                            <h2>Documents</h2>
                            <p>Unit files and agreements</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="commandTextButton"
                          onClick={() => setView("documents")}
                        >
                          View All →
                        </button>
                      </div>

                      <div className="commandEmptyState compact">
                        <div className="commandEmptyIcon">▧</div>

                        <h3>No unit documents</h3>

                        <p>
                          Leases, notices and other unit files will appear here.
                        </p>
                      </div>
                    </section>

                    <section className="commandCard">
                      <div className="commandCardHeader">
                        <div>
                          <span className="commandSectionIcon">⌂</span>

                          <div>
                            <h2>Unit Information</h2>
                            <p>Rental unit details</p>
                          </div>
                        </div>
                      </div>

                      <div className="commandPropertyInfo">
                        <div>
                          <span>Property</span>
                          <b>{selectedProperty.address}</b>
                        </div>

                        <div>
                          <span>Unit</span>
                          <b>{selectedUnit.unit_name}</b>
                        </div>

                        <div>
                          <span>Status</span>
                          <b>
                            {unitOccupied
                              ? "Occupied"
                              : selectedUnit.status
                                ? selectedUnit.status.charAt(0).toUpperCase() +
                                  selectedUnit.status.slice(1)
                                : "Vacant"}
                          </b>
                        </div>

                        <div>
                          <span>Bedrooms</span>
                          <b>{selectedUnit.bedrooms ?? "—"}</b>
                        </div>

                        <div>
                          <span>Bathrooms</span>
                          <b>{selectedUnit.bathrooms ?? "—"}</b>
                        </div>

                        <div>
                          <span>Square Feet</span>
                          <b>
                            {selectedUnit.square_feet
                              ? Number(
                                  selectedUnit.square_feet,
                                ).toLocaleString()
                              : "—"}
                          </b>
                        </div>

                        <div>
                          <span>Market Rent</span>
                          <b>
                            $
                            {Number(
                              selectedUnit.market_rent || 0,
                            ).toLocaleString()}
                          </b>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </section>
            );
          })()}

               {/* =========================================================
            TENANT MANAGEMENT
        ========================================================= */}

        {view === "addTenant" && (
          <section className="panel">
            <button
              type="button"
              onClick={() => {
                setSelectedUnit(null);
                setView("tenants");
              }}
            >
              ← Back to Tenants
            </button>

            <small>NEW TENANT</small>
            <h1>Invite Tenant</h1>

            <p className="dashboardSubtitle">
              Add the tenant's lease information and send them an invitation
              to join Unitvero.
            </p>

            {props.length === 0 ? (
              <div className="featureEmpty">
                <div className="featureEmptyIcon">⌂</div>
                <b>No properties available</b>
                <span>Add a property before inviting a tenant.</span>

                <button
                  type="button"
                  className="primary"
                  onClick={() => setView("properties")}
                >
                  Go to Properties
                </button>
              </div>
            ) : (
              <form
                className="addTenantForm"
                onSubmit={async (e) => {
                  e.preventDefault();

                  const form = e.currentTarget;
                  const submitButton = form.querySelector(
                    'button[type="submit"]',
                  );

                  if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = "Creating invitation...";
                  }

                  try {
                    const s = supabase();

                    const {
                      data: { user },
                      error: userError,
                    } = await s.auth.getUser();

                    if (userError || !user) {
                      throw new Error(
                        userError?.message ||
                          "Your session expired. Please sign in again.",
                      );
                    }

                    const propertyId = form.propertyId.value;
                    const unitId = form.unitId?.value || null;
                    const tenantName = form.tenantName.value.trim();
                    const tenantEmail = form.tenantEmail.value
                      .trim()
                      .toLowerCase();
                    const tenantPhone = form.tenantPhone.value.trim();
                    const monthlyRent = Number(form.monthlyRent.value || 0);
                    const startDate = form.startDate.value;
                    const endDate = form.endDate.value || null;

                    if (!propertyId) {
                      throw new Error("Select a property.");
                    }

                    if (!tenantName) {
                      throw new Error("Enter the tenant's full name.");
                    }

                    if (!tenantEmail) {
                      throw new Error("Enter the tenant's email address.");
                    }

                    if (!startDate) {
                      throw new Error("Enter the lease start date.");
                    }

                    if (endDate && endDate < startDate) {
                      throw new Error(
                        "Lease end date cannot be before the lease start date.",
                      );
                    }

                    const property = props.find(
                      (item) => item.id === propertyId,
                    );

                    if (!property) {
                      throw new Error("The selected property could not be found.");
                    }

                    const propertyUnits = unitsForProperty(propertyId);

                    if (
                      isMultiFamily(property) &&
                      propertyUnits.length > 0 &&
                      !unitId
                    ) {
                      throw new Error("Select a unit for this tenant.");
                    }

                    const chosenUnit = unitId
                      ? units.find((item) => item.id === unitId)
                      : null;

                    const duplicateTenant = tenancies.find(
                      (item) =>
                        item.status === "active" &&
                        (item.property_id === propertyId ||
                          (unitId && item.unit_id === unitId)) &&
                        item.tenant_email?.toLowerCase() === tenantEmail,
                    );

                    if (duplicateTenant) {
                      throw new Error(
                        "This tenant is already active at the selected property.",
                      );
                    }

                    if (unitId) {
                      const occupiedUnit = tenancies.find(
                        (item) =>
                          item.unit_id === unitId &&
                          item.status === "active",
                      );

                      if (occupiedUnit) {
                        throw new Error(
                          "That unit already has an active tenant.",
                        );
                      }
                    } else if (!isMultiFamily(property)) {
                      const occupiedProperty = tenancies.find(
                        (item) =>
                          item.property_id === propertyId &&
                          !item.unit_id &&
                          item.status === "active",
                      );

                      if (occupiedProperty) {
                        throw new Error(
                          "That property already has an active tenant.",
                        );
                      }
                    }

                    const {
                      data: { session },
                      error: sessionError,
                    } = await s.auth.getSession();

                    if (sessionError || !session?.access_token) {
                      throw new Error(
                        "Your session expired. Please sign in again.",
                      );
                    }

                    /*
                     * Create the secure invitation FIRST.
                     * We do not create the active tenancy unless the
                     * invitation record was successfully created.
                     */
                    const invitationResponse = await fetch(
                      "/api/tenant-invitations",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${session.access_token}`,
                        },
                        body: JSON.stringify({
                          propertyId,
                          tenantName,
                          tenantEmail,
                        }),
                      },
                    );

                    let invitationResult = {};

                    try {
                      invitationResult = await invitationResponse.json();
                    } catch {
                      invitationResult = {};
                    }

                    if (!invitationResponse.ok) {
                      throw new Error(
                        invitationResult?.error ||
                          "Could not create the tenant invitation.",
                      );
                    }

                    /*
                     * Save the lease/tenancy information.
                     */
                    const { data: newTenancy, error: tenancyError } = await s
                      .from("tenancies")
                      .insert({
                        property_id: propertyId,
                        unit_id: unitId,
                        tenant_email: tenantEmail,
                        tenant_name: tenantName,
                        tenant_phone: tenantPhone,
                        monthly_rent: monthlyRent,
                        start_date: startDate,
                        end_date: endDate,
                        status: "active",
                      })
                      .select()
                      .single();

                    if (tenancyError) {
                      throw new Error(
                        "Invitation was created, but the tenant record could not be saved: " +
                          tenancyError.message,
                      );
                    }

                    /*
                     * Mark a selected unit occupied.
                     */
                    if (chosenUnit) {
                      const { error: unitError } = await s
                        .from("units")
                        .update({
                          status: "occupied",
                          updated_at: new Date().toISOString(),
                        })
                        .eq("id", chosenUnit.id);

                      if (unitError) {
                        console.error(
                          "Could not update unit status:",
                          unitError,
                        );
                      }
                    }

                    setSelectedProperty(property);
                    setSelectedUnit(chosenUnit || null);
                    setSelectedTenancy(newTenancy);

                    await load();

                    form.reset();

                    alert(
                      `${tenantName} was added successfully.\n\n` +
                        `Invitation created for ${tenantEmail}.`,
                    );

                    setSelectedUnit(null);
                    setView("tenants");
                  } catch (error) {
                    console.error("Tenant invitation error:", error);

                    alert(
                      error?.message ||
                        "Something went wrong while inviting the tenant.",
                    );
                  } finally {
                    if (submitButton) {
                      submitButton.disabled = false;
                      submitButton.textContent =
                        "Add Tenant & Create Invitation";
                    }
                  }
                }}
              >
                <div className="tenantFormGrid">
                  <label>
                    Property
                    <select
                      name="propertyId"
                      required
                      defaultValue={selectedProperty?.id || ""}
                      onChange={(e) => {
                        const property = props.find(
                          (item) => item.id === e.target.value,
                        );

                        setSelectedProperty(property || null);
                        setSelectedUnit(null);
                      }}
                    >
                      <option value="">Select property</option>

                      {props.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.address}
                          {property.city ? `, ${property.city}` : ""}
                          {property.state ? ` ${property.state}` : ""}
                        </option>
                      ))}
                    </select>
                  </label>

                  {selectedProperty &&
                    unitsForProperty(selectedProperty.id).length > 0 && (
                      <label>
                        Unit
                        <select
                          name="unitId"
                          value={selectedUnit?.id || ""}
                          onChange={(e) => {
                            const unit = units.find(
                              (item) => item.id === e.target.value,
                            );

                            setSelectedUnit(unit || null);
                          }}
                          required={isMultiFamily(selectedProperty)}
                        >
                          <option value="">Select unit</option>

                          {unitsForProperty(selectedProperty.id).map((unit) => {
                            const activeTenant = tenancies.find(
                              (item) =>
                                item.unit_id === unit.id &&
                                item.status === "active",
                            );

                            return (
                              <option
                                key={unit.id}
                                value={unit.id}
                                disabled={Boolean(activeTenant)}
                              >
                                {unit.unit_name}
                                {activeTenant ? " — Occupied" : " — Available"}
                              </option>
                            );
                          })}
                        </select>
                      </label>
                    )}

                  <label>
                    Full Name
                    <input
                      name="tenantName"
                      type="text"
                      placeholder="Tenant full name"
                      autoComplete="name"
                      required
                    />
                  </label>

                  <label>
                    Email Address
                    <input
                      name="tenantEmail"
                      type="email"
                      placeholder="tenant@email.com"
                      autoComplete="email"
                      required
                    />
                  </label>

                  <label>
                    Phone Number
                    <input
                      name="tenantPhone"
                      type="tel"
                      placeholder="(502) 555-1234"
                      autoComplete="tel"
                    />
                  </label>

                  <label>
                    Monthly Rent
                    <input
                      name="monthlyRent"
                      type="number"
                      min="0"
                      step="0.01"
                      key={
                        selectedUnit?.id ||
                        selectedProperty?.id ||
                        "monthly-rent"
                      }
                      defaultValue={
                        selectedUnit?.market_rent ||
                        selectedProperty?.monthly_rent ||
                        ""
                      }
                      placeholder="0.00"
                      required
                    />
                  </label>

                  <label>
                    Lease Start Date
                    <input name="startDate" type="date" required />
                  </label>

                  <label>
                    Lease End Date
                    <input name="endDate" type="date" />
                  </label>
                </div>

                {selectedProperty && (
                  <div className="featureEmpty">
                    <b>Invitation destination</b>

                    <span>
                      {selectedProperty.address}
                      {selectedUnit
                        ? ` • ${selectedUnit.unit_name}`
                        : ""}
                    </span>

                    <span>
                      The tenant will receive access to only the rental
                      information connected to this tenancy.
                    </span>
                  </div>
                )}

                <div className="tenantFormActions">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUnit(null);
                      setView("tenants");
                    }}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="primary">
                    Add Tenant & Create Invitation
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        {view === "tenants" && (
          <section className="panel">
            <div className="dashboardHeader">
              <div>
                <small>TENANT MANAGEMENT</small>

                <h1>Tenants</h1>

                <p className="dashboardSubtitle">
                  Manage tenants, leases and invitations across your rental
                  portfolio.
                </p>
              </div>

              <button
                type="button"
                className="primary"
                onClick={() => {
                  setSelectedProperty(null);
                  setSelectedUnit(null);
                  setSelectedTenancy(null);
                  setView("addTenant");
                }}
              >
                + Invite Tenant
              </button>
            </div>

            {tenancies.length === 0 ? (
              <div className="featureEmpty">
                <div className="featureEmptyIcon">♙</div>

                <b>No tenants yet</b>

                <span>
                  Invite your first tenant and connect them to a property.
                </span>

                <button
                  type="button"
                  className="primary"
                  onClick={() => {
                    setSelectedProperty(null);
                    setSelectedUnit(null);
                    setSelectedTenancy(null);
                    setView("addTenant");
                  }}
                >
                  + Invite Tenant
                </button>
              </div>
            ) : (
              <div className="activityList">
                {tenancies.map((tenancy) => {
                  const property = props.find(
                    (item) => item.id === tenancy.property_id,
                  );

                  const unit = units.find(
                    (item) => item.id === tenancy.unit_id,
                  );

                  return (
                    <div className="activityRow" key={tenancy.id}>
                      <div className="activityTypeIcon">♙</div>

                      <div>
                        <b>
                          {tenancy.tenant_name ||
                            tenancy.tenant_email ||
                            "Tenant"}
                        </b>

                        <span>
                          {property?.address || "Property"}
                          {unit ? ` • ${unit.unit_name}` : ""}
                        </span>

                        <span>{tenancy.tenant_email}</span>

                        {tenancy.tenant_phone && (
                          <span>{tenancy.tenant_phone}</span>
                        )}

                        <span>
                          $
                          {Number(
                            tenancy.monthly_rent || 0,
                          ).toLocaleString()}{" "}
                          / month
                        </span>
                      </div>

                      <div>
                        <small>{tenancy.status || "active"}</small>

                        <button
                          type="button"
                          className="viewAllButton"
                          onClick={() => {
                            setEditingTenancy(tenancy);
                            setView("editTenant");
                          }}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="viewAllButton"
                          onClick={() =>
                            openOrCreateConversation(tenancy.id)
                          }
                        >
                          Message
                        </button>
                            <button
  type="button"
  className="viewAllButton"
  onClick={() => deleteTenant(tenancy)}
  style={{
    color: "#b42318",
    borderColor: "#f1c7c2",
  }}
>
  Delete
</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {view === "editTenant" && editingTenancy && (
          <section className="panel">
            <button
              type="button"
              onClick={() => {
                setEditingTenancy(null);
                setView("tenants");
              }}
            >
              ← Back to Tenants
            </button>

            <small>EDIT TENANT</small>

            <h1>
              {editingTenancy.tenant_name ||
                editingTenancy.tenant_email ||
                "Tenant"}
            </h1>

            <p className="dashboardSubtitle">
              Update tenant contact and lease information.
            </p>

            <form className="addTenantForm" onSubmit={saveTenant}>
              <div className="tenantFormGrid">
                <label>
                  Full Name
                  <input
                    name="tenantName"
                    type="text"
                    defaultValue={editingTenancy.tenant_name || ""}
                    required
                  />
                </label>

                <label>
                  Email Address
                  <input
                    name="tenantEmail"
                    type="email"
                    defaultValue={editingTenancy.tenant_email || ""}
                    required
                  />
                </label>

                <label>
                  Phone Number
                  <input
                    name="tenantPhone"
                    type="tel"
                    defaultValue={editingTenancy.tenant_phone || ""}
                  />
                </label>

                <label>
                  Monthly Rent
                  <input
                    name="monthlyRent"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={editingTenancy.monthly_rent || 0}
                    required
                  />
                </label>

                <label>
                  Lease Start Date
                  <input
                    name="startDate"
                    type="date"
                    defaultValue={editingTenancy.start_date || ""}
                    required
                  />
                </label>

                <label>
                  Lease End Date
                  <input
                    name="endDate"
                    type="date"
                    defaultValue={editingTenancy.end_date || ""}
                  />
                </label>
              </div>

              <div className="tenantFormActions">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTenancy(null);
                    setView("tenants");
                  }}
                >
                  Cancel
                </button>

                <button type="submit" className="primary">
                  Save Tenant
                </button>
              </div>
            </form>
          </section>
        )}

        {view === "leases" && (
          <section className="panel">
            <div className="dashboardHeader">
              <div>
                <small>LEASE MANAGEMENT</small>
                <h1>Leases</h1>

                <p className="dashboardSubtitle">
                  Review active rental agreements and lease dates.
                </p>
              </div>
            </div>

            <div className="activityList">
              {tenancies.length === 0 && (
                <div className="featureEmpty">
                  <div className="featureEmptyIcon">▤</div>

                  <b>No active leases</b>

                  <span>
                    Lease information will appear after a tenant is added.
                  </span>
                </div>
              )}

              {tenancies.map((tenancy) => {
                const property = props.find(
                  (p) => p.id === tenancy.property_id,
                );

                return (
                  <div className="activityRow" key={tenancy.id}>
                    <div className="activityTypeIcon">▤</div>

                    <div>
                      <b>{tenancy.tenant_name || tenancy.tenant_email}</b>

                      <span>{property?.address || "Property"}</span>

                      <span>
                        {tenancy.start_date
                          ? new Date(
                              tenancy.start_date + "T00:00:00",
                            ).toLocaleDateString()
                          : "No start date"}
                        {" – "}
                        {tenancy.end_date
                          ? new Date(
                              tenancy.end_date + "T00:00:00",
                            ).toLocaleDateString()
                          : "Open ended"}
                      </span>

                      <span>
                        ${Number(tenancy.monthly_rent || 0).toLocaleString()} /
                        month
                      </span>
                    </div>

                    <div>
                      <small>{tenancy.status || "active"}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {view === "applications" && (
          <section className="applicationsPage">
            <div className="dashboardHeader applicationsHeader">
              <div>
                <small>LEASING PIPELINE</small>
                <h1>Applications</h1>

                <p className="dashboardSubtitle">
                  Review applicants, request tenant screening and make leasing
                  decisions.
                </p>
              </div>

              <button
                type="button"
                className="primary"
                onClick={() => {
                  setView("newApplication");
                }}
              >
                + New Application
              </button>
            </div>

            <div className="applicationStats">
              <article>
                <div className="applicationStatIcon">▣</div>

                <div>
                  <span>Total Applications</span>
                  <b>{applications.length}</b>
                  <small>ALL APPLICANTS</small>
                </div>
              </article>

              <article>
                <div className="applicationStatIcon new">+</div>

                <div>
                  <span>New</span>

                  <b>
                    {
                      applications.filter(
                        (application) =>
                          application.application_status === "new",
                      ).length
                    }
                  </b>

                  <small>NEEDS REVIEW</small>
                </div>
              </article>

              <article>
                <div className="applicationStatIcon screening">◉</div>

                <div>
                  <span>Screening</span>

                  <b>
                    {
                      applications.filter(
                        (application) =>
                          application.application_status === "screening",
                      ).length
                    }
                  </b>

                  <small>IN PROGRESS</small>
                </div>
              </article>

              <article>
                <div className="applicationStatIcon approved">✓</div>

                <div>
                  <span>Approved</span>

                  <b>
                    {
                      applications.filter(
                        (application) =>
                          application.application_status === "approved",
                      ).length
                    }
                  </b>

                  <small>READY FOR LEASE</small>
                </div>
              </article>
            </div>

            <section className="applicationDirectory">
              <div className="applicationDirectoryHeader">
                <div>
                  <h2>Rental Applications</h2>

                  <p>Review applicant information and screening progress.</p>
                </div>

                <span className="applicationCount">
                  {applications.length}{" "}
                  {applications.length === 1 ? "application" : "applications"}
                </span>
              </div>

              {applications.length === 0 ? (
                <div className="applicationEmpty">
                  <div className="applicationEmptyIcon">▣</div>

                  <h3>No applications yet</h3>

                  <p>
                    Create an application to begin reviewing future tenants.
                  </p>

                  <button
                    type="button"
                    className="primary"
                    onClick={() => {
                      setView("newApplication");
                    }}
                  >
                    + Create Application
                  </button>
                </div>
              ) : (
                <div className="applicationTable">
                  <div className="applicationTableHeader">
                    <span>Applicant</span>
                    <span>Property</span>
                    <span>Screening</span>
                    <span>Status</span>
                    <span>Submitted</span>
                    <span></span>
                  </div>

                  {applications.map((application) => {
                    const property = props.find(
                      (p) => p.id === application.property_id,
                    );

                    const status = application.application_status || "new";

                    const screeningStatus =
                      application.screening_status || "not_started";

                    return (
                      <div className="applicationTableRow" key={application.id}>
                        <div className="applicationPerson">
                          <div className="applicationAvatar">
                            {application.applicant_name
                              ?.charAt(0)
                              .toUpperCase() || "A"}
                          </div>

                          <div>
                            <b>{application.applicant_name}</b>

                            <span>{application.applicant_email}</span>
                          </div>
                        </div>

                        <div className="applicationProperty">
                          <b>{property?.address || "No property selected"}</b>

                          <span>
                            {property
                              ? `${property.city}, ${property.state}`
                              : "—"}
                          </span>
                        </div>

                        <span
                          className={`applicationStatusBadge screening-${screeningStatus}`}
                        >
                          {screeningStatus.replaceAll("_", " ")}
                        </span>

                        <span
                          className={`applicationStatusBadge status-${status}`}
                        >
                          {status.replaceAll("_", " ")}
                        </span>

                        <span className="applicationSubmitted">
                          {application.created_at
                            ? new Date(
                                application.created_at,
                              ).toLocaleDateString()
                            : "—"}
                        </span>

                        <button
                          type="button"
                          className="applicationReviewButton"
                          onClick={() => {
                            setSelectedApplication(application);
                            setView("applicationDetails");
                          }}
                        >
                          Review →
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </section>
        )}

        {view === "newApplication" && (
          <section className="applicationFormPage">
            <button
              type="button"
              className="propertyBackButton"
              onClick={() => {
                setView("applications");
              }}
            >
              ← Back to Applications
            </button>

            <div className="applicationFormHeader">
              <small>NEW RENTAL APPLICATION</small>
              <h1>Create Application</h1>

              <p>
                Enter the applicant&apos;s rental information. Tenant screening
                can be requested after the application is created.
              </p>
            </div>

            <form
              className="rentalApplicationForm"
              onSubmit={async (e) => {
                e.preventDefault();

                const form = e.currentTarget;
                const s = supabase();

                const {
                  data: { user },
                  error: userError,
                } = await s.auth.getUser();

                if (userError || !user) {
                  alert(
                    "Authentication error: " +
                      (userError?.message || "No user found"),
                  );
                  return;
                }

                const petValue = form.hasPets.value === "yes";

                const applicationRecord = {
                  landlord_id: user.id,

                  property_id: form.propertyId.value || null,

                  applicant_name: form.applicantName.value.trim(),

                  applicant_email: form.applicantEmail.value.trim(),

                  applicant_phone: form.applicantPhone.value.trim() || null,

                  current_address: form.currentAddress.value.trim() || null,

                  current_city: form.currentCity.value.trim() || null,

                  current_state: form.currentState.value.trim() || null,

                  current_zip: form.currentZip.value.trim() || null,

                  employer_name: form.employerName.value.trim() || null,

                  job_title: form.jobTitle.value.trim() || null,

                  monthly_income: form.monthlyIncome.value
                    ? Number(form.monthlyIncome.value)
                    : null,

                  current_landlord_name:
                    form.currentLandlordName.value.trim() || null,

                  current_landlord_phone:
                    form.currentLandlordPhone.value.trim() || null,

                  current_rent: form.currentRent.value
                    ? Number(form.currentRent.value)
                    : null,

                  previous_address: form.previousAddress.value.trim() || null,

                  occupants_count: Number(form.occupantsCount.value || 1),

                  occupants_details: form.occupantsDetails.value.trim() || null,

                  has_pets: petValue,

                  pets_details: petValue
                    ? form.petsDetails.value.trim() || null
                    : null,

                  vehicles_details: form.vehiclesDetails.value.trim() || null,

                  application_status: "new",
                  screening_status: "not_started",
                };

                const { data, error } = await s
                  .from("rental_applications")
                  .insert(applicationRecord)
                  .select()
                  .single();

                if (error) {
                  alert("Could not create application: " + error.message);
                  return;
                }

                setApplications([data, ...applications]);

                setSelectedApplication(data);
                alert("Rental application created successfully!");

                setView("applicationDetails");
              }}
            >
              <section className="applicationFormCard">
                <div className="applicationFormSectionHeader">
                  <span>01</span>

                  <div>
                    <h2>Applicant Information</h2>

                    <p>Basic contact and current address information.</p>
                  </div>
                </div>

                <div className="applicationFormGrid">
                  <label>
                    Full Name *
                    <input
                      name="applicantName"
                      type="text"
                      placeholder="Applicant full name"
                      required
                    />
                  </label>

                  <label>
                    Email Address *
                    <input
                      name="applicantEmail"
                      type="email"
                      placeholder="applicant@email.com"
                      required
                    />
                  </label>

                  <label>
                    Phone Number
                    <input
                      name="applicantPhone"
                      type="tel"
                      placeholder="(502) 555-1234"
                    />
                  </label>

                  <label>
                    Rental Property
                    <select name="propertyId">
                      <option value="">Select property</option>

                      {props.map((property) => (
                        <option value={property.id} key={property.id}>
                          {property.address}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="applicationWideField">
                    Current Street Address
                    <input
                      name="currentAddress"
                      type="text"
                      placeholder="Street address"
                    />
                  </label>

                  <label>
                    City
                    <input name="currentCity" type="text" placeholder="City" />
                  </label>

                  <label>
                    State
                    <input
                      name="currentState"
                      type="text"
                      placeholder="State"
                    />
                  </label>

                  <label>
                    ZIP Code
                    <input name="currentZip" type="text" placeholder="ZIP" />
                  </label>
                </div>
              </section>

              <section className="applicationFormCard">
                <div className="applicationFormSectionHeader">
                  <span>02</span>

                  <div>
                    <h2>Employment & Income</h2>

                    <p>Employment details used during application review.</p>
                  </div>
                </div>

                <div className="applicationFormGrid">
                  <label>
                    Employer
                    <input
                      name="employerName"
                      type="text"
                      placeholder="Employer name"
                    />
                  </label>

                  <label>
                    Job Title
                    <input
                      name="jobTitle"
                      type="text"
                      placeholder="Job title"
                    />
                  </label>

                  <label>
                    Monthly Income
                    <input
                      name="monthlyIncome"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </label>
                </div>
              </section>

              <section className="applicationFormCard">
                <div className="applicationFormSectionHeader">
                  <span>03</span>

                  <div>
                    <h2>Rental History</h2>

                    <p>Current landlord and previous housing information.</p>
                  </div>
                </div>

                <div className="applicationFormGrid">
                  <label>
                    Current Landlord
                    <input
                      name="currentLandlordName"
                      type="text"
                      placeholder="Landlord name"
                    />
                  </label>

                  <label>
                    Landlord Phone
                    <input
                      name="currentLandlordPhone"
                      type="tel"
                      placeholder="Phone number"
                    />
                  </label>

                  <label>
                    Current Monthly Rent
                    <input
                      name="currentRent"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </label>

                  <label className="applicationWideField">
                    Previous Address
                    <input
                      name="previousAddress"
                      type="text"
                      placeholder="Previous rental address"
                    />
                  </label>
                </div>
              </section>

              <section className="applicationFormCard">
                <div className="applicationFormSectionHeader">
                  <span>04</span>

                  <div>
                    <h2>Household</h2>

                    <p>Occupants, pets and vehicle information.</p>
                  </div>
                </div>

                <div className="applicationFormGrid">
                  <label>
                    Number of Occupants
                    <input
                      name="occupantsCount"
                      type="number"
                      min="1"
                      defaultValue="1"
                    />
                  </label>

                  <label>
                    Pets
                    <select name="hasPets" defaultValue="no">
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </label>

                  <label className="applicationWideField">
                    Occupant Details
                    <textarea
                      name="occupantsDetails"
                      rows="3"
                      placeholder="Names and relationship of additional occupants"
                    />
                  </label>

                  <label className="applicationWideField">
                    Pet Details
                    <textarea
                      name="petsDetails"
                      rows="3"
                      placeholder="Type, breed, size, etc."
                    />
                  </label>

                  <label className="applicationWideField">
                    Vehicles
                    <textarea
                      name="vehiclesDetails"
                      rows="3"
                      placeholder="Vehicle make, model and year"
                    />
                  </label>
                </div>
              </section>

              <div className="screeningConsentNotice">
                <b>Tenant screening is handled separately</b>

                <span>
                  Do not enter Social Security numbers, credit card information
                  or consumer report data in this form. Screening authorization
                  will be handled by the screening provider.
                </span>
              </div>

              <div className="applicationFormActions">
                <button
                  type="button"
                  onClick={() => {
                    setView("applications");
                  }}
                >
                  Cancel
                </button>

                <button type="submit" className="primary">
                  Create Application
                </button>
              </div>
            </form>
          </section>
        )}

        {view === "applicationDetails" && selectedApplication && (
          <section className="applicationDetailsPage">
            <button
              type="button"
              className="propertyBackButton"
              onClick={() => {
                setSelectedApplication(null);
                setView("applications");
              }}
            >
              ← Back to Applications
            </button>

            <div className="applicationDetailsHeader">
              <div className="applicationApplicantHeading">
                <div className="applicationLargeAvatar">
                  {selectedApplication.applicant_name
                    ?.charAt(0)
                    .toUpperCase() || "A"}
                </div>

                <div>
                  <small>APPLICATION REVIEW</small>

                  <h1>{selectedApplication.applicant_name}</h1>

                  <p>
                    {props.find((p) => p.id === selectedApplication.property_id)
                      ?.address || "No property selected"}
                  </p>
                </div>
              </div>

              <div className="applicationHeaderStatus">
                <span
                  className={`applicationStatusBadge status-${
                    selectedApplication.application_status || "new"
                  }`}
                >
                  {(selectedApplication.application_status || "new").replaceAll(
                    "_",
                    " ",
                  )}
                </span>

                <small>
                  Submitted{" "}
                  {selectedApplication.created_at
                    ? new Date(
                        selectedApplication.created_at,
                      ).toLocaleDateString()
                    : "—"}
                </small>
              </div>
            </div>

            <div className="applicationDetailsGrid">
              <div className="applicationDetailsMain">
                <section className="applicationDetailCard">
                  <div className="applicationDetailCardHeader">
                    <div>
                      <small>CONTACT</small>
                      <h2>Applicant Information</h2>
                    </div>

                    <span>01</span>
                  </div>

                  <div className="applicationDetailFields">
                    <div>
                      <span>Full Name</span>

                      <b>
                        {selectedApplication.applicant_name || "Not provided"}
                      </b>
                    </div>

                    <div>
                      <span>Email Address</span>

                      <b>
                        {selectedApplication.applicant_email || "Not provided"}
                      </b>
                    </div>

                    <div>
                      <span>Phone Number</span>

                      <b>
                        {selectedApplication.applicant_phone || "Not provided"}
                      </b>
                    </div>

                    <div>
                      <span>Current Address</span>

                      <b>
                        {selectedApplication.current_address
                          ? `${selectedApplication.current_address}${
                              selectedApplication.current_city
                                ? `, ${selectedApplication.current_city}`
                                : ""
                            }${
                              selectedApplication.current_state
                                ? `, ${selectedApplication.current_state}`
                                : ""
                            }${
                              selectedApplication.current_zip
                                ? ` ${selectedApplication.current_zip}`
                                : ""
                            }`
                          : "Not provided"}
                      </b>
                    </div>
                  </div>
                </section>

                <section className="applicationDetailCard">
                  <div className="applicationDetailCardHeader">
                    <div>
                      <small>FINANCIAL</small>
                      <h2>Employment & Income</h2>
                    </div>

                    <span>02</span>
                  </div>

                  <div className="applicationDetailFields">
                    <div>
                      <span>Employer</span>

                      <b>
                        {selectedApplication.employer_name || "Not provided"}
                      </b>
                    </div>

                    <div>
                      <span>Job Title</span>

                      <b>{selectedApplication.job_title || "Not provided"}</b>
                    </div>

                    <div>
                      <span>Monthly Income</span>

                      <b>
                        {selectedApplication.monthly_income
                          ? `$${Number(
                              selectedApplication.monthly_income,
                            ).toLocaleString()}`
                          : "Not provided"}
                      </b>
                    </div>

                    <div>
                      <span>Current Rent</span>

                      <b>
                        {selectedApplication.current_rent
                          ? `$${Number(
                              selectedApplication.current_rent,
                            ).toLocaleString()}`
                          : "Not provided"}
                      </b>
                    </div>
                  </div>
                </section>

                <section className="applicationDetailCard">
                  <div className="applicationDetailCardHeader">
                    <div>
                      <small>HOUSING</small>
                      <h2>Rental History</h2>
                    </div>

                    <span>03</span>
                  </div>

                  <div className="applicationDetailFields">
                    <div>
                      <span>Current Landlord</span>

                      <b>
                        {selectedApplication.current_landlord_name ||
                          "Not provided"}
                      </b>
                    </div>

                    <div>
                      <span>Landlord Phone</span>

                      <b>
                        {selectedApplication.current_landlord_phone ||
                          "Not provided"}
                      </b>
                    </div>

                    <div className="applicationDetailWide">
                      <span>Previous Address</span>

                      <b>
                        {selectedApplication.previous_address || "Not provided"}
                      </b>
                    </div>
                  </div>
                </section>

                <section className="applicationDetailCard">
                  <div className="applicationDetailCardHeader">
                    <div>
                      <small>HOUSEHOLD</small>
                      <h2>Occupants & Property Details</h2>
                    </div>

                    <span>04</span>
                  </div>

                  <div className="applicationDetailFields">
                    <div>
                      <span>Occupants</span>

                      <b>{selectedApplication.occupants_count || 1}</b>
                    </div>

                    <div>
                      <span>Pets</span>

                      <b>{selectedApplication.has_pets ? "Yes" : "No"}</b>
                    </div>

                    <div className="applicationDetailWide">
                      <span>Occupant Details</span>

                      <b>
                        {selectedApplication.occupants_details ||
                          "Not provided"}
                      </b>
                    </div>

                    <div className="applicationDetailWide">
                      <span>Pet Details</span>

                      <b>
                        {selectedApplication.has_pets
                          ? selectedApplication.pets_details ||
                            "No details provided"
                          : "No pets"}
                      </b>
                    </div>

                    <div className="applicationDetailWide">
                      <span>Vehicles</span>

                      <b>
                        {selectedApplication.vehicles_details || "Not provided"}
                      </b>
                    </div>
                  </div>
                </section>
              </div>

              <aside className="applicationDetailsSidebar">
                <section className="screeningCenterCard">
                  <div className="screeningCenterHeader">
                    <div>
                      <small>TENANT SCREENING</small>
                      <h2>Screening Center</h2>
                    </div>

                    <span
                      className={`applicationStatusBadge screening-${
                        selectedApplication.screening_status || "not_started"
                      }`}
                    >
                      {(
                        selectedApplication.screening_status || "not_started"
                      ).replaceAll("_", " ")}
                    </span>
                  </div>

                  <p className="screeningCenterDescription">
                    Request applicant screening through TransUnion SmartMove.
                  </p>

                  <div className="screeningItems">
                    <div>
                      <span className="screeningItemIcon">✓</span>

                      <div>
                        <b>Identity Check</b>

                        <small>
                          {selectedApplication.screening_status === "completed"
                            ? "Provider completed"
                            : "Awaiting provider"}
                        </small>
                      </div>
                    </div>

                    <div>
                      <span className="screeningItemIcon">$</span>

                      <div>
                        <b>Credit Report</b>

                        <small>
                          {selectedApplication.screening_status === "completed"
                            ? "Provider completed"
                            : "Awaiting provider"}
                        </small>
                      </div>
                    </div>

                    <div>
                      <span className="screeningItemIcon">◇</span>

                      <div>
                        <b>Criminal Background</b>

                        <small>
                          {selectedApplication.screening_status === "completed"
                            ? "Provider completed"
                            : "Awaiting provider"}
                        </small>
                      </div>
                    </div>

                    <div>
                      <span className="screeningItemIcon">⌂</span>

                      <div>
                        <b>Eviction History</b>

                        <small>
                          {selectedApplication.screening_status === "completed"
                            ? "Provider completed"
                            : "Awaiting provider"}
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="screeningConsentNotice">
                    <b>Authorization handled by SmartMove</b>

                    <span>
                      SmartMove will email the applicant and collect their
                      authorization before releasing the screening reports.
                    </span>
                  </div>

                  <button
                    type="button"
                    className="primary screeningButton"
                    onClick={async () => {
                      const s = supabase();
                      const now = new Date().toISOString();

                      const { error } = await s
                        .from("rental_applications")
                        .update({
                          screening_status: "pending_consent",
                          screening_requested_at: now,
                          application_status: "screening",
                          updated_at: now,
                        })
                        .eq("id", selectedApplication.id);

                      if (error) {
                        alert("Could not start screening: " + error.message);
                        return;
                      }

                      const updatedApplication = {
                        ...selectedApplication,
                        screening_status: "pending_consent",
                        screening_requested_at: now,
                        application_status: "screening",
                      };

                      setSelectedApplication(updatedApplication);

                      setApplications(
                        applications.map((application) =>
                          application.id === selectedApplication.id
                            ? updatedApplication
                            : application,
                        ),
                      );

                      window.open(
                        "https://www.mysmartmove.com/landlord-tenant-screening",
                        "_blank",
                        "noopener,noreferrer",
                      );

                      alert(
                        "SmartMove opened in a new tab.\n\n" +
                          "Applicant: " +
                          selectedApplication.applicant_name +
                          "\nEmail: " +
                          selectedApplication.applicant_email +
                          "\n\nEnter this applicant email in SmartMove to send the screening request.",
                      );
                    }}
                  >
                    Start SmartMove Screening
                  </button>

                  {selectedApplication.screening_requested_at && (
                    <small className="screeningRequestedDate">
                      Screening started{" "}
                      {new Date(
                        selectedApplication.screening_requested_at,
                      ).toLocaleString()}
                    </small>
                  )}
                </section>

                <section className="applicationDecisionCard">
                  <small>LEASING DECISION</small>
                  <h2>Application Decision</h2>

                  <p>Update the application after completing your review.</p>

                  <div className="applicationDecisionActions">
                    <button
                      type="button"
                      className="approveApplicationButton"
                      onClick={async () => {
                        const s = supabase();
                        const now = new Date().toISOString();

                        const { error } = await s
                          .from("rental_applications")
                          .update({
                            application_status: "approved",
                            updated_at: now,
                          })
                          .eq("id", selectedApplication.id);

                        if (error) {
                          alert(
                            "Could not approve application: " + error.message,
                          );
                          return;
                        }

                        const updatedApplication = {
                          ...selectedApplication,
                          application_status: "approved",
                          updated_at: now,
                        };

                        setSelectedApplication(updatedApplication);

                        setApplications(
                          applications.map((application) =>
                            application.id === selectedApplication.id
                              ? updatedApplication
                              : application,
                          ),
                        );

                        alert("Application approved successfully.");
                      }}
                    >
                      ✓ Approve
                    </button>

                    <button
                      type="button"
                      className="denyApplicationButton"
                      onClick={async () => {
                        const confirmed = window.confirm(
                          "Mark this application as denied?",
                        );

                        if (!confirmed) return;

                        const s = supabase();
                        const now = new Date().toISOString();

                        const { error } = await s
                          .from("rental_applications")
                          .update({
                            application_status: "denied",
                            updated_at: now,
                          })
                          .eq("id", selectedApplication.id);

                        if (error) {
                          alert("Could not deny application: " + error.message);
                          return;
                        }

                        const updatedApplication = {
                          ...selectedApplication,
                          application_status: "denied",
                          updated_at: now,
                        };

                        setSelectedApplication(updatedApplication);

                        setApplications(
                          applications.map((application) =>
                            application.id === selectedApplication.id
                              ? updatedApplication
                              : application,
                          ),
                        );

                        alert("Application status updated to denied.");
                      }}
                    >
                      × Deny
                    </button>
                  </div>

                  <small className="applicationDecisionNote">
                    If a consumer report affects a leasing decision, follow
                    applicable adverse-action requirements.
                  </small>
                </section>

                <section className="applicationTimelineCard">
                  <small>ACTIVITY</small>
                  <h2>Application Timeline</h2>

                  <div className="applicationTimeline">
                    <div className="timelineItem complete">
                      <span></span>

                      <div>
                        <b>Application created</b>

                        <small>
                          {selectedApplication.created_at
                            ? new Date(
                                selectedApplication.created_at,
                              ).toLocaleString()
                            : "Created"}
                        </small>
                      </div>
                    </div>

                    {selectedApplication.screening_requested_at && (
                      <div className="timelineItem active">
                        <span></span>

                        <div>
                          <b>Screening pending consent</b>

                          <small>
                            {new Date(
                              selectedApplication.screening_requested_at,
                            ).toLocaleString()}
                          </small>
                        </div>
                      </div>
                    )}

                    <div className="timelineItem active">
                      <span></span>

                      <div>
                        <b>Application status</b>

                        <small>
                          {(
                            selectedApplication.application_status || "new"
                          ).replaceAll("_", " ")}
                        </small>
                      </div>
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          </section>
        )}


        {view === "rental-value" && (
          <section className="panel">
            <div className="applicationsHeader documentsHeader">
              <div>
                <small>RENTAL ANALYSIS</small>
                <h1>Rent Value & Comparable Properties</h1>
                <p>
                  Enter comparable rental properties to estimate a suggested
                  monthly rent range for one of your properties.
                </p>
              </div>
              <button
                type="button"
                className="secondary"
                onClick={() => setRentalCompRows([
                  { id: 1, address: "", rent: "", beds: "", baths: "", sqft: "" },
                  { id: 2, address: "", rent: "", beds: "", baths: "", sqft: "" },
                  { id: 3, address: "", rent: "", beds: "", baths: "", sqft: "" },
                ])}
              >
                Reset Comps
              </button>
            </div>

            <div style={{
              display:"grid",
              gridTemplateColumns:"minmax(240px,.8fr) minmax(0,2fr)",
              gap:18,
              marginTop:22,
            }}>
              <section className="commandCard">
                <h2>Subject Property</h2>
                <p>Select the property and enter its current rent.</p>

                <label style={{display:"grid",gap:6,marginTop:14}}>
                  <b>Property</b>
                  <select
                    value={rentalPropertyId}
                    onChange={(e) => {
                      setRentalPropertyId(e.target.value);
                      const property = props.find((p) => p.id === e.target.value);
                      if (property?.rent) setRentalMonthlyRent(String(property.rent));
                    }}
                  >
                    <option value="">Select property...</option>
                    {props.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.address}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{display:"grid",gap:6,marginTop:14}}>
                  <b>Current Monthly Rent</b>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={rentalMonthlyRent}
                    onChange={(e) => setRentalMonthlyRent(e.target.value)}
                    placeholder="1500"
                  />
                </label>

                <div style={{
                  marginTop:18,
                  padding:14,
                  border:"1px solid #dbe3ef",
                  borderRadius:14,
                  background:"#f8fafc",
                }}>
                  <b>How the suggestion works</b>
                  <p style={{margin:"7px 0 0",fontSize:13,color:"#5d6878"}}>
                    Unitvero calculates the average and median of the comparable
                    rents you enter and shows the observed low/high range. This is
                    an estimate, not an appraisal.
                  </p>
                </div>
              </section>

              <section className="commandCard">
                <div className="commandCardHeader">
                  <div>
                    <span className="commandSectionIcon">≈</span>
                    <div>
                      <h2>Comparable Rentals</h2>
                      <p>Use nearby properties that are reasonably similar.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="secondary"
                    onClick={addRentalCompRow}
                  >
                    + Add Comp
                  </button>
                </div>

                <div style={{display:"grid",gap:10,marginTop:16}}>
                  {rentalCompRows.map((row, index) => (
                    <div
                      key={row.id}
                      style={{
                        display:"grid",
                        gridTemplateColumns:"1.6fr .8fr .6fr .6fr .8fr auto",
                        gap:8,
                        alignItems:"end",
                        padding:12,
                        border:"1px solid #e1e7ef",
                        borderRadius:12,
                      }}
                    >
                      <label style={{display:"grid",gap:5}}>
                        <small>ADDRESS / AREA</small>
                        <input
                          value={row.address}
                          onChange={(e) => updateRentalCompRow(row.id,"address",e.target.value)}
                          placeholder={`Comparable ${index + 1}`}
                        />
                      </label>
                      <label style={{display:"grid",gap:5}}>
                        <small>RENT</small>
                        <input
                          type="number"
                          min="0"
                          value={row.rent}
                          onChange={(e) => updateRentalCompRow(row.id,"rent",e.target.value)}
                          placeholder="1500"
                        />
                      </label>
                      <label style={{display:"grid",gap:5}}>
                        <small>BEDS</small>
                        <input
                          type="number"
                          min="0"
                          value={row.beds}
                          onChange={(e) => updateRentalCompRow(row.id,"beds",e.target.value)}
                          placeholder="3"
                        />
                      </label>
                      <label style={{display:"grid",gap:5}}>
                        <small>BATHS</small>
                        <input
                          type="number"
                          min="0"
                          step=".5"
                          value={row.baths}
                          onChange={(e) => updateRentalCompRow(row.id,"baths",e.target.value)}
                          placeholder="2"
                        />
                      </label>
                      <label style={{display:"grid",gap:5}}>
                        <small>SQ FT</small>
                        <input
                          type="number"
                          min="0"
                          value={row.sqft}
                          onChange={(e) => updateRentalCompRow(row.id,"sqft",e.target.value)}
                          placeholder="1500"
                        />
                      </label>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => removeRentalCompRow(row.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {(() => {
                  const result = calculateRentalSuggestion(rentalCompRows);
                  return (
                    <div style={{
                      display:"grid",
                      gridTemplateColumns:"repeat(4,1fr)",
                      gap:10,
                      marginTop:18,
                    }}>
                      <div className="documentStatCard">
                        <small>OBSERVED LOW</small>
                        <b>{result.count ? `$${Math.round(result.low).toLocaleString()}` : "—"}</b>
                      </div>
                      <div className="documentStatCard">
                        <small>MEDIAN</small>
                        <b>{result.count ? `$${Math.round(result.median).toLocaleString()}` : "—"}</b>
                      </div>
                      <div className="documentStatCard">
                        <small>AVERAGE</small>
                        <b>{result.count ? `$${Math.round(result.average).toLocaleString()}` : "—"}</b>
                      </div>
                      <div className="documentStatCard">
                        <small>OBSERVED HIGH</small>
                        <b>{result.count ? `$${Math.round(result.high).toLocaleString()}` : "—"}</b>
                      </div>
                    </div>
                  );
                })()}

                <div style={{
                  marginTop:16,
                  padding:14,
                  borderRadius:12,
                  background:"#f8fafc",
                  color:"#5d6878",
                  fontSize:12,
                }}>
                  <b>Important:</b> Unitvero's calculator uses the comparable
                  information entered by the landlord. A future live-data integration
                  can supply verified market comps automatically. It should not be
                  represented as a licensed appraisal or guaranteed market rent.
                </div>
              </section>
            </div>
          </section>
        )}

        {view === "documents" && (
          <section className="documentsPage">
            <div className="applicationsHeader documentsHeader">
              <div>
                <small>DOCUMENT CENTER</small>
                <h1>Documents</h1>
                <p>
                  Create, save, print, deliver, and track rental documents from one place.
                </p>
                <span style={{fontWeight:800,fontSize:12}}>
                  {String(subscription?.plan_code || "free").toUpperCase()} PLAN
                </span>
              </div>

              <button
                type="button"
                className="primary"
                onClick={() => {
                  if (!requirePro("document_center", "Document Center")) return;
                  setDocumentBuilderOpen(true);
                }}
              >
                + Create Document
              </button>
            </div>

            <div className="documentStats">
              <article>
                <span>Documents</span>
                <b>{documents.length}</b>
                <small>ALL DOCUMENTS</small>
              </article>
              <article>
                <span>Awaiting Signature</span>
                <b>{documents.filter(d => ["sent","viewed","awaiting_signature"].includes(String(d.status || "").toLowerCase())).length}</b>
                <small>ESIGN</small>
              </article>
              <article>
                <span>Completed</span>
                <b>{documents.filter(d => ["signed","completed"].includes(String(d.status || "").toLowerCase())).length}</b>
                <small>SIGNED & STORED</small>
              </article>
              <article>
                <span>Drafts</span>
                <b>{documents.filter(d => String(d.status || "").toLowerCase() === "draft").length}</b>
                <small>READY TO REVIEW</small>
              </article>
            </div>

            <section className="commandCard" style={{marginTop:22}}>
              <div className="commandCardHeader">
                <div>
                  <span className="commandSectionIcon">◎</span>
                  <div>
                    <h2>50-State Template Framework</h2>
                    <p>
                      Unitvero ties each document to the property's jurisdiction
                      so the correct state template version can be selected.
                    </p>
                  </div>
                </div>
                <span>{unitveroStates.length} jurisdictions</span>
              </div>
              <div style={{
                display:"grid",
                gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",
                gap:8,
                marginTop:14,
              }}>
                {unitveroStates.map(([code, name]) => (
                  <div key={code} style={{
                    padding:"9px 10px",
                    border:"1px solid #e1e7ef",
                    borderRadius:10,
                    background:"#fff",
                  }}>
                    <b style={{fontSize:12}}>{code}</b>
                    <span style={{display:"block",fontSize:11,color:"#6b778c"}}>
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="documentLibrary">
              <div className="documentLibraryHeader">
                <div>
                  <h2>Document Builder</h2>
                  <p>
                    Select a document type, property, and tenant. Unitvero fills
                    the available rental information automatically.
                  </p>
                </div>
                <span>PRO WORKFLOW</span>
              </div>

              <div style={{
                display:"grid",
                gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",
                gap:14,
                marginTop:18
              }}>
                {[
                  ["lease","▤","Residential Lease"],
                  ["lease_renewal","↻","Lease Renewal"],
                  ["late_rent_notice","!","Late Rent Notice"],
                  ["notice_to_vacate","⌂","Notice to Vacate"],
                  ["notice_of_entry","⌁","Notice of Entry"],
                  ["rent_change_notice","$","Rent Change Notice"],
                  ["lease_addendum","+","Lease Addendum"],
                  ["move_in_out","✓","Move-In / Move-Out"],
                  ["custom","✎","Custom Document"],
                ].map(([type, icon, title]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      if (!requirePro("document_center", "Document Center")) return;
                      setDocumentBuilderType(type);
                      setDocumentBuilderOpen(true);
                    }}
                    style={{
                      textAlign:"left",
                      padding:18,
                      border:"1px solid #dbe3ef",
                      borderRadius:16,
                      background:"#fff",
                      cursor:"pointer",
                    }}
                  >
                    <div style={{fontSize:26,fontWeight:900}}>{icon}</div>
                    <b style={{display:"block",marginTop:8}}>{title}</b>
                    <span style={{display:"block",marginTop:5,color:"#6b778c",fontSize:13}}>
                      Auto-fill property and tenant details
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="commandCard" style={{marginTop:22}}>
              <div className="commandCardHeader">
                <div>
                  <span className="commandSectionIcon">▧</span>
                  <div>
                    <h2>Saved Documents</h2>
                    <p>Review, print, and prepare saved documents for delivery.</p>
                  </div>
                </div>
              </div>

              {documents.length === 0 ? (
                <div className="featureEmpty" style={{marginTop:16}}>
                  <div className="featureEmptyIcon">▧</div>
                  <b>No documents yet</b>
                  <span>Create your first document above.</span>
                </div>
              ) : (
                <div style={{display:"grid",gap:10,marginTop:16}}>
                  {documents.map((doc) => {
                    const tenancy = tenancies.find((t) => t.id === doc.tenancy_id);
                    const property = props.find((p) => p.id === doc.property_id);

                    return (
                      <article
                        key={doc.id}
                        style={{
                          display:"grid",
                          gridTemplateColumns:"minmax(220px,1.7fr) minmax(160px,1fr) auto",
                          gap:16,
                          alignItems:"center",
                          padding:"15px 16px",
                          border:"1px solid #e1e7ef",
                          borderRadius:14,
                          background:"#fff",
                        }}
                      >
                        <div>
                          <b>{doc.title || "Unitvero Document"}</b>
                          <span style={{display:"block",fontSize:13,color:"#6b778c",marginTop:4}}>
                            {tenancy?.tenant_name || tenancy?.tenant_email || "Tenant"}
                            {" · "}
                            {property?.address || "Property"}
                          </span>
                        </div>

                        <div>
                          <span style={{
                            display:"inline-flex",
                            padding:"5px 9px",
                            borderRadius:999,
                            background:"#eef3fb",
                            fontSize:12,
                            fontWeight:800,
                            textTransform:"uppercase"
                          }}>
                            {String(doc.status || "draft").replaceAll("_"," ")}
                          </span>
                          <small style={{display:"block",marginTop:5,color:"#6b778c"}}>
                            {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "—"}
                          </small>
                        </div>

                        <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => openDocumentEditor(doc)}
                          >
                            Edit
                          </button>
                          {String(doc.status || "").toLowerCase() !== "signed" && (
                            <button
                              type="button"
                              className="secondary"
                              onClick={() => openSignatureModal(doc)}
                            >
                              Sign
                            </button>
                          )}
                          {String(doc.status || "").toLowerCase() !== "signed" && (
                            <button
                              type="button"
                              className="secondary"
                              onClick={() => sendDocumentForSignature(doc)}
                            >
                              Request Signature
                            </button>
                          )}
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => printSavedDocument(doc)}
                          >
                            Print
                          </button>
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => emailSavedDocument(doc)}
                          >
                            Email
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSavedDocument(doc)}
                            style={{
                              minHeight:40,
                              padding:"0 12px",
                              border:"1px solid #efcaca",
                              borderRadius:10,
                              background:"#fff5f5",
                              color:"#b42318",
                              fontWeight:800,
                              cursor:"pointer",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="commandCard" style={{marginTop:22}}>
              <div className="commandCardHeader">
                <div>
                  <span className="commandSectionIcon">✎</span>
                  <div>
                    <h2>Unitvero eSignature</h2>
                    <p>
                      Sign in-app or request a tenant signature without leaving
                      the Documents workspace.
                    </p>
                  </div>
                </div>
                <span>PRO</span>
              </div>

              <div style={{
                display:"grid",
                gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",
                gap:12,
                marginTop:16,
              }}>
                {[
                  ["1","Prepare","Create or edit the document."],
                  ["2","Request","Send the tenant a signature request."],
                  ["3","Review","Tenant reviews the document in Unitvero."],
                  ["4","Sign","Tenant draws or uploads a signature and consents."],
                  ["5","Complete","Unitvero records the signed status and audit data."],
                ].map(([num,title,desc]) => (
                  <div key={num} style={{
                    padding:14,
                    border:"1px solid #e1e7ef",
                    borderRadius:14,
                    background:"#fff",
                  }}>
                    <b style={{display:"inline-grid",placeItems:"center",width:28,height:28,borderRadius:999,background:"#eef3fb"}}>{num}</b>
                    <strong style={{display:"block",marginTop:9}}>{title}</strong>
                    <span style={{display:"block",fontSize:12,color:"#6b778c",marginTop:4}}>{desc}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="esignBanner" style={{marginTop:22}}>
              <div className="esignBannerIcon">✎</div>
              <div>
                <small>ESIGNATURE + MAILING</small>
                <h2>Ready for the next delivery integrations</h2>
                <p>
                  Unitvero now creates and saves documents, auto-fills rental
                  information, and provides browser printing and email delivery.
                  E-signature and physical print-and-mail delivery can be connected
                  to a dedicated provider without changing the document workflow.
                </p>
              </div>
              <span>READY</span>
            </section>

            {documentEditorOpen && editingDocument && (
              <div
                role="dialog"
                aria-modal="true"
                style={{
                  position:"fixed",
                  inset:0,
                  zIndex:1001,
                  background:"rgba(10,20,35,.48)",
                  display:"grid",
                  placeItems:"center",
                  padding:20,
                }}
              >
                <form
                  onSubmit={saveEditedDocument}
                  style={{
                    width:"min(760px,100%)",
                    maxHeight:"90vh",
                    overflow:"auto",
                    background:"#fff",
                    borderRadius:22,
                    padding:24,
                    boxShadow:"0 24px 70px rgba(0,0,0,.2)",
                  }}
                >
                  <div style={{
                    display:"flex",
                    justifyContent:"space-between",
                    alignItems:"flex-start",
                    gap:16,
                  }}>
                    <div>
                      <small>EDIT DOCUMENT</small>
                      <h2 style={{margin:"4px 0 6px"}}>Customize your document</h2>
                      <p style={{margin:0,color:"#6b778c"}}>
                        Change the title, document type, and additional terms before
                        printing or sending it.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="secondary"
                      onClick={() => setDocumentEditorOpen(false)}
                    >
                      ×
                    </button>
                  </div>

                  <div style={{
                    marginTop:18,
                    padding:14,
                    border:"1px solid #dbe3ef",
                    borderRadius:14,
                    background:"#f8fafc",
                  }}>
                    <b>Property and tenant information</b>
                    <p style={{margin:"6px 0 0",color:"#5d6878"}}>
                      The property and tenant stay connected to the saved document.
                      Edit the underlying lease/property record when those source
                      details need to change.
                    </p>
                  </div>

                  <div style={{display:"grid",gap:14,marginTop:18}}>
                    <label style={{display:"grid",gap:6}}>
                      <b>Document Type</b>
                      <select
                        value={editingDocumentType}
                        onChange={(e) => setEditingDocumentType(e.target.value)}
                      >
                        <option value="lease">Residential Lease</option>
                        <option value="lease_renewal">Lease Renewal</option>
                        <option value="late_rent_notice">Late Rent Notice</option>
                        <option value="notice_to_vacate">Notice to Vacate</option>
                        <option value="notice_of_entry">Notice of Entry</option>
                        <option value="rent_change_notice">Rent Change Notice</option>
                        <option value="lease_addendum">Lease Addendum</option>
                        <option value="move_in_out">Move-In / Move-Out</option>
                        <option value="custom">Custom Document</option>
                      </select>
                    </label>

                    <label style={{display:"grid",gap:6}}>
                      <b>Document Title</b>
                      <input
                        value={editingDocumentTitle}
                        onChange={(e) => setEditingDocumentTitle(e.target.value)}
                        placeholder="Document title"
                      />
                    </label>

                    <label style={{display:"grid",gap:6}}>
                      <b>Additional Terms / Notes</b>
                      <textarea
                        rows={10}
                        value={editingDocumentNotes}
                        onChange={(e) => setEditingDocumentNotes(e.target.value)}
                        placeholder="Change or add the wording you want included..."
                      />
                    </label>

                    <div style={{
                      padding:14,
                      border:"1px solid #e2e7ee",
                      borderRadius:14,
                    }}>
                      <b>Customize before finalizing</b>
                      <p style={{margin:"6px 0 0",color:"#667386"}}>
                        You can edit the document information and wording before
                        printing or sending. Keep jurisdiction-specific requirements
                        in mind when changing legal language.
                      </p>
                    </div>

                    <div style={{
                      display:"flex",
                      justifyContent:"flex-end",
                      gap:10,
                      flexWrap:"wrap",
                    }}>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => setDocumentEditorOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="primary"
                      >
                        Save Changes & Print
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {signatureModalOpen && signingDocument && (
              <div
                role="dialog"
                aria-modal="true"
                style={{
                  position:"fixed",
                  inset:0,
                  zIndex:1100,
                  background:"rgba(10,20,35,.52)",
                  display:"grid",
                  placeItems:"center",
                  padding:20,
                }}
              >
                <form
                  onSubmit={completeDocumentSignature}
                  style={{
                    width:"min(760px,100%)",
                    maxHeight:"92vh",
                    overflow:"auto",
                    background:"#fff",
                    borderRadius:22,
                    padding:24,
                    boxShadow:"0 24px 70px rgba(0,0,0,.25)",
                  }}
                >
                  <div style={{
                    display:"flex",
                    justifyContent:"space-between",
                    alignItems:"flex-start",
                    gap:16,
                  }}>
                    <div>
                      <small>ELECTRONIC SIGNATURE</small>
                      <h2 style={{margin:"4px 0 6px"}}>
                        Sign {signingDocument.title || "Document"}
                      </h2>
                      <p style={{margin:0,color:"#6b778c"}}>
                        Review the document before applying your electronic signature.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="secondary"
                      onClick={() => setSignatureModalOpen(false)}
                    >
                      ×
                    </button>
                  </div>

                  <div style={{
                    marginTop:18,
                    padding:14,
                    border:"1px solid #dbe3ef",
                    borderRadius:14,
                    background:"#f8fafc",
                  }}>
                    <b>Document signing record</b>
                    <p style={{margin:"6px 0 0",color:"#5d6878"}}>
                      Your signature is recorded with the document, signing time,
                      signing method, and consent to electronic signing.
                    </p>
                  </div>

                  <div style={{display:"grid",gap:14,marginTop:18}}>
                    <label style={{display:"grid",gap:6}}>
                      <b>Signer Full Name</b>
                      <input
                        required
                        value={signatureName}
                        onChange={(e) => setSignatureName(e.target.value)}
                        placeholder="Enter your full legal name"
                      />
                    </label>

                    <div>
                      <b>Signature</b>

                      <div style={{
                        display:"flex",
                        gap:8,
                        marginTop:8,
                        marginBottom:10,
                        flexWrap:"wrap",
                      }}>
                        <button
                          type="button"
                          className={signatureMode === "draw" ? "primary" : "secondary"}
                          onClick={() => setSignatureMode("draw")}
                        >
                          Draw Signature
                        </button>
                        <button
                          type="button"
                          className={signatureMode === "type" ? "primary" : "secondary"}
                          onClick={() => setSignatureMode("type")}
                        >
                          Type Signature
                        </button>
                      </div>

                      {signatureMode === "draw" ? (
                        <div>
                          <canvas
                            id="unitveroSignatureCanvas"
                            width={680}
                            height={210}
                            style={{
                              width:"100%",
                              height:210,
                              border:"1px solid #ccd5e1",
                              borderRadius:12,
                              background:"#fff",
                              touchAction:"none",
                              cursor:"crosshair",
                            }}
                            onPointerDown={(event) => {
                              const canvas = event.currentTarget;
                              canvas.setPointerCapture?.(event.pointerId);
                              const ctx = canvas.getContext("2d");
                              const rect = canvas.getBoundingClientRect();
                              ctx.beginPath();
                              ctx.moveTo(
                                event.clientX - rect.left,
                                event.clientY - rect.top
                              );
                            }}
                            onPointerMove={(event) => {
                              if (event.buttons !== 1) return;
                              drawSignatureOnCanvas(event.currentTarget, event);
                            }}
                          />

                          <button
                            type="button"
                            className="secondary"
                            style={{marginTop:8}}
                            onClick={clearSignatureCanvas}
                          >
                            Clear Signature
                          </button>
                        </div>
                      ) : (
                        <div style={{
                          border:"1px solid #ccd5e1",
                          borderRadius:12,
                          padding:14,
                        }}>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              if (file.size > 5 * 1024 * 1024) {
                                alert("Signature image must be 5 MB or smaller.");
                                return;
                              }

                              const reader = new FileReader();
                              reader.onload = () => {
                                setSignatureImage(String(reader.result || ""));
                              };
                              reader.readAsDataURL(file);
                            }}
                          />

                          {signatureImage && (
                            <img
                              src={signatureImage}
                              alt="Signature preview"
                              style={{
                                display:"block",
                                maxWidth:"100%",
                                maxHeight:150,
                                marginTop:12,
                                border:"1px solid #e1e7ef",
                                borderRadius:8,
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>

                    <label style={{
                      display:"flex",
                      gap:10,
                      alignItems:"flex-start",
                      padding:14,
                      border:"1px solid #dbe3ef",
                      borderRadius:12,
                      background:"#fbfcfe",
                    }}>
                      <input
                        type="checkbox"
                        checked={signatureConsent}
                        onChange={(e) => setSignatureConsent(e.target.checked)}
                        style={{marginTop:3}}
                      />
                      <span style={{fontSize:13,lineHeight:1.5}}>
                        I agree to use my electronic signature for this document.
                        I understand that the signature is intended to be associated
                        with this document and recorded with the signing date and time.
                      </span>
                    </label>

                    <div style={{
                      display:"flex",
                      justifyContent:"flex-end",
                      gap:10,
                      flexWrap:"wrap",
                    }}>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => setSignatureModalOpen(false)}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="primary"
                        disabled={signatureSubmitting}
                      >
                        {signatureSubmitting ? "Signing..." : "Sign Document"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {documentBuilderOpen && (
              <div
                role="dialog"
                aria-modal="true"
                style={{
                  position:"fixed",
                  inset:0,
                  zIndex:1000,
                  background:"rgba(10,20,35,.48)",
                  display:"grid",
                  placeItems:"center",
                  padding:20,
                }}
              >
                <form
                  onSubmit={createUnitveroDocument}
                  style={{
                    width:"min(720px,100%)",
                    maxHeight:"90vh",
                    overflow:"auto",
                    background:"#fff",
                    borderRadius:22,
                    padding:24,
                    boxShadow:"0 24px 70px rgba(0,0,0,.2)",
                  }}
                >
                  <div style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"flex-start"}}>
                    <div>
                      <small>CREATE DOCUMENT</small>
                      <h2 style={{margin:"4px 0 6px"}}>{documentTypeLabel(documentBuilderType)}</h2>
                      <p style={{margin:0,color:"#6b778c"}}>
                        Unitvero will automatically use the selected rental records.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => setDocumentBuilderOpen(false)}
                    >
                      ×
                    </button>
                  </div>

                  <div style={{display:"grid",gap:14,marginTop:22}}>
                    <label style={{display:"grid",gap:6}}>
                      <b>Document Type</b>
                      <select
                        value={documentBuilderType}
                        onChange={(e) => setDocumentBuilderType(e.target.value)}
                      >
                        <option value="lease">Residential Lease</option>
                        <option value="lease_renewal">Lease Renewal</option>
                        <option value="late_rent_notice">Late Rent Notice</option>
                        <option value="notice_to_vacate">Notice to Vacate</option>
                        <option value="notice_of_entry">Notice of Entry</option>
                        <option value="rent_change_notice">Rent Change Notice</option>
                        <option value="lease_addendum">Lease Addendum</option>
                        <option value="move_in_out">Move-In / Move-Out</option>
                        <option value="custom">Custom Document</option>
                      </select>
                    </label>

                    <label style={{display:"grid",gap:6}}>
                      <b>Property</b>
                      <select
                        required
                        value={documentBuilderPropertyId}
                        onChange={(e) => {
                          const selectedProperty = props.find(
                            (item) => item.id === e.target.value
                          );
                          setDocumentBuilderPropertyId(e.target.value);
                          setDocumentBuilderTenancyId("");
                          setDocumentBuilderState(getPropertyState(selectedProperty));
                        }}
                      >
                        <option value="">Select a property...</option>
                        {props.map((property) => (
                          <option key={property.id} value={property.id}>
                            {property.address}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label style={{display:"grid",gap:6}}>
                      <b>State / Jurisdiction</b>
                      <select
                        required
                        value={documentBuilderState}
                        onChange={(e) => setDocumentBuilderState(e.target.value)}
                      >
                        <option value="">Select a state...</option>
                        {unitveroStates.map(([code, name]) => (
                          <option key={code} value={code}>{name}</option>
                        ))}
                      </select>
                      <small style={{color:"#6b778c"}}>
                        The state controls the jurisdictional template framework.
                      </small>
                    </label>

                    <label style={{display:"grid",gap:6}}>
                      <b>Tenant</b>
                      <select
                        required
                        value={documentBuilderTenancyId}
                        onChange={(e) => setDocumentBuilderTenancyId(e.target.value)}
                      >
                        <option value="">Select a tenant...</option>
                        {tenancies
                          .filter((tenancy) =>
                            !documentBuilderPropertyId ||
                            tenancy.property_id === documentBuilderPropertyId
                          )
                          .map((tenancy) => (
                            <option key={tenancy.id} value={tenancy.id}>
                              {tenancy.tenant_name || tenancy.tenant_email || "Tenant"}
                            </option>
                          ))}
                      </select>
                    </label>

                    <label style={{display:"grid",gap:6}}>
                      <b>Document Title</b>
                      <input
                        value={documentBuilderTitle}
                        onChange={(e) => setDocumentBuilderTitle(e.target.value)}
                        placeholder={documentTypeLabel(documentBuilderType)}
                      />
                    </label>

                    <label style={{display:"grid",gap:6}}>
                      <b>Additional Terms / Notes</b>
                      <textarea
                        rows={6}
                        value={documentBuilderNotes}
                        onChange={(e) => setDocumentBuilderNotes(e.target.value)}
                        placeholder="Add any information you want included in the document..."
                      />
                    </label>

                    <div style={{
                      display:"flex",
                      justifyContent:"flex-end",
                      gap:10,
                      flexWrap:"wrap",
                      paddingTop:6,
                    }}>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => setDocumentBuilderOpen(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="primary">
                        Create, Save & Print
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </section>
        )}


        {view === "pro" && (
          <section className="panel">
            <div className="applicationsHeader documentsHeader">
              <div>
                <small>UNITVERO PLANS</small>
                <h1>Free vs. Pro</h1>
                <p>
                  Compare the features included with each plan.
                </p>
              </div>
              <button
                type="button"
                className="secondary"
                onClick={() => setView("overview")}
              >
                Back to Dashboard
              </button>
            </div>

            <div style={{
              display:"grid",
              gridTemplateColumns:"repeat(2,minmax(0,1fr))",
              gap:18,
              marginTop:24,
            }}>
              <article style={{
                border:"1px solid #dbe3ef",
                borderRadius:20,
                padding:22,
                background:"#fff",
              }}>
                <small>STARTER</small>
                <h2>Free</h2>
                <p>Core property-management tools.</p>
                <ul style={{lineHeight:2,paddingLeft:20}}>
                  <li>Property management</li>
                  <li>Tenant management</li>
                  <li>Basic rent tracking</li>
                  <li>Maintenance requests</li>
                  <li>Basic messaging</li>
                  <li>Document storage</li>
                </ul>
              </article>

              <article style={{
                border:"2px solid #172033",
                borderRadius:20,
                padding:22,
                background:"#f8fafc",
              }}>
                <small>FULL MANAGEMENT</small>
                <h2>Unitvero Pro</h2>
                <p>Advanced tools for landlords who want the complete workflow.</p>
                <ul style={{lineHeight:2,paddingLeft:20}}>
                  <li>Everything in Free</li>
                  <li>Professional document builder</li>
                  <li>50-state document framework</li>
                  <li>In-app eSignatures</li>
                  <li>Messaging with attachments</li>
                  <li>Advanced bookkeeping</li>
                  <li>Maintenance cost tracking</li>
                  <li>Rental value & comp analysis</li>
                  <li>Faster payout option</li>
                  <li>Advanced document delivery</li>
                  <li>Priority help/chat features</li>
                  <li>Expanded landlord reporting</li>
                </ul>
                <button
                  type="button"
                  className="primary"
                  style={{width:"100%",marginTop:12}}
                  onClick={() => alert("Pro checkout is ready to connect to your billing provider.")}
                >
                  Upgrade to Pro
                </button>
              </article>
            </div>

            <div style={{
              marginTop:20,
              padding:16,
              border:"1px solid #dbe3ef",
              borderRadius:14,
              background:"#fff",
            }}>
              <b>Subscription note</b>
              <p style={{margin:"6px 0 0",color:"#5d6878"}}>
                The comparison screen is live. The Upgrade button is ready for a
                real checkout connection; payment processing should be connected
                before charging customers.
              </p>
            </div>
          </section>
        )}

        {view === "messages" && (
          <section className="communicationPage">
            <div className="communicationHeader">
              <div>
                <small>COMMUNICATION CENTER</small>
                <h1>Messages & Alerts</h1>
                <p>
                  Communicate with tenants and send important property
                  announcements.
                </p>
              </div>
            </div>

            <div className="communicationTabs">
              <button
                type="button"
                className={communicationTab === "messages" ? "active" : ""}
                onClick={() => setCommunicationTab("messages")}
              >
                Messages
              </button>

              <button
                type="button"
                className={communicationTab === "announcements" ? "active" : ""}
                onClick={() => setCommunicationTab("announcements")}
              >
                Announcements & Alerts
              </button>
            </div>

            {communicationTab === "messages" && (
              <div className="communicationMessagesLayout">
                <aside className="conversationSidebar">
                  <div className="conversationSidebarHeader">
                    <div>
                      <small>INBOX</small>
                      <h2>Conversations</h2>
                    </div>

                    <span>{conversations.length}</span>
                  </div>

                  <div className="newConversationBox">
                    <label>Start a conversation</label>

                    <select
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) {
                          openOrCreateConversation(e.target.value);
                          e.target.value = "";
                        }
                      }}
                    >
                      <option value="">Select a tenant...</option>

                      {tenancies
                        .filter((tenancy) => tenancy.status === "active")
                        .map((tenancy) => {
                          const property = props.find(
                            (item) => item.id === tenancy.property_id,
                          );

                          return (
                            <option key={tenancy.id} value={tenancy.id}>
                              {tenancy.tenant_name ||
                                tenancy.tenant_email ||
                                "Tenant"}
                              {" — "}
                              {property?.address || "Property"}
                            </option>
                          );
                        })}
                    </select>
                  </div>

                  <div className="conversationList">
                    {conversations.length === 0 ? (
                      <div className="conversationEmpty">
                        <span>✉</span>
                        <b>No conversations yet</b>
                        <p>Select a tenant above to start a conversation.</p>
                      </div>
                    ) : (
                      conversations.map((conversation) => {
                        const tenancy = tenancies.find(
                          (item) => item.id === conversation.tenancy_id,
                        );

                        const property = props.find(
                          (item) => item.id === conversation.property_id,
                        );

                        const conversationMessages = messages.filter(
                          (message) =>
                            message.conversation_id === conversation.id,
                        );

                        const lastMessage =
                          conversationMessages[conversationMessages.length - 1];

                        const unreadCount = conversationMessages.filter(
                          (message) =>
                            message.sender_type === "tenant" &&
                            !message.read_at,
                        ).length;

                        return (
                          <button
                            type="button"
                            key={conversation.id}
                            className={
                              selectedConversation?.id === conversation.id
                                ? "conversationItem active"
                                : "conversationItem"
                            }
                            onClick={() =>
                              setSelectedConversation(conversation)
                            }
                          >
                            <div className="conversationAvatar">
                              {(
                                tenancy?.tenant_name ||
                                tenancy?.tenant_email ||
                                "T"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="conversationItemContent">
                              <div>
                                <b>
                                  {tenancy?.tenant_name ||
                                    tenancy?.tenant_email ||
                                    conversation.subject ||
                                    "Tenant"}
                                </b>

                                {unreadCount > 0 && (
                                  <span className="conversationUnread">
                                    {unreadCount}
                                  </span>
                                )}
                              </div>

                              <small>
                                {property?.address || "Rental property"}
                              </small>

                              <p>{lastMessage?.message || "No messages yet"}</p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </aside>

                <section className="messageThread">
                  {!selectedConversation ? (
                    <div className="messageThreadEmpty">
                      <div>✉</div>
                      <h2>Select a conversation</h2>
                      <p>
                        Choose a tenant conversation from the left, or start a
                        new one.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="messageThreadHeader">
                        {(() => {
                          const tenancy = tenancies.find(
                            (item) =>
                              item.id === selectedConversation.tenancy_id,
                          );

                          const property = props.find(
                            (item) =>
                              item.id === selectedConversation.property_id,
                          );

                          return (
                            <>
                              <div className="messageTenantAvatar">
                                {(
                                  tenancy?.tenant_name ||
                                  tenancy?.tenant_email ||
                                  "T"
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <h2>
                                  {tenancy?.tenant_name ||
                                    tenancy?.tenant_email ||
                                    selectedConversation.subject ||
                                    "Tenant"}
                                </h2>

                                <p>{property?.address || "Rental property"}</p>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      <div className="messageHistory">
                        {messages.filter(
                          (message) =>
                            message.conversation_id === selectedConversation.id,
                        ).length === 0 ? (
                          <div className="messageHistoryEmpty">
                            <span>✉</span>
                            <b>No messages yet</b>
                            <p>Send the first message to this tenant.</p>
                          </div>
                        ) : (
                          messages
                            .filter(
                              (message) =>
                                message.conversation_id ===
                                selectedConversation.id,
                            )
                            .map((message) => (
                              <div
                                key={message.id}
                                className={
                                  message.sender_type === "landlord"
                                    ? "messageRow landlord"
                                    : "messageRow tenant"
                                }
                              >
                                <div className="messageBubble">
                                  <p>{message.message}</p>

                                  <small>
                                    {new Date(
                                      message.created_at,
                                    ).toLocaleString()}
                                  </small>
                                </div>
                              </div>
                            ))
                        )}
                      </div>

                      <form className="messageComposer" onSubmit={sendMessage}>
                        <textarea
                          name="message"
                          placeholder="Write a message..."
                          rows="3"
                          required
                        />

                        <button type="submit" className="primary">
                          Send Message
                        </button>
                      </form>
                    </>
                  )}
                </section>
              </div>
            )}

            {communicationTab === "announcements" && (
              <div className="announcementLayout">
                <section className="announcementComposer">
                  <div className="announcementSectionHeader">
                    <div>
                      <small>NEW ANNOUNCEMENT</small>
                      <h2>Send an Alert</h2>
                      <p>
                        Send an in-app notice to a tenant, property, or your
                        entire portfolio.
                      </p>
                    </div>

                    <span className="announcementAlertIcon">!</span>
                  </div>

                  <form
                    className="announcementForm"
                    onSubmit={createAnnouncement}
                  >
                    <div className="announcementField">
                      <label>Audience</label>

                      <select
                        value={announcementAudience}
                        onChange={(e) =>
                          setAnnouncementAudience(e.target.value)
                        }
                      >
                        <option value="property">One Property</option>

                        <option value="tenant">One Tenant</option>

                        <option value="all">All Tenants</option>
                      </select>
                    </div>

                    {announcementAudience === "property" && (
                      <div className="announcementField">
                        <label>Property</label>

                        <select name="propertyId" defaultValue="" required>
                          <option value="">Select a property...</option>

                          {props.map((property) => (
                            <option key={property.id} value={property.id}>
                              {property.address}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {announcementAudience === "tenant" && (
                      <div className="announcementField">
                        <label>Tenant</label>

                        <select name="tenancyId" defaultValue="" required>
                          <option value="">Select a tenant...</option>

                          {tenancies
                            .filter((tenancy) => tenancy.status === "active")
                            .map((tenancy) => {
                              const property = props.find(
                                (item) => item.id === tenancy.property_id,
                              );

                              return (
                                <option key={tenancy.id} value={tenancy.id}>
                                  {tenancy.tenant_name ||
                                    tenancy.tenant_email ||
                                    "Tenant"}
                                  {" — "}
                                  {property?.address || "Property"}
                                </option>
                              );
                            })}
                        </select>
                      </div>
                    )}

                    <div className="announcementFormRow">
                      <div className="announcementField">
                        <label>Priority</label>

                        <select name="priority" defaultValue="normal">
                          <option value="normal">Normal</option>
                          <option value="important">Important</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>

                      <div className="announcementField">
                        <label>Expires</label>

                        <input type="date" name="expiresAt" />
                      </div>
                    </div>

                    <div className="announcementField">
                      <label>Title</label>

                      <input
                        type="text"
                        name="title"
                        placeholder="Example: Freeze Warning"
                        required
                      />
                    </div>

                    <div className="announcementField">
                      <label>Message</label>

                      <textarea
                        name="message"
                        rows="5"
                        placeholder="Example: Run water so pipes won't freeze."
                        required
                      />
                    </div>

                    <div className="announcementFormFooter">
                      <span>This creates an in-app Unitvero announcement.</span>

                      <button type="submit" className="primary">
                        Send Announcement
                      </button>
                    </div>
                  </form>
                </section>

                <section className="announcementHistory">
                  <div className="announcementHistoryHeader">
                    <div>
                      <small>ANNOUNCEMENT HISTORY</small>
                      <h2>Recent Alerts</h2>
                    </div>

                    <span>{announcements.length}</span>
                  </div>

                  {announcements.length === 0 ? (
                    <div className="announcementEmpty">
                      <span>!</span>
                      <b>No announcements yet</b>
                      <p>
                        Alerts and property notices will appear here after you
                        create them.
                      </p>
                    </div>
                  ) : (
                    <div className="announcementList">
                      {announcements.map((announcement) => {
                        const property = props.find(
                          (item) => item.id === announcement.property_id,
                        );

                        const tenancy = tenancies.find(
                          (item) => item.id === announcement.tenancy_id,
                        );

                        return (
                          <article
                            className={`announcementCard ${announcement.priority}`}
                            key={announcement.id}
                          >
                            <div className="announcementCardTop">
                              <span
                                className={`announcementPriority ${announcement.priority}`}
                              >
                                {announcement.priority}
                              </span>

                              <small>
                                {new Date(
                                  announcement.created_at,
                                ).toLocaleDateString()}
                              </small>
                            </div>

                            <h3>{announcement.title}</h3>

                            <p>{announcement.message}</p>

                            <div className="announcementMeta">
                              <span>
                                TO:{" "}
                                <b>
                                  {announcement.audience === "all"
                                    ? "All tenants"
                                    : announcement.audience === "tenant"
                                      ? tenancy?.tenant_name ||
                                        tenancy?.tenant_email ||
                                        "Tenant"
                                      : property?.address || "Property"}
                                </b>
                              </span>

                              {announcement.expires_at && (
                                <span>
                                  EXPIRES:{" "}
                                  <b>
                                    {new Date(
                                      announcement.expires_at,
                                    ).toLocaleDateString()}
                                  </b>
                                </span>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>
            )}
          </section>
        )}
        {view === "rent" &&
          (() => {
            const completedPayments = rentPayments.filter(
              (payment) => payment.status === "completed",
            );

            const returnedPayments = rentPayments.filter(
              (payment) => payment.status === "returned",
            );

            const completedPaymentIds = new Set(
              completedPayments.map((payment) => payment.id),
            );

            const activeCharges = rentCharges.filter(
              (charge) => charge.status !== "waived",
            );

            const validAllocations = paymentAllocations.filter((allocation) =>
              completedPaymentIds.has(allocation.payment_id),
            );

            const totalCharges = activeCharges.reduce(
              (total, charge) => total + Number(charge.amount || 0),
              0,
            );

            const totalCollected = completedPayments.reduce(
              (total, payment) => total + Number(payment.amount || 0),
              0,
            );

            const totalAllocated = validAllocations.reduce(
              (total, allocation) => total + Number(allocation.amount || 0),
              0,
            );

            const totalOutstanding = Math.max(totalCharges - totalAllocated, 0);

            const unallocatedCredit = Math.max(
              totalCollected - totalAllocated,
              0,
            );

            const collectionRate =
              totalCharges > 0
                ? Math.min(
                    Math.round((totalAllocated / totalCharges) * 100),
                    100,
                  )
                : 0;

            const settings = rentSettings || {
              allow_partial_payments: true,
              late_fee_enabled: true,
              late_fee_amount: 50,
              late_fee_grace_days: 5,
              nsf_fee_enabled: true,
              nsf_fee_amount: 35,
              auto_monthly_charges: true,
              auto_late_fees: true,
            };

            async function runRentAutomation() {
              const confirmed = window.confirm(
                "Run Unitvero rent automation now? This will create any missing monthly rent charges and eligible late fees. Duplicate charges are protected.",
              );

              if (!confirmed) return;

              const s = supabase();
              const today = new Date().toISOString().split("T")[0];

              const { data: monthlyCount, error: monthlyError } = await s.rpc(
                "generate_monthly_rent_charges",
                {
                  p_run_date: today,
                },
              );

              if (monthlyError) {
                alert(
                  "Could not generate monthly rent charges: " +
                    monthlyError.message,
                );
                return;
              }

              const { data: lateCount, error: lateError } = await s.rpc(
                "apply_automatic_late_fees",
                {
                  p_run_date: today,
                },
              );

              if (lateError) {
                alert(
                  "Monthly charges ran, but late fees failed: " +
                    lateError.message,
                );

                await load();
                return;
              }

              await load();

              alert(
                `Rent automation complete!\n\n` +
                  `${monthlyCount || 0} monthly rent charge(s) created.\n` +
                  `${lateCount || 0} late fee(s) created.`,
              );
            }

            return (
              <section className="panel">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "20px",
                    marginBottom: "28px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <small>RENT COLLECTION</small>
                    <h1>Rent & Payments</h1>
                    <p>
                      Manage rent charges, payments, late fees and returned
                      payments across your portfolio.
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      className="commandSecondaryButton"
                      onClick={() => setShowRentSettings((current) => !current)}
                    >
                      ⚙ Rent Settings
                    </button>

                    <button
                      type="button"
                      className="commandSecondaryButton"
                      onClick={runRentAutomation}
                    >
                      Run Rent Automation
                    </button>

                    <button
                      type="button"
                      className="primary"
                      onClick={() => setShowRecordPayment(true)}
                    >
                      + Record Payment
                    </button>
                  </div>
                </div>

                <div className="commandStats">
                  <article>
                    <div className="commandStatIcon">$</div>

                    <div>
                      <span>Total Charges</span>
                      <b>${totalCharges.toLocaleString()}</b>
                      <small>RENT + FEES</small>
                    </div>
                  </article>

                  <article>
                    <div className="commandStatIcon">✓</div>

                    <div>
                      <span>Collected</span>
                      <b>${totalCollected.toLocaleString()}</b>
                      <small>COMPLETED PAYMENTS</small>
                    </div>
                  </article>

                  <article>
                    <div className="commandStatIcon">◎</div>

                    <div>
                      <span>Outstanding</span>
                      <b>${totalOutstanding.toLocaleString()}</b>
                      <small>CURRENT BALANCE</small>
                    </div>
                  </article>

                  <article>
                    <div className="commandStatIcon">%</div>

                    <div>
                      <span>Collection Rate</span>
                      <b>{collectionRate}%</b>
                      <small>CHARGES COLLECTED</small>
                    </div>
                  </article>
                </div>

                {showRentSettings && (
                  <section
                    className="commandCard"
                    style={{
                      marginTop: "28px",
                      marginBottom: "28px",
                    }}
                  >
                    <div className="commandCardHeader">
                      <div>
                        <span className="commandSectionIcon">⚙</span>

                        <div>
                          <h2>Rent Settings</h2>
                          <p>
                            Control automatic charges, late fees, partial
                            payments and returned-payment fees.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="commandTextButton"
                        onClick={() => setShowRentSettings(false)}
                      >
                        Close
                      </button>
                    </div>

                    <form
                      className="addTenantForm"
                      onSubmit={async (e) => {
                        e.preventDefault();

                        const form = e.currentTarget;
                        const s = supabase();

                        const {
                          data: { user },
                          error: userError,
                        } = await s.auth.getUser();

                        if (userError || !user) {
                          alert("Could not verify your account.");
                          return;
                        }

                        const updatedSettings = {
                          landlord_id: user.id,

                          allow_partial_payments:
                            form.allowPartialPayments.checked,

                          late_fee_enabled: form.lateFeeEnabled.checked,

                          late_fee_amount: Number(
                            form.lateFeeAmount.value || 0,
                          ),

                          late_fee_grace_days: Number(
                            form.lateFeeGraceDays.value || 0,
                          ),

                          nsf_fee_enabled: form.nsfFeeEnabled.checked,

                          nsf_fee_amount: Number(form.nsfFeeAmount.value || 0),

                          auto_monthly_charges: form.autoMonthlyCharges.checked,

                          auto_late_fees: form.autoLateFees.checked,

                          updated_at: new Date().toISOString(),
                        };

                        const { data, error } = await s
                          .from("rent_settings")
                          .upsert(updatedSettings, {
                            onConflict: "landlord_id",
                          })
                          .select()
                          .single();

                        if (error) {
                          alert(
                            "Could not save rent settings: " + error.message,
                          );
                          return;
                        }

                        setRentSettings(data);
                        alert("Rent settings saved!");
                      }}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <input
                          name="autoMonthlyCharges"
                          type="checkbox"
                          defaultChecked={settings.auto_monthly_charges}
                          style={{ width: "auto" }}
                        />
                        Automatically create monthly rent charges
                      </label>

                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <input
                          name="allowPartialPayments"
                          type="checkbox"
                          defaultChecked={settings.allow_partial_payments}
                          style={{ width: "auto" }}
                        />
                        Allow partial payments
                      </label>

                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <input
                          name="lateFeeEnabled"
                          type="checkbox"
                          defaultChecked={settings.late_fee_enabled}
                          style={{ width: "auto" }}
                        />
                        Enable late fees
                      </label>

                      <label>
                        Late Fee Amount
                        <input
                          name="lateFeeAmount"
                          type="number"
                          min="0"
                          step="0.01"
                          defaultValue={settings.late_fee_amount ?? 50}
                        />
                      </label>

                      <label>
                        Grace Period
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <input
                            name="lateFeeGraceDays"
                            type="number"
                            min="0"
                            step="1"
                            defaultValue={settings.late_fee_grace_days ?? 5}
                          />

                          <span>days after rent is due</span>
                        </div>
                      </label>

                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <input
                          name="autoLateFees"
                          type="checkbox"
                          defaultChecked={settings.auto_late_fees}
                          style={{ width: "auto" }}
                        />
                        Automatically apply eligible late fees
                      </label>

                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <input
                          name="nsfFeeEnabled"
                          type="checkbox"
                          defaultChecked={settings.nsf_fee_enabled}
                          style={{ width: "auto" }}
                        />
                        Automatically charge returned / NSF fee
                      </label>

                      <label>
                        Returned / NSF Fee
                        <input
                          name="nsfFeeAmount"
                          type="number"
                          min="0"
                          step="0.01"
                          defaultValue={settings.nsf_fee_amount ?? 35}
                        />
                      </label>

                      <button type="submit" className="primary">
                        Save Rent Settings
                      </button>
                    </form>
                  </section>
                )}

                <section
                  className="commandCard"
                  style={{
                    marginTop: "28px",
                    marginBottom: "28px",
                  }}
                >
                  <div className="commandCardHeader">
                    <div>
                      <span className="commandSectionIcon">⚡</span>

                      <div>
                        <h2>Automation Status</h2>
                        <p>Current rules Unitvero uses for rent collection.</p>
                      </div>
                    </div>
                  </div>

                  <div className="commandLeaseGrid">
                    <div>
                      <small>MONTHLY RENT</small>

                      <b
                        className={
                          settings.auto_monthly_charges
                            ? "commandActiveText"
                            : ""
                        }
                      >
                        {settings.auto_monthly_charges
                          ? "● Automatic"
                          : "Manual"}
                      </b>
                    </div>

                    <div>
                      <small>PARTIAL PAYMENTS</small>

                      <b>
                        {settings.allow_partial_payments
                          ? "Allowed"
                          : "Blocked"}
                      </b>
                    </div>

                    <div>
                      <small>LATE FEE</small>

                      <b>
                        {settings.late_fee_enabled
                          ? `$${Number(
                              settings.late_fee_amount || 0,
                            ).toLocaleString()} after ${
                              settings.late_fee_grace_days || 0
                            } day(s)`
                          : "Disabled"}
                      </b>
                    </div>

                    <div>
                      <small>RETURNED / NSF FEE</small>

                      <b>
                        {settings.nsf_fee_enabled
                          ? `$${Number(
                              settings.nsf_fee_amount || 0,
                            ).toLocaleString()}`
                          : "Disabled"}
                      </b>
                    </div>
                  </div>
                </section>

                {unallocatedCredit > 0 && (
                  <section
                    className="commandCard"
                    style={{ marginTop: "24px" }}
                  >
                    <div className="commandCardHeader">
                      <div>
                        <span className="commandSectionIcon">+</span>

                        <div>
                          <h2>Unallocated Credit</h2>

                          <p>
                            Completed payments not currently applied to a
                            charge.
                          </p>
                        </div>
                      </div>

                      <b>${unallocatedCredit.toLocaleString()}</b>
                    </div>
                  </section>
                )}

                {showRecordPayment && (
                  <section
                    className="commandCard"
                    style={{
                      marginTop: "28px",
                      marginBottom: "28px",
                    }}
                  >
                    <div className="commandCardHeader">
                      <div>
                        <span className="commandSectionIcon">$</span>

                        <div>
                          <h2>Record Payment</h2>

                          <p>
                            Record a payment received from an active tenant.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="commandTextButton"
                        onClick={() => setShowRecordPayment(false)}
                      >
                        Cancel
                      </button>
                    </div>

                    {!settings.allow_partial_payments && (
                      <div
                        style={{
                          padding: "14px 16px",
                          marginBottom: "18px",
                          borderRadius: "10px",
                          background: "#fff8e8",
                        }}
                      >
                        <b>Partial payments are blocked.</b>

                        <div>
                          Unitvero will require the tenant&apos;s full
                          outstanding balance.
                        </div>
                      </div>
                    )}

                    <form
                      className="addTenantForm"
                      onSubmit={async (e) => {
                        e.preventDefault();

                        const form = e.currentTarget;

                        const tenancyId = form.tenancyId.value;
                        const amount = Number(form.amount.value);
                        const paymentDate = form.paymentDate.value;
                        const paymentMethod = form.paymentMethod.value;
                        const reference = form.reference.value.trim();
                        const notes = form.notes.value.trim();

                        const tenancy = tenancies.find(
                          (item) => item.id === tenancyId,
                        );

                        if (!tenancy) {
                          alert("Select a tenant.");
                          return;
                        }

                        if (!amount || amount <= 0) {
                          alert("Enter a valid payment amount.");
                          return;
                        }

                        const property = props.find(
                          (item) => item.id === tenancy.property_id,
                        );

                        if (
                          property &&
                          isMultiFamily(property) &&
                          !tenancy.unit_id
                        ) {
                          alert(
                            "This tenant must be assigned to a unit before recording a payment.",
                          );
                          return;
                        }

                        const s = supabase();

                        const { error } = await s.rpc("record_rent_payment", {
                          p_property_id: tenancy.property_id,
                          p_unit_id: tenancy.unit_id || null,
                          p_tenancy_id: tenancy.id,
                          p_amount: amount,
                          p_payment_date: paymentDate,
                          p_payment_method: paymentMethod,
                          p_reference: reference || null,
                          p_notes: notes || null,
                        });

                        if (error) {
                          alert("Could not record payment: " + error.message);
                          return;
                        }

                        form.reset();
                        setShowRecordPayment(false);

                        await load();

                        alert("Payment recorded successfully!");
                      }}
                    >
                      <label>
                        Tenant
                        <select name="tenancyId" required defaultValue="">
                          <option value="" disabled>
                            Select tenant
                          </option>

                          {tenancies
                            .filter((tenancy) => tenancy.status === "active")
                            .map((tenancy) => {
                              const property = props.find(
                                (item) => item.id === tenancy.property_id,
                              );

                              const unit = units.find(
                                (item) => item.id === tenancy.unit_id,
                              );

                              const tenantCharges = rentCharges.filter(
                                (charge) =>
                                  charge.tenancy_id === tenancy.id &&
                                  charge.status !== "waived",
                              );

                              const tenantChargeIds = new Set(
                                tenantCharges.map((charge) => charge.id),
                              );

                              const tenantAllocated = validAllocations
                                .filter((allocation) =>
                                  tenantChargeIds.has(allocation.charge_id),
                                )
                                .reduce(
                                  (total, allocation) =>
                                    total + Number(allocation.amount || 0),
                                  0,
                                );

                              const tenantBalance = Math.max(
                                tenantCharges.reduce(
                                  (total, charge) =>
                                    total + Number(charge.amount || 0),
                                  0,
                                ) - tenantAllocated,
                                0,
                              );

                              return (
                                <option key={tenancy.id} value={tenancy.id}>
                                  {tenancy.tenant_name ||
                                    tenancy.tenant_email ||
                                    "Tenant"}
                                  {" — "}
                                  {property?.address || "Property"}
                                  {unit ? ` • ${unit.unit_name}` : ""}
                                  {` • Balance $${tenantBalance.toLocaleString()}`}
                                </option>
                              );
                            })}
                        </select>
                      </label>

                      <label>
                        Amount
                        <input
                          name="amount"
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="1000.00"
                          required
                        />
                      </label>

                      <label>
                        Payment Date
                        <input
                          name="paymentDate"
                          type="date"
                          defaultValue={new Date().toISOString().split("T")[0]}
                          required
                        />
                      </label>

                      <label>
                        Payment Method
                        <select
                          name="paymentMethod"
                          defaultValue="cash"
                          required
                        >
                          <option value="cash">Cash</option>
                          <option value="check">Check</option>

                          <option value="ach">ACH / Bank Transfer</option>

                          <option value="card">Card</option>

                          <option value="money_order">Money Order</option>

                          <option value="cash_app">Cash App</option>

                          <option value="zelle">Zelle</option>
                          <option value="other">Other</option>
                        </select>
                      </label>

                      <label>
                        Reference / Confirmation
                        <input
                          name="reference"
                          type="text"
                          placeholder="Check number or confirmation number"
                        />
                      </label>

                      <label>
                        Notes
                        <textarea
                          name="notes"
                          placeholder="Optional payment notes"
                          rows="3"
                        />
                      </label>

                      <button type="submit" className="primary">
                        Record Payment
                      </button>
                    </form>
                  </section>
                )}

                <section className="commandCard" style={{ marginTop: "28px" }}>
                  <div className="commandCardHeader">
                    <div>
                      <span className="commandSectionIcon">▤</span>

                      <div>
                        <h2>Rent Charges</h2>

                        <p>
                          Rent, late fees, NSF fees and remaining tenant
                          balances.
                        </p>
                      </div>
                    </div>

                    <span>
                      {activeCharges.length}{" "}
                      {activeCharges.length === 1 ? "charge" : "charges"}
                    </span>
                  </div>

                  {activeCharges.length === 0 ? (
                    <div className="featureEmpty">
                      <div className="featureEmptyIcon">$</div>
                      <b>No rent charges</b>

                      <span>
                        Rent charges will appear here when they are created.
                      </span>
                    </div>
                  ) : (
                    <div className="commandLedgerPreview">
                      {activeCharges.map((charge) => {
                        const property = props.find(
                          (item) => item.id === charge.property_id,
                        );

                        const unit = units.find(
                          (item) => item.id === charge.unit_id,
                        );

                        const tenancy = tenancies.find(
                          (item) => item.id === charge.tenancy_id,
                        );

                        const chargePaid = validAllocations
                          .filter(
                            (allocation) => allocation.charge_id === charge.id,
                          )
                          .reduce(
                            (total, allocation) =>
                              total + Number(allocation.amount || 0),
                            0,
                          );

                        const chargeAmount = Number(charge.amount || 0);

                        const remaining = Math.max(
                          chargeAmount - chargePaid,
                          0,
                        );

                        const displayStatus =
                          remaining <= 0
                            ? "Paid"
                            : chargePaid > 0
                              ? "Partial"
                              : "Unpaid";

                        const chargeLabel =
                          charge.charge_type === "late_fee"
                            ? "Late Fee"
                            : charge.charge_type === "nsf_fee"
                              ? "Returned / NSF Fee"
                              : charge.description || "Rent Charge";

                        return (
                          <article
                            className="commandLedgerRow"
                            key={charge.id}
                            style={{
                              alignItems: "center",
                              paddingTop: "18px",
                              paddingBottom: "18px",
                            }}
                          >
                            <div>
                              <b>{chargeLabel}</b>

                              <span>
                                {tenancy?.tenant_name ||
                                  tenancy?.tenant_email ||
                                  "Tenant"}
                              </span>

                              <span>
                                {property?.address || "Property"}
                                {unit ? ` • ${unit.unit_name}` : ""}
                              </span>

                              <small>
                                Due{" "}
                                {charge.due_date
                                  ? new Date(
                                      charge.due_date + "T00:00:00",
                                    ).toLocaleDateString()
                                  : "—"}
                              </small>

                              {charge.source === "automatic" && (
                                <small>Automatic Unitvero charge</small>
                              )}
                            </div>

                            <div
                              style={{
                                textAlign: "right",
                                minWidth: "190px",
                              }}
                            >
                              <span
                                className={
                                  displayStatus === "Paid"
                                    ? "commandActiveText"
                                    : ""
                                }
                              >
                                {displayStatus}
                              </span>

                              <b
                                style={{
                                  display: "block",
                                  marginTop: "6px",
                                }}
                              >
                                ${remaining.toLocaleString()}
                                {" remaining"}
                              </b>

                              <small
                                style={{
                                  display: "block",
                                  marginTop: "4px",
                                }}
                              >
                                ${chargePaid.toLocaleString()} paid
                                {" of "}${chargeAmount.toLocaleString()}
                              </small>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section className="commandCard" style={{ marginTop: "28px" }}>
                  <div className="commandCardHeader">
                    <div>
                      <span className="commandSectionIcon">$</span>

                      <div>
                        <h2>Payment History</h2>

                        <p>Completed and returned tenant payments.</p>
                      </div>
                    </div>

                    <span>
                      {rentPayments.length}{" "}
                      {rentPayments.length === 1 ? "payment" : "payments"}
                    </span>
                  </div>

                  {rentPayments.length === 0 ? (
                    <div className="featureEmpty">
                      <div className="featureEmptyIcon">$</div>
                      <b>No payments recorded</b>

                      <span>Recorded tenant payments will appear here.</span>
                    </div>
                  ) : (
                    <div className="commandLedgerPreview">
                      {rentPayments.map((payment) => {
                        const property = props.find(
                          (item) => item.id === payment.property_id,
                        );

                        const unit = units.find(
                          (item) => item.id === payment.unit_id,
                        );

                        const tenancy = tenancies.find(
                          (item) => item.id === payment.tenancy_id,
                        );

                        const isReturned = payment.status === "returned";

                        const paymentAllocated = isReturned
                          ? 0
                          : validAllocations
                              .filter(
                                (allocation) =>
                                  allocation.payment_id === payment.id,
                              )
                              .reduce(
                                (total, allocation) =>
                                  total + Number(allocation.amount || 0),
                                0,
                              );

                        const paymentAmount = Number(payment.amount || 0);

                        const paymentCredit = isReturned
                          ? 0
                          : Math.max(paymentAmount - paymentAllocated, 0);

                        return (
                          <article
                            className="commandLedgerRow"
                            key={payment.id}
                            style={{
                              alignItems: "center",
                              paddingTop: "18px",
                              paddingBottom: "18px",
                            }}
                          >
                            <div>
                              <b>
                                {tenancy?.tenant_name ||
                                  tenancy?.tenant_email ||
                                  "Tenant Payment"}
                              </b>

                              <span>
                                {property?.address || "Property"}
                                {unit ? ` • ${unit.unit_name}` : ""}
                              </span>

                              <span>
                                {payment.payment_method
                                  ? payment.payment_method
                                      .replaceAll("_", " ")
                                      .toUpperCase()
                                  : "PAYMENT"}
                              </span>

                              {payment.reference && (
                                <small>Reference: {payment.reference}</small>
                              )}

                              {payment.notes && (
                                <small>Notes: {payment.notes}</small>
                              )}

                              {isReturned && (
                                <small>
                                  Returned:{" "}
                                  {payment.return_reason ||
                                    "Insufficient funds"}
                                </small>
                              )}
                            </div>

                            <div
                              style={{
                                textAlign: "right",
                                minWidth: "210px",
                              }}
                            >
                              <b>${paymentAmount.toLocaleString()}</b>

                              <span
                                style={{
                                  display: "block",
                                  marginTop: "4px",
                                }}
                              >
                                {payment.payment_date
                                  ? new Date(
                                      payment.payment_date + "T00:00:00",
                                    ).toLocaleDateString()
                                  : "—"}
                              </span>

                              <small
                                style={{
                                  display: "block",
                                  marginTop: "4px",
                                }}
                              >
                                {isReturned
                                  ? "RETURNED"
                                  : `$${paymentAllocated.toLocaleString()} applied`}
                              </small>

                              {paymentCredit > 0 && (
                                <small
                                  style={{
                                    display: "block",
                                    marginTop: "4px",
                                  }}
                                >
                                  ${paymentCredit.toLocaleString()} credit
                                </small>
                              )}

                              {!isReturned && (
                                <button
                                  type="button"
                                  className="commandTextButton"
                                  style={{
                                    marginTop: "8px",
                                  }}
                                  onClick={async () => {
                                    const confirmed = window.confirm(
                                      `Mark this $${paymentAmount.toLocaleString()} payment as returned / insufficient funds?\n\nThe payment will be removed from the tenant balance and the configured NSF fee will be added automatically.`,
                                    );

                                    if (!confirmed) return;

                                    const s = supabase();

                                    const { error } = await s.rpc(
                                      "mark_payment_returned",
                                      {
                                        p_payment_id: payment.id,
                                        p_reason: "Insufficient funds",
                                      },
                                    );

                                    if (error) {
                                      alert(
                                        "Could not mark payment returned: " +
                                          error.message,
                                      );
                                      return;
                                    }

                                    await load();

                                    alert(
                                      "Payment marked returned. The tenant balance and NSF fee have been updated.",
                                    );
                                  }}
                                >
                                  Mark Returned / NSF
                                </button>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>

                {returnedPayments.length > 0 && (
                  <section
                    className="commandCard"
                    style={{ marginTop: "28px" }}
                  >
                    <div className="commandCardHeader">
                      <div>
                        <span className="commandSectionIcon">!</span>

                        <div>
                          <h2>Returned Payments</h2>

                          <p>
                            {returnedPayments.length}{" "}
                            {returnedPayments.length === 1
                              ? "payment has"
                              : "payments have"}{" "}
                            been returned.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </section>
            );
          })()}
        {view === "payments" &&
          (() => {
            const successfulTransactions = onlineTransactions.filter(
              (transaction) =>
                transaction.status === "succeeded" ||
                transaction.status === "completed" ||
                transaction.status === "paid",
            );

            const grossCollected = successfulTransactions.reduce(
              (total, transaction) => total + Number(transaction.amount || 0),
              0,
            );

            const totalFees = successfulTransactions.reduce(
              (total, transaction) =>
                total +
                Number(transaction.processing_fee || 0) +
                Number(transaction.platform_fee || 0),
              0,
            );

            const netCollected = successfulTransactions.reduce(
              (total, transaction) => {
                const storedNet = Number(transaction.net_amount || 0);

                if (storedNet > 0) {
                  return total + storedNet;
                }

                return (
                  total +
                  Number(transaction.amount || 0) -
                  Number(transaction.processing_fee || 0) -
                  Number(transaction.platform_fee || 0)
                );
              },
              0,
            );

            const pendingPayouts = landlordPayouts
              .filter(
                (payout) =>
                  payout.status === "pending" || payout.status === "in_transit",
              )
              .reduce((total, payout) => total + Number(payout.amount || 0), 0);

            const paidOut = landlordPayouts
              .filter((payout) => payout.status === "paid")
              .reduce((total, payout) => total + Number(payout.amount || 0), 0);

            const bankConnected =
              paymentAccount?.onboarding_complete &&
              paymentAccount?.payouts_enabled;

            return (
              <section className="panel paymentsPayoutsPage">
                <small>PAYMENT PROCESSING</small>

                <h1>Payments & Payouts</h1>

                <p>
                  Accept online rent payments, manage payment methods, and track
                  deposits to your bank account.
                </p>

                <div
                  className="overviewStats overviewStatsEnhanced"
                  style={{ marginTop: "28px" }}
                >
                  <article className="overviewStatCard">
                    <small>GROSS RENT</small>

                    <b>
                      $
                      {grossCollected.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </b>

                    <span>Online payments collected</span>
                  </article>

                  <article className="overviewStatCard">
                    <small>PROCESSING + PLATFORM FEES</small>

                    <b>
                      $
                      {totalFees.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </b>

                    <span>Total payment fees</span>
                  </article>

                  <article className="overviewStatCard">
                    <small>NET COLLECTED</small>

                    <b>
                      $
                      {netCollected.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </b>

                    <span>After recorded fees</span>
                  </article>

                  <article className="overviewStatCard">
                    <small>UPCOMING PAYOUT</small>

                    <b>
                      $
                      {pendingPayouts.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </b>

                    <span>Pending bank deposits</span>
                  </article>
                </div>

                <div className="commandMainGrid" style={{ marginTop: "28px" }}>
                  <section className="commandCard">
                    <div className="commandCardHeader">
                      <div>
                        <span className="commandSectionIcon">$</span>

                        <div>
                          <h2>Bank Account & Payouts</h2>

                          <p>
                            Connect the account where Unitvero rent deposits
                            will be sent.
                          </p>
                        </div>
                      </div>

                      <span
                        className={
                          bankConnected
                            ? "commandOccupancy occupied"
                            : "commandOccupancy vacant"
                        }
                      >
                        {bankConnected ? "CONNECTED" : "NOT CONNECTED"}
                      </span>
                    </div>

                    {!bankConnected ? (
                      <div className="featureEmpty">
                        <div className="featureEmptyIcon">$</div>

                        <b>Connect your payout account</b>

                        <span>
                          Complete secure payment onboarding before accepting
                          online tenant payments.
                        </span>

                        {stripeOnboardingAccountId ? (
                          <div
                            style={{
                              width: "100%",
                              marginTop: "16px",
                            }}
                          >
                            <StripeOnboarding
                              accountId={stripeOnboardingAccountId}
                              onExit={() => setStripeOnboardingAccountId(null)}
                            />
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="primary"
                            style={{ marginTop: "16px" }}
                            onClick={connectStripeAccount}
                          >
                            Connect Bank Account
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="commandRentSummary">
                        <div>
                          <small>PAYMENTS</small>
                          <b>
                            {paymentAccount?.charges_enabled
                              ? "Enabled"
                              : "Pending"}
                          </b>
                        </div>

                        <div>
                          <small>PAYOUTS</small>
                          <b>
                            {paymentAccount?.payouts_enabled
                              ? "Enabled"
                              : "Pending"}
                          </b>
                        </div>

                        <div>
                          <small>ACCOUNT</small>
                          <b>Connected</b>
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="commandCard">
                    <div className="commandCardHeader">
                      <div>
                        <span className="commandSectionIcon">↗</span>

                        <div>
                          <h2>Payout Summary</h2>

                          <p>
                            Track money moving from tenant payments to your
                            bank.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="commandRentSummary">
                      <div>
                        <small>UPCOMING</small>

                        <b>
                          $
                          {pendingPayouts.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </b>
                      </div>

                      <div>
                        <small>PAID OUT</small>

                        <b>
                          $
                          {paidOut.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </b>
                      </div>

                      <div>
                        <small>PAYOUT STATUS</small>

                        <b>{bankConnected ? "Active" : "Setup Required"}</b>
                      </div>
                    </div>
                  </section>
                </div>

                <section className="commandCard" style={{ marginTop: "28px" }}>
                  <div className="commandCardHeader">
                    <div>
                      <span className="commandSectionIcon">⚙</span>

                      <div>
                        <h2>Accepted Payment Methods</h2>

                        <p>
                          Control how tenants can pay rent through Unitvero.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="commandRentSummary">
                    <div>
                      <small>ACH / BANK</small>

                      <b>
                        {paymentSettings?.ach_enabled !== false
                          ? "Enabled"
                          : "Disabled"}
                      </b>
                    </div>

                    <div>
                      <small>CREDIT / DEBIT CARD</small>

                      <b>
                        {paymentSettings?.card_enabled !== false
                          ? "Enabled"
                          : "Disabled"}
                      </b>
                    </div>

                    <div>
                      <small>AUTOPAY</small>

                      <b>
                        {paymentSettings?.autopay_enabled !== false
                          ? "Enabled"
                          : "Disabled"}
                      </b>
                    </div>

                    <div>
                      <small>PARTIAL PAYMENTS</small>

                      <b>
                        {paymentSettings?.allow_partial_payments !== false
                          ? "Allowed"
                          : "Disabled"}
                      </b>
                    </div>
                  </div>
                </section>

                <section className="commandCard" style={{ marginTop: "28px" }}>
                  <div className="commandCardHeader">
                    <div>
                      <span className="commandSectionIcon">$</span>

                      <div>
                        <h2>Online Payment Activity</h2>

                        <p>
                          Tenant payments processed through Unitvero will appear
                          here.
                        </p>
                      </div>
                    </div>

                    <span>
                      {onlineTransactions.length}{" "}
                      {onlineTransactions.length === 1
                        ? "transaction"
                        : "transactions"}
                    </span>
                  </div>

                  {onlineTransactions.length === 0 ? (
                    <div className="featureEmpty">
                      <div className="featureEmptyIcon">$</div>

                      <b>No online payments yet</b>

                      <span>
                        Once tenants begin paying through Unitvero, transactions
                        and deposit information will appear here.
                      </span>
                    </div>
                  ) : (
                    <div className="commandLedgerPreview">
                      {onlineTransactions.map((transaction) => {
                        const property = props.find(
                          (item) => item.id === transaction.property_id,
                        );

                        const unit = units.find(
                          (item) => item.id === transaction.unit_id,
                        );

                        return (
                          <article
                            className="commandLedgerRow"
                            key={transaction.id}
                          >
                            <div>
                              <b>
                                {property?.address || "Online Rent Payment"}
                              </b>

                              <span>
                                {unit ? unit.unit_name : "Rental payment"}
                              </span>

                              <small>
                                {(transaction.payment_method || "payment")
                                  .replaceAll("_", " ")
                                  .toUpperCase()}
                              </small>
                            </div>

                            <div>
                              <b>
                                $
                                {Number(transaction.amount || 0).toLocaleString(
                                  undefined,
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  },
                                )}
                              </b>

                              <small>
                                {(transaction.status || "pending")
                                  .replaceAll("_", " ")
                                  .toUpperCase()}
                              </small>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section className="commandCard" style={{ marginTop: "28px" }}>
                  <div className="commandCardHeader">
                    <div>
                      <span className="commandSectionIcon">↗</span>

                      <div>
                        <h2>Payout History</h2>

                        <p>
                          Completed and pending deposits to your connected bank
                          account.
                        </p>
                      </div>
                    </div>
                  </div>

                  {landlordPayouts.length === 0 ? (
                    <div className="featureEmpty">
                      <div className="featureEmptyIcon">↗</div>

                      <b>No payouts yet</b>

                      <span>
                        Bank deposits will appear here after online rent
                        payments are processed.
                      </span>
                    </div>
                  ) : (
                    <div className="commandLedgerPreview">
                      {landlordPayouts.map((payout) => (
                        <article className="commandLedgerRow" key={payout.id}>
                          <div>
                            <b>Bank Payout</b>

                            <span>
                              {payout.arrival_date
                                ? `Expected ${new Date(
                                    payout.arrival_date + "T00:00:00",
                                  ).toLocaleDateString()}`
                                : "Arrival date pending"}
                            </span>
                          </div>

                          <div>
                            <b>
                              $
                              {Number(payout.amount || 0).toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                },
                              )}
                            </b>

                            <small>
                              {(payout.status || "pending")
                                .replaceAll("_", " ")
                                .toUpperCase()}
                            </small>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </section>
            );
          })()}
        {view === "maintenance" && (
          <section className="panel">
            <small>PROPERTY OPERATIONS</small>
            <h1>Maintenance</h1>
            <p>Track repairs, completion dates, vendors, landlord-only expenses, and tenant photos.</p>

            {maintenanceRequests.length === 0 ? (
              <div className="featureEmpty">
                <div className="featureEmptyIcon">◇</div>
                <b>No maintenance requests</b>
                <span>New tenant maintenance requests will appear here.</span>
              </div>
            ) : (
              <div style={{display:"grid",gap:16,marginTop:22}}>
                {maintenanceRequests.map((request) => {
                  const prop = props.find(x => x.id === request.property_id);
                  const tenant = tenancies.find(x => x.id === request.tenancy_id) || tenancies.find(x => x.tenant_id === request.tenant_id && x.property_id === request.property_id);
                  const expense = maintenanceExpenses.find(x => x.maintenance_request_id === request.id);
                  const photos = maintenanceAttachments.filter(x => x.maintenance_request_id === request.id && x.signed_url);

                  return (
                    <article key={request.id} className="commandCard">
                      <div className="commandCardHeader">
                        <div>
                          <span className="commandSectionIcon">◇</span>
                          <div>
                            <h2>{request.issue || request.category || "Maintenance request"}</h2>
                            <p>{prop?.address || "Property"} · {tenant?.tenant_name || tenant?.tenant_email || "Tenant"}</p>
                          </div>
                        </div>
                        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                          <select value={request.status || "open"} onChange={(e)=>updateMaintenanceStatus(request.id,e.target.value)}>
                            <option value="open">Submitted</option>
                            <option value="in_progress">In Progress</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => deleteMaintenanceRequest(request)}
                            style={{
                              minHeight:40,
                              padding:"0 13px",
                              border:"1px solid #efcaca",
                              borderRadius:10,
                              background:"#fff5f5",
                              color:"#b42318",
                              fontWeight:800,
                              cursor:"pointer",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <p>{request.description || "No description provided."}</p>

                      {photos.length > 0 && (
                        <div style={{marginTop:16}}>
                          <b>Tenant Photos</b>
                          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:12,marginTop:10}}>
                            {photos.map((photo) => (
                              <a key={photo.id} href={photo.signed_url} target="_blank" rel="noreferrer" style={{display:"block",borderRadius:12,overflow:"hidden",border:"1px solid #dbe3ef",background:"#f7f9fc"}}>
                                <img src={photo.signed_url} alt={photo.file_name || "Maintenance photo"} style={{width:"100%",height:150,objectFit:"cover",display:"block"}} />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="documentStats" style={{marginTop:14}}>
                        <article><span>Priority</span><b style={{fontSize:18}}>{request.priority || "normal"}</b><small>REQUEST</small></article>
                        <article><span>Submitted</span><b style={{fontSize:15}}>{request.created_at ? new Date(request.created_at).toLocaleDateString() : "—"}</b><small>DATE</small></article>
                        <article><span>Completed</span><b style={{fontSize:15}}>{request.completed_at ? new Date(request.completed_at).toLocaleDateString() : "—"}</b><small>DATE</small></article>
                        <article><span>Repair Cost</span><b style={{fontSize:18}}>${Number(expense?.total_cost || 0).toFixed(2)}</b><small>LANDLORD ONLY</small></article>
                      </div>

                      {hasFeature("maintenance_accounting") ? (
                        <form onSubmit={(e)=>saveMaintenanceExpense(e,request)} style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:12,marginTop:16}}>
                          <label style={{display:"grid",gap:6}}><b>Vendor / Contractor</b><input name="vendorName" defaultValue={expense?.vendor_name || ""} placeholder="Company or contractor" /></label>
                          <label style={{display:"grid",gap:6}}><b>Expense Date</b><input name="expenseDate" type="date" defaultValue={expense?.expense_date || ""} /></label>
                          <label style={{display:"grid",gap:6}}><b>Expense Notes</b><input name="description" defaultValue={expense?.description || ""} placeholder="What was repaired?" /></label>
                          <label style={{display:"grid",gap:6}}><b>Labor Cost ($)</b><input name="laborCost" type="number" min="0" step="0.01" defaultValue={expense?.labor_cost || 0} /></label>
                          <label style={{display:"grid",gap:6}}><b>Materials Cost ($)</b><input name="materialCost" type="number" min="0" step="0.01" defaultValue={expense?.material_cost || 0} /></label>
                          <label style={{display:"grid",gap:6}}><b>Other Cost ($)</b><input name="otherCost" type="number" min="0" step="0.01" defaultValue={expense?.other_cost || 0} /></label>
                          <div style={{gridColumn:"1 / -1",display:"flex",justifyContent:"space-between",gap:16,alignItems:"center",padding:"12px 14px",border:"1px solid #dbe3ef",borderRadius:12}}>
                            <label style={{display:"flex",gap:8,alignItems:"center"}}><input name="includeTax" type="checkbox" defaultChecked={expense ? expense.include_in_tax_report : true}/> Include in tax report</label>
                            <b>Total Repair Cost: ${Number(expense?.total_cost || 0).toFixed(2)}</b>
                            <button className="primary" type="submit">Save Repair Expense</button>
                          </div>
                        </form>
                      ) : (
                        <div style={{marginTop:16,padding:16,border:"1px solid #dbe3ef",borderRadius:14}}>
                          <b>Maintenance Accounting · Unitvero Pro</b>
                          <p style={{margin:"6px 0 12px"}}>Track labor, materials, vendors and tax-report expenses with Pro.</p>
                          <button type="button" className="primary" onClick={()=>requirePro("maintenance_accounting","Maintenance Accounting")}>View Pro</button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      
        {view === "bookkeeping" && (() => {
          const filteredRentPayments = rentPayments.filter((payment) =>
            bookkeepingMatchesDate(payment.payment_date)
          );

          const filteredMaintenanceExpenses = maintenanceExpenses.filter((expense) =>
            bookkeepingMatchesDate(expense.expense_date)
          );

          const totalIncome = filteredRentPayments.reduce(
            (sum, payment) => sum + Number(payment.amount || 0),
            0
          );

          const totalExpenses = filteredMaintenanceExpenses.reduce(
            (sum, expense) => sum + Number(expense.total_cost || 0),
            0
          );

          const netIncome = totalIncome - totalExpenses;

          const deductibleExpenses = filteredMaintenanceExpenses
            .filter((expense) => expense.include_in_tax_report)
            .reduce((sum, expense) => sum + Number(expense.total_cost || 0), 0);

          const laborExpenses = filteredMaintenanceExpenses.reduce(
            (sum, expense) => sum + Number(expense.labor_cost || 0),
            0
          );

          const materialExpenses = filteredMaintenanceExpenses.reduce(
            (sum, expense) => sum + Number(expense.material_cost || 0),
            0
          );

          const otherExpenses = filteredMaintenanceExpenses.reduce(
            (sum, expense) => sum + Number(expense.other_cost || 0),
            0
          );

          const propertyBreakdown = props
            .map((property) => {
              const income = filteredRentPayments
                .filter((payment) => payment.property_id === property.id)
                .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

              const expenses = filteredMaintenanceExpenses
                .filter((expense) => expense.property_id === property.id)
                .reduce((sum, expense) => sum + Number(expense.total_cost || 0), 0);

              return {
                ...property,
                income,
                expenses,
                net: income - expenses,
              };
            })
            .filter((property) => property.income !== 0 || property.expenses !== 0)
            .sort((a, b) => b.net - a.net);

          const years = Array.from(
            new Set([
              new Date().getFullYear(),
              ...rentPayments
                .map((payment) => bookkeepingDate(payment.payment_date)?.getFullYear())
                .filter(Boolean),
              ...maintenanceExpenses
                .map((expense) => bookkeepingDate(expense.expense_date)?.getFullYear())
                .filter(Boolean),
            ])
          ).sort((a, b) => b - a);

          const money = (value) =>
            `$${Number(value || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;

          const monthName = (monthIndex) =>
            new Date(2000, monthIndex, 1).toLocaleString("en-US", {
              month: "long",
            });

          return (
            <section className="panel">
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 16,
                flexWrap: "wrap",
              }}>
                <div>
                  <small>FINANCIAL MANAGEMENT</small>
                  <h1>Bookkeeping</h1>
                  <p>
                    Track collected rent, repair expenses, tax-deductible costs,
                    and property-level cash flow from your Unitvero records.
                  </p>
                </div>

                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  <select
                    value={bookkeepingYear}
                    onChange={(e) => setBookkeepingYear(e.target.value)}
                    style={{
                      minHeight:42,
                      border:"1px solid #dbe3ef",
                      borderRadius:12,
                      padding:"0 12px",
                      background:"#fff",
                    }}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>

                  <select
                    value={bookkeepingMonth}
                    onChange={(e) => setBookkeepingMonth(e.target.value)}
                    style={{
                      minHeight:42,
                      border:"1px solid #dbe3ef",
                      borderRadius:12,
                      padding:"0 12px",
                      background:"#fff",
                    }}
                  >
                    <option value="all">All months</option>
                    {Array.from({length:12}, (_, index) => (
                      <option key={index} value={index}>
                        {monthName(index)}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="primary"
                    onClick={async () => {
                      await load();
                    }}
                  >
                    Refresh
                  </button>

                  <button
                    type="button"
                    className="secondary"
                    onClick={exportBookkeepingCsv}
                  >
                    Export CSV
                  </button>
                </div>
              </div>

              <div
                className="portfolioStats"
                style={{
                  marginTop:22,
                  gridTemplateColumns:"repeat(4,minmax(0,1fr))",
                }}
              >
                <article>
                  <span className="portfolioStatIcon rent">$</span>
                  <div>
                    <small>RENT COLLECTED</small>
                    <b>{money(totalIncome)}</b>
                    <p>{filteredRentPayments.length} payment(s)</p>
                  </div>
                </article>

                <article>
                  <span className="portfolioStatIcon">−</span>
                  <div>
                    <small>EXPENSES</small>
                    <b>{money(totalExpenses)}</b>
                    <p>{filteredMaintenanceExpenses.length} repair expense(s)</p>
                  </div>
                </article>

                <article>
                  <span className="portfolioStatIcon occupied">✓</span>
                  <div>
                    <small>NET CASH FLOW</small>
                    <b>{money(netIncome)}</b>
                    <p>Collected rent less recorded expenses</p>
                  </div>
                </article>

                <article>
                  <span className="portfolioStatIcon">▣</span>
                  <div>
                    <small>TAX-TRACKED EXPENSES</small>
                    <b>{money(deductibleExpenses)}</b>
                    <p>Marked for tax reporting</p>
                  </div>
                </article>
              </div>

              <section className="commandCard" style={{marginTop:22}}>
                <div className="commandCardHeader">
                  <div>
                    <span className="commandSectionIcon">▤</span>
                    <div>
                      <h2>Expense breakdown</h2>
                      <p>Recorded maintenance costs for the selected period.</p>
                    </div>
                  </div>
                </div>

                <div className="documentStats" style={{marginTop:14}}>
                  <article>
                    <span>Labor</span>
                    <b>{money(laborExpenses)}</b>
                    <small>REPAIRS</small>
                  </article>
                  <article>
                    <span>Materials</span>
                    <b>{money(materialExpenses)}</b>
                    <small>REPAIRS</small>
                  </article>
                  <article>
                    <span>Other</span>
                    <b>{money(otherExpenses)}</b>
                    <small>REPAIRS</small>
                  </article>
                  <article>
                    <span>Deductible</span>
                    <b>{money(deductibleExpenses)}</b>
                    <small>TAX TRACKED</small>
                  </article>
                </div>
              </section>

              <section className="commandCard" style={{marginTop:22}}>
                <div className="commandCardHeader">
                  <div>
                    <span className="commandSectionIcon">▦</span>
                    <div>
                      <h2>Property cash flow</h2>
                      <p>Income and recorded maintenance expenses by property.</p>
                    </div>
                  </div>
                </div>

                {propertyBreakdown.length === 0 ? (
                  <div className="featureEmpty" style={{marginTop:16}}>
                    <div className="featureEmptyIcon">▤</div>
                    <b>No bookkeeping activity for this period</b>
                    <span>
                      Collected rent and recorded maintenance expenses will appear here.
                    </span>
                  </div>
                ) : (
                  <div style={{display:"grid",gap:10,marginTop:16}}>
                    {propertyBreakdown.map((property) => (
                      <article
                        key={property.id}
                        style={{
                          display:"grid",
                          gridTemplateColumns:"minmax(180px,1.5fr) repeat(3,minmax(110px,1fr))",
                          gap:12,
                          alignItems:"center",
                          padding:"14px 16px",
                          border:"1px solid #e1e7ef",
                          borderRadius:14,
                          background:"#fff",
                        }}
                      >
                        <div>
                          <b>{property.address || "Property"}</b>
                          <span style={{display:"block",fontSize:13,color:"#6b778c"}}>
                            {[property.city, property.state, property.zip_code].filter(Boolean).join(", ")}
                          </span>
                        </div>
                        <div>
                          <small style={{display:"block",color:"#6b778c"}}>INCOME</small>
                          <b>{money(property.income)}</b>
                        </div>
                        <div>
                          <small style={{display:"block",color:"#6b778c"}}>EXPENSES</small>
                          <b>{money(property.expenses)}</b>
                        </div>
                        <div>
                          <small style={{display:"block",color:"#6b778c"}}>NET</small>
                          <b>{money(property.net)}</b>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="commandCard" style={{marginTop:22}}>
                <div className="commandCardHeader">
                  <div>
                    <span className="commandSectionIcon">↕</span>
                    <div>
                      <h2>Bookkeeping ledger</h2>
                      <p>Every collected rent payment and recorded maintenance expense.</p>
                    </div>
                  </div>
                </div>

                <div style={{display:"grid",gap:8,marginTop:16}}>
                  {filteredRentPayments.map((payment) => (
                    <article
                      key={`income-${payment.id}`}
                      style={{
                        display:"grid",
                        gridTemplateColumns:"120px 110px 1fr auto",
                        gap:12,
                        alignItems:"center",
                        padding:"12px 14px",
                        borderBottom:"1px solid #edf1f5",
                      }}
                    >
                      <span>{payment.payment_date || "—"}</span>
                      <b style={{color:"#19734a"}}>INCOME</b>
                      <div>
                        <b>Rent payment</b>
                        <span style={{display:"block",fontSize:13,color:"#6b778c"}}>
                          {props.find((p) => p.id === payment.property_id)?.address || "Property"}
                        </span>
                      </div>
                      <b>{money(payment.amount)}</b>
                    </article>
                  ))}

                  {filteredMaintenanceExpenses.map((expense) => (
                    <article
                      key={`expense-${expense.id}`}
                      style={{
                        display:"grid",
                        gridTemplateColumns:"120px 110px 1fr auto",
                        gap:12,
                        alignItems:"center",
                        padding:"12px 14px",
                        borderBottom:"1px solid #edf1f5",
                      }}
                    >
                      <span>{expense.expense_date || "—"}</span>
                      <b style={{color:"#a23a3a"}}>EXPENSE</b>
                      <div>
                        <b>{expense.description || "Maintenance expense"}</b>
                        <span style={{display:"block",fontSize:13,color:"#6b778c"}}>
                          {props.find((p) => p.id === expense.property_id)?.address || "Property"}
                          {" · "}
                          {expense.category || "Repairs and maintenance"}
                        </span>
                      </div>
                      <b>-{money(expense.total_cost)}</b>
                    </article>
                  ))}

                  {filteredRentPayments.length === 0 &&
                    filteredMaintenanceExpenses.length === 0 && (
                      <div className="featureEmpty">
                        <div className="featureEmptyIcon">↕</div>
                        <b>No ledger entries</b>
                        <span>
                          Select another period or record rent and maintenance activity.
                        </span>
                      </div>
                    )}
                </div>
              </section>

              <section
                style={{
                  marginTop:22,
                  padding:"16px 18px",
                  border:"1px solid #dbe3ef",
                  borderRadius:14,
                  background:"#f8fafc",
                }}
              >
                <b>Bookkeeping note</b>
                <p style={{margin:"6px 0 0",color:"#5d6878"}}>
                  This ledger is automatically calculated from Unitvero's recorded
                  rent payments and maintenance expenses. It is a bookkeeping
                  record, not a tax return or accounting certification.
                </p>
              </section>
            </section>
          );
        })()}
</main>

      <button
        type="button"
        className="helpLauncher"
        onClick={() => setHelpOpen((current) => !current)}
        aria-expanded={helpOpen}
        aria-label="Open Unitvero help"
      >
        {helpOpen ? "×" : "?"}
      </button>

      {helpOpen && (
        <aside className="helpPanel" aria-label="Unitvero Help">
          <div className="helpPanelHeader">
            <div>
              <b>Unitvero Help</b>
              <span>
                <i></i> Online
              </span>
            </div>
            <button type="button" onClick={() => setHelpOpen(false)}>
              ×
            </button>
          </div>

          <div className="helpMessages">
            {helpMessages.map((message) => (
              <div
                key={message.id}
                className={
                  message.sender === "user" ? "helpMessage user" : "helpMessage"
                }
              >
                {message.text}
              </div>
            ))}
          </div>

          <form className="helpComposer" onSubmit={sendHelpMessage}>
            <input
              value={helpDraft}
              onChange={(event) => setHelpDraft(event.target.value)}
              placeholder="Type your question…"
              aria-label="Help question"
            />
            <button type="submit">Send</button>
          </form>
        </aside>
      )}

      <style jsx global>{`
        .unitveroModern {
          font-family:
            Inter,
            ui-sans-serif,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
          color: #172033;
        }
        .unitveroModern button,
        .unitveroModern input,
        .unitveroModern select,
        .unitveroModern textarea {
          font: inherit;
        }
        .dashboardHeaderTools {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 10px;
        }
        .languageSelect,
        .privacyButton {
          min-height: 42px;
          border: 1px solid #dce3ec;
          border-radius: 12px;
          background: #fff;
          color: #27344a;
          padding: 0 14px;
          font-weight: 700;
        }
        .privacyButton {
          cursor: pointer;
        }
        .privacyOn .privacyValue {
          filter: blur(8px);
          user-select: none;
        }
        .marketInsightsCard {
          margin: 0 0 24px;
          padding: 24px;
          border: 1px solid #dfe7f1;
          border-radius: 20px;
          background: linear-gradient(135deg, #fff 0%, #f6f9ff 100%);
          box-shadow: 0 12px 30px rgba(31, 50, 81, 0.07);
        }
        .marketInsightsHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
        }
        .marketInsightsHeader small {
          color: #64748b;
          font-weight: 800;
          letter-spacing: 0.08em;
        }
        .marketInsightsHeader h2 {
          margin: 5px 0;
        }
        .marketInsightsHeader p {
          margin: 0;
          color: #68768a;
        }
        .marketDataBadge {
          border-radius: 999px;
          background: #edf3ff;
          color: #315da8;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }
        .marketInsightsGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }
        .marketInsightsGrid > div {
          min-width: 0;
          border: 1px solid #e5eaf1;
          border-radius: 16px;
          background: #fff;
          padding: 18px;
        }
        .marketInsightsGrid span,
        .marketInsightsGrid small {
          display: block;
          color: #718096;
        }
        .marketInsightsGrid b {
          display: block;
          margin: 8px 0;
          font-size: clamp(19px, 2vw, 28px);
          color: #15243b;
        }
        .marketDataNotice {
          margin: 16px 0 0;
          border-left: 3px solid #4f7ce5;
          background: #eef4ff;
          color: #40516b;
          padding: 12px 14px;
          border-radius: 8px;
          font-size: 14px;
        }
        .propertyEditPage {
          max-width: 900px;
          margin: 0 auto;
        }
        .propertyEditCard {
          border: 1px solid #dfe7f1;
          border-radius: 22px;
          background: #fff;
          padding: clamp(22px, 4vw, 38px);
          box-shadow: 0 18px 45px rgba(31, 50, 81, 0.08);
        }
        .propertyEditHeader h1 {
          margin: 6px 0;
        }
        .propertyEditHeader p {
          margin: 0 0 24px;
          color: #68768a;
        }
        .propertyEditForm,
        .propertyEditForm label {
          display: grid;
          gap: 8px;
        }
        .propertyEditForm {
          gap: 18px;
        }
        .propertyEditForm label {
          color: #35445a;
          font-size: 14px;
          font-weight: 700;
        }
        .propertyEditForm input {
          width: 100%;
          min-height: 48px;
          box-sizing: border-box;
          border: 1px solid #d9e1eb;
          border-radius: 12px;
          padding: 0 14px;
          color: #172033;
          background: #fbfcfe;
        }
        .propertyEditRow {
          display: grid;
          grid-template-columns: 2fr 0.7fr 1fr;
          gap: 14px;
        }
        .propertyEditActions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 6px;
        }
        .propertyEditActions > button:not(.primary) {
          border: 1px solid #d9e1eb;
          border-radius: 12px;
          background: #fff;
          padding: 11px 18px;
          cursor: pointer;
        }
        .helpLauncher {
          position: fixed;
          z-index: 1001;
          right: 24px;
          bottom: 24px;
          width: 56px;
          height: 56px;
          border: 0;
          border-radius: 18px;
          background: #2859c5;
          color: #fff;
          font-size: 25px;
          font-weight: 800;
          box-shadow: 0 14px 35px rgba(40, 89, 197, 0.35);
          cursor: pointer;
        }
        .helpPanel {
          position: fixed;
          z-index: 1000;
          right: 24px;
          bottom: 92px;
          display: grid;
          grid-template-rows: auto minmax(220px, 1fr) auto;
          width: min(370px, calc(100vw - 32px));
          max-height: min(560px, calc(100vh - 130px));
          overflow: hidden;
          border: 1px solid #dbe3ed;
          border-radius: 22px;
          background: #fff;
          box-shadow: 0 24px 70px rgba(23, 32, 51, 0.22);
        }
        .helpPanelHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 18px;
          background: #172d57;
          color: #fff;
        }
        .helpPanelHeader > div {
          display: grid;
          gap: 3px;
        }
        .helpPanelHeader span {
          font-size: 12px;
          opacity: 0.84;
        }
        .helpPanelHeader i {
          display: inline-block;
          width: 7px;
          height: 7px;
          margin-right: 5px;
          border-radius: 50%;
          background: #4ade80;
        }
        .helpPanelHeader button {
          border: 0;
          background: transparent;
          color: #fff;
          font-size: 24px;
          cursor: pointer;
        }
        .helpMessages {
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 16px;
          background: #f6f8fc;
        }
        .helpMessage {
          max-width: 84%;
          align-self: flex-start;
          border-radius: 15px 15px 15px 4px;
          background: #fff;
          color: #34445c;
          padding: 11px 13px;
          font-size: 14px;
          line-height: 1.45;
          box-shadow: 0 4px 14px rgba(31, 50, 81, 0.06);
        }
        .helpMessage.user {
          align-self: flex-end;
          border-radius: 15px 15px 4px 15px;
          background: #2859c5;
          color: #fff;
        }
        .helpComposer {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid #e4e9f0;
        }
        .helpComposer input {
          min-width: 0;
          border: 1px solid #d8e0ea;
          border-radius: 11px;
          padding: 11px 12px;
        }
        .helpComposer button {
          border: 0;
          border-radius: 11px;
          background: #2859c5;
          color: #fff;
          padding: 0 15px;
          font-weight: 800;
          cursor: pointer;
        }
        @media (max-width: 800px) {
          .dashboardHeader {
            align-items: flex-start;
            gap: 18px;
          }
          .dashboardHeaderTools {
            justify-content: flex-start;
            width: 100%;
          }
          .marketInsightsHeader {
            display: grid;
          }
          .marketInsightsGrid,
          .propertyEditRow {
            grid-template-columns: 1fr;
          }
          .helpLauncher {
            right: 16px;
            bottom: 16px;
          }
          .helpPanel {
            right: 16px;
            bottom: 82px;
          }
        }
      `}</style>
    </div>
  );
}

function TenantPortal({
  profile,
  language,
  changeLanguage,
  privacyMode,
  togglePrivacy,
  onSignOut,
}) {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("home");
  const [tenancy, setTenancy] = useState(null);
  const [property, setProperty] = useState(null);
  const [unit, setUnit] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [tenantMaintenance, setTenantMaintenance] = useState([]);
  const [tenantDocuments, setTenantDocuments] = useState([]);
  const [landlordEntitlements, setLandlordEntitlements] = useState({});
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [notice, setNotice] = useState("");

  const words = {
    en: {
      home: "Home", payments: "Payments", lease: "Lease", messages: "Messages",
      maintenance: "Maintenance", documents: "Documents", settings: "Settings",
      welcome: "Welcome back", subtitle: "Manage your rental, payments, messages, and documents.",
      monthlyRent: "Monthly rent", leaseStatus: "Lease status", leaseTerm: "Lease term",
      active: "Active", property: "Property", payRent: "Pay rent", messageLandlord: "Message landlord",
      recentActivity: "Recent activity", propertyUpdates: "Property updates", noUpdates: "You're all caught up. No new property updates.",
      paymentCenter: "Payment center", paymentHistory: "Payment history", paymentSoon: "Online rent payments will be available here once checkout is connected.",
      leaseDetails: "Lease details", startDate: "Start date", endDate: "End date", unit: "Unit",
      inbox: "Messages", noMessages: "No messages yet. Start a conversation with your landlord below.",
      typeMessage: "Write a message…", send: "Send",
      maintenanceTitle: "Maintenance requests", maintenanceText: "Submit and track repair requests from this page.",
      documentsTitle: "Documents", documentsText: "Your lease and shared rental documents will appear here.",
      account: "Account settings", privacy: "Privacy mode", privacyText: "Hide financial amounts while using Unitvero in public.",
      language: "Language", notifications: "Notifications", notificationText: "In-app alerts are active. Phone push notifications are being connected next.",
      signOut: "Sign out", noRental: "No active rental is connected to this account yet.", refresh: "Refresh",
      connected: "Connected", unread: "unread", month: "month"
    },
    es: {
      home: "Inicio", payments: "Pagos", lease: "Contrato", messages: "Mensajes",
      maintenance: "Mantenimiento", documents: "Documentos", settings: "Ajustes",
      welcome: "Bienvenido", subtitle: "Administra tu alquiler, pagos, mensajes y documentos.",
      monthlyRent: "Renta mensual", leaseStatus: "Estado del contrato", leaseTerm: "Duración del contrato",
      active: "Activo", property: "Propiedad", payRent: "Pagar renta", messageLandlord: "Enviar mensaje",
      recentActivity: "Actividad reciente", propertyUpdates: "Actualizaciones", noUpdates: "Todo está al día. No hay nuevas actualizaciones.",
      paymentCenter: "Centro de pagos", paymentHistory: "Historial de pagos", paymentSoon: "Los pagos de renta en línea aparecerán aquí cuando se conecte el pago.",
      leaseDetails: "Detalles del contrato", startDate: "Fecha de inicio", endDate: "Fecha final", unit: "Unidad",
      inbox: "Mensajes", noMessages: "Aún no hay mensajes. Inicia una conversación con tu propietario abajo.",
      typeMessage: "Escribe un mensaje…", send: "Enviar",
      maintenanceTitle: "Solicitudes de mantenimiento", maintenanceText: "Envía y revisa solicitudes de reparación desde esta página.",
      documentsTitle: "Documentos", documentsText: "Tu contrato y documentos compartidos aparecerán aquí.",
      account: "Ajustes de cuenta", privacy: "Modo privado", privacyText: "Oculta cantidades financieras mientras usas Unitvero en público.",
      language: "Idioma", notifications: "Notificaciones", notificationText: "Las alertas dentro de la app están activas. Las notificaciones del teléfono se conectarán después.",
      signOut: "Cerrar sesión", noRental: "Aún no hay un alquiler activo conectado a esta cuenta.", refresh: "Actualizar",
      connected: "Conectado", unread: "sin leer", month: "mes"
    }
  };

  const t = (key) => words[language]?.[key] || words.en[key] || key;

  async function loadTenant() {
    setLoading(true);
    setNotice("");
    const s = supabase();
    const { data: { user }, error: userError } = await s.auth.getUser();

    if (userError || !user) {
      setNotice("Your session expired. Please sign in again.");
      setLoading(false);
      return;
    }

    const { data: tenancyData, error: tenancyError } = await s
      .from("tenancies")
      .select("*")
      .eq("tenant_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tenancyError) {
      setNotice("We could not load your rental yet: " + tenancyError.message);
      setLoading(false);
      return;
    }

    setTenancy(tenancyData || null);
    if (!tenancyData) {
      setLoading(false);
      return;
    }

    const [propertyResult, conversationResult, announcementResult, maintenanceResult, documentResult] = await Promise.all([
      s.from("properties").select("*").eq("id", tenancyData.property_id).maybeSingle(),
      s.from("conversations").select("*").eq("tenancy_id", tenancyData.id).order("updated_at", { ascending: false }),
      s.from("announcements").select("*")
        .or(`tenancy_id.eq.${tenancyData.id},property_id.eq.${tenancyData.property_id}`)
        .order("created_at", { ascending: false }),
      s.from("maintenance_requests").select("*").eq("tenant_id", user.id).eq("property_id", tenancyData.property_id).order("created_at", { ascending: false }),
      s.from("documents").select("*").eq("shared_with_tenant", true).or(`tenant_id.eq.${user.id},tenancy_id.eq.${tenancyData.id}`).order("created_at", { ascending: false }),
    ]);

    setProperty(propertyResult.data || null);

    if (propertyResult.data?.landlord_id) {
      const featureKeys = ["advanced_messaging", "document_center", "phone_notifications"];
      const checks = await Promise.all(featureKeys.map(async (featureKey) => {
        const { data, error } = await s.rpc("unitvero_landlord_has_feature", {
          p_landlord_id: propertyResult.data.landlord_id,
          p_feature_key: featureKey,
        });
        return [featureKey, !error && data === true];
      }));
      setLandlordEntitlements(Object.fromEntries(checks));
    } else {
      setLandlordEntitlements({});
    }

    if (tenancyData.unit_id) {
      const { data: unitData } = await s.from("units").select("*").eq("id", tenancyData.unit_id).maybeSingle();
      setUnit(unitData || null);
    } else {
      setUnit(null);
    }

    const rows = conversationResult.data || [];
    setConversations(rows);
    const activeConversation = rows[0] || null;
    setSelectedConversation(activeConversation);

    if (rows.length) {
      const ids = rows.map((item) => item.id);
      const { data: messageRows } = await s.from("messages").select("*")
        .in("conversation_id", ids).order("created_at", { ascending: true });
      setMessages(messageRows || []);
    } else {
      setMessages([]);
    }

    setAnnouncements(announcementResult.data || []);
    setTenantMaintenance(maintenanceResult.data || []);
    setTenantDocuments(documentResult.data || []);
    setLoading(false);
  }

  useEffect(() => { loadTenant(); }, []);

  async function ensureConversation() {
    if (!landlordEntitlements.advanced_messaging) {
      setNotice("Messaging is not enabled for this property yet.");
      return null;
    }
    if (selectedConversation) return selectedConversation;
    if (!tenancy || !property?.landlord_id) return null;

    const s = supabase();
    const { data, error } = await s.from("conversations").insert({
      landlord_id: property.landlord_id,
      property_id: tenancy.property_id,
      tenancy_id: tenancy.id,
      subject: "Tenant conversation",
      updated_at: new Date().toISOString(),
    }).select("*").single();

    if (error) {
      setNotice("Could not start the conversation: " + error.message);
      return null;
    }
    setConversations([data]);
    setSelectedConversation(data);
    return data;
  }

  async function sendTenantMessage(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const messageText = form.message.value.trim();
    if (!messageText) return;

    const conversation = await ensureConversation();
    if (!conversation) return;

    const s = supabase();
    const { data: { user } } = await s.auth.getUser();
    const { error } = await s.from("messages").insert({
      conversation_id: conversation.id,
      landlord_id: property.landlord_id,
      sender_type: "tenant",
      sender_user_id: user.id,
      message: messageText,
    });

    if (error) {
      setNotice("Could not send your message: " + error.message);
      return;
    }

    await s.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversation.id);
    form.reset();
    await loadTenant();
    setView("messages");
  }

  async function uploadUnitveroFile(file, folder) {
    if (!file) return null;

    const s = supabase();
    const { data: { user }, error: userError } = await s.auth.getUser();

    if (userError || !user) {
      setNotice("Please sign in again.");
      return null;
    }

    const extension = file.name.includes(".")
      ? file.name.split(".").pop().toLowerCase()
      : "jpg";

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
    const path = `${folder}/${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error } = await s.storage
      .from("unitvero-media")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "application/octet-stream",
      });

    if (error) {
      setNotice("Could not upload file: " + error.message);
      return null;
    }

    return {
      fileName: safeName,
      filePath: path,
    };
  }

  async function createMaintenanceRequest(e) {
    e.preventDefault();
    if (!tenancy || !property) return;

    const form = e.currentTarget;
    const issue = form.issue.value.trim();
    const description = form.description.value.trim();
    const photoFiles = Array.from(form.maintenancePhotos?.files || []).slice(0, 5);

    if (!issue || !description) return setNotice("Enter a repair issue and description.");

    for (const file of photoFiles) {
      if (!file.type.startsWith("image/")) return setNotice("Maintenance attachments must be images.");
      if (file.size > 10 * 1024 * 1024) return setNotice("Each photo must be 10 MB or smaller.");
    }

    const s = supabase();
    const { data: { user } } = await s.auth.getUser();
    if (!user) return setNotice("Please sign in again.");

    const { data: request, error } = await s
      .from("maintenance_requests")
      .insert({
        property_id: tenancy.property_id,
        unit_id: tenancy.unit_id || null,
        tenancy_id: tenancy.id,
        landlord_id: property.landlord_id,
        tenant_id: user.id,
        issue,
        description,
        category: form.category.value,
        priority: form.priority.value,
        permission_to_enter: form.permissionToEnter.checked,
        preferred_contact: form.preferredContact.value,
        status: "open",
      })
      .select("*")
      .single();

    if (error) return setNotice("Could not submit maintenance request: " + error.message);

    for (const file of photoFiles) {
      const uploaded = await uploadUnitveroFile(file, `maintenance/${request.id}`);
      if (!uploaded) continue;

      const { error: attachmentError } = await s
        .from("maintenance_request_attachments")
        .insert({
          maintenance_request_id: request.id,
          uploaded_by: user.id,
          file_name: uploaded.fileName,
          file_path: uploaded.filePath,
          file_url: null,
        });

      if (attachmentError) console.error("Could not save maintenance photo:", attachmentError);
    }

    form.reset();
    setNotice(photoFiles.length ? "Maintenance request and photos submitted." : "Maintenance request submitted.");
    await loadTenant();
    setView("maintenance");
  }

  async function openTenantMessages() {
    setView("messages");
    if (!messages.some(m => m.sender_type === "landlord" && !m.read_at)) return;
    const s = supabase();
    const unreadIds = messages.filter(m => m.sender_type === "landlord" && !m.read_at).map(m => m.id);
    if (unreadIds.length) {
      await s.from("messages").update({ read_at: new Date().toISOString() }).in("id", unreadIds);
      setMessages(current => current.map(m => unreadIds.includes(m.id) ? {...m, read_at:new Date().toISOString()} : m));
    }
  }

  const unreadMessages = messages.filter((m) => m.sender_type === "landlord" && !m.read_at).length;
  const money = (value) => privacyMode ? "••••" : `$${Number(value || 0).toLocaleString()}`;
  const formatDate = (value) => value
    ? new Date(`${value}T00:00:00`).toLocaleDateString(language === "es" ? "es-US" : "en-US", {
        month: "short", day: "numeric", year: "numeric"
      })
    : "—";

  const firstName = (profile?.full_name || tenancy?.tenant_name || "Tenant").split(" ")[0];
  const propertyLine = property
    ? [property.address, property.city, property.state, property.zip_code].filter(Boolean).join(", ")
    : "Your rental property";

  const nav = [
    ["home", "⌂", t("home")],
    ["payments", "$", t("payments")],
    ["lease", "▤", t("lease")],
    ["messages", "✉", t("messages")],
    ["maintenance", "◇", t("maintenance")],
    ["documents", "▧", t("documents")],
    ["settings", "⚙", t("settings")],
  ];

  if (loading) {
    return (
      <div className="utLoading">
        <div className="utLogo">unit<span>vero</span></div>
        <p>Loading your account…</p>
        <TenantStyles />
      </div>
    );
  }

  return (
    <div className="utShell">
      <TenantStyles />

      <aside className="utSidebar">
        <div className="utLogo">unit<span>vero</span></div>
        <div className="utPortalLabel">TENANT PORTAL</div>

        <nav className="utNav">
          {nav.map(([key, icon, label]) => (
            <button key={key} type="button" className={view === key ? "active" : ""} onClick={() => setView(key)}>
              <span className="utNavIcon">{icon}</span>
              <span>{label}</span>
              {key === "messages" && unreadMessages > 0 && <b>{unreadMessages}</b>}
            </button>
          ))}
        </nav>

        <div className="utUser">
          <div className="utAvatar">{firstName.charAt(0).toUpperCase()}</div>
          <div className="utUserText">
            <strong>{profile?.full_name || tenancy?.tenant_name || "Tenant"}</strong>
            <span>Tenant</span>
          </div>
          <button type="button" onClick={onSignOut} title={t("signOut")}>↗</button>
        </div>
      </aside>

      <main className="utMain">
        <header className="utHeader">
          <div>
            <div className="utEyebrow">TENANT DASHBOARD</div>
            <h1>{t("welcome")}, {firstName}.</h1>
            <p>{t("subtitle")}</p>
          </div>
          <div className="utHeaderActions">
            <select value={language} onChange={(e) => changeLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
            <button type="button" onClick={togglePrivacy}>{privacyMode ? "Show amounts" : "Hide amounts"}</button>
            <button type="button" className="utIconButton" onClick={() => setView("messages")} aria-label="Notifications">
              ♢
              {(unreadMessages + announcements.length) > 0 && <i>{unreadMessages + announcements.length}</i>}
            </button>
          </div>
        </header>

        {notice && <div className="utNotice">{notice}</div>}

        {!tenancy ? (
          <section className="utEmptyCard">
            <div className="utEmptyIcon">⌂</div>
            <h2>{t("noRental")}</h2>
            <p>If you recently accepted an invitation, refresh your account.</p>
            <button type="button" className="utPrimary" onClick={loadTenant}>{t("refresh")}</button>
          </section>
        ) : (
          <>
            {view === "home" && (
              <div className="utPage">
                <section className="utPropertyCard">
                  <div className="utPropertyTop">
                    <div>
                      <div className="utEyebrow light">{t("property")}</div>
                      <h2>{property?.address || "Your rental property"}</h2>
                      <p>{[property?.city, property?.state, property?.zip_code].filter(Boolean).join(" • ")}</p>
                    </div>
                    <div className="utRentBlock">
                      <span>{t("monthlyRent")}</span>
                      <strong>{money(tenancy.monthly_rent)}</strong>
                      <small>/ {t("month")}</small>
                    </div>
                  </div>
                  <div className="utPropertyActions">
                    <button type="button" onClick={() => setView("payments")}>{t("payRent")}</button>
                    <button type="button" onClick={() => setView("messages")}>{t("messageLandlord")}</button>
                  </div>
                </section>

                <section className="utMetricGrid">
                  <article>
                    <div className="utMetricIcon">✓</div>
                    <span>{t("leaseStatus")}</span>
                    <strong>{t("active")}</strong>
                    <small>{t("connected")}</small>
                  </article>
                  <article>
                    <div className="utMetricIcon">▤</div>
                    <span>{t("leaseTerm")}</span>
                    <strong>{formatDate(tenancy.start_date)}</strong>
                    <small>{tenancy.end_date ? `to ${formatDate(tenancy.end_date)}` : "Open ended"}</small>
                  </article>
                  <article>
                    <div className="utMetricIcon">$</div>
                    <span>{t("monthlyRent")}</span>
                    <strong>{money(tenancy.monthly_rent)}</strong>
                    <small>Rent amount</small>
                  </article>
                  <article>
                    <div className="utMetricIcon">✉</div>
                    <span>{t("messages")}</span>
                    <strong>{unreadMessages}</strong>
                    <small>{t("unread")}</small>
                  </article>
                </section>

                <div className="utTwoCol">
                  <section className="utCard">
                    <div className="utCardHead">
                      <div>
                        <div className="utEyebrow">{t("propertyUpdates")}</div>
                        <h2>Announcements</h2>
                      </div>
                      <span className="utCount">{announcements.length}</span>
                    </div>
                    {announcements.length === 0 ? (
                      <div className="utEmptyInline">
                        <div>✓</div>
                        <strong>All caught up</strong>
                        <p>{t("noUpdates")}</p>
                      </div>
                    ) : (
                      <div className="utFeed">
                        {announcements.slice(0, 5).map((item) => (
                          <article key={item.id}>
                            <div className="utDot"></div>
                            <div>
                              <strong>{item.title}</strong>
                              <p>{item.message}</p>
                              <small>{item.created_at ? new Date(item.created_at).toLocaleString() : ""}</small>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="utCard">
                    <div className="utCardHead">
                      <div>
                        <div className="utEyebrow">{t("recentActivity")}</div>
                        <h2>Quick access</h2>
                      </div>
                    </div>
                    <div className="utQuickList">
                      <button type="button" onClick={() => setView("lease")}><span>▤</span><div><b>{t("lease")}</b><small>View rental details</small></div><i>›</i></button>
                      <button type="button" onClick={() => setView("maintenance")}><span>◇</span><div><b>{t("maintenance")}</b><small>Repairs and requests</small></div><i>›</i></button>
                      <button type="button" onClick={() => setView("documents")}><span>▧</span><div><b>{t("documents")}</b><small>Lease and shared files</small></div><i>›</i></button>
                    </div>
                  </section>
                </div>
              </div>
            )}

            {view === "payments" && (
              <div className="utPage">
                <div className="utPageTitle"><div className="utEyebrow">RENT</div><h2>{t("paymentCenter")}</h2><p>View your rent amount and payment activity.</p></div>
                <div className="utPaymentGrid">
                  <section className="utCard utPaymentHero">
                    <span>{t("monthlyRent")}</span>
                    <strong>{money(tenancy.monthly_rent)}</strong>
                    <small>/ {t("month")}</small>
                    <button type="button" className="utPrimary" disabled>Pay rent</button>
                    <p>{t("paymentSoon")}</p>
                  </section>
                  <section className="utCard">
                    <div className="utCardHead"><div><div className="utEyebrow">ACTIVITY</div><h2>{t("paymentHistory")}</h2></div></div>
                    <div className="utEmptyInline"><div>$</div><strong>No online payments yet</strong><p>Your completed online payments will be listed here.</p></div>
                  </section>
                </div>
              </div>
            )}

            {view === "lease" && (
              <div className="utPage">
                <div className="utPageTitle"><div className="utEyebrow">RENTAL AGREEMENT</div><h2>{t("leaseDetails")}</h2><p>Key information for your current rental.</p></div>
                <section className="utCard">
                  <div className="utLeaseHeader">
                    <div><span>{t("property")}</span><h3>{propertyLine}</h3></div>
                    <span className="utStatus">● {t("active")}</span>
                  </div>
                  <div className="utDetails">
                    <div><span>{t("startDate")}</span><strong>{formatDate(tenancy.start_date)}</strong></div>
                    <div><span>{t("endDate")}</span><strong>{tenancy.end_date ? formatDate(tenancy.end_date) : "Open ended"}</strong></div>
                    <div><span>{t("monthlyRent")}</span><strong>{money(tenancy.monthly_rent)}</strong></div>
                    <div><span>{t("unit")}</span><strong>{unit?.unit_name || unit?.name || "—"}</strong></div>
                  </div>
                </section>
              </div>
            )}

            {view === "messages" && (
              <div className="utPage">
                <div className="utPageTitle"><div className="utEyebrow">COMMUNICATION</div><h2>{t("inbox")}</h2><p>Keep rental conversations organized in one place.</p></div>
                <section className="utCard utChat">
                  <div className="utChatHead">
                    <div className="utAvatar landlord">L</div>
                    <div><strong>Property management</strong><span>{property?.address || "Your rental"}</span></div>
                    <span className="utStatus">● Active</span>
                  </div>
                  <div className="utMessageHistory">
                    {messages.length === 0 ? (
                      <div className="utEmptyInline chatEmpty"><div>✉</div><strong>No messages yet</strong><p>{t("noMessages")}</p></div>
                    ) : messages.map((message) => (
                      <div key={message.id} className={`utBubble ${message.sender_type === "tenant" ? "mine" : ""}`}>
                        <span>{message.sender_type === "tenant" ? "You" : "Landlord"}</span>
                        <p>{message.message}</p>
                        <small>{message.created_at ? new Date(message.created_at).toLocaleString() : ""}</small>
                      </div>
                    ))}
                  </div>
                  <form className="utComposer" onSubmit={sendTenantMessage}>
                    <input name="message" placeholder={t("typeMessage")} autoComplete="off" />
                    <button type="submit">{t("send")}</button>
                  </form>
                </section>
              </div>
            )}

            {view === "maintenance" && (
              <div className="utPage">
                <div className="utPageTitle"><div className="utEyebrow">PROPERTY CARE</div><h2>{t("maintenanceTitle")}</h2><p>Submit a repair and follow it through completion.</p></div>
                <div className="utTwoCol">
                  <section className="utCard">
                    <div className="utCardHead"><div><div className="utEyebrow">NEW REQUEST</div><h2>Report a problem</h2></div></div>
                    <form onSubmit={createMaintenanceRequest} style={{display:"grid",gap:10}}>
                      <input name="issue" placeholder="What needs to be fixed?" required />
                      <select name="category" defaultValue="general"><option value="general">General</option><option value="plumbing">Plumbing</option><option value="electrical">Electrical</option><option value="hvac">Heating / Cooling</option><option value="appliance">Appliance</option><option value="pest">Pest</option><option value="other">Other</option></select>
                      <select name="priority" defaultValue="normal"><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="emergency">Emergency</option></select>
                      <textarea name="description" rows="5" placeholder="Describe the problem and where it is located." required />
                      <label style={{display:"grid",gap:6}}>
                        <span>Photos</span>
                        <input type="file" name="maintenancePhotos" accept="image/jpeg,image/png,image/webp" multiple />
                        <small>Add up to 5 photos of the problem.</small>
                      </label>
                      <select name="preferredContact" defaultValue="in_app"><option value="in_app">In-app message</option><option value="phone">Phone</option><option value="email">Email</option></select>
                      <label style={{display:"flex",gap:8,alignItems:"center",fontSize:12}}><input type="checkbox" name="permissionToEnter"/> Landlord/contractor has permission to enter for this repair</label>
                      <button className="utPrimary" type="submit">Submit Maintenance Request</button>
                    </form>
                  </section>
                  <section className="utCard">
                    <div className="utCardHead"><div><div className="utEyebrow">REQUESTS</div><h2>Repair history</h2></div><span className="utCount">{tenantMaintenance.length}</span></div>
                    {tenantMaintenance.length === 0 ? <div className="utEmptyInline"><div>◇</div><strong>No requests yet</strong><p>Your submitted repairs will appear here.</p></div> :
                      <div className="utFeed">{tenantMaintenance.map(item => <article key={item.id}><div className="utDot"></div><div><strong>{item.issue || item.category || "Repair request"}</strong><p>{item.description}</p><small>{String(item.status || "open").replaceAll("_"," ").toUpperCase()} · Submitted {item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}{item.completed_at ? ` · Completed ${new Date(item.completed_at).toLocaleDateString()}` : ""}</small></div></article>)}</div>}
                  </section>
                </div>
              </div>
            )}

            {view === "documents" && (
              <div className="utPage">
                <div className="utPageTitle"><div className="utEyebrow">FILES</div><h2>{t("documentsTitle")}</h2><p>Rental documents shared with your account.</p></div>
                <section className="utCard">
                  {tenantDocuments.length === 0 ? <div className="utEmptyInline large"><div>▧</div><strong>No documents shared yet</strong><p>{t("documentsText")}</p></div> :
                    <div className="utFeed">{tenantDocuments.map(doc => <article key={doc.id}><div className="utDot"></div><div><strong>{doc.title}</strong><p>{doc.description || String(doc.document_type || "document").replaceAll("_"," ")}</p><small>{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : ""} · {doc.status || "active"}</small></div></article>)}</div>}
                </section>
              </div>
            )}

            {view === "settings" && (
              <div className="utPage">
                <div className="utPageTitle"><div className="utEyebrow">ACCOUNT</div><h2>{t("account")}</h2><p>Control your Unitvero tenant experience.</p></div>
                <section className="utCard utSettings">
                  <div className="utSettingRow">
                    <div className="utSettingIcon">◎</div>
                    <div><strong>{t("privacy")}</strong><p>{t("privacyText")}</p></div>
                    <button type="button" className="utSecondary" onClick={togglePrivacy}>{privacyMode ? "On" : "Off"}</button>
                  </div>
                  <div className="utSettingRow">
                    <div className="utSettingIcon">文</div>
                    <div><strong>{t("language")}</strong><p>Choose the language used throughout your tenant portal.</p></div>
                    <select value={language} onChange={(e) => changeLanguage(e.target.value)}><option value="en">English</option><option value="es">Español</option></select>
                  </div>
                  <div className="utSettingRow">
                    <div className="utSettingIcon">♢</div>
                    <div><strong>{t("notifications")}</strong><p>{t("notificationText")}</p></div>
                    <span className="utStatus">In-app on</span>
                  </div>
                  <div className="utSettingRow">
                    <div className="utSettingIcon">↗</div>
                    <div><strong>{t("signOut")}</strong><p>Sign out of this device.</p></div>
                    <button type="button" className="utSecondary" onClick={onSignOut}>{t("signOut")}</button>
                  </div>
                </section>
              </div>
            )}
          </>
        )}
      
      <div style={{
        position:"fixed",
        left:18,
        bottom:18,
        zIndex:1199,
        background:"#fff",
        border:"1px solid #dbe3ef",
        borderRadius:12,
        padding:"7px 9px",
        boxShadow:"0 8px 24px rgba(0,0,0,.12)",
      }}>
        <select
          aria-label="Choose language"
          value={appLanguage}
          onChange={(e) => setAppLanguage(e.target.value)}
          style={{
            border:0,
            outline:"none",
            background:"#fff",
            fontWeight:700,
            color:"#263247",
          }}
        >
          {unitveroLanguages.map(([code, name]) => (
            <option key={code} value={code}>{name}</option>
          ))}
        </select>
      </div>

      {privacyOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position:"fixed",
            inset:0,
            zIndex:1300,
            background:"rgba(10,20,35,.58)",
            display:"grid",
            placeItems:"center",
            padding:20,
          }}
        >
          <div style={{
            width:"min(820px,100%)",
            maxHeight:"90vh",
            overflow:"auto",
            background:"#fff",
            borderRadius:22,
            padding:26,
          }}>
            <div style={{
              display:"flex",
              justifyContent:"space-between",
              gap:14,
              alignItems:"flex-start",
            }}>
              <div>
                <small>UNITVERO</small>
                <h2 style={{margin:"4px 0 6px"}}>Privacy Policy</h2>
                <p style={{margin:0,color:"#667386"}}>
                  Privacy information and data choices.
                </p>
              </div>
              <button
                type="button"
                className="secondary"
                onClick={() => setPrivacyOpen(false)}
              >
                ×
              </button>
            </div>

            <div style={{lineHeight:1.65,fontSize:13,marginTop:20}}>
              <h3>1. Information We Collect</h3>
              <p>
                Unitvero may collect account information, property and tenancy
                information, payment-related records, maintenance requests and
                photos, messages, documents, signatures, and other information
                that users choose to enter or upload. The exact categories depend
                on the features a user uses.
              </p>

              <h3>2. How We Use Information</h3>
              <p>
                Information is used to provide property-management features,
                authenticate accounts, process and display rental records,
                facilitate communications, manage documents and signatures,
                provide support, improve security, and operate requested
                subscription features.
              </p>

              <h3>3. Sharing</h3>
              <p>
                Unitvero may use service providers that process information on
                Unitvero's behalf, such as hosting, authentication, storage,
                payment, email, messaging, analytics, or document-delivery
                providers. Information may also be shared when a user explicitly
                requests a transfer, such as sending a document to a tenant.
              </p>

              <h3>4. Security</h3>
              <p>
                Unitvero uses access controls and security measures designed to
                protect stored information. No internet service can guarantee
                absolute security.
              </p>

              <h3>5. Retention and Deletion</h3>
              <p>
                Unitvero retains information for as long as reasonably necessary
                to provide the service, comply with legal obligations, resolve
                disputes, and maintain legitimate business records. Users may
                request account/data deletion through the account-support process,
                subject to information that must be retained by law.
              </p>

              <h3>6. Privacy Choices</h3>
              <p>
                Users may contact Unitvero to request access, correction, or
                deletion of applicable personal information and to ask questions
                about data practices.
              </p>

              <h3>7. Children</h3>
              <p>
                Unitvero is not directed to children and should not be used by
                children without appropriate authorization.
              </p>

              <h3>8. Changes</h3>
              <p>
                Unitvero may update this policy as its services or legal
                requirements change. The current policy should be made available
                through a public privacy-policy URL.
              </p>

              <h3>9. Contact</h3>
              <p>
                Privacy questions should be directed to the privacy/support
                contact published by the Unitvero operator.
              </p>

              <div style={{
                padding:14,
                background:"#fff8e8",
                border:"1px solid #ead9a9",
                borderRadius:12,
              }}>
                <b>Before app-store submission:</b> replace the placeholder
                operator/contact information with your actual legal business
                name, privacy email, retention practices, and the exact third-party
                services Unitvero uses. This policy should be reviewed for the
                actual production data flows before submission.
              </div>
            </div>
          </div>
        </div>
      )}
</main>
    </div>
  );
}

function TenantStyles() {
  return (
    <style jsx global>{`
      .utShell{min-height:100vh;background:#f4f7f6;color:#163b32;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;display:grid;grid-template-columns:238px minmax(0,1fr)}
      .utSidebar{background:#103f34;color:#fff;padding:27px 16px 18px;min-height:100vh;position:sticky;top:0;height:100vh;box-sizing:border-box;display:flex;flex-direction:column}
      .utLogo{font-size:27px;font-weight:900;letter-spacing:-1.4px;line-height:1}.utLogo span{color:#61d8b4}.utPortalLabel{font-size:9px;letter-spacing:2px;color:#91bcb0;font-weight:800;margin-top:7px}
      .utNav{display:flex;flex-direction:column;gap:4px;margin-top:34px;flex:1}.utNav button{height:43px;border:0;border-radius:10px;background:transparent;color:#bcd3cc;padding:0 12px;display:grid;grid-template-columns:25px 1fr auto;align-items:center;text-align:left;font-size:12px;font-weight:700;cursor:pointer;transition:.15s}.utNav button:hover{background:rgba(255,255,255,.06);color:#fff}.utNav button.active{background:#205d4e;color:#fff;box-shadow:inset 3px 0 #63d6b4}.utNavIcon{font-size:13px}.utNav button b{font-size:9px;background:#ef6b63;color:#fff;border-radius:99px;min-width:19px;height:19px;display:grid;place-items:center}
      .utUser{border-top:1px solid rgba(255,255,255,.12);padding-top:16px;display:grid;grid-template-columns:36px 1fr 28px;gap:9px;align-items:center}.utAvatar{width:36px;height:36px;border-radius:10px;background:#63d6b4;color:#103f34;display:grid;place-items:center;font-weight:900;font-size:13px}.utUserText strong,.utUserText span{display:block}.utUserText strong{font-size:11px;color:#fff}.utUserText span{font-size:9px;color:#92b8ae;margin-top:2px}.utUser>button{border:0;background:transparent;color:#9fc2b8;font-size:16px;cursor:pointer}
      .utMain{padding:34px 40px 60px;box-sizing:border-box;min-width:0}.utHeader{max-width:1240px;margin:0 auto 25px;display:flex;justify-content:space-between;gap:25px;align-items:flex-start}.utEyebrow{font-size:9px;letter-spacing:1.7px;color:#7c8d88;font-weight:850;text-transform:uppercase}.utEyebrow.light{color:#a8d4c8}.utHeader h1{font-size:30px;letter-spacing:-1px;margin:5px 0 4px;color:#173d34}.utHeader p,.utPageTitle p{margin:0;color:#7a8b86;font-size:13px}.utHeaderActions{display:flex;gap:7px;align-items:center}.utHeaderActions select,.utHeaderActions button,.utSecondary,.utSettings select{height:38px;border:1px solid #dce5e1;background:#fff;border-radius:9px;padding:0 11px;color:#31564d;font-size:11px;font-weight:700}.utIconButton{width:40px;padding:0!important;position:relative;font-size:17px!important}.utIconButton i{position:absolute;right:-5px;top:-6px;background:#e85f58;color:#fff;font-style:normal;font-size:8px;min-width:17px;height:17px;border-radius:99px;display:grid;place-items:center}
      .utNotice{max-width:1240px;margin:0 auto 16px;background:#fff8e8;border:1px solid #f0dfb8;color:#765c28;padding:11px 13px;border-radius:10px;font-size:12px}.utPage{max-width:1240px;margin:0 auto}.utPageTitle{margin:4px 0 20px}.utPageTitle h2{font-size:24px;letter-spacing:-.5px;margin:5px 0 4px}
      .utPropertyCard{background:linear-gradient(120deg,#164d40,#246a58);border-radius:18px;color:#fff;padding:25px 27px;box-shadow:0 13px 35px rgba(19,62,52,.13)}.utPropertyTop{display:flex;justify-content:space-between;gap:30px;align-items:center}.utPropertyCard h2{font-size:25px;margin:7px 0 4px;letter-spacing:-.5px}.utPropertyCard p{margin:0;color:#b9d9d0;font-size:12px}.utRentBlock{text-align:right}.utRentBlock span,.utRentBlock small{display:block;color:#b9d9d0;font-size:10px}.utRentBlock strong{display:block;font-size:31px;margin:3px 0}.utPropertyActions{display:flex;gap:8px;margin-top:22px;padding-top:18px;border-top:1px solid rgba(255,255,255,.12)}.utPropertyActions button{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.09);color:#fff;border-radius:9px;padding:9px 13px;font-size:11px;font-weight:800;cursor:pointer}
      .utMetricGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:14px 0}.utMetricGrid article,.utCard{background:#fff;border:1px solid #e1e8e5;border-radius:14px;box-shadow:0 4px 18px rgba(25,61,52,.035)}.utMetricGrid article{padding:17px}.utMetricIcon{width:31px;height:31px;border-radius:9px;background:#edf6f3;color:#287d68;display:grid;place-items:center;margin-bottom:13px;font-size:12px}.utMetricGrid span,.utPaymentHero>span{display:block;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#879590;font-weight:800}.utMetricGrid strong{display:block;font-size:16px;margin:5px 0;color:#23473e}.utMetricGrid small{font-size:10px;color:#94a09c}
      .utTwoCol,.utPaymentGrid{display:grid;grid-template-columns:1.35fr .85fr;gap:14px}.utCard{padding:21px}.utCardHead{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px}.utCardHead h2{font-size:18px;margin:4px 0 0}.utCount{background:#edf6f3;color:#287d68;min-width:28px;height:28px;border-radius:99px;display:grid;place-items:center;font-size:10px;font-weight:850}.utEmptyInline{text-align:center;padding:30px 18px;color:#82918c}.utEmptyInline>div{width:38px;height:38px;margin:0 auto 10px;border-radius:11px;background:#edf6f3;color:#2b826d;display:grid;place-items:center}.utEmptyInline strong{display:block;color:#34564d;font-size:13px}.utEmptyInline p{font-size:11px;line-height:1.55;max-width:410px;margin:5px auto 0}.utEmptyInline.large{padding:65px 20px}.utEmptyInline.large>div{width:46px;height:46px}.utFeed article{display:grid;grid-template-columns:8px 1fr;gap:10px;padding:13px 0;border-top:1px solid #edf1ef}.utDot{width:7px;height:7px;background:#4da98d;border-radius:99px;margin-top:5px}.utFeed strong{font-size:12px}.utFeed p{font-size:11px;color:#697b75;margin:3px 0}.utFeed small{font-size:9px;color:#98a39f}
      .utQuickList{display:grid;gap:6px}.utQuickList button{display:grid;grid-template-columns:34px 1fr 16px;gap:10px;align-items:center;border:0;background:#f7f9f8;border-radius:10px;padding:10px;text-align:left;color:#31554c;cursor:pointer}.utQuickList button>span{width:32px;height:32px;background:#fff;border:1px solid #e4eae7;border-radius:9px;display:grid;place-items:center}.utQuickList b,.utQuickList small{display:block}.utQuickList b{font-size:11px}.utQuickList small{font-size:9px;color:#8b9894;margin-top:2px}.utQuickList i{font-style:normal;font-size:18px;color:#91a09b}
      .utPaymentHero strong{display:block;font-size:35px;margin:7px 0 0}.utPaymentHero small{color:#83918d}.utPaymentHero .utPrimary{margin-top:25px;width:100%}.utPaymentHero p{font-size:10px;color:#8a9893;line-height:1.5}.utPrimary{border:0;background:#21836a;color:#fff;border-radius:9px;min-height:39px;padding:0 16px;font-weight:800;font-size:11px}.utPrimary:disabled{opacity:.55;cursor:not-allowed}
      .utLeaseHeader{display:flex;justify-content:space-between;gap:20px;align-items:center;padding-bottom:18px;border-bottom:1px solid #e9eeec}.utLeaseHeader span{font-size:9px;text-transform:uppercase;color:#86958f;font-weight:800}.utLeaseHeader h3{font-size:17px;margin:4px 0 0}.utStatus{display:inline-flex!important;align-items:center;color:#277d68!important;background:#edf7f3;border-radius:99px;padding:6px 9px;font-size:9px!important;font-weight:850!important;white-space:nowrap}.utDetails{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:18px}.utDetails div{background:#f7f9f8;border-radius:10px;padding:14px}.utDetails span,.utDetails strong{display:block}.utDetails span{font-size:9px;color:#86958f;text-transform:uppercase;font-weight:800}.utDetails strong{font-size:12px;margin-top:5px}
      .utChat{padding:0;overflow:hidden}.utChatHead{height:64px;padding:0 18px;border-bottom:1px solid #e5ebe8;display:grid;grid-template-columns:38px 1fr auto;gap:10px;align-items:center}.utAvatar.landlord{background:#eaf5f1;color:#267a66}.utChatHead strong,.utChatHead span{display:block}.utChatHead strong{font-size:12px}.utChatHead span:not(.utStatus){font-size:9px;color:#879590;margin-top:2px}.utMessageHistory{min-height:390px;max-height:540px;overflow:auto;background:#f7f9f8;padding:20px}.chatEmpty{padding-top:100px}.utBubble{max-width:68%;width:max-content;background:#fff;border:1px solid #dfe7e3;border-radius:13px 13px 13px 4px;padding:10px 12px;margin:8px 0;box-shadow:0 2px 7px rgba(20,55,47,.03)}.utBubble.mine{margin-left:auto;background:#1e6655;border-color:#1e6655;color:#fff;border-radius:13px 13px 4px 13px}.utBubble>span,.utBubble small{font-size:8px;opacity:.65}.utBubble p{font-size:12px;margin:4px 0}.utComposer{display:grid;grid-template-columns:1fr auto;gap:8px;padding:13px;border-top:1px solid #e5ebe8;background:#fff}.utComposer input{height:41px;border:1px solid #dce5e1;border-radius:9px;padding:0 12px;font-size:12px;outline:none}.utComposer input:focus{border-color:#6fae9d}.utComposer button{border:0;background:#21836a;color:#fff;border-radius:9px;padding:0 18px;font-size:11px;font-weight:800}
      .utSettings{padding:0 20px}.utSettingRow{display:grid;grid-template-columns:38px 1fr auto;gap:12px;align-items:center;padding:17px 0;border-bottom:1px solid #e9eeec}.utSettingRow:last-child{border-bottom:0}.utSettingIcon{width:36px;height:36px;border-radius:9px;background:#edf6f3;color:#267b67;display:grid;place-items:center}.utSettingRow strong{font-size:12px}.utSettingRow p{font-size:10px;color:#82908c;margin:3px 0 0}.utEmptyCard{max-width:800px;margin:80px auto;background:#fff;border:1px solid #e1e8e5;border-radius:16px;text-align:center;padding:60px 25px}.utEmptyIcon{width:48px;height:48px;margin:auto;background:#edf6f3;border-radius:13px;display:grid;place-items:center;color:#267b67}.utEmptyCard h2{font-size:18px}.utEmptyCard p{font-size:12px;color:#80908b}.utLoading{min-height:100vh;display:grid;place-content:center;text-align:center;background:#f4f7f6;color:#163b32;font-family:Inter,ui-sans-serif,system-ui}.utLoading .utLogo{font-size:30px}.utLoading p{font-size:12px;color:#80908b}
      @media(max-width:1000px){.utShell{grid-template-columns:1fr}.utSidebar{position:static;height:auto;min-height:auto;padding:18px}.utPortalLabel{margin-bottom:12px}.utNav{margin-top:10px;display:grid;grid-template-columns:repeat(4,1fr)}.utNav button{grid-template-columns:1fr;text-align:center;justify-items:center;height:52px;gap:3px}.utNav button b{position:absolute}.utUser{margin-top:14px}.utMain{padding:24px}.utMetricGrid{grid-template-columns:repeat(2,1fr)}}
      @media(max-width:700px){.utMain{padding:18px 14px 40px}.utHeader{display:block}.utHeaderActions{margin-top:14px;flex-wrap:wrap}.utHeader h1{font-size:25px}.utNav{grid-template-columns:repeat(3,1fr)}.utPropertyTop{display:block}.utRentBlock{text-align:left;margin-top:20px}.utPropertyActions{flex-wrap:wrap}.utMetricGrid,.utTwoCol,.utPaymentGrid,.utDetails{grid-template-columns:1fr}.utBubble{max-width:85%}.utSettingRow{grid-template-columns:36px 1fr}.utSettingRow>:last-child{grid-column:2}.utLeaseHeader{align-items:flex-start}.utHeaderActions select,.utHeaderActions button{flex:1}.utPropertyCard{padding:21px}}
    `}</style>
  );
}
