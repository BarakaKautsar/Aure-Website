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
} from "react-icons/fi";

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

export default function SyncSchedulePage() {
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [importComplete, setImportComplete] = useState(false);
  const [importStats, setImportStats] = useState({ success: 0, failed: 0 });

  const syncFromGoogleSheets = async () => {
    setSyncing(true);
    setSyncResult(null);
    setImportComplete(false);

    try {
      const response = await fetch("/api/admin/sync-google-sheets");

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
            `Sync failed with status ${response.status}\n\nResponse: ${errorText}`
          );
        }
        return;
      }

      const result = await response.json();
      setSyncResult(result);
    } catch (error) {
      console.error("Sync error:", error);
      alert(
        `Failed to sync: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Check browser console for details.`
      );
    } finally {
      setSyncing(false);
    }
  };

  const importClasses = async () => {
    if (!syncResult) return;

    setImporting(true);
    let successCount = 0;
    let failedCount = 0;

    try {
      // Insert classes in batches
      for (const classData of syncResult.classes) {
        const { error } = await supabase.from("classes").insert({
          start_time: `${classData.date}T${classData.start_time}+07:00`, // Indonesia timezone (UTC+7)
          end_time: `${classData.date}T${classData.end_time}+07:00`, // Indonesia timezone (UTC+7)
          title: classData.title,
          class_type: classData.class_type,
          coach_id: classData.coach_id,
          location: classData.location,
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
    setSyncResult(null);
    setImportComplete(false);
    setImportStats({ success: 0, failed: 0 });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Sync from Google Sheets
          </h1>
          <p className="text-gray-600 mt-1">
            Import classes directly from your Google Sheets schedule
          </p>
        </div>
        <a
          href={`https://docs.google.com/spreadsheets/d/${process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID}/edit`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
        >
          <FiExternalLink size={20} />
          Open Google Sheet
        </a>
      </div>

      {/* Sync Section */}
      {!syncResult && !importComplete && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center py-12">
            <FiRefreshCw size={64} className="mx-auto text-gray-400 mb-6" />
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
              className="bg-[#2E3A4A] text-white px-8 py-4 rounded-lg hover:opacity-90 transition disabled:opacity-50 text-lg font-medium"
            >
              {syncing ? (
                <span className="flex items-center gap-3">
                  <FiRefreshCw className="animate-spin" />
                  Syncing...
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
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FiAlertCircle className="text-blue-600" />
              How it Works
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Your Google Sheet is automatically read in real-time</li>
              <li>
                • All formulas (capacity, prices) are calculated automatically
              </li>
              <li>
                • Coach names and class types are mapped from the CONFIGURATION
                sheet
              </li>
              <li>• You'll see a preview before any classes are imported</li>
            </ul>
          </div>

          {/* Quick Setup Check */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-800 mb-3">
              Setup Checklist
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Google Sheets API enabled
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Service account created
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Sheet shared with service account
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Environment variables configured
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {syncResult && !importComplete && (
        <div className="space-y-6">
          {/* Configuration Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Configuration
            </h2>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Location</p>
                <p className="font-medium text-gray-800">
                  {syncResult.config.location}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Start Date</p>
                <p className="font-medium text-gray-800">
                  {new Date(syncResult.config.startDate).toLocaleDateString(
                    "en-US",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      weekday: "long",
                    }
                  )}
                </p>
              </div>
              <div>
                <p className="text-gray-600">End Date</p>
                <p className="font-medium text-gray-800">
                  {new Date(syncResult.config.endDate).toLocaleDateString(
                    "en-US",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      weekday: "long",
                    }
                  )}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Number of Weeks</p>
                <p className="font-medium text-gray-800">
                  {syncResult.config.weeks}
                </p>
              </div>
            </div>
          </div>

          {/* Debug Info */}
          {syncResult.debug && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">
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
                      className="bg-white p-2 rounded text-center"
                    >
                      <p className="font-medium">{item.day.slice(0, 3)}</p>
                      <p className="text-lg font-bold text-blue-600">
                        {item.count}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Sample Dates (First 14 classes):
                </p>
                <div className="bg-white p-3 rounded text-xs font-mono max-h-40 overflow-y-auto">
                  {syncResult.debug.sampleDates.map((item, idx) => (
                    <div key={idx} className="mb-1">
                      {item.date} ({item.dayOfWeek}) - {item.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Errors */}
          {syncResult.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                <FiX />
                Errors Found ({syncResult.errors.length})
              </h3>
              <ul className="space-y-1 text-sm text-red-700 max-h-48 overflow-y-auto">
                {syncResult.errors.map((error, idx) => (
                  <li key={idx}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Classes Preview */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Classes to Import ({syncResult.classes.length})
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing ? "Importing..." : "Import All Classes"}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 border-b">Date</th>
                    <th className="text-left px-3 py-2 border-b">Time</th>
                    <th className="text-left px-3 py-2 border-b">Title</th>
                    <th className="text-left px-3 py-2 border-b">Type</th>
                    <th className="text-left px-3 py-2 border-b">Coach</th>
                    <th className="text-left px-3 py-2 border-b">Capacity</th>
                    <th className="text-left px-3 py-2 border-b">Price</th>
                    <th className="text-left px-3 py-2 border-b">Original</th>
                  </tr>
                </thead>
                <tbody>
                  {syncResult.classes.map((cls, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">{cls.date}</td>
                      <td className="px-3 py-2">
                        {cls.start_time} - {cls.end_time}
                      </td>
                      <td className="px-3 py-2">{cls.title}</td>
                      <td className="px-3 py-2 capitalize">{cls.class_type}</td>
                      <td className="px-3 py-2">{cls.coach_name}</td>
                      <td className="px-3 py-2">{cls.capacity}</td>
                      <td className="px-3 py-2">
                        {cls.price
                          ? `Rp.${cls.price.toLocaleString("id-ID")}`
                          : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {cls.original_price ? (
                          <span className="text-gray-500 line-through">
                            Rp.{cls.original_price.toLocaleString("id-ID")}
                          </span>
                        ) : (
                          "—"
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
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Import Complete!
          </h2>
          <p className="text-gray-600 mb-6">
            Successfully imported {importStats.success} classes
            {importStats.failed > 0 && ` (${importStats.failed} failed)`}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Sync Again
            </button>
            <button
              onClick={() => (window.location.href = "/admin/classes")}
              className="px-6 py-3 bg-[#2E3A4A] text-white rounded-lg hover:opacity-90"
            >
              View Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
