// lib/google-sheets.ts
import { google } from "googleapis";

export async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  return sheets;
}

export async function readSheet(sheetName: string) {
  const sheets = await getGoogleSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${sheetName}!A1:Z100`, // Adjust range as needed
  });

  return response.data.values || [];
}

export async function readConfiguration() {
  const rows = await readSheet("CONFIGURATION");

  // Parse start date properly
  let startDate = rows[2]?.[1];

  if (startDate instanceof Date) {
    // Google Sheets returns a Date object - format it as YYYY-MM-DD in local time
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, "0");
    const day = String(startDate.getDate()).padStart(2, "0");
    startDate = `${year}-${month}-${day}`;
  } else if (typeof startDate === "string") {
    // Check if it's formatted like "5-Jan-2026 (Monday)" or similar
    // Try to parse it into YYYY-MM-DD format
    if (startDate.includes("-") && startDate.includes("(")) {
      // Extract just the date part before the parenthesis
      const datePart = startDate.split("(")[0].trim();

      // Parse formats like "5-Jan-2026" or "05-Jan-2026"
      const monthMap: Record<string, string> = {
        jan: "01",
        feb: "02",
        mar: "03",
        apr: "04",
        may: "05",
        jun: "06",
        jul: "07",
        aug: "08",
        sep: "09",
        oct: "10",
        nov: "11",
        dec: "12",
      };

      const parts = datePart.split("-");

      if (parts.length === 3) {
        const day = parts[0].padStart(2, "0");
        const monthStr = parts[1].toLowerCase();
        const year = parts[2];
        const month = monthMap[monthStr];

        if (month) {
          startDate = `${year}-${month}-${day}`;
        }
      }
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      // Already in YYYY-MM-DD format
      startDate = startDate;
    } else {
      // Try to parse as a date string
      const parsed = new Date(startDate);
      if (!isNaN(parsed.getTime())) {
        const year = parsed.getFullYear();
        const month = String(parsed.getMonth() + 1).padStart(2, "0");
        const day = String(parsed.getDate()).padStart(2, "0");
        startDate = `${year}-${month}-${day}`;
      }
    }
  } else {
    // Fallback to today
    startDate = new Date().toISOString().split("T")[0];
  }

  // Parse configuration
  const config = {
    location: rows[0]?.[1] || "Aure Pilates Studio Tasikmalaya",
    weeks: parseInt(rows[1]?.[1] || "1"),
    startDate: startDate,
  };

  // Parse class type mapping (columns E-F, starting row 3)
  const classMapping: Record<string, string> = {};
  for (let i = 2; i < rows.length; i++) {
    const sheetValue = rows[i]?.[4]; // Column E
    const dbValue = rows[i]?.[5]; // Column F
    if (sheetValue && dbValue) {
      classMapping[String(sheetValue).trim()] = String(dbValue).trim();
    }
  }

  // Parse coach mapping (columns H-I, starting row 3)
  const coachMapping: Record<string, number> = {};
  for (let i = 2; i < rows.length; i++) {
    const sheetName = rows[i]?.[7]; // Column H
    const coachId = rows[i]?.[8]; // Column I
    if (sheetName && coachId) {
      coachMapping[String(sheetName).trim()] = parseInt(String(coachId));
    }
  }

  return { config, classMapping, coachMapping };
}
