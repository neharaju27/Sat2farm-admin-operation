import { useState } from 'react';

export default function UnlockFarm({ user }) {
  const [farmId, setFarmId] = useState('');
  const [status, setStatus] = useState('unlock');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [expiry, setExpiry] = useState('3 month');
  const [customExpiry, setCustomExpiry] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!farmId.trim()) {
      setMessage('Please enter a Farm ID.');
      return;
    }

    const statusText = status === 'lock' ? 'locked' : 'unlocked';
    let expiryValue = '';
    if (status === 'unlock') {
      if (!paymentMode.trim()) {
        setMessage('Please select a mode of payment.');
        return;
      }
      expiryValue = expiry === 'other' ? customExpiry.trim() : expiry;
      if (!expiryValue) {
        setMessage('Please select or enter expiry.');
        return;
      }
    }

    setMessage(`Farm ID ${farmId.trim()} has been ${statusText}.`);
    setFarmId('');
    setStatus('unlock');
    setPaymentMode('cash');
    setExpiry('3 month');
    setCustomExpiry('');
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
              <label className="block text-sm font-medium text-slate-700 mt-3">Mode of Payment</label>
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

              <label className="block text-sm font-medium text-slate-700 mt-3">Expiry</label>
              <select
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="3 month">3 Month</option>
                <option value="6 month">6 Month</option>
                <option value="1 year">1 Year</option>
                <option value="other">Other</option>
              </select>
              {expiry === 'other' && (
                <input
                  type="text"
                  value={customExpiry}
                  onChange={(e) => setCustomExpiry(e.target.value)}
                  placeholder="Enter custom expiry (e.g. 2 month)"
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No payment/expiry required for lock.</p>
          )}

          <button
            onClick={handleSubmit}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Update Status
          </button>
          {message && <p className="mt-2 text-sm text-green-700">{message}</p>}
        </div>
      </div>
    </div>
  );
}
