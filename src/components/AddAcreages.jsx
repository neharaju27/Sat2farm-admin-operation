export default function AddAcreages({ user }) {
  return (
    <div className="h-full p-6 bg-slate-50 text-slate-800 overflow-auto">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Add Acreages</h1>
        <p className="mt-2 text-slate-600">Use this panel to add acreage details to your farm records.</p>

        <div className="mt-4 grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
            <h2 className="font-semibold">Acreage Form</h2>
            <p className="text-sm text-slate-600 mt-1">Add new acreage values and assign to farm IDs.</p>
          </div>
          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
            <h2 className="font-semibold">Recent Submissions</h2>
            <p className="text-sm text-slate-600 mt-1">No recent additions yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
