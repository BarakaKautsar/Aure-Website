"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiFilter,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";

type Coach = {
  id: string;
  name: string;
};

type ClassItem = {
  id: string;
  title: string;
  class_type: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: number;
  price: number;
  original_price: number | null;
  status: string;
  coach: {
    name: string;
  } | null;
  coach_id: string | null;
  bookings: { id: string; status: string }[];
};

type ClassFormData = {
  title: string;
  class_type: string;
  location: string;
  coach_id: string;
  capacity: number;
  price: number;
  original_price: number | null;
  status: string;
};

const LOCATIONS = [
  "Aure Pilates Studio Tasikmalaya",
  "Aure Pilates Studio Bandung",
];

const CLASS_TYPES = [
  { value: "reformer", label: "Reformer" },
  { value: "spine_corrector", label: "Spine Corrector" },
  { value: "matt", label: "Matt" },
];

export default function ClassSchedulingPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);

  // Filters
  const [filterDate, setFilterDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [filterLocation, setFilterLocation] = useState(LOCATIONS[0]);
  const [filterCoach, setFilterCoach] = useState("");
  const [filterClassType, setFilterClassType] = useState("");

  useEffect(() => {
    loadCoaches();
    loadClasses();
  }, [filterDate, filterLocation, filterCoach, filterClassType]);

  const loadCoaches = async () => {
    const { data, error } = await supabase
      .from("coaches")
      .select("id, name")
      .eq("is_active", true)
      .order("name");

    if (!error && data) {
      setCoaches(data);
    }
  };

  const loadClasses = async () => {
    setLoading(true);

    try {
      // Get start and end of selected day
      const startOfDay = new Date(filterDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(filterDate);
      endOfDay.setHours(23, 59, 59, 999);

      let query = supabase
        .from("classes")
        .select(
          `
          id,
          title,
          class_type,
          start_time,
          end_time,
          location,
          capacity,
          price,
          original_price,
          status,
          coach_id,
          coach:coach_id (
            name
          ),
          bookings:bookings!class_id (
            id,
            status
          )
        `
        )
        .eq("location", filterLocation)
        .gte("start_time", startOfDay.toISOString())
        .lte("start_time", endOfDay.toISOString())
        .order("start_time", { ascending: true });

      // Apply filters
      if (filterCoach) {
        query = query.eq("coach_id", filterCoach);
      }
      if (filterClassType) {
        query = query.eq("class_type", filterClassType);
      }

      const { data, error } = await query;

      if (error) throw error;

      setClasses((data as unknown as ClassItem[]) || []);
    } catch (error) {
      console.error("Error loading classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (classId: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;

    // Check if there are confirmed bookings
    const classItem = classes.find((c) => c.id === classId);
    const confirmedBookings =
      classItem?.bookings.filter((b) => b.status === "confirmed").length || 0;

    if (confirmedBookings > 0) {
      if (
        !confirm(
          `This class has ${confirmedBookings} confirmed booking(s). Are you sure you want to delete it? This will cancel all bookings.`
        )
      ) {
        return;
      }

      // Cancel all bookings first
      await supabase
        .from("bookings")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("class_id", classId)
        .eq("status", "confirmed");
    }

    const { error } = await supabase.from("classes").delete().eq("id", classId);

    if (!error) {
      setClasses(classes.filter((c) => c.id !== classId));
    } else {
      alert("Failed to delete class. Please try again.");
    }
  };

  const goToNextDay = () => {
    const nextDay = new Date(filterDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setFilterDate(nextDay.toISOString().split("T")[0]);
  };

  const goToPrevDay = () => {
    const prevDay = new Date(filterDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setFilterDate(prevDay.toISOString().split("T")[0]);
  };

  const goToToday = () => {
    const today = new Date();
    setFilterDate(today.toISOString().split("T")[0]);
  };

  const selectedDate = new Date(filterDate + "T00:00:00");
  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const isToday = filterDate === new Date().toISOString().split("T")[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Class Schedule</h1>
          <p className="text-gray-600 mt-1">Manage your class schedule</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/admin/sync-schedule")}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            <FiRefreshCw size={20} />
            Sync Schedule
          </button>
          <button
            onClick={() => {
              setEditingClass(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-[#2E3A4A] text-white px-6 py-3 rounded-lg hover:opacity-90 transition"
          >
            <FiPlus size={20} />
            Add New Class
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPrevDay}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            ← Previous Day
          </button>

          <div className="text-center">
            <div className="flex items-center gap-3 justify-center">
              <FiCalendar className="text-gray-600" size={20} />
              <h2 className="text-2xl font-semibold text-gray-800">
                {formattedDate}
              </h2>
            </div>
            {!isToday && (
              <button
                onClick={goToToday}
                className="text-sm text-[#2E3A4A] underline mt-1 hover:opacity-70"
              >
                Jump to Today
              </button>
            )}
          </div>

          <button
            onClick={goToNextDay}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Next Day →
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiFilter className="inline mr-1" />
              Location
            </label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coach
            </label>
            <select
              value={filterCoach}
              onChange={(e) => setFilterCoach(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
            >
              <option value="">All Coaches</option>
              {coaches.map((coach) => (
                <option key={coach.id} value={coach.id}>
                  {coach.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Type
            </label>
            <select
              value={filterClassType}
              onChange={(e) => setFilterClassType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
            >
              <option value="">All Types</option>
              {CLASS_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
            />
          </div>
        </div>
      </div>

      {/* Classes List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading classes...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No classes scheduled for this date</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-[#2E3A4A] underline hover:opacity-70"
            >
              Add a class
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Time
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Class
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Coach
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Bookings
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Capacity
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {classes.map((classItem) => {
                  const confirmedBookings =
                    classItem.bookings?.filter((b) => b.status === "confirmed")
                      .length || 0;
                  const isFull = confirmedBookings >= classItem.capacity;

                  return (
                    <tr key={classItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(classItem.start_time).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            }
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(classItem.end_time).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            }
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {classItem.title}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {classItem.class_type.replace("_", " ")}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                        {classItem.coach?.name || "TBA"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`text-sm font-semibold ${
                            isFull
                              ? "text-red-600"
                              : confirmedBookings > 0
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {confirmedBookings}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {classItem.capacity}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {classItem.original_price && (
                          <div className="line-through text-gray-400 text-xs">
                            Rp.
                            {classItem.original_price.toLocaleString("id-ID")}
                          </div>
                        )}
                        <div className="font-medium text-gray-900">
                          Rp.{classItem.price.toLocaleString("id-ID")}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            classItem.status === "scheduled"
                              ? "bg-green-100 text-green-800"
                              : classItem.status === "delayed"
                              ? "bg-yellow-100 text-yellow-800"
                              : classItem.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {classItem.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingClass(classItem);
                              setShowModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(classItem.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Class Modal */}
      {showModal && (
        <ClassFormModal
          classData={editingClass}
          coaches={coaches}
          onClose={() => {
            setShowModal(false);
            setEditingClass(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingClass(null);
            loadClasses();
          }}
        />
      )}
    </div>
  );
}

// Class Form Modal Component
function ClassFormModal({
  classData,
  coaches,
  onClose,
  onSave,
}: {
  classData: ClassItem | null;
  coaches: Coach[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState<ClassFormData>({
    title: classData?.title || "",
    class_type: classData?.class_type || "reformer",
    location: classData?.location || LOCATIONS[0],
    coach_id: classData?.coach_id || "",
    capacity: classData?.capacity || 10,
    price: classData?.price || 0,
    original_price: classData?.original_price || null,
    status: classData?.status || "scheduled",
  });

  // Separate state for date and time inputs
  const [classDate, setClassDate] = useState<string>(
    classData?.start_time
      ? new Date(classData.start_time).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState<string>(
    classData?.start_time
      ? new Date(classData.start_time).toTimeString().slice(0, 5)
      : "09:00"
  );
  const [endTime, setEndTime] = useState<string>(
    classData?.end_time
      ? new Date(classData.end_time).toTimeString().slice(0, 5)
      : "10:00"
  );

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Combine date and time into ISO strings
      const start_time = `${classDate}T${startTime}:00`;
      const end_time = `${classDate}T${endTime}:00`;

      // Validate end time is after start time
      if (new Date(end_time) <= new Date(start_time)) {
        alert("End time must be after start time");
        setSaving(false);
        return;
      }

      const submitData = {
        ...formData,
        start_time,
        end_time,
        coach_id: formData.coach_id || null,
        original_price: formData.original_price || null,
      };

      if (classData) {
        // Update existing class
        const { error } = await supabase
          .from("classes")
          .update(submitData)
          .eq("id", classData.id);

        if (error) throw error;
      } else {
        // Create new class
        const { error } = await supabase.from("classes").insert([submitData]);

        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error("Error saving class:", error);
      alert("Failed to save class. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {classData ? "Edit Class" : "Add New Class"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Type *
              </label>
              <select
                value={formData.class_type}
                onChange={(e) =>
                  setFormData({ ...formData, class_type: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
                required
              >
                {CLASS_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={classDate}
                onChange={(e) => setClassDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <select
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
                required
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coach
              </label>
              <select
                value={formData.coach_id}
                onChange={(e) =>
                  setFormData({ ...formData, coach_id: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
              >
                <option value="">TBA</option>
                {coaches.map((coach) => (
                  <option key={coach.id} value={coach.id}>
                    {coach.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity *
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: parseInt(e.target.value),
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (Rp) *
              </label>
              <input
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseInt(e.target.value) })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Price (Rp) - Optional
              </label>
              <input
                type="number"
                min="0"
                value={formData.original_price || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    original_price: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
                placeholder="For showing discounts"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
                required
              >
                <option value="scheduled">Scheduled</option>
                <option value="delayed">Delayed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#2E3A4A] text-white px-6 py-3 rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : classData
                ? "Update Class"
                : "Create Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
