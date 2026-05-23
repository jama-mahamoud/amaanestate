import express from "express";
import path from "path";
import dotenv from "dotenv";
import http from "http";

dotenv.config();

import { createServer as createViteServer } from "vite";
import fs from "fs";
import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, getDocs, query, where, limit } from "firebase/firestore/lite";
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
    const systemInstruction = `You are the AmaanEstate AI Concierge, a prestigious, luxury multilingual real estate advisor and professional services concierge for the Somali Region.
Your primary objective is to dynamically assist users in discovering authentic, certified, active properties, rentals, vehicles, top verified agents/agencies, or top experts directly fetched from our live Firestore database.

--- LIVE CONTEXT DATA (DO NOT HALLUCINATE ITEMS BEYOND THIS LIST) ---
DATABASE LIQUID ASSETS (PROPERTIES / LAND / RENTALS / VEHICLES):
${contextData.listingsStr}

CERTIFIED ACTIVE REGISTERED PROFESSIONALS (EXPERTS / SERVICES):
${contextData.prosStr}

VERIFIED ACTIVE AGENTS & AGENCIES (BROKERS):
${contextData.brokersStr}

LATEST PORTAL INTEL & ARTICLES:
${contextData.articlesStr}
----------------------------------

--- LIVE DYNAMIC FILTERING & RELEVANCY RULE ---
Act as a premium directory index filter and a world-class luxury search concierge (like Zillow or Bayut AI).
- Retrieve ONLY matching listings based on user search criteria (location e.g. Jigjiga, listing category e.g. land/house, or rent vs sell intent).
- Do NOT output unrelated properties. Never dump the raw database if a user specifies a filters.
- If there are no listings matching their specific query, explain this elegantly in Somali or English, and suggest alternative active listings or invite them to browse all listings at /properties.

AI STYLE & MULTILINGUAL GRAMMAR RULES:
1. PURE SOMALI LANGUAGE PREFERENCE (SOMAALI PURE):
   When the user communicates in Somali, you MUST respond in elegant, natural, fluent, and professional Somali.
   Avoid word repetitions or empty conversational loops. Speak in beautiful, complete Somali sentences.
2. HYBRID MULTILINGUAL & ENGLISH SUPPORT:
   If the user queries in English or uses mixed Somali-English, adapt gracefully. Respond elegantly matching their tone.
3. CONVENIENT MARKDOWN LINKS:
   Always structure listings/pros with exact relative links using standard markdown! Example: "[Title](/properties/[id]) - Qiimaha: $500". Never fabricate links.
   - For Properties: /properties/[id]
   - For Vehicles: /vehicles/[id]
   - For Verified Agents/Agencies: /brokers/[id]
   - For Pros/Experts: /professionals/[providerId] or /services
   - For Articles: /news/[id]
4. FORBID REPETITION:
   Under no circumstances generate consecutive repetitive phrases or duplicate chunks. Keep it concise, luxury, and premium.`;

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
      model: "gemini-3.5-flash",
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
          middlewareMode: true,
          hmr: { server }
        },
        appType: "custom",
      });
      app.use(vite.middlewares);

      // Dedicated catch-all handler inside Express to read and transform index.html
      // This guarantees the @vitejs/plugin-react preamble is successfully detected
      app.get("*", async (req, res, next) => {
        const url = req.originalUrl.split("?")[0];
        if (url.startsWith("/api")) {
          return next();
        }
        
        // Exclude typical non-HTML static assets so they can fall through to Vite module handler or express.static
        const ext = path.extname(url).toLowerCase();
        const nonHtmlAssets = [".js", ".jsx", ".ts", ".tsx", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".json", ".map", ".wasm"];
        if (ext && nonHtmlAssets.includes(ext)) {
          return next();
        }

        try {
          let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
          template = await vite.transformIndexHtml(req.originalUrl, template);
          res.status(200).set({ "Content-Type": "text/html" }).end(template);
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

      // Dedicated catch-all handler for Vercel development mode
      app.get("*", async (req, res, next) => {
        const url = req.originalUrl.split("?")[0];
        if (url.startsWith("/api")) {
          return next();
        }
        
        // Exclude typical non-HTML static assets so they can fall through to Vite module handler or express.static
        const ext = path.extname(url).toLowerCase();
        const nonHtmlAssets = [".js", ".jsx", ".ts", ".tsx", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".json", ".map", ".wasm"];
        if (ext && nonHtmlAssets.includes(ext)) {
          return next();
        }

        try {
          let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
          template = await vite.transformIndexHtml(req.originalUrl, template);
          res.status(200).set({ "Content-Type": "text/html" }).end(template);
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
      db = initializeFirestore(app, {}, (firebaseConfig as any).firestoreDatabaseId);
    } catch (err) {
      console.error("Failed to initialize Firebase in server:", err);
      return null;
    }
  }
  return db;
}

startServer();
