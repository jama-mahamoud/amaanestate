import express from "express";
import path from "path";
import dotenv from "dotenv";
import http from "http";

dotenv.config();

import { createServer as createViteServer } from "vite";
import fs from "fs";
import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, getDocs, query, where, limit } from "firebase/firestore";
import { GoogleGenAI } from "@google/genai";

export const app = express();

app.use(express.json());

// Initialize Gemini Client Lazily using secure system variable
let aiClient: any = null;
function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY;
  console.log("GEMINI KEY EXISTS:", !!key);
  console.log("AVAILABLE ENV KEYS:", Object.keys(process.env).filter(k => k.includes("KEY") || k.includes("GEMINI")));
  if (!aiClient) {
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// Fetch and compile database context in real-time
async function fetchDatabaseContext() {
  const firestoreDb = getDb();
  if (!firestoreDb) {
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
    const listRef = collection(firestoreDb, "listings");
    const listingsQ = query(listRef, where("status", "==", "active"), limit(50));
    const listingsSnap = await getDocs(listingsQ);
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
    console.error("Error fetching listings context in backend:", err);
  }

  try {
    const brokerRef = collection(firestoreDb, "brokers");
    const brokerQ = query(brokerRef, where("status", "==", "approved"), limit(30));
    const brokerSnap = await getDocs(brokerQ);
    if (!brokerSnap.empty) {
      const items = brokerSnap.docs.map(docSnapshot => {
        const d = docSnapshot.data();
        const type = d.type === 'agency' ? 'Verified Agency' : 'Verified Agent';
        return `- ID: ${docSnapshot.id} | Type: ${type} | Name: ${d.fullName} | City: ${d.city} | Specialization: ${d.propertySpecialization?.join(', ')}`;
      });
      brokersStr = items.join("\n");
    }
  } catch (err) {
    console.error("Error fetching brokers context in backend:", err);
  }

  try {
    const proRef = collection(firestoreDb, "professionalServices");
    const prosQ = query(proRef, where("status", "==", "active"), limit(50));
    const prosSnap = await getDocs(prosQ);
    if (!prosSnap.empty) {
      const items = prosSnap.docs.map(docSnapshot => {
        const d = docSnapshot.data();
        return `- ID/ProviderID: ${d.providerId || docSnapshot.id} (Category: ${d.category}) | Name: ${d.providerName || "Certified Specialist"} | Service Title: ${d.title} | City: ${d.city} | Details: ${d.description || ""}`;
      });
      prosStr = items.join("\n");
    }
  } catch (err) {
    console.error("Error fetching professionals context in backend:", err);
  }

  try {
    const articleRef = collection(firestoreDb, "articles");
    const articleQ = query(articleRef, where("published", "==", true), limit(30));
    const articleSnap = await getDocs(articleQ);
    if (!articleSnap.empty) {
      const items = articleSnap.docs.map(docSnapshot => {
        const d = docSnapshot.data();
        return `- ID: ${docSnapshot.id} | Title: ${d.title} | Category: ${d.category} | Language: ${d.language} | Summary: ${d.summary}`;
      });
      articlesStr = items.join("\n");
    }
  } catch (err) {
    console.error("Error fetching articles context in backend:", err);
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

  let ai;
  try {
    ai = getGeminiClient();
  } catch (err: any) {
    console.warn("Gemini client initialization failed:", err.message);
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
- do not invent false details

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

    // Map history to contents format: { role: 'user'|'model', parts: [{ text: string }] }
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      for (const turn of history) {
        if (turn.text) {
          contents.push({
            role: turn.role === "user" ? "user" : "model",
            parts: [{ text: turn.text }]
          });
        }
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.6,
      }
    });

    const finalResponseText = response.text || "I was unable to retrieve a response. Please try again.";
    res.json({ text: finalResponseText });
  } catch (error: any) {
    const errMsg = error.message || "Unknown API issue";
    const cleanedMsg = errMsg.replace(/AIzaSy[A-Za-z0-9_\-]{33}/g, "[REDACTED_API_KEY]");
    console.error("AI Assistant API error gracefully handled:", cleanedMsg);
    res.json({ text: "Waan ka xunnahay, cilad ayaa ku timid adeegga AI assistant. Fadlan dib iskugu day." });
  }
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  if (!process.env.VERCEL) {
    const server = http.createServer(app);

    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { 
          middlewareMode: true
        },
        appType: "custom",
      });
      app.use(vite.middlewares);

      app.use("*", async (req, res, next) => {
        if (req.originalUrl.startsWith('/api')) return next();
        
        try {
          const url = req.originalUrl;
          let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } catch (e: any) {
          vite.ssrFixStacktrace(e);
          next(e);
        }
      });
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } else {
    // Under Vercel environment where express is exported
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { 
          middlewareMode: true
        },
        appType: "custom",
      });
      app.use(vite.middlewares);

      app.use("*", async (req, res, next) => {
        if (req.originalUrl.startsWith('/api')) return next();
        
        try {
          const url = req.originalUrl;
          let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } catch (e: any) {
          vite.ssrFixStacktrace(e);
          next(e);
        }
      });
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }
}

// Initialize Firebase client for backend
let db: any = null;
function getDb() {
  if (!db) {
    try {
      const configPath = path.join(process.cwd(), "firebase-applet-config.json");
      if (!fs.existsSync(configPath)) {
        console.warn("firebase-applet-config.json not found. Database features will be mocked.");
        return null;
      }
      const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
      const app = initializeApp(firebaseConfig);
      
      // Use standard settings with long polling to avoid connection issues in some environments
      const dbId = (firebaseConfig as any).firestoreDatabaseId;
      const finalDbId = (dbId && dbId !== '(default)' && dbId !== 'default') ? dbId : undefined;
      
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
      }, finalDbId);
    } catch (err) {
      console.error("Failed to initialize Firebase in server:", err);
      return null;
    }
  }
  return db;
}

startServer();
