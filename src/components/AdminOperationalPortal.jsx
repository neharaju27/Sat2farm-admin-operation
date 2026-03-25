export default function AdminOperationalPortal({ user }) {
  return (
    <div className="h-full p-6 bg-slate-50 text-slate-800 overflow-auto">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Operational Portal</h1>
            <p className="mt-1 text-sm text-slate-500">Manage operational controls and dashboards for admin users.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 grid-cols-1 lg:grid-cols-2">
          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
            <h2 className="font-semibold">Quick Action</h2>
            <p className="text-sm text-slate-600 mt-1">Switch tools, generate reports, and review live operation feeds.</p>
          </div>
          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
            <h2 className="font-semibold">Status</h2>
            <p className="text-sm text-slate-600 mt-1">All systems normal. No alerts in the last 24 hours.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
