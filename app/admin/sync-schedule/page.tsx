// app/admin/sync-schedule/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  FiRefreshCw,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiExternalLink,
  FiMapPin,
  FiChevronRight,
} from "react-icons/fi";

// Internal keys for the location selector
type LocationKey = "tasikmalaya" | "kbp";

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

type SyncResult = {
  classes: ParsedClass[];
  errors: string[];
  config: {
    location: string;
    startDate: string;
    endDate: string;
    weeks: number;
  };
  debug?: {
    totalClassesFound: number;
    classesByDay: { day: string; count: number }[];
    sampleDates: { title: string; date: string; dayOfWeek: string }[];
  };
};

const LOCATIONS = {
  tasikmalaya: {
    name: "Tasikmalaya",
    fullName: "Aure Pilates Studio Tasikmalaya", // Used for API/Google Sheets lookup
    dbLocation: "Tasikmalaya", // Stored in database
    sheetId:
      process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID_TASIKMALAYA ||
      process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
    color: "from-blue-500 to-blue-600",
    icon: "🏢",
  },
  kbp: {
    name: "KBP",
    fullName: "Aure Pilates Studio KBP", // Used for API/Google Sheets lookup
    dbLocation: "KBP", // Stored in database
    sheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID_KBP,
    color: "from-purple-500 to-purple-600",
    icon: "🏛️",
  },
} as const;

export default function SyncSchedulePage() {
  const [selectedLocation, setSelectedLocation] = useState<LocationKey | null>(
    null,
  );
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [importComplete, setImportComplete] = useState(false);
  const [importStats, setImportStats] = useState({ success: 0, failed: 0 });

  const syncFromGoogleSheets = async () => {
    if (!selectedLocation) return;

    setSyncing(true);
    setSyncResult(null);
    setImportComplete(false);

    try {
      const locationConfig = LOCATIONS[selectedLocation];

      const response = await fetch("/api/admin/sync-google-sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location: locationConfig.fullName, // Send full name to API for Google Sheets
          sheetId: locationConfig.sheetId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();

        try {
          const errorData = JSON.parse(errorText);
          const errorMsg =
            errorData.error ||
            errorData.details ||
            "Failed to sync from Google Sheets";
          alert(`Sync failed: ${errorMsg}\n\nCheck console for details.`);
        } catch (e) {
          alert(
            `Sync failed with status ${response.status}\n\nResponse: ${errorText}`,
          );
        }
        return;
      }

      const result = await response.json();

      // Transform the location in the result to use simplified names
      const transformedClasses = result.classes.map((cls: ParsedClass) => ({
        ...cls,
        location: locationConfig.dbLocation, // Use simplified location name
      }));

      setSyncResult({
        ...result,
        classes: transformedClasses,
        config: {
          ...result.config,
          location: locationConfig.dbLocation,
        },
      });
    } catch (error) {
      console.error("Sync error:", error);
      alert(
        `Failed to sync: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Check browser console for details.`,
      );
    } finally {
      setSyncing(false);
    }
  };

  const importClasses = async () => {
    if (!syncResult || !selectedLocation) return;

    setImporting(true);
    let successCount = 0;
    let failedCount = 0;

    const locationConfig = LOCATIONS[selectedLocation];

    try {
      // Insert classes in batches
      for (const classData of syncResult.classes) {
        const { error } = await supabase.from("classes").insert({
          start_time: `${classData.date}T${classData.start_time}+07:00`,
          end_time: `${classData.date}T${classData.end_time}+07:00`,
          title: classData.title,
          class_type: classData.class_type,
          coach_id: classData.coach_id,
          location: locationConfig.dbLocation, // Use simplified location name
          capacity: classData.capacity,
          price: classData.price,
          original_price: classData.original_price,
          status: classData.status,
        });

        if (error) {
          console.error("Insert error:", error);
          failedCount++;
        } else {
          successCount++;
        }
      }

      setImportStats({ success: successCount, failed: failedCount });
      setImportComplete(true);
    } catch (error) {
      console.error("Import error:", error);
      alert("Failed to import classes");
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setSelectedLocation(null);
    setSyncResult(null);
    setImportComplete(false);
    setImportStats({ success: 0, failed: 0 });
  };

  const goBack = () => {
    setSyncResult(null);
    setImportComplete(false);
  };

  // Location Selection Screen
  if (!selectedLocation) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sync from Google Sheets
          </h1>
          <p className="text-gray-600">
            Select a location to import classes from Google Sheets
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {(
            Object.entries(LOCATIONS) as [
              LocationKey,
              (typeof LOCATIONS)[LocationKey],
            ][]
          ).map(([locationKey, config]) => {
            const isConfigured = !!config.sheetId;

            return (
              <button
                key={locationKey}
                onClick={() => isConfigured && setSelectedLocation(locationKey)}
                disabled={!isConfigured}
                className={`group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 ${
                  isConfigured
                    ? "hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                {/* linear Background */}
                <div
                  className={`absolute inset-0 bg-linear-to-br ${config.color} opacity-90`}
                />

                {/* Content */}
                <div className="relative p-8 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-5xl">{config.icon}</span>
                    {isConfigured ? (
                      <FiChevronRight
                        size={32}
                        className="transform group-hover:translate-x-1 transition-transform"
                      />
                    ) : (
                      <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs">
                        Not Configured
                      </div>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold mb-2">{config.name}</h3>
                  <p className="text-white/90 text-sm mb-4">
                    {config.fullName}
                  </p>

                  {isConfigured && (
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <FiMapPin size={16} />
                      <span>Google Sheet configured</span>
                    </div>
                  )}

                  {!isConfigured && (
                    <div className="text-sm text-white/80 mt-4 bg-white/10 rounded-lg p-3">
                      ⚠️ Add NEXT_PUBLIC_GOOGLE_SHEET_ID_
                      {config.name.toUpperCase().replace(" ", "_")} to .env
                    </div>
                  )}
                </div>

                {/* Shine effect on hover */}
                {isConfigured && (
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                )}
              </button>
            );
          })}
        </div>

        {/* Setup Instructions */}
        <div className="mt-12 bg-linear-to-br from-gray-50 to-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-4xl">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiAlertCircle className="text-blue-600" />
            Setup Instructions
          </h3>

          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Environment Variables Required:
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <code>NEXT_PUBLIC_GOOGLE_SHEET_ID_TASIKMALAYA</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-600">⚠</span>
                  <code>NEXT_PUBLIC_GOOGLE_SHEET_ID_KBP</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <code>GOOGLE_SERVICE_ACCOUNT_EMAIL</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <code>GOOGLE_PRIVATE_KEY</code>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Google Sheets Setup:
              </h4>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Create a Google Sheet for each location</li>
                <li>
                  Share each sheet with your service account email (
                  <code className="bg-gray-100 px-1 rounded">
                    your-service-account@project.iam.gserviceaccount.com
                  </code>
                  )
                </li>
                <li>Copy the Sheet ID from the URL</li>
                <li>Add the Sheet IDs to your .env file</li>
                <li>Restart your development server</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const locationConfig = LOCATIONS[selectedLocation];

  return (
    <div>
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={reset}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={syncing || importing}
          >
            ← Back
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{locationConfig.icon}</span>
              <h1 className="text-3xl font-bold text-gray-900">
                {locationConfig.name}
              </h1>
            </div>
            <p className="text-gray-600">
              Import classes from Google Sheets for {locationConfig.fullName}
            </p>
          </div>
        </div>
        <a
          href={`https://docs.google.com/spreadsheets/d/${locationConfig.sheetId}/edit`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-linear-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
        >
          <FiExternalLink size={20} />
          Open Google Sheet
        </a>
      </div>

      {/* Sync Section */}
      {!syncResult && !importComplete && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="text-center py-12">
            <div
              className={`w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br ${locationConfig.color} flex items-center justify-center text-white shadow-lg`}
            >
              <FiRefreshCw size={48} />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              Ready to Sync
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Click the button below to fetch the latest schedule from your
              Google Sheet. You'll be able to preview all classes before
              importing.
            </p>

            <button
              onClick={syncFromGoogleSheets}
              disabled={syncing}
              className={`bg-linear-to-r ${locationConfig.color} text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 text-lg font-medium`}
            >
              {syncing ? (
                <span className="flex items-center gap-3">
                  <FiRefreshCw className="animate-spin" />
                  Syncing from {locationConfig.name}...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <FiRefreshCw />
                  Sync from Google Sheets
                </span>
              )}
            </button>
          </div>

          {/* Setup Info */}
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FiAlertCircle className="text-blue-600" />
              How it Works
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>
                  Your Google Sheet is automatically read in real-time
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>
                  All formulas (capacity, prices) are calculated automatically
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>
                  Coach names and class types are mapped from the CONFIGURATION
                  sheet
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>
                  You'll see a preview before any classes are imported
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>
                  All classes will be tagged with location:{" "}
                  <strong>{locationConfig.dbLocation}</strong>
                </span>
              </li>
            </ul>
          </div>

          {/* Quick Setup Check */}
          <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-xl p-6">
            <h4 className="font-semibold text-gray-800 mb-3">
              Setup Checklist
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-600 text-lg">✓</span>
                <span>Google Sheets API enabled</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600 text-lg">✓</span>
                <span>Service account created</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600 text-lg">✓</span>
                <span>
                  Sheet shared with service account (
                  {
                    process.env.NEXT_PUBLIC_GOOGLE_SERVICE_ACCOUNT_EMAIL?.split(
                      "@",
                    )[0]
                  }
                  ...)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600 text-lg">✓</span>
                <span>Environment variables configured</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {syncResult && !importComplete && (
        <div className="space-y-6">
          {/* Configuration Summary */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Configuration
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 mb-1">Location</p>
                <p className="font-semibold text-gray-900">
                  {locationConfig.dbLocation}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 mb-1">Start Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(syncResult.config.startDate).toLocaleDateString(
                    "en-US",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 mb-1">End Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(syncResult.config.endDate).toLocaleDateString(
                    "en-US",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 mb-1">Number of Weeks</p>
                <p className="font-semibold text-gray-900">
                  {syncResult.config.weeks}
                </p>
              </div>
            </div>
          </div>

          {/* Debug Info */}
          {syncResult.debug && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                🐛 Debug Information
              </h3>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Classes by Day:
                </p>
                <div className="grid grid-cols-7 gap-2 text-xs">
                  {syncResult.debug.classesByDay.map((item) => (
                    <div
                      key={item.day}
                      className="bg-white p-3 rounded-lg text-center shadow-sm"
                    >
                      <p className="font-medium text-gray-600">
                        {item.day.slice(0, 3)}
                      </p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        {item.count}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Errors */}
          {syncResult.errors.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                <FiX />
                Errors Found ({syncResult.errors.length})
              </h3>
              <ul className="space-y-1 text-sm text-red-700 max-h-48 overflow-y-auto">
                {syncResult.errors.map((error, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Classes Preview */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Classes to Import ({syncResult.classes.length})
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={goBack}
                  className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={importClasses}
                  disabled={
                    importing ||
                    syncResult.errors.length > 0 ||
                    syncResult.classes.length === 0
                  }
                  className="flex items-center gap-2 bg-linear-to-r from-green-600 to-green-700 text-white px-8 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {importing ? (
                    <>
                      <FiRefreshCw className="animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <FiCheck />
                      Import All Classes
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px] overflow-y-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-linear-to-r from-gray-50 to-gray-100 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-3 border-b-2 border-gray-200 font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 border-b-2 border-gray-200 font-semibold text-gray-700">
                      Time
                    </th>
                    <th className="text-left px-4 py-3 border-b-2 border-gray-200 font-semibold text-gray-700">
                      Title
                    </th>
                    <th className="text-left px-4 py-3 border-b-2 border-gray-200 font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 border-b-2 border-gray-200 font-semibold text-gray-700">
                      Coach
                    </th>
                    <th className="text-left px-4 py-3 border-b-2 border-gray-200 font-semibold text-gray-700">
                      Location
                    </th>
                    <th className="text-left px-4 py-3 border-b-2 border-gray-200 font-semibold text-gray-700">
                      Capacity
                    </th>
                    <th className="text-left px-4 py-3 border-b-2 border-gray-200 font-semibold text-gray-700">
                      Price
                    </th>
                    <th className="text-left px-4 py-3 border-b-2 border-gray-200 font-semibold text-gray-700">
                      Original
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {syncResult.classes.map((cls, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-900">{cls.date}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {cls.start_time} - {cls.end_time}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {cls.title}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                          {cls.class_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {cls.coach_name}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            cls.location === "KBP"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-teal-100 text-teal-700"
                          }`}
                        >
                          {cls.location}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-900">
                        {cls.capacity}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {cls.price
                          ? `Rp ${cls.price.toLocaleString("id-ID")}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {cls.original_price ? (
                          <span className="text-gray-500 line-through text-xs">
                            Rp {cls.original_price.toLocaleString("id-ID")}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Import Complete */}
      {importComplete && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <div
            className={`w-24 h-24 bg-linear-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}
          >
            <FiCheck size={48} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Import Complete!
          </h2>
          <p className="text-gray-600 text-lg mb-2">
            Successfully imported <strong>{importStats.success}</strong> classes
            to <strong>{locationConfig.dbLocation}</strong>
          </p>
          {importStats.failed > 0 && (
            <p className="text-red-600 mb-6">({importStats.failed} failed)</p>
          )}
          <div className="flex gap-4 justify-center mt-8">
            <button
              onClick={reset}
              className="px-8 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Sync Another Location
            </button>
            <button
              onClick={() => (window.location.href = "/admin/classes")}
              className={`px-8 py-3 bg-linear-to-r ${locationConfig.color} text-white rounded-xl hover:shadow-lg transition-all font-medium`}
            >
              View Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
