import { useState } from 'react';

export default function UnlockFarm({ user }) {
  const [farmId, setFarmId] = useState('');
  const [status, setStatus] = useState('unlock');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [expiry, setExpiry] = useState('6');
  const [customExpiry, setCustomExpiry] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!farmId.trim()) {
      setError('Please enter a Farm ID.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Map status to lockstatus: unlock -> 1, lock -> 0 (reversed based on API behavior)
      const lockStatus = status === 'lock' ? 0 : 1;
      
      console.log('Form status:', status);
      console.log('Mapped lockstatus:', lockStatus);
      console.log('Farm ID:', farmId.trim());
      
      // Map expiry to numeric value
      let expiryValue = expiry;
      if (expiry === 'other') {
        expiryValue = customExpiry.trim();
      }
      
      // Construct API URL
      const apiUrl = `${import.meta.env.VITE_UNLOCK_FARM_API_URL}?farm_id=${farmId.trim()}&lockstatus=${lockStatus}&mode=${paymentMode}&expiry=${expiryValue}`;
      
      console.log('Calling API:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json().catch(err => {
        console.log('Response is not JSON, trying to get text:', err);
        return response.text().then(text => {
          console.log('Response text:', text);
          return { rawResponse: text };
        });
      });
      console.log('API Response:', data);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Check if the API call was successful based on response data
      if (data && data.status !== 'Failure') {
        const statusText = status === 'lock' ? 'locked' : 'unlocked';
        setMessage(`Farm ID ${farmId.trim()} has been ${statusText} successfully!`);
      } else {
        // Show the API message directly to the user
        const apiMessage = data?.message || 'API returned an error';
        console.log('API indicates failure:', apiMessage);
        setError(apiMessage);
        return; // Don't throw error, just set error message
      }
      
      // Reset form
      setFarmId('');
      setStatus('unlock');
      setPaymentMode('cash');
      setExpiry('6');
      setCustomExpiry('');
      
    } catch (err) {
      console.error('API Error:', err);
      setError(`Failed to update farm status: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full p-6 bg-slate-50 text-slate-800 overflow-auto">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900">Unlock Farm</h1>
        <p className="mt-2 text-slate-600">Enter Farm ID and select lock status.</p>

        <div className="mt-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
          <label className="block text-sm font-medium text-slate-700">Farm ID</label>
          <input
            type="text"
            value={farmId}
            onChange={(e) => setFarmId(e.target.value)}
            placeholder="Enter Farm ID"
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="block text-sm font-medium text-slate-700 mt-3">Lock Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="lock">Lock</option>
            <option value="unlock">Unlock</option>
          </select>

          {status === 'unlock' ? (
            <>
              <label className="block text-sm font-medium text-slate-700 mt-3">Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="netbanking">Netbanking</option>
              </select>

              <label className="block text-sm font-medium text-slate-700 mt-3">Expiry (in months)</label>
              <select
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="3">3</option>
                <option value="6">6</option>
                <option value="12">12</option>
                <option value="other">Other</option>
              </select>
              {expiry === 'other' && (
                <input
                  type="text"
                  value={customExpiry}
                  onChange={(e) => setCustomExpiry(e.target.value)}
                  placeholder="Enter custom expiry (e.g. 2)"
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No payment/expiry required for lock.</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Update Status'}
          </button>
          {message && <p className="mt-2 text-sm text-green-700">{message}</p>}
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        </div>
      </div>
    </div>
  );
}
