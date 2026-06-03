import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Plus, Edit, Trash2, Eye, Phone, Mail, Calendar, MapPin, TrendingUp, Users, DollarSign, Activity, ChevronDown, ChevronRight, ChevronLeft, X, Check, Clock, AlertCircle, FileText, Upload, Building2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/Sat2FarmAdminPortal.css';

export default function Opportunities({ onPageChange }) {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch opportunities from API
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        const currentUserName = user?.name || user?.phone_number || 'operation';
        
        const apiUrl = import.meta.env.VITE_LEADS_API_URL;
        if (!apiUrl) {
          console.log('Opportunities API URL not configured, using mock data');
          setOpportunities(getMockOpportunities());
          setError(null);
          setLoading(false);
          return;
        }
        
        const response = await fetch(`${apiUrl}?user=${encodeURIComponent(currentUserName)}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const transformedOpportunities = data.map(opp => ({
          id: opp.id,
          contactName: opp.full_name || 'Unknown',
          phoneNumber: opp.phone || '',
          alternateNumber: opp.alternate_number || '',
          email: opp.email || '',
          companyName: opp.company_name || '',
          contactOwner: opp.owner || 'Unassigned',
          city: opp.city || '',
          state: opp.state || '',
          country: opp.country || 'IN',
          leadStatus: opp.status || 'New',
          tags: opp.tags || '',
          leadSource: opp.lead_source || '',
          description: opp.description || '',
          createdTime: opp.created_time || new Date().toISOString(),
          industry: opp.industry || '',
          createdBy: opp.created_by || 'System',
          modifiedBy: opp.modified_by || 'System',
          lastActivity: opp.last_activity || new Date().toISOString(),
          accountName: opp.account_name || '',
          accountNumber: opp.account_number || '',
          dealPresent: opp.deal_present || false
        }));
        
        setOpportunities(transformedOpportunities);
        setError(null);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
        setOpportunities(getMockOpportunities());
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  const getMockOpportunities = () => [
    {
      id: 1,
      contactName: 'John Smith',
      phoneNumber: '+91 9876543210',
      alternateNumber: '+91 8765432109',
      email: 'john.smith@example.com',
      companyName: 'AgriTech Solutions',
      contactOwner: 'Sales Team',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'IN',
      leadStatus: 'Qualified',
      tags: 'enterprise, agriculture',
      leadSource: 'Website',
      description: 'Interested in farm management solution for 500 acres',
      createdTime: new Date().toISOString(),
      industry: 'Agriculture',
      createdBy: 'Admin',
      modifiedBy: 'Sales Team',
      lastActivity: new Date().toISOString(),
      accountName: 'AgriTech Solutions Pvt Ltd',
      accountNumber: 'ACC-001234',
      dealPresent: true
    },
    {
      id: 2,
      contactName: 'Priya Sharma',
      phoneNumber: '+91 9123456780',
      alternateNumber: '+91 9012345678',
      email: 'priya.sharma@farmcorp.com',
      companyName: 'FarmCorp India',
      contactOwner: 'Sales Team',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'IN',
      leadStatus: 'Contacted',
      tags: 'startup, technology',
      leadSource: 'Referral',
      description: 'Looking for satellite-based crop monitoring',
      createdTime: new Date(Date.now() - 86400000).toISOString(),
      industry: 'Technology',
      createdBy: 'Admin',
      modifiedBy: 'Sales Team',
      lastActivity: new Date(Date.now() - 43200000).toISOString(),
      accountName: 'FarmCorp India Ltd',
      accountNumber: 'ACC-001235',
      dealPresent: false
    },
    {
      id: 3,
      contactName: 'Rajesh Kumar',
      phoneNumber: '+91 9988776655',
      alternateNumber: '+91 9877665544',
      email: 'rajesh.kumar@greenfields.com',
      companyName: 'Green Fields Co',
      contactOwner: 'Operations',
      city: 'Delhi',
      state: 'Delhi',
      country: 'IN',
      leadStatus: 'Yet to Contact',
      tags: 'large-scale, organic',
      leadSource: 'Trade Show',
      description: 'Large scale organic farming operation',
      createdTime: new Date(Date.now() - 172800000).toISOString(),
      industry: 'Agriculture',
      createdBy: 'Admin',
      modifiedBy: 'System',
      lastActivity: new Date(Date.now() - 172800000).toISOString(),
      accountName: 'Green Fields Cooperative',
      accountNumber: 'ACC-001236',
      dealPresent: true
    }
  ];

  // ── Modal & editing state (mirrors LeadPipeline) ──────────────────────────
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [customStatus, setCustomStatus] = useState('');
  const [showCustomStatusInput, setShowCustomStatusInput] = useState(false);

  const [ownerDropdownOpen, setOwnerDropdownOpen] = useState(false);
  const [customOwner, setCustomOwner] = useState('');
  const [showCustomOwnerInput, setShowCustomOwnerInput] = useState(false);

  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false);
  const [customTags, setCustomTags] = useState('');
  const [showCustomTagsInput, setShowCustomTagsInput] = useState(false);

  const [leadSourceDropdownOpen, setLeadSourceDropdownOpen] = useState(false);
  const [customLeadSource, setCustomLeadSource] = useState('');
  const [showCustomLeadSourceInput, setShowCustomLeadSourceInput] = useState(false);

  const [industryDropdownOpen, setIndustryDropdownOpen] = useState(false);
  const [customIndustry, setCustomIndustry] = useState('');
  const [showCustomIndustryInput, setShowCustomIndustryInput] = useState(false);

  // ── Table / filter state ──────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [newThisWeekFilter, setNewThisWeekFilter] = useState(false);

  // ── Tab state for modal right panel ──────────────────────────────────────
  const [activeModalTab, setActiveModalTab] = useState('timeline');
  const [showCreateDealModal, setShowCreateDealModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskOwner, setTaskOwner] = useState('');
  const [dealName, setDealName] = useState('');
  const [dealCompanyName, setDealCompanyName] = useState('');
  const [dealContactName, setDealContactName] = useState('');
  const [dealClosingDate, setDealClosingDate] = useState('');
  const [dealStage, setDealStage] = useState('');
  const [dealAmount, setDealAmount] = useState('');
  const [dealDescription, setDealDescription] = useState('');

  // ── Static option lists (same as LeadPipeline) ───────────────────────────
  const statusConfig = {
    'Yet to Contact': { color: '#3b82f6', label: 'Yet to Contact' },
    'Attempted to Contact': { color: '#f59e0b', label: 'Attempted to Contact' },
    'Contacted': { color: '#8b5cf6', label: 'Contacted' },
    'Starter': { color: '#14b8a6', label: 'Starter' },
    'Growth': { color: '#0ea5e9', label: 'Growth' },
    'Enterprise': { color: '#6366f1', label: 'Enterprise' },
    'Follow-up 1': { color: '#10b981', label: 'Follow-up 1' },
    'Follow-up 2': { color: '#06b6d4', label: 'Follow-up 2' },
    'In Discussion': { color: '#8b5cf6', label: 'In Discussion' },
    'Interested': { color: '#10b981', label: 'Interested' },
    'Junk': { color: '#ef4444', label: 'Junk' }
  };

  const predefinedTags = [
    'Sat2Farm Recurring', 'Sat2Farm Non Recurring', 'Sat2Farm Exclusivity',
    'Sat4Agri', 'Sat4Risk', 'Project', 'WhiteLabelling', 'API Client'
  ];

  const predefinedLeadSources = [
    'FB Campaign', 'Website Inbound', 'Sales Inbound', 'Mail Inbound',
    'External Referral', 'Cold Call', 'Event'
  ];

  const predefinedIndustries = [
    'Farmer', 'FPO', 'NGO', 'Government', 'Enterprise', 'Agri Input', 'Agri Output'
  ];

  // ── Helper: unique contact owners ────────────────────────────────────────
  const getUniqueContactOwners = () => {
    return [...new Set(opportunities.map(o => o.contactOwner).filter(v => v && v.trim()))].sort();
  };

  // ── Editing helpers ───────────────────────────────────────────────────────
  const startEditing = (fieldName, currentValue) => {
    setEditingField(fieldName);
    setEditValue(currentValue || '');
  };

  const saveEdit = () => {
    if (editingField && editValue.trim() !== '') {
      handleFieldUpdate(selectedUser.id, editingField, editValue.trim());
      setEditingField(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  // ── Editable field component (identical to LeadPipeline) ─────────────────
  const EditableField = ({ label, value, fieldName, type = 'text' }) => {
    const isEditing = editingField === fieldName;
    return (
      <div>
        <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>
          {label}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing ? (
            <>
              <input
                type={type}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit();
                  if (e.key === 'Escape') cancelEdit();
                }}
                style={{
                  flex: 1, padding: '6px 8px',
                  border: '1px solid var(--green-600)', borderRadius: 'var(--r)',
                  fontSize: '12px', background: 'var(--surface)', color: 'var(--text)'
                }}
                autoFocus
              />
              <button onClick={saveEdit} style={{ padding: '4px 8px', background: 'var(--green-600)', color: 'white', border: 'none', borderRadius: 'var(--r)', fontSize: '10px', cursor: 'pointer' }}>✓</button>
              <button onClick={cancelEdit} style={{ padding: '4px 8px', background: 'var(--gray-200)', color: 'var(--text)', border: 'none', borderRadius: 'var(--r)', fontSize: '10px', cursor: 'pointer' }}>✕</button>
            </>
          ) : (
            <div
              style={{
                flex: 1, color: value ? 'var(--text)' : 'var(--text-3)',
                fontStyle: value ? 'normal' : 'italic', minHeight: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '4px', borderRadius: 'var(--r)', cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onClick={() => startEditing(fieldName, value)}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
            >
              <span>{value || 'Not specified'}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ opacity: 0, transition: 'opacity 0.2s ease' }}
                onMouseEnter={(e) => { e.target.style.opacity = '1'; }}
                onMouseLeave={(e) => { e.target.style.opacity = '0'; }}
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                <path d="m15 5 4 4"/>
              </svg>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── API handlers (same as LeadPipeline) ──────────────────────────────────
  const handleFieldUpdate = async (leadId, fieldName, newValue) => {
    try {
      const currentUserName = user?.name || user?.phone_number || 'operation';
      let url;

      if (fieldName === 'contactName') {
        url = `${import.meta.env.VITE_UPDATE_LEAD_API_URL}?id=${leadId}&full_name=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
      } else if (fieldName === 'phoneNumber') {
        url = `${import.meta.env.VITE_UPDATE_LEAD_API_URL}?id=${leadId}&phone=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
      } else if (fieldName === 'email') {
        url = `${import.meta.env.VITE_UPDATE_LEAD_API_URL}?id=${leadId}&email=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
      } else if (fieldName === 'companyName') {
        url = `${import.meta.env.VITE_UPDATE_LEAD_API_URL}?id=${leadId}&company_name=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
      } else if (fieldName === 'alternateNumber') {
        url = `${import.meta.env.VITE_UPDATE_LEAD_API_URL}?id=${leadId}&alternate_number=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
      } else if (fieldName === 'city') {
        url = `${import.meta.env.VITE_UPDATE_CITY_API_URL}?id=${leadId}&city=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
      } else if (fieldName === 'state') {
        url = `${import.meta.env.VITE_UPDATE_STATE_API_URL}?id=${leadId}&state=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
      } else if (fieldName === 'country') {
        url = `${import.meta.env.VITE_UPDATE_COUNTRY_API_URL}?id=${leadId}&country=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
      } else if (fieldName === 'leadStatus') {
        url = `${import.meta.env.VITE_UPDATE_LEAD_STATUS_API_URL}?id=${leadId}&new_status=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
      } else if (fieldName === 'industry') {
        url = `${import.meta.env.VITE_UPDATE_INDUSTRY_API_URL}?id=${leadId}&industry=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
      } else if (fieldName === 'contactOwner') {
        url = `${import.meta.env.VITE_UPDATE_LEAD_OWNER_API_URL}?id=${leadId}&owner=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
      } else if (fieldName === 'leadSource') {
        url = `${import.meta.env.VITE_UPDATE_LEAD_SOURCE_API_URL}?id=${leadId}&lead_source=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
      } else if (fieldName === 'tags') {
        url = `${import.meta.env.VITE_UPDATE_LEAD_TAGS_API_URL}?id=${leadId}&tags=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
      } else if (fieldName === 'notes') {
        url = `${import.meta.env.VITE_UPDATE_LEAD_API_URL}?id=${leadId}&notes=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
      } else if (fieldName === 'description') {
        url = `${import.meta.env.VITE_UPDATE_LEAD_API_URL}?id=${leadId}&description=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
      } else {
        url = `${import.meta.env.VITE_UPDATE_LEAD_STATUS_API_URL}?id=${leadId}&${fieldName}=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
      }

      console.log('API URL:', url);
      const response = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' } });
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API Result:', result);

      const success = result.success ||
        (result.message && (result.message.toLowerCase().includes('updated') || result.message.toLowerCase().includes('success')));

      console.log('Success check:', success);

      if (success) {
        setOpportunities(prev => prev.map(o => o.id === leadId ? { ...o, [fieldName]: newValue } : o));
        if (selectedUser && selectedUser.id === leadId) {
          setSelectedUser(prev => ({ ...prev, [fieldName]: newValue }));
        }
        const fieldMessages = {
          contactName: 'Contact name updated', phoneNumber: 'Phone number updated',
          email: 'Email updated', companyName: 'Company name updated',
          alternateNumber: 'Alternate phone number updated', city: 'City updated',
          state: 'State updated', country: 'Country updated', leadStatus: 'Lead status updated',
          industry: 'Industry updated', contactOwner: 'Contact owner updated',
          leadSource: 'Lead source updated', tags: 'Tags updated',
          notes: 'Notes updated', description: 'Description updated'
        };
        toast.success(fieldMessages[fieldName] || `${fieldName} updated`);
      } else {
        console.error('API returned unsuccessful:', result);
        toast.error('Failed to update field');
      }
    } catch (err) {
      console.error('Error updating field:', err);
      toast.error('Failed to update field');
    }
  };

  const handleDeleteOpportunity = async (leadId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this opportunity? This action cannot be undone.');
    if (!confirmDelete) return;
    try {
      const url = `${import.meta.env.VITE_DELETE_LEAD_API_URL}?id=${leadId}`;
      const response = await fetch(url, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        setOpportunities(prev => prev.filter(o => o.id !== leadId));
        if (selectedUser && selectedUser.id === leadId) { setSelectedUser(null); setShowUserModal(false); }
        toast.success('Opportunity deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting opportunity:', err);
    }
  };

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch =
      opp.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.phoneNumber.includes(searchTerm) ||
      opp.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.accountName.toLowerCase().includes(searchTerm.toLowerCase());
    const createdDate = new Date(opp.createdTime);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const isNewThisWeek = createdDate >= oneWeekAgo;
    const matchesStatus = filterStatus === 'all' || opp.leadStatus === filterStatus;
    return matchesSearch && (!newThisWeekFilter || isNewThisWeek) && matchesStatus;
  });

  const indexOfLastOpportunity = currentPage * itemsPerPage;
  const indexOfFirstOpportunity = indexOfLastOpportunity - itemsPerPage;
  const currentOpportunities = filteredOpportunities.slice(indexOfFirstOpportunity, indexOfLastOpportunity);
  const totalPages = Math.ceil(filteredOpportunities.length / itemsPerPage);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="main-full">
      <div style={{ padding: '16px', background: '#f8f7f4', height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0', background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Opportunities
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>Manage and track sales opportunities through the pipeline</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.csv,.xlsx,.xls';
                fileInput.onchange = (e) => { const file = e.target.files[0]; if (file) console.log('CSV import not yet implemented'); };
                fileInput.click();
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--green-600)', color: 'white', border: 'none', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
            >
              <Upload size={16} /> Import CSV
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '300px' }}>
            <button
              onClick={() => setFilterSidebarOpen(!filterSidebarOpen)}
              style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: filterSidebarOpen ? 'var(--blue-600)' : 'var(--surface)', color: filterSidebarOpen ? 'white' : 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Filter size={16} />
            </button>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search opportunities by name, company, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '300px', padding: '8px 12px 8px 36px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)' }}
              />
            </div>
          </div>
         
          <button
            onClick={async (e) => {
              try {
                const button = e.currentTarget;
                button.textContent = 'Downloading...';
                button.disabled = true;
                const currentUser = user?.name || user?.phone_number || 'operation';
                const response = await fetch(`${import.meta.env.VITE_DOWNLOAD_LEADS_CSV_URL}?user=${encodeURIComponent(currentUser)}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
                if (!response.ok) throw new Error('Failed to download CSV');
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'opportunities.csv';
                document.body.appendChild(a); a.click();
                window.URL.revokeObjectURL(url); document.body.removeChild(a);
                toast.success('CSV downloaded successfully');
              } catch (error) {
                console.error('Error downloading CSV:', error);
                toast.error('Failed to download CSV');
              } finally {
                const button = e.currentTarget;
                button.textContent = 'Download CSV';
                button.disabled = false;
              }
            }}
            className="btn btn-sm"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '5px 10px', background: 'var(--green-600)', color: '#fff', border: '1px solid var(--green-600)', borderRadius: 'var(--r)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--green-700)'; e.currentTarget.style.borderColor = 'var(--green-700)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--green-600)'; e.currentTarget.style.borderColor = 'var(--green-600)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download CSV
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={newThisWeekFilter} onChange={(e) => setNewThisWeekFilter(e.target.checked)} style={{ cursor: 'pointer' }} />
            <span style={{ color: 'var(--text)', fontSize: '14px' }}>New This Week</span>
          </label>
        </div>

        {/* Opportunity Table */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', overflowX: 'auto', maxWidth: '100%', flex: 1 }}>
          <div style={{ overflowX: 'auto', maxWidth: '100%', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', fontSize: '13px', height: '100%' }}>
              <thead>
                <tr style={{ background: 'var(--gray-100)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '2px solid var(--border)', position: 'sticky', left: 0, backgroundColor: 'var(--gray-100)', zIndex: 11 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" checked={selectedRows.length === filteredOpportunities.length && filteredOpportunities.length > 0} onChange={(e) => { if (e.target.checked) setSelectedRows(filteredOpportunities.map(o => o.id)); else setSelectedRows([]); }} style={{ cursor: 'pointer' }} />
                      <span>Contact Name</span>
                    </div>
                  </th>
                  {['Phone Number','Alternate Number','Email','Company Name','Account Name','Account Number','Deal Present','Contact Owner','City','State','Country','Lead Status','Tags','Lead Source','Description','Created Time','Industry','Created By','Modified By','Last Activity'].map(h => (
                    <th key={h} style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>{h}</th>
                  ))}
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="22" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-3)', fontSize: '14px' }}>Loading opportunities...</td></tr>
                ) : filteredOpportunities.length === 0 ? (
                  <tr><td colSpan="22" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-3)', fontSize: '14px' }}>No opportunities found</td></tr>
                ) : (
                  currentOpportunities.map(opp => (
                    <tr key={opp.id} style={{ borderBottom: '1px solid var(--border-soft)', transition: 'all 0.2s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-50)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '16px', color: 'var(--text)', fontWeight: '500', textAlign: 'left', borderRight: '2px solid var(--border)', position: 'sticky', left: 0, backgroundColor: 'var(--surface)', zIndex: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input type="checkbox" checked={selectedRows.includes(opp.id)} onChange={(e) => { if (e.target.checked) setSelectedRows([...selectedRows, opp.id]); else setSelectedRows(selectedRows.filter(id => id !== opp.id)); }} style={{ cursor: 'pointer' }} />
                          <button onClick={() => { setSelectedUser(opp); setShowUserModal(true); }} style={{ background: 'none', border: 'none', color: 'var(--blue-600)', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px', fontWeight: '500', padding: 0, textAlign: 'left' }}>
                            {opp.contactName}
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>{opp.phoneNumber}</td>
                      <td style={{ padding: '16px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>{opp.alternateNumber}</td>
                      <td style={{ padding: '16px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>{opp.email}</td>
                      <td style={{ padding: '16px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>{opp.companyName}</td>
                      <td style={{ padding: '16px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>{opp.accountName}</td>
                      <td style={{ padding: '16px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>{opp.accountNumber}</td>
                      <td style={{ padding: '16px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>
                        {opp.dealPresent
                          ? <span style={{ color: '#10b981', fontSize: '13px', fontWeight: '500' }}>Yes</span>
                          : <span style={{ color: '#ef4444', fontSize: '13px', fontWeight: '500' }}>No</span>}
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>{opp.contactOwner}</td>
                      <td style={{ padding: '16px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>{opp.city}</td>
                      <td style={{ padding: '16px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>{opp.state}</td>
                      <td style={{ padding: '16px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>{opp.country}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 'var(--r)', fontSize: '11px', fontWeight: '500', background: `${statusConfig[opp.leadStatus]?.color || '#6b7280'}15`, color: statusConfig[opp.leadStatus]?.color || '#6b7280' }}>
                          {opp.leadStatus}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}><span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{opp.tags}</span></td>
                      <td style={{ padding: '16px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>{opp.leadSource}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--text)', maxWidth: '200px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={opp.description}>{opp.description}</div>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{new Date(opp.createdTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>{opp.industry}</td>
                      <td style={{ padding: '16px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>{opp.createdBy}</td>
                      <td style={{ padding: '16px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>{opp.modifiedBy}</td>
                      <td style={{ padding: '16px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{new Date(opp.lastActivity).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button onClick={() => handleDeleteOpportunity(opp.id)} style={{ padding: '4px 6px', background: 'var(--red-100)', color: 'var(--red-600)', border: '1px solid var(--red-200)', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '2px' }} title="Delete">
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1px 10px', borderTop: '1px solid #e5e7eb', background: '#fff', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#6b7280' }}>
                <span>Records per page</span>
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                  <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    style={{ appearance: 'none', WebkitAppearance: 'none', padding: '6px 32px 6px 14px', borderRadius: '20px', border: '1px solid #d1d5db', background: '#fff', fontSize: '13px', color: '#374151', cursor: 'pointer', minWidth: '56px', fontFamily: 'inherit' }}>
                    {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button type="button" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1 || filteredOpportunities.length === 0}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', padding: 0, background: 'none', border: 'none', color: currentPage === 1 || filteredOpportunities.length === 0 ? '#d1d5db' : '#6b7280', cursor: currentPage === 1 || filteredOpportunities.length === 0 ? 'not-allowed' : 'pointer' }}>
                  <ChevronLeft size={18} />
                </button>
                <span style={{ fontSize: '13px', color: '#374151', minWidth: '56px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {filteredOpportunities.length === 0 ? '0 to 0' : `${indexOfFirstOpportunity + 1} to ${Math.min(indexOfLastOpportunity, filteredOpportunities.length)}`}
                </span>
                <button type="button" onClick={() => setCurrentPage(p => Math.min(p + 1, Math.max(totalPages, 1)))} disabled={currentPage >= totalPages || filteredOpportunities.length === 0}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', padding: 0, background: 'none', border: 'none', color: currentPage >= totalPages || filteredOpportunities.length === 0 ? '#d1d5db' : '#6b7280', cursor: currentPage >= totalPages || filteredOpportunities.length === 0 ? 'not-allowed' : 'pointer' }}>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Opportunity Information Modal (same layout as LeadPipeline) ── */}
        {showUserModal && selectedUser && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ position: 'relative', background: 'var(--surface)', borderRadius: '0', width: '85%', height: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>

              {/* Modal header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'var(--text)', fontFamily: 'var(--font-display)' }}>Opportunity Information</h2>
                <button onClick={() => { setShowUserModal(false); setSelectedUser(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '4px' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Modal body: two-column layout */}
              <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* ── Left panel: all editable sections ── */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                  {/* Contact Information */}
                  <div style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: 'var(--text)', fontSize: '14px', fontWeight: '600', borderBottom: '1px solid var(--border-soft)', paddingBottom: '8px' }}>Contact Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <EditableField label="Contact Name" value={selectedUser.contactName} fieldName="contactName" />
                      <EditableField label="Email" value={selectedUser.email} fieldName="email" type="email" />
                      <EditableField label="Phone" value={selectedUser.phoneNumber} fieldName="phoneNumber" type="tel" />
                      <EditableField label="Alternate Phone" value={selectedUser.alternateNumber} fieldName="alternateNumber" type="tel" />
                    </div>
                  </div>

                  {/* Company Information */}
                  <div style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: 'var(--text)', fontSize: '14px', fontWeight: '600', borderBottom: '1px solid var(--border-soft)', paddingBottom: '8px' }}>Company Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <EditableField label="Company Name" value={selectedUser.companyName} fieldName="companyName" />
                      {/* Industry dropdown */}
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Industry Type</label>
                        <div style={{ position: 'relative' }}>
                          <div
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: '12px', color: 'var(--text)' }}
                            onClick={() => setIndustryDropdownOpen(!industryDropdownOpen)}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)'; }}
                          >
                            <span>{selectedUser.industry || 'Select industry'}</span>
                            <ChevronDown size={14} />
                          </div>
                          {industryDropdownOpen && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10, marginTop: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                              {predefinedIndustries.map(industry => (
                                <button key={industry} onClick={() => { handleFieldUpdate(selectedUser.id, 'industry', industry); setIndustryDropdownOpen(false); }}
                                  style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '12px', color: 'var(--text)', borderBottom: '1px solid var(--border-soft)' }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                                >{industry}</button>
                              ))}
                              <button onClick={() => { setShowCustomIndustryInput(true); setIndustryDropdownOpen(false); }}
                                style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: 'var(--green-600)' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--green-100)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                              >+ Custom</button>
                            </div>
                          )}
                          {showCustomIndustryInput && (
                            <div style={{ marginTop: '8px', padding: '8px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 'var(--r)' }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input type="text" value={customIndustry} onChange={(e) => setCustomIndustry(e.target.value)} placeholder="Enter custom industry..."
                                  style={{ flex: 1, padding: '6px 8px', border: '1px solid var(--green-300)', borderRadius: 'var(--r)', fontSize: '12px', background: 'var(--surface)', color: 'var(--text)' }} autoFocus />
                                <button onClick={() => { if (customIndustry.trim()) { handleFieldUpdate(selectedUser.id, 'industry', customIndustry.trim()); setCustomIndustry(''); setShowCustomIndustryInput(false); } }}
                                  style={{ padding: '6px 12px', background: 'var(--green-600)', color: 'white', border: 'none', borderRadius: 'var(--r)', fontSize: '11px', cursor: 'pointer', fontWeight: '500' }}>Apply</button>
                                <button onClick={() => { setCustomIndustry(''); setShowCustomIndustryInput(false); }}
                                  style={{ padding: '6px 12px', background: 'var(--gray-200)', color: 'var(--text)', border: 'none', borderRadius: 'var(--r)', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: 'var(--text)', fontSize: '14px', fontWeight: '600', borderBottom: '1px solid var(--border-soft)', paddingBottom: '8px' }}>Location Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <EditableField label="City Name" value={selectedUser.city} fieldName="city" />
                      <EditableField label="State Name" value={selectedUser.state} fieldName="state" />
                      <EditableField label="Country Name" value={selectedUser.country} fieldName="country" />
                    </div>
                  </div>

                  {/* Lead Management */}
                  <div style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: 'var(--text)', fontSize: '14px', fontWeight: '600', borderBottom: '1px solid var(--border-soft)', paddingBottom: '8px' }}>Lead Management</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

                      {/* Lead Status */}
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Lead Status</label>
                        <div style={{ position: 'relative' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: '12px', color: 'var(--text)' }}
                            onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)'; }}>
                            <span>{selectedUser.leadStatus}</span><ChevronDown size={14} />
                          </div>
                          {statusDropdownOpen && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10, marginTop: '4px' }}>
                              {Object.keys(statusConfig).map(status => (
                                <button key={status} onClick={() => { handleFieldUpdate(selectedUser.id, 'leadStatus', status); setStatusDropdownOpen(false); }}
                                  style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '12px', color: 'var(--text)', borderBottom: '1px solid var(--border-soft)' }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = statusConfig[status].color + '15'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                                >{statusConfig[status].label}</button>
                              ))}
                              <button onClick={() => { setShowCustomStatusInput(true); setStatusDropdownOpen(false); }}
                                style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: 'var(--green-600)' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--green-100)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                              >+ Custom Status</button>
                            </div>
                          )}
                          {showCustomStatusInput && (
                            <div style={{ marginTop: '8px', padding: '8px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 'var(--r)' }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input type="text" value={customStatus} onChange={(e) => setCustomStatus(e.target.value)} placeholder="Enter custom status..."
                                  style={{ flex: 1, padding: '6px 8px', border: '1px solid var(--green-300)', borderRadius: 'var(--r)', fontSize: '12px', background: 'var(--surface)', color: 'var(--text)' }} autoFocus />
                                <button onClick={() => { if (customStatus.trim()) { handleFieldUpdate(selectedUser.id, 'leadStatus', customStatus.trim()); setCustomStatus(''); setShowCustomStatusInput(false); } }}
                                  style={{ padding: '6px 12px', background: 'var(--green-600)', color: 'white', border: 'none', borderRadius: 'var(--r)', fontSize: '11px', cursor: 'pointer', fontWeight: '500' }}>Apply</button>
                                <button onClick={() => { setCustomStatus(''); setShowCustomStatusInput(false); }}
                                  style={{ padding: '6px 12px', background: 'var(--gray-200)', color: 'var(--text)', border: 'none', borderRadius: 'var(--r)', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contact Owner */}
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Contact Owner</label>
                        <div style={{ position: 'relative' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: '12px', color: 'var(--text)' }}
                            onClick={() => setOwnerDropdownOpen(!ownerDropdownOpen)}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)'; }}>
                            <span>{selectedUser.contactOwner}</span><ChevronDown size={14} />
                          </div>
                          {ownerDropdownOpen && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10, marginTop: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                              {getUniqueContactOwners().map(owner => (
                                <button key={owner} onClick={() => { handleFieldUpdate(selectedUser.id, 'contactOwner', owner); setOwnerDropdownOpen(false); }}
                                  style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '12px', color: 'var(--text)', borderBottom: '1px solid var(--border-soft)' }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                                >{owner}</button>
                              ))}
                              <button onClick={() => { setShowCustomOwnerInput(true); setOwnerDropdownOpen(false); }}
                                style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: 'var(--green-600)' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--green-100)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                              >+ Custom Owner</button>
                            </div>
                          )}
                          {showCustomOwnerInput && (
                            <div style={{ marginTop: '8px', padding: '8px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 'var(--r)' }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input type="text" value={customOwner} onChange={(e) => setCustomOwner(e.target.value)} placeholder="Enter custom owner..."
                                  style={{ flex: 1, padding: '6px 8px', border: '1px solid var(--green-300)', borderRadius: 'var(--r)', fontSize: '12px', background: 'var(--surface)', color: 'var(--text)' }} autoFocus />
                                <button onClick={() => { if (customOwner.trim()) { handleFieldUpdate(selectedUser.id, 'contactOwner', customOwner.trim()); setCustomOwner(''); setShowCustomOwnerInput(false); } }}
                                  style={{ padding: '6px 12px', background: 'var(--green-600)', color: 'white', border: 'none', borderRadius: 'var(--r)', fontSize: '11px', cursor: 'pointer', fontWeight: '500' }}>Apply</button>
                                <button onClick={() => { setCustomOwner(''); setShowCustomOwnerInput(false); }}
                                  style={{ padding: '6px 12px', background: 'var(--gray-200)', color: 'var(--text)', border: 'none', borderRadius: 'var(--r)', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Lead Source */}
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Lead Source</label>
                        <div style={{ position: 'relative' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: '12px', color: 'var(--text)' }}
                            onClick={() => setLeadSourceDropdownOpen(!leadSourceDropdownOpen)}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)'; }}>
                            <span>{selectedUser.leadSource || 'Select lead source'}</span><ChevronDown size={14} />
                          </div>
                          {leadSourceDropdownOpen && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10, marginTop: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                              {predefinedLeadSources.map(source => (
                                <button key={source} onClick={() => { handleFieldUpdate(selectedUser.id, 'leadSource', source); setLeadSourceDropdownOpen(false); }}
                                  style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '12px', color: 'var(--text)', borderBottom: '1px solid var(--border-soft)' }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                                >{source}</button>
                              ))}
                              <button onClick={() => { setShowCustomLeadSourceInput(true); setLeadSourceDropdownOpen(false); }}
                                style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: 'var(--green-600)' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--green-100)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                              >+ Custom</button>
                            </div>
                          )}
                          {showCustomLeadSourceInput && (
                            <div style={{ marginTop: '8px', padding: '8px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 'var(--r)' }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input type="text" value={customLeadSource} onChange={(e) => setCustomLeadSource(e.target.value)} placeholder="Enter custom lead source..."
                                  style={{ flex: 1, padding: '6px 8px', border: '1px solid var(--green-300)', borderRadius: 'var(--r)', fontSize: '12px', background: 'var(--surface)', color: 'var(--text)' }} autoFocus />
                                <button onClick={() => { if (customLeadSource.trim()) { handleFieldUpdate(selectedUser.id, 'leadSource', customLeadSource.trim()); setCustomLeadSource(''); setShowCustomLeadSourceInput(false); } }}
                                  style={{ padding: '6px 12px', background: 'var(--green-600)', color: 'white', border: 'none', borderRadius: 'var(--r)', fontSize: '11px', cursor: 'pointer', fontWeight: '500' }}>Apply</button>
                                <button onClick={() => { setCustomLeadSource(''); setShowCustomLeadSourceInput(false); }}
                                  style={{ padding: '6px 12px', background: 'var(--gray-200)', color: 'var(--text)', border: 'none', borderRadius: 'var(--r)', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Tags</label>
                        <div style={{ position: 'relative' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: '12px', color: 'var(--text)' }}
                            onClick={() => setTagsDropdownOpen(!tagsDropdownOpen)}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)'; }}>
                            <span>{selectedUser.tags || 'Select tag'}</span><ChevronDown size={14} />
                          </div>
                          {tagsDropdownOpen && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10, marginTop: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                              {predefinedTags.map(tag => (
                                <button key={tag} onClick={() => { handleFieldUpdate(selectedUser.id, 'tags', tag); setTagsDropdownOpen(false); }}
                                  style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '12px', color: 'var(--text)', borderBottom: '1px solid var(--border-soft)' }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                                >{tag}</button>
                              ))}
                              <button onClick={() => { setShowCustomTagsInput(true); setTagsDropdownOpen(false); }}
                                style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: 'var(--green-600)' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--green-100)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                              >+ Custom Tag</button>
                            </div>
                          )}
                          {showCustomTagsInput && (
                            <div style={{ marginTop: '8px', padding: '8px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 'var(--r)' }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input type="text" value={customTags} onChange={(e) => setCustomTags(e.target.value)} placeholder="Enter custom tag..."
                                  style={{ flex: 1, padding: '6px 8px', border: '1px solid var(--green-300)', borderRadius: 'var(--r)', fontSize: '12px', background: 'var(--surface)', color: 'var(--text)' }} autoFocus />
                                <button onClick={() => { if (customTags.trim()) { handleFieldUpdate(selectedUser.id, 'tags', customTags.trim()); setCustomTags(''); setShowCustomTagsInput(false); } }}
                                  style={{ padding: '6px 12px', background: 'var(--green-600)', color: 'white', border: 'none', borderRadius: 'var(--r)', fontSize: '11px', cursor: 'pointer', fontWeight: '500' }}>Apply</button>
                                <button onClick={() => { setCustomTags(''); setShowCustomTagsInput(false); }}
                                  style={{ padding: '6px 12px', background: 'var(--gray-200)', color: 'var(--text)', border: 'none', borderRadius: 'var(--r)', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: 'var(--text)', fontSize: '14px', fontWeight: '600', borderBottom: '1px solid var(--border-soft)', paddingBottom: '8px' }}>Additional Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                      <EditableField label="Notes" value={selectedUser.notes} fieldName="notes" />
                      <EditableField label="Description" value={selectedUser.description} fieldName="description" />
                    </div>
                  </div>

                  {/* System Information */}
                  <div style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: 'var(--text)', fontSize: '14px', fontWeight: '600', borderBottom: '1px solid var(--border-soft)', paddingBottom: '8px' }}>System Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Created Time</label>
                        <div style={{ color: 'var(--text)' }}>{new Date(selectedUser.createdTime).toLocaleString('en-IN')}</div>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Last Activity Time</label>
                        <div style={{ color: 'var(--text)' }}>{new Date(selectedUser.lastActivity).toLocaleString('en-IN')}</div>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Created By</label>
                        <div style={{ color: 'var(--text)', fontWeight: '500' }}>{selectedUser.createdBy}</div>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Modified By</label>
                        <div style={{ color: 'var(--text)', fontWeight: '500' }}>{selectedUser.modifiedBy}</div>
                      </div>
                    </div>
                  </div>

                </div>{/* end left panel */}

                {/* ── Right panel: tabs (Timeline / Notes / Activities / Pipelines) ── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  {/* Tabs */}
                  <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)', padding: '0 20px', flexShrink: 0 }}>
                    {[
                      { id: 'timeline', label: 'Timeline' },
                      { id: 'notes', label: 'Notes', count: 1 },
                      { id: 'activities', label: 'Activities' },
                      { id: 'pipelines', label: 'Pipelines', count: 1 }
                    ].map(tab => (
                      <button key={tab.id} onClick={() => setActiveModalTab(tab.id)}
                        style={{ padding: '14px 16px', border: 'none', borderBottom: activeModalTab === tab.id ? '2px solid var(--green-600)' : '2px solid transparent', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '13px', color: activeModalTab === tab.id ? 'var(--green-600)' : 'var(--text-3)', fontWeight: activeModalTab === tab.id ? '600' : '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {tab.label}
                        {tab.count && (
                          <span style={{ backgroundColor: activeModalTab === tab.id ? 'var(--green-600)' : 'var(--gray-200)', color: activeModalTab === tab.id ? '#fff' : 'var(--text-3)', borderRadius: '10px', padding: '2px 8px', fontSize: '11px', fontWeight: '600' }}>{tab.count}</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: 'var(--gray-50)' }}>

                    {activeModalTab === 'timeline' && (
                      <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '600', fontSize: '16px' }}>
                            {selectedUser?.contactName?.charAt(0) || 'O'}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>{selectedUser?.contactName || 'Opportunity'}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>Created on {new Date(selectedUser?.createdTime || Date.now()).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </div>
                        <div style={{ paddingLeft: '32px', borderLeft: '2px solid var(--border)', marginLeft: '20px', paddingBottom: '20px' }}>
                          <div style={{ marginLeft: '-36px', marginBottom: '12px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--green-600)', border: '3px solid #fff', boxShadow: '0 0 0 2px var(--green-600)' }}></div>
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '4px' }}>Opportunity Created</div>
                          <div style={{ fontSize: '14px', color: 'var(--text)' }}>Opportunity was created in the system</div>
                        </div>
                      </div>
                    )}

                    {activeModalTab === 'notes' && (
                      <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
                        <div style={{ marginBottom: '16px' }}>
                          <textarea placeholder="Add a note..." rows={3}
                            style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', resize: 'vertical', outline: 'none', background: 'var(--surface)', color: 'var(--text)' }} />
                          <button style={{ marginTop: '8px', backgroundColor: 'var(--green-600)', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Add Note</button>
                        </div>
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                          <div style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '8px' }}>Sample note about this opportunity...</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>Added by Admin • 2 days ago</div>
                        </div>
                      </div>
                    )}

                    {activeModalTab === 'activities' && (
                      <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                          <h3 style={{ color: 'var(--text)', fontSize: '14px', fontWeight: '600', margin: 0 }}>Activities</h3>
                          <button onClick={() => setShowCreateTaskModal(true)}
                            style={{ backgroundColor: 'var(--green-600)', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Plus size={14} /> Task
                          </button>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', fontSize: '13px' }}>
                          <thead>
                            <tr style={{ background: 'var(--gray-100)', borderBottom: '2px solid var(--border)' }}>
                              {['Task Name','Due Date','Status','Task Owner'].map(h => (
                                <th key={h} style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600', color: 'var(--text-3)', fontSize: '12px' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '10px 8px', color: 'var(--text)' }}>Follow up call with client</td>
                              <td style={{ padding: '10px 8px', color: 'var(--text-3)', fontSize: '12px' }}>Jun 10, 2026</td>
                              <td style={{ padding: '10px 8px' }}><span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '500' }}>In Progress</span></td>
                              <td style={{ padding: '10px 8px', color: 'var(--text)' }}>John Smith</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '10px 8px', color: 'var(--text)' }}>Send proposal document</td>
                              <td style={{ padding: '10px 8px', color: 'var(--text-3)', fontSize: '12px' }}>Jun 15, 2026</td>
                              <td style={{ padding: '10px 8px' }}><span style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '500' }}>Not Started</span></td>
                              <td style={{ padding: '10px 8px', color: 'var(--text)' }}>Sarah Johnson</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '10px 8px', color: 'var(--text)' }}>Schedule demo meeting</td>
                              <td style={{ padding: '10px 8px', color: 'var(--text-3)', fontSize: '12px' }}>Jun 20, 2026</td>
                              <td style={{ padding: '10px 8px' }}><span style={{ backgroundColor: '#d1fae5', color: '#047857', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '500' }}>Completed</span></td>
                              <td style={{ padding: '10px 8px', color: 'var(--text)' }}>Mike Wilson</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}

                    {activeModalTab === 'pipelines' && (
                      <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                          <div>
                            <h3 style={{ color: 'var(--text)', fontSize: '14px', fontWeight: '600', margin: 0 }}>Pipelines</h3>
                            <select style={{ marginTop: '4px', padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-3)', outline: 'none', background: 'var(--surface)' }}>
                              <option>Team Pipeline: Sales Pipeline</option>
                            </select>
                          </div>
                          <button onClick={() => setShowCreateDealModal(true)}
                            style={{ backgroundColor: 'var(--green-600)', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Plus size={14} /> Deal
                          </button>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', fontSize: '13px' }}>
                          <thead>
                            <tr style={{ background: 'var(--gray-100)', borderBottom: '2px solid var(--border)' }}>
                              {['Deal Name','Amount','Stage','Closing Date'].map(h => (
                                <th key={h} style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600', color: 'var(--text-3)', fontSize: '12px' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '10px 8px', color: 'var(--text)' }}>Zylker Yearly Subscription</td>
                              <td style={{ padding: '10px 8px', color: 'var(--text)' }}>₹5,671.00</td>
                              <td style={{ padding: '10px 8px' }}><span style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '500' }}>Qualification</span></td>
                              <td style={{ padding: '10px 8px', color: 'var(--text-3)', fontSize: '12px' }}>Jun 06, 2026</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}

                  </div>
                </div>{/* end right panel */}
              </div>
            </div>
          </div>
        )}

        {/* ── Create Deal Modal ── */}
        {showCreateDealModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', maxWidth: '650px', width: '92%', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #fff 100%)' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>Create Deal</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Fill in the details to create a new deal</p>
                </div>
                <button onClick={() => setShowCreateDealModal(false)} style={{ backgroundColor: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={20} />
                </button>
              </div>
              <div style={{ padding: '28px', maxHeight: 'calc(90vh - 180px)', overflowY: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#334155', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                      Deal Name<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>
                    </label>
                    <input type="text" value={dealName} onChange={(e) => setDealName(e.target.value)} placeholder="Enter deal name"
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#fafbfc', color: '#1e293b' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#fafbfc'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#334155', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Company Name</label>
                    <input type="text" value={dealCompanyName} onChange={(e) => setDealCompanyName(e.target.value)} placeholder="Zylker Corp"
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#fafbfc', color: '#1e293b' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#fafbfc'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#334155', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Contact Name</label>
                    <input type="text" value={dealContactName} onChange={(e) => setDealContactName(e.target.value)} placeholder="Ted Watson"
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#fafbfc', color: '#1e293b' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#fafbfc'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#334155', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Closing Date</label>
                    <input type="date" value={dealClosingDate} onChange={(e) => setDealClosingDate(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#fafbfc', color: '#1e293b' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#fafbfc'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#334155', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Stage <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></label>
                    <select value={dealStage} onChange={(e) => setDealStage(e.target.value)} style={{ width: '100%', padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#fafbfc', color: '#64748b', cursor: 'pointer' }}>
                      <option value="">Choose a stage</option>
                      {['Qualification','Needs Analysis','Proposal/price Quote','Negotiation/Review','Closed won','Closed lost','Closed'].map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#334155', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Amount</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '15px', fontWeight: '500' }}>₹</span>
                      <input type="text" value={dealAmount} onChange={(e) => setDealAmount(e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '12px 16px 12px 36px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#fafbfc', color: '#1e293b' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#334155', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Description</label>
                    <textarea value={dealDescription} onChange={(e) => setDealDescription(e.target.value)} placeholder="A few words about this deal" rows={4}
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', resize: 'vertical', backgroundColor: '#fafbfc', color: '#1e293b', fontFamily: 'inherit' }} />
                  </div>
                </div>
              </div>
              <div style={{ padding: '20px 28px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#fafbfc' }}>
                <button onClick={() => { setShowCreateDealModal(false); setDealName(''); setDealCompanyName(''); setDealContactName(''); setDealClosingDate(''); setDealStage(''); setDealAmount(''); setDealDescription(''); }} style={{ backgroundColor: '#fff', color: '#475569', border: '2px solid #e2e8f0', borderRadius: '10px', padding: '10px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => { if (dealName.trim() && dealStage) { toast.success('Deal created successfully'); setShowCreateDealModal(false); setDealName(''); setDealCompanyName(''); setDealContactName(''); setDealClosingDate(''); setDealStage(''); setDealAmount(''); setDealDescription(''); } else { toast.error('Please fill in required fields'); } }} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 28px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(16,185,129,0.2)' }}>Save Deal</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Create Task Modal ── */}
        {showCreateTaskModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002 }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', maxWidth: '450px', width: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Create Task</h3>
                <button onClick={() => setShowCreateTaskModal(false)} style={{ backgroundColor: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                  <X size={18} />
                </button>
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#334155', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Task Name</label>
                  <input type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="Enter task name" style={{ width: '100%', padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#fafbfc', color: '#1e293b' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#334155', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Due Date</label>
                  <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#fafbfc', color: '#1e293b' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#334155', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Task Owner</label>
                  <input type="text" value={taskOwner} onChange={(e) => setTaskOwner(e.target.value)} placeholder="Enter task owner" style={{ width: '100%', padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#fafbfc', color: '#1e293b' }} />
                </div>
              </div>
              <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#fafbfc', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                <button onClick={() => { setShowCreateTaskModal(false); setTaskName(''); setTaskDueDate(''); setTaskOwner(''); }} style={{ backgroundColor: '#fff', color: '#475569', border: '2px solid #e2e8f0', borderRadius: '8px', padding: '8px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => { if (taskName.trim()) { toast.success('Task created successfully'); setShowCreateTaskModal(false); setTaskName(''); setTaskDueDate(''); setTaskOwner(''); } else { toast.error('Please enter task name'); } }} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Save</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}