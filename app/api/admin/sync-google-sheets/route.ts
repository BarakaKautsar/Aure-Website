// app/api/admin/sync-google-sheets/route.ts
import { NextResponse } from "next/server";
import { google } from "googleapis";

type ParsedClass = {
  date: string;
  start_time: string;
  end_time: string;
  title: string;
  class_type: string;
  coach_id: number;
  coach_name: string;
  location: string;
  capacity: number;
  price: number;
  original_price: number | null;
  status: string;
};

// Helper functions from your existing setup
async function readSheet(sheetName: string, spreadsheetId: string) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: `${sheetName}!A:H`,
  });

  return response.data.values || [];
}

async function readConfiguration(spreadsheetId: string) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  // Read a wider range to capture class mappings and coach mappings
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: "CONFIGURATION!A:I",
  });

  const rows = response.data.values || [];

  const config: any = {
    startDate: "",
    weeks: 0,
    location: "",
  };
  const classMapping: Record<string, string> = {};
  const coachMapping: Record<string, number> = {};

  // First pass: get basic config from column A-B
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const key = String(row[0] || "").trim();
    const value = row[1];

    // Match "Lokasi" or "Location"
    if (key.toLowerCase() === "lokasi" || key.toLowerCase() === "location") {
      config.location = String(value || "").trim();
    }
    // Match "Number of Weeks"
    else if (
      key.toLowerCase().includes("number of weeks") ||
      key.toLowerCase().includes("weeks")
    ) {
      config.weeks = parseInt(String(value || "0"));
    }
    // Match "Start Date:" or "Start Date" (with or without colon)
    else if (key.toLowerCase().replace(":", "").trim() === "start date") {
      // Parse the date - handle format like "26-Jan-2026 (Monday)"
      let dateStr = String(value || "").trim();

      // Remove day of week in parentheses if present
      dateStr = dateStr.replace(/\s*\([^)]+\)\s*$/, "").trim();

      // Try parsing "26-Jan-2026" format
      if (dateStr.includes("-")) {
        try {
          const parts = dateStr.split("-");
          if (parts.length === 3) {
            const day = parts[0];
            const monthStr = parts[1];
            const year = parts[2];

            // Convert month name to number
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

            const monthNum = monthMap[monthStr.toLowerCase()];

            if (monthNum) {
              dateStr = `${year}-${monthNum}-${day.padStart(2, "0")}`;
            }
          }
        } catch (e) {
          // Silent fail, keep original dateStr
        }
      }

      config.startDate = dateStr;
    }
  }

  // Second pass: get class mappings from columns E-F
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 6) continue;

    const sheetValue = String(row[4] || "").trim();
    const dbValue = String(row[5] || "").trim();

    if (sheetValue && dbValue) {
      classMapping[sheetValue] = dbValue;
    }
  }

  // Third pass: get coach mappings from columns H-I
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 9) continue;

    const coachName = String(row[7] || "").trim();
    const coachIdStr = String(row[8] || "").trim();
    const coachId = parseInt(coachIdStr);

    if (coachName && !isNaN(coachId) && coachId > 0) {
      coachMapping[coachName] = coachId;
    }
  }

  return { config, classMapping, coachMapping };
}

function parseTime(timeStr: any): string {
  if (typeof timeStr === "string") {
    // Handle formats like "08.00" or "08:00"
    const cleaned = timeStr.replace(".", ":");
    if (cleaned.length === 5) {
      return cleaned + ":00";
    }
  }
  return String(timeStr);
}

function parseDuration(durationStr: any): number {
  if (typeof durationStr === "string") {
    const match = durationStr.match(/\d+/);
    if (match) {
      return parseInt(match[0]);
    }
  }
  return 60;
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hour, minute] = startTime.split(":").map(Number);
  const totalMinutes = hour * 60 + minute + durationMinutes;
  const endHour = Math.floor(totalMinutes / 60) % 24;
  const endMinute = totalMinutes % 60;
  return `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(
    2,
    "0"
  )}:00`;
}

function addDays(dateStr: string, days: number): string {
  if (!dateStr || typeof dateStr !== "string") {
    return new Date().toISOString().split("T")[0];
  }

  const parts = dateStr.split("-");
  if (parts.length !== 3) {
    return new Date().toISOString().split("T")[0];
  }

  const [year, month, day] = parts.map(Number);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return new Date().toISOString().split("T")[0];
  }

  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);

  const resultYear = date.getFullYear();
  const resultMonth = String(date.getMonth() + 1).padStart(2, "0");
  const resultDay = String(date.getDate()).padStart(2, "0");
  return `${resultYear}-${resultMonth}-${resultDay}`;
}

async function syncFromSheet(spreadsheetId: string, locationOverride?: string) {
  const { config, classMapping, coachMapping } = await readConfiguration(
    spreadsheetId
  );

  const location = locationOverride || config.location;

  if (!config.startDate || !/^\d{4}-\d{2}-\d{2}$/.test(config.startDate)) {
    throw new Error(
      `Invalid start date format. Expected YYYY-MM-DD, got: "${config.startDate}". Please check your CONFIGURATION sheet.`
    );
  }

  // Calculate end date
  const [startYear, startMonth, startDay] = config.startDate
    .split("-")
    .map(Number);
  const startDateObj = new Date(startYear, startMonth - 1, startDay);
  const endDateObj = new Date(startDateObj);
  endDateObj.setDate(endDateObj.getDate() + config.weeks * 7);

  const endYear = endDateObj.getFullYear();
  const endMonth = String(endDateObj.getMonth() + 1).padStart(2, "0");
  const endDay = String(endDateObj.getDate()).padStart(2, "0");
  const endDateStr = `${endYear}-${endMonth}-${endDay}`;

  const classes: ParsedClass[] = [];
  const errors: string[] = [];

  const dayNames = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];

  // Process each week
  for (let week = 0; week < config.weeks; week++) {
    for (let dayIdx = 0; dayIdx < dayNames.length; dayIdx++) {
      const dayName = dayNames[dayIdx];

      try {
        const rows = await readSheet(dayName, spreadsheetId);

        if (rows.length === 0) continue;

        const daysOffset = week * 7 + dayIdx;
        const currentDate = addDays(config.startDate, daysOffset);

        // Skip header row
        for (let rowIdx = 1; rowIdx < rows.length; rowIdx++) {
          const row = rows[rowIdx];

          const timeCell = row[0];
          const durationCell = row[1];
          const classTypeCell = row[2];
          const coachCell = row[3];
          const titleCell = row[4];
          const capacityCell = row[5];
          const finalPriceCell = row[6];
          const originalPriceCell = row[7];

          // Skip empty rows
          if (!timeCell || !classTypeCell || !coachCell) {
            continue;
          }

          const startTime = parseTime(timeCell);
          const duration = parseDuration(durationCell);
          const endTime = calculateEndTime(startTime, duration);

          const classTypeRaw = String(classTypeCell).trim();
          const classType = classMapping[classTypeRaw];

          const coachName = String(coachCell).trim();
          const coachId = coachMapping[coachName];

          const title = String(
            titleCell || `${classTypeRaw} With ${coachName}`
          ).trim();

          const capacity = parseInt(String(capacityCell || "6"));

          let price = 0;
          if (
            finalPriceCell !== null &&
            finalPriceCell !== undefined &&
            finalPriceCell !== ""
          ) {
            const priceNum = parseInt(
              String(finalPriceCell).replace(/[^0-9]/g, "")
            );
            if (!isNaN(priceNum)) {
              price = priceNum;
            }
          }

          let originalPrice = null;
          if (
            originalPriceCell !== null &&
            originalPriceCell !== undefined &&
            originalPriceCell !== ""
          ) {
            const origNum = parseInt(
              String(originalPriceCell).replace(/[^0-9]/g, "")
            );
            if (!isNaN(origNum)) {
              originalPrice = origNum;
            }
          }

          // Validation
          if (!classType) {
            errors.push(
              `${dayName} Row ${
                rowIdx + 1
              }: Unknown class type '${classTypeRaw}'`
            );
            continue;
          }

          if (!coachId) {
            errors.push(
              `${dayName} Row ${rowIdx + 1}: Unknown coach '${coachName}'`
            );
            continue;
          }

          if (price === 0) {
            errors.push(
              `${dayName} Row ${rowIdx + 1}: Price is missing or invalid`
            );
          }

          classes.push({
            date: currentDate,
            start_time: startTime,
            end_time: endTime,
            title,
            class_type: classType,
            coach_id: coachId,
            coach_name: coachName,
            location: location,
            capacity: isNaN(capacity) ? 6 : capacity,
            price,
            original_price: originalPrice,
            status: "scheduled",
          });
        }
      } catch (error) {
        errors.push(`${dayName}: Failed to read sheet - ${error}`);
      }
    }
  }

  return {
    classes,
    errors,
    config: {
      location: location,
      startDate: config.startDate,
      endDate: endDateStr,
      weeks: config.weeks,
    },
    debug: {
      totalClassesFound: classes.length,
      classesByDay: dayNames.map((day) => ({
        day,
        count: classes.filter((c) => {
          const classDate = new Date(c.date);
          const dayOfWeek = classDate.getDay();
          const expectedDay = dayNames.indexOf(day);
          const mapping: Record<number, number> = {
            0: 1,
            1: 2,
            2: 3,
            3: 4,
            4: 5,
            5: 6,
            6: 0,
          };
          return dayOfWeek === mapping[expectedDay];
        }).length,
      })),
      sampleDates: classes.slice(0, 14).map((c) => ({
        title: c.title,
        date: c.date,
        dayOfWeek: new Date(c.date).toLocaleDateString("en-US", {
          weekday: "long",
        }),
      })),
    },
  };
}

// POST endpoint for location-specific sync
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { location, sheetId } = body;

    if (!location || !sheetId) {
      return NextResponse.json(
        { error: "Location and sheetId are required" },
        { status: 400 }
      );
    }

    const result = await syncFromSheet(sheetId, location);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      {
        error: "Failed to sync from Google Sheets",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// GET endpoint for backward compatibility
export async function GET() {
  try {
    const spreadsheetId =
      process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID ||
      process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID_TASIKMALAYA;

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "Google Sheet ID not configured" },
        { status: 500 }
      );
    }

    const result = await syncFromSheet(spreadsheetId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      {
        error: "Failed to sync from Google Sheets",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
