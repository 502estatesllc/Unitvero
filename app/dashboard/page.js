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
  const [maintenanceExpenses, setMaintenanceExpenses] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [documentTemplates, setDocumentTemplates] = useState([]);
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
            className={view === "maintenance" ? "active" : ""}
            onClick={() => setView("maintenance")}
          >
            <span className="navIcon">◇</span>
            <span>{t("maintenance")}</span>
          </a>
        </nav>
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

        {view === "documents" && (
          <section className="documentsPage">
            <div className="applicationsHeader documentsHeader">
              <div>
                <small>DOCUMENT CENTER</small>
                <h1>Documents</h1>

                <p>
                  Create, send, track, and prepare rental documents for
                  eSignature.
                </p>
                <span style={{fontWeight:800,fontSize:12}}>{String(subscription?.plan_code || "free").toUpperCase()} PLAN</span>
              </div>

              <button
                type="button"
                className="primary"
                onClick={() => {
                  if (!requirePro("document_center", "Document Center")) return;
                  alert("Document creation is ready for the next step: selecting a state template, property, and tenant.");
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
                <span>Revenue</span>
                <b>$0</b>
                <small>DOCUMENT SERVICES</small>
              </article>
            </div>

            <section className="documentLibrary">
              <div className="documentLibraryHeader">
                <div>
                  <h2>Template Library</h2>

                  <p>
                    Unitvero uses the property's state to show the correct versioned template. Templates are only published after state-rule review.
                  </p>
                </div>

                <span>Templates</span>
              </div>

              <div className="documentTemplateGrid">
                {(documentTemplates.length ? documentTemplates.map((template) => [
                  "▤",
                  template.name || "Rental Document",
                  template.description || `Versioned ${template.state_code || template.state || template.jurisdiction || "state"} rental template.`,
                  String(template.document_type || template.type || "DOCUMENT").toUpperCase(),
                  template
                ]) : [
                  [
                    "▤",
                    "Residential Lease",
                    "State-specific residential lease template. Available after jurisdiction review.",
                    "LEASE",
                    null
                  ],
                  [
                    "↻",
                    "Lease Renewal",
                    "Prepare updated lease terms for an existing tenant.",
                    "LEASE",
                  ],
                  [
                    "!",
                    "Late Rent Notice",
                    "Create a written notice concerning an outstanding rent balance.",
                    "NOTICE",
                  ],
                  [
                    "⌂",
                    "Notice to Vacate",
                    "Prepare a state-specific notice to end or recover possession of a tenancy.",
                    "NOTICE",
                  ],
                  [
                    "$",
                    "Rent Change Notice",
                    "Document an upcoming rent change for a tenant.",
                    "NOTICE",
                  ],
                  [
                    "⌁",
                    "Notice of Entry",
                    "Create written notice of planned property access.",
                    "NOTICE",
                  ],
                  [
                    "+",
                    "Lease Addendum",
                    "Add property rules or additional terms to an existing lease.",
                    "ADDENDUM",
                  ],
                  [
                    "✓",
                    "Move-In / Move-Out",
                    "Create condition and turnover documentation.",
                    "PROPERTY",
                  ],
                ]).map(([icon, title, description, type, template]) => (
                  <article className="documentTemplateCard" key={title}>
                    <div className="documentTemplateIcon">{icon}</div>

                    <span className="documentType">{type}</span>

                    <h3>{title}</h3>

                    <p>{description}</p>

                    <button
                      type="button"
                      onClick={() => {
                        if (!requirePro("state_template_library", "State Template Library")) return;
                        if (!template) return alert(`${title} will appear once a reviewed state version is published.`);
                        alert(`${title} selected. Property/tenant auto-fill is the next document workflow step.`);
                      }}
                    >
                      Create document →
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section className="esignBanner">
              <div className="esignBannerIcon">✎</div>

              <div>
                <small>ESIGN FOUNDATION</small>

                <h2>Electronic signatures inside Unitvero</h2>

                <p>
                  The document workflow is being structured for Draft → Sent →
                  Viewed → Signed → Completed. Provider connection and real
                  charges will be added before launch.
                </p>
              </div>

              <span>COMING NEXT</span>
            </section>
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
            <p>Track repairs, completion dates, vendors, and landlord-only expenses for tax records.</p>

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
                  return (
                    <article key={request.id} className="commandCard">
                      <div className="commandCardHeader">
                        <div><span className="commandSectionIcon">◇</span><div>
                          <h2>{request.issue || request.category || "Maintenance request"}</h2>
                          <p>{prop?.address || "Property"} · {tenant?.tenant_name || tenant?.tenant_email || "Tenant"}</p>
                        </div></div>
                        <select value={request.status || "open"} onChange={(e)=>updateMaintenanceStatus(request.id,e.target.value)}>
                          <option value="open">Submitted</option><option value="in_progress">In Progress</option>
                          <option value="scheduled">Scheduled</option><option value="completed">Completed</option>
                        </select>
                      </div>
                      <p>{request.description || "No description provided."}</p>
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
    async function uploadUnitveroFile(file, folder) {
    if (!file) return null;

    const s = supabase();

    const {
      data: { user },
      error: userError,
    } = await s.auth.getUser();

    if (userError || !user) {
      setNotice("Please sign in again.");
      return null;
    }

    const extension = file.name.includes(".")
      ? file.name.split(".").pop().toLowerCase()
      : "jpg";

    const safeName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 120);

    const path =
      `${folder}/${user.id}/` +
      `${Date.now()}-${crypto.randomUUID()}.${extension}`;

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

    const { data } = s.storage
      .from("unitvero-media")
      .getPublicUrl(path);

    return {
      fileName: safeName,
      filePath: path,
      fileUrl: data.publicUrl,
    };
  }

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
    const { data, error } = await s.rpc("unitvero_start_conversation", {
      p_tenancy_id: tenancy.id,
      p_subject: "Tenant conversation",
    });

    if (error) {
      setNotice("Could not start the conversation: " + error.message);
      return null;
    }

    const conversation = Array.isArray(data) ? data[0] : data;

    if (!conversation?.id) {
      setNotice("Could not start the conversation. Please try again.");
      return null;
    }

    setConversations((current) => {
      const exists = current.some((item) => item.id === conversation.id);
      return exists ? current : [conversation, ...current];
    });
    setSelectedConversation(conversation);
    return conversation;
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

async function createMaintenanceRequest(e) {
  e.preventDefault();

  if (!tenancy || !property) return;

  const form = e.currentTarget;
  const issue = form.issue.value.trim();
  const description = form.description.value.trim();

  const photoFiles = Array.from(
    form.maintenancePhotos?.files || []
  ).slice(0, 5);

  if (!issue || !description) {
    return setNotice("Enter a repair issue and description.");
  }

  for (const file of photoFiles) {
    if (!file.type.startsWith("image/")) {
      return setNotice("Maintenance attachments must be images.");
    }

    if (file.size > 10 * 1024 * 1024) {
      return setNotice("Each photo must be 10 MB or smaller.");
    }
  }

  const s = supabase();

  const {
    data: { user },
  } = await s.auth.getUser();

  if (!user) {
    return setNotice("Please sign in again.");
  }

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
      permission_to_enter:
        form.permissionToEnter.checked,
      preferred_contact:
        form.preferredContact.value,
      status: "open",
    })
    .select("*")
    .single();

  if (error) {
    return setNotice(
      "Could not submit maintenance request: " +
        error.message
    );
  }

  for (const file of photoFiles) {
    const uploaded = await uploadUnitveroFile(
      file,
      `maintenance/${request.id}`
    );

    if (!uploaded) continue;

    const { error: attachmentError } = await s
      .from("maintenance_request_attachments")
      .insert({
        maintenance_request_id: request.id,
        uploaded_by: user.id,
        file_name: uploaded.fileName,
        file_path: uploaded.filePath,
        file_url: uploaded.fileUrl,
      });

    if (attachmentError) {
      console.error(
        "Could not save maintenance photo:",
        attachmentError
      );
    }
  }

  form.reset();

  setNotice(
    photoFiles.length
      ? "Maintenance request and photos submitted."
      : "Maintenance request submitted."
  );

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
