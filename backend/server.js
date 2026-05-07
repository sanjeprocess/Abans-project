const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
require('dotenv').config();
const mongoose = require('mongoose');
const Application = require('./models/Application');
const Counter = require('./models/Counter');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

mongoose
  .connect(process.env.MONGODB_URI, { family: 4 })
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

const app = express();
const PORT = process.env.PORT || 3003;

const TENANT_ID   = "IJ7J6CWM2XUJKVLKL7HHOOCLPFMOWFWW";
const WORKFLOW_ID = "wb4c791a6a7";
const WH_BASE     = "https://app.workhub24.com";



const DATASTORES = {
  main:      { host: "https://app.workhub24.com",  id: "JUEOEKINULT7Y4W2UAY63RPRQNLFYVZ7AREKVQUD" },
  bank:      { host: "https://app.workhub24.com",  id: "ONXWFXRLEFOMTFY3I2F4GRKO7L5UNWAHJ252ZGNC" },
  credit:    { host: "https://beta.workhub24.com", id: "R7PKAQLBWVRWYOWMZ2AKKMYKKU62N4UDFL42DWWA"  },
  vehicle:   { host: "https://beta.workhub24.com", id: "TZ4XQ44NNFFKH4B6L3GUXTIYCT4CQIXHCWP4ZNRU"  },
  shares:    { host: "https://app.workhub24.com",  id: "PGJBN5CZ2VC6D7XJEQYH4AL5ORXRPYOUE6IQJYFO"  },
  facility:  { host: "https://app.workhub24.com",  id: "GLZTLAMP263HYQ4GRXG5B2UYLVWYHZD7I35HEERJ"  },
  land:      { host: "https://app.workhub24.com",  id: "ROPDY6LMJFSGEIUUHQOMEHKJ5OSSJQTZGYR32QC4"  },
  guarantor: { host: "https://app.workhub24.com",  id: "Y3W5Y54PPEN2G65UVTACXL5OARX37KHDHYU2KMPP"  },
  prereg:    { host: "https://app.workhub24.com",  id: "SYP7VJRRB5WUIHDVTN3UQZCKQMDINHWDRHBZGFD4"  },
};

// ⚠️  Must be a fresh ACCESS token (typ:"access"), NOT a refresh token.
// Get it from WorkHub → top-right profile → Copy Access Token
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || process.env.AUTH_TOKEN ||
  "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ3b3JraHViLmNvbSIsImVudiI6InByb2QiLCJleHAiOjE3NzgxMjY4NzcsImlhdCI6MTc3ODEyNjE1NywiaXNzIjoid29ya2h1Yi5jb20iLCJqdGkiOiJiMTAwNzdlNi1mYmVlLTQ1MWEtODIyZC1lNDk0MmEzMDA0YzgiLCJsbSI6IlBBU1NXT1JEIiwibG9naW5fdXNlcl9pZCI6IjdIVjRESU9SNEpSUFY0QVlFQ1VVTlNSNlI0MzdaSlhNIiwibmJmIjoxNzc4MTI2MTU2LCJzY29wZSI6WyJ1OnYiLCJ3OnYiXSwic2lkIjoiQ0tWNUFDM0g1RVlDVzdINlVLQUg0Q1o1SE8zTVFCT0tMTUVBM09CUyIsInN1YiI6IjdIVjRESU9SNEpSUFY0QVlFQ1VVTlNSNlI0MzdaSlhNIiwidG50IjoiSUo3SjZDV00yWFVKS1ZMS0w3SEhPT0NMUEZNT1dGV1ciLCJ0eXAiOiJhY2Nlc3MiLCJ1bmFtZSI6InRoIHRzdCJ9.c8m3kTHovW27fnZbr6rhnj7FfsJg9JVwTSkES23PZrfU51HTRW6Hamoa-_7bVKVgQjkGOGt7Kw0vZYc-uMIehA";

const REFRESH_TOKEN = process.env.REFRESH_TOKEN || process.env.WH_REFRESH_TOKEN ||
  "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ3b3JraHViLmNvbSIsImVudiI6InByb2QiLCJleHAiOjE3NzgxNjIxNTcsImlhdCI6MTc3ODEyNjE1NywiaXNzIjoid29ya2h1Yi5jb20iLCJqdGkiOiIzNDlhZjkwMi04OTM5LTQwYTktYTQwNy01YjUyNjcxYWE5MGEiLCJsbSI6IlBBU1NXT1JEIiwibG9naW5fdXNlcl9pZCI6IjdIVjRESU9SNEpSUFY0QVlFQ1VVTlNSNlI0MzdaSlhNIiwibmJmIjoxNzc4MTI2MTU2LCJzY29wZSI6WyJ1OnYiLCJ3OnYiXSwic2lkIjoiQ0tWNUFDM0g1RVlDVzdINlVLQUg0Q1o1SE8zTVFCT0tMTUVBM09CUyIsInN1YiI6IjdIVjRESU9SNEpSUFY0QVlFQ1VVTlNSNlI0MzdaSlhNIiwidG50IjoiSUo3SjZDV00yWFVKS1ZMS0w3SEhPT0NMUEZNT1dGV1ciLCJ0eXAiOiJyZWZyZXNoIiwidW5hbWUiOiJ0aCB0c3QifQ.N0NdhCVtbB_FbHRz-iZ4PLQQBJRodMRZY78KPEDeaWVIselpnUN7Obys288W0xADLTWibRMlR6eNDcawXx-dvQ";
const TOKEN_EXPIRY_LEEWAY_SECONDS = 60;

let currentAccessToken = ACCESS_TOKEN;
let currentRefreshToken = REFRESH_TOKEN;

function parseJwtPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payloadJson = Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString();
    return JSON.parse(payloadJson);
  } catch (err) {
    return null;
  }
}

function getAccessTokenInfo() {
  const payload = parseJwtPayload(currentAccessToken);
  if (!payload) return null;
  const expMs = payload.exp ? payload.exp * 1000 : 0;
  return {
    payload,
    expiresAt: new Date(expMs),
    type: payload.typ || payload.type || "unknown",
    isExpired: Date.now() > expMs - TOKEN_EXPIRY_LEEWAY_SECONDS * 1000,
    rawExpiry: expMs,
  };
}

async function refreshAccessToken() {
  if (!currentRefreshToken) {
    throw new Error("REFRESH_TOKEN is not configured in the environment");
  }

  const refreshPayload = {
    refresh_token: currentRefreshToken,
    grant_type: "refresh_token",
  };

  const jsonHeaders = { "Content-Type": "application/json", accept: "application/json" };
  const primaryUrl = `${WH_BASE}/api/auth/token`;

  try {
    const res = await fetch(primaryUrl, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(refreshPayload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`❌ Token refresh failed HTTP ${res.status} from ${primaryUrl}: ${text}`);
      throw new Error(`Token refresh failed HTTP ${res.status}`);
    }

    const data = await res.json();
    const nextAccessToken = data.access_token;
    const nextRefreshToken = data.refresh_token;

    if (!nextAccessToken) {
      throw new Error("Token refresh response missing access_token");
    }

    currentAccessToken = nextAccessToken;
    if (nextRefreshToken) currentRefreshToken = nextRefreshToken;
    console.log("✅ WorkHub24 access token refreshed successfully");
    return { accessToken: currentAccessToken, refreshToken: currentRefreshToken, raw: data };
  } catch (err) {
    console.error(`❌ Token refresh error: ${err.message}`);
    throw err;
  }
} 

async function ensureValidToken() {
  if (!currentAccessToken) {
    throw new Error("ACCESS_TOKEN is not configured in the environment");
  }
  const info = getAccessTokenInfo();
  if (!info) {
    throw new Error("Current ACCESS_TOKEN is invalid JWT");
  }
  if (info.isExpired) {
    try {
      await refreshAccessToken();
      return getAccessTokenInfo();
    } catch (err) {
      console.warn(`⚠️ Token refresh failed: ${err.message}. Proceeding with current expired token; WorkHub24 API may reject the request.`);
      return info;
    }
  }
  return info;
}

const initialTokenInfo = getAccessTokenInfo();
console.log("\n🔑 WORKHUB24 TOKEN INFO");
if (initialTokenInfo) {
  console.log(`  token type: ${initialTokenInfo.type}`);
  console.log(`  access token expires: ${initialTokenInfo.expiresAt.toISOString()}`);
  console.log(`  expires in: ${Math.max(0, Math.round((initialTokenInfo.rawExpiry - Date.now()) / 60000))} minutes`);
  if (initialTokenInfo.type !== "access") {
    console.error("❌ WRONG TOKEN TYPE — current token is not an access token!");
    console.error("   Get ACCESS TOKEN from WorkHub profile (typ:'access')");
  } else {
    console.log("✅ Token type is access");
  }
  if (initialTokenInfo.isExpired) {
    console.warn("⚠️ ACCESS_TOKEN is expired or within leeway — refresh required");
  }
} else {
  console.error("❌ Failed to parse ACCESS_TOKEN JWT payload");
}

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://abance-testing.vercel.app",
  "https://abance-frontend.vercel.app",
  "https://abance-backend-v2.vercel.app",
];
app.use(cors({
  origin: (origin, cb) => (!origin || allowedOrigins.includes(origin)) ? cb(null, true) : cb(new Error("Not allowed by CORS")),
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "10mb" }));

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const s = (v) => (Array.isArray(v) ? v.join(", ") : (v ?? "").toString());
const n = (v) => (v === "" || v == null ? 0 : Number(v) || 0);
const d = (v) => v || null;

function normalizeQualification(v) {
  const order = ["Primary", "Secondary", "Graduate", "Post Graduate", "Professional"];
  if (Array.isArray(v)) {
    for (let i = order.length - 1; i >= 0; i--) if (v.includes(order[i])) return order[i];
    return v[0] || "";
  }
  return (v || "").toString();
}
function normalizeYesNo(v) {
  const str = (v || "").toString();
  if (str === "Yes") return "yes";
  if (str === "No")  return "no";
  return str;
}
function normalizeBranchArea(v) {
  const str = (v || "").toString();
  if (str === "Yes") return "yes";
  if (str === "No")  return "No";
  return str;
}

const TURNOVER_INDIVIDUAL_MAP = {
  "< 499,999":               "<499,999",
  "500,000 - 1,499,999":    "500k–1.49m ",
  "1,500,000 – 2,499,999":  "1.5m–2.49m ",
  "2,500,000- 4,999,999":   "2.5m–4.99m",
  "2,500,000 - 4,999,999":  "2.5m–4.99m",
  "5,000,000 - 9,999,999":  "5m–9.99m",
  "10,000,000- 19,999,999": "10m–19.99m",
  "10,000,000 - 19,999,999":"10m–19.99m",
  ">20,000,000":             ">20m",
  "> 20,000,000":            ">20m",
};
const TURNOVER_BUSINESS_MAP = {
  "< 4,999,999":              "<4,999,999",
  "5,000,000- 9,999,999":    "5m–9.99m",
  "5,000,000 - 9,999,999":   "5m–9.99m",
  "10,000,000 – 24,999,999": " 10m–24.99m ",
  "25,000,000- 49,999,999":  "25m–49.99m ",
  "25,000,000 - 49,999,999": "25m–49.99m ",
  "> 50,000,000":             ">50m",
};
function normalizeTurnover(v, map) {
  return map[(v || "").toString()] || (v || "").toString();
}
function normalizeFundSources(v) {
  return Array.isArray(v) ? v.join(", ") : (v || "").toString();
}
function authHeaders() {
  return {
    "Content-Type":  "application/json",
    "accept":        "application/json",
    "authorization": `Bearer ${currentAccessToken}`,
  };
}

// Extract any URL from a response object, checking priority keys first
const extractUrlFromResponse = (obj) => {
  if (!obj || typeof obj !== 'object') return null;
  const priorityKeys = ['signingLink', 'signUrl', 'formUrl', 'redirectUrl', 'documentUrl', 'shareLink', 'link', 'url', 'webUrl', 'publicUrl', 'accessUrl'];
  for (const key of priorityKeys) {
    if (obj[key] && (obj[key].toString().startsWith('http://') || obj[key].toString().startsWith('https://'))) {
      return obj[key];
    }
  }
  // Check all other keys
  for (const [key, val] of Object.entries(obj)) {
    if (val && typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'))) {
      return val;
    }
  }
  return null;
};

// Try multiple WorkHub24 endpoints to get a signing/form link for a card
const getWorkHub24FormLink = async (cardId) => {
  await ensureValidToken();
  const endpoints = [
    { name: 'GET card', method: 'GET', path: `/cards/${cardId}`, body: null },
    { name: 'GET share', method: 'GET', path: `/cards/${cardId}/share`, body: null },
    { name: 'POST share', method: 'POST', path: `/cards/${cardId}/share`, body: {} },
    { name: 'GET sign', method: 'GET', path: `/cards/${cardId}/sign`, body: null },
    { name: 'POST sign', method: 'POST', path: `/cards/${cardId}/sign`, body: {} },
    { name: 'GET form', method: 'GET', path: `/cards/${cardId}/form`, body: null },
    { name: 'GET document', method: 'GET', path: `/cards/${cardId}/document`, body: null },
    { name: 'POST generate-link', method: 'POST', path: `/cards/${cardId}/generate-link`, body: {} },
    { name: 'GET public', method: 'GET', path: `/cards/${cardId}/public`, body: null },
    { name: 'GET preview', method: 'GET', path: `/cards/${cardId}/preview`, body: null },
  ];
  
  const allResponses = [];
  
  for (let i = 0; i < endpoints.length; i++) {
    const ep = endpoints[i];
    const url = `${WH_BASE}/api/workflows/${TENANT_ID}/${WORKFLOW_ID}${ep.path}`;
    try {
      const opts = {
        method: ep.method,
        headers: authHeaders(),
      };
      if (ep.body !== null) opts.body = JSON.stringify(ep.body);
      
      const response = await fetch(url, opts);
      const text = await response.text();
      let data = {};
      try { data = JSON.parse(text); } catch {}
      
      const signingUrl = extractUrlFromResponse(data);
      console.log(`[WH] 🔍 TRY ${i + 1}: ${ep.method} ${ep.name} → HTTP ${response.status}`);
      
      allResponses.push({ try: i + 1, name: ep.name, status: response.status, data });
      
      if (response.ok && signingUrl) {
        console.log(`[WH] ✅ Found signing link at TRY ${i + 1} (${ep.name}): ${signingUrl}`);
        return { ok: true, signingLink: signingUrl, foundAt: `TRY ${i + 1} - ${ep.name}`, raw: data };
      }
    } catch (err) {
      console.error(`[WH] ❌ TRY ${i + 1} exception:`, err.message);
      allResponses.push({ try: i + 1, name: ep.name, error: err.message });
    }
  }
  
  console.log(`[WH] ❌ All ${endpoints.length} attempts failed. No signing link found.`);
  return { ok: false, signingLink: null, foundAt: null, allResponses };
};

async function generateApplicationId() {
  const year = new Date().getFullYear();
  const counter = await Counter.findOneAndUpdate(
    { name: 'applicationId' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const padded = String(counter.seq).padStart(5, '0');
  return `ABF-${year}-${padded}`;
}

async function updateWorkflowCard(cardId, formData) {
  try {
    await ensureValidToken();
    const url = `${WH_BASE}/api/workflows/${TENANT_ID}/${WORKFLOW_ID}/cards/${cardId}`;

    const s = (v) => (Array.isArray(v) ? v.join(', ') : (v ?? '').toString());
    const n = (v) => (v === '' || v == null ? 0 : Number(v) || 0);
    const d = (v) => v || null;

    const fatherEntry = (formData.familyMembers || []).find(m => m.member === 'Father');
    const spouseEntry = (formData.familyMembers || []).find(m => m.member === 'Spouse');
    const gu1 = (formData.guarantors || [])[0] || {};
    const gu2 = (formData.guarantors || [])[1] || {};

    const incometotal = ['incomeMainSalary','incomeOtherAllowances','incomeAdditional','incomeOther']
      .reduce((acc, k) => acc + (parseFloat(formData[k]) || 0), 0);
    const expensetotal = ['expenseHousehold','expensePersonal','expenseLoanLease','expenseCreditCard','expenseFuel','expenseOther']
      .reduce((acc, k) => acc + (parseFloat(formData[k]) || 0), 0);

    const payload = {
      title:                          s(formData.fullName),
      fullName:                       s(formData.fullName),
      nicNo:                          s(formData.nicNo),
      mobile1:                        s(formData.mobile1),
      mobile2:                        n(formData.mobile2),
      email:                          s(formData.email),
      emailaddress:                   s(formData.email),
      gender:                         s(formData.gender),
      residentialStatus:              s(formData.residentialStatus),
      permanentAddress:               s(formData.permanentAddress),
      mailingAddress:                 s(formData.mailingAddress),
      maritalStatus:                  s(formData.maritalStatus),
      passportNo:                     s(formData.passportNo),
      dateOfBirth:                    s(formData.dateOfBirth),
      nationality:                    s(formData.nationality),
      durationYears:                  n(formData.yearsAtAbove),
      monthsAtAbove:                  n(formData.monthsAtAbove),
      homeContact:                    s(formData.homeContact),
      officeContact:                  s(formData.officeContact),
      fax:                            s(formData.fax),
      fatherName:                     s(fatherEntry?.name    || ''),
      fatherContact:                  s(fatherEntry?.contact || ''),
      spouseName:                     s(spouseEntry?.name    || ''),
      spouseContact:                  s(spouseEntry?.contact || ''),
      familyContactNumber:            s(fatherEntry?.contact || spouseEntry?.contact || ''),
      noOfChildren:                   n(formData.noOfChildren),
      childAge1:                      n(formData.childAge1),
      childAge2:                      n(formData.childAge2),
      childAge3:                      n(formData.childAge3),
      totalDependants:                n(formData.totalDependants),
      qualifications:                 s(formData.qualifications),
      employerBusinessName:           s(formData.employerBusinessName),
      employerBusinessAddress:        s(formData.employerBusinessAddress),
      natureOfBusiness:               s(formData.natureOfBusiness),
      designationProfession:          s(formData.designationProfession),
      referenceTelephone:             s(formData.telephone),
      referenceDesignation:           s(formData.designation),
      employmentProfessionalBusiness: s(formData.employmentProfessionalBusiness),
      specificIncomeSource:           s(formData.specificIncomeSource),
      additionalIncomeSources:        s(formData.additionalIncomeSources),
      liableForTax:                   s(formData.liableForTax),
      taxFileNo:                      s(formData.taxFileNo),
      incomeMainSalary:               n(formData.incomeMainSalary),
      incomeOtherAllowances:          n(formData.incomeOtherAllowances),
      incomeAdditional:               n(formData.incomeAdditional),
      incomeOther:                    n(formData.incomeOther),
      incometotal,
      expenseHousehold:               n(formData.expenseHousehold),
      expensePersonal:                n(formData.expensePersonal),
      expenseLoanLease:               n(formData.expenseLoanLease),
      expenseCreditCard:              n(formData.expenseCreditCard),
      expenseFuel:                    n(formData.expenseFuel),
      expenseOther:                   n(formData.expenseOther),
      expensetotal,
      reference1Name:                 s(formData.reference1Name),
      reference1Profession:           s(formData.reference1Profession),
      reference1Contact:              s(formData.reference1Contact),
      reference2Name:                 s(formData.reference2Name),
      reference2Profession:           s(formData.reference2Profession),
      reference2Contact:              s(formData.reference2Contact),
      financialDetails:               s(formData.lifeInsurance),
      lifeInsuranceSpecify:           s(formData.lifeInsuranceSpecify),
      deposits:                       s(formData.deposits),
      depositsSpecify:                s(formData.depositsSpecify),
      preferredLanguage:              s(formData.preferredLanguage),
      fundSources:                    s(formData.fundSources),
      annualTurnoverIndividual:       s(formData.annualTurnoverIndividual),
      annualTurnoverBusiness:         s(formData.annualTurnoverBusiness),
      otherConnectedBusiness:         s(formData.otherConnectedBusiness),
      reasonForLoan:                  s(formData.reasonForLoan),
      withinBranchServiceArea:        s(formData.withinBranchServiceArea),
      ifNoReason:                     s(formData.ifNoReason),
      untitled2:                      s(formData.locationOfLeasedAsset),
      isPep:                          s(formData.isPEP),
      pepRelationship:                s(formData.pepRelationship),
      signatureName:                  s(formData.signatureName),
      signatureDate:                  d(formData.signatureDate),
      guarantorName1:                 s(gu1.fullName),
      guarantorRelationship1:         s(gu1.relationship),
      guarantorNIC1:                  s(gu1.nicBusinessRegNo),
      guarantorAge1:                  n(gu1.age),
      guarantorMonths1:               n(gu1.months),
      guarantorName2:                 s(gu2.fullName),
      guarantorRelationship2:         s(gu2.relationship),
      guarantorNIC2:                  s(gu2.nicBusinessRegNo),
      guarantorAge2:                  n(gu2.age),
      guarantorMonths2:               n(gu2.months),
    };

    const bankRows = (formData.bankDetails || []).filter(r =>
      (r.bank||'').trim() !== '' || (r.branch||'').trim() !== '' || (r.accountNo||'').trim() !== ''
    ).map(r => ({
      bank: s(r.bank), branch: s(r.branch), accountNo: s(r.accountNo),
      bankTel: s(r.telephone), officer: s(r.officer),
    }));
    if (bankRows.length > 0) payload.bankDetails = bankRows;

    const vehicleRows = (formData.vehicles || []).filter(r =>
      (r.makeModel||'').trim() !== '' || (r.regNo||'').trim() !== ''
    ).map(r => ({
      vehicleMakeModel: s(r.makeModel), vehicleValue: s(r.value),
      vehicleRegNo: s(r.regNo), vehicleOwnership: s(r.ownership),
    }));
    if (vehicleRows.length > 0) payload.vehicle = vehicleRows;

    const landRows = (formData.landBuildings || []).filter(r =>
      (r.location||'').trim() !== '' || (r.deedNo||'').trim() !== ''
    ).map(r => ({
      location: s(r.location), extent: s(r.extent),
      value: s(r.value), deedNo: s(r.deedNo), landMortgaged: s(r.mortgaged),
    }));
    if (landRows.length > 0) payload.land = landRows;

    const shareRows = (formData.shares || []).filter(r =>
      (r.institution||'').trim() !== ''
    ).map(r => ({
      institution: s(r.institution), shareCurrentValue: s(r.currentValue),
      NoOfShares: parseInt(r.noOfShares) || 0,
    }));
    if (shareRows.length > 0) payload.shares = shareRows;

    const facilityRows = (formData.facilityRequirements || []).filter(r =>
      (r.makeModel||'').trim() !== '' || (r.purpose||'').trim() !== ''
    ).map(r => ({
      facilityMakeModel: s(r.makeModel), facilityMakeModel4: s(r.status),
      facilityPurpose: s(r.purpose), facilitySupplier: s(r.supplier),
      facilityPeriod: s(r.period), facilityCost: s(r.cost),
    }));
    if (facilityRows.length > 0) payload.facility = facilityRows;

    const creditRows = (formData.creditFacilities || []).filter(r =>
      (r.institution||'').trim() !== '' || (r.approvedAmount||'').toString().trim() !== ''
    ).map(r => ({
      creditInstitution: s(r.institution), creditType: s(r.type),
      creditApprovedAmount: s(r.approvedAmount), creditTerm: s(r.term),
      creditMonthlyRepayment: s(r.monthlyRepayment), creditPresentOS: s(r.presentOS),
    }));
    if (creditRows.length > 0) payload.creditFacilities = creditRows;

    console.log(`[PUT] Updating WorkHub24 card ${cardId} for "${payload.title}"...`);

    // Try PUT first
    let res = await fetch(url, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    let text = await res.text();
    let data = {};
    try { data = JSON.parse(text); } catch {}

    console.log(`[PUT] WorkHub24 PUT HTTP ${res.status} for card ${cardId}`);

    if (res.ok) {
      return { ok: true, status: res.status, cardId, error: null, data };
    }

    // If 403, try PATCH
    if (res.status === 403) {
      console.log(`[PUT] PUT failed with 403, trying PATCH...`);
      res = await fetch(url, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      text = await res.text();
      try { data = JSON.parse(text); } catch {}

      console.log(`[PUT] WorkHub24 PATCH HTTP ${res.status} for card ${cardId}`);

      if (res.ok) {
        return { ok: true, status: res.status, cardId, error: null, data };
      }

      // If PATCH also 403, try changing stage to draft
      if (res.status === 403) {
        console.log(`[PUT] PATCH failed with 403, trying to change stage to draft...`);
        const stageUrl = `${url}/stage`;
        const stageRes = await fetch(stageUrl, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ stage: 'draft' }),
        });

        const stageText = await stageRes.text();
        console.log(`[PUT] Stage change HTTP ${stageRes.status}: ${stageText.slice(0, 100)}`);

        if (stageRes.ok) {
          // Retry PUT after stage change
          res = await fetch(url, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(payload),
          });

          text = await res.text();
          try { data = JSON.parse(text); } catch {}

          console.log(`[PUT] WorkHub24 PUT (after stage change) HTTP ${res.status} for card ${cardId}`);

          if (res.ok) {
            return { ok: true, status: res.status, cardId, error: null, data };
          }
        }
      }
    }

    // If all attempts failed, return partial success if 403, else error
    if (res.status === 403) {
      console.warn(`[PUT] Update blocked by workflow stage (403), proceeding with partial success`);
      return { ok: false, status: 403, cardId, error: 'Update blocked by workflow stage', partial: true };
    } else {
      console.error(`[PUT] Error: ${text.slice(0, 300)}`);
      return { ok: false, status: res.status, cardId, error: data?.message || `HTTP ${res.status}` };
    }

  } catch (err) {
    console.error(`[PUT] Exception: ${err.message}`);
    return { ok: false, status: 500, cardId, error: err.message };
  }
}

function buildWorkflowCardScalars(f) {
  const incometotal  = ["incomeMainSalary","incomeOtherAllowances","incomeAdditional","incomeOther"]
    .reduce((acc, k) => acc + (parseFloat(f[k]) || 0), 0);
  const expensetotal = ["expenseHousehold","expensePersonal","expenseLoanLease","expenseCreditCard","expenseFuel","expenseOther"]
    .reduce((acc, k) => acc + (parseFloat(f[k]) || 0), 0);

  const fatherEntry = (f.familyMembers || []).find(m => m.member === "Father");
  const spouseEntry = (f.familyMembers || []).find(m => m.member === "Spouse");
  const gu1 = (f.guarantors || [])[0] || {};
  const gu2 = (f.guarantors || [])[1] || {};

  const payload = {
    title:                          s(f.fullName),
    fullName:                       s(f.fullName),
    nicNo:                          s(f.nicNo),
    mobile1:                        s(f.mobile1),
    mobile2:                        n(f.mobile2),
    email:                          s(f.email),
    emailaddress:                   s(f.email),
    gender:                         s(f.gender),
    residentialStatus:              s(f.residentialStatus),
    permanentAddress:               s(f.permanentAddress),
    mailingAddress:                 s(f.mailingAddress),
    maritalStatus:                  s(f.maritalStatus),
    passportNo:                     s(f.passportNo),
    dateOfBirth:                    s(f.dateOfBirth),
    nationality:                    s(f.nationality),
    durationYears:                  n(f.yearsAtAbove),
    monthsAtAbove:                  n(f.monthsAtAbove),
    homeContact:                    s(f.homeContact),
    officeContact:                  s(f.officeContact),
    fax:                            s(f.fax),
    fatherName:                     s(fatherEntry?.name    || ""),
    fatherContact:                  s(fatherEntry?.contact || ""),
    spouseName:                     s(spouseEntry?.name    || ""),
    spouseContact:                  s(spouseEntry?.contact || ""),
    familyContactNumber:            s(fatherEntry?.contact || spouseEntry?.contact || ""),
    noOfChildren:                   n(f.noOfChildren),
    childAge1:                      n(f.childAge1),
    childAge2:                      n(f.childAge2),
    childAge3:                      n(f.childAge3),
    totalDependants:                n(f.totalDependants),
    qualifications:                 normalizeQualification(f.qualifications),
    employerBusinessName:           s(f.employerBusinessName),
    employerBusinessAddress:        s(f.employerBusinessAddress),
    natureOfBusiness:               s(f.natureOfBusiness),
    designationProfession:          s(f.designationProfession),
    referenceTelephone:             s(f.telephone),
    referenceDesignation:           s(f.designation),
    employmentProfessionalBusiness: s(f.employmentProfessionalBusiness),
    specificIncomeSource:           s(f.specificIncomeSource),
    additionalIncomeSources:        s(f.additionalIncomeSources),
    liableForTax:                   normalizeYesNo(f.liableForTax),
    taxFileNo:                      s(f.taxFileNo),
    incomeMainSalary:               n(f.incomeMainSalary),
    incomeOtherAllowances:          n(f.incomeOtherAllowances),
    incomeAdditional:               n(f.incomeAdditional),
    incomeOther:                    n(f.incomeOther),
    incometotal,
    expenseHousehold:               n(f.expenseHousehold),
    expensePersonal:                n(f.expensePersonal),
    expenseLoanLease:               n(f.expenseLoanLease),
    expenseCreditCard:              n(f.expenseCreditCard),
    expenseFuel:                    n(f.expenseFuel),
    expenseOther:                   n(f.expenseOther),
    expensetotal,
    reference1Name:                 s(f.reference1Name),
    reference1Profession:           s(f.reference1Profession),
    reference1Contact:              s(f.reference1Contact),
    reference2Name:                 s(f.reference2Name),
    reference2Profession:           s(f.reference2Profession),
    reference2Contact:              s(f.reference2Contact),
    financialDetails:               normalizeYesNo(f.lifeInsurance),
    lifeInsuranceSpecify:           s(f.lifeInsuranceSpecify),
    deposits:                       normalizeYesNo(f.deposits),
    depositsSpecify:                s(f.depositsSpecify),
    preferredLanguage:              s(f.preferredLanguage),
    fundSources:                    normalizeFundSources(f.fundSources),
    annualTurnoverIndividual:       normalizeTurnover(f.annualTurnoverIndividual, TURNOVER_INDIVIDUAL_MAP),
    annualTurnoverBusiness:         normalizeTurnover(f.annualTurnoverBusiness,   TURNOVER_BUSINESS_MAP),
    otherConnectedBusiness:         s(f.otherConnectedBusiness),
    reasonForLoan:                  s(f.reasonForLoan),
    withinBranchServiceArea:        normalizeBranchArea(f.withinBranchServiceArea),
    ifNoReason:                     s(f.ifNoReason),
    untitled2:                      s(f.locationOfLeasedAsset),
    isPep:                          s(f.isPEP),
    pepRelationship:                s(f.pepRelationship),
    signatureName:                  s(f.signatureName),
    signatureDate:                  d(f.signatureDate),
    guarantorName1:                 s(gu1.fullName),
    guarantorRelationship1:         s(gu1.relationship),
    guarantorNIC1:                  s(gu1.nicBusinessRegNo),
    guarantorAge1:                  n(gu1.age),
    guarantorMonths1:               n(gu1.months),
    guarantorName2:                 s(gu2.fullName),
    guarantorRelationship2:         s(gu2.relationship),
    guarantorNIC2:                  s(gu2.nicBusinessRegNo),
    guarantorAge2:                  n(gu2.age),
    guarantorMonths2:               n(gu2.months),
  };

  // bankDetails — schema field name: "bankDetails"
  const bankRows = (f.bankDetails || []).filter(r =>
    (r.bank||"").trim() !== "" || (r.branch||"").trim() !== "" ||
    (r.accountNo||"").trim() !== "" || (r.officer||"").trim() !== "" ||
    (r.telephone||"").trim() !== ""
  ).map(r => ({
    bank:      (r.bank      ||"").toString().trim(),
    branch:    (r.branch    ||"").toString().trim(),
    accountNo: (r.accountNo ||"").toString().trim(),
    bankTel:   (r.telephone ||"").toString().trim(),
    officer:   (r.officer   ||"").toString().trim(),
  }));
  if (bankRows.length > 0) payload.bankDetails = bankRows;

  // creditFacilities — schema field name: "creditFacilities"
  const creditRows = (f.creditFacilities || []).filter(r =>
    (r.institution||"").trim() !== "" || (r.type||"").trim() !== "" ||
    (r.approvedAmount||"").toString().trim() !== "" ||
    (r.term||"").trim() !== "" ||
    (r.monthlyRepayment||"").toString().trim() !== ""
  ).map(r => ({
    creditInstitution:      (r.institution     ||"").toString().trim(),
    creditType:             (r.type            ||"").toString().trim(),
    creditApprovedAmount:   (r.approvedAmount  ||"").toString().trim(),
    creditTerm:             (r.term            ||"").toString().trim(),
    creditMonthlyRepayment: (r.monthlyRepayment||"").toString().trim(),
    creditPresentOS:        (r.presentOS       ||"").toString().trim(),
  }));
  if (creditRows.length > 0) payload.creditFacilities = creditRows;

  // vehicle — schema field name: "vehicle"
  const vehicleRows = (f.vehicles || []).filter(r =>
    (r.makeModel||"").trim() !== "" || (r.regNo||"").trim() !== "" ||
    (r.value||"").toString().trim() !== "" || (r.ownership||"").trim() !== ""
  ).map(r => ({
    vehicleMakeModel: (r.makeModel ||"").toString().trim(),
    vehicleValue:     (r.value     ||"").toString().trim(),
    vehicleRegNo:     (r.regNo     ||"").toString().trim(),
    vehicleOwnership: (r.ownership ||"").toString().trim(),
  }));
  if (vehicleRows.length > 0) payload.vehicle = vehicleRows;

  // landBuildings must save to the WorkHub "extent" table
  const landRows = (f.landBuildings || []).filter(r =>
    (r.location||"").trim() !== "" || (r.extent||"").trim() !== "" ||
    (r.value||"").toString().trim() !== "" || (r.deedNo||"").trim() !== ""
  ).map(r => ({
    location:      (r.location  ||"").toString().trim(),
    extent:        (r.extent    ||"").toString().trim(),
    value:         (r.value     ||"").toString().trim(),
    deedNo:        (r.deedNo    ||"").toString().trim(),
    landMortgaged: (r.mortgaged ||"").toString().trim(),
  }));
  if (landRows.length > 0) {
    payload.land = landRows;
  }

  // shares — schema field name: "shares"
  const shareRows = (f.shares || []).filter(r =>
    (r.institution ||"").trim() !== "" ||
    (r.currentValue||"").toString().trim() !== "" ||
    (r.noOfShares  ||"").toString().trim() !== ""
  ).map(r => ({
    institution:       (r.institution  || "").toString().trim(),
    shareCurrentValue: (r.currentValue || "").toString().trim(),
    NoOfShares:        parseInt(r.noOfShares) || 0,
  }));
  if (shareRows.length > 0) {
    payload.shares = shareRows;
  }

  // facility — schema field name: "facility"
  const facilityRows = (f.facilityRequirements || []).filter(r =>
    (r.makeModel||"").trim() !== "" || (r.purpose||"").trim() !== "" ||
    (r.supplier ||"").trim() !== "" || (r.cost||"").toString().trim() !== ""
  ).map(r => ({
    facilityMakeModel:  (r.makeModel||"").toString().trim(),
    facilityMakeModel4: (r.status   ||"").toString().trim(),
    facilityPurpose:    (r.purpose  ||"").toString().trim(),
    facilitySupplier:   (r.supplier ||"").toString().trim(),
    facilityPeriod:     (r.period   ||"").toString().trim(),
    facilityCost:       (r.cost     ||"").toString().trim(),
  }));
  if (facilityRows.length > 0) payload.facility = facilityRows;

  console.log("[W] Sub-table row counts — bank:", bankRows.length,
    "credit:", creditRows.length, "vehicle:", vehicleRows.length,
    "land:", landRows.length, "shares:", shareRows.length,
    "facility:", facilityRows.length);
  if (bankRows.length > 0) console.log("[W] bankDetails payload:", JSON.stringify(bankRows));
  if (landRows.length > 0) console.log("[W] land payload:", JSON.stringify(landRows));
  if (shareRows.length > 0) console.log("[W] shares payload:", JSON.stringify(shareRows));

  return payload;
}





async function createWorkflowCard(formData) {
  try {
    await ensureValidToken();
    const url = `${WH_BASE}/api/workflows/${TENANT_ID}/${WORKFLOW_ID}/cards`;
    const payload = buildWorkflowCardScalars(formData);

    // Separate scalar fields from sub-table fields
    const SUB_TABLE_KEYS = ["bankDetails", "creditFacilities", "vehicle", "land", "shares", "facility"];
    const scalarPayload = {};
    const subTablePayload = {};

    for (const [key, val] of Object.entries(payload)) {
      if (SUB_TABLE_KEYS.includes(key)) {
        if (Array.isArray(val) && val.length > 0) {
          subTablePayload[key] = val;
        }
      } else {
        scalarPayload[key] = val;
      }
    }

    console.log(`[W] Creating card for "${payload.title}"...`);
    console.log(`[W] Sub-tables to save after create: ${Object.keys(subTablePayload).join(", ")}`);

    // Merge scalar and sub-table data — send arrays directly, no wrapper
    const fullPayload = { ...scalarPayload, ...subTablePayload };

    const res = await fetch(url, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(fullPayload),
    });
    const text = await res.text();
    let data = {};
    try { data = JSON.parse(text); } catch {}
    console.log(`<- Card create HTTP ${res.status}  id=${data?.id}`);

    if (!res.ok) {
      console.error(`<- Error body: ${text.slice(0, 500)}`);
      return { ok: false, status: res.status, cardId: null,
        error: data?.message || text || `HTTP ${res.status}`, subResults: {}, data };
    }

    const cardId = data?.id || null;
    if (!cardId) {
      return { ok: false, status: res.status, cardId: null,
        error: "Card created but missing cardId", subResults: {}, data };
    }

    const subResults = {};
    const fieldNameVariants = {
      bankDetails: ["bankDetails", "bank"],
      creditFacilities: ["creditFacilities"],
      vehicle: ["vehicle"],
      land: ["extent", "land"],
      shares: ["shares"],
      facility: ["facility"],
    };

    const patterns = [
      {
        name: "fieldsRows",
        url: (cardId, fieldName) => `${WH_BASE}/api/workflows/${TENANT_ID}/${WORKFLOW_ID}/cards/${cardId}/fields/${fieldName}/rows`,
        body: (row) => row,
      },
      {
        name: "fieldsRowsDetails",
        url: (cardId, fieldName) => `${WH_BASE}/api/workflows/${TENANT_ID}/${WORKFLOW_ID}/cards/${cardId}/fields/${fieldName}/rows`,
        body: (row) => ({ details: row }),
      },
      {
        name: "fieldsRowsRecord",
        url: (cardId, fieldName) => `${WH_BASE}/api/workflows/${TENANT_ID}/${WORKFLOW_ID}/cards/${cardId}/fields/${fieldName}/rows`,
        body: (row) => ({ record: row }),
      },
      {
        name: "tablesRows",
        url: (cardId, fieldName) => `${WH_BASE}/api/workflows/${TENANT_ID}/${WORKFLOW_ID}/cards/${cardId}/tables/${fieldName}/rows`,
        body: (row) => row,
      },
      {
        name: "cardRows",
        url: (cardId, fieldName) => `${WH_BASE}/api/workflows/${TENANT_ID}/${WORKFLOW_ID}/cards/${cardId}/rows`,
        body: (row, fieldName) => ({ [fieldName]: row }),
      },
    ];

    for (const [tableKey, tableRows] of Object.entries(subTablePayload)) {
      subResults[tableKey] = { rows: tableRows.length, attempts: [], ok: false, pattern: null, fieldName: null };
      console.log(`[W] Saving ${tableRows.length} rows for table ${tableKey}...`);

      const fieldNames = fieldNameVariants[tableKey] || [tableKey];
      let chosenPattern = null;
      let chosenFieldName = null;

      for (const fieldName of fieldNames) {
        if (chosenPattern) break;

        for (const pattern of patterns) {
          const row = tableRows[0];
          const body = pattern.body(row, fieldName);
          const endpoint = pattern.url(cardId, fieldName);
          const attemptRes = await fetch(endpoint, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(body),
          });
          const attemptText = await attemptRes.text();
          let attemptData = {};
          try { attemptData = JSON.parse(attemptText); } catch {}

          subResults[tableKey].attempts.push({
            pattern: pattern.name,
            fieldName,
            endpoint,
            row: 1,
            status: attemptRes.status,
            ok: attemptRes.ok,
            data: attemptData || attemptText,
          });

          console.log(`TRY TABLE FORMAT: ${fieldName} ${pattern.name} ${attemptRes.status} ${JSON.stringify(attemptData || attemptText).slice(0,250)}`);

          if (attemptRes.ok) {
            chosenPattern = pattern;
            chosenFieldName = fieldName;
            subResults[tableKey].pattern = pattern.name;
            subResults[tableKey].fieldName = fieldName;
            break;
          }
        }
      }

      if (chosenPattern && chosenFieldName) {
        let rowIndex = 0;
        for (const row of tableRows) {
          rowIndex += 1;
          const body = chosenPattern.body(row, chosenFieldName);
          const endpoint = chosenPattern.url(cardId, chosenFieldName);
          const rowRes = await fetch(endpoint, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(body),
          });
          const rowText = await rowRes.text();
          let rowData = {};
          try { rowData = JSON.parse(rowText); } catch {}
          subResults[tableKey].attempts.push({
            pattern: chosenPattern.name,
            fieldName: chosenFieldName,
            endpoint,
            row: rowIndex,
            status: rowRes.status,
            ok: rowRes.ok,
            data: rowData || rowText,
          });
          console.log(`TRY TABLE FORMAT: ${chosenFieldName} ${chosenPattern.name} row ${rowIndex} ${rowRes.status} ${JSON.stringify(rowData || rowText).slice(0,250)}`);
          if (!rowRes.ok) {
            console.error(`[W] ${tableKey} ${chosenFieldName} row ${rowIndex} failed: ${rowText}`);
          }
        }
        subResults[tableKey].ok = tableRows.every((_, index) => {
          const attempt = subResults[tableKey].attempts.find(a => a.row === index + 1 && a.pattern === chosenPattern.name && a.fieldName === chosenFieldName);
          return attempt ? attempt.ok : false;
        });
      } else {
        console.warn(`[W] No working endpoint found for ${tableKey}`);
      }
    }

    const cardGetUrl = `${WH_BASE}/api/workflows/${TENANT_ID}/${WORKFLOW_ID}/cards/${cardId}`;
    const cardGetRes = await fetch(cardGetUrl, { method: "GET", headers: authHeaders() });
    const cardGetText = await cardGetRes.text();
    let cardGetData = {};
    try { cardGetData = JSON.parse(cardGetText); } catch {}
    console.log("VERIFY TABLE:", {
      bankDetails: cardGetData.bankDetails,
      extent: cardGetData.extent,
      vehicle: cardGetData.vehicle,
      shares: cardGetData.shares,
      facility: cardGetData.facility,
      creditFacilities: cardGetData.creditFacilities,
    });

    return { ok: true, status: res.status, cardId, error: null, subResults, data };

  } catch (err) {
    return { ok: false, status: 500, cardId: null, error: err.message, subResults: {}, data: null };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DATASTORE HELPERS
// ─────────────────────────────────────────────────────────────────────────────
async function postRecord(store, record) {
  await ensureValidToken();
  const url = `${store.host}/api/datatables/${TENANT_ID}/${store.id}/records`;
  const res = await fetch(url, { method: "POST", headers: authHeaders(), body: JSON.stringify(record) });
  const text = await res.text();
  let data = {};
  try { data = JSON.parse(text); } catch {}
  return { ok: res.ok, status: res.status, data, text };
}

async function saveRows(store, rows, isEmpty, mapRow, label) {
  const results  = [];
  const nonEmpty = rows.filter(r => !isEmpty(r));
  await Promise.all(nonEmpty.map(async (row, i) => {
    const record = mapRow(row);
    const result = await postRecord(store, record);
    console.log(`   ${label} row ${i + 1}: HTTP ${result.status}`);
    results.push({
      rowIndex: i + 1, status: result.status, ok: result.ok,
      savedId:  result.ok ? (result.data.id || null) : null,
      error:    result.ok ? null : result.data,
    });
  }));
  return results;
}

async function saveApplicationToDatastore(formData) {
  const applicantName = (formData.fullName || "").toString().trim();
  const applicantNic  = (formData.nicNo    || "").toString().trim();
  const result = { ok: true, status: null, mainRecordId: null, errors: [], details: {} };

  const mainResult = await postRecord(DATASTORES.main, mapMainRecord(formData));
  result.status       = mainResult.status;
  result.mainRecordId = mainResult.data?.id || mainResult.data?.recordId || null;
  result.details.main = { ok: mainResult.ok, status: mainResult.status,
    recordId: result.mainRecordId, error: mainResult.ok ? null : mainResult.data };
  if (!mainResult.ok) {
    result.ok = false;
    result.errors.push({ section: "main", status: mainResult.status,
      error: mainResult.data, raw: mainResult.text });
  }

  const [bankR, creditR, vehicleR, shareR, facilityR, landR, guarantorR] = await Promise.all([
    saveRows(DATASTORES.bank,
      Array.isArray(formData.bankDetails) ? formData.bankDetails : [],
      r => !r.bank && !r.branch && !r.accountNo && !r.officer && !r.telephone,
      r => ({ fullName: applicantName, bank: s(r.bank), branch: s(r.branch),
               accountNo: s(r.accountNo), officer: s(r.officer), telephone: s(r.telephone) }),
      "Bank"),

    saveRows(DATASTORES.credit,
      Array.isArray(formData.creditFacilities) ? formData.creditFacilities : [],
      r => !r.institution && !r.type && !r.approvedAmount && !r.term && !r.monthlyRepayment,
      r => ({ fullName: applicantName, untitled: applicantNic,
               institution: s(r.institution), type: s(r.type),
               approvedAmount: s(r.approvedAmount), term: s(r.term),
               monthlyRepayment: parseFloat(r.monthlyRepayment) || 0,
               presentOS: s(r.presentOS), security: s(r.security) }),
      "Credit"),

    saveRows(DATASTORES.vehicle,
      Array.isArray(formData.vehicles) ? formData.vehicles : [],
      r => !r.makeModel && !r.regNo && !r.value && !r.ownership,
      r => ({ fullName: applicantName, makeModel: s(r.makeModel),
               regNo: s(r.regNo), value: parseFloat(r.value) || 0, ownership: s(r.ownership) }),
      "Vehicle"),

    saveRows(DATASTORES.shares,
      Array.isArray(formData.shares) ? formData.shares : [],
      r => !r.institution && !r.currentValue && !r.noOfShares,
      r => ({ fullName: applicantName, applicationId: applicantNic,
               institution: s(r.institution), currentValue: s(r.currentValue),
               noOfShares: parseInt(r.noOfShares) || 0 }),
      "Share"),

    saveRows(DATASTORES.facility,
      Array.isArray(formData.facilityRequirements) ? formData.facilityRequirements : [],
      r => !r.makeModel && !r.purpose && !r.supplier && !r.cost,
      r => ({ fullName: applicantName, makeModel: s(r.makeModel), status: s(r.status),
               purpose: s(r.purpose), supplier: s(r.supplier),
               period: s(r.period), cost: parseFloat(r.cost) || 0 }),
      "Facility"),

    saveRows(DATASTORES.land,
      Array.isArray(formData.landBuildings) ? formData.landBuildings : [],
      r => !r.location && !r.extent && !r.value && !r.deedNo,
      r => ({ fullName: applicantName, location: s(r.location), extent: s(r.extent),
               value: parseFloat(r.value) || 0, deedNo: s(r.deedNo),
               untitled: r.mortgaged === "Yes" }),
      "Land"),

    saveRows(DATASTORES.guarantor,
      Array.isArray(formData.guarantors) ? formData.guarantors : [],
      r => !r.fullName && !r.relationship && !r.nicBusinessRegNo,
      r => ({ fullName: s(r.fullName), untitled: applicantName,
               relationship: s(r.relationship), nicBusinessRegNo: s(r.nicBusinessRegNo),
               age: parseInt(r.age) || 0, months: parseInt(r.months) || 0 }),
      "Guarantor"),
  ]);

  [
    { name:"Bank",      result: bankR },
    { name:"Credit",    result: creditR },
    { name:"Vehicle",   result: vehicleR },
    { name:"Share",     result: shareR },
    { name:"Facility",  result: facilityR },
    { name:"Land",      result: landR },
    { name:"Guarantor", result: guarantorR },
  ].forEach(({ name, result: rows }) => {
    const failed = rows.filter(r => !r.ok);
    result.details[name.toLowerCase()] = {
      saved: rows.filter(r => r.ok).length, failed: failed.length, errors: failed };
    if (failed.length) { result.ok = false; result.errors.push({ section: name, errors: failed }); }
  });

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN RECORD MAPPER
// ─────────────────────────────────────────────────────────────────────────────
function mapMainRecord(f) {
  const fatherEntry = (f.familyMembers || []).find(m => m.member === "Father");
  const spouseEntry = (f.familyMembers || []).find(m => m.member === "Spouse");
  return {
    fullName:s(f.fullName), residentialStatus:s(f.residentialStatus),
    permanentAddress:s(f.permanentAddress), mailingAddress:s(f.mailingAddress),
    yearsAtAbove:n(f.yearsAtAbove), monthsAtAbove:n(f.monthsAtAbove),
    homeContact:s(f.homeContact), officeContact:s(f.officeContact),
    fax:s(f.fax), mobile1:s(f.mobile1), mobile2:s(f.mobile2), email:s(f.email),
    nicNo:s(f.nicNo), passportNo:s(f.passportNo), maritalStatus:s(f.maritalStatus),
    dateOfBirth:d(f.dateOfBirth), nationality:s(f.nationality), gender:s(f.gender),
    fatherName:s(fatherEntry?.name||""), fatherContact:s(fatherEntry?.contact||""),
    spouseName:s(spouseEntry?.name||""), spouseContact:s(spouseEntry?.contact||""),
    noOfChildren:n(f.noOfChildren), childAge1:n(f.childAge1),
    childAge2:n(f.childAge2), childAge3:n(f.childAge3), totalDependants:n(f.totalDependants),
    qualifications:s(f.qualifications),
    reference1Name:s(f.reference1Name), reference1Profession:s(f.reference1Profession),
    reference1Contact:s(f.reference1Contact),
    reference2Name:s(f.reference2Name), reference2Profession:s(f.reference2Profession),
    reference2Contact:s(f.reference2Contact),
    employerBusinessName:s(f.employerBusinessName), employerBusinessAddress:s(f.employerBusinessAddress),
    natureOfBusiness:s(f.natureOfBusiness), designationProfession:s(f.designationProfession),
    telephone:s(f.telephone), designation:s(f.designation),
    employmentProfessionalBusiness:s(f.employmentProfessionalBusiness),
    specificIncomeSource:s(f.specificIncomeSource), additionalIncomeSources:s(f.additionalIncomeSources),
    liableForTax:s(f.liableForTax), taxFileNo:s(f.taxFileNo),
    incomeMainSalary:n(f.incomeMainSalary), incomeOtherAllowances:n(f.incomeOtherAllowances),
    incomeAdditional:n(f.incomeAdditional), incomeOther:n(f.incomeOther),
    expenseHousehold:n(f.expenseHousehold), expensePersonal:n(f.expensePersonal),
    expenseLoanLease:n(f.expenseLoanLease), expenseCreditCard:n(f.expenseCreditCard),
    expenseFuel:n(f.expenseFuel), expenseOther:n(f.expenseOther),
    lifeInsurance:s(f.lifeInsurance), lifeInsuranceSpecify:s(f.lifeInsuranceSpecify),
    deposits:s(f.deposits), depositsSpecify:s(f.depositsSpecify),
    preferredLanguage:s(f.preferredLanguage), locationOfLeasedAsset:s(f.locationOfLeasedAsset),
    fundSources:s(f.fundSources), annualTurnoverIndividual:s(f.annualTurnoverIndividual),
    annualTurnoverBusiness:s(f.annualTurnoverBusiness), otherConnectedBusiness:s(f.otherConnectedBusiness),
    reasonForLoan:s(f.reasonForLoan), withinBranchServiceArea:s(f.withinBranchServiceArea),
    ifNoReason:s(f.ifNoReason), isPep:s(f.isPEP), pepRelationship:s(f.pepRelationship),
    signatureName:s(f.signatureName), signatureDate:d(f.signatureDate),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);

const debugTokenHandler = async (_req, res) => {
  const url = `${WH_BASE}/api/workflows/${TENANT_ID}/${WORKFLOW_ID}/cards`;
  try {
    await ensureValidToken();
    const r = await fetch(url, {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ title:"TOKEN CHECK", fullName:"TOKEN CHECK", nicNo:"TOKEN_CHECK" }),
    });
    const text = await r.text();
    let data = {}; try { data = JSON.parse(text); } catch {}
    const isValid = r.status === 200 || r.status === 201;
    return res.json({
      tokenCheck:   isValid ? "✅ Token VALID" : (r.status===401||r.status===403 ? "❌ Token EXPIRED — get fresh ACCESS token from WorkHub" : `⚠️ HTTP ${r.status}`),
      httpStatus:   r.status,
      cardCreated:  isValid ? `Yes — id=${data.id}` : "No",
      tokenPreview: currentAccessToken ? currentAccessToken.slice(0,40)+"..." : null,
    });
  } catch (err) { return res.status(500).json({ error: err.message }); }
};

app.get("/api/debug/token", debugTokenHandler);
app.post("/api/debug/token", debugTokenHandler);

app.get("/api/debug/refresh-token", async (_req, res) => {
  try {
    const result = await refreshAccessToken();
    const tokenInfo = getAccessTokenInfo();
    return res.json({
      success: true,
      accessTokenPreview: currentAccessToken ? currentAccessToken.slice(0,40) + "..." : null,
      refreshTokenConfigured: Boolean(currentRefreshToken),
      tokenType: tokenInfo?.type,
      tokenExp: tokenInfo?.expiresAt?.toISOString(),
      tokenExpired: tokenInfo ? Date.now() > tokenInfo.rawExpiry : null,
      rawResponse: result.raw,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/debug/card/:cardId", async (req, res) => {
  try {
    await ensureValidToken();
    const cardId = req.params.cardId;
    const url = `${WH_BASE}/api/workflows/${TENANT_ID}/${WORKFLOW_ID}/cards/${cardId}`;
    const result = await fetch(url, {
      method: "GET",
      headers: authHeaders(),
    });
    const text = await result.text();
    let data = {};
    try { data = JSON.parse(text); } catch {}
    
    return res.json({
      success: result.ok,
      status: result.status,
      cardId,
      data,
      rawResponse: text.slice(0, 1000),
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/debug/token-info", (_req, res) => {
  try {
    const parts = currentAccessToken.split('.');
    const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), 'base64').toString());
    return res.json({
      typ:      payload.typ,
      scope:    payload.scope,
      exp:      new Date(payload.exp * 1000).toISOString(),
      isExpired: Date.now() > payload.exp * 1000,
      uname:    payload.uname,
      refreshTokenConfigured: Boolean(currentRefreshToken),
      refreshTokenPreview: currentRefreshToken ? currentRefreshToken.slice(0,40) + "..." : null,
      warning:  payload.typ !== "access" 
        ? "❌ This is a REFRESH token — sub-tables will not save. Get ACCESS token from WorkHub profile." 
        : "✅ This is a valid ACCESS token",
    });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
});

// ── Full debug test ───────────────────────────────────────────────────────────
const debugWorkflowTestHandler = async (_req, res) => {
  const mockFormData = {
    fullName:"Debug Full Test", nicNo:"200012345678", passportNo:"N1234567",
    dateOfBirth:"1995-05-15", gender:"Male", maritalStatus:"Married",
    nationality:"Sri Lankan", residentialStatus:"Own",
    permanentAddress:"No 123, Galle Road, Colombo 03",
    mailingAddress:"No 123, Galle Road, Colombo 03",
    yearsAtAbove:2, monthsAtAbove:6,
    homeContact:"0112345678", officeContact:"0118765432",
    fax:"0110000000", mobile1:"0771234567", mobile2:"0771234568",
    email:"test@gmail.com",
    familyMembers:[
      { member:"Father", name:"Father Name", contact:"0771111111" },
      { member:"Spouse", name:"Spouse Name", contact:"0772222222" },
    ],
    noOfChildren:2, childAge1:5, childAge2:8, childAge3:0, totalDependants:3,
    qualifications:["Graduate"],
    employerBusinessName:"ABC Pvt Ltd", employerBusinessAddress:"Colombo 07",
    natureOfBusiness:"IT", designationProfession:"Developer",
    telephone:"0112222222", designation:"Manager",
    employmentProfessionalBusiness:"Employment",
    specificIncomeSource:"Salary", additionalIncomeSources:"Freelancing",
    liableForTax:"Yes", taxFileNo:"TX12345",
    incomeMainSalary:100000, incomeOtherAllowances:20000,
    incomeAdditional:10000, incomeOther:5000,
    expenseHousehold:30000, expensePersonal:10000,
    expenseLoanLease:5000, expenseCreditCard:2000,
    expenseFuel:3000, expenseOther:2000,
    reference1Name:"Ref 1", reference1Profession:"Doctor", reference1Contact:"0771111111",
    reference2Name:"Ref 2", reference2Profession:"Engineer", reference2Contact:"0772222222",
    lifeInsurance:"Yes", lifeInsuranceSpecify:"LIC Policy",
    deposits:"No", depositsSpecify:"",
    preferredLanguage:"English", fundSources:["Salary"],
    annualTurnoverIndividual:"< 499,999", annualTurnoverBusiness:"< 4,999,999",
    otherConnectedBusiness:"None", reasonForLoan:"Vehicle Purchase",
    withinBranchServiceArea:"Yes", ifNoReason:"",
    locationOfLeasedAsset:"Colombo",
    isPEP:"No", pepRelationship:"",
    signatureName:"Debug Full Test", signatureDate:"2025-11-11",
    guarantors:[
      { fullName:"Guarantor One", relationship:"Friend", nicBusinessRegNo:"901234567V", age:35, months:12 },
      { fullName:"Guarantor Two", relationship:"Brother", nicBusinessRegNo:"921234567V", age:40, months:24 },
    ],
    bankDetails:[
      { bank:"Bank of Ceylon", branch:"Colombo", accountNo:"001234567", telephone:"0112345678", officer:"Mr. Silva" },
      { bank:"Hatton National Bank", branch:"Nugegoda", accountNo:"009876543", telephone:"0112987654", officer:"Ms. Perera" },
    ],
    creditFacilities:[
      { institution:"Peoples Bank", type:"Personal Loan", approvedAmount:"500000", term:"36", monthlyRepayment:"15000", presentOS:"300000" },
    ],
    vehicles:[
      { makeModel:"Toyota Aqua", value:"4500000", regNo:"CAR-1234", ownership:"Own" },
    ],
    landBuildings:[
      { location:"Colombo", extent:"10 perches", value:"5000000", deedNo:"D001", mortgaged:"No" },
    ],
    shares:[
      { institution:"CSE", currentValue:"100000", noOfShares:"500" },
    ],
    facilityRequirements:[
      { makeModel:"Toyota Axio", status:"New", purpose:"Personal Use", supplier:"Toyota Lanka", period:"60", cost:"3500000" },
    ],
  };

  const result = await createWorkflowCard(mockFormData);
  return res.json({
    result:     result.ok ? "✅ CARD + SUB-ROWS CREATED" : "❌ FAILED",
    cardId:     result.cardId,
    subResults: result.subResults,
    error:      result.error,
    tokenType:  parseJwtPayload(currentAccessToken)?.typ,
    tokenExp:   new Date(parseJwtPayload(currentAccessToken)?.exp * 1000).toISOString(),
    tokenExpired: Date.now() > parseJwtPayload(currentAccessToken)?.exp * 1000,
  });
};

app.get("/api/debug/workflow-test", debugWorkflowTestHandler);
app.post("/api/debug/workflow-test", debugWorkflowTestHandler);

// ── Dry-run ───────────────────────────────────────────────────────────────────
app.post("/api/debug/workflow-dryrun", async (req, res) => {
  try {
    const { formData } = req.body;
    if (!formData) return res.status(400).json({ error: "Missing formData" });
    const result = await createWorkflowCard(formData);
    return res.json({
      result:     result.ok ? "✅ CREATED" : "❌ FAILED",
      cardId:     result.cardId,
      subResults: result.subResults,
      error:      result.error,
    });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

app.get("/api/debug/subtable-test", async (_req, res) => {
  const testResults = {};

  // Test 1: Sub-table as nested array inside card creation payload
  const url = `https://app.workhub24.com/api/workflows/IJ7J6CWM2XUJKVLKL7HHOOCLPFMOWFWW/wb4c791a6a7/cards`;
  await ensureValidToken();
  
  // Attempt A: array of objects with field name as key
  const payloadA = {
    title: "SUBTABLE TEST A",
    fullName: "SUBTABLE TEST A",
    nicNo: "TEST_SUB_A",
    bankDetails: [
      {
        bank: "Test Bank",
        branch: "Test Branch",
        accountNo: "123456",
        bankTel: "0111234567",
        officer: "Test Officer"
      }
    ]
  };

  const resA = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
      "authorization": `Bearer ${currentAccessToken}`,
    },
    body: JSON.stringify(payloadA),
  });
  const textA = await resA.text();
  let dataA = {}; try { dataA = JSON.parse(textA); } catch {}
  testResults.attemptA_nestedArray = {
    status: resA.status,
    cardId: dataA?.id || null,
    response: dataA
  };

  // Attempt B: use "rows" wrapper
  const payloadB = {
    title: "SUBTABLE TEST B",
    fullName: "SUBTABLE TEST B",
    nicNo: "TEST_SUB_B",
    bankDetails: {
      rows: [
        {
          bank: "Test Bank",
          branch: "Test Branch",
          accountNo: "123456",
          bankTel: "0111234567",
          officer: "Test Officer"
        }
      ]
    }
  };

  const resB = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
      "authorization": `Bearer ${currentAccessToken}`,
    },
    body: JSON.stringify(payloadB),
  });
  const textB = await resB.text();
  let dataB = {}; try { dataB = JSON.parse(textB); } catch {}
  testResults.attemptB_rowsWrapper = {
    status: resB.status,
    cardId: dataB?.id || null,
    response: dataB
  };

  // Attempt C: if card A was created, try PATCH to update with sub-table
  if (testResults.attemptA_nestedArray.cardId) {
    const cardId = testResults.attemptA_nestedArray.cardId;
    const patchUrl = `https://app.workhub24.com/api/workflows/IJ7J6CWM2XUJKVLKL7HHOOCLPFMOWFWW/wb4c791a6a7/cards/${cardId}`;
    const resC = await fetch(patchUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
        "authorization": `Bearer ${currentAccessToken}`,
      },
      body: JSON.stringify({
        bankDetails: [
          {
            bank: "Test Bank PATCH",
            branch: "Test Branch",
            accountNo: "123456",
            bankTel: "0111234567",
            officer: "Test Officer"
          }
        ]
      }),
    });
    const textC = await resC.text();
    let dataC = {}; try { dataC = JSON.parse(textC); } catch {}
    testResults.attemptC_patchCard = {
      status: resC.status,
      cardId,
      response: dataC
    };
  }

  // Attempt D: POST to sub-row endpoint using card from attempt B
  if (testResults.attemptB_rowsWrapper.cardId) {
    const cardId = testResults.attemptB_rowsWrapper.cardId;
    const rowUrl = `https://app.workhub24.com/api/workflows/IJ7J6CWM2XUJKVLKL7HHOOCLPFMOWFWW/wb4c791a6a7/cards/${cardId}/fields/bankDetails/rows`;
    const resD = await fetch(rowUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
        "authorization": `Bearer ${currentAccessToken}`,
      },
      body: JSON.stringify({
        bank: "Test Bank ROW",
        branch: "Test Branch",
        accountNo: "123456",
        bankTel: "0111234567",
        officer: "Test Officer"
      }),
    });
    const textD = await resD.text();
    let dataD = {}; try { dataD = JSON.parse(textD); } catch {}
    testResults.attemptD_postSubRow = {
      status: resD.status,
      cardId,
      url: rowUrl,
      response: dataD
    };
  }

  return res.json(testResults);
});

app.get("/api/debug/find-subtable-api", async (_req, res) => {
  const cardId = 311; // use an existing card id from previous tests
  const testRow = {
    bank: "Test Bank",
    branch: "Colombo",
    accountNo: "123456789",
    bankTel: "0112345678",
    officer: "Mr Silva"
  };
  const results = {};

  await ensureValidToken();
  const headers = {
    "Content-Type": "application/json",
    "accept": "application/json",
    "authorization": `Bearer ${currentAccessToken}`,
  };

  try {
    const r = await fetch(`https://app.workhub24.com/api/workflows/${TENANT_ID}/${WORKFLOW_ID}/cards/${cardId}/fields/bankDetails/rows`, {
      method: "POST", headers, body: JSON.stringify(testRow)
    });
    results.pattern1_fieldsRows = { status: r.status, body: await r.text() };
  } catch (e) { results.pattern1_fieldsRows = { error: e.message }; }

  try {
    const r = await fetch(`https://app.workhub24.com/api/workflows/${TENANT_ID}/${WORKFLOW_ID}/cards/${cardId}/subtables/bankDetails`, {
      method: "POST", headers, body: JSON.stringify(testRow)
    });
    results.pattern2_subtables = { status: r.status, body: await r.text() };
  } catch (e) { results.pattern2_subtables = { error: e.message }; }

  try {
    const r = await fetch(`https://app.workhub24.com/api/workflows/${TENANT_ID}/${WORKFLOW_ID}/cards/${cardId}/rows/bankDetails`, {
      method: "POST", headers, body: JSON.stringify(testRow)
    });
    results.pattern3_rows = { status: r.status, body: await r.text() };
  } catch (e) { results.pattern3_rows = { error: e.message }; }

  try {
    const r = await fetch(`https://app.workhub24.com/api/workflows/${TENANT_ID}/${WORKFLOW_ID}/cards/${cardId}`, {
      method: "PUT", headers, body: JSON.stringify({ bankDetails: [testRow] })
    });
    results.pattern4_put = { status: r.status, body: await r.text() };
  } catch (e) { results.pattern4_put = { error: e.message }; }

  try {
    const r = await fetch(`https://app.workhub24.com/api/workflows/${TENANT_ID}/${WORKFLOW_ID}/cards/${cardId}/fields/bankDetails`, {
      method: "POST", headers, body: JSON.stringify({ rows: [testRow] })
    });
    results.pattern5_fieldsPost = { status: r.status, body: await r.text() };
  } catch (e) { results.pattern5_fieldsPost = { error: e.message }; }

  try {
    const r = await fetch(`https://app.workhub24.com/api/workflows/${TENANT_ID}/${WORKFLOW_ID}/cards/${cardId}`, {
      method: "PATCH", headers, body: JSON.stringify({ bankDetails: [testRow] })
    });
    results.pattern6_patch = { status: r.status, body: await r.text() };
  } catch (e) { results.pattern6_patch = { error: e.message }; }

  try {
    const r = await fetch(`https://app.workhub24.com/api/workflows/${TENANT_ID}/${WORKFLOW_ID}/cards/${cardId}/fields/bankDetails/rows`, {
      method: "POST", headers, body: JSON.stringify({ row: testRow })
    });
    results.pattern7_wrappedRow = { status: r.status, body: await r.text() };
  } catch (e) { results.pattern7_wrappedRow = { error: e.message }; }

  try {
    const r = await fetch(`https://app.workhub24.com/api/workflows/${TENANT_ID}/${WORKFLOW_ID}/cards/${cardId}/fields/bankDetails/rows`, {
      method: "POST", headers, body: JSON.stringify({ data: testRow })
    });
    results.pattern8_dataWrapper = { status: r.status, body: await r.text() };
  } catch (e) { results.pattern8_dataWrapper = { error: e.message }; }

  try {
    const r = await fetch(`https://app.workhub24.com/api/datatables/${TENANT_ID}/ONXWFXRLEFOMTFY3I2F4GRKO7L5UNWAHJ252ZGNC/records`, {
      method: "POST", headers, body: JSON.stringify({ 
        fullName: "Test From Debug",
        bank: "Test Bank",
        branch: "Colombo", 
        accountNo: "123456789",
        officer: "Mr Silva",
        telephone: "0112345678"
      })
    });
    results.pattern9_datastoreBank = { status: r.status, body: await r.text() };
  } catch (e) { results.pattern9_datastoreBank = { error: e.message }; }

  return res.json(results);
});

app.get("/api/debug/test-field-names", async (_req, res) => {
  // 1. POST to create card with ALL sub-tables inline
  const createUrl = `${WH_BASE}/api/workflows/${TENANT_ID}/${WORKFLOW_ID}/cards`;
  const createBody = {
    title: "INLINE FULL TEST",
    fullName: "INLINE FULL TEST", 
    nicNo: "INLINE_FULL_001",
    bankDetails: [
      { bank: "Test Bank", branch: "Colombo", accountNo: "123456", 
        bankTel: "0112345678", officer: "Mr Silva" }
    ],
    creditFacilities: [
      { creditInstitution: "Peoples Bank", creditType: "Personal Loan",
        creditApprovedAmount: "500000", creditTerm: "36",
        creditMonthlyRepayment: "15000", creditPresentOS: "300000" }
    ],
    vehicle: [
      { vehicleMakeModel: "Toyota Aqua", vehicleValue: "4500000",
        vehicleRegNo: "CAR-1234", vehicleOwnership: "Own" }
    ],
    extent: [
      { location: "Colombo", extent: "10 perches", value: "5000000",
        deedNo: "D001", landMortgaged: "No" }
    ],
    shares: [
      {
        institution: "CSE",
        shareCurrentValue: "100000",
        NoOfShares: "500",
        noOfShares: "500",
        "column_363": "500",
        numberOfShares: "500",
        no_of_shares: "500"
      }
    ],
    facility: [
      { facilityMakeModel: "Toyota Axio", facilityMakeModel4: "New",
        facilityPurpose: "Personal", facilitySupplier: "Toyota Lanka",
        facilityPeriod: "60", facilityCost: "3500000", facilityTotalCost: 3500000 }
    ]
  };
  await ensureValidToken();
  const createRes = await fetch(createUrl, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(createBody),
  });
  const createRaw = await createRes.text();
  let createData;
  try {
    createData = JSON.parse(createRaw);
  } catch (e) {
    return res.json({ error: "Failed to parse create response", createRaw });
  }
  const createStatus = createRes.status;
  const cardId = createData.id;

  // 2. Wait 500ms
  await new Promise(resolve => setTimeout(resolve, 500));

  // 3. GET the card back
  const getUrl = `${WH_BASE}/api/workflows/${TENANT_ID}/${WORKFLOW_ID}/cards/${cardId}`;
  const getRes = await fetch(getUrl, {
    method: "GET",
    headers: authHeaders(),
  });
  const cardRaw = await getRes.text();
  let card;
  try {
    card = JSON.parse(cardRaw);
  } catch (e) {
    return res.json({ error: "Failed to parse card response", cardRaw });
  }

  // 4. Return
  return res.json({
    createStatus,
    cardId,
    createRaw,
    tokenScope: parseJwtPayload(currentAccessToken)?.scope,
    tokenType: parseJwtPayload(currentAccessToken)?.typ,
    cardAfter: {
      bankDetails: card.bankDetails,
      creditFacilities: card.creditFacilities,
      vehicle: card.vehicle,
      extent: card.extent,
      shares: card.shares,
      facility: card.facility,
    }
  });
});

// ── MAIN SUBMIT ───────────────────────────────────────────────────────────────
app.post("/api/submit-application", async (req, res) => {
  try {
    const formData = req.body.formData || req.body;
    if (!formData || !formData.fullName)
      return res.status(400).json({ success: false, message: "Missing formData" });

    console.log("\n=== SUBMIT APPLICATION ===");
    console.log(`fullName: ${formData.fullName}`);
    console.log(`bankDetails: ${(formData.bankDetails||[]).length} rows`);
    console.log(`creditFacilities: ${(formData.creditFacilities||[]).length} rows`);
    console.log(`vehicles: ${(formData.vehicles||[]).length} rows`);
    console.log(`landBuildings: ${(formData.landBuildings||[]).length} rows`);
    console.log(`shares: ${(formData.shares||[]).length} rows`);
    console.log(`facilityRequirements: ${(formData.facilityRequirements||[]).length} rows`);
    console.log(`guarantors: ${(formData.guarantors||[]).length} rows`);

    const [datastoreResult, workflowCardResult] = await Promise.all([
      saveApplicationToDatastore(formData),
      createWorkflowCard(formData),
    ]);

    // Save to MongoDB with unique applicationId and workhubCardId
    let mongoSaveResult = { ok: false, id: null, applicationId: null, error: null };
    try {
      const applicationId = await generateApplicationId();
      const workhubCardId = workflowCardResult.ok ? workflowCardResult.cardId : null;
      const mongoDoc = new Application({
        ...formData,
        applicationId,
        workhubCardId,
        submittedAt: new Date(),
      });
      const savedDoc = await mongoDoc.save();
      mongoSaveResult = {
        ok: true,
        id: savedDoc._id,
        applicationId: savedDoc.applicationId,
        workhubCardId: savedDoc.workhubCardId,
        error: null,
      };
      console.log('✅ MongoDB saved | applicationId:', savedDoc.applicationId, '| workhubCardId:', savedDoc.workhubCardId);
    } catch (mongoErr) {
      mongoSaveResult = { ok: false, id: null, applicationId: null, error: mongoErr.message };
      console.error('❌ MongoDB save error:', mongoErr.message);
    }

    console.log("DATASTORE:", JSON.stringify(datastoreResult, null, 2));
    console.log("WORKFLOW:",  JSON.stringify(workflowCardResult, null, 2));

    // ── Get WorkHub24 signing link ──────────────────────────────────────────
    let signingLinkResult = { ok: false, signingLink: null, foundAt: null };
    if (workflowCardResult.ok && workflowCardResult.cardId) {
      signingLinkResult = await getWorkHub24FormLink(workflowCardResult.cardId);
    }
    // ────────────────────────────────────────────────────────────────────────

    return res.json({
      success: datastoreResult.ok || workflowCardResult.ok || mongoSaveResult.ok,
      applicationId: mongoSaveResult.applicationId,
      mongoId: mongoSaveResult.id,
      workhubCardId: mongoSaveResult.workhubCardId,
      signingLink: signingLinkResult.signingLink,
      signingLinkFound: signingLinkResult.ok,
      signingLinkSource: signingLinkResult.foundAt,
      datastore: {
        ok: datastoreResult.ok, status: datastoreResult.status,
        mainRecordId: datastoreResult.mainRecordId, errors: datastoreResult.errors,
      },
      workflowCard: {
        ok:     workflowCardResult.ok,
        status: workflowCardResult.status,
        cardId: workflowCardResult.cardId,
        error:  workflowCardResult.error,
      },
      mongodb: mongoSaveResult,
    });
  } catch (err) {
    console.error("Unhandled error:", err);
    return res.status(500).json({ success: false, message: "Internal server error",
      error: { message: err.message } });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// OTP / PRE-REGISTRATION
// ─────────────────────────────────────────────────────────────────────────────
const OTP_EXPIRY_SECONDS = 3 * 60;
const otpStore = new Map();

function normalizeMobileNumber(rawPhone) {
  const digits = rawPhone.toString().trim().replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("94")) return digits;
  if (digits.startsWith("0"))  return "94" + digits.slice(1);
  return "94" + digits;
}
function generateOtp() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}
setInterval(() => {
  const now = Math.floor(Date.now() / 1000);
  for (const [phone, entry] of otpStore.entries())
    if (entry.expiresAt <= now) otpStore.delete(phone);
}, 60 * 1000);

async function postOtpWorkflowCard(fullName, mobileNumber, nICNumber, otp) {
  await ensureValidToken();
  const url = `https://app.workhub24.com/api/workflows/${TENANT_ID}/w29f7c492bb/cards`;
  const res = await fetch(url, {
    method: "POST", headers: authHeaders(),
    body: JSON.stringify({ title: fullName, fullName, mobileNumber, nICNumber, otp }),
  });
  const text = await res.text();
  let data = {}; try { data = JSON.parse(text); } catch {}
  if (!res.ok) console.log(`OTP Workflow failed HTTP ${res.status}: ${text}`);
  return { ok: res.ok, status: res.status, data, text };
}

app.post("/api/pre-register", async (req, res) => {
  try {
    const { name, nicNo, phone } = req.body;
    if (!name || !nicNo || !phone)
      return res.status(400).json({ success: false, message: "Name, NIC, and phone are required" });
    const fullName     = name.toString().trim();
    const nICNumber    = nicNo.toString().trim();
    const mobileNumber = normalizeMobileNumber(phone);
    if (!mobileNumber)
      return res.status(400).json({ success: false, message: "Invalid phone number format" });
    const otp = generateOtp();
    otpStore.set(mobileNumber, { otp, name: fullName, nicNo: nICNumber, mobileNumber,
      expiresAt: Math.floor(Date.now() / 1000) + OTP_EXPIRY_SECONDS });
    console.log(`\nPre-reg: ${fullName} | ${nICNumber} | ${mobileNumber} | OTP: ${otp}`);
    await postOtpWorkflowCard(fullName, mobileNumber, nICNumber, otp);
    return res.json({ success: true, message: "OTP sent successfully. Please enter the code to verify." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
});

app.post("/api/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp)
      return res.status(400).json({ success: false, message: "Phone and OTP are required" });
    const mobileNumber = normalizeMobileNumber(phone);
    const entry = otpStore.get(mobileNumber);
    if (!entry)
      return res.status(400).json({ success: false, message: "Phone not registered. Please go back and submit your details first." });
    if (Math.floor(Date.now() / 1000) > entry.expiresAt) {
      otpStore.delete(mobileNumber);
      return res.status(400).json({ success: false, message: "OTP expired. Please request a new OTP." });
    }
    if (otp.toString().trim() !== entry.otp)
      return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
    otpStore.delete(mobileNumber);
    return res.json({ success: true, message: "OTP verified successfully",
      name: entry.name, nicNo: entry.nicNo, phone: entry.mobileNumber });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
});

// GET all applications from MongoDB (for testing)
app.get('/api/applications', async (_req, res) => {
  try {
    const docs = await Application.find({})
      .select('fullName nicNo email mobile1 submittedAt createdAt')
      .sort({ submittedAt: -1 })
      .limit(50);
    return res.json({ success: true, count: docs.length, applications: docs });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET single application by MongoDB _id
app.get('/api/applications/:id', async (req, res) => {
  try {
    const doc = await Application.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, error: 'Not found' });
    return res.json({ success: true, application: doc });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/workhub-trigger?applicationId=...&workhubCardId=...
app.get('/api/workhub-trigger', async (req, res) => {
  try {
    const applicationId = req.query.applicationId;
    const workhubCardId = req.query.workhubCardId;

    if (!applicationId || !workhubCardId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required query params applicationId and workhubCardId'
      });
    }

    const doc = await Application.findOne({
      applicationId: applicationId.toString().trim().toUpperCase(),
      workhubCardId: workhubCardId.toString().trim(),
    });

    if (!doc) {
      return res.status(404).json({ success: false, error: 'No application found matching both values' });
    }

    return res.json({
      success: true,
      applicationId: doc.applicationId,
      workhubCardId: doc.workhubCardId,
      application: doc,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/update/:applicationId — update an existing WorkHub24 card by stored cardId
app.put('/api/update/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const doc = await Application.findOne({ applicationId: applicationId.toUpperCase() });
    if (!doc) {
      return res.status(404).json({ success: false, error: `No application found with ID: ${applicationId}` });
    }
    if (!doc.workhubCardId) {
      return res.status(400).json({
        success: false,
        error: `Application ${applicationId} has no stored WorkHub24 cardId. Use /api/search/${applicationId} or /api/sync/${applicationId} first.`,
      });
    }

    console.log(`\n📤 PUT update request: ${applicationId} → WorkHub24 card ${doc.workhubCardId}`);
    const putResult = await updateWorkflowCard(doc.workhubCardId, doc.toObject());

    return res.json({
      success: putResult.ok,
      applicationId,
      workhubCardId: doc.workhubCardId,
      workHub24: {
        ok:     putResult.ok,
        status: putResult.status,
        cardId: putResult.cardId,
        error:  putResult.error,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH BY APPLICATION ID
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/search/:applicationId — search by unique ABF ID
app.get('/api/search/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    if (!applicationId || !applicationId.toUpperCase().startsWith('ABF-')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid application ID format. Must use ABF-YYYY-NNNNN'
      });
    }

    const doc = await Application.findOne({ applicationId: applicationId.toUpperCase() });
    if (!doc) {
      return res.status(404).json({ success: false, error: `No application found with ID: ${applicationId}` });
    }

    console.log(`\n🔍 Search hit: ${applicationId} | applicant: ${doc.fullName} | workhubCardId: ${doc.workhubCardId}`);
    return res.json({
      success: true,
      applicationId: doc.applicationId,
      workhubCardId: doc.workhubCardId,
      mongoId: doc._id,
      submittedAt: doc.submittedAt,
      application: doc,
    });
  } catch (err) {
    console.error('Search error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/search — search with query param: /api/search?id=ABF-2026-00001
app.get('/api/search', async (req, res) => {
  try {
    const { id, name, nic } = req.query;

    if (!id && !name && !nic) {
      return res.status(400).json({
        success: false,
        error: 'Provide at least one search param: id, name, or nic'
      });
    }

    const query = {};
    if (id)   query.applicationId = id.trim().toUpperCase();
    if (name) query.fullName = { $regex: name.trim(), $options: 'i' };
    if (nic)  query.nicNo = nic.trim();

    const docs = await Application.find(query)
      .sort({ submittedAt: -1 })
      .limit(10);

    if (docs.length === 0) {
      return res.status(404).json({ success: false, error: 'No applications found' });
    }

    console.log(`\n🔍 Search query: ${JSON.stringify(query)} → ${docs.length} result(s)`);

    return res.json({
      success: true,
      count: docs.length,
      applications: docs,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/sync/:applicationId — create a fresh WorkHub24 card from MongoDB data
app.post('/api/sync/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const doc = await Application.findOne({ applicationId: applicationId.toUpperCase() });
    if (!doc) {
      return res.status(404).json({ success: false, error: `Not found: ${applicationId}` });
    }

    console.log(`\n🔄 Sync (POST create): ${applicationId}`);
    const whResult = await createWorkflowCard(doc.toObject());
    if (whResult.ok && whResult.cardId) {
      await Application.findOneAndUpdate(
        { applicationId: applicationId.toUpperCase() },
        { workhubCardId: whResult.cardId }
      );
      console.log(`✅ Sync complete: saved new cardId ${whResult.cardId} to MongoDB`);
    }

    return res.json({
      success: whResult.ok,
      applicationId,
      workhubCardId: whResult.cardId,
      workHub24: { ok: whResult.ok, cardId: whResult.cardId, error: whResult.error },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/search/sync/:applicationId — manually re-sync a specific record to WorkHub24
app.post('/api/search/sync/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const doc = await Application.findOne({ applicationId });
    if (!doc) {
      return res.status(404).json({ success: false, error: `Not found: ${applicationId}` });
    }

    const whResult = await createWorkflowCard(doc.toObject());
    console.log(`🔄 Manual sync: ${applicationId} → WorkHub24 cardId=${whResult.cardId}`);

    return res.json({
      success: whResult.ok,
      applicationId,
      workHub24: { ok: whResult.ok, cardId: whResult.cardId, error: whResult.error },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// DEBUG ROUTES — Testing WorkHub24 signing link retrieval
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/debug/get-signing-link/:cardId — Test signing link retrieval
app.get('/api/debug/get-signing-link/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;
    if (!cardId) return res.status(400).json({ success: false, error: 'cardId required' });
    
    console.log(`\n[DEBUG] Testing signing link for cardId: ${cardId}`);
    const result = await getWorkHub24FormLink(cardId);
    
    return res.json({
      success: result.ok,
      cardId,
      signingLink: result.signingLink,
      foundAt: result.foundAt,
      allResponses: result.allResponses || []
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/debug/card-raw/:cardId — Get raw WorkHub24 card data
app.get('/api/debug/card-raw/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;
    if (!cardId) return res.status(400).json({ success: false, error: 'cardId required' });
    
    await ensureValidToken();
    const url = `${WH_BASE}/api/workflows/${TENANT_ID}/${WORKFLOW_ID}/cards/${cardId}`;
    
    console.log(`\n[DEBUG] Fetching raw card data for cardId: ${cardId}`);
    const response = await fetch(url, { method: 'GET', headers: authHeaders() });
    const data = await response.json().catch(() => ({}));
    
    return res.json({
      success: response.ok,
      cardId,
      status: response.status,
      data: data
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/customer/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;

    // STEP 1 + 2: MongoDB lookup
    const doc = await Application.findOne({
      applicationId: applicationId.toUpperCase()
    });

    if (!doc) {
      return res.status(404).json({
        success: false,
        step: 'mongodb_lookup',
        error: `No application found with ID: ${applicationId}`
      });
    }

    console.log(`\n[CUSTOMER] ===== START =====`);
    console.log(`[CUSTOMER] applicationId : ${doc.applicationId}`);
    console.log(`[CUSTOMER] workhubCardId : ${doc.workhubCardId}`);
    console.log(`[CUSTOMER] fullName      : ${doc.fullName}`);
    console.log(`[CUSTOMER] nicNo         : ${doc.nicNo}`);
    console.log(`[CUSTOMER] email         : ${doc.email}`);
    console.log(`[CUSTOMER] mobile1       : ${doc.mobile1}`);

    // STEP 3: Check workhubCardId
    if (!doc.workhubCardId) {
      return res.status(400).json({
        success: false,
        step: 'workhub_card_check',
        error: `Application ${applicationId} has no WorkHub24 card ID stored in MongoDB. Submit the application first.`,
        customer: {
          applicationId: doc.applicationId,
          fullName: doc.fullName,
          nicNo: doc.nicNo,
          email: doc.email,
          mobile1: doc.mobile1
        }
      });
    }

    // STEP 4: Ensure token valid
    await ensureValidToken();

    // STEP 5: Build customer payload from MongoDB document
    const customerPayload = {
      title:                   doc.fullName || '',
      fullName:                doc.fullName || '',
      nicNo:                   doc.nicNo || '',
      mobile1:                 doc.mobile1 || '',
      mobile2:                 doc.mobile2 || '',
      email:                   doc.email || '',
      emailaddress:            doc.email || '',
      gender:                  doc.gender || '',
      dateOfBirth:             doc.dateOfBirth || '',
      nationality:             doc.nationality || '',
      maritalStatus:           doc.maritalStatus || '',
      passportNo:              doc.passportNo || '',
      residentialStatus:       doc.residentialStatus || '',
      permanentAddress:        doc.permanentAddress || '',
      mailingAddress:          doc.mailingAddress || '',
      homeContact:             doc.homeContact || '',
      officeContact:           doc.officeContact || '',
      fax:                     doc.fax || '',
      employerBusinessName:    doc.employerBusinessName || '',
      employerBusinessAddress: doc.employerBusinessAddress || '',
      natureOfBusiness:        doc.natureOfBusiness || '',
      designationProfession:   doc.designationProfession || '',
      incomeMainSalary:        Number(doc.incomeMainSalary) || 0,
      incomeOtherAllowances:   Number(doc.incomeOtherAllowances) || 0,
      incomeAdditional:        Number(doc.incomeAdditional) || 0,
      incomeOther:             Number(doc.incomeOther) || 0,
      expenseHousehold:        Number(doc.expenseHousehold) || 0,
      expensePersonal:         Number(doc.expensePersonal) || 0,
      expenseLoanLease:        Number(doc.expenseLoanLease) || 0,
      expenseCreditCard:       Number(doc.expenseCreditCard) || 0,
      expenseFuel:             Number(doc.expenseFuel) || 0,
      expenseOther:            Number(doc.expenseOther) || 0,
      reasonForLoan:           doc.reasonForLoan || '',
      preferredLanguage:       doc.preferredLanguage || '',
      signatureName:           doc.signatureName || '',
      signatureDate:           doc.signatureDate || '',
      isPep:                   doc.isPEP || '',
      applicationId:           doc.applicationId || ''
    };

    // STEP 6: Push data to WorkHub24 using existing updateWorkflowCard()
    console.log(`[CUSTOMER] Pushing data to WorkHub24 card ${doc.workhubCardId}...`);

    const updateResult = await updateWorkflowCard(doc.workhubCardId, doc.toObject());
    console.log(`[CUSTOMER] WorkHub24 update → HTTP ${updateResult.status}`);

    let updateWarning = null;
    if (!updateResult.ok) {
      if (updateResult.status === 403) {
        console.warn(`[CUSTOMER] WorkHub24 update blocked (403), proceeding with Stella Sign`);
        updateWarning = 'Data push blocked by workflow stage, proceeding with signing';
      } else {
        console.error(`[CUSTOMER] WorkHub24 update failed: ${updateResult.error}`);
        return res.status(502).json({
          success: false,
          step: 'workhub_data_push',
          error: `Failed to push data to WorkHub24. ${updateResult.error}`,
          customer: {
            applicationId: doc.applicationId,
            fullName: doc.fullName,
            workhubCardId: doc.workhubCardId
          }
        });
      }
    }

    const updateRes = { ok: updateResult.ok };
    if (updateResult.ok) {
      console.log(`[CUSTOMER] ✅ Data pushed to WorkHub24 successfully`);
    }

    // STEP 7: Trigger Stella Sign action
    const ACTION_ID = process.env.WORKHUB24_SIGN_ACTION_ID;

    if (!ACTION_ID) {
      return res.status(500).json({
        success: false,
        step: 'sign_action_trigger',
        error: 'WORKHUB24_SIGN_ACTION_ID is not set in .env',
        customer: {
          applicationId: doc.applicationId,
          fullName: doc.fullName,
          workhubCardId: doc.workhubCardId
        }
      });
    }

    const actionUrl = `${WH_BASE}/api/workflows/${TENANT_ID}/${WORKFLOW_ID}/cards/${doc.workhubCardId}/actions/${ACTION_ID}/execute`;

    console.log(`[CUSTOMER] Triggering Stella Sign action...`);
    console.log(`[CUSTOMER] Action URL: ${actionUrl}`);

    let signingLink = null;
    let actionStatus = null;
    let actionRaw = null;

    for (const method of ['POST', 'GET']) {
      try {
        const opts = { method, headers: authHeaders() };
        if (method === 'POST') opts.body = JSON.stringify({});

        const actionRes = await fetch(actionUrl, opts);
        actionStatus = actionRes.status;
        actionRaw = await actionRes.text();

        let actionData = {};
        try { actionData = JSON.parse(actionRaw); } catch {}

        console.log(`[CUSTOMER] ${method} action → HTTP ${actionStatus}`);
        console.log(`[CUSTOMER] Action response: ${actionRaw.slice(0, 500)}`);

        signingLink = extractUrlFromResponse(actionData);
        if (!signingLink && actionData.data) signingLink = extractUrlFromResponse(actionData.data);
        if (!signingLink && actionData.result) signingLink = extractUrlFromResponse(actionData.result);
        if (!signingLink && actionData.response) signingLink = extractUrlFromResponse(actionData.response);
        if (!signingLink && actionData.output) signingLink = extractUrlFromResponse(actionData.output);

        if (actionRes.ok && signingLink) {
          console.log(`[CUSTOMER] ✅ Signing link found: ${signingLink}`);
          break;
        }

      } catch (err) {
        console.error(`[CUSTOMER] ${method} action error: ${err.message}`);
      }
    }

    // STEP 8: Return final response
    return res.json({
      success: true,
      applicationId: doc.applicationId,
      workhubCardId: doc.workhubCardId,
      signingLink: signingLink || null,
      signingLinkFound: Boolean(signingLink),
      customer: {
        fullName:             doc.fullName,
        nicNo:                doc.nicNo,
        email:                doc.email,
        mobile1:              doc.mobile1,
        dateOfBirth:          doc.dateOfBirth,
        gender:               doc.gender,
        nationality:          doc.nationality,
        permanentAddress:     doc.permanentAddress,
        employerBusinessName: doc.employerBusinessName,
        designationProfession:doc.designationProfession,
        reasonForLoan:        doc.reasonForLoan,
        preferredLanguage:    doc.preferredLanguage
      },
      steps: {
        mongodbLookup:        'success',
        workhubDataPush:      updateRes.ok ? 'success' : (updateResult.partial ? 'blocked' : 'failed'),
        stellaSignTrigger:    signingLink ? 'success' : 'no_link_returned'
      },
      warning: updateWarning,
      debug: {
        actionUrl:      actionUrl,
        actionStatus:   actionStatus,
        actionResponse: actionRaw ? actionRaw.slice(0, 500) : null
      }
    });

  } catch (err) {
    console.error('[CUSTOMER] Unhandled error:', err.message);
    return res.status(500).json({
      success: false,
      step: 'unhandled',
      error: err.message
    });
  }
});

module.exports = app;
if (process.env.NODE_ENV !== "production") {
  const startServer = (port) => {
    const server = app.listen(port, () => {
      console.log(`\nAbans Finance backend → http://localhost:${port}`);
    });
    
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.warn(`⚠️ Port ${port} is in use. Trying port ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error("Server error:", err);
        process.exit(1);
      }
    });
  };
  
  startServer(PORT);
}