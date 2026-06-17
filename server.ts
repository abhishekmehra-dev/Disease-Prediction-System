import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { DISEASES_DATA, fallbackLocalPredictor } from "./src/symptomsData";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Gemini client (with proper User-Agent header)
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
}) : null;

// Helper to strip markdown formatting blocks from Gemini JSON outputs
function cleanJsonText(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

// Endpoint to return all diseases with details for the information tab
app.get("/api/diseases", (req, res) => {
  res.json(Object.values(DISEASES_DATA));
});

// API endpoint for Disease Prediction
app.post("/api/predict", async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ error: "Please select at least one symptom." });
    }

    // Filter empty values
    const activeSymptoms = symptoms.filter((s: string) => s && s.trim() !== "");
    if (activeSymptoms.length === 0) {
      return res.status(400).json({ error: "Selected symptoms are invalid." });
    }

    console.log("Analyzing symptoms:", activeSymptoms);

    let predictedDiseaseName = "Common Cold"; // fallback
    let confidence = 85;
    let clinicalSummary = "";
    let severity: "Mild" | "Moderate" | "Critical" = "Mild";
    let recoveryTime = "5-7 Days";
    let differentials: { disease: string; probability: number }[] = [];

    // Check for high-risk warning active symptoms to calculate severity
    const criticalIndicators = ["chest_pain", "breathlessness", "coma", "stomach_bleeding", "altered_sensorium", "fast_heart_rate", "blood_in_sputum"];
    const moderateIndicators = ["high_fever", "vomiting", "weight_loss", "yellowish_skin", "dark_urine", "swelled_lymph_nodes", "dizziness"];
    
    const criticalCount = activeSymptoms.filter(x => criticalIndicators.includes(x)).length;
    const moderateCount = activeSymptoms.filter(x => moderateIndicators.includes(x)).length;

    if (criticalCount > 0) {
      severity = "Critical";
      recoveryTime = "Immediate Clinical Care Required";
    } else if (moderateCount >= 2) {
      severity = "Moderate";
      recoveryTime = "1 - 2 Weeks";
    } else {
      severity = "Mild";
      recoveryTime = "3 - 5 Days";
    }

    if (ai) {
      try {
        const prompt = `Symptoms selected by the patient: ${activeSymptoms.join(", ")}.
Based on the medical symptom classification schema, identify the most probable disease.
Please choose EXACTLY one disease from the following available catalog of matching diseases:
${Object.keys(DISEASES_DATA).join(", ")}.

Provide your response strictly in raw JSON format matching this schema:
{
  "disease": "Exact name of the disease from the list",
  "confidence": 92, // estimated confidence score in percent (integer) from 0 to 100 based on the relevance of selected symptoms
  "clinical_summary": "Short 2-3 sentence clinical explanation of the diagnosis and next steps",
  "differentials": [
    {"disease": "Alternative matching disease 1", "probability": 15},
    {"disease": "Alternative matching disease 2", "probability": 8}
  ],
  "reasoning": "Symptom matching justification"
}
Ensure you ONLY return raw valid JSON (no surrounding markdown code blocks, just pure parsable JSON text).`;

        const modelsToTry = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-1.5-flash"];
        let response = null;
        let lastError = null;

        for (const modelName of modelsToTry) {
          try {
            console.log(`Attempting diagnostic generation with model: ${modelName}`);
            response = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
              config: {
                responseMimeType: "application/json",
              }
            });
            if (response && response.text) {
              console.log(`Diagnostic prediction succeeded using model: ${modelName}`);
              break;
            }
          } catch (modelErr: any) {
            console.warn(`Model ${modelName} failed or busy:`, modelErr.message || modelErr);
            lastError = modelErr;
          }
        }

        if (response && response.text) {
          try {
            const rawText = cleanJsonText(response.text);
            const result = JSON.parse(rawText);
            
            if (result && typeof result === "object") {
              const resDiseaseName = result.disease || "";
              
              // Find case-insensitive exact or fallback match in DISEASES_DATA
              const closestMatch = Object.keys(DISEASES_DATA).find(
                d => d.toLowerCase() === resDiseaseName.toLowerCase()
              ) || fallbackLocalPredictor(activeSymptoms).disease;

              predictedDiseaseName = closestMatch;
              
              // Protect against non-numeric or NaN confidence levels
              const rawConfidence = Number(result.confidence);
              confidence = (!isNaN(rawConfidence) && rawConfidence > 0) 
                ? Math.max(30, Math.min(100, rawConfidence)) 
                : 85;

              clinicalSummary = result.clinical_summary || result.reasoning || "";
              
              if (result.differentials && Array.isArray(result.differentials)) {
                differentials = result.differentials
                  .filter((d: any) => d && typeof d === "object" && d.disease)
                  .map((d: any) => {
                    const diffMatch = Object.keys(DISEASES_DATA).find(
                      k => k.toLowerCase() === String(d.disease).toLowerCase()
                    );
                    const rawProb = Number(d.probability);
                    return {
                      disease: diffMatch || d.disease,
                      probability: (!isNaN(rawProb) && rawProb > 0) ? Math.max(5, Math.min(95, rawProb)) : 15
                    };
                  })
                  .filter(d => DISEASES_DATA[d.disease]);
              }
            } else {
              throw new Error("Returned JSON is not an object.");
            }
          } catch (jsonErr) {
            console.error("AI returned unparsable JSON, using local matching engine.", jsonErr, response.text);
            const localRes = fallbackLocalPredictor(activeSymptoms);
            predictedDiseaseName = localRes.disease;
            differentials = localRes.differentials;
          }
        } else {
          console.warn("No response text from any AI models. Using local matching engine.");
          const localRes = fallbackLocalPredictor(activeSymptoms);
          predictedDiseaseName = localRes.disease;
          differentials = localRes.differentials;
        }
      } catch (aiErr) {
        console.error("AI Generation failed, running local matching engine:", aiErr);
        const localRes = fallbackLocalPredictor(activeSymptoms);
        predictedDiseaseName = localRes.disease;
        differentials = localRes.differentials;
      }
    } else {
      const localRes = fallbackLocalPredictor(activeSymptoms);
      predictedDiseaseName = localRes.disease;
      differentials = localRes.differentials;
    }

    // If differentials is empty, populate with fallback variations
    if (differentials.length === 0) {
      const localRes = fallbackLocalPredictor(activeSymptoms);
      differentials = localRes.differentials;
    }

    // Resolve the final disease information
    const finalInfo = DISEASES_DATA[predictedDiseaseName] || DISEASES_DATA["Common Cold"];

    res.json({
      disease: finalInfo.disease,
      confidence: confidence,
      description: finalInfo.description,
      precautions: finalInfo.precautions,
      recommendedSpecialist: finalInfo.recommendedSpecialist,
      category: finalInfo.category,
      severity: severity,
      recoveryTime: recoveryTime,
      differentials: differentials.slice(0, 3),
      clinicalSummary: clinicalSummary || `Symptom-based matching algorithm successfully matched your inputs (${activeSymptoms.join(", ")}) with our database catalog.`
    });

  } catch (error: any) {
    console.error("Prediction endpoint failed:", error);
    res.status(500).json({ error: error.message || "Something went wrong during disease prediction." });
  }
});

// In-Memory Database for Contact Tickets & Login Audits
interface ContactTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
}

interface LoginEvent {
  id: string;
  email: string;
  role: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  status: "Success" | "Failed";
}

const contactTickets: ContactTicket[] = [
  {
    id: "TKT-001",
    name: "Abhishek Mehra",
    email: "abhishekmehra1931@gmail.com",
    subject: "Academic Integration Inquiry",
    message: "Need technical feedback on the disease classifier and how we can integrate additional diagnostic layers for the Viva presentation.",
    date: new Date(Date.now() - 3600000 * 2).toLocaleString("en-US") // 2 hours ago
  }
];

const loginEvents: LoginEvent[] = [
  {
    id: "LOG-001",
    email: "system.daemon@clinic.edu",
    role: "System Admin",
    timestamp: new Date(Date.now() - 3600000 * 4).toLocaleString("en-US"), // 4 hours ago
    ip: "127.0.0.1",
    userAgent: "Server Sandbox NodeDaemon",
    status: "Success"
  },
  {
    id: "LOG-002",
    email: "demophysician@clinical.org",
    role: "Medical Reviewer",
    timestamp: new Date(Date.now() - 3600000 * 3).toLocaleString("en-US"), // 3 hours ago
    ip: "192.168.1.15",
    userAgent: "Mozilla Chrome - WebKit",
    status: "Success"
  }
];

// Submit Contact Form API
app.post("/api/contact", (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All form fields are required." });
    }

    const newTicket: ContactTicket = {
      id: `TKT-${String(contactTickets.length + 1).padStart(3, "0")}`,
      name,
      email,
      subject,
      message,
      date: new Date().toLocaleString("en-US")
    };

    contactTickets.unshift(newTicket); // Add to the top of logs

    // Register an audit trace of this ticket submit
    const auditEvent: LoginEvent = {
      id: `LOG-${String(loginEvents.length + 1).padStart(3, "0")}`,
      email: email,
      role: "Guest User (Ticket Submitter)",
      timestamp: new Date().toLocaleString("en-US"),
      ip: req.ip || "Unknown IP",
      userAgent: req.headers["user-agent"] || "Web Browser Client",
      status: "Success"
    };
    loginEvents.unshift(auditEvent);

    res.status(201).json({ success: true, ticket: newTicket });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Could not register contact query." });
  }
});

// Handle Authentication / Logs Login Action
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, role, password } = req.body;
    if (!email || !role || !password) {
      return res.status(400).json({ error: "Email, role, and password are required." });
    }

    // Simple open password criteria or demonstration criteria: 
    // Permit any demo credentials to show easy accessibility while logging trace
    const isSuccess = password.length >= 4;

    const newEvent: LoginEvent = {
      id: `LOG-${String(loginEvents.length + 1).padStart(3, "0")}`,
      email: email,
      role: role || "Demonstration Clinician",
      timestamp: new Date().toLocaleString("en-US"),
      ip: req.ip || "localhost",
      userAgent: req.headers["user-agent"] || "Web Sandbox Agent",
      status: isSuccess ? "Success" : "Failed"
    };

    loginEvents.unshift(newEvent);

    if (!isSuccess) {
      return res.status(401).json({ error: "Invalid password key length. Ensure password is at least 4 chars." });
    }

    res.status(200).json({ 
      success: true, 
      session: {
        email,
        role,
        token: `demo-token-${Date.now()}`
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Auth dispatch failed." });
  }
});

// Get All Support Tickets & Login Logs
app.get("/api/admin/logs", (req, res) => {
  res.json({
    tickets: contactTickets,
    logs: loginEvents
  });
});

// Only bind server and use Vite in non-Vercel environment
if (process.env.VERCEL !== "1") {
  const startServer = async () => {
    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    const PORT = process.env.PORT || 3000;
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  };

  startServer();
}

export default app;
