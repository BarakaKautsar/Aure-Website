// app/api/admin/sync-google-sheets/route.ts
import { NextResponse } from "next/server";
import { readSheet, readConfiguration } from "@/lib/google-sheets";

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

function parseTime(timeStr: any): string {
  if (typeof timeStr === "string") {
    // Handle formats like "08.00" or "08:00"
    const cleaned = timeStr.replace(".", ":");
    if (cleaned.length === 5) {
      // HH:MM
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
  return 60; // Default
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
  // Ensure dateStr is actually a string
  if (!dateStr || typeof dateStr !== "string") {
    return new Date().toISOString().split("T")[0]; // Fallback to today
  }

  // Parse date as YYYY-MM-DD in local time (no timezone conversion)
  const parts = dateStr.split("-");
  if (parts.length !== 3) {
    return new Date().toISOString().split("T")[0];
  }

  const [year, month, day] = parts.map(Number);

  // Validate the parsed numbers
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return new Date().toISOString().split("T")[0];
  }

  const date = new Date(year, month - 1, day); // month is 0-indexed
  date.setDate(date.getDate() + days);

  // Format back to YYYY-MM-DD
  const resultYear = date.getFullYear();
  const resultMonth = String(date.getMonth() + 1).padStart(2, "0");
  const resultDay = String(date.getDate()).padStart(2, "0");
  return `${resultYear}-${resultMonth}-${resultDay}`;
}

export async function GET() {
  try {
    // Read configuration
    const { config, classMapping, coachMapping } = await readConfiguration();

    // Validate startDate format
    if (!config.startDate || !/^\d{4}-\d{2}-\d{2}$/.test(config.startDate)) {
      return NextResponse.json(
        {
          error: "Invalid start date format",
          details: `Start date must be YYYY-MM-DD format, got: ${config.startDate}`,
          classes: [],
          errors: [`Invalid start date: ${config.startDate}`],
          config: {
            location: config.location,
            startDate: config.startDate,
            endDate: "",
            weeks: config.weeks,
          },
        },
        { status: 400 }
      );
    }

    // Calculate end date
    // Parse date manually to avoid timezone issues
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

    // Start with MONDAY since admin always sets start date to Monday
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
      // Process each day sequentially from the start of the week
      for (let dayIdx = 0; dayIdx < dayNames.length; dayIdx++) {
        const dayName = dayNames[dayIdx];

        try {
          const rows = await readSheet(dayName);

          if (rows.length === 0) continue;

          // Calculate date for this day
          // Simply add dayIdx to the start date + week offset
          // This assumes start date is always Monday
          const daysOffset = week * 7 + dayIdx;
          const currentDate = addDays(config.startDate, daysOffset);

          // Skip header row, start from row 2 (index 1)
          for (let rowIdx = 1; rowIdx < rows.length; rowIdx++) {
            const row = rows[rowIdx];

            // Column indices (0-based):
            // A=0: JAM (Time)
            // B=1: DURASI (Duration)
            // C=2: KELAS (Class Type)
            // D=3: COACH
            // E=4: NAMA KELAS (Title)
            // F=5: KAPASITAS (Capacity)
            // G=6: HARGA AKHIR (Final Price)
            // H=7: HARGA AWAL (Original Price)

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

            // Parse values
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

            // Parse capacity (might be number or formula result)
            const capacity = parseInt(String(capacityCell || "6"));

            // Parse prices
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
                `${dayName} Row ${
                  rowIdx + 1
                }: Price is missing or invalid (cell value: '${finalPriceCell}')`
              );
              // Don't skip - still add the class but with 0 price so user can see it
            }

            classes.push({
              date: currentDate,
              start_time: startTime,
              end_time: endTime,
              title,
              class_type: classType,
              coach_id: coachId,
              coach_name: coachName,
              location: config.location,
              capacity: isNaN(capacity) ? 6 : capacity,
              price,
              original_price: originalPrice,
              status: "scheduled", // Use 'scheduled' instead of 'active'
            });
          }
        } catch (error) {
          errors.push(`${dayName}: Failed to read sheet - ${error}`);
        }
      }
    }

    return NextResponse.json({
      classes,
      errors,
      config: {
        location: config.location,
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
            // Map: MONDAY=0 -> dayOfWeek=1, SUNDAY=6 -> dayOfWeek=0
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
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      {
        error: "Failed to sync from Google Sheets",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
