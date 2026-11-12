import React, { useState, useEffect } from 'react';
import { Check, X, CreditCard, DollarSign, Building, User, Calendar, RefreshCw, Loader2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentApproval = ({ user }) => {
  const userRole = (user?.role || user?.user_role || user?.type || '').toLowerCase().trim();
  const isAccountsRole = userRole === 'accounts';
  const isOperationRole = userRole === 'operation' || userRole === 'operations' || userRole === 'ops';
  const canApprove = isAccountsRole || isOperationRole;

  const [pendingPaymentApprovals, setPendingPaymentApprovals] = useState([]);
  const [loadingPaymentApprovals, setLoadingPaymentApprovals] = useState(false);
  const [pendingInvoiceApprovals, setPendingInvoiceApprovals] = useState([]);
  const [loadingInvoiceApprovals, setLoadingInvoiceApprovals] = useState(false);
  const [activeTab, setActiveTab] = useState('payment');

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
    if (canApprove) {
      fetchPendingPaymentApprovals();
      fetchPendingInvoiceApprovals();
    }
  }, [canApprove]);

  // Fetch pending payment received approvals
  const fetchPendingPaymentApprovals = async () => {
    if (!canApprove) return;

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
        const hasInvoiceDate = deal.invoice_received_time && deal.invoice_received_time !== '';
        // Show null only if: has payment date, is in Invoiced, has NO invoice date (created directly as Paid), and no previous_stage
        const shouldShowNullCurrentStage = hasPaymentTime && isInvoicedStage && !hasInvoiceDate && !hasPreviousStage;

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

  // Fetch pending invoice approvals
  const fetchPendingInvoiceApprovals = async () => {
    if (!canApprove) return;

    try {
      setLoadingInvoiceApprovals(true);
      const approvalUrl = import.meta.env.VITE_INVOICE_RECEIVED_APPROVAL_API_URL;

      if (!approvalUrl) {
        console.error('Invoice Received Approval API URL not configured');
        setPendingInvoiceApprovals([]);
        return;
      }

      const currentUserName = getApiUserName(user);
      const authToken = getAuthToken();
      // For invoice approvals, don't filter by user to show all pending invoices
      const response = await fetch(`${approvalUrl}?status=pending`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        console.warn('Invoice approval API returned error:', response.status);
        setPendingInvoiceApprovals([]);
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
        const hasPreviousStage = deal.previous_stage && deal.previous_stage !== '';
        const hasInvoiceDate = deal.invoice_received_time && deal.invoice_received_time !== '';
        const currentDealStage = deal.deal_stage || deal.current_stage || '';

        return {
          deal_id: deal.deal_id || deal.id,
          deal_name: deal.deal_name || deal.name,
          account_number: deal.account_number || deal.account_name,
          deal_amount: deal.deal_amount || deal.amount,
          deal_owner: deal.deal_owner || deal.owner,
          invoice_received_time: deal.invoice_received_time,
          current_stage: hasPreviousStage ? deal.previous_stage : (currentDealStage || 'Proposal'),
          requested_stage: deal.requested_stage || 'Invoiced'
        };
      });

      setPendingInvoiceApprovals(transformedDeals);
    } catch (err) {
      console.error('Error fetching pending invoice approvals:', err);
      setPendingInvoiceApprovals([]);
    } finally {
      setLoadingInvoiceApprovals(false);
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

  // Decline payment received (keep deal in previous stage and nullify payment date)
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

        console.log('Nullifying payment-date API:', paymentRequestBody);

        const paymentResponse = await fetch(paymentTimeUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(paymentRequestBody),
        });

        if (paymentResponse.ok) {
          const paymentResult = await paymentResponse.json();
          console.log('Payment date nullified API response:', paymentResult);
          if (paymentResult.error) {
            console.error('API returned error:', paymentResult.error);
          }
        } else {
          const errorText = await paymentResponse.text();
          console.error('Failed to nullify payment date:', paymentResponse.status, errorText);
        }
      } else {
        console.error('Payment Date API URL not configured');
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
        toast.success(`Payment declined, date nullified, and deal moved back to ${targetStage} stage`);
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

  // Approve invoice (move to Invoiced stage)
  const handleApproveInvoice = async (dealId) => {
    try {
      toast.loading('Approving invoice...', { id: 'approve-invoice-toast' });

      const currentUserName = getApiUserName(user);
      const apiUrl = import.meta.env.VITE_UPDATE_DEAL_API_URL;
      if (!apiUrl) {
        toast.dismiss('approve-invoice-toast');
        toast.error('Update Deal API URL not configured');
        return;
      }

      // Move deal to Invoiced stage
      const stageUrl = `${apiUrl}?deal_id=${encodeURIComponent(dealId)}&deal_stage=Invoiced&user=${encodeURIComponent(currentUserName)}`;

      const stageResponse = await fetch(stageUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deal_id: dealId,
          deal_stage: 'Invoiced',
          user: currentUserName,
        }),
      });

      if (!stageResponse.ok) {
        if (stageResponse.status === 403) {
          throw new Error('Permission denied: You do not have permission to update deals. Please contact the backend team to grant necessary permissions.');
        }
        throw new Error(`HTTP error! status: ${stageResponse.status}`);
      }

      const stageResult = await stageResponse.json();
      console.log('Stage update response:', stageResult);

      toast.dismiss('approve-invoice-toast');
      if (stageResult.success || stageResult.message) {
        toast.success('Invoice approved and deal moved to Invoiced stage');
        fetchPendingInvoiceApprovals();
      } else {
        toast.error('Failed to approve invoice');
      }
    } catch (err) {
      console.error('Error approving invoice:', err);
      toast.dismiss('approve-invoice-toast');
      toast.error(err.message || 'Failed to approve invoice');
    }
  };

  // Decline invoice (keep deal in previous stage and nullify invoice date)
  const handleDeclineInvoice = async (dealId, previousStage) => {
    try {
      toast.loading('Declining invoice...', { id: 'decline-invoice-toast' });

      const currentUserName = getApiUserName(user);
      const invoiceTimeUrl = import.meta.env.VITE_INVOICE_RECEIVED_TIME_API_URL;

      // First, set invoice_received_time to null
      if (invoiceTimeUrl) {
        const invoiceRequestBody = {
          deal_id: dealId,
          invoice_received_time: null,
          changed_by: currentUserName
        };

        console.log('Nullifying invoice-date API:', invoiceRequestBody);

        const invoiceResponse = await fetch(invoiceTimeUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(invoiceRequestBody),
        });

        if (invoiceResponse.ok) {
          const invoiceResult = await invoiceResponse.json();
          console.log('Invoice date nullified API response:', invoiceResult);
          if (invoiceResult.error) {
            console.error('API returned error:', invoiceResult.error);
          }
        } else {
          const errorText = await invoiceResponse.text();
          console.error('Failed to nullify invoice date:', invoiceResponse.status, errorText);
        }
      } else {
        console.error('Invoice Date API URL not configured');
      }

      // Then, move deal back to previous stage
      const apiUrl = import.meta.env.VITE_UPDATE_DEAL_API_URL;
      if (!apiUrl) {
        toast.dismiss('decline-invoice-toast');
        toast.error('Update Deal API URL not configured');
        return;
      }

      const targetStage = previousStage || 'Proposal';
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
          throw new Error('Permission denied: You do not have permission to update deals. Please contact the backend team to grant necessary permissions.');
        }
        throw new Error(`HTTP error! status: ${stageResponse.status}`);
      }

      const stageResult = await stageResponse.json();
      console.log('Stage update response:', stageResult);

      toast.dismiss('decline-invoice-toast');
      if (stageResult.success || stageResult.message) {
        toast.success(`Invoice declined, date nullified, and deal moved back to ${targetStage} stage`);
        fetchPendingInvoiceApprovals();
      } else {
        toast.error('Failed to decline invoice');
      }
    } catch (err) {
      console.error('Error declining invoice:', err);
      toast.dismiss('decline-invoice-toast');
      toast.error(err.message || 'Failed to decline invoice');
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
              Approvals
            </h3>
            <p style={{ margin: '8px 0 0 0', color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px' }}>
              {pendingPaymentApprovals.length + pendingInvoiceApprovals.length} approval(s) pending
            </p>
          </div>
          <button
            onClick={() => {
              fetchPendingPaymentApprovals();
              fetchPendingInvoiceApprovals();
            }}
            disabled={loadingPaymentApprovals || loadingInvoiceApprovals}
            style={{
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 'var(--r)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: (loadingPaymentApprovals || loadingInvoiceApprovals) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.2s'
            }}
          >
            {(loadingPaymentApprovals || loadingInvoiceApprovals) ? (
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

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button
            onClick={() => setActiveTab('payment')}
            style={{
              padding: '8px 16px',
              background: activeTab === 'payment' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: activeTab === 'payment' ? '1px solid rgba(255, 255, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--r)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.2s'
            }}
          >
            <CreditCard size={16} />
            Payment Approvals
            {pendingPaymentApprovals.length > 0 && (
              <span style={{
                background: '#10b981',
                color: 'white',
                fontSize: '10px',
                fontWeight: '600',
                minWidth: '18px',
                height: '18px',
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 6px'
              }}>
                {pendingPaymentApprovals.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('invoice')}
            style={{
              padding: '8px 16px',
              background: activeTab === 'invoice' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: activeTab === 'invoice' ? '1px solid rgba(255, 255, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--r)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.2s'
            }}
          >
            <FileText size={16} />
            Invoice Approvals
            {pendingInvoiceApprovals.length > 0 && (
              <span style={{
                background: '#06b6d4',
                color: 'white',
                fontSize: '10px',
                fontWeight: '600',
                minWidth: '18px',
                height: '18px',
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 6px'
              }}>
                {pendingInvoiceApprovals.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        {activeTab === 'payment' ? (
          <>
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
                      <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>Payment Date:</span>
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
          </>
        ) : (
          <>
            {loadingInvoiceApprovals ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid #06b6d4',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                  margin: '0 auto 16px'
                }} />
                <p style={{ color: 'var(--text-3)', fontSize: '14px' }}>Loading pending invoice approvals...</p>
              </div>
            ) : pendingInvoiceApprovals.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: 'var(--gray-50)',
                borderRadius: '12px',
                border: '1px dashed var(--border)'
              }}>
                <span style={{ fontSize: '48px', color: '#06b6d4', marginBottom: '12px', display: 'block' }}>📄</span>
                <p style={{ color: 'var(--text-3)', fontSize: '14px', margin: 0 }}>
                  No pending invoice approvals
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pendingInvoiceApprovals.map((deal) => (
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
                        <span style={{ color: 'var(--text)', fontWeight: '500', marginLeft: '4px' }}>
                          {deal.current_stage || 'Proposal'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>Requested Stage:</span>
                        <span style={{ color: '#06b6d4', fontWeight: '500', marginLeft: '4px' }}>
                          {deal.requested_stage || 'Invoiced'}
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
                      <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>Invoice Date:</span>
                      <span style={{ color: 'var(--text)', fontWeight: '500', marginLeft: '4px' }}>
                        {deal.invoice_received_time || '-'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleApproveInvoice(deal.deal_id || deal.id)}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
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
                        onClick={() => handleDeclineInvoice(deal.deal_id || deal.id, deal.current_stage)}
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
          </>
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
