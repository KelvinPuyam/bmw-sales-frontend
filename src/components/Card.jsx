export default function Card({ title, value }) {
  return (
    <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-semibold mt-2 text-gray-800">
        {value}
      </h2>
    </div>
  );
}