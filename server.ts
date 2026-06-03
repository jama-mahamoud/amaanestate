import express from "express";
import path from "path";
import dotenv from "dotenv";
import http from "http";
import fs from "fs";
import { Resend } from 'resend';

// Load environment variables immediately
dotenv.config();

let resendClient: Resend | null = null;
function getResendClient() {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[WARN] RESEND_API_KEY environment variable is not defined.");
    }
    resendClient = new Resend(apiKey || "re_mock_key");
  }
  return resendClient;
}

// Critical Startup Diagnostics for Production
console.log("=== BACKEND PRODUCTION INITIALIZATION START ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("VERCEL runtime:", !!process.env.VERCEL);
console.log("GEMINI KEY EXISTS:", !!process.env.GEMINI_API_KEY);
if (process.env.GEMINI_API_KEY) {
  console.log("GEMINI KEY LENGTH:", process.env.GEMINI_API_KEY.length);
  console.log("GEMINI KEY PREFIX:", process.env.GEMINI_API_KEY.substring(0, 5) + "...");
}
console.log("================================================");

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { GoogleGenAI } from "@google/genai";

export const app = express();

app.use(express.json());

// Universal WHATWG URL standardizer to bypass Node 22+ url.parse deprecation warning [DEP0169]
app.use((req, res, next) => {
  try {
    const rawUrl = req.url || "/";
    const parsed = new URL(rawUrl, "http://localhost");
    
    // Inject a pre-parsed representation designed to satisfy express internal and parent routing tools (parseurl package)
    // By matching the exact active URL string in '_raw' and 'href', parseurl returns this object without invocation of native url.parse.
    // @ts-ignore
    req._parsedUrl = {
      pathname: parsed.pathname,
      search: parsed.search || null,
      query: parsed.search ? parsed.search.slice(1) : null,
      href: rawUrl,
      path: rawUrl,
      _raw: rawUrl
    };

    const origUrl = req.originalUrl || rawUrl;
    const parsedOrig = new URL(origUrl, "http://localhost");
    // @ts-ignore
    req._parsedOriginalUrl = {
      pathname: parsedOrig.pathname,
      search: parsedOrig.search || null,
      query: parsedOrig.search ? parsedOrig.search.slice(1) : null,
      href: origUrl,
      path: origUrl,
      _raw: origUrl
    };
  } catch (err) {
    console.warn("[DEP0169 COMPAT] Failsafe parsing standardizer exception for URI:", req.url, err);
  }
  next();
});

// Vercel Internal URL Rewrite Adaptor Middleware
// Intercepts requests rewritten under Vercel serverless environment mapping them back to dynamic semantic Express routes.
app.use((req, res, next) => {
  if (req.path.startsWith('/api/index') && req.query.path) {
    const p = req.query.path as string;
    const id = req.query.id as string;
    
    console.log(`[VERCEL REWRITE REGISTRY] Intercepted path: ${req.path}, query path: ${p}, id: ${id}`);
    
    let adaptedUrl: string | null = null;
    if (p === 'news' && id) {
      adaptedUrl = `/news/${id}`;
    } else if (p === 'properties' && id) {
      adaptedUrl = `/properties/${id}`;
    } else if (p === 'vehicles' && id) {
      adaptedUrl = `/vehicles/${id}`;
    } else if (p === 'agents' && id) {
      adaptedUrl = `/agents/${id}`;
    } else if (p === 'sitemap.xml') {
      adaptedUrl = `/sitemap.xml`;
    } else if (p === 'robots.txt') {
      adaptedUrl = `/robots.txt`;
    }
    
    if (adaptedUrl) {
      req.url = adaptedUrl;
      req.originalUrl = adaptedUrl;
      try {
        const parsed = new URL(adaptedUrl, "http://localhost");
        // @ts-ignore
        req._parsedUrl = {
          pathname: parsed.pathname,
          search: parsed.search || null,
          query: parsed.search ? parsed.search.slice(1) : null,
          href: adaptedUrl,
          path: adaptedUrl,
          _raw: adaptedUrl
        };
        // @ts-ignore
        req._parsedOriginalUrl = {
          pathname: parsed.pathname,
          search: parsed.search || null,
          query: parsed.search ? parsed.search.slice(1) : null,
          href: adaptedUrl,
          path: adaptedUrl,
          _raw: adaptedUrl
        };
      } catch (err) {
        console.error("[VERCEL REWRITE ADAPTOR] Failed to regenerate compatible parsed URL:", err);
      }
      console.log(`[VERCEL REWRITE REGISTRY] Internal URI adapted to: ${req.url}`);
    }
  }
  next();
});

// Helper functions for dynamic sitemap and robots.txt generation
async function withTimeout<T>(promise: Promise<T>, ms: number, failureValue: T): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => {
      console.warn(`[TIMEOUT DETECTOR] Query timed out after ${ms}ms. Returning fallback.`);
      resolve(failureValue);
    }, ms);
  });
  
  // Attach direct error-capture payload immediately to prevent uncaught background promise rejections 
  // which crash Node/Vercel serverless execution loops on asynchronous post-timeout rejections.
  const safePromise = promise.catch((err) => {
    console.error("[BG PROMISE DETECT] Safe handled underlying asynchronous background query rejection:", err);
    return failureValue;
  });

  return Promise.race([
    safePromise.then((res) => {
      clearTimeout(timeoutId);
      return res;
    }),
    timeoutPromise
  ]);
}

async function generateSitemapXml() {
  const urls: Array<{ loc: string; changefreq: string; priority: string }> = [
    { loc: "https://www.amaanestate.com/", changefreq: "daily", priority: "1.0" },
    { loc: "https://www.amaanestate.com/cities", changefreq: "daily", priority: "0.8" },
    { loc: "https://www.amaanestate.com/properties", changefreq: "daily", priority: "0.9" },
    { loc: "https://www.amaanestate.com/vehicles", changefreq: "daily", priority: "0.9" },
    { loc: "https://www.amaanestate.com/agents", changefreq: "daily", priority: "0.8" },
    { loc: "https://www.amaanestate.com/news", changefreq: "daily", priority: "0.8" },
    { loc: "https://www.amaanestate.com/jobs", changefreq: "daily", priority: "0.8" },
    { loc: "https://www.amaanestate.com/about", changefreq: "monthly", priority: "0.7" },
    { loc: "https://www.amaanestate.com/contact", changefreq: "monthly", priority: "0.7" },
    { loc: "https://www.amaanestate.com/privacy", changefreq: "monthly", priority: "0.3" },
    { loc: "https://www.amaanestate.com/terms", changefreq: "monthly", priority: "0.3" },
    { loc: "https://www.amaanestate.com/disclaimer", changefreq: "monthly", priority: "0.3" },
  ];

  const citySlugs = [
    'mogadishu', 'hargeisa', 'garowe', 'bosaso', 'jigjiga', 'dire-dawa',
    'addis-ababa', 'kismayo', 'baidoa', 'beledweyne', 'galkayo', 'burao',
    'berbera', 'las-anod', 'jowhar', 'afgooye', 'godey', 'mekelle',
    'hawassa', 'adama', 'bahir-dar', 'merca'
  ];

  citySlugs.forEach(slug => {
    urls.push({
      loc: `https://www.amaanestate.com/cities/${slug}`,
      changefreq: "daily",
      priority: "0.8"
    });
  });

  const firestoreDb = getAdminDb();
  
  // CRITICAL: On Vercel, if process.env.FIREBASE_SERVICE_ACCOUNT is not defined, 
  // any attempt to connect to Cloud Firestore will hang/timeout and fail with 500 FUNCTION_INVOCATION_FAILED.
  // We explicitly bypass Firestore calls on Vercel if service account is not provided.
  const hasCredentials = !process.env.VERCEL || process.env.FIREBASE_SERVICE_ACCOUNT;

  if (firestoreDb && hasCredentials) {
    // 1. Fetch active properties and vehicles
    try {
      const listingsSnap = await withTimeout(
        firestoreDb.collection("listings")
          .where("status", "==", "active")
          .get(),
        2000,
        null
      );
      
      if (listingsSnap && listingsSnap.docs) {
        listingsSnap.docs.forEach((docSnapshot: any) => {
          const data = docSnapshot.data();
          const id = docSnapshot.id;
          if (data.category === "vehicle") {
            urls.push({
              loc: `https://www.amaanestate.com/vehicles/${id}`,
              changefreq: "weekly",
              priority: "0.7"
            });
          } else {
            urls.push({
              loc: `https://www.amaanestate.com/properties/${id}`,
              changefreq: "weekly",
              priority: "0.7"
            });
          }
        });
      }
    } catch (dbErr) {
      console.error("[SITEMAP] Error fetching listings:", dbErr);
    }

    // 2. Fetch approved brokers/agents
    try {
      const brokerSnap = await withTimeout(
        firestoreDb.collection("brokers")
          .where("status", "==", "approved")
          .get(),
        2000,
        null
      );
      
      if (brokerSnap && brokerSnap.docs) {
        brokerSnap.docs.forEach((docSnapshot: any) => {
          const id = docSnapshot.id;
          urls.push({
            loc: `https://www.amaanestate.com/agents/${id}`,
            changefreq: "weekly",
            priority: "0.6"
          });
        });
      }
    } catch (dbErr) {
      console.error("[SITEMAP] Error fetching brokers:", dbErr);
    }

    // 3. Fetch published articles
    try {
      const articleSnap = await withTimeout(
        firestoreDb.collection("articles")
          .where("published", "==", true)
          .get(),
        2000,
        null
      );
      
      if (articleSnap && articleSnap.docs) {
        articleSnap.docs.forEach((docSnapshot: any) => {
          const data = docSnapshot.data();
          let slug = data.slug;
          if (!slug && data.title) {
            slug = data.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
          }
          if (!slug) {
            slug = docSnapshot.id;
          }
          urls.push({
            loc: `https://www.amaanestate.com/news/${slug}`,
            changefreq: "weekly",
            priority: "0.6"
          });
        });
      }
    } catch (dbErr) {
      console.error("[SITEMAP] Error fetching articles:", dbErr);
    }

    // 4. Fetch approved/active jobs
    try {
      const jobsSnap = await withTimeout(
        firestoreDb.collection("jobs")
          .where("status", "==", "approved")
          .get(),
        2000,
        null
      );
      
      if (jobsSnap && jobsSnap.docs) {
        jobsSnap.docs.forEach((docSnapshot: any) => {
          const id = docSnapshot.id;
          urls.push({
            loc: `https://www.amaanestate.com/jobs?jobId=${id}`,
            changefreq: "weekly",
            priority: "0.6"
          });
        });
      }
    } catch (dbErr) {
      console.error("[SITEMAP] Error fetching jobs:", dbErr);
    }
  } else {
    console.log("[SITEMAP] Skipping Firestore dynamic sitemap URL queries to prevent connection hangs/timeouts due to missing credentials.");
  }

  // Build XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  urls.forEach(url => {
    xml += `  <url>\n`;
    xml += `    <loc>${url.loc}</loc>\n`;
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    xml += `    <priority>${url.priority}</priority>\n`;
    xml += `  </url>\n`;
  });
  
  xml += `</urlset>`;
  return { xml, count: urls.length };
}

function generateRobotsTxt() {
  return `User-agent: *\nAllow: /\n\nSitemap: https://www.amaanestate.com/sitemap.xml\n`;
}


// Initialize Gemini Client Lazily using secure system variable
let genAI: any = null;
function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY;
  
  if (!genAI) {
    if (!key) {
      console.error("[PROD] CRITICAL: GEMINI_API_KEY is null or undefined in backend.");
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }
    
    try {
      genAI = new GoogleGenAI({ 
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log("[PROD] Gemini AI client initialized successfully with aistudio-build UA.");
    } catch (err) {
      console.error("[PROD] Failed to initialize GoogleGenAI client:", err);
      throw err;
    }
  }
  return genAI;
}

// Fetch and compile database context in real-time
async function fetchDatabaseContext() {
  const firestoreDb = getAdminDb();
  if (!firestoreDb) {
    console.error("[PROD] Firestore Database connection failed - check firebase configuration.");
    return {
      listingsStr: "No active listings database connection.",
      prosStr: "No certified professional registry database connection.",
      articlesStr: "No news intelligence database connection.",
      brokersStr: "No active verified agents database connection."
    };
  }

  let listingsStr = "No listings active.";
  let prosStr = "No certified professionals active.";
  let articlesStr = "No news articles active.";
  let brokersStr = "No verified agents active.";

  try {
    const listingsSnap = await firestoreDb.collection("listings")
      .where("status", "==", "active")
      .limit(50)
      .get();
    
    if (!listingsSnap.empty) {
      const items = listingsSnap.docs.map(docSnapshot => {
        const d = docSnapshot.data();
        let detail = `ID: ${docSnapshot.id} | Title: ${d.title} | Type: ${d.listingType} | Cat: ${d.category} | Price: ${d.price} ${d.currency || "USD"} | City: ${d.city} | Location: ${d.location}`;
        if (d.category === "property") {
          detail += ` | Beds: ${d.beds || "N/A"}, Baths: ${d.baths || "N/A"}, Size: ${d.size || "N/A"}`;
        } else if (d.category === "vehicle") {
          detail += ` | Year: ${d.year || "N/A"}, Mileage: ${d.mileage || "N/A"}, Fuel: ${d.fuelType || "N/A"}, Trans: ${d.transmission || "N/A"}`;
        }
        if (d.isVerified) detail += ` [VERIFIED TRUSTED]`;
        if (d.isFeatured) detail += ` [FEATURED]`;
        return `- ${detail}`;
      });
      listingsStr = items.join("\n");
    }
  } catch (err) {
    console.error("[PROD] Error fetching listings context:", err);
  }

  try {
    const brokerSnap = await firestoreDb.collection("brokers")
      .where("status", "==", "approved")
      .limit(30)
      .get();
    
    if (!brokerSnap.empty) {
      const items = brokerSnap.docs.map(docSnapshot => {
        const d = docSnapshot.data();
        const type = d.type === 'agency' ? 'Verified Agency' : 'Verified Agent';
        return `- ID: ${docSnapshot.id} | Type: ${type} | Name: ${d.fullName} | City: ${d.city} | Specialization: ${d.propertySpecialization?.join(', ')}`;
      });
      brokersStr = items.join("\n");
    }
  } catch (err) {
    console.error("[PROD] Error fetching brokers context:", err);
  }

  try {
    const prosSnap = await firestoreDb.collection("professionalServices")
      .where("status", "==", "active")
      .limit(50)
      .get();
    
    if (!prosSnap.empty) {
      const items = prosSnap.docs.map(docSnapshot => {
        const d = docSnapshot.data();
        return `- ID/ProviderID: ${d.providerId || docSnapshot.id} (Category: ${d.category}) | Name: ${d.providerName || "Certified Specialist"} | Service Title: ${d.title} | City: ${d.city} | Details: ${d.description || ""}`;
      });
      prosStr = items.join("\n");
    }
  } catch (err) {
    console.error("[PROD] Error fetching professionals context:", err);
  }

  try {
    const articleSnap = await firestoreDb.collection("articles")
      .where("published", "==", true)
      .limit(30)
      .get();
    
    if (!articleSnap.empty) {
      const items = articleSnap.docs.map(docSnapshot => {
        const d = docSnapshot.data();
        return `- ID: ${docSnapshot.id} | Title: ${d.title} | Category: ${d.category} | Language: ${d.language} | Summary: ${d.summary}`;
      });
      articlesStr = items.join("\n");
    }
  } catch (err) {
    console.error("[PROD] Error fetching articles context:", err);
  }

  return { listingsStr, prosStr, articlesStr, brokersStr };
}

// API Routes
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  let contextData = {
    listingsStr: "No listings active.",
    prosStr: "No certified professionals active.",
    articlesStr: "No news articles active.",
    brokersStr: "No verified agents active."
  };

  try {
    contextData = await fetchDatabaseContext();
  } catch (dbErr) {
    console.error("Error pre-fetching firestore context:", dbErr);
  }

  let genAIClient: any;
  try {
    genAIClient = getGeminiClient();
  } catch (err: any) {
    console.error("[PROD] Gemini client initialization error:", err.message);
    return res.json({ text: "Waan ka xunnahay, adeegga Amaan AI hadda diyaar ma aha. Fadlan hubi in GEMINI_API_KEY la qabeeyay." });
  }

  try {
    const systemInstruction = `You are AmaanEstate AI Assistant, an intelligent real estate and city services assistant for AmaanEstate.

Your job is to help users find:
- Houses
- Apartments
- Rooms
- Hotels
- Commercial properties
- Land
- Offices
- Local services
- City information

You must behave like a professional, friendly, and smart property assistant.

========================
IMPORTANT RULES
========================

1. ONLY use the listings and data provided to you.
Do NOT invent fake properties, prices, locations, or contacts.

2. DO NOT exaggerate numeric fields.
- If a field looks unrealistic (e.g. floorsCount = 500), do NOT describe it literally in your conversational text (e.g., don't call it a "massive skyscraper" if it's a residential home). 
- Still SHOW the exact value in your summary/list without reinterpreting or modifying it.
- Never modify numbers. Always display exact values from the database.
- Only present data as-is and clarify when unsure.

3. If no matching property exists:
- politely explain that no exact result was found
- suggest similar alternatives if available
- ALWAYS use this exact fallback message if nothing is found: "Currently I could not find an exact match, but new listings are added regularly."

4. Always answer clearly and shortly.
Avoid long unnecessary explanations.

5. Understand user intent naturally.
Examples:
- "cheap house"
- "family apartment"
- "near university"
- "2 bedroom"
- "villa"
- "shop for rent"

6. Understand Somali and English language naturally.

7. Be friendly and professional.

8. Never mention technical details like:
- API
- database
- JSON
- Firebase
- Gemini

9. If user asks unrelated questions outside AmaanEstate services,
politely redirect them back to housing, hotels, or city services.

========================
AVAILABLE SERVICES
========================

You help users with:
- Property search
- Rental recommendations
- Hotel recommendations
- Area suggestions
- Local business discovery
- Real estate guidance

========================
PROPERTY RESPONSE STYLE
========================

When properties are found:
- briefly summarize results
- mention:
  - property type
  - city/location
  - price
  - important features
- Use Markdown links for every listing found:
  - Properties/Land/Rentals: /properties/[id]
  - Vehicles: /vehicles/[id]
  - Agents/Brokers: /brokers/[id]
  - Professionals: /professionals/[id]
  - News/Articles: /news/[id]

Example:

"I found 3 apartments in Jigjiga matching your request.
These options include family-friendly apartments with 2 bedrooms and modern facilities."

========================
AREA GUIDANCE
========================

If user asks about locations or neighborhoods:
- give short helpful guidance ONLY if information is available
- do not delete or invent false details

========================
HOTEL RESPONSE STYLE
========================

When recommending hotels:
- mention comfort level
- family suitability
- price range if available
- nearby landmarks if available

========================
TONE
========================

Your tone must be:
- modern
- helpful
- respectful
- confident
- concise

========================
LANGUAGE HANDLING
========================

If user speaks Somali:
respond in Somali.

If user speaks English:
respond in English.

If mixed:
respond naturally in mixed language.

========================
FAILURE HANDLING
========================

If listings are missing or incomplete:
say:
"Currently I could not find an exact match, but new listings are added regularly."

========================
BRAND IDENTITY
========================

You represent AmaanEstate.

AmaanEstate is a modern smart real estate and city services platform focused on helping people discover trusted housing, hotels, businesses, and opportunities.

Always maintain professionalism and trust.

--- LIVE CONTEXT DATA (USE THIS DATA TO ANSWER QUERIES) ---
DATABASE LIQUID ASSETS (PROPERTIES / LAND / RENTALS / VEHICLES):
${contextData.listingsStr}

CERTIFIED ACTIVE REGISTERED PROFESSIONALS (EXPERTS / SERVICES):
${contextData.prosStr}

VERIFIED ACTIVE AGENTS & AGENCIES (BROKERS):
${contextData.brokersStr}

LATEST PORTAL INTEL & ARTICLES:
${contextData.articlesStr}
----------------------------------`;

    const model = genAIClient.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: {
        role: "system",
        parts: [{ text: systemInstruction }]
      }
    });

    const chatSession = model.startChat({
      history: history?.map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text || h.content || "" }]
      })) || []
    });

    const result = await chatSession.sendMessage(message);
    const finalResponseText = result.response.text();
    res.json({ text: finalResponseText });
  } catch (error: any) {
    const errMsg = error.message || "Unknown API issue";
    const cleanedMsg = errMsg.replace(/AIzaSy[A-Za-z0-9_\-]{33}/g, "[REDACTED_API_KEY]");
    console.error("[PROD] AI Assistant API error:", cleanedMsg);
    res.json({ text: "Waan ka xunnahay, adeegga AI hadda wuu mashquulsan yahay. Fadlan dib iskugu day waxyar ka dib." });
  }
});

app.post("/api/contact", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required" });
  }
  try {
    const rc = getResendClient();
    await rc.emails.send({
      from: 'AmaanEstate <onboarding@resend.dev>', // Use verified domain later
      to: 'jamamahamoud01@farrmuu',
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
      `
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Resend error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Helper to fetch details for dynamic SEO tags from the firestore collection
async function getArticleMetadata(idOrSlug: string) {
  const firestoreDb = getAdminDb();
  if (!firestoreDb) {
    console.error("[SEO SERVER] No admin DB connection.");
    return null;
  }
  try {
    // Try Doc ID first with 1500ms timeout
    const docRef = firestoreDb.collection("articles").doc(idOrSlug);
    const docSnap = await withTimeout(docRef.get(), 1500, null as any);
    if (docSnap && docSnap.exists) {
      const data = docSnap.data();
      let slug = data.slug;
      if (!slug && data.title) {
        slug = data.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
      }
      if (!slug) {
        slug = docSnap.id;
      }
      return { id: docSnap.id, ...data, slug };
    }
    
    // Fallback: try by slug with 1500ms timeout
    const querySnap = await withTimeout(
      firestoreDb.collection("articles")
        .where("slug", "==", idOrSlug)
        .limit(1)
        .get(),
      1500,
      null as any
    );
    
    if (querySnap && !querySnap.empty) {
      const doc = querySnap.docs[0];
      const data = doc.data();
      let slug = data.slug;
      if (!slug && data.title) {
        slug = data.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
      }
      if (!slug) {
        slug = doc.id;
      }
      return { id: doc.id, ...data, slug };
    }
  } catch (error) {
    console.error("[SEO SERVER] Error fetching article by doc id or slug:", error);
  }
  return null;
}

async function getListingMetadata(id: string) {
  const firestoreDb = getAdminDb();
  if (!firestoreDb) return null;
  try {
    const docRef = firestoreDb.collection("listings").doc(id);
    const docSnap = await withTimeout(docRef.get(), 1500, null as any);
    if (docSnap && docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    }
  } catch (error) {
    console.error("[SEO SERVER] Error fetching listing metadata:", error);
  }
  return null;
}

async function getBrokerMetadata(id: string) {
  const firestoreDb = getAdminDb();
  if (!firestoreDb) return null;
  try {
    const docRef = firestoreDb.collection("brokers").doc(id);
    const docSnap = await withTimeout(docRef.get(), 1500, null as any);
    if (docSnap && docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    }
  } catch (error) {
    console.error("[SEO SERVER] Error fetching broker metadata:", error);
  }
  return null;
}

async function servePageWithMetadata(req: express.Request, res: express.Response, next: express.NextFunction, seoData: { title: string; description: string; imageUrl?: string; urlPath: string; type?: string }) {
  try {
    let templatePath = "";
    const searchPaths = [
      path.resolve(process.cwd(), 'dist', 'index.html'),
      path.resolve(process.cwd(), 'index.html'),
      path.resolve(__dirname, '..', 'dist', 'index.html'),
      path.resolve(__dirname, '..', 'index.html'),
      path.resolve(__dirname, 'index.html')
    ];
    
    for (const p of searchPaths) {
      if (fs.existsSync(p)) {
        templatePath = p;
        break;
      }
    }
    
    if (!templatePath) {
      return next();
    }
    
    let template = fs.readFileSync(templatePath, 'utf-8');
    
    if (process.env.NODE_ENV !== "production") {
      const vite = app.get('vite');
      if (vite) {
        template = await vite.transformIndexHtml(req.originalUrl, template);
      }
    }
    
    const title = seoData.title + " | AmaanEstate";
    const desc = seoData.description.substring(0, 160);
    const ogType = seoData.type || "website";
    let imageUrl = seoData.imageUrl;
    
    // Force absolute domain and HTTPS
    const host = 'www.amaanestate.com';
    const protocol = 'https';

    if (imageUrl) {
      // Ensure image is an absolute URL
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        const separatorPath = imageUrl.startsWith("/") ? "" : "/";
        imageUrl = `${protocol}://${host}${separatorPath}${imageUrl}`;
      } else if (imageUrl.startsWith('http://')) {
        imageUrl = imageUrl.replace(/^http:\/\//i, 'https://');
      }
      
      // Append cache buster to the image URL so CDNs/scrapers don't cache stale images
      const separator = imageUrl.includes('?') ? '&' : '?';
      imageUrl = `${imageUrl}${separator}v=${Date.now()}`;
    }
    const absolutePageUrl = `${protocol}://${host}${seoData.urlPath}`;
    
    // Clean old meta tags to prevent duplicates or interference
    template = template
      .replace(/<title>[^<]*<\/title>/gi, '')
      .replace(/<link[^>]*rel=["']?canonical["']?[^>]*>/gi, '')
      .replace(/<meta[^>]*name=["']?description["']?[^>]*>/gi, '')
      .replace(/<meta[^>]*property=["']?og:[^>]*>/gi, '')
      .replace(/<meta[^>]*name=["']?twitter:[^>]*>/gi, '')
      .replace(/<meta[^>]*property=["']?twitter:[^>]*>/gi, '');
      
    const imageTags = `
    <meta property="og:image" content="${imageUrl || `https://${host}/default-og-image.jpg`}" />
    <meta name="twitter:image" content="${imageUrl || `https://${host}/default-og-image.jpg`}" />
    `;

    const dynamicMetaTags = `
    <title>${title}</title>
    <meta name="description" content="${desc.replace(/"/g, '&quot;')}" />
    <meta property="og:site_name" content="AmaanEstate" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${desc.replace(/"/g, '&quot;')}" />
    <meta property="og:url" content="${absolutePageUrl}" />${imageTags}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta name="twitter:description" content="${desc.replace(/"/g, '&quot;')}" />
    <meta name="twitter:url" content="${absolutePageUrl}" />
    <link rel="canonical" href="${absolutePageUrl}" />
    `;
    
    template = template.replace(/<head>/i, `<head>\n${dynamicMetaTags}`);
    
    // Disable HTTP/CDN caching via response headers for correct dynamic previews
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    
    res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
  } catch (err) {
    console.error("[SEO SERVER] servePageWithMetadata failed:", err);
    // Instead of crashing the request, fall through to the SPA (next())
    // which will present the page correctly.
    next();
  }
}


async function startServer() {
  const PORT = 3000;

  // Vite middleware for development setup (moved up so we can reuse instance)
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
    app.set('vite', vite);
  }

  // XML Sitemap Endpoint
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const { xml } = await generateSitemapXml();
      res.header("Content-Type", "application/xml");
      res.send(xml);
    } catch (err) {
      console.error("[SEO SERVER] Sitemap generation error:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  // robots.txt Endpoint
  app.get("/robots.txt", (req, res) => {
    res.header("Content-Type", "text/plain");
    res.send(generateRobotsTxt());
  });

  // Dynamic SEO Middleware Interceptor for news articles
  app.get("/news/:id", async (req, res, next) => {
    const userAgent = req.headers["user-agent"] || "";
    const isBot = /facebookexternalhit|Twitterbot|WhatsApp|LinkedInBot|discordbot|TelegramBot|Slackbot/i.test(userAgent);
    const hasCredentials = !process.env.VERCEL || process.env.FIREBASE_SERVICE_ACCOUNT;
    
    let meta: any = null;
    if (hasCredentials) {
      try {
        meta = await getArticleMetadata(req.params.id);
      } catch (err) {
        console.error("[SEO SERVER] Error pre-fetching article metadata:", err);
      }
    }

    if (meta) {
      // If we have database metadata, always serve it
      const targetSlug = meta.slug || req.params.id;
      if (req.params.id !== targetSlug) {
        console.log(`[SEO SERVER] Redirecting 301 from /news/${req.params.id} to /news/${targetSlug}`);
        return res.redirect(301, `/news/${targetSlug}`);
      }

      const title = meta.title || "Latest News Article";
      const description = meta.summary || (meta.content ? (meta.content.substring(0, 160) + "...") : "Read the latest update on AmaanEstate.");
      
      // Resolve dynamic image with prioritized fallbacks
      let imageUrl: string | undefined = undefined;
      if (meta.socialImage && typeof meta.socialImage === 'string' && meta.socialImage.trim() !== '') {
        imageUrl = meta.socialImage.trim();
      } else if (meta.featuredImage && typeof meta.featuredImage === 'string' && meta.featuredImage.trim() !== '') {
        imageUrl = meta.featuredImage.trim();
      } else if (meta.gallery && Array.isArray(meta.gallery) && meta.gallery.length > 0) {
        const firstGallery = meta.gallery.find((g: any) => typeof g === 'string' && g.trim() !== '');
        if (firstGallery) {
          imageUrl = firstGallery.trim();
        }
      }
      
      if (!imageUrl) {
        imageUrl = '/house_luxury_icon.png';
      }

      return servePageWithMetadata(req, res, next, {
        title,
        description,
        imageUrl,
        urlPath: `/news/${targetSlug}`,
        type: 'article'
      });
    }

    // If metadata was not found in database (or database timed out / errored / credentials missing), but the request is from a scraper/bot:
    // Generate high-fidelity fallback SEO metadata dynamically based on the slug/parameters so that the bot
    // NEVER redirects, falls back to the homepage, or receives a blank preview.
    if (isBot) {
      const rawId = req.params.id;
      // Convert "amaan-estate-somalia" -> "Amaan Estate Somalia"
      const formattedTitle = rawId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      console.log(`[SEO SERVER] Generating on-the-fly fallback metadata for bot: ${userAgent}, slug: ${rawId}`);
      
      return servePageWithMetadata(req, res, next, {
        title: formattedTitle,
        description: `Read dynamic updates, current listings, and premium real estate news about ${formattedTitle} on AmaanEstate.`,
        imageUrl: '/house_luxury_icon.png',
        urlPath: `/news/${rawId}`,
        type: 'article'
      });
    }

    // Let regular human users load the dynamic React SPA layout router
    next();
  });

  // Dynamic SEO Middleware Interceptor for Properties
  app.get("/properties/:id", async (req, res, next) => {
    const hasCredentials = !process.env.VERCEL || process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!hasCredentials) {
      return next();
    }
    try {
      const meta = await getListingMetadata(req.params.id);
      if (meta) {
        const title = meta.title || "Premium Real Estate Property";
        const description = meta.description || `View features of this ${meta.category || "property"} in ${meta.city || "Somali Region"}.`;
        const imageUrl = (meta.images?.[0] && meta.images[0].trim() !== '') ? meta.images[0] : undefined;
        return servePageWithMetadata(req, res, next, {
          title,
          description,
          imageUrl,
          urlPath: `/properties/${req.params.id}`
        });
      }
    } catch (err) {
      console.error("[SEO SERVER] Error handling properties page metadata:", err);
    }
    next();
  });

  // Dynamic SEO Middleware Interceptor for Vehicles
  app.get("/vehicles/:id", async (req, res, next) => {
    const hasCredentials = !process.env.VERCEL || process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!hasCredentials) {
      return next();
    }
    try {
      const meta = await getListingMetadata(req.params.id);
      if (meta) {
        const title = meta.title || "Luxury Vehicle Rental";
        const description = meta.description || `View features of this vehicle/luxury hire in ${meta.city || "Somali Region"}.`;
        const imageUrl = (meta.images?.[0] && meta.images[0].trim() !== '') ? meta.images[0] : undefined;
        return servePageWithMetadata(req, res, next, {
          title,
          description,
          imageUrl,
          urlPath: `/vehicles/${req.params.id}`
        });
      }
    } catch (err) {
      console.error("[SEO SERVER] Error handling vehicles page metadata:", err);
    }
    next();
  });

  // Dynamic SEO Middleware Interceptor for Agents/Brokers
  app.get("/agents/:id", async (req, res, next) => {
    const hasCredentials = !process.env.VERCEL || process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!hasCredentials) {
      return next();
    }
    try {
      const meta = await getBrokerMetadata(req.params.id);
      if (meta) {
        const title = meta.fullName || "Certified Broker";
        const description = `Contact professional real estate specialist in ${meta.city || "Somali Region"}. Learn more details.`;
        const imageUrl = (meta.profilePhotoUrl && meta.profilePhotoUrl.trim() !== '') ? meta.profilePhotoUrl : ((meta.logo && meta.logo.trim() !== '') ? meta.logo : undefined);
        return servePageWithMetadata(req, res, next, {
          title,
          description,
          imageUrl,
          urlPath: `/agents/${req.params.id}`
        });
      }
    } catch (err) {
      console.error("[SEO SERVER] Error handling agents page metadata:", err);
    }
    next();
  });

  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    app.use("*", async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) return next();
      
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        const vite = app.get('vite');
        if (vite) {
          template = await vite.transformIndexHtml(url, template);
        }
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        const vite = app.get('vite');
        if (vite) {
          vite.ssrFixStacktrace(e);
        }
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", async (req, res) => {
      // Direct API requested but unmatched route path
      if (req.path.startsWith('/api') && !req.path.startsWith('/api/index')) {
        return res.status(404).json({
          error: "NotFound",
          message: `API endpoint '${req.path}' not found`,
          status: 404
        });
      }

      // Force serve metadata for bots on dynamic news routes
      const isBot = /facebookexternalhit|Twitterbot|WhatsApp|LinkedInBot|discordbot|TelegramBot|Slackbot/i.test(req.headers["user-agent"] || "");
      if (isBot && req.path.startsWith("/news/")) {
        const idOrSlug = req.path.split('/')[2];
        if (idOrSlug) {
          const meta = await getArticleMetadata(idOrSlug);
          const title = meta?.title || idOrSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          const description = meta?.summary || (meta?.content ? (meta.content.substring(0, 160) + "...") : `Read dynamic updates, current listings, and premium real estate news about ${title} on AmaanEstate.`);
          
          let imageUrl: string | undefined = undefined;
          if (meta) {
            if (meta.socialImage && typeof meta.socialImage === 'string' && meta.socialImage.trim() !== '') {
              imageUrl = meta.socialImage.trim();
            } else if (meta.featuredImage && typeof meta.featuredImage === 'string' && meta.featuredImage.trim() !== '') {
              imageUrl = meta.featuredImage.trim();
            } else if (meta.gallery && Array.isArray(meta.gallery) && meta.gallery.length > 0) {
              const firstGallery = meta.gallery.find((g: any) => typeof g === 'string' && g.trim() !== '');
              if (firstGallery) {
                imageUrl = firstGallery.trim();
              }
            }
          }
          
          if (!imageUrl) {
            imageUrl = '/house_luxury_icon.png';
          }

          return servePageWithMetadata(req, res, () => {}, {
            title,
            description,
            imageUrl,
            urlPath: `/news/${meta?.slug || idOrSlug}`,
            type: 'article'
          });
        }
      }

      // Find index.html in common build directories to serve client SPA
      let templatePath = "";
      const searchPaths = [
        path.resolve(process.cwd(), 'dist', 'index.html'),
        path.resolve(process.cwd(), 'index.html'),
        path.resolve(__dirname, '..', 'dist', 'index.html'),
        path.resolve(__dirname, '..', 'index.html'),
        path.resolve(__dirname, 'index.html')
      ];

      for (const p of searchPaths) {
        if (fs.existsSync(p)) {
          templatePath = p;
          break;
        }
      }

      if (templatePath) {
        res.sendFile(templatePath);
      } else {
        console.warn("[SEO SERVER] index.html not found in any common build directories at runtime. Rendering dynamic fallback shell.");
        res.status(200).set({ 'Content-Type': 'text/html' }).end(`<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AmaanEstate - Premium Portal</title>
    <meta name="description" content="A premium real estate and luxury vehicle portal." />
  </head>
  <body>
    <div id="root">Loading AmaanEstate Portal...</div>
    <script type="module" src="/assets/index.js"></script>
  </body>
</html>`);
      }
    });
  }

  // Global Express Error-Parser and Exception Shielding
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("[CRITICAL SHIELD] Caught unhandled exception inside Express route pipeline:", err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "An internal system exception occurred, registered under ID: " + Date.now(),
      status: 500
    });
  });

  // Only listen if not in serverless environment
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[PROD] Server running on http://localhost:${PORT}`);
    });
  }
}

// Start the server (registers all middleware, sitemap/robots endpoints, and dynamic SEO handlers)
startServer().catch(err => {
  console.error("[CRITICAL] Failed to start server:", err);
});

// Initialize Firebase Admin for backend privileged access
let adminDb: any = null;
function getAdminDb() {
  if (!adminDb) {
    try {
      const configPath = path.join(process.cwd(), "firebase-applet-config.json");
      let firebaseConfig: any = {};
      
      if (fs.existsSync(configPath)) {
        firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
      } else {
        console.warn("[PROD] firebase-applet-config.json not found. Trying Env config.");
        // Fallback or skip if not in AI Studio workspace
      }
      
      if (getApps().length === 0) {
        const saKey = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (saKey) {
          console.log("[PROD] Initializing Firebase Admin with Service Account from ENV.");
          initializeApp({
            credential: cert(JSON.parse(saKey)),
            projectId: firebaseConfig.projectId
          });
        } else {
          console.log("[PROD] Initializing Firebase Admin with Project ID: " + firebaseConfig.projectId);
          initializeApp({
            projectId: firebaseConfig.projectId
          });
        }
      }
      
      const dbId = firebaseConfig.firestoreDatabaseId;
      const finalDbId = (dbId && dbId !== '(default)' && dbId !== 'default') ? dbId : undefined;
      
      const apps = getApps();
      const appRef = apps.length > 0 ? apps[0] : undefined;
      adminDb = finalDbId ? getFirestore(appRef, finalDbId) : getFirestore();
      console.log("[PROD] Firebase Admin initialized for Project ID:", firebaseConfig.projectId || "unknown");
    } catch (err) {
      console.error("[PROD] Failed to initialize Firebase Admin:", err);
      return null;
    }
  }
  return adminDb;
}
