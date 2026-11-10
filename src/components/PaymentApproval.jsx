import React, { useState, useEffect } from 'react';
import { Check, X, CreditCard, DollarSign, Building, User, Calendar, RefreshCw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentApproval = ({ user }) => {
  const userRole = (user?.role || user?.user_role || user?.type || '').toLowerCase().trim();
  const isAccountsRole = userRole === 'accounts';

  const [pendingPaymentApprovals, setPendingPaymentApprovals] = useState([]);
  const [loadingPaymentApprovals, setLoadingPaymentApprovals] = useState(false);

  // Helper to normalize user parameter for backend API
  const getApiUserName = (u) => {
    if (typeof u === 'string') return u.trim();
    let name = u?.username || u?.user_name || u?.name || '';
    if (!name) {
      try {
        const stored = localStorage.getItem('sat2farm_auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          name = parsed?.username || parsed?.user_name || parsed?.name || '';
        }
      } catch (e) {
        // ignore
      }
    }
    if (!name) {
      name = localStorage.getItem('username') || '';
    }
    return typeof name === 'string' ? name.trim() : String(name || '').trim();
  };

  // Helper to get auth token
  const getAuthToken = () => {
    let token = user?.jwt || user?.token || '';
    if (!token) {
      try {
        const stored = localStorage.getItem('sat2farm_auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          token = parsed?.jwt || parsed?.token || '';
        }
      } catch (e) {
        // ignore
      }
    }
    return token;
  };

  // Fetch pending payment approvals on mount
  useEffect(() => {
    if (isAccountsRole) {
      fetchPendingPaymentApprovals();
    }
  }, [isAccountsRole]);

  // Fetch pending payment received approvals
  const fetchPendingPaymentApprovals = async () => {
    if (!isAccountsRole) return;

    try {
      setLoadingPaymentApprovals(true);
      const approvalUrl = import.meta.env.VITE_PAYMENT_RECEIVED_APPROVAL_API_URL;

      if (!approvalUrl) {
        console.error('Payment Received Approval API URL not configured');
        setPendingPaymentApprovals([]);
        return;
      }

      const currentUserName = getApiUserName(user);
      const authToken = getAuthToken();
      const response = await fetch(`${approvalUrl}?status=pending&user=${encodeURIComponent(currentUserName)}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        console.warn('Payment approval API returned error:', response.status);
        setPendingPaymentApprovals([]);
        return;
      }

      const result = await response.json();
      // Handle nested data structure: { data: { data: [...] } }
      const dealsList = Array.isArray(result) ? result :
        (Array.isArray(result.data) ? result.data :
          (result.data && Array.isArray(result.data.data) ? result.data.data :
            (Array.isArray(result.results) ? result.results :
              (Array.isArray(result.deals) ? result.deals :
                (Array.isArray(result.approvals) ? result.approvals : [])))));

      // Transform deals to match the format expected by the UI
      const transformedDeals = dealsList.map(deal => {
        // Use previous_stage if available (from kanban move), otherwise use actual deal_stage
        // Only show null if deal was created with Paid stage intent (no previous_stage and deal was never in another stage)
        const hasPreviousStage = deal.previous_stage && deal.previous_stage !== '';
        const hasPaymentTime = deal.payment_received_time && deal.payment_received_time !== '';
        const isInvoicedStage = deal.deal_stage === 'Invoiced';
        const hasInvoiceTime = deal.invoice_received_time && deal.invoice_received_time !== '';
        // Show null only if: has payment time, is in Invoiced, has NO invoice time (created directly as Paid), and no previous_stage
        const shouldShowNullCurrentStage = hasPaymentTime && isInvoicedStage && !hasInvoiceTime && !hasPreviousStage;

        return {
          deal_id: deal.deal_id || deal.id,
          deal_name: deal.deal_name || deal.name,
          account_number: deal.account_number || deal.account_name,
          deal_amount: deal.deal_amount || deal.amount,
          deal_owner: deal.deal_owner || deal.owner,
          payment_received_time: deal.payment_received_time,
          current_stage: hasPreviousStage ? deal.previous_stage : (shouldShowNullCurrentStage ? null : (deal.current_stage || deal.deal_stage || 'Invoiced')),
          requested_stage: deal.requested_stage || 'Paid'
        };
      });

      setPendingPaymentApprovals(transformedDeals);
    } catch (err) {
      console.error('Error fetching pending payment approvals:', err);
      setPendingPaymentApprovals([]);
    } finally {
      setLoadingPaymentApprovals(false);
    }
  };

  // Approve payment received (move to Paid stage)
  const handleApprovePayment = async (dealId) => {
    try {
      toast.loading('Approving payment received...', { id: 'approve-payment-toast' });

      const currentUserName = getApiUserName(user);
      const apiUrl = import.meta.env.VITE_UPDATE_DEAL_API_URL;
      if (!apiUrl) {
        toast.dismiss('approve-payment-toast');
        toast.error('Update Deal API URL not configured');
        return;
      }

      // Move deal to Paid stage
      const stageUrl = `${apiUrl}?deal_id=${encodeURIComponent(dealId)}&deal_stage=Paid&user=${encodeURIComponent(currentUserName)}`;

      const stageResponse = await fetch(stageUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deal_id: dealId,
          deal_stage: 'Paid',
          user: currentUserName,
        }),
      });

      if (!stageResponse.ok) {
        if (stageResponse.status === 403) {
          throw new Error('Permission denied: Accounts user does not have permission to update deals. Please contact the backend team to grant necessary permissions.');
        }
        throw new Error(`HTTP error! status: ${stageResponse.status}`);
      }

      const stageResult = await stageResponse.json();
      console.log('Stage update response:', stageResult);

      toast.dismiss('approve-payment-toast');
      if (stageResult.success || stageResult.message) {
        toast.success('Payment approved and deal moved to Paid stage');
        fetchPendingPaymentApprovals();
      } else {
        toast.error('Failed to approve payment');
      }
    } catch (err) {
      console.error('Error approving payment:', err);
      toast.dismiss('approve-payment-toast');
      toast.error(err.message || 'Failed to approve payment');
    }
  };

  // Decline payment received (keep deal in previous stage and nullify payment time)
  const handleDeclinePayment = async (dealId, previousStage) => {
    try {
      toast.loading('Declining payment received...', { id: 'decline-payment-toast' });

      const currentUserName = getApiUserName(user);
      const paymentTimeUrl = import.meta.env.VITE_PAYMENT_RECEIVED_TIME_API_URL;

      // First, set payment_received_time to null
      if (paymentTimeUrl) {
        const paymentRequestBody = {
          deal_id: dealId,
          payment_received_time: null,
          changed_by: currentUserName
        };

        console.log('Nullifying payment-time API:', paymentRequestBody);

        const paymentResponse = await fetch(paymentTimeUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(paymentRequestBody),
        });

        if (paymentResponse.ok) {
          const paymentResult = await paymentResponse.json();
          console.log('Payment time nullified API response:', paymentResult);
          if (paymentResult.error) {
            console.error('API returned error:', paymentResult.error);
          }
        } else {
          const errorText = await paymentResponse.text();
          console.error('Failed to nullify payment time:', paymentResponse.status, errorText);
        }
      } else {
        console.error('Payment Received Time API URL not configured');
      }

      // Then, move deal back to previous stage
      const apiUrl = import.meta.env.VITE_UPDATE_DEAL_API_URL;
      if (!apiUrl) {
        toast.dismiss('decline-payment-toast');
        toast.error('Update Deal API URL not configured');
        return;
      }

      const targetStage = previousStage || 'Invoiced';
      const stageUrl = `${apiUrl}?deal_id=${encodeURIComponent(dealId)}&deal_stage=${encodeURIComponent(targetStage)}&user=${encodeURIComponent(currentUserName)}`;

      const stageResponse = await fetch(stageUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deal_id: dealId,
          deal_stage: targetStage,
          user: currentUserName,
        }),
      });

      if (!stageResponse.ok) {
        if (stageResponse.status === 403) {
          throw new Error('Permission denied: Accounts user does not have permission to update deals. Please contact the backend team to grant necessary permissions.');
        }
        throw new Error(`HTTP error! status: ${stageResponse.status}`);
      }

      const stageResult = await stageResponse.json();
      console.log('Stage update response:', stageResult);

      toast.dismiss('decline-payment-toast');
      if (stageResult.success || stageResult.message) {
        toast.success(`Payment declined, time nullified, and deal moved back to ${targetStage} stage`);
        fetchPendingPaymentApprovals();
      } else {
        toast.error('Failed to decline payment');
      }
    } catch (err) {
      console.error('Error declining payment:', err);
      toast.dismiss('decline-payment-toast');
      toast.error(err.message || 'Failed to decline payment');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        padding: '20px 24px',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: '600' }}>
              Payment Approvals
            </h3>
            <p style={{ margin: '8px 0 0 0', color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px' }}>
              {pendingPaymentApprovals.length} payment(s) pending approval
            </p>
          </div>
          <button
            onClick={fetchPendingPaymentApprovals}
            disabled={loadingPaymentApprovals}
            style={{
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 'var(--r)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: loadingPaymentApprovals ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.2s'
            }}
          >
            {loadingPaymentApprovals ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        {loadingPaymentApprovals ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #8b5cf6',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ color: 'var(--text-3)', fontSize: '14px' }}>Loading pending payment approvals...</p>
          </div>
        ) : pendingPaymentApprovals.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: 'var(--gray-50)',
            borderRadius: '12px',
            border: '1px dashed var(--border)'
          }}>
            <span style={{ fontSize: '48px', color: '#10b981', marginBottom: '12px', display: 'block' }}>₹</span>
            <p style={{ color: 'var(--text-3)', fontSize: '14px', margin: 0 }}>
              No pending payment approvals
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendingPaymentApprovals.map((deal) => (
              <div
                key={deal.deal_id || deal.id}
                style={{
                  background: 'white',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div style={{ marginBottom: '12px' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600', color: 'var(--text)' }}>
                    {deal.deal_name || 'Unnamed Deal'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-3)' }}>
                    {deal.account_number || 'No Account Number'}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>Current Stage:</span>
                    <span style={{ color: deal.current_stage === null ? '#6b7280' : 'var(--text)', fontWeight: '500', marginLeft: '4px' }}>
                      {deal.current_stage === null ? 'null' : (deal.current_stage || 'Invoiced')}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>Requested Stage:</span>
                    <span style={{ color: '#10b981', fontWeight: '500', marginLeft: '4px' }}>
                      {deal.requested_stage || 'Paid'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>Amount:</span>
                    <span style={{ color: 'var(--text)', fontWeight: '500', marginLeft: '4px' }}>
                      {deal.deal_amount ? `₹${deal.deal_amount}` : '-'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>Deal Owner:</span>
                    <span style={{ color: 'var(--text)', fontWeight: '500', marginLeft: '4px' }}>
                      {deal.deal_owner || '-'}
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: '12px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>Payment Time:</span>
                  <span style={{ color: 'var(--text)', fontWeight: '500', marginLeft: '4px' }}>
                    {deal.payment_received_time || '-'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleApprovePayment(deal.deal_id || deal.id)}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Check size={16} /> Approve
                  </button>
                  <button
                    onClick={() => handleDeclinePayment(deal.deal_id || deal.id, deal.current_stage)}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <X size={16} /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PaymentApproval;
