import { useState } from 'react';

export default function AddAcreages({ user }) {
  const [activeTab, setActiveTab] = useState('add');
  const [formData, setFormData] = useState({
    registerId: '',
    clientId: '',
    plan: '',
    addAcreage: ''
  });
  const [deleteFormData, setDeleteFormData] = useState({
    registerId: '',
    clientId: '',
    acreage: ''
  });
  const [submittedData, setSubmittedData] = useState([]);
  const [showTable, setShowTable] = useState(false);

  const handleDeleteChange = (e) => {
    const { name, value } = e.target;
    setDeleteFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteSubmit = (e) => {
    e.preventDefault();
    console.log('Delete form submitted:', deleteFormData);
    alert('Acreage deleted successfully');
    setDeleteFormData({
      registerId: '',
      clientId: '',
      acreage: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    
    // Show alert message
    alert('Acreage added successfully!');
    
    // Add new entry to submitted data
    const newEntry = {
      id: Date.now(),
      registerId: formData.registerId,
      clientId: formData.clientId,
      plan: formData.plan,
      addAcreage: formData.addAcreage,
      timestamp: new Date().toLocaleString()
    };
    
    setSubmittedData(prev => [...prev, newEntry]);
    setShowTable(true);
    
    // Clear form after submission
    setFormData({
      registerId: '',
      clientId: '',
      plan: '',
      addAcreage: ''
    });
  };

  return (
    <div className="min-h-screen p-6 bg-slate-50 text-slate-800 overflow-auto">
      {/* Form Section - Top */}
      <div className="flex items-center justify-center mb-8">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Add Acreages</h1>
              <p className="text-slate-600">Use this panel to add acreage details to your farm records.</p>
            </div>

            {/* Tab Buttons */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab('delete')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'delete'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Delete Acreages
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'add'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Add Acreages
              </button>
            </div>

            <div className="p-6 border border-slate-200 rounded-xl bg-slate-50">
              <h2 className="font-semibold mb-4 text-center">
                {activeTab === 'add' ? 'Add Acreage Form' : 'Delete Acreage Form'}
              </h2>
              <form onSubmit={activeTab === 'add' ? handleSubmit : handleDeleteSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="registerId" className="block text-sm font-medium text-slate-700 mb-1">
                      {activeTab === 'add' ? 'Register ID' : 'Register ID'}
                    </label>
                    <input
                      type="text"
                      id="registerId"
                      name="registerId"
                      value={activeTab === 'add' ? formData.registerId : deleteFormData.registerId}
                      onChange={activeTab === 'add' ? handleChange : handleDeleteChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={activeTab === 'add' ? 'Enter register ID' : 'Enter register ID to delete'}
                    />
                  </div>

                  <div>
                    <label htmlFor="clientId" className="block text-sm font-medium text-slate-700 mb-1">
                      {activeTab === 'add' ? 'Client ID' : 'Client ID'}
                    </label>
                    <input
                      type="text"
                      id="clientId"
                      name="clientId"
                      value={activeTab === 'add' ? formData.clientId : deleteFormData.clientId}
                      onChange={activeTab === 'add' ? handleChange : handleDeleteChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={activeTab === 'add' ? 'Enter client ID' : 'Enter client ID to delete'}
                    />
                  </div>
                </div>

                {activeTab === 'add' ? (
                  <>
                    <div>
                      <label htmlFor="plan" className="block text-sm font-medium text-slate-700 mb-1">
                        Plan
                      </label>
                      <select
                        id="plan"
                        name="plan"
                        value={formData.plan}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a plan</option>
                        <option value="monthly">Monthly Subscription</option>
                        <option value="biannually">Biannually Subscription</option>
                        <option value="annually">Annually Subscription</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="addAcreage" className="block text-sm font-medium text-slate-700 mb-1">
                        Add Acreage
                      </label>
                      <input
                        type="number"
                        id="addAcreage"
                        name="addAcreage"
                        value={formData.addAcreage}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter acreage value"
                        step="0.01"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Submit
                    </button>
                  </>
                ) : (
                  <>
                    

                    <div>
                      <label htmlFor="deleteAcreage" className="block text-sm font-medium text-slate-700 mb-1">
                        Acreage *
                      </label>
                      <input
                        type="number"
                        id="deleteAcreage"
                        name="acreage"
                        value={deleteFormData.acreage}
                        onChange={handleDeleteChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter acreage value to delete"
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Delete acreage
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteFormData({
                          registerId: '',
                          clientId: '',
                          acreage: ''
                        })}
                        className="flex-1 bg-slate-600 text-white py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors font-medium"
                      >
                        Clear Form
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Submitted Data Table - Integrated */}
      {activeTab === 'add' && showTable && submittedData.length > 0 && (
        <div className="mt-6 p-6 border border-slate-200 rounded-xl bg-slate-50">
          <h3 className="font-semibold mb-4 text-center">Submitted Acreage Entries</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider border-b">
                    Register ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider border-b">
                    Client ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider border-b">
                    Plan
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider border-b">
                    Add Acreage
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider border-b">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody>
                {submittedData.map((entry, index) => (
                  <tr key={entry.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-4 py-2 text-sm text-slate-900 border-b">
                      {entry.registerId}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-900 border-b">
                      {entry.clientId}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-900 border-b">
                      {entry.plan}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-900 border-b">
                      {entry.addAcreage}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-600 border-b">
                      {entry.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
