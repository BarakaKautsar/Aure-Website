"use client";

const history = [
  {
    id: 1,
    date: "Sat 29 Nov 2025",
    time: "10:00–11:00",
    className: "MATRAS (Buy1Get1)",
    coach: "Bila",
    packageUsed: "Matt 5 Class Pass",
  },
  {
    id: 2,
    date: "Sat 29 Nov 2025",
    time: "10:00–11:00",
    className: "MATRAS (Buy1Get1)",
    coach: "Bila",
    packageUsed: "Matt 5 Class Pass",
  },
  {
    id: 3,
    date: "Sat 29 Nov 2025",
    time: "10:00–11:00",
    className: "MATRAS (Buy1Get1)",
    coach: "Bila",
    packageUsed: "-",
  },
  {
    id: 4,
    date: "Sat 29 Nov 2025",
    time: "10:00–11:00",
    className: "MATRAS (Buy1Get1)",
    coach: "Bila",
    packageUsed: "Matt 5 Class Pass",
  },
];

export default function BookingHistoryTab() {
  return (
    <div>
      <h2 className="text-3xl font-light text-[#2F3E55] mb-6">
        Booking History
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-[#B7C9E5] text-[#2F3E55]">
            <tr>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Time</th>
              <th className="text-left px-4 py-3">Class</th>
              <th className="text-left px-4 py-3">Coach</th>
              <th className="text-left px-4 py-3">Package Used</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id} className="border-b border-[#F7F4EF]">
                <td className="px-4 py-4">{item.date}</td>
                <td className="px-4 py-4">{item.time}</td>
                <td className="px-4 py-4">{item.className}</td>
                <td className="px-4 py-4">{item.coach}</td>
                <td className="px-4 py-4">{item.packageUsed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {history.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-6">
          You have no booking history yet.
        </p>
      )}
    </div>
  );
}
