export default function Card({ title, value, color = "blue", icon: Icon }) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    orange: "bg-orange-50 border-orange-200 text-orange-900", 
    green: "bg-green-50 border-green-200 text-green-900",
    purple: "bg-purple-50 border-purple-200 text-purple-900"
  };

  const valueColorClasses = {
    blue: "text-blue-600",
    orange: "text-orange-600",
    green: "text-green-600", 
    purple: "text-purple-600"
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <p className={`text-3xl font-bold ${valueColorClasses[color]}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          {Icon ? <Icon className="w-6 h-6" /> : <span className="text-xl font-bold">{value}</span>}
        </div>
      </div>
    </div>
  );
}
