import { useState } from 'react';

export default function AddAcreages({ user }) {
  const [inputType, setInputType] = useState('registeredNumber');
  const [registeredNumber, setRegisteredNumber] = useState('');
  const [clientId, setClientId] = useState('');
  const [acreage, setAcreage] = useState('');
  const [message, setMessage] = useState('');
  const [fetchedDetails, setFetchedDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [operationResults, setOperationResults] = useState([]);

  const fetchDetails = async (identifier, type) => {
    if (!identifier.trim()) {
      setFetchedDetails(null);
      return;
    }

    setIsLoading(true);
    setFetchedDetails(null);

    try {
      console.log('=== FETCH DETAILS DEBUG ===');
      console.log('Input type:', type);
      console.log('Identifier:', identifier);
      
      const apiUrl = import.meta.env.VITE_FETCH_UNIT_LIMIT_API_URL;
      const queryParam = type === 'registeredNumber' ? `username=${identifier}` : `client_id=${identifier}`;
      const fullUrl = `${apiUrl}?${queryParam}`;
      
      console.log('Base API URL:', apiUrl);
      console.log('Query parameter:', queryParam);
      console.log('Full URL being called:', fullUrl);
      console.log('==========================');
      
      const response = await fetch(
        fullUrl,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API call failed with status ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API Response Data:', data);
      
      // Process the API response and format it for display
      const details = type === 'registeredNumber' ? {
        clientName: data.client_id || 'N/A',
        companyName: data.full_name || 'N/A',
        totalAcreage: data.unit_limit || 0
      } : type === 'clientId' ? {
        clientName: data.client_id || 'N/A',
        companyName: data.full_name || 'N/A',
        totalAcreage: data.unit_limit || 0
      } : {
        farmerName: data.client_id || 'N/A',
        companyName: data.full_name || 'N/A',
        totalAcreage: data.unit_limit || 0
      };
      
      setFetchedDetails(details); 
    } catch (error) {
      console.error('Error fetching details:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      
      // Check if it's a 404 error (client not found)
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        setMessage(`Client ID ${identifier} not found in the system. Please check the ID and try again.`);
      } else if (error.message.includes('Failed to fetch') || error.message.includes('TypeError')) {
        setMessage(`Network error: Unable to connect to the server. Please check your internet connection and try again.`);
      } else {
        setMessage(`Error fetching details: ${error.message}`);
      }
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

  const handleSubmit = async () => {
    if (inputType === 'registeredNumber' && !registeredNumber.trim()) {
      setMessage('Please enter a registered number.');
      return;
    }
    if (inputType === 'clientId' && !clientId.trim()) {
      setMessage('Please enter a client ID.');
      return;
    }
    if (!acreage.trim()) {
      setMessage('Please enter acreage value.');
      return;
    }

    const identifier = inputType === 'registeredNumber' ? registeredNumber.trim() : clientId.trim();
    const totalAreaUpdated = parseFloat(acreage) || 0;
    
    try {
      // Call the API using full URL for add/delete operations
      const apiUrl = inputType === 'registeredNumber' 
        ? `https://api.sat2farm.com/sat2farm_admin_web/update_limit_area_sat2farm_admin_web?mobile_number=${identifier}&area_to_update=${totalAreaUpdated}&operation=add`
        : `https://api.sat2farm.com/sat2farm_admin_web/update_limit_area_sat2farm_admin_web?clientID=${identifier}&area_to_update=${totalAreaUpdated}&operation=add`;
      console.log('Add Acreage API Call:', apiUrl);
      
      const response = await fetch(
        apiUrl,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      console.log('Add Acreage Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API call failed with status ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Add Acreage API Response:', data);
      
      // Validate API response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid API response format');
      }
      
      // Generate operation result with the API response data
      const newResult = {
        client_id: data.data?.clientID || parseInt(identifier),
        current_unit_limit: data.data?.previous_unit_limit || 226,
        area_to_update: totalAreaUpdated,
        operation: "add",
        new_unit_limit: data.data?.new_unit_limit || (data.data?.previous_unit_limit || 226) + totalAreaUpdated
      };
      
      // Add to operation results
      setOperationResults(prev => [newResult, ...prev]);
      
      setMessage(`Acreage value (${totalAreaUpdated} acres) has been added for ${inputType === 'registeredNumber' ? 'registered number' : 'client ID'} ${identifier}.`);
      
      // Reset form
      setRegisteredNumber('');
      setClientId('');
      setAcreage('');
      setFetchedDetails(null);
      
    } catch (error) {
      console.error('Error updating limit area:', error);
      
      // Provide more specific error messages
      if (error.message.includes('Failed to fetch')) {
        setMessage('Network error: Unable to connect to the server. Please check your connection and try again.');
      } else if (error.message.includes('404')) {
        setMessage('API endpoint not found. Please check the server configuration.');
      } else if (error.message.includes('500')) {
        setMessage('Server error occurred. Please try again later.');
      } else {
        setMessage(`Error: ${error.message}`);
      }
    }
  };

  const handleDelete = async () => {
    if (inputType === 'registeredNumber' && !registeredNumber.trim()) {
      setMessage('Please enter a registered number.');
      return;
    }
    if (inputType === 'clientId' && !clientId.trim()) {
      setMessage('Please enter a client ID.');
      return;
    }
    if (!acreage.trim()) {
      setMessage('Please enter acreage value.');
      return;
    }

    const identifier = inputType === 'registeredNumber' ? registeredNumber.trim() : clientId.trim();
    const totalAreaUpdated = parseFloat(acreage) || 0;
    
    try {
      // Call API using full URL for add/delete operations
      const apiUrl = inputType === 'registeredNumber' 
        ? `https://api.sat2farm.com/sat2farm_admin_web/update_limit_area_sat2farm_admin_web?mobile_number=${identifier}&area_to_update=${totalAreaUpdated}&operation=sub`
        : `https://api.sat2farm.com/sat2farm_admin_web/update_limit_area_sat2farm_admin_web?clientID=${identifier}&area_to_update=${totalAreaUpdated}&operation=sub`;
      console.log('Delete Acreage API Call:', apiUrl);
      
      const response = await fetch(
        apiUrl,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      console.log('Delete Acreage Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API call failed with status ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Delete Acreage API Response:', data);
      
      // Validate API response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid API response format');
      }
      
      // Generate operation result with the API response data
      const newResult = {
        client_id: data.data?.clientID || parseInt(identifier),
        current_unit_limit: data.data?.previous_unit_limit || 226,
        area_to_update: totalAreaUpdated,
        operation: "delete",
        new_unit_limit: data.data?.new_unit_limit || (data.data?.previous_unit_limit || 226) - totalAreaUpdated
      };
      
      // Add to operation results
      setOperationResults(prev => [newResult, ...prev]);
      
      setMessage(`Acreage value (${totalAreaUpdated} acres) has been deleted for ${inputType === 'registeredNumber' ? 'registered number' : 'client ID'} ${identifier}.`);
      
      // Reset form
      setRegisteredNumber('');
      setClientId('');
      setAcreage('');
      setFetchedDetails(null);
      
    } catch (error) {
      console.error('Error updating limit area:', error);
      
      // Provide more specific error messages
      if (error.message.includes('Failed to fetch')) {
        setMessage('Network error: Unable to connect to the server. Please check your connection and try again.');
      } else if (error.message.includes('404')) {
        setMessage('API endpoint not found. Please check the server configuration.');
      } else if (error.message.includes('500')) {
        setMessage('Server error occurred. Please try again later.');
      } else {
        setMessage(`Error: ${error.message}`);
      }
    }
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
                    <div><span className="font-medium text-slate-700">Client Id:</span> {fetchedDetails.clientName}</div>
                    <div><span className="font-medium text-slate-700">Company:</span> {fetchedDetails.companyName}</div>
                    <div><span className="font-medium text-slate-700">Current Acreage:</span> {fetchedDetails.totalAcreage} acres</div>
                  </>
                ) : (
                  <>
                    <div><span className="font-medium text-slate-700">Client Id:</span> {fetchedDetails.clientName}</div>
                    <div><span className="font-medium text-slate-700">Company:</span> {fetchedDetails.companyName}</div>
                    <div><span className="font-medium text-slate-700">Total Acreage:</span> {fetchedDetails.totalAcreage} acres</div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Acreage Input */}
          {fetchedDetails && !isLoading && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Acreage Value</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700">Acreage</label>
                <input
                  type="number"
                  step="0.01"
                  value={acreage}
                  onChange={(e) => setAcreage(e.target.value)}
                  placeholder="Enter acreage"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Acreage
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Delete Acreage
            </button>
          </div>

          {/* Success/Error Message */}
          {message && (
            <p className={`mt-3 text-sm ${message.includes('added') ? 'text-green-700' : 'text-red-700'}`}>
              {message}
            </p>
          )}
        </div>

        {/* Operation Results Table */}
        {operationResults.length > 0 && (
          <div className="mt-6 p-4 border border-slate-200 rounded-xl bg-slate-50">
            <h2 className="font-semibold text-slate-900 mb-4">Operation Results</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-slate-200 rounded-lg">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-slate-700 border-b">Client ID</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-slate-700 border-b">Previous Unit Limit</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-slate-700 border-b">Area Updated</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-slate-700 border-b">Operation</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-slate-700 border-b">New Unit Limit</th>
                  </tr>
                </thead>
                <tbody>
                  {operationResults.map((result, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-sm text-slate-800 border-b">{result.client_id}</td>
                      <td className="px-4 py-2 text-sm text-slate-800 border-b">{result.current_unit_limit}</td>
                      <td className="px-4 py-2 text-sm text-slate-800 border-b">{result.area_to_update}</td>
                      <td className="px-4 py-2 text-sm text-slate-800 border-b">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          result.operation === 'add' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {result.operation}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-slate-800 border-b">{result.new_unit_limit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
