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

    setProfile(
      p || {
        id: user.id,
        full_name: user.user_metadata?.full_name || "",
        role: user.user_metadata?.role || "landlord",
      },
    );

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

  async function openOrCreateConversation(tenancyId) {
    const tenancy = tenancies.find((item) => item.id === tenancyId);

    if (!tenancy) {
      alert("Could not find this tenant.");
      return;
    }

    const existingConversation = conversations.find(
      (conversation) => conversation.tenancy_id === tenancyId,
    );

    if (existingConversation) {
      setSelectedConversation(existingConversation);
      setCommunicationTab("messages");
      setView("messages");
      return;
    }

    const property = props.find((item) => item.id === tenancy.property_id);

    const s = supabase();

    const {
      data: { user },
      error: userError,
    } = await s.auth.getUser();

    if (userError || !user) {
      alert("Authentication error: " + (userError?.message || "No user found"));
      return;
    }

    const { data, error } = await s
      .from("conversations")
      .insert({
        landlord_id: user.id,
        property_id: tenancy.property_id,
        tenancy_id: tenancy.id,
        subject:
          tenancy.tenant_name ||
          tenancy.tenant_email ||
          property?.address ||
          "Tenant conversation",
      })
      .select()
      .single();

    if (error) {
      alert("Could not create conversation: " + error.message);
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

        {view === "addTenant" && selectedProperty && (
          <section className="panel">
            <button
              type="button"
              onClick={() =>
                setView(selectedUnit ? "unitDetails" : "propertyDetails")
              }
            >
              ← Back to Property
            </button>

            <small>NEW TENANT</small>
            <h1>Add Tenant</h1>

            <p>
              Add a tenant to {selectedProperty.address}
              {selectedUnit ? ` • ${selectedUnit.unit_name}` : ""} and create
              their invitation.
            </p>
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
                  alert(
                    "Authentication error: " +
                      (userError?.message || "No user found"),
                  );
                  return;
                }

                const tenantName = form.tenantName.value.trim();
                const tenantEmail = form.tenantEmail.value.trim();
                const tenantPhone = form.tenantPhone.value.trim();
                const monthlyRent = Number(form.monthlyRent.value);
                const startDate = form.startDate.value;
                const endDate = form.endDate.value || null;

                if (endDate && endDate < startDate) {
                  alert(
                    "Lease end date cannot be before the lease start date.",
                  );
                  return;
                }

                const { data: newTenancy, error: tenancyError } = await s
                  .from("tenancies")
                  .insert({
                    property_id: selectedProperty.id,
                    unit_id: selectedUnit?.id || null,
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
                  alert("Could not add tenant: " + tenancyError.message);
                  return;
                }

                if (selectedUnit) {
                  const { error: unitError } = await s
                    .from("units")
                    .update({
                      status: "occupied",
                      updated_at: new Date().toISOString(),
                    })
                    .eq("id", selectedUnit.id);

                  if (unitError) {
                    alert(
                      "Tenant was added, but unit status could not be updated: " +
                        unitError.message,
                    );
                  } else {
                    setSelectedUnit((current) =>
                      current
                        ? {
                            ...current,
                            status: "occupied",
                          }
                        : current,
                    );
                  }
                }

               const {
  data: { session },
  error: sessionError,
} = await s.auth.getSession();

if (sessionError || !session?.access_token) {
  alert(
    tenantName +
      " was added, but the invitation could not be created because your session expired.",
  );
  return;
}

let invitationError = null;
let invitationData = null;

try {
  const invitationResponse = await fetch("/api/tenant-invitations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      propertyId: selectedProperty.id,
      tenantName,
      tenantEmail,
    }),
  });

  invitationData = await invitationResponse.json();

  if (!invitationResponse.ok) {
    invitationError = new Error(
      invitationData?.error || "Could not create tenant invitation.",
    );
  }
} catch (error) {
  invitationError = error;
}

                setSelectedTenancy(newTenancy);

                await load();

                if (invitationError) {
                  alert(
                    tenantName +
                      " was added, but the invitation could not be created: " +
                      invitationError.message,
                  );

                  setView(selectedUnit ? "unitDetails" : "propertyDetails");

                  return;
                }

                alert(
                  tenantName +
                    " was added successfully. Invitation created for " +
                    tenantEmail,
                );

                form.reset();

                setView(selectedUnit ? "unitDetails" : "propertyDetails");
              }}
            >
              <div className="tenantFormGrid">
                <label>
                  Full Name
                  <input
                    name="tenantName"
                    type="text"
                    placeholder="Tenant full name"
                    required
                  />
                </label>

                <label>
                  Email Address
                  <input
                    name="tenantEmail"
                    type="email"
                    placeholder="tenant@email.com"
                    required
                  />
                </label>

                <label>
                  Phone Number
                  <input
                    name="tenantPhone"
                    type="tel"
                    placeholder="(502) 555-1234"
                  />
                </label>

                <label>
                  Monthly Rent
                  <input
                    name="monthlyRent"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={selectedProperty.monthly_rent || ""}
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

              <div className="tenantFormActions">
                <button
                  type="button"
                  onClick={() =>
                    setView(selectedUnit ? "unitDetails" : "propertyDetails")
                  }
                >
                  Cancel
                </button>

                <button type="submit" className="primary">
                  Add Tenant & Create Invitation
                </button>
              </div>
            </form>
          </section>
        )}

        {view === "tenants" && (
          <section className="panel">
            <div className="dashboardHeader">
              <div>
                <small>TENANT MANAGEMENT</small>
                <h1>Tenants</h1>

                <p className="dashboardSubtitle">
                  Manage active tenants across your rental portfolio.
                </p>
              </div>
            </div>

            <div className="activityList">
              {tenancies.length === 0 && (
                <div className="featureEmpty">
                  <div className="featureEmptyIcon">♙</div>

                  <b>No tenants yet</b>

                  <span>Add a tenant from one of your property pages.</span>
                </div>
              )}

              {tenancies.map((tenancy) => {
                const property = props.find(
                  (p) => p.id === tenancy.property_id,
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

                      <span>{property?.address || "Property"}</span>

                      <span>{tenancy.tenant_email}</span>

                      <span>
                        ${Number(tenancy.monthly_rent || 0).toLocaleString()} /
                        month
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
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {view === "editTenant" && editingTenancy && (
          <section className="panel">
            <button type="button" onClick={() => setView("tenants")}>
              ← Back to Tenants
            </button>

            <small>EDIT TENANT</small>

            <h1>{editingTenancy.tenant_name || editingTenancy.tenant_email}</h1>

            <p>Update tenant and lease information.</p>

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
                <button type="button" onClick={() => setView("tenants")}>
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
              </div>

              <button
                type="button"
                className="primary"
                onClick={() =>
                  alert("Custom document builder is the next Documents step.")
                }
              >
                + Create Document
              </button>
            </div>

            <div className="documentStats">
              <article>
                <span>Documents</span>
                <b>0</b>
                <small>ALL DOCUMENTS</small>
              </article>

              <article>
                <span>Awaiting Signature</span>
                <b>0</b>
                <small>ESIGN</small>
              </article>

              <article>
                <span>Completed</span>
                <b>0</b>
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
                    Start with a rental document and Unitvero will eventually
                    auto-fill tenant and property information.
                  </p>
                </div>

                <span>Templates</span>
              </div>

              <div className="documentTemplateGrid">
                {[
                  [
                    "▤",
                    "Residential Lease",
                    "Create a new residential lease and prepare it for electronic signature.",
                    "LEASE",
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
                ].map(([icon, title, description, type]) => (
                  <article className="documentTemplateCard" key={title}>
                    <div className="documentTemplateIcon">{icon}</div>

                    <span className="documentType">{type}</span>

                    <h3>{title}</h3>

                    <p>{description}</p>

                    <button
                      type="button"
                      onClick={() =>
                        alert(title + " builder is being prepared.")
                      }
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

            <p>Track maintenance requests across your rental portfolio.</p>

            <div className="featureEmpty">
              <div className="featureEmptyIcon">◇</div>
              <b>No maintenance requests</b>

              <span>New tenant maintenance requests will appear here.</span>
            </div>
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
