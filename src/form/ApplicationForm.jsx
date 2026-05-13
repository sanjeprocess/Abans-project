import React, { useState } from "react";
import "./ApplicationForm.css";
import { buildApiUrl, safeFetch } from "../config";

const ThankYouPage = ({ onRestart, signingLink }) => {
  React.useEffect(() => {
    if (signingLink) {
      const timer = setTimeout(() => {
        window.open(signingLink, '_blank');
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [signingLink]);

  const message = signingLink
    ? 'Thank you for choosing Abans Finance.\nYour application is under review and we will contact you immediately.'
    : 'Your application was submitted. Our team will contact you with the signing link.';
  const messageLines = message.split('\n');

  return (
    <div className="thank-you-container">
      <div className="thank-you-card">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h1 className="thank-you-title">Thank You</h1>
        <p className="thank-you-message">
          {messageLines.map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < messageLines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
        {signingLink && (
          <div className="signing-section">
            <p className="signing-note">
              📄 Please sign your application document to complete the process.
            </p>
            <button
              className="thank-you-button signing-btn"
              onClick={() => window.open(signingLink, '_blank')}
              style={{ background: '#28a745', marginBottom: '12px' }}
            >
              Open Signing Document
            </button>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
              Link: <a href={signingLink} target="_blank" rel="noreferrer">{signingLink}</a>
            </p>
          </div>
        )}
        <button className="thank-you-button" onClick={onRestart}>
          Submit Another Application
        </button>
      </div>
    </div>
  );
};

const emptyCreditRow = { institution: "", type: "", approvedAmount: "", term: "", monthlyRepayment: "", presentOS: "", security: "" };
const emptyBankRow = { bank: "", branch: "", accountNo: "", officer: "", telephone: "" };
const BANK_NAMES = [
  "Bank of Ceylon",
  "People's Bank",
  "Commercial Bank",
  "Hatton National Bank",
  "Sampath Bank",
  "Seylan Bank",
  "Nations Trust Bank",
  "DFCC Bank",
  "NDB Bank",
  "Pan Asia Bank",
  "Union Bank",
  "Amana Bank",
  "Cargills Bank",
  "LOLC Finance",
  "LB Finance",
  "Central Finance",
  "National Savings Bank",
  "Regional Development Bank",
  "Sanasa Development Bank",
  "State Mortgage and Investment Bank",
];
const emptyGuarantorRow = { fullName: "", relationship: "", nicBusinessRegNo: "", age: "", months: "" };
const emptyLandRow = { location: "", extent: "", value: "", deedNo: "", mortgaged: "" };
const emptyVehicleRow = { makeModel: "", value: "", regNo: "", ownership: "" };
const emptyShareRow = { institution: "", currentValue: "", noOfShares: "" };
const emptyFacilityRow = { makeModel: "", status: "", purpose: "", supplier: "", period: "", cost: "" };

const incomeRows = [
  { key: "incomeMainSalary",      label: "Main Income / Salary",           si: "ප්‍රධාන ආදායම / වැටුප",   ta: "முக்கிய வருமானம் / சம்பளம்" },
  { key: "incomeOtherAllowances", label: "Other Allowances / Commissions", si: "වෙනත් දීමනා / කොමිස්",     ta: "பிற கொடுப்பனவு / கமிஂசன்" },
  { key: "incomeAdditional",      label: "Additional Income",              si: "අමතර ආදායම",               ta: "கூடுதல் வருமானம்" },
  { key: "incomeOther",           label: "Other",                          si: "වෙනත්",                     ta: "மற்றவை" },
];

const expenseRows = [
  { key: "expenseHousehold",  label: "Household Expenses",    si: "ගෘහස්ථ වියදම්",         ta: "குடும்பச் செலவுகள்" },
  { key: "expensePersonal",   label: "Personal",              si: "පුද්ගලික",               ta: "தனிப்பட்ட" },
  { key: "expenseLoanLease",  label: "Loan / Lease Payment",  si: "ණය / ලීසිං ගෙවීම්",   ta: "கடன் / குத்தகை தவணை" },
  { key: "expenseCreditCard", label: "Credit card payment",   si: "ක්‍රෙඩිට් කාඩ් ගෙවීම්",ta: "கிரெடிட் கார்டு கட்டணம்" },
  { key: "expenseFuel",       label: "Fuel Expenses",         si: "ඉන්ධන වියදම්",          ta: "எரிபொருள் செலவு" },
  { key: "expenseOther",      label: "Other",                 si: "වෙනත්",                  ta: "மற்றவை" },
];

function splitValueToBoxes(value, length) {
  const safe = (value || "").toString().slice(0, length);
  return Array.from({ length }, (_, i) => safe[i] || "");
}

const defaultFormData = {
  fullName: "",
  residentialStatus: "",
  permanentAddress: "", mailingAddress: "",
  yearsAtAbove: "", monthsAtAbove: "",
  homeContact: "", officeContact: "", fax: "", mobile1: "", mobile2: "", email: "",
  nicNo: "", passportNo: "",
  maritalStatus: "", nationality: "", gender: "", dateOfBirth: "",
  noOfChildren: "", childAge1: "", childAge2: "", childAge3: "", totalDependants: "",
  qualifications: [],
  otherQualification: "",
  familyMembers: [
    { member: "Father", memberSi: "පියා", memberTa: "தந்தை", name: "", contact: "" },
    { member: "Spouse", memberSi: "කලත්‍රයා/කලත්‍රිය", memberTa: "கணவன் / மனைவி", name: "", contact: "" },
  ],
  bankDetails: [{ ...emptyBankRow }, { ...emptyBankRow }, { ...emptyBankRow }],
  creditFacilities: [{ ...emptyCreditRow }, { ...emptyCreditRow }, { ...emptyCreditRow }],
  reference1Name: "", reference1Profession: "", reference1Contact: "",
  reference2Name: "", reference2Profession: "", reference2Contact: "",
  employerBusinessName: "", employerBusinessAddress: "",
  natureOfBusiness: "", designationProfession: "",
  telephone: "", designation: "",
  employmentProfessionalBusiness: "", specificIncomeSource: "", additionalIncomeSources: "",
  liableForTax: "", taxFileNo: "",
  incomeMainSalary: "", incomeOtherAllowances: "", incomeAdditional: "", incomeOther: "",
  expenseHousehold: "", expensePersonal: "", expenseLoanLease: "", expenseCreditCard: "", expenseFuel: "", expenseOther: "",
  guarantors: [{ ...emptyGuarantorRow }, { ...emptyGuarantorRow }],
  landBuildings: [{ ...emptyLandRow }, { ...emptyLandRow }],
  vehicles: [{ ...emptyVehicleRow }, { ...emptyVehicleRow }],
  shares: [{ ...emptyShareRow }, { ...emptyShareRow }],
  lifeInsurance: "", lifeInsuranceSpecify: "",
  deposits: "", depositsSpecify: "",
  facilityRequirements: [{ ...emptyFacilityRow }, { ...emptyFacilityRow }, { ...emptyFacilityRow }],
  preferredLanguage: "",
  locationOfLeasedAsset: "",
  fundSources: [],
  otherFundSource: "",
  annualTurnoverIndividual: "",
  annualTurnoverBusiness: "",
  otherConnectedBusiness: "", reasonForLoan: "",
  withinBranchServiceArea: "", ifNoReason: "",
  isPEP: "", pepRelationship: "",
  signatureName: "",
  signatureDate: "",
};

function ApplicationForm() {
  const [formData, setFormData] = useState(defaultFormData);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);
  const [signingLink, setSigningLink] = useState(null);
  const [loadingState, setLoadingState] = useState({
    visible: false,
    currentStep: 0,
    steps: [
      { id: 1, title: 'Submitting your application...', subtext: 'Please wait while we process your details', status: 'pending' },
      { id: 2, title: 'Saving to WorkHub24...', subtext: 'Creating your application card', status: 'pending' },
      { id: 3, title: 'Preparing your document...', subtext: 'Generating your Stella Sign document', status: 'pending' },
      { id: 4, title: 'Almost ready!', subtext: 'Opening your signing document...', status: 'pending' },
    ],
    applicationId: null,
    signingLink: null,
    error: null,
  });

  const validateNumberInput = (value) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    const hasInvalid = value !== cleaned;
    return { cleaned, hasInvalid };
  };

  const validatePhoneInput = (value) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    const hasInvalidChars = value !== cleaned;
    
    if (hasInvalidChars) {
      return { cleaned, error: "Please enter numbers only" };
    }
    
    if (cleaned.length > 0 && (cleaned.length < 9 || cleaned.length > 10)) {
      return { cleaned, error: "Phone number must be 9 or 10 digits" };
    }
    
    return { cleaned, error: "" };
  };

  const validateEmailInput = (value) => {
    // Must contain @gmail.com, have text before @gmail.com, and no spaces
    const gmailRegex = /^[^@\s]+@gmail\.com$/;
    const isValid = gmailRegex.test(value);
    return { isValid, error: isValid ? "" : "Invalid Gmail. Enter valid Gmail" };
  };

  const numericFields = new Set([
    "homeContact", "officeContact", "fax", "mobile1", "mobile2",
    "monthsAtAbove", "noOfChildren", "childAge1", "childAge2", "childAge3", "totalDependants",
    "telephone", "accountNo", "approvedAmount", "monthlyRepayment", "presentOS", "currentValue", "noOfShares", "value",
    "age", "months", "incomeMainSalary", "incomeOtherAllowances", "incomeAdditional", "incomeOther",
    "expenseHousehold", "expensePersonal", "expenseLoanLease", "expenseCreditCard", "expenseFuel", "expenseOther",
  ]);

  const phoneFields = new Set([
    "homeContact", "officeContact", "fax", "mobile1", "mobile2",
    "reference1Contact", "reference2Contact", "telephone"
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Phone field validation (check before numericFields since phone fields are also numeric)
    if (phoneFields.has(name)) {
      const { cleaned, error } = validatePhoneInput(value);
      setFormData(p => ({ ...p, [name]: cleaned }));
      setErrors(p => ({ ...p, [name]: error }));
      return;
    }

    if (numericFields.has(name)) {
      const { cleaned, hasInvalid } = validateNumberInput(value);
      setFormData(p => ({ ...p, [name]: cleaned }));
      setErrors(p => ({ ...p, [name]: hasInvalid ? "Please enter numbers only" : "" }));
      return;
    }

    if (name === "email") {
      const { isValid, error } = validateEmailInput(value);
      setFormData(p => ({ ...p, [name]: value }));
      setErrors(p => ({ ...p, [name]: error }));
      return;
    }

    setFormData(p => ({ ...p, [name]: value }));
  };

  const toggleCheck = (field, val) => setFormData(p => ({ ...p, [field]: p[field] === val ? "" : val }));
  const toggleArray = (field, val) => setFormData(p => {
    const arr = p[field] || [];
    return { ...p, [field]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] };
  });

  const handleQualificationChange = (val) => setFormData(p => {
    const ex = p.qualifications.includes(val);
    return { ...p, qualifications: ex ? p.qualifications.filter(i => i !== val) : [...p.qualifications, val] };
  });
  const handleFundSourceChange = (val) => setFormData(p => {
    const ex = p.fundSources.includes(val);
    return { ...p, fundSources: ex ? p.fundSources.filter(i => i !== val) : [...p.fundSources, val] };
  });

  const tableNumericKeys = new Set(["accountNo", "telephone", "approvedAmount", "monthlyRepayment", "presentOS", "currentValue", "noOfShares", "value", "age", "months", "contact"]);

  const tableChange = (field, index, key, value) => {
    const errorKey = `${field}.${index}.${key}`;
    const { cleaned, hasInvalid } = tableNumericKeys.has(key)
      ? validateNumberInput(value)
      : { cleaned: value, hasInvalid: false };

    setFormData((prev) => {
      const updated = [...prev[field]];
      updated[index] = { ...updated[index], [key]: cleaned };
      return { ...prev, [field]: updated };
    });
    setErrors((prev) => ({ ...prev, [errorKey]: hasInvalid ? "Please enter numbers only" : "" }));
  };

  const handleBankChange = (index, value) => {
    const updated = [...formData.bankDetails];
    updated[index] = { ...updated[index], bank: value };
    setFormData(p => ({ ...p, bankDetails: updated }));
  };

  const handleBankFieldChange = (index, field, value) => {
    const { cleaned, hasInvalid } = validateNumberInput(value);

    const updated = [...formData.bankDetails];
    updated[index][field] = cleaned;

    setFormData({
      ...formData,
      bankDetails: updated,
    });

    setErrors({
      ...errors,
      [`${field}_${index}`]: hasInvalid ? "Please enter numbers only" : "",
    });
  };

  const handleCreditFacilityFieldChange = (index, field, value) => {
    const { cleaned, hasInvalid } = validateNumberInput(value);

    const updated = [...formData.creditFacilities];
    updated[index][field] = cleaned;

    setFormData({
      ...formData,
      creditFacilities: updated,
    });

    setErrors({
      ...errors,
      [`${field}_${index}`]: hasInvalid ? "Please enter numbers only" : "",
    });
  };

  const addRow = (field, emptyRow) => setFormData(p => ({ ...p, [field]: [...p[field], { ...emptyRow }] }));
  const removeRow = (field, index) => setFormData(p => ({ ...p, [field]: p[field].filter((_,i) => i !== index) }));

  // Auto-grow textarea
  const autoGrow = (e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; };

const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitted(false);
  setLoadingState(prev => ({
    ...prev,
    visible: true,
    currentStep: 1,
    steps: prev.steps.map((s, i) => ({
      ...s,
      status: i === 0 ? 'active' : 'pending'
    })),
    applicationId: null,
    signingLink: null,
    error: null,
  }));

  try {
    console.log('[SUBMIT] Starting application submission');

    const response = await safeFetch(buildApiUrl('/api/submit-application'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formData })
    });

    const data = await response.json();
    console.log('[SUBMIT] API response', data);

    if (!response.ok || !data.success) {
      throw new Error(data?.message || data?.error?.message || 'Submission failed');
    }

    setLoadingState(prev => ({
      ...prev,
      currentStep: 2,
      applicationId: data.applicationId,
      steps: prev.steps.map((s, i) => ({
        ...s,
        status: i === 0 ? 'done' : i === 1 ? 'active' : 'pending'
      }))
    }));

    await new Promise(r => setTimeout(r, 800));

    setLoadingState(prev => ({
      ...prev,
      currentStep: 3,
      steps: prev.steps.map((s, i) => ({
        ...s,
        status: i <= 1 ? 'done' : i === 2 ? 'active' : 'pending'
      }))
    }));

    let signingLinkResult = data.signingLink || null;

    if (!signingLinkResult && data.applicationId) {
      console.log(`[SIGN] Calling /api/sign/${data.applicationId} to get Stella Sign link...`);
      try {
        // Small delay to let WorkHub24 finish processing
        await new Promise(r => setTimeout(r, 2000));
        const signRes = await safeFetch(buildApiUrl(`/api/sign/${data.applicationId}`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const signData = await signRes.json();
        console.log('[SIGN] Response:', signData);
        if (signData?.signingLink) {
          signingLinkResult = signData.signingLink;
          console.log('[SIGN] ✅ Signing link found:', signingLinkResult);
        } else {
          console.warn('[SIGN] No signing link returned. signingLinkFound:', signData?.signingLinkFound);
          // Fallback: poll up to 3 times with 5s interval
          for (let attempt = 1; attempt <= 3; attempt++) {
            await new Promise(r => setTimeout(r, 5000));
            console.log(`[SIGN FALLBACK] Retry ${attempt}...`);
            try {
              const retryRes = await safeFetch(buildApiUrl(`/api/sign/${data.applicationId}`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
              });
              const retryData = await retryRes.json();
              if (retryData?.signingLink) {
                signingLinkResult = retryData.signingLink;
                console.log('[SIGN FALLBACK] ✅ Found on retry:', signingLinkResult);
                break;
              }
            } catch (retryErr) {
              console.warn(`[SIGN FALLBACK] Retry ${attempt} failed:`, retryErr.message);
            }
          }
        }
      } catch (signErr) {
        console.error('[SIGN] Error calling /api/sign:', signErr.message);
      }
    }

    setLoadingState(prev => ({
      ...prev,
      currentStep: 4,
      signingLink: signingLinkResult,
      steps: prev.steps.map((s, i) => ({
        ...s,
        status: i <= 2 ? 'done' : i === 3 ? 'active' : 'pending'
      }))
    }));

    await new Promise(r => setTimeout(r, 1000));

    setSigningLink(signingLinkResult);
    if (signingLinkResult) {
      console.log('[SUBMIT] Signing link ready, moving to ThankYouPage');
      setLoadingState(prev => ({
        ...prev,
        currentStep: 5,
        steps: prev.steps.map(s => ({ ...s, status: 'done' }))
      }));
    } else {
      console.log('[SUBMIT] No signing link after polling; showing thank you page');
    }

    setIsSubmittedSuccessfully(true);
  } catch (error) {
    console.error('[SUBMIT] Error:', error);
    setLoadingState(prev => ({
      ...prev,
      visible: true,
      error: error.message,
      steps: prev.steps.map((s, i) => ({
        ...s,
        status: i < prev.currentStep - 1 ? 'done'
          : i === prev.currentStep - 1 ? 'error'
          : 'pending'
      }))
    }));
  }
};

  const handleReset = () => {
    setFormData(defaultFormData);
    setSubmitted(false);
    setLoadingState(prev => ({
      ...prev,
      visible: false,
      currentStep: 0,
      steps: prev.steps.map(step => ({ ...step, status: 'pending' })),
      applicationId: null,
      signingLink: null,
      error: null,
    }));
  };

  const handleRestartApplication = () => {
    window.location.reload();
  };

  if (isSubmittedSuccessfully) {
    return <ThankYouPage onRestart={handleRestartApplication} signingLink={signingLink} />;
  }

  const nicBoxes      = splitValueToBoxes(formData.nicNo, 12);
  const passportBoxes = splitValueToBoxes(formData.passportNo, 10);
  const homeBoxes     = splitValueToBoxes(formData.homeContact, 10);
  const officeBoxes   = splitValueToBoxes(formData.officeContact, 10);
  const faxBoxes      = splitValueToBoxes(formData.fax, 10);
  const mobile1Boxes  = splitValueToBoxes(formData.mobile1, 10);
  const mobile2Boxes  = splitValueToBoxes(formData.mobile2, 10);
  const dobBoxes      = splitValueToBoxes(formData.dateOfBirth.replace(/-/g,""), 8);

  const totalIncome       = incomeRows.reduce((s,r) => s + (parseFloat(formData[r.key]) || 0), 0);
  const totalExpenses     = expenseRows.reduce((s,r) => s + (parseFloat(formData[r.key]) || 0), 0);
  const totalFacilityCost = formData.facilityRequirements.reduce((s,r) => s + (parseFloat(r.cost) || 0), 0);

  return (
    <>
    {loadingState.visible && (
      <div className="loading-overlay">
        <div className="loading-card">
          <h2 className="loading-title">Processing Application</h2>

          {loadingState.applicationId && (
            <div className="app-id-badge">
              Application ID: {loadingState.applicationId}
            </div>
          )}

          <div className="loading-steps">
            {loadingState.steps.map((step) => (
              <div key={step.id} className={`loading-step ${step.status}`}>
                <div className="step-icon">
                  {step.status === 'active' && <div className="spinner" />}
                  {step.status === 'done' && <span className="checkmark">✓</span>}
                  {step.status === 'error' && <span className="errormark">✕</span>}
                  {step.status === 'pending' && <span className="pending-dot" />}
                </div>
                <div className="step-text">
                  <div className="step-title">{step.title}</div>
                  <div className="step-subtext">{step.subtext}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="progress-bar-wrap">
            <div
              className="progress-bar-fill"
              style={{ width: `${(loadingState.currentStep / loadingState.steps.length) * 100}%` }}
            />
          </div>

          {loadingState.error && (
            <div className="loading-error">
              <span>⚠️ {loadingState.error}</span>
              <button onClick={() => setLoadingState(prev => ({ ...prev, visible: false }))}>
                Close
              </button>
            </div>
          )}

          {loadingState.signingLink && loadingState.currentStep >= 4 && (
            <button
              className="open-signing-btn"
              onClick={() => window.open(loadingState.signingLink, '_blank')}
            >
              📄 Open Signing Document
            </button>
          )}
        </div>
      </div>
    )}
    <div className="abans-page-bg">
      <form className="abans-paper" onSubmit={handleSubmit}>

        {/* HEADER */}
        <header className="paper-header">
          <div className="logo-panel">
          </div>
          <div className="company-panel">
            <div className="company-name">Abans Finance PLC</div>
            <div className="company-line">No. 456, R A DE Mel Mawatha, Colombo 03, Sri Lanka</div>
            <div className="company-line">Tel: 011 220 8888 &nbsp;&nbsp; Fax: 011 237 5517</div>
            <div className="company-line">Web: www.abansfinance.lk</div>
            <div className="company-line">Company Registration No. PB-1015PQ</div>
          </div>
        </header>

        {/* TITLE BAR */}
        <div className="title-bar">
          <span>APPLICATION FOR PERSONAL LEASE /LOAN</span>
          <span>පුද්ගලික කල්බදු / ණය අයදුම්පත</span>
          <span>தனிப்பட்ட குத்தகை / கடன் விண்ணப்பத்திரம்</span>
        </div>

        {/* 1. Full Name */}
        <section className="paper-section">
          <div className="sec-head">
            <span className="q-num">1).</span>
            <span className="q-en">Applicant Details</span>
            <span className="q-si">අයදුම්කරුගේ විස්තර</span>
            <span className="q-ta">விண்ணப்பதாரர் விவரங்கள்</span>
          </div>
          <div className="applicant-grid">
            {/* Applicant Details Card */}
            <div className="applicant-card">
              <div className="applicant-header">
                <div className="applicant-icon">👤</div>
                <div className="applicant-title">
                  <div className="q-en">Full Name of Applicant</div>
                  <div className="q-si">අයදුම්කරුගේ සම්පූර්ණ නම</div>
                  <div className="q-ta">விண்ணப்பதாரரின் முழுப் பெயர்</div>
                </div>
              </div>
              <div className="applicant-fields">
                <div className="app-field">
                  <div className="app-subtext">
                    <div className="q-en">as per the NIC</div>
                    <div className="q-si">(ජා.හැ.අ. අනුව)</div>
                    <div className="q-ta">(தே.அ.அ படி)</div>
                  </div>
                  <textarea
                    className="app-textarea"
                    name="fullName"
                    value={formData.fullName}
                    onChange={e=>{handleChange(e);autoGrow(e);}}
                    rows={1}
                    placeholder="Enter full name..."
                  />
                </div>
              </div>
            </div>

            {/* Residential Status Card */}
            <div className="applicant-card">
              <div className="applicant-header">
                <div className="applicant-icon">🏠</div>
                <div className="applicant-title">
                  <div className="q-en">Residential Status</div>
                  <div className="q-si">නේවාසික තත්ත්වය</div>
                  <div className="q-ta">வசிப்பு நிலை</div>
                </div>
              </div>
              <div className="applicant-fields">
                <div className="app-field">
                  <div className="qual-opts">
                    {[["Own","තමන්ගේ","சொந்தம்"],["Rented","කුලියට","வாடகை"],["Mortgaged","උකස්","அடகு"],["With parents","දෙමාපියන් සමග","பெற்றோருடன்"]].map(([en,si,ta]) => (
                      <label key={en} className="qual-card">
                        <input
                          type="radio"
                          name="residentialStatus"
                          checked={formData.residentialStatus===en}
                          onChange={() => setFormData(p => ({ ...p, residentialStatus: en }))}
                        />
                        <div className="qual-card-content">
                          <div className="q-en">{en}</div>
                          <div className="q-si">{si}</div>
                          <div className="q-ta">{ta}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="app-field">
                  <label className="app-label">
                    <div className="q-en">Permanent Address</div>
                    <div className="q-si">ස්ථිර ලිපිනය</div>
                    <div className="q-ta">நிரந்தர முகவரி</div>
                  </label>
                  <textarea
                    className="app-textarea"
                    name="permanentAddress"
                    value={formData.permanentAddress}
                    onChange={e=>{handleChange(e);autoGrow(e);}}
                    rows={2}
                    placeholder="Enter permanent address..."
                  />
                </div>
                <div className="app-field">
                  <label className="app-label">
                    <div className="q-en">Mailing Address</div>
                    <div className="q-si">තැපැල් ලිපිනය</div>
                    <div className="q-ta">அஞ்சல் முகவரி</div>
                  </label>
                  <textarea
                    className="app-textarea"
                    name="mailingAddress"
                    value={formData.mailingAddress}
                    onChange={e=>{handleChange(e);autoGrow(e);}}
                    rows={2}
                    placeholder="Enter mailing address..."
                  />
                </div>
                <div className="app-field">
                  <label className="app-label">
                    <div className="q-en">Duration at above</div>
                    <div className="q-si">ඉහත ලිපිනයේ කාලය</div>
                    <div className="q-ta">மேலுள்ள முகவரியில் காலம்</div>
                  </label>
                  <div className="duration-grid">
                    <div className="duration-item">
                      <label className="duration-label">
                        <div className="q-en">Years</div>
                        <div className="q-si">අවුරුදු</div>
                        <div className="q-ta">வருடம்</div>
                      </label>
                      <input
                        type="number"
                        className="duration-input"
                        name="yearsAtAbove"
                        value={formData.yearsAtAbove}
                        onChange={handleChange}
                        placeholder="0"
                      />
                    </div>
                    <div className="duration-item">
                      <label className="duration-label">
                        <div className="q-en">Months</div>
                        <div className="q-si">මාස</div>
                        <div className="q-ta">மாதம்</div>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="duration-input"
                        name="monthsAtAbove"
                        value={formData.monthsAtAbove}
                        onChange={handleChange}
                        placeholder="0"
                      />
                      {errors.monthsAtAbove && <span className="error-text">{errors.monthsAtAbove}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="applicant-card">
              <div className="applicant-header">
                <div className="applicant-icon">📞</div>
                <div className="applicant-title">
                  <div className="q-en">Contact Details</div>
                  <div className="q-si">සම්බන්ධතා විස්තර</div>
                  <div className="q-ta">தொடர்பு விவரங்கள்</div>
                </div>
              </div>
              <div className="applicant-fields">
                <div className="app-field">
                  <label className="app-label">
                    <div className="q-en">Contact No</div>
                    <div className="q-si">දුරකතන අංකය</div>
                    <div className="q-ta">தொடர்பு இலக்கம்</div>
                  </label>
                  <div className="contact-grid">
                    <div className="contact-item">
                      <label className="contact-label">
                        <div className="q-en">Home</div>
                        <div className="q-si">නිවස</div>
                        <div className="q-ta">வீடு</div>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="contact-input"
                        name="homeContact"
                        value={formData.homeContact}
                        onChange={handleChange}
                        placeholder="Enter home contact"
                      />
                      {errors.homeContact && <span className="error-text">{errors.homeContact}</span>}
                    </div>
                    <div className="contact-item">
                      <label className="contact-label">
                        <div className="q-en">Office</div>
                        <div className="q-si">කාර්යාලය</div>
                        <div className="q-ta">அலுவலகம்</div>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="contact-input"
                        name="officeContact"
                        value={formData.officeContact}
                        onChange={handleChange}
                        placeholder="Enter office contact"
                      />
                      {errors.officeContact && <span className="error-text">{errors.officeContact}</span>}
                    </div>
                    <div className="contact-item">
                      <label className="contact-label">
                        <div className="q-en">Fax</div>
                        <div className="q-si">ෆැක්ස්</div>
                        <div className="q-ta">தொலைநகல்</div>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="contact-input"
                        name="fax"
                        value={formData.fax}
                        onChange={handleChange}
                        placeholder="Enter fax number"
                      />
                      {errors.fax && <span className="error-text">{errors.fax}</span>}
                    </div>
                    <div className="contact-item">
                      <label className="contact-label">
                        <div className="q-en">Mob -1</div>
                        <div className="q-si">ජංගම 1</div>
                        <div className="q-ta">கையடக்கி 1</div>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="contact-input"
                        name="mobile1"
                        value={formData.mobile1}
                        onChange={handleChange}
                        placeholder="Enter mobile 1"
                      />
                      {errors.mobile1 && <span className="error-text">{errors.mobile1}</span>}
                    </div>
                    <div className="contact-item">
                      <label className="contact-label">
                        <div className="q-en">Mob -2</div>
                        <div className="q-si">ජංගම 2</div>
                        <div className="q-ta">கையடக்கி 2</div>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="contact-input"
                        name="mobile2"
                        value={formData.mobile2}
                        onChange={handleChange}
                        placeholder="Enter mobile 2"
                      />
                      {errors.mobile2 && <span className="error-text">{errors.mobile2}</span>}
                    </div>
                    <div className="contact-item email-item">
                      <label className="contact-label">
                        <div className="q-en">Email</div>
                        <div className="q-si">විද්‍යුත් ලිපිනය</div>
                        <div className="q-ta">மின்னஞ்சல்</div>
                      </label>
                      <input
                        type="email"
                        className="contact-input"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                      />
                      {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3–8 Personal Identity Details */}
        <section className="paper-section">
          <div className="sec-head wrap-head">
            <span className="q-num">3–8</span>
            <div>
              <div className="q-en">Personal Identity Details</div>
              <div className="q-si">පුද්ගල හැඳුනුම් විස්තර</div>
              <div className="q-ta">தனிப்பட்ட அடையாள விவரங்கள்</div>
            </div>
          </div>
          <div className="identity-grid">
            <div className="identity-input-card">
              <label className="identity-label">
                <div className="q-en">NIC No</div>
                <div className="q-si">ජා.හැ.අ. අංකය</div>
                <div className="q-ta">தே.அ.அ. எண்</div>
              </label>
              <input
                className="modern-input"
                name="nicNo"
                value={formData.nicNo}
                onChange={handleChange}
              />
            </div>
            <div className="identity-input-card">
              <label className="identity-label">
                <div className="q-en">Date of Birth</div>
                <div className="q-si">උපන් දිනය</div>
                <div className="q-ta">பிறந்த தேதி</div>
              </label>
              <input
                className="modern-input"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                placeholder="YYYYMMDD"
              />
            </div>
            <div className="identity-input-card">
              <label className="identity-label">
                <div className="q-en">Passport No</div>
                <div className="q-si">විදේශ ගමන් බලපත්‍ර අංකය</div>
                <div className="q-ta">கடவுச்சீட்டு எண்</div>
              </label>
              <input
                className="modern-input"
                name="passportNo"
                value={formData.passportNo}
                onChange={handleChange}
              />
            </div>
            <div className="identity-input-card">
              <label className="identity-label">
                <div className="q-en">Nationality</div>
                <div className="q-si">ජාතිකත්වය</div>
                <div className="q-ta">தேசியம்</div>
              </label>
              <input
                className="modern-input"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="identity-status-grid">
            <div className="identity-card wide-card">
              <div className="identity-card-title">Married / Unmarried / Separated / Divorced</div>
              <div className="identity-card-meta">
                <span className="q-si">විවාහිත / අවිවාහිත / වෙන්වූ / දික්කසාද</span>
                <span className="q-ta">திருமணமான / திருமணமல்லாத / பிரிந்த / விவாகரத்து</span>
              </div>
              <div className="qual-opts">
                {[
                  ["Married", "විවාහිත", "திருமணமான"],
                  ["Unmarried", "අවිවාහිත", "திருமணமல்லாத"],
                  ["Separated", "වෙන්වූ", "பிரிந்த"],
                  ["Divorced", "දික්කසාද", "விவாகරத්து"],
                ].map(([en, si, ta]) => (
                  <label key={en} className="qual-card">
                    <input
                      type="radio"
                      name="maritalStatus"
                      checked={formData.maritalStatus === en}
                      onChange={() => setFormData(p => ({ ...p, maritalStatus: en }))}
                    />
                    <div className="qual-card-content">
                      <div className="q-en">{en}</div>
                      <div className="q-si">{si}</div>
                      <div className="q-ta">{ta}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="identity-card wide-card">
              <div className="identity-card-title">Gender</div>
              <div className="identity-card-meta">
                <span className="q-si">පුරුෂ / ස්ත්‍රී / වෙනත්</span>
                <span className="q-ta">பாலினம்</span>
              </div>
              <div className="qual-opts">
                {[
                  ["Male", "පුරුෂ", "ஆண்"],
                  ["Female", "ස්ත්‍රී", "பெண්"],
                  ["Other", "වෙනත්", "மற்றவை"],
                ].map(([en, si, ta]) => (
                  <label key={en} className="qual-card">
                    <input
                      type="radio"
                      name="gender"
                      checked={formData.gender === en}
                      onChange={() => setFormData(p => ({ ...p, gender: en }))}
                    />
                    <div className="qual-card-content">
                      <div className="q-en">{en}</div>
                      <div className="q-si">{si}</div>
                      <div className="q-ta">{ta}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 9. Family Members */}
        <section className="paper-section family-section">
                  <div className="section-head family-head">
                              <span className="q-num">9).</span>
                                          <div>
                                                        <div className="q-en">Details of Family Members</div>
                                                                      <div className="q-si">පවුලේ සාමාජිකයන්ගේ විස්තර</div>
                                                                                    <div className="q-ta">குடும்ப உறுப்பினர்களின் விவரங்கள்</div>
                                                                                                </div>
                                                                                                          </div>
                                                                                                          
          <div className="family-card">
                      <div className="table-wrap guarantor-wrap">
                                    <table className="paper-table guarantor-table">
                                                    <thead>
                                                                      <tr>
                                                                                          <th style={{width:"6%"}}>No</th>
                                                                                          <th><div>Member</div><div className="th-si">සාමාජිකයා</div><div className="th-ta">குடும்ப உறுப்பினர்</div></th>
                                                                                                              <th><div>Name</div><div className="th-si">නම</div><div className="th-ta">பெயர்</div></th>
                                                                                                                                  <th><div>Contact Number (Prefer land line)</div><div className="th-si">දුරකථන අංකය (නිවසේ දුරකථන අංකයට වැඩි ප්‍රමුඛතාවයක් දෙන්න)</div><div className="th-ta">தொடர்பு இலக்கம் (வீட்டு தொலைபேசி எண்ணுக்கு முன்னுரிமை கொடுங்கள்)</div></th>
                                                                                                                                                    </tr>
                                                                                                                                                                    </thead>
                                                                                                                                                                                    <tbody>
                                                                                                                                                                                                      {formData.familyMembers.map((row, i) => (
                                                                                                                                                                                                                          <tr key={row.member} className="guarantor-row">
                                                                                                                                                                                                                                                <td className="g-num">
                                                                                                                                                                                                                                                  <span>{i+1}</span>
                                                                                                                                                                                                                                                </td>
                                                                                                                                                                                                                                                <td className="member-cell"><div className="q-en-b">{row.member}</div><div className="th-si">{row.memberSi}</div><div className="th-ta">{row.memberTa}</div></td>
                                                                                                                                                                                                                                                                      <td><input className="table-input" value={row.name} onChange={e => tableChange("familyMembers", i, "name", e.target.value)} /></td>
                                                                                                                                                                                                                                                                                            <td><input className="table-input" value={row.contact} onChange={e => tableChange("familyMembers", i, "contact", e.target.value)} />
                                                                                                                                                                                                                {errors[`familyMembers.${i}.contact`] && <span className="error-text">{errors[`familyMembers.${i}.contact`]}</span>}
                                                                                                                                                                                                                </td>
                                                                                                                                                                                                                                                                                                                </tr>
                                                                                                                                                                                                                                                                                                                                  ))}
                                                                                                                                                                                                                                                                                                                                                  </tbody>
                                                                                                                                                                                                                                                                                                                                                                </table>
                                                                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                                                                      </div>
                                                                                                                      
          {/* Mobile Cards for Family Members */}
          <div className="mobile-table-cards">
            {formData.familyMembers.map((row, i) => (
              <div key={row.member} className="mobile-table-card">
                <div className="card-header">
                  {i+1}. {row.member}
                </div>
                <div className="field-row">
                  <label>
                    <div className="q-en">Name</div>
                    <div className="q-si">නම</div>
                    <div className="q-ta">பெயர்</div>
                  </label>
                  <input 
                    className="table-input" 
                    value={row.name} 
                    onChange={e => tableChange("familyMembers", i, "name", e.target.value)} 
                  />
                </div>
                <div className="field-row">
                  <label>
                    <div className="q-en">Contact Number (Prefer land line)</div>
                    <div className="q-si">දුරකථන අංකය (නිවසේ දුරකථන අංකයට වැඩි ප්‍රමුඛතාවයක් දෙන්න)</div>
                    <div className="q-ta">தொடர்பு இலக்கம் (வீட்டு தொலைபேசி எண்ணுக்கு முன்னுரிமை கொடுங்கள்)</div>
                  </label>
                  <input 
                    className="table-input" 
                    value={row.contact} 
                    onChange={e => tableChange("familyMembers", i, "contact", e.target.value)} 
                  />
                  {errors[`familyMembers.${i}.contact`] && <span className="error-text">{errors[`familyMembers.${i}.contact`]}</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="children-card">
            <div className="children-head">
              <div className="q-en">Children Details</div>
              <div className="q-si">ළමයින් විස්තර</div>
              <div className="q-ta">குழந்தைகள் விவரம்</div>
            </div>
            <div className="children-content">
                                                                          <div className="field-group">
                                                                                          <label className="field-label">
                                                                                                            <div className="q-en">No of Children</div>
                                                                                                                              <div className="q-si">ළමයින් ගණන</div>
                                                                                                                                                <div className="q-ta">குழந்தைகள் எண்ணிக்கை</div>
                                                                                                                                                                </label>
                                                                                                                                                                                <input
                                                                                                                                                                                  type="text"
                                                                                                                                                                                  inputMode="numeric"
                                                                                                                                                                                  pattern="[0-9]*"
                                                                                                                                                                                  className="styled-input"
                                                                                                                                                                                  name="noOfChildren"
                                                                                                                                                                                  value={formData.noOfChildren}
                                                                                                                                                                                  onChange={handleChange}
                                                                                                                                                                                />
                                                                                                                                                                                {errors.noOfChildren && <span className="error-text">{errors.noOfChildren}</span>}
                                                                                                                                                                                              </div>
                                                                                                                                                                                              
              <div className="child-ages-row">
                              <div className="child-age-box">
                                                <label className="field-label">
                                                                    <div className="q-en">Age</div>
                                                                                        <div className="q-si">වයස</div>
                                                                                                            <div className="q-ta">வயது</div>
                                                                                                                              </label>
                                                                                                                                                <input
                                                                                                                                                  type="text"
                                                                                                                                                  inputMode="numeric"
                                                                                                                                                  pattern="[0-9]*"
                                                                                                                                                  className="styled-input child-age-input"
                                                                                                                                                  name="childAge1"
                                                                                                                                                  value={formData.childAge1}
                                                                                                                                                  onChange={handleChange}
                                                                                                                                                />
                                                                                                                                                {errors.childAge1 && <span className="error-text">{errors.childAge1}</span>}
                                                                                                                                                                  <span className="age-suffix"><span className="q-en">Yrs</span><span className="q-si">අවුරුදු</span><span className="q-ta">ஆண்டுகள்</span></span>
                                                                                                                                                                                  </div>
                                                                                                                                                                                                  <div className="child-age-box">
                                                                                                                                                                                                                    <label className="field-label" aria-hidden="true">
                                                                                                                                                                                                                                      <div className="q-en">Age</div>
                                                                                                                                                                                                                                      <div className="q-si">වයස</div>
                                                                                                                                                                                                                                      <div className="q-ta">வயது</div>
                                                                                                                                                                                                                    </label>
                                                                                                                                                                                                                    <input
                                                                                                                                                                                                                      type="text"
                                                                                                                                                                                                                      inputMode="numeric"
                                                                                                                                                                                                                      pattern="[0-9]*"
                                                                                                                                                                                                                      className="styled-input child-age-input"
                                                                                                                                                                                                                      name="childAge2"
                                                                                                                                                                                                                      value={formData.childAge2}
                                                                                                                                                                                                                      onChange={handleChange}
                                                                                                                                                                                                                    />
                                                                                                                                                                                                                    {errors.childAge2 && <span className="error-text">{errors.childAge2}</span>}
                                                                                                                                                                                                                                      <span className="age-suffix"><span className="q-en">Yrs</span><span className="q-si">අවුරුදු</span><span className="q-ta">ஆண்டுகள்</span></span>
                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                                      <div className="child-age-box">
                                                                                                                                                                                                                                                                                        <label className="field-label" aria-hidden="true">
                                                                                                                                                                                                                                                                                          <div className="q-en">Age</div>
                                                                                                                                                                                                                                                                                          <div className="q-si">වයස</div>
                                                                                                                                                                                                                                                                                          <div className="q-ta">வயது</div>
                                                                                                                                                                                                                                                                                        </label>
                                                                                                                                                                                                                                                                                        <input
                                                                                                                                                                                                                                                                                          type="text"
                                                                                                                                                                                                                                                                                          inputMode="numeric"
                                                                                                                                                                                                                                                                                          pattern="[0-9]*"
                                                                                                                                                                                                                                                                                          className="styled-input child-age-input"
                                                                                                                                                                                                                                                                                          name="childAge3"
                                                                                                                                                                                                                                                                                          value={formData.childAge3}
                                                                                                                                                                                                                                                                                          onChange={handleChange}
                                                                                                                                                                                                                                                                                        />
                                                                                                                                                                                                                                                                                        {errors.childAge3 && <span className="error-text">{errors.childAge3}</span>}
                                                                                                                                                                                                                                                                                                          <span className="age-suffix"><span className="q-en">Yrs</span><span className="q-si">අවුරුදු</span><span className="q-ta">ஆண்டுகள்</span></span>
                                                                                                                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                                        
              <div className="field-group total-group">
                              <label className="field-label">
                                                <div className="q-en">Total Dependants</div>
                                                                  <div className="q-si">මුළු යැපෙන්නන්</div>
                                                                                    <div className="q-ta">மொத்த சார்ந்திருப்பவர்கள்</div>
                                                                                                    </label>
                                                                                                                    <input
                                                                                                                      type="text"
                                                                                                                      inputMode="numeric"
                                                                                                                      pattern="[0-9]*"
                                                                                                                      className="styled-input"
                                                                                                                      name="totalDependants"
                                                                                                                      value={formData.totalDependants}
                                                                                                                      onChange={handleChange}
                                                                                                                    />
                                                                                                                    {errors.totalDependants && <span className="error-text">{errors.totalDependants}</span>}
                                                                                                                                  </div>
                                                                                                                                              </div>
                                                                                                                                                        </div>
                                                                                                                                                                </section>
        {/* 10. Qualifications */}
        <section className="paper-section">
          <div className="qual-row">
            <div className="qual-lbl"><span className="q-num">10).</span><div><div className="q-en">Qualifications</div><div className="q-si">අධ්‍යාපනික සුදුසුකම්</div><div className="q-ta">கல்வித் தகுதிகள்</div></div></div>
            <div className="qual-opts">
              {[["Primary","ප්‍රාථමික","ஆரம்ப"],["Secondary","ද්විතීයික","இடைநிலை"],["Graduate","උපාධිධාරී","பட்டதாரி"],["Post Graduate","පශ්චාත් උපාධිධාරී","பட்டப்படிப்பு முடிந்தவர்"],["Professional","වෘත්තීය","தொழில்முறை"]].map(([en,si,ta])=>(
                <label key={en} className="qual-card">
                  <input type="checkbox" checked={formData.qualifications.includes(en)} onChange={()=>handleQualificationChange(en)} />
                  <div className="qual-card-content">
                    <div className="q-en">{en}</div>
                    <div className="q-si">{si}</div>
                    <div className="q-ta">{ta}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="other-qual-field">
              <label className="other-qual-label">
                <div className="q-en">Other Qualification</div>
                <div className="q-si">වෙනත් අධ්‍යාපනික සුදුසුකම්</div>
                <div className="q-ta">பிற கல்வித் தகுதி</div>
              </label>
              <input
                type="text"
                className="other-qual-input"
                value={formData.otherQualification}
                onChange={handleChange}
                name="otherQualification"
                placeholder="Enter custom qualification"
              />
            </div>
          </div>
        </section>

        {/* 11. Bank Details */}
        <section className="paper-section">
          <div className="sec-head"><span className="q-num">11).</span><span className="q-en">Bank Details</span><span className="q-si">බැංකු විස්තර</span><span className="q-ta">வங்கி விவரங்கள்</span></div>
          <div className="table-wrap guarantor-wrap">
            <table className="paper-table guarantor-table">
            <thead><tr>
              <th style={{width:"6%"}}>No</th>
              <th><div>Bank</div><div className="th-si">බැංකුව</div><div className="th-ta">வங்கி</div></th>
              <th><div>Branch</div><div className="th-si">ශාඛාව</div><div className="th-ta">கிளை</div></th>
              <th><div>Account No</div><div className="th-si">ගිණුම් අංකය</div><div className="th-ta">கணக்கு எண்</div></th>
              <th><div>Officer</div><div className="th-si">නිලධාරියා</div><div className="th-ta">அதிகாரி</div></th>
              <th><div>Telephone</div><div className="th-si">දුරකතනය</div><div className="th-ta">தொலைபேசி</div></th>
            </tr></thead>
            <tbody>{formData.bankDetails.map((r,i)=><tr key={i} className="guarantor-row">
                <td className="g-num">
                  <span>{i+1}</span>
                  {i>=3 && (
                    <button type="button" className="del-row-btn del-small" onClick={()=>removeRow("bankDetails",i)}>✕</button>
                  )}
                </td>
                <td>
                  <select
                    className="bank-select"
                    value={r.bank || ""}
                    onChange={e=>handleBankChange(i, e.target.value)}
                  >
                    <option value="" disabled>Select Bank</option>
                    {BANK_NAMES.map((name)=><option key={name} value={name}>{name}</option>)}
                  </select>
                </td>
                <td><input value={r.branch} onChange={e=>tableChange("bankDetails",i,"branch",e.target.value)} /></td>
                <td>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={r.accountNo || ""}
                    onChange={(e) =>
                      handleBankFieldChange(i, "accountNo", e.target.value)
                    }
                  />
                  {errors[`accountNo_${i}`] && (
                    <span className="error-text">
                      {errors[`accountNo_${i}`]}
                    </span>
                  )}
                </td>
                <td><input value={r.officer} onChange={e=>tableChange("bankDetails",i,"officer",e.target.value)} /></td>
                <td>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={r.telephone || ""}
                    onChange={(e) =>
                      handleBankFieldChange(i, "telephone", e.target.value)
                    }
                  />
                  {errors[`telephone_${i}`] && (
                    <span className="error-text">
                      {errors[`telephone_${i}`]}
                    </span>
                  )}
                </td>
              </tr>)}</tbody>
            </table>
          </div>
          <button type="button" className="add-row-btn" onClick={()=>addRow("bankDetails",emptyBankRow)}>+ Add Row</button>
        </section>

        {/* 12. Credit Facilities */}
        <section className="paper-section">
          <div className="sec-head"><span className="q-num">12).</span><span className="q-en">Details Of Credit Facilities Obtained From Abans Finance PLC &amp; Other Financial Institutions</span></div>
          <div className="q-si" style={{fontSize:10,marginBottom:4}}>අබාන්ස් ෆයිනෑන්ස් පීඑල්සී සහ වෙනත් මූල්‍ය ආයතන වලින් ලබාගත් ණය සහ ලීසිං පහසුකම් විස්තර</div>
          <div className="q-ta" style={{fontSize:10,marginBottom:6}}>Abans Finance PLC மற்றும் பிற நிதி நிறுவனங்களில் இருந்து பெறப்பட்ட கடன் மற்றும் குத்தகை வசதிகளின் விவரங்கள்</div>
          <div className="table-wrap guarantor-wrap">
            <table className="paper-table guarantor-table">
            <thead><tr>
              <th style={{width:"6%"}}>No</th>
              <th><div>Name of Institution</div><div className="th-si">ආයතනයේ නම</div><div className="th-ta">நிறுவனத்தின் பெயர்</div></th>
              <th><div>Type</div><div className="th-si">වර්ගය</div><div className="th-ta">வகை</div></th>
              <th><div>Approved Amount</div><div className="th-si">අනුමත මුදල් ප්‍රමාණය</div><div className="th-ta">அங்கீகரிக்கப்பட்ட தொகை</div></th>
              <th><div>Term</div><div className="th-si">කාලය</div><div className="th-ta">காலம்</div></th>
              <th><div>Monthly Repayment</div><div className="th-si">මාසික ගෙවීම්</div><div className="th-ta">மாதாந்திர தவணை</div></th>
              <th><div>Present O/S</div><div className="th-si">වර්තමාන බාර</div><div className="th-ta">தற்போதைய நிலுவை</div></th>
              <th><div>Security</div><div className="th-si">උරුමය</div><div className="th-ta">உத்தரவாதம்</div></th>
            </tr></thead>
            <tbody>{formData.creditFacilities.map((r,i)=><tr key={i} className="guarantor-row">
                <td className="g-num">
                  <span>{i+1}</span>
                  {i>=3 && <button type="button" className="del-row-btn del-small" onClick={()=>removeRow("creditFacilities",i)}>✕</button>}
                </td>
                <td><input value={r.institution} onChange={e=>tableChange("creditFacilities",i,"institution",e.target.value)} /></td>
                <td><input value={r.type} onChange={e=>tableChange("creditFacilities",i,"type",e.target.value)} /></td>
                <td>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={r.approvedAmount || ""}
                    onChange={(e) =>
                      handleCreditFacilityFieldChange(i, "approvedAmount", e.target.value)
                    }
                  />
                  {errors[`approvedAmount_${i}`] && (
                    <span className="error-text">
                      {errors[`approvedAmount_${i}`]}
                    </span>
                  )}
                </td>
                <td><input value={r.term} onChange={e=>tableChange("creditFacilities",i,"term",e.target.value)} /></td>
                <td>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={r.monthlyRepayment || ""}
                    onChange={(e) =>
                      handleCreditFacilityFieldChange(i, "monthlyRepayment", e.target.value)
                    }
                  />
                  {errors[`monthlyRepayment_${i}`] && (
                    <span className="error-text">
                      {errors[`monthlyRepayment_${i}`]}
                    </span>
                  )}
                </td>
                <td>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={r.presentOS}
                    onChange={e=>tableChange("creditFacilities",i,"presentOS",e.target.value)}
                  />
                  {errors[`creditFacilities.${i}.presentOS`] && (
                    <span className="error-text">{errors[`creditFacilities.${i}.presentOS`]}</span>
                  )}
                </td>
                <td><input value={r.security} onChange={e=>tableChange("creditFacilities",i,"security",e.target.value)} /></td>
              </tr>)}</tbody>
            </table>
          </div>
          <button type="button" className="add-row-btn" onClick={()=>addRow("creditFacilities",emptyCreditRow)}>+ Add Row</button>
        </section>

        {/* 13. Non-Related Referees */}
        <section className="paper-section">
          <div className="sec-head"><span className="q-num">13).</span><span className="q-en">Non Related Referees</span><span className="q-si">නොසම්බන්ධිත යෝජකයින්</span><span className="q-ta">தொடர்பில்லாத பரிந்துரையாளர்கள்</span></div>
          <div className="referees-grid">
            {[
              {n:"reference1Name",p:"reference1Profession",c:"reference1Contact",num:"1", title:"Referee 1"},
              {n:"reference2Name",p:"reference2Profession",c:"reference2Contact",num:"2", title:"Referee 2"}
            ].map(({n,p,c,num,title})=>(
              <div key={num} className="referee-card">
                <div className="referee-header">
                  <div className="referee-icon">👤</div>
                  <div className="referee-title">{title}</div>
                </div>
                <div className="referee-fields">
                  <div className="ref-field">
                    <label className="ref-label">
                      <div className="q-en">Name</div>
                      <div className="q-si">නම</div>
                      <div className="q-ta">பெயர்</div>
                    </label>
                    <input
                      type="text"
                      className="ref-input"
                      name={n}
                      value={formData[n]}
                      onChange={handleChange}
                      placeholder="Enter name"
                    />
                  </div>
                  <div className="ref-field">
                    <label className="ref-label">
                      <div className="q-en">Profession</div>
                      <div className="q-si">වෘත්තිය</div>
                      <div className="q-ta">தொழில்</div>
                    </label>
                    <input
                      type="text"
                      className="ref-input"
                      name={p}
                      value={formData[p]}
                      onChange={handleChange}
                      placeholder="Enter profession"
                    />
                  </div>
                  <div className="ref-field">
                    <label className="ref-label">
                      <div className="q-en">Contact Number</div>
                      <div className="q-si">දුරකතා අංකය</div>
                      <div className="q-ta">தொடர்பு இலக்கம்</div>
                    </label>
                    <input
                      type="tel"
                      className="ref-input"
                      name={c}
                      value={formData[c]}
                      onChange={handleChange}
                      placeholder="Enter contact number"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 14. Employer/Business */}
        <section className="paper-section">
          <div className="sec-head">
            <span className="q-num">14).</span>
            <span className="q-en">Employer/Business Details</span>
            <span className="q-si">රැකියාව / ව්‍යාපාර විස්තර</span>
            <span className="q-ta">முதலாளி/வணிக விவரங்கள்</span>
          </div>
          <div className="employer-grid">
            {/* Business Information Card */}
            <div className="employer-card">
              <div className="employer-header">
                <div className="employer-icon">🏢</div>
                <div className="employer-title">
                  <div className="q-en">Business Information</div>
                  <div className="q-si">ව්‍යාපාර තොරතුරු</div>
                  <div className="q-ta">வணிக தகவல்</div>
                </div>
              </div>
              <div className="employer-fields">
                <div className="emp-field">
                  <label className="emp-label">
                    <div className="q-en">Employer/Business Name and Address</div>
                    <div className="q-si">රැකියාව / ව්‍යාපාරයේ නම සහ ලිපිනය</div>
                    <div className="q-ta">முதலாளி/வணிகத்தின் பெயர் மற்றும் முகவரி</div>
                  </label>
                  <div className="emp-address-group">
                    <textarea
                      className="emp-textarea"
                      name="employerBusinessName"
                      value={formData.employerBusinessName}
                      onChange={e=>{handleChange(e);autoGrow(e);}}
                      rows={1}
                      placeholder="Name..."
                    />
                    <textarea
                      className="emp-textarea"
                      name="employerBusinessAddress"
                      value={formData.employerBusinessAddress}
                      onChange={e=>{handleChange(e);autoGrow(e);}}
                      rows={1}
                      placeholder="Address..."
                    />
                  </div>
                </div>
                <div className="emp-field">
                  <label className="emp-label">
                    <div className="q-en">Nature of Business</div>
                    <div className="q-si">ව්‍යාපාරයේ ස්වභාවය</div>
                    <div className="q-ta">வணிகத்தின் இயல்பு</div>
                  </label>
                  <input
                    type="text"
                    className="emp-input"
                    name="natureOfBusiness"
                    value={formData.natureOfBusiness}
                    onChange={handleChange}
                    placeholder="Enter nature of business"
                  />
                </div>
                <div className="emp-field">
                  <label className="emp-label">
                    <div className="q-en">Your Designation / Profession</div>
                    <div className="q-si">තනතුර / වෘත්තිය</div>
                    <div className="q-ta">பதவி / தொழில்</div>
                  </label>
                  <input
                    type="text"
                    className="emp-input"
                    name="designationProfession"
                    value={formData.designationProfession}
                    onChange={handleChange}
                    placeholder="Enter designation/profession"
                  />
                </div>
              </div>
            </div>

            {/* Contact / Reference Details Card */}
            <div className="employer-card">
              <div className="employer-header">
                <div className="employer-icon">📞</div>
                <div className="employer-title">
                  <div className="q-en">Contact / Reference Details</div>
                  <div className="q-si">සම්බන්ධතා / යොමු විස්තර</div>
                  <div className="q-ta">தொடர்பு / குறிப்பு விவரங்கள்</div>
                </div>
              </div>
              <div className="employer-fields">
                <div className="emp-field">
                  <label className="emp-label">
                    <div className="q-en">Reference</div>
                    <div className="q-si">යොමුකරු</div>
                    <div className="q-ta">குறிப்பு</div>
                  </label>
                  <div className="emp-ref-group">
                    <div className="emp-ref-item">
                      <label className="emp-ref-label">
                        <div className="q-en">Telephone</div>
                        <div className="q-si">දුරකථන අංකය</div>
                        <div className="q-ta">தொலைபேசி இலக்கம்</div>
                      </label>
                      <input
                        type="tel"
                        className="emp-input"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        placeholder="Enter telephone"
                      />
                    </div>
                    <div className="emp-ref-item">
                      <label className="emp-ref-label">
                        <div className="q-en">Designation</div>
                        <div className="q-si">තනතුර</div>
                        <div className="q-ta">பதவி</div>
                      </label>
                      <input
                        type="text"
                        className="emp-input"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        placeholder="Enter designation"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Income Source Details Card */}
            <div className="employer-card">
              <div className="employer-header">
                <div className="employer-icon">💰</div>
                <div className="employer-title">
                  <div className="q-en">Income Source Details</div>
                  <div className="q-si">ආදායම් මූලාශ්‍ර විස්තර</div>
                  <div className="q-ta">வருமான மூல விவரங்கள்</div>
                </div>
              </div>
              <div className="employer-fields">
                <div className="emp-field">
                  <label className="emp-label">
                    <div className="q-en">Main Income source</div>
                    <div className="q-si">ප්‍රධාන ආදායම් මූලාශ්‍රය</div>
                    <div className="q-ta">முக்கிய வருமான மூலம்</div>
                  </label>
                  <div className="emp-income-sub">
                    <div className="q-en">Employment / Professional / business</div>
                    <div className="q-si">රැකියාව / වෘත්තිය / ව්‍යාපාරය</div>
                    <div className="q-ta">வேலை / தொழில் / வணிகம்</div>
                  </div>
                  <input
                    type="text"
                    className="emp-input"
                    name="employmentProfessionalBusiness"
                    value={formData.employmentProfessionalBusiness}
                    onChange={handleChange}
                    placeholder="Enter main income source"
                  />
                </div>
                <div className="emp-field">
                  <label className="emp-label">
                    <div className="q-en">Specify the income source</div>
                    <div className="q-si">ආදායම් මූලාශ්‍රය සඳහන් කරන්න</div>
                    <div className="q-ta">வருமான மூலத்தை குறிப்பிடவும்</div>
                  </label>
                  <input
                    type="text"
                    className="emp-input"
                    name="specificIncomeSource"
                    value={formData.specificIncomeSource}
                    onChange={handleChange}
                    placeholder="Specify income source"
                  />
                </div>
                <div className="emp-field">
                  <label className="emp-label">
                    <div className="q-en">Additional Income sources</div>
                    <div className="q-si">අමතර ආදායම් මූලාශ්‍ර</div>
                    <div className="q-ta">கூடுதல் வருமான மூலங்கள்</div>
                  </label>
                  <textarea
                    className="emp-textarea"
                    name="additionalIncomeSources"
                    value={formData.additionalIncomeSources}
                    onChange={e=>{handleChange(e);autoGrow(e);}}
                    rows={1}
                    placeholder="Enter additional income sources..."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 15. Income/Expenses */}
        <section className="paper-section">
          <div className="sec-head"><span className="q-num">15).</span><span className="q-en">Details of Present Monthly Income / Expenses</span><span className="q-si">වර්තමාන මාසික ආදායම් / වියදම් විස්තර</span><span className="q-ta">தற்போதைய மாதாந்திர வருமானம் / செலவுகளின் விவரங்கள்</span></div>
          <div className="tax-row">
            <div className="tax-q"><div className="q-en">Are You Liable For Payee Tax or Income Tax</div><div className="q-si">ඔබට Payee Tax හෝ ආදායම් බදුව සඳහා වගකිව යුතුද?</div><div className="q-ta">உங்களுக்கு Payee Tax அல்லது Income Tax கட்டணம் உள்ளதா?</div></div>
            <div className="res-radio-grid">
              <label className={`res-radio-card ${formData.liableForTax==="Yes" ? 'active' : ''}`}>
                <input type="radio" name="liableForTax" value="Yes" checked={formData.liableForTax==="Yes"} onChange={()=>setFormData(p => ({ ...p, liableForTax: "Yes" }))} />
                <div className="res-radio-content">Yes</div>
                <div className="q-si">ඔව්</div>
                <div className="q-ta">ஆம்</div>
              </label>
              <label className={`res-radio-card ${formData.liableForTax==="No" ? 'active' : ''}`}>
                <input type="radio" name="liableForTax" value="No" checked={formData.liableForTax==="No"} onChange={()=>setFormData(p => ({ ...p, liableForTax: "No" }))} />
                <div className="res-radio-content">No</div>
                <div className="q-si">නැත</div>
                <div className="q-ta">இல்லை</div>
              </label>
            </div>
            {formData.liableForTax === "Yes" && (
              <div className="tax-file-grp">
                <label className="tax-file-label">
                  <div className="q-en">If Yes , File No :</div>
                  <div className="q-si">ඔව් නම්, ගොනු අංකය</div>
                </label>
                <input className="line-input" name="taxFileNo" value={formData.taxFileNo} onChange={handleChange} />
              </div>
            )}
          </div>
          <div className="table-wrap guarantor-wrap">
            <table className="paper-table guarantor-table">
            <tbody>
              <tr className="income-head-row"><td colSpan={2}><strong>Income</strong> <span className="q-si">ආදායම්</span> <span className="q-ta">வருமானம்</span></td></tr>
              {incomeRows.map(r=>(
                <tr key={r.key}>
                  <td className="inc-lbl">
                    <div className="q-en">{r.label}</div>
                    <div className="q-si">{r.si}</div>
                    <div className="q-ta">{r.ta}</div>
                  </td>
                  <td className="inc-amt">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={formData[r.key]}
                      onChange={handleChange}
                      name={r.key}
                    />
                    {errors[r.key] && <span className="error-text">{errors[r.key]}</span>}
                  </td>
                </tr>
              ))}
              <tr className="total-row"><td className="inc-lbl"><strong>Total Income</strong> <span className="q-si">මුළු ආදායම</span> <span className="q-ta">மொத்த வருமானம்</span></td><td className="inc-amt total-val">{totalIncome>0?totalIncome.toLocaleString():""}</td></tr>
              <tr className="income-head-row"><td colSpan={2}><strong>Expenses</strong> <span className="q-si">වියදම්</span> <span className="q-ta">செலவுகள்</span></td></tr>
              {expenseRows.map(r=>(
                <tr key={r.key}>
                  <td className="inc-lbl">
                    <div className="q-en">{r.label}</div>
                    <div className="q-si">{r.si}</div>
                    <div className="q-ta">{r.ta}</div>
                  </td>
                  <td className="inc-amt">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={formData[r.key]}
                      onChange={handleChange}
                      name={r.key}
                    />
                    {errors[r.key] && <span className="error-text">{errors[r.key]}</span>}
                  </td>
                </tr>
              ))}
              <tr className="total-row"><td className="inc-lbl"><strong>Total Expenses</strong> <span className="q-si">මුළු වියදම්</span> <span className="q-ta">மொத்த செலவுகள்</span></td><td className="inc-amt total-val">{totalExpenses>0?totalExpenses.toLocaleString():""}</td></tr>
            </tbody>
            </table>
          </div>
        </section>

        {/* 16. Proposed Guarantors */}
        <section className="paper-section">
          <div className="sec-head"><span className="q-num">16).</span><span className="q-en">Proposed Guarantors</span><span className="q-si">යෝජිත ගැරන්ටර්වරු</span><span className="q-ta">முன்மொழியப்பட்ட உத்தரவாதத்தார்கள்</span></div>
          <div className="table-wrap guarantor-wrap">
            <table className="paper-table guarantor-table">
              <thead>
                <tr>
                  <th style={{width:"6%"}}>No</th>
                  <th><div>Full Name</div><div className="th-si">සම්පූර්ණ නම</div><div className="th-ta">முழுப் பெயர்</div></th>
                  <th><div>Relationship</div><div className="th-si">සම්බන්ධතාවය</div><div className="th-ta">உறவு</div></th>
                  <th><div>NIC / Business Reg.No</div><div className="th-si">ජා.හැ.අ. / ව්‍යාපාර ලේඛන අංකය</div><div className="th-ta">ஜா.ந.அ. / வணிக பதிவு எண்</div></th>
                  <th style={{width:"8%"}}><div>Age</div><div className="th-si">වයස</div><div className="th-ta">வயது</div></th>
                  <th style={{width:"9%"}}><div>Months</div><div className="th-si">මාස</div><div className="th-ta">மாதங்கள்</div></th>
                </tr>
              </thead>
              <tbody>
                {formData.guarantors.map((row,i)=>(
                  <tr key={i} className="guarantor-row">
                    <td className="g-num">
                      <span>{i+1}</span>
                      {i>=2 && (
                        <button type="button" className="del-row-btn del-small" onClick={()=>removeRow("guarantors",i)}>✕</button>
                      )}
                    </td>
                    <td><input value={row.fullName} onChange={e=>tableChange("guarantors",i,"fullName",e.target.value)} /></td>
                    <td><input value={row.relationship} onChange={e=>tableChange("guarantors",i,"relationship",e.target.value)} /></td>
                    <td><input value={row.nicBusinessRegNo} onChange={e=>tableChange("guarantors",i,"nicBusinessRegNo",e.target.value)} /></td>
                    <td>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="small-box"
                        value={row.age}
                        onChange={e=>tableChange("guarantors",i,"age",e.target.value)}
                      />
                      {errors[`guarantors.${i}.age`] && (
                        <span className="error-text">{errors[`guarantors.${i}.age`]}</span>
                      )}
                    </td>
                    <td>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="small-box"
                        value={row.months}
                        onChange={e=>tableChange("guarantors",i,"months",e.target.value)}
                      />
                      {errors[`guarantors.${i}.months`] && (
                        <span className="error-text">{errors[`guarantors.${i}.months`]}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="add-row-btn" onClick={()=>addRow("guarantors",emptyGuarantorRow)}>+ Add Guarantor</button>
        </section>

        {/* 17. Property */}
        <section className="paper-section property-section">
          <div className="sec-head">
            <span className="q-num">17).</span>
            <span className="q-en">Particulars Of Immovable &amp; Movable Property Owned</span>
            <span className="q-si">හිමි ස්ථාවර හා චංචල දේපළ විස්තර</span>
            <span className="q-ta">சொந்தமான நிலையான மற்றும் நகரும் சொத்துகளின் விவரங்கள்</span>
          </div>

          <div className="property-grid">
            <div className="property-card">
              <div className="property-card-header">
                <div className="property-card-title">
                  <div className="q-en">Land and Building</div>
                  <div className="q-si">ඉඩම් සහ ගොඩනැගිලි</div>
                  <div className="q-ta">நிலம் மற்றும் கட்டிடம்</div>
                </div>
              </div>
              <div className="table-wrap guarantor-wrap">
                <table className="paper-table guarantor-table">
                  <thead>
                    <tr>
                      <th style={{width:"6%"}}>
                        <div>No</div>
                        <div className="th-si">අංකය</div>
                        <div className="th-ta">இல.</div>
                      </th>
                      <th>
                        <div>Location</div>
                        <div className="th-si">ස්ථානය</div>
                        <div className="th-ta">இடம்</div>
                      </th>
                      <th>
                        <div>Extent</div>
                        <div className="th-si">ප්‍රමාණය</div>
                        <div className="th-ta">அளவு</div>
                      </th>
                      <th>
                        <div>Value (Rs.)</div>
                        <div className="th-si">වටිනාකම (රු.)</div>
                        <div className="th-ta">மதிப்பு (ரூ.)</div>
                      </th>
                      <th>
                        <div>Deed No.</div>
                        <div className="th-si">ඔප්පු අංකය</div>
                        <div className="th-ta">உறுதி எண்</div>
                      </th>
                      <th>
                        <div>Mortgaged</div>
                        <div className="th-si">උකස් කර ඇත</div>
                        <div className="th-ta">அடகு வைக்கப்பட்டது</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.landBuildings.map((r,i)=>(
                      <tr key={i} className="guarantor-row">
                        <td className="g-num">
                          <span>{i+1}</span>
                        </td>
                        <td><input value={r.location} onChange={e=>tableChange("landBuildings",i,"location",e.target.value)} /></td>
                        <td><input value={r.extent} onChange={e=>tableChange("landBuildings",i,"extent",e.target.value)} /></td>
                        <td>
                          <div className="money-input">
                            <span>Rs.</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={r.value}
                              onChange={e=>tableChange("landBuildings",i,"value",e.target.value)}
                            />
                          </div>
                          {errors[`landBuildings.${i}.value`] && (
                            <span className="error-text">{errors[`landBuildings.${i}.value`]}</span>
                          )}
                        </td>
                        <td><input value={r.deedNo} onChange={e=>tableChange("landBuildings",i,"deedNo",e.target.value)} /></td>
                        <td>
                          <div className="radio-inline">
                            <label><input type="radio" name={`lm-table-${i}`} value="Yes" checked={r.mortgaged==="Yes"} onChange={()=>tableChange("landBuildings",i,"mortgaged","Yes")} /> Yes</label>
                            <label><input type="radio" name={`lm-table-${i}`} value="No" checked={r.mortgaged==="No"} onChange={()=>tableChange("landBuildings",i,"mortgaged","No")} /> No</label>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Cards for Land and Building */}
              <div className="mobile-table-cards">
                {formData.landBuildings.map((r,i)=>(
                  <div key={i} className="mobile-table-card">
                    <div className="card-header">
                      {i+1}. Land & Building
                    </div>
                    <div className="field-row">
                      <label>
                        <div className="q-en">Location</div>
                        <div className="q-si">ස්ථානය</div>
                        <div className="q-ta">இடம்</div>
                      </label>
                      <input value={r.location} onChange={e=>tableChange("landBuildings",i,"location",e.target.value)} />
                    </div>
                    <div className="field-row">
                      <label>
                        <div className="q-en">Extent</div>
                        <div className="q-si">ප්‍රමාණය</div>
                        <div className="q-ta">அளவு</div>
                      </label>
                      <input value={r.extent} onChange={e=>tableChange("landBuildings",i,"extent",e.target.value)} />
                    </div>
                    <div className="field-row">
                      <label>
                        <div className="q-en">Value (Rs.)</div>
                        <div className="q-si">වටිනාකම (රු.)</div>
                        <div className="q-ta">மதிப்பு (ரூ.)</div>
                      </label>
                      <div className="money-input">
                        <span>Rs.</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={r.value}
                          onChange={e=>tableChange("landBuildings",i,"value",e.target.value)}
                        />
                      </div>
                      {errors[`landBuildings.${i}.value`] && (
                        <span className="error-text">{errors[`landBuildings.${i}.value`]}</span>
                      )}
                    </div>
                    <div className="field-row">
                      <label>
                        <div className="q-en">Deed No.</div>
                        <div className="q-si">ඔප්පු අංකය</div>
                        <div className="q-ta">உறுதி எண்</div>
                      </label>
                      <input value={r.deedNo} onChange={e=>tableChange("landBuildings",i,"deedNo",e.target.value)} />
                    </div>
                    <div className="field-row">
                      <label>
                        <div className="q-en">Mortgaged</div>
                        <div className="q-si">උකස් කර ඇත</div>
                        <div className="q-ta">அடகு வைக்கப்பட்டது</div>
                      </label>
                      <div className="radio-inline">
                        <label><input type="radio" name={`lm-mobile-${i}`} value="Yes" checked={r.mortgaged==="Yes"} onChange={()=>tableChange("landBuildings",i,"mortgaged","Yes")} /> Yes</label>
                        <label><input type="radio" name={`lm-mobile-${i}`} value="No" checked={r.mortgaged==="No"} onChange={()=>tableChange("landBuildings",i,"mortgaged","No")} /> No</label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button type="button" className="add-row-btn" onClick={()=>addRow("landBuildings",emptyLandRow)}>+ Add Row</button>
            </div>

            <div className="property-card">
              <div className="property-card-header">
                <div className="property-card-title">
                  <div className="q-en">Vehicle</div>
                  <div className="q-si">වාහනය</div>
                  <div className="q-ta">வாகனம்</div>
                </div>
              </div>
              <div className="table-wrap guarantor-wrap">
                <table className="paper-table guarantor-table">
                  <thead>
                    <tr>
                      <th style={{width:"6%"}}>
                        <div>No</div>
                        <div className="th-si">අංකය</div>
                        <div className="th-ta">இல.</div>
                      </th>
                      <th>
                        <div>Make &amp; Model</div>
                        <div className="th-si">නිෂ්පාදකයා සහ ආකෘතිය</div>
                        <div className="th-ta">தயாரிப்பு மற்றும் மாடல்</div>
                      </th>
                      <th>
                        <div>Value (Rs.)</div>
                        <div className="th-si">වටිනාකම (රු.)</div>
                        <div className="th-ta">மதிப்பு (ரூ.)</div>
                      </th>
                      <th>
                        <div>Reg. No</div>
                        <div className="th-si">ලියාපදිංචි අංකය</div>
                        <div className="th-ta">பதிவு எண்</div>
                      </th>
                      <th>
                        <div>Own/Mortgaged/Leased/Hire Purchase</div>
                        <div className="th-si">හිමි / උකස් / ලීස් / හයර් පර්චස්</div>
                        <div className="th-ta">சொந்தம் / அடகு / குத்தகை / வாடகை கொள்முதல்</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.vehicles.map((r,i)=>(
                      <tr key={i} className="guarantor-row">
                        <td className="g-num">
                          <span>{i+1}</span>
                        </td>
                        <td><input value={r.makeModel} onChange={e=>tableChange("vehicles",i,"makeModel",e.target.value)} /></td>
                        <td>
                          <div className="money-input">
                            <span>Rs.</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={r.value}
                              onChange={e=>tableChange("vehicles",i,"value",e.target.value)}
                            />
                          </div>
                          {errors[`vehicles.${i}.value`] && (
                            <span className="error-text">{errors[`vehicles.${i}.value`]}</span>
                          )}
                        </td>
                        <td><input value={r.regNo} onChange={e=>tableChange("vehicles",i,"regNo",e.target.value)} /></td>
                        <td>
                          <select value={r.ownership} onChange={e=>tableChange("vehicles",i,"ownership",e.target.value)}>
                            <option value="">Select / තෝරන්න / தேர்ந்தெடு</option>
                            <option value="Own">Own / හිමි / சொந்தம்</option>
                            <option value="Mortgaged">Mortgaged / උකස් / அடகு</option>
                            <option value="Leased">Leased / ලීස් / குத்தகை</option>
                            <option value="Hire Purchase">Hire Purchase / හයර් පර්චස් / வாடகை கொள்முதல்</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Cards for Vehicles */}
              <div className="mobile-table-cards">
                {formData.vehicles.map((r,i)=>(
                  <div key={i} className="mobile-table-card">
                    <div className="card-header">
                      {i+1}. Vehicle
                    </div>
                    <div className="field-row">
                      <label>
                        <div className="q-en">Make & Model</div>
                        <div className="q-si">නිෂ්පාදකයා සහ ආකෘතිය</div>
                        <div className="q-ta">தயாரிப்பு மற்றும் மாடல்</div>
                      </label>
                      <input value={r.makeModel} onChange={e=>tableChange("vehicles",i,"makeModel",e.target.value)} />
                    </div>
                    <div className="field-row">
                      <label>
                        <div className="q-en">Value (Rs.)</div>
                        <div className="q-si">වටිනාකම (රු.)</div>
                        <div className="q-ta">மதிப்பு (ரூ.)</div>
                      </label>
                      <div className="money-input">
                        <span>Rs.</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={r.value}
                          onChange={e=>tableChange("vehicles",i,"value",e.target.value)}
                        />
                      </div>
                      {errors[`vehicles.${i}.value`] && (
                        <span className="error-text">{errors[`vehicles.${i}.value`]}</span>
                      )}
                    </div>
                    <div className="field-row">
                      <label>
                        <div className="q-en">Reg. No</div>
                        <div className="q-si">ලියාපදිංචි අංකය</div>
                        <div className="q-ta">பதிவு எண்</div>
                      </label>
                      <input value={r.regNo} onChange={e=>tableChange("vehicles",i,"regNo",e.target.value)} />
                    </div>
                    <div className="field-row">
                      <label>
                        <div className="q-en">Own/Mortgaged/Leased/Hire Purchase</div>
                        <div className="q-si">හිමි / උකස් / ලීස් / හයර් පර්චස්</div>
                        <div className="q-ta">சொந்தம் / அடகு / குத்தகை / வாடகை கொள்முதல்</div>
                      </label>
                      <select value={r.ownership} onChange={e=>tableChange("vehicles",i,"ownership",e.target.value)}>
                        <option value="">Select / තෝරන්න / தேர்ந்தெடு</option>
                        <option value="Own">Own / හිමි / சொந்தம்</option>
                        <option value="Mortgaged">Mortgaged / උකස් / அடகு</option>
                        <option value="Leased">Leased / ලීස් / குத்தகை</option>
                        <option value="Hire Purchase">Hire Purchase / හයර් පර්චස් / வாடகை கொள்முதல்</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
              
              <button type="button" className="add-row-btn" onClick={()=>addRow("vehicles",emptyVehicleRow)}>+ Add Row</button>
            </div>

            <div className="property-card">
              <div className="property-card-header">
                <div className="property-card-title">
                  <div className="q-en">Shares</div>
                  <div className="q-si">කොටස්</div>
                  <div className="q-ta">பங்குகள்</div>
                </div>
              </div>
              <div className="table-wrap guarantor-wrap">
                <table className="paper-table guarantor-table">
                  <thead>
                    <tr>
                      <th style={{width:"6%"}}>
                        <div>No</div>
                        <div className="th-si">අංකය</div>
                        <div className="th-ta">இல.</div>
                      </th>
                      <th>
                        <div>Name of Institution</div>
                        <div className="th-si">ආයතනයේ නම</div>
                        <div className="th-ta">நிறுவனத்தின் பெயர்</div>
                      </th>
                      <th>
                        <div>Current Value (Rs.)</div>
                        <div className="th-si">වර්තමාන වටිනාකම (රු.)</div>
                        <div className="th-ta">தற்போதைய மதிப்பு (ரூ.)</div>
                      </th>
                      <th>
                        <div>No. of Shares</div>
                        <div className="th-si">කොටස් ගණන</div>
                        <div className="th-ta">பங்குகளின் எண்ணிக்கை</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.shares.map((r,i)=>(
                      <tr key={i} className="guarantor-row">
                        <td className="g-num">
                          <span>{i+1}</span>
                        </td>
                        <td><input value={r.institution} onChange={e=>tableChange("shares",i,"institution",e.target.value)} /></td>
                        <td>
                          <div className="money-input">
                            <span>Rs.</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={r.currentValue}
                              onChange={e=>tableChange("shares",i,"currentValue",e.target.value)}
                            />
                          </div>
                          {errors[`shares.${i}.currentValue`] && (
                            <span className="error-text">{errors[`shares.${i}.currentValue`]}</span>
                          )}
                        </td>
                        <td>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={r.noOfShares}
                            onChange={e=>tableChange("shares",i,"noOfShares",e.target.value)}
                          />
                          {errors[`shares.${i}.noOfShares`] && (
                            <span className="error-text">{errors[`shares.${i}.noOfShares`]}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Cards for Shares */}
              <div className="mobile-table-cards">
                {formData.shares.map((r,i)=>(
                  <div key={i} className="mobile-table-card">
                    <div className="card-header">
                      {i+1}. Share
                    </div>
                    <div className="field-row">
                      <label>
                        <div className="q-en">Name of Institution</div>
                        <div className="q-si">ආයතනයේ නම</div>
                        <div className="q-ta">நிறுவனத்தின் பெயர்</div>
                      </label>
                      <input value={r.institution} onChange={e=>tableChange("shares",i,"institution",e.target.value)} />
                    </div>
                    <div className="field-row">
                      <label>
                        <div className="q-en">Current Value (Rs.)</div>
                        <div className="q-si">වර්තමාන වටිනාකම (රු.)</div>
                        <div className="q-ta">தற்போதைய மதிப்பு (ரூ.)</div>
                      </label>
                      <div className="money-input">
                        <span>Rs.</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={r.currentValue}
                          onChange={e=>tableChange("shares",i,"currentValue",e.target.value)}
                        />
                      </div>
                      {errors[`shares.${i}.currentValue`] && (
                        <span className="error-text">{errors[`shares.${i}.currentValue`]}</span>
                      )}
                    </div>
                    <div className="field-row">
                      <label>
                        <div className="q-en">No. of Shares</div>
                        <div className="q-si">කොටස් ගණන</div>
                        <div className="q-ta">பங்குகளின் எண்ணிக்கை</div>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={r.noOfShares}
                        onChange={e=>tableChange("shares",i,"noOfShares",e.target.value)}
                      />
                      {errors[`shares.${i}.noOfShares`] && (
                        <span className="error-text">{errors[`shares.${i}.noOfShares`]}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <button type="button" className="add-row-btn" onClick={()=>addRow("shares",emptyShareRow)}>+ Add Row</button>
            </div>

            <div className="property-card property-card-full">
              <div className="property-card-header">
                <div className="property-card-title">
                  <div className="q-en">Life Insurance</div>
                  <div className="q-si">ජීවිත රක්ෂණය</div>
                  <div className="q-ta">உயிர் காப்பீடு</div>
                </div>
              </div>
              <div className="res-radio-grid">
                <label className={`res-radio-card ${formData.lifeInsurance==="Yes" ? 'active' : ''}`}>
                  <input type="radio" name="lifeInsurance" value="Yes" checked={formData.lifeInsurance==="Yes"} onChange={()=>toggleCheck("lifeInsurance","Yes")} />
                  <div className="res-radio-content">Yes</div>
                  <div className="q-si">ඔව්</div>
                  <div className="q-ta">ஆம்</div>
                </label>
                <label className={`res-radio-card ${formData.lifeInsurance==="No" ? 'active' : ''}`}>
                  <input type="radio" name="lifeInsurance" value="No" checked={formData.lifeInsurance==="No"} onChange={()=>toggleCheck("lifeInsurance","No")} />
                  <div className="res-radio-content">No</div>
                  <div className="q-si">නැත</div>
                  <div className="q-ta">இல்லை</div>
                </label>
              </div>
              {formData.lifeInsurance === "Yes" && (
                <div className="property-specify">
                  <label className="property-specify-label">If Yes Please Specify <span className="q-si">ඔව් නම් කරුණාකර සඳහන් කරන්න</span> <span className="q-ta">ஆம் என்றால் குறிப்பிடவும்</span></label>
                  <textarea className="app-textarea" name="lifeInsuranceSpecify" value={formData.lifeInsuranceSpecify} onChange={handleChange} rows={3} placeholder="Provide details..." />
                </div>
              )}
            </div>

            <div className="property-card property-card-full">
              <div className="property-card-header">
                <div className="property-card-title">
                  <div className="q-en">Deposits</div>
                  <div className="q-si">තැන්පතු</div>
                  <div className="q-ta">வைப்புகள்</div>
                </div>
              </div>
              <div className="res-radio-grid">
                <label className={`res-radio-card ${formData.deposits==="Yes" ? 'active' : ''}`}>
                  <input type="radio" name="deposits" value="Yes" checked={formData.deposits==="Yes"} onChange={()=>toggleCheck("deposits","Yes")} />
                  <div className="res-radio-content">Yes</div>
                  <div className="q-si">ඔව්</div>
                  <div className="q-ta">ஆம்</div>
                </label>
                <label className={`res-radio-card ${formData.deposits==="No" ? 'active' : ''}`}>
                  <input type="radio" name="deposits" value="No" checked={formData.deposits==="No"} onChange={()=>toggleCheck("deposits","No")} />
                  <div className="res-radio-content">No</div>
                  <div className="q-si">නැත</div>
                  <div className="q-ta">இல்லை</div>
                </label>
              </div>
              {formData.deposits === "Yes" && (
                <div className="property-specify">
                  <label className="property-specify-label">If Yes Please Specify <span className="q-si">ඔව් නම් කරුණාකර සඳහන් කරන්න</span> <span className="q-ta">ஆம் என்றால் குறிப்பிடவும்</span></label>
                  <textarea className="app-textarea" name="depositsSpecify" value={formData.depositsSpecify} onChange={handleChange} rows={3} placeholder="Provide details..." />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 18. Facility Requirement */}
        <section className="paper-section">
          <div className="sec-head">
            <span className="q-num">18).</span>
            <span className="q-en">Facility Requirement Lease / Loan</span>
            <span className="q-si">පහසුකම් අවශ්‍යතාවය - ලීස් / ණය</span>
            <span className="q-ta">வசதி தேவை - குத்தகை / கடன்</span>
          </div>
          <div className="facility-panel">
            <div className="table-wrap guarantor-wrap">
              <table className="paper-table guarantor-table">
                <thead>
                  <tr>
                    <th style={{width:"6%"}}>No</th>
                    <th><div>Make &amp; Model of Equipment</div><div className="th-si">උපකරණයේ වර්ගය සහ ආකෘතිය</div><div className="th-ta">உபகரணத்தின் தயாரிப்பு மற்றும் மாடல்</div></th>
                    <th><div>Status</div><div className="th-si">තත්ත්වය</div><div className="th-ta">நிலை</div></th>
                    <th><div>Purpose of Loan/Lease</div><div className="th-si">ණය / ලීස් සඳහා අරමුණ</div><div className="th-ta">கடன் / குத்தகையின் நோக்கம்</div></th>
                    <th><div>Supplier</div><div className="th-si">සපයන්නා</div><div className="th-ta">வழங்குநர்</div></th>
                    <th><div>Period</div><div className="th-si">කාලය</div><div className="th-ta">காலம்</div></th>
                    <th><div>Cost (Rs.)</div><div className="th-si">වියදම (රු.)</div><div className="th-ta">செலவு (ரூ.)</div></th>
                    <th style={{width:"10%"}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.facilityRequirements.map((r,i)=>(
                    <tr key={i} className="guarantor-row">
                      <td className="g-num">
                        <span>{i+1}</span>
                        {i >= 3 && <button type="button" className="del-row-btn del-small" onClick={()=>removeRow("facilityRequirements",i)}>✕</button>}
                      </td>
                      <td><input value={r.makeModel} onChange={e=>tableChange("facilityRequirements",i,"makeModel",e.target.value)} placeholder="Type equipment" /></td>
                      <td><input className="table-input" value={r.status} onChange={e=>tableChange("facilityRequirements",i,"status",e.target.value)} placeholder="Status" /></td>
                      <td><input className="table-input" value={r.purpose} onChange={e=>tableChange("facilityRequirements",i,"purpose",e.target.value)} placeholder="Purpose" /></td>
                      <td><input className="table-input" value={r.supplier} onChange={e=>tableChange("facilityRequirements",i,"supplier",e.target.value)} placeholder="Supplier" /></td>
                      <td><input className="table-input" value={r.period} onChange={e=>tableChange("facilityRequirements",i,"period",e.target.value)} placeholder="Period" /></td>
                      <td><input className="table-input" type="number" inputMode="numeric" min="0" step="any" value={r.cost} placeholder="Rs." onChange={e=>tableChange("facilityRequirements",i,"cost",e.target.value)} /></td>
                      <td className="action-cell">
                        {i >= 3 && <button type="button" className="del-row-btn" onClick={()=>removeRow("facilityRequirements",i)}>Remove</button>}
                      </td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td colSpan={5} className="total-r"><strong>Total <span className="q-si">මුළු එකතුව</span> <span className="q-ta">மொத்தம்</span></strong></td>
                    <td><strong>{totalFacilityCost>0 ? `Rs. ${totalFacilityCost.toLocaleString()}` : ""}</strong></td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="table-actions">
              <button type="button" className="add-row-btn" onClick={()=>addRow("facilityRequirements",emptyFacilityRow)}>+ Add Row</button>
            </div>
          </div>
        </section>

        {/* 19. Preferred Language */}
        <section className="paper-section">
          <div className="qual-row">
            <div className="qual-lbl"><span className="q-num">19).</span><div><div className="q-en">Preferred Language for Communication:</div><div className="q-si">සන්නිවේදනය සඳහා වැඩිපුර ප්‍රියතම භාෂාව:</div><div className="q-ta">தொடர்புக்கு விருப்பமான மொழி:</div></div></div>
            <div className="qual-opts">
              {[["Sinhala","සිංහල","சிங்களம்"],["Tamil","දෙමළ","தமிழ்"],["English","ඉංග්‍රීසි","ஆங்கிலம்"]].map(([en,si,ta])=>(
                <label key={en} className="qual-card">
                  <input type="radio" name="preferredLanguage" checked={formData.preferredLanguage===en} onChange={()=>setFormData(p => ({ ...p, preferredLanguage: en }))} />
                  <div className="qual-card-content">
                    <div className="q-en">{en}</div>
                    <div className="q-si">{si}</div>
                    <div className="q-ta">{ta}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* 20. Location of Leased Asset */}
        <section className="paper-section">
          <div className="s20-row">
            <div className="s20-lbl"><span className="q-num">20).</span><div><div className="q-en">Location of Leased Asset</div><div className="q-si">කුලියට ගත් වතුවේ ස්ථානය</div><div className="q-ta">குத்தகைக்கு எடுக்கப்பட்ட சொத்தின் இடம்</div></div></div>
            <input className="line-input" name="locationOfLeasedAsset" value={formData.locationOfLeasedAsset} onChange={handleChange} />
          </div>
        </section>

        {/* 21. Sources of Funds */}
        <section className="paper-section">
          <div className="qual-row">
            <div className="qual-lbl"><span className="q-num">21).</span><div><div className="q-en">Sources of funds and /or nature of credits into the account:</div><div className="q-si">ගිණුම් මූලාශ්‍ර සහ/හෝ ගිණුම් ගනුදෙනුවේ ස්වභාවය:</div><div className="q-ta">நிதியின் மூலங்கள் மற்றும்/அல்லது கணக்கில் வரவுகளின் இயல்பு:</div></div></div>
            <div className="qual-opts">
              {[["Business Income","ව්‍යාපාරික ආදායම්","வணிக வருமானம்"],["Salary/Earnings","වැටුප් / ලබාගැනීම්","சம்பளம்/வருமானம்"],["Sale of Property/ Assets","දේපළ/වතු විකිණීම්","சொத்து/சொத்துகளின் விற்பனை"],["Family Inward Remittance","පවුලේ ඇතුළු පිරිනැමීම්","குடும்ப உள்நாட்டு பண அனுப்புதல்"],["Donations Charity (Local / Foreign)","පූජාවන් සුබසාධක කටයුතු (දේශීය / විදේශීය)","தானங்கள் தொண்டு (உள்நாட்டு / வெளிநாட்டு)"],["Others (Specify)","වෙනත් (සඳහන් කරන්න)","மற்றவை (குறிப்பிடுக)"]].map(([en,si,ta])=>(
                <label key={en} className="qual-card">
                  <input type="checkbox" checked={formData.fundSources.includes(en)} onChange={()=>handleFundSourceChange(en)} />
                  <div className="qual-card-content">
                    <div className="q-en">{en}</div>
                    <div className="q-si">{si}</div>
                    <div className="q-ta">{ta}</div>
                  </div>
                </label>
              ))}
            </div>
            {formData.fundSources.includes("Others (Specify)") && (
              <div className="other-qual-field">
                <label className="other-qual-label">
                  <div className="q-en">Specify Other Source</div>
                  <div className="q-si">වෙනත් මූලාශ්‍රය සඳහන් කරන්න</div>
                  <div className="q-ta">பிற மூலத்தை குறிப்பிடுக</div>
                </label>
                <input
                  type="text"
                  className="other-qual-input"
                  value={formData.otherFundSource || ""}
                  onChange={handleChange}
                  name="otherFundSource"
                  placeholder="Enter other fund source"
                />
              </div>
            )}
          </div>
        </section>

        {/* 22. Annual Turnover Individual */}
        <section className="paper-section">
          <div className="sec-head wrap-head"><span className="q-num">22).</span><span className="q-en">Annual turnover (Individual Earnings)</span><span className="q-si">වාර්ෂික පිරිවැටුම (පුද්ගල ආදායම)</span><span className="q-ta">வருடாந்திர வருமானம் (தனிப்பட்ட)</span></div>
          <div className="turnover-opts">
            {["< 499,999","500,000 - 1,499,999","1,500,000 – 2,499,999","2,500,000 - 4,999,999","5,000,000 - 9,999,999","10,000,000 - 19,999,999","> 20,000,000"].map(r=>(
              <label key={r} className="qual-card">
                <input type="radio" name="annualTurnoverIndividual" checked={formData.annualTurnoverIndividual===r} onChange={()=>toggleCheck("annualTurnoverIndividual",r)} />
                <div className="qual-card-content">
                  <div className="q-en">{r}</div>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* 23. Annual Turnover Business */}
        <section className="paper-section">
          <div className="sec-head wrap-head"><span className="q-num">23).</span><span className="q-en">Annual turnover (Business Earnings)</span><span className="q-si">වාර්ෂික පිරිවැටුම (ව්‍යාපාරික ආදායම)</span><span className="q-ta">வருடாந்திர வருமானம் (வணிக)</span></div>
          <div className="turnover-opts">
            {["< 4,999,999","5,000,000 - 9,999,999","10,000,000 – 24,999,999","25,000,000 - 49,999,999","> 50,000,000"].map(r=>(
              <label key={r} className="qual-card">
                <input type="radio" name="annualTurnoverBusiness" checked={formData.annualTurnoverBusiness===r} onChange={()=>toggleCheck("annualTurnoverBusiness",r)} />
                <div className="qual-card-content">
                  <div className="q-en">{r}</div>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* 24 */}
        <section className="paper-section">
          <div className="sec-head"><span className="q-num">24).</span></div>
          <div className="s24-card">
            <div className="s24-part">
              <div className="s24-title">
                <span className="s24-num">1.</span>
                <div><div className="q-en">Other connected business / Professional relationships &amp; interests</div><div className="q-si">වෙනත් සම්බන්ධිත ව්‍යාපාර / වෘත්තීය සම්බන්ධතා සහ උනන්දුව</div><div className="q-ta">மற்ற இணைக்கப்பட்ட வணிகம் / தொழில்முறை உறவுகள் மற்றும் ஆர்வங்கள்</div></div>
              </div>
              <textarea className="s24-textarea" name="otherConnectedBusiness" value={formData.otherConnectedBusiness} onChange={handleChange} placeholder="Enter details..." rows={4} />
            </div>
            <div className="s24-divider"></div>
            <div className="s24-part">
              <div className="s24-title s24-title-indent"><div className="q-en">Reason to obtain a Lease / Loan facility</div><div className="q-si">කුලියට / ණය පහසුකමක් ලබාගැනීමේ හේතුව</div><div className="q-ta">குத்தகை / கடன் வசதியைப் பெறுவதற்கான காரணம்</div></div>
              <textarea className="s24-textarea" name="reasonForLoan" value={formData.reasonForLoan} onChange={handleChange} placeholder="Enter details..." rows={4} />
            </div>
          </div>
          <div className="s24-row s24-branch">
            <div className="s24-lbl">
              <span className="s24-n">2.</span>
              <div><div className="q-en">If the Permanent address is within the Branch Service Area?</div><div className="q-si">ස්ථාවර ලිපිනය ශාඛා සේවා ප්‍රාන්තය තුළද?</div><div className="q-ta">நிரந்தர முகவரி கிளை சேவை பகுதிக்குள் இருக்கிறதா?</div></div>
            </div>
            <div className="res-radio-grid">
              <label className={`res-radio-card ${formData.withinBranchServiceArea==="Yes" ? 'active' : ''}`}>
                <input type="radio" name="withinBranchServiceArea" value="Yes" checked={formData.withinBranchServiceArea==="Yes"} onChange={()=>setFormData(p => ({ ...p, withinBranchServiceArea: "Yes" }))} />
                <div className="res-radio-content">Yes</div>
                <div className="q-si">ඔව්</div>
                <div className="q-ta">ஆம்</div>
              </label>
              <label className={`res-radio-card ${formData.withinBranchServiceArea==="No" ? 'active' : ''}`}>
                <input type="radio" name="withinBranchServiceArea" value="No" checked={formData.withinBranchServiceArea==="No"} onChange={()=>setFormData(p => ({ ...p, withinBranchServiceArea: "No" }))} />
                <div className="res-radio-content">No</div>
                <div className="q-si">නැත</div>
                <div className="q-ta">இல்லை</div>
              </label>
            </div>
          </div>
          {formData.withinBranchServiceArea === "No" && (
            <div className="s24-row">
              <div className="s24-lbl s24-indent"><div className="q-en">If No, Reason:</div><div className="q-si">නැත නම්, හේතුව:</div><div className="q-ta">இல்லை என்றால், காரணம்:</div></div>
              <textarea className="app-textarea" name="ifNoReason" value={formData.ifNoReason} onChange={handleChange} rows={3} placeholder="Provide reason..." />
            </div>
          )}
        </section>

        {/* 25. PEP */}
        <section className="paper-section">
          <div className="pep-block">
            <div className="pep-q">
              <span className="q-num">25).</span>
              <div><div className="q-en">Are you / Owner/s, Partner/s, Director/s, Official/s, or any family member a Political Exposed Person (PEP)?</div><div className="q-si">ඔබ / හිමිකරුවන් / සහකරුවන් / අධ්‍යක්ෂවරුන් / නිලධාරීන් හෝ ඕනෑම පවුලේ සාමාජිකයෙක් රාජ්‍ය ප්‍රකාශිත පුද්ගලයෙක්ද (PEP)?</div><div className="q-ta">நீங்கள் / உரிமையாளர்கள் / துணைக்குழுக்கள் / இயக்குநர்கள் / அதிகாரிகள் அல்லது எந்த குடும்ப உறுப்பினரும் அரசியல் வெளிப்படுத்தப்பட்ட நபர் (PEP) ஆவாரா?</div></div>
            </div>
            <div className="pep-ans">
              <div className="res-radio-grid">
                <label className={`res-radio-card ${formData.isPEP==="Yes" ? 'active' : ''}`}>
                  <input type="radio" name="isPEP" value="Yes" checked={formData.isPEP==="Yes"} onChange={()=>setFormData(p => ({ ...p, isPEP: "Yes" }))} />
                  <div className="res-radio-content">Yes</div>
                  <div className="q-si">ඔව්</div>
                  <div className="q-ta">ஆம்</div>
                </label>
                <label className={`res-radio-card ${formData.isPEP==="No" ? 'active' : ''}`}>
                  <input type="radio" name="isPEP" value="No" checked={formData.isPEP==="No"} onChange={()=>setFormData(p => ({ ...p, isPEP: "No" }))} />
                  <div className="res-radio-content">No</div>
                  <div className="q-si">නැත</div>
                  <div className="q-ta">இல்லை</div>
                </label>
              </div>
              {formData.isPEP === "Yes" && (
                <div className="pep-specify">
                  <label className="pep-specify-label">
                    <div className="q-en">If Yes please specify the relationship:</div>
                    <div className="q-si">ඔව් නම් කරුණාකර සම්බන්ධතාවය සඳහන් කරන්න:</div>
                    <div className="q-ta">ஆம் என்றால் தயவுசெய்து உறவை குறிப்பிடுக:</div>
                  </label>
                  <textarea className="app-textarea" name="pepRelationship" value={formData.pepRelationship} onChange={handleChange} rows={3} placeholder="Specify relationship..." />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* DECLARATION */}
        <section className="paper-section decl-section">
          <div className="declaration-card">
            <div className="declaration-block">I declare that the above information is true and warrant that I have made full disclosure of all matters relevant in any way whatsoever in this application. I authorize you to make any inquires as you deem necessary for credit assessment or confirmation of the above particulars from the banks, auditors, Credit Information Bureau (CRIB), Department for Registration of Persons and any other parties or any other source.</div>
            <div className="declaration-block">මම ප්‍රකාශ කරමින් සිටිමි ඉහත තොරතුරු සත්‍ය බව සහ මෙම අයදුම්පතේ සම්බන්ධ සියලුම කාරණා පිළිබඳ සම්පූර්ණ විවෘත කිරීමක් කර ඇති බවට සහතික කරමි. මම ඔබට ණය පිරිපහදුව කිරීමට හෝ ඉහත කරුණු තහවුරු කිරීම සඳහා බැංකු, විනිශ්චයකරුවන්, ණය තොරතුරු කාර්යාලය (CRIB), පුද්ගලයින් ලේඛනාගාරය සහ වෙනත් පාර්ටි වලින් හෝ වෙනත් මූලාශ්‍ර වලින් ඔබට අවශ්‍ය යමික පරීක්ෂණයක් කිරීමට අවසර දෙමි.</div>
            <div className="declaration-block">நான் மேற்கண்ட தகவல்கள் உண்மை என்பதைப் பிரகடனம் செய்கிறேன் மற்றும் இந்த விண்ணப்பத்தில் எந்த வகையிலும் தொடர்புடைய அனைத்து விஷயங்களையும் முழுமையாக வெளிப்படுத்தியுள்ளேன் என்பதை உத்தரவாதம் செய்கிறேன். கடன் மதிப்பீடு அல்லது மேற்கண்ட விவரங்களை உறுதிப்படுத்துவதற்காக வங்கிகள், தணிக்கையாளர்கள், கடன் தகவல் அலுவலகம் (CRIB), நபர்கள் பதிவு துறை மற்றும் பிற தரப்பினரிடமிருந்து அல்லது வேறு எந்த மூலத்திலிருந்தும் நீங்கள் தேவையெனக் கருதும் எந்த விசாரணையும் செய்ய உங்களுக்கு அனுமதி அளிக்கிறேன்.</div>

            <div className="declaration-block">I authorize Abans Finance PLC to register my facility and asset details in the Secured Transactions Register (STR).</div>
            <div className="declaration-block">අබාන්ස් පොළී සීමිටඩ්ට මගේ පහසුකම් සහ වතු විස්තර ආරක්ෂිත ගනුදෙනු ලේඛනාගාරයේ (STR) ලියාපදිංචි කිරීමට මම අවසර දෙමි.</div>
            <div className="declaration-block">அபான்ஸ் பைனான்ஸ் பிஎல்சி-க்கு எனது வசதி மற்றும் சொத்து விவரங்களை பாதுகாப்பான பரிவர்த்தனை பதிவேட்டில் (STR) பதிவு செய்ய அனுமதி அளிக்கிறேன்.</div>

            <div className="declaration-block">This application remains the property of Abans Finance PLC even if the Lease / Loan facility is not granted. Abans Finance PLC reserves the right to reject the application at its sole discretion, without stating reasons.</div>
            <div className="declaration-block">මෙම අයදුම්පත කුලියට / ණය පහසුකම් නොලැබුණත් අබාන්ස් පොළී සීමිටඩ්ගේ දේපළ වනවා. අබාන්ස් පොළී සීමිටඩ්ට මෙම අයදුම්පත ප්‍රතික්ෂේප කිරීමේ අයිතිය ඇති අතර, හේතු ප්‍රකාශ නොකරමින් එය කිරීමට ඇති අයිතිය ඇත.</div>
            <div className="declaration-block">இந்த விண்ணப்பம் குத்தகை / கடன் வசதி வழங்கப்படாவிட்டாலும் அபான்ஸ் பைனான்ஸ் பிஎல்சி-யின் சொத்தாக இருக்கும். அபான்ஸ் பைனான்ஸ் பிஎல்சி-க்கு இந்த விண்ணப்பத்தை நிராகரிக்கும் உரிமை உள்ளது, மேலும் காரணங்களை குறிப்பிடாமல் அதைச் செய்யும் உரிமை உள்ளது.</div>
          </div>
        </section>

        {/* SIGNATURE */}
        <section className="paper-section sig-section">
          <div className="sig-grid">
            <div className="sig-col">
              <div className="sig-line"></div>
            </div>
            <div className="sig-col sig-name">
              <input className="sig-name-input" name="signatureName" value={formData.signatureName} onChange={handleChange} />
            </div>
            <div className="sig-col sig-date">
              <input
                type="date"
                className="sig-date-input"
                name="signatureDate"
                value={formData.signatureDate}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* FORM ACTIONS */}
        <div className="form-actions">
          <button type="button" className="paper-btn secondary" onClick={handleReset}>Clear Form</button>
          <button type="submit" className="paper-btn primary" disabled={loadingState.visible}>Submit</button>
        </div>

      </form>
    </div>
    </>
  );
  
}

export default ApplicationForm;
