import { useState } from 'react';

export default function AddAcreages({ user }) {
  const [inputType, setInputType] = useState('registeredNumber');
  const [registeredNumber, setRegisteredNumber] = useState('');
  const [clientId, setClientId] = useState('');
  const [acreage, setAcreage] = useState('');
  const [message, setMessage] = useState('');
  const [fetchedDetails, setFetchedDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [oneMonthAcreage, setOneMonthAcreage] = useState('');
  const [sixMonthAcreage, setSixMonthAcreage] = useState('');
  const [twelveMonthAcreage, setTwelveMonthAcreage] = useState('');

  const fetchDetails = async (identifier, type) => {
    if (!identifier.trim()) {
      setFetchedDetails(null);
      return;
    }

    setIsLoading(true);
    setFetchedDetails(null);

    try {
      // Simulate API call - replace with actual API integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration - replace with actual API response
      const mockData = {
        registeredNumber: {
          farmerName: 'John Doe',
          farmLocation: 'California Valley',
          phoneNumber: '+1-234-567-8900',
          email: 'john.doe@example.com',
          currentAcreage: 150.5,
          cropType: 'Wheat'
        },
        clientId: {
          clientName: 'Jane Smith',
          companyName: 'AgriCorp Solutions',
          phoneNumber: '+1-234-567-8901',
          email: 'jane.smith@agricorp.com',
          totalFarms: 3,
          totalAcreage: 450.75
        }
      };

      const details = type === 'registeredNumber' ? mockData.registeredNumber : mockData.clientId;
      setFetchedDetails(details);
    } catch (error) {
      console.error('Error fetching details:', error);
      setMessage('Failed to fetch details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisteredNumberChange = (e) => {
    const value = e.target.value;
    setRegisteredNumber(value);
    fetchDetails(value, 'registeredNumber');
  };

  const handleClientIdChange = (e) => {
    const value = e.target.value;
    setClientId(value);
    fetchDetails(value, 'clientId');
  };

  const handleSubmit = () => {
    if (inputType === 'registeredNumber' && !registeredNumber.trim()) {
      setMessage('Please enter a registered number.');
      return;
    }
    if (inputType === 'clientId' && !clientId.trim()) {
      setMessage('Please enter a client ID.');
      return;
    }
    if (!oneMonthAcreage.trim() && !sixMonthAcreage.trim() && !twelveMonthAcreage.trim()) {
      setMessage('Please enter at least one acreage value.');
      return;
    }

    const identifier = inputType === 'registeredNumber' ? registeredNumber.trim() : clientId.trim();
    const acreageValues = [];
    if (oneMonthAcreage.trim()) acreageValues.push(`1 month: ${oneMonthAcreage} acres`);
    if (sixMonthAcreage.trim()) acreageValues.push(`6 months: ${sixMonthAcreage} acres`);
    if (twelveMonthAcreage.trim()) acreageValues.push(`12 months: ${twelveMonthAcreage} acres`);
    
    setMessage(`Acreage values (${acreageValues.join(', ')}) have been added for ${inputType === 'registeredNumber' ? 'registered number' : 'client ID'} ${identifier}.`);
    
    // Reset form
    setRegisteredNumber('');
    setClientId('');
    setAcreage('');
    setOneMonthAcreage('');
    setSixMonthAcreage('');
    setTwelveMonthAcreage('');
    setFetchedDetails(null);
  };

  return (
    <div className="h-full p-6 bg-slate-50 text-slate-800 overflow-auto">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900">Add Acreages</h1>
        <p className="mt-2 text-slate-600">Add acreage details by selecting either registered number or client ID.</p>

        <div className="mt-6 p-4 border border-slate-200 rounded-xl bg-slate-50">
          {/* Input Type Selection */}
          <label className="block text-sm font-medium text-slate-700 mb-3">Input Type</label>
          <div className="flex space-x-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="registeredNumber"
                checked={inputType === 'registeredNumber'}
                onChange={(e) => setInputType(e.target.value)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Registered Number</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="clientId"
                checked={inputType === 'clientId'}
                onChange={(e) => setInputType(e.target.value)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Client ID</span>
            </label>
          </div>

          {/* Conditional Input Fields */}
          {inputType === 'registeredNumber' ? (
            <>
              <label className="block text-sm font-medium text-slate-700 mt-4">Registered Number</label>
              <input
                type="text"
                value={registeredNumber}
                onChange={handleRegisteredNumberChange}
                placeholder="Enter registered number"
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </>
          ) : (
            <>
              <label className="block text-sm font-medium text-slate-700 mt-4">Client ID</label>
              <input
                type="text"
                value={clientId}
                onChange={handleClientIdChange}
                placeholder="Enter client ID"
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">Fetching details...</p>
            </div>
          )}

          {/* Fetched Details Display */}
          {fetchedDetails && !isLoading && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-sm font-semibold text-green-900 mb-2">
                {inputType === 'registeredNumber' ? 'Farmer Details' : 'Client Details'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {inputType === 'registeredNumber' ? (
                  <>
                    <div><span className="font-medium text-slate-700">Name:</span> {fetchedDetails.farmerName}</div>
                    <div><span className="font-medium text-slate-700">Location:</span> {fetchedDetails.farmLocation}</div>
                    <div><span className="font-medium text-slate-700">Phone:</span> {fetchedDetails.phoneNumber}</div>
                    <div><span className="font-medium text-slate-700">Email:</span> {fetchedDetails.email}</div>
                    <div><span className="font-medium text-slate-700">Current Acreage:</span> {fetchedDetails.currentAcreage} acres</div>
                    <div><span className="font-medium text-slate-700">Crop Type:</span> {fetchedDetails.cropType}</div>
                  </>
                ) : (
                  <>
                    <div><span className="font-medium text-slate-700">Name:</span> {fetchedDetails.clientName}</div>
                    <div><span className="font-medium text-slate-700">Company:</span> {fetchedDetails.companyName}</div>
                    <div><span className="font-medium text-slate-700">Phone:</span> {fetchedDetails.phoneNumber}</div>
                    <div><span className="font-medium text-slate-700">Email:</span> {fetchedDetails.email}</div>
                    <div><span className="font-medium text-slate-700">Total Farms:</span> {fetchedDetails.totalFarms}</div>
                    <div><span className="font-medium text-slate-700">Total Acreage:</span> {fetchedDetails.totalAcreage} acres</div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Monthly Acreage Inputs */}
          {fetchedDetails && !isLoading && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Acreage Values by Duration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">1 Month</label>
                  <input
                    type="number"
                    step="0.01"
                    value={oneMonthAcreage}
                    onChange={(e) => setOneMonthAcreage(e.target.value)}
                    placeholder="Enter acreage"
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">6 Months</label>
                  <input
                    type="number"
                    step="0.01"
                    value={sixMonthAcreage}
                    onChange={(e) => setSixMonthAcreage(e.target.value)}
                    placeholder="Enter acreage"
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">12 Months</label>
                  <input
                    type="number"
                    step="0.01"
                    value={twelveMonthAcreage}
                    onChange={(e) => setTwelveMonthAcreage(e.target.value)}
                    placeholder="Enter acreage"
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Acreage
          </button>

          {/* Success/Error Message */}
          {message && (
            <p className={`mt-3 text-sm ${message.includes('added') ? 'text-green-700' : 'text-red-700'}`}>
              {message}
            </p>
          )}
        </div>

        {/* Recent Submissions Section */}
        <div className="mt-6 p-4 border border-slate-200 rounded-xl bg-slate-50">
          <h2 className="font-semibold text-slate-900">Recent Submissions</h2>
          <p className="text-sm text-slate-600 mt-1">No recent additions yet.</p>
        </div>
      </div>
    </div>
  );
}
