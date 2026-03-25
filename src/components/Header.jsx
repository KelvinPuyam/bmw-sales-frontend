export default function Header({ title, filters, setSelectedYear }) {
  return (
    <header className="bg-gray-50 border-b px-6 py-4 flex justify-between items-center">
      <h2 className="text-lg font-semibold text-gray-800">
        {title}
      </h2>

      {/* Only show dropdown if filters exist */}
      {filters && filters.years && setSelectedYear && (
        <select
          className="border border-gray-300 bg-white p-2 rounded-lg"
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">All Years</option>
          {filters.years.map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
      )}
    </header>
  );
}