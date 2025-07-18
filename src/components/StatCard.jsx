export default function StatCard({ icon, title, value, change, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 w-full shadow-sm mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-500 font-medium">{title}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color} bg-opacity-10`}>
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-semibold text-gray-900">{value}</h3>
      <p className={`text-sm ${change.includes('-') ? 'text-red-500' : 'text-green-500'}`}>{change}</p>
    </div>
  );
}
