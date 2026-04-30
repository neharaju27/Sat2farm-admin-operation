import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Plus, Edit, Trash2, Eye, Phone, Mail, Calendar, MapPin, TrendingUp, Users, DollarSign, Activity, ChevronDown, ChevronRight, X, Check, Clock, AlertCircle, FileText, ChevronLeft, Upload, ChevronDown as ChevronDownIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/Sat2FarmAdminPortal.css';

export default function LeadPipeline({ onPageChange }) {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch leads from API
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const currentUserName = user?.name || user?.phone_number || 'operation';
        const response = await fetch(`${import.meta.env.VITE_LEADS_API_URL}?user=${encodeURIComponent(currentUserName)}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform API data to match component structure
        const transformedLeads = data.map(lead => ({
          id: lead.id,
          contactName: lead.full_name || 'Unknown',
          phoneNumber: lead.phone || '',
          alternateNumber: lead.alternate_number || '',
          email: lead.email || '',
          companyName: lead.company_name || '',
          contactOwner: lead.owner || 'Unassigned',
          city: lead.city || '',
          state: lead.state || '',
          country: lead.country || 'IN',
          leadStatus: lead.status || 'New',
          tags: lead.tags || '',
          leadSource: lead.lead_source || '',
          description: lead.description || '',
          createdTime: lead.created_time || new Date().toISOString(),
          industry: lead.industry || '',
          createdBy: lead.created_by || 'System',
          modifiedBy: lead.modified_by || 'System',
          lastActivity: lead.last_activity || new Date().toISOString()
        }));
        
        setLeads(transformedLeads);
        setError(null);
      } catch (err) {
        console.error('Error fetching leads:', err);
        setError('Failed to load leads. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const [selectedLead, setSelectedLead] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
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
  const [contactOwnerFilter, setContactOwnerFilter] = useState('');
  const [contactOwnerFilterOperator, setContactOwnerFilterOperator] = useState('is');
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [currentFilterCriteria, setCurrentFilterCriteria] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  const [newThisWeekFilter, setNewThisWeekFilter] = useState(false);
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState([]); // Array of {property, value, operator} objects
  const [currentProperty, setCurrentProperty] = useState('');

  // Get unique values for a specific property from leads data
  const getUniqueValues = (property) => {
    const propertyMap = {
      'contact_owner': 'contactOwner',
      'lead_status': 'leadStatus',
      'tag': 'tags',
      'mailing_country': 'country',
      'mailing_state': 'state',
      'mailing_city': 'city',
      'mailing_street': 'companyName', // Using companyName as mailing street
      'created_by': 'createdBy',
      'modified_by': 'modifiedBy',
      'lead_source': 'leadSource',
      'pipeline_stage': 'leadStatus', // Using leadStatus as pipeline stage
      'contact_name': 'contactName' // Add contact_name mapping
    };
    
    const field = propertyMap[property];
    if (!field) return [];
    
    const values = [...new Set(leads.map(lead => lead[field]).filter(value => value && value.toString().trim() !== ''))];
    return values.sort();
  };

  // Get unique contact owners from leads data
  const getUniqueContactOwners = () => {
    return getUniqueValues('contact_owner');
  };

  const statusConfig = {
    'Yet to Contact': { color: '#3b82f6', label: 'Yet to Contact' },
    'Attempted to Contact': { color: '#f59e0b', label: 'Attempted to Contact' },
    'Contacted': { color: '#8b5cf6', label: 'Contacted' },
    'Follow-up 1': { color: '#10b981', label: 'Follow-up 1' },
    'Follow-up 2': { color: '#06b6d4', label: 'Follow-up 2' },
    'In Discussion': { color: '#8b5cf6', label: 'In Discussion' },
    'Interested': { color: '#10b981', label: 'Interested' },
    'Junk': { color: '#ef4444', label: 'Junk' }
  };

  const getLeadsByStatus = (status) => {
    return leads.filter(lead => lead.leadStatus === status);
  };

  const getTotalValue = (status) => {
    return leads
      .filter(lead => lead.leadStatus === status)
      .reduce((sum, lead) => sum + (lead.value || 0), 0);
  };

  const downloadCSV = async () => {
    try {
      // Show loading state
      const button = event.target;
      const originalText = button.textContent;
      button.textContent = 'Downloading...';
      button.disabled = true;

      const response = await fetch(`${import.meta.env.VITE_DOWNLOAD_LEADS_CSV_URL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Reset button state
      button.textContent = originalText;
      button.disabled = false;
      
    } catch (err) {
      console.error('Error downloading CSV:', err);
      alert(`Failed to download CSV: ${err.message || 'Unknown error'}`);
      
      // Reset button state on error
      const button = event.target;
      button.textContent = 'Download CSV';
      button.disabled = false;
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       lead.phoneNumber.includes(searchTerm) ||
                       lead.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    // New This Week filter
    const createdDate = new Date(lead.createdTime);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const isNewThisWeek = createdDate >= oneWeekAgo;
    
    return matchesSearch && (!newThisWeekFilter || isNewThisWeek);
  });  

  // Pagination
  const indexOfLastLead = currentPage * itemsPerPage;
  const indexOfFirstLead = indexOfLastLead - itemsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);


  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleStatusUpdate = async (leadId, newStatus) => {
    console.log('Updating lead status:', { leadId, newStatus });
    
    try {
      const currentUserName = user?.name || user?.phone_number || 'operation';
      const url = `${import.meta.env.VITE_UPDATE_LEAD_STATUS_API_URL}?id=${leadId}&new_status=${encodeURIComponent(newStatus)}&user=${encodeURIComponent(currentUserName)}`;
      console.log('Full API URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API result:', result);
      
      if (result.success) {
        console.log('Status update successful');
        // Update local state
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === leadId ? { ...lead, leadStatus: newStatus } : lead
          )
        );
        
        // Update selected user if modal is open
        if (selectedUser && selectedUser.id === leadId) {
          setSelectedUser(prev => ({ ...prev, leadStatus: newStatus }));
        }
        
        toast.success('Lead status updated');
      } else {
        console.error('API returned failure:', result);
        // alert(`Failed to update lead status: ${result.message || 'Unknown error'}`); // Removed alert
      }
    } catch (err) {
      console.error('Network error updating lead status:', err);
      // alert(`Network error: ${err.message || 'Unknown error occurred'}`); // Removed alert
    }
  };

  const handleOwnerUpdate = async (leadId, newOwner) => {
    console.log('Updating lead owner:', { leadId, newOwner });
    
    try {
      const currentUserName = user?.name || user?.phone_number || 'operation';
      const url = `${import.meta.env.VITE_UPDATE_LEAD_OWNER_API_URL}?id=${leadId}&owner=${encodeURIComponent(newOwner)}&user=${encodeURIComponent(currentUserName)}`;
      console.log('Full API URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API result:', result);
      
      if (result.success) {
        console.log('Owner update successful');
        // Update local state
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === leadId ? { ...lead, contactOwner: newOwner } : lead
          )
        );
        
        // Update selected user if modal is open
        if (selectedUser && selectedUser.id === leadId) {
          setSelectedUser(prev => ({ ...prev, contactOwner: newOwner }));
        }
        
        toast.success('Contact owner updated');
      } else {
        console.error('API returned failure:', result);
        // alert(`Failed to update lead owner: ${result.message || 'Unknown error'}`); // Removed alert
      }
    } catch (err) {
      console.error('Network error updating lead owner:', err);
      // alert(`Network error: ${err.message || 'Unknown error occurred'}`); // Removed alert
    }
  };

  const handleFieldUpdate = async (leadId, fieldName, newValue) => {
    console.log('Updating lead field:', { leadId, fieldName, newValue });
    
    try {
      let url;
      let successMessage;
      
      const currentUserName = user?.name || user?.phone_number || 'operation';
      
      // Use specific API for contact name, phone number, email, and company name updates
      if (fieldName === 'contactName') {
        url = `${import.meta.env.VITE_UPDATE_LEAD_API_URL}?id=${leadId}&full_name=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
        successMessage = `Contact name updated to ${newValue} successfully!`;
      } else if (fieldName === 'phoneNumber') {
        url = `${import.meta.env.VITE_UPDATE_LEAD_API_URL}?id=${leadId}&phone=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
        successMessage = `Phone number updated to ${newValue} successfully!`;
      } else if (fieldName === 'email') {
        url = `${import.meta.env.VITE_UPDATE_LEAD_API_URL}?id=${leadId}&email=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
        successMessage = `Email updated to ${newValue} successfully!`;
      } else if (fieldName === 'companyName') {
        url = `${import.meta.env.VITE_UPDATE_LEAD_API_URL}?id=${leadId}&company_name=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
        successMessage = `Company name updated to ${newValue} successfully!`;
      } else if (fieldName === 'alternateNumber') {
        url = `${import.meta.env.VITE_UPDATE_LEAD_API_URL}?id=${leadId}&alternate_number=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
        successMessage = `Alternate phone number updated to ${newValue} successfully!`;
      } else if (fieldName === 'city') {
        url = `${import.meta.env.VITE_UPDATE_CITY_API_URL}?id=${leadId}&city=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
        successMessage = `City updated to ${newValue} successfully!`;
      } else if (fieldName === 'state') {
        url = `${import.meta.env.VITE_UPDATE_STATE_API_URL}?id=${leadId}&state=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
        successMessage = `State updated to ${newValue} successfully!`;
      } else if (fieldName === 'country') {
        url = `${import.meta.env.VITE_UPDATE_COUNTRY_API_URL}?id=${leadId}&country=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
        successMessage = `Country updated to ${newValue} successfully!`;
      } else if (fieldName === 'leadStatus') {
        url = `${import.meta.env.VITE_UPDATE_LEAD_STATUS_API_URL}?id=${leadId}&new_status=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
        successMessage = `Lead status updated to ${newValue} successfully!`;
      } else if (fieldName === 'industry') {
        url = `${import.meta.env.VITE_UPDATE_INDUSTRY_API_URL}?id=${leadId}&industry=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
        successMessage = `Industry updated to ${newValue} successfully!`;
      } else if (fieldName === 'contactOwner') {
        url = `${import.meta.env.VITE_UPDATE_LEAD_OWNER_API_URL}?id=${leadId}&owner=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
        successMessage = `Contact owner updated to ${newValue} successfully!`;
      } else if (fieldName === 'leadSource') {
        url = `${import.meta.env.VITE_UPDATE_LEAD_SOURCE_API_URL}?id=${leadId}&lead_source=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
        successMessage = `Lead source updated to ${newValue} successfully!`;
      } else if (fieldName === 'tags') {
        url = `${import.meta.env.VITE_UPDATE_LEAD_TAGS_API_URL}?id=${leadId}&tags=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
        successMessage = `Tags updated to ${newValue} successfully!`;
      } else {
        // Use generic update approach for other fields
        url = `${import.meta.env.VITE_UPDATE_LEAD_STATUS_API_URL}?id=${leadId}&${fieldName}=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
        successMessage = `Lead ${fieldName} updated to ${newValue} successfully!`;
      }
      
      console.log('Full API URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API result:', result);
      
      if (result.success) {
        console.log('Field update successful');
        // Update local state
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === leadId ? { ...lead, [fieldName]: newValue } : lead
          )
        );
        
        // Update selected user if modal is open
        if (selectedUser && selectedUser.id === leadId) {
          setSelectedUser(prev => ({ ...prev, [fieldName]: newValue }));
        }
        
        // Show field-specific toast message
        const fieldMessages = {
          'contactName': 'Contact name updated',
          'phoneNumber': 'Phone number updated',
          'email': 'Email updated',
          'companyName': 'Company name updated',
          'alternateNumber': 'Alternate phone number updated',
          'city': 'City updated',
          'state': 'State updated',
          'country': 'Country updated',
          'leadStatus': 'Lead status updated',
          'industry': 'Industry updated',
          'contactOwner': 'Contact owner updated',
          'leadSource': 'Lead source updated',
          'tags': 'Tags updated'
        };
        toast.success(fieldMessages[fieldName] || `${fieldName} updated`);
      } else {
        console.error('API returned failure:', result);
        // Check if the message contains "updated" or "success" despite success=false
        const message = result.message || 'Unknown error';
        if (message.toLowerCase().includes('updated') || message.toLowerCase().includes('success')) {
          // If message indicates success despite success=false, treat it as success
          console.log('API indicates success despite success flag, treating as successful update');
          // Update local state
          setLeads(prevLeads => 
            prevLeads.map(lead => 
              lead.id === leadId ? { ...lead, [fieldName]: newValue } : lead
            )
          );
          
          // Update selected user if modal is open
          if (selectedUser && selectedUser.id === leadId) {
            setSelectedUser(prev => ({ ...prev, [fieldName]: newValue }));
          }
          
          // Show field-specific toast message
          const fieldMessages = {
            'contactName': 'Contact name updated',
            'phoneNumber': 'Phone number updated',
            'email': 'Email updated',
            'companyName': 'Company name updated',
            'alternateNumber': 'Alternate phone number updated',
            'city': 'City updated',
            'state': 'State updated',
            'country': 'Country updated',
            'leadStatus': 'Lead status updated',
            'industry': 'Industry updated',
            'contactOwner': 'Contact owner updated',
            'leadSource': 'Lead source updated',
            'tags': 'Tags updated'
          };
          toast.success(fieldMessages[fieldName] || `${fieldName} updated`);
        } else {
          // Genuine error
          // alert(`Failed to update lead ${fieldName}: ${message}`); // Removed alert
        }
      }
    } catch (err) {
      console.error('Network error updating lead field:', err);
      // alert(`Network error: ${err.message || 'Unknown error occurred'}`); // Removed alert
    }
  };

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

  const handleTagsUpdate = async (leadId, newTags) => {
    console.log('Updating lead tags:', { leadId, newTags });
    
    try {
      const currentUserName = user?.name || user?.phone_number || 'operation';
      const url = `${import.meta.env.VITE_UPDATE_LEAD_TAGS_API_URL}?id=${leadId}&tags=${encodeURIComponent(newTags)}&user=${encodeURIComponent(currentUserName)}`;
      console.log('Full API URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API result:', result);
      
      if (result.success) {
        console.log('Tags update successful');
        // Update local state
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === leadId ? { ...lead, tags: newTags } : lead
          )
        );
        
        // Update selected user if modal is open
        if (selectedUser && selectedUser.id === leadId) {
          setSelectedUser(prev => ({ ...prev, tags: newTags }));
        }
        
        toast.success('Tags updated');
      } else {
        console.error('API returned failure:', result);
        // alert(`Failed to update lead tags: ${result.message || 'Unknown error'}`); // Removed alert
      }
    } catch (err) {
      console.error('Network error updating lead tags:', err);
      // alert(`Network error: ${err.message || 'Unknown error occurred'}`); // Removed alert
    }
  };

  const handleLeadSourceUpdate = async (leadId, newLeadSource) => {
    console.log('Updating lead source:', { leadId, newLeadSource });
    
    try {
      const currentUserName = user?.name || user?.phone_number || 'operation';
      const url = `${import.meta.env.VITE_UPDATE_LEAD_SOURCE_API_URL}?id=${leadId}&lead_source=${encodeURIComponent(newLeadSource)}&user=${encodeURIComponent(currentUserName)}`;
      console.log('Full API URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API result:', result);
      
      if (result.success) {
        console.log('Lead source update successful');
        // Update local state
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === leadId ? { ...lead, leadSource: newLeadSource } : lead
          )
        );
        
        // Update selected user if modal is open
        if (selectedUser && selectedUser.id === leadId) {
          setSelectedUser(prev => ({ ...prev, leadSource: newLeadSource }));
        }
        
        toast.success('Lead source updated');
      } else {
        console.error('API returned failure:', result);
        // alert(`Failed to update lead source: ${result.message || 'Unknown error'}`); // Removed alert
      }
    } catch (err) {
      console.error('Network error updating lead source:', err);
      // alert(`Network error: ${err.message || 'Unknown error occurred'}`); // Removed alert
    }
  };

  const handleCityUpdate = async (leadId, newCity) => {
    console.log('Updating city:', { leadId, newCity });
    
    try {
      const currentUserName = user?.name || user?.phone_number || 'operation';
      const url = `${import.meta.env.VITE_UPDATE_CITY_API_URL}?id=${leadId}&city=${encodeURIComponent(newCity)}&user=${encodeURIComponent(currentUserName)}`;
      console.log('Full API URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API result:', result);
      
      if (result.success) {
        console.log('City update successful');
        // Update local state
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === leadId ? { ...lead, city: newCity } : lead
          )
        );
        
        // Update selected user if modal is open
        if (selectedUser && selectedUser.id === leadId) {
          setSelectedUser(prev => ({ ...prev, city: newCity }));
        }
        
        toast.success('City updated');
      } else {
        console.error('API returned failure:', result);
        // alert(`Failed to update city: ${result.message || 'Unknown error'}`); // Removed alert
      }
    } catch (err) {
      console.error('Network error updating city:', err);
      // alert(`Network error: ${err.message || 'Unknown error occurred'}`); // Removed alert
    }
  };

  const handleStateUpdate = async (leadId, newState) => {
    console.log('Updating state:', { leadId, newState });
    
    try {
      const currentUserName = user?.name || user?.phone_number || 'operation';
      const url = `${import.meta.env.VITE_UPDATE_STATE_API_URL}?id=${leadId}&state=${encodeURIComponent(newState)}&user=${encodeURIComponent(currentUserName)}`;
      console.log('Full API URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API result:', result);
      
      if (result.success) {
        console.log('State update successful');
        // Update local state
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === leadId ? { ...lead, state: newState } : lead
          )
        );
        
        // Update selected user if modal is open
        if (selectedUser && selectedUser.id === leadId) {
          setSelectedUser(prev => ({ ...prev, state: newState }));
        }
        
        toast.success('State updated');
      } else {
        console.error('API returned failure:', result);
        // alert(`Failed to update state: ${result.message || 'Unknown error'}`); // Removed alert
      }
    } catch (err) {
      console.error('Network error updating state:', err);
      // alert(`Network error: ${err.message || 'Unknown error occurred'}`); // Removed alert
    }
  };

  const handleCountryUpdate = async (leadId, newCountry) => {
    console.log('Updating country:', { leadId, newCountry });
    
    try {
      const currentUserName = user?.name || user?.phone_number || 'operation';
      const url = `${import.meta.env.VITE_UPDATE_COUNTRY_API_URL}?id=${leadId}&country=${encodeURIComponent(newCountry)}&user=${encodeURIComponent(currentUserName)}`;
      console.log('Full API URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API result:', result);
      
      if (result.success) {
        console.log('Country update successful');
        // Update local state
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === leadId ? { ...lead, country: newCountry } : lead
          )
        );
        
        // Update selected user if modal is open
        if (selectedUser && selectedUser.id === leadId) {
          setSelectedUser(prev => ({ ...prev, country: newCountry }));
        }
        
        toast.success('Country updated');
      } else {
        console.error('API returned failure:', result);
        // alert(`Failed to update country: ${result.message || 'Unknown error'}`); // Removed alert
      }
    } catch (err) {
      console.error('Network error updating country:', err);
      // alert(`Network error: ${err.message || 'Unknown error occurred'}`); // Removed alert
    }
  };

  const handleIndustryUpdate = async (leadId, newIndustry) => {
    console.log('Updating industry:', { leadId, newIndustry });
    
    try {
      const currentUserName = user?.name || user?.phone_number || 'operation';
      const url = `${import.meta.env.VITE_UPDATE_INDUSTRY_API_URL}?id=${leadId}&industry=${encodeURIComponent(newIndustry)}&user=${encodeURIComponent(currentUserName)}`;
      console.log('Full API URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API result:', result);
      
      if (result.success) {
        console.log('Industry update successful');
        // Update local state
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === leadId ? { ...lead, industry: newIndustry } : lead
          )
        );
        
        // Update selected user if modal is open
        if (selectedUser && selectedUser.id === leadId) {
          setSelectedUser(prev => ({ ...prev, industry: newIndustry }));
        }
        
        toast.success('Industry updated');
      } else {
        console.error('API returned failure:', result);
        // alert(`Failed to update industry: ${result.message || 'Unknown error'}`); // Removed alert
      }
    } catch (err) {
      console.error('Network error updating industry:', err);
      // alert(`Network error: ${err.message || 'Unknown error occurred'}`); // Removed alert
    }
  };

  const handleLeadInfoStatusUpdate = async (leadId, newStatus) => {
    console.log('Updating lead status from Lead Information modal:', { leadId, newStatus });
    
    try {
      const currentUserName = user?.name || user?.phone_number || 'operation';
      const url = `${import.meta.env.VITE_UPDATE_LEAD_STATUS_API_URL}?id=${leadId}&new_status=${encodeURIComponent(newStatus)}&user=${encodeURIComponent(currentUserName)}`;
      console.log('Full API URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API result:', result);
      
      if (result.success) {
        console.log('Lead status update successful');
        // Update local state
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === leadId ? { ...lead, leadStatus: newStatus, modifiedBy: currentUserName, lastActivity: new Date().toISOString() } : lead
          )
        );
        
        // Update selectedLead if modal is open
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead(prev => ({ ...prev, leadStatus: newStatus, modifiedBy: currentUserName, lastActivity: new Date().toISOString() }));
        }
        
        // Update selectedUser if modal is open
        if (selectedUser && selectedUser.id === leadId) {
          setSelectedUser(prev => ({ ...prev, leadStatus: newStatus, modifiedBy: currentUserName, lastActivity: new Date().toISOString() }));
        }
        
        toast.success('Lead status updated');
      } else {
        console.error('API returned failure:', result);
        alert(`Failed to update lead status: ${result.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Network error updating lead status:', err);
      alert(`Network error: ${err.message || 'Unknown error occurred'}`);
    }
  };

  const handleAlternateNumberUpdate = async (leadId, newAlternateNumber) => {
    console.log('Updating alternate phone number from Lead Information modal:', { leadId, newAlternateNumber });
    
    try {
      const currentUserName = user?.name || user?.phone_number || 'operation';
      const url = `${import.meta.env.VITE_UPDATE_LEAD_API_URL}?id=${leadId}&alternate_number=${encodeURIComponent(newAlternateNumber)}&user=${encodeURIComponent(currentUserName)}`;
      console.log('Full API URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API result:', result);
      
      if (result.success) {
        console.log('Alternate number update successful');
        // Update local state
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === leadId ? { ...lead, alternateNumber: newAlternateNumber, modifiedBy: currentUserName, lastActivity: new Date().toISOString() } : lead
          )
        );
        
        // Update selectedLead if modal is open
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead(prev => ({ ...prev, alternateNumber: newAlternateNumber, modifiedBy: currentUserName, lastActivity: new Date().toISOString() }));
        }
        
        // Update selectedUser if modal is open
        if (selectedUser && selectedUser.id === leadId) {
          setSelectedUser(prev => ({ ...prev, alternateNumber: newAlternateNumber, modifiedBy: currentUserName, lastActivity: new Date().toISOString() }));
        }
        
        toast.success('Alternate phone number updated');
      } else {
        console.error('API returned failure:', result);
        alert(`Failed to update alternate phone number: ${result.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Network error updating alternate phone number:', err);
      alert(`Network error: ${err.message || 'Unknown error occurred'}`);
    }
  };

  const handleDeleteLead = async (leadId) => {
    console.log('Deleting lead:', { leadId });
    
    // Confirm deletion
    const confirmDelete = window.confirm('Are you sure you want to delete this lead? This action cannot be undone.');
    if (!confirmDelete) {
      return;
    }
    
    try {
      const url = `${import.meta.env.VITE_DELETE_LEAD_API_URL}?id=${leadId}`;
      console.log('Full API URL:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API result:', result);
      
      if (result.success) {
        console.log('Lead deletion successful');
        // Remove lead from local state
        setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
        
        // Close modals if they contain the deleted lead
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead(null);
        }
        if (selectedUser && selectedUser.id === leadId) {
          setSelectedUser(null);
        }
        
        alert('Lead deleted successfully!');
      } else {
        console.error('API returned failure:', result);
        alert(`Failed to delete lead: ${result.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Network error deleting lead:', err);
      alert(`Network error: ${err.message || 'Unknown error occurred'}`);
    }
  };

  const handleContactOwnerFilter = async (owner, operator) => {
    console.log('Filtering leads by contact owner:', { owner, operator });
    
    try {
      let url = `${import.meta.env.VITE_FILTER_LEADS_API_URL}?`;
      
      if (operator === 'is') {
        url += `owner_is=${encodeURIComponent(owner)}`;
      } else if (operator === 'is_not') {
        url += `owner_is_not=${encodeURIComponent(owner)}`;
      }
      
      console.log('Full API URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API result:', result);
      
      if (result.data && Array.isArray(result.data)) {
        console.log('Contact owner filter successful');
        
        // Transform the filtered leads data
        const transformedLeads = result.data.map(lead => ({
          id: lead.id,
          contactName: lead.full_name || 'Unknown',
          phoneNumber: lead.phone || '',
          alternateNumber: lead.alternate_number || '',
          email: lead.email || '',
          companyName: lead.company_name || '',
          contactOwner: lead.owner || 'Unassigned',
          city: lead.city || '',
          state: lead.state || '',
          country: lead.country || 'IN',
          leadStatus: lead.status || 'New',
          tags: lead.tags || '',
          leadSource: lead.lead_source || '',
          description: lead.description || '',
          createdTime: lead.created_time || new Date().toISOString(),
          industry: lead.industry || '',
          createdBy: lead.created_by || 'System',
          modifiedBy: lead.modified_by || 'System',
          lastActivity: lead.last_activity || new Date().toISOString()
        }));
        
        setLeads(transformedLeads);
        setError(null);
        
        // Update filter state
        setContactOwnerFilter(owner);
        setContactOwnerFilterOperator(operator);
        setIsFilterApplied(true);
        setCurrentFilterCriteria(`Contact Owner ${operator === 'is_not' ? 'is not' : 'is'}: ${owner}`);
        
        alert(`Leads filtered by contact owner ${operator} "${owner}" successfully! Found ${result.total || transformedLeads.length} records.`);
      } else {
        console.error('API returned unexpected format:', result);
        alert(`Failed to filter leads: Unexpected response format`);
      }
    } catch (err) {
      console.error('Network error filtering leads:', err);
      alert(`Network error: ${err.message || 'Unknown error occurred'}`);
    }
  };

  const handleFilteredCSVDownload = async (filters) => {
    console.log('Downloading filtered CSV with filters:', filters);
    
    try {
      let url = `${import.meta.env.VITE_LEADS_API_URL}/download?`;
      const urlParams = [];
      
      // Build URL parameters for all filters
      filters.forEach(filter => {
        if (filter.property === 'contact_owner' && filter.value) {
          const operator = filter.operator === 'isn\'t' ? 'is_not' : 'is';
          const paramName = `owner_${operator}`;
          urlParams.push(`${paramName}=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'lead_status' && filter.value) {
          const operator = filter.operator === 'isn\'t' ? 'is_not' : 'is';
          const paramName = `status_${operator}`;
          urlParams.push(`${paramName}=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'tag' && filter.value) {
          const operator = filter.operator === 'is not' ? 'is_not' : 'is';
          const paramName = `tags_${operator}`;
          urlParams.push(`${paramName}=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'mailing_state' && filter.value) {
          const operator = filter.operator === 'is not' ? 'is_not' : 'is';
          const paramName = `state_${operator}`;
          urlParams.push(`${paramName}=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'mailing_country' && filter.value) {
          const operator = filter.operator === 'is not' ? 'is_not' : 'is';
          const paramName = `country_${operator}`;
          urlParams.push(`${paramName}=${encodeURIComponent(filter.value)}`);
        }
      });
      
      url += urlParams.join('&');
      console.log('Download CSV URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Download response status:', response.status);
      console.log('Download response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Download error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      console.log('CSV blob created:', blob);
      
      // Create a download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Generate filename with current date and filter info
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
      const filterInfo = filters.map(f => `${f.property}_${f.operator}_${f.value}`).join('_');
      const filename = `filtered_leads_${dateStr}_${filterInfo.substring(0, 50)}.csv`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      alert(`Filtered CSV downloaded successfully! Filename: ${filename}`);
    } catch (err) {
      console.error('Network error downloading filtered CSV:', err);
      alert(`Network error: ${err.message || 'Unknown error occurred'}`);
    }
  };

  const handleContactNameUpdate = async (leadId, newContactName) => {
    console.log('Updating contact name:', { leadId, newContactName });
    
    try {
      const url = `${import.meta.env.VITE_UPDATE_LEAD_API_URL}?id=${leadId}&full_name=${encodeURIComponent(newContactName)}&user=admin`;
      console.log('Full API URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API result:', result);
      
      if (result.success) {
        console.log('Contact name update successful');
        // Update local state
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === leadId ? { ...lead, contactName: newContactName } : lead
          )
        );
        
        // Update selected user if modal is open
        if (selectedUser && selectedUser.id === leadId) {
          setSelectedUser(prev => ({ ...prev, contactName: newContactName }));
        }
        
        toast.success('Contact name updated');
      } else {
        console.error('API returned failure:', result);
        alert(`Failed to update contact name: ${result.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Network error updating contact name:', err);
      alert(`Network error: ${err.message || 'Unknown error occurred'}`);
    }
  };

  const handleCreateLead = async (leadData) => {
    console.log('Creating new lead:', leadData);
    
    try {
      const url = `${import.meta.env.VITE_CREATE_LEAD_API_URL}`;
      console.log('Full API URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData)
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API result:', result);
      
      if (result.success) {
        console.log('Lead creation successful');
        // Refresh the leads list
        fetchLeads();
        setShowAddModal(false);
        toast.success('Lead created successfully!');
      } else {
        console.error('API returned failure:', result);
        alert(`Failed to create lead: ${result.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Network error creating lead:', err);
      alert(`Network error: ${err.message || 'Unknown error occurred'}`);
    }
  };

  const handleCombinedFilters = async (filters) => {
    console.log('Applying combined filters:', filters);
    
    try {
      let url = `${import.meta.env.VITE_FILTER_LEADS_API_URL}?`;
      const urlParams = [];
      
      // Build URL parameters for all filters
      filters.forEach(filter => {
        if (filter.property === 'contact_owner' && filter.value) {
          const operator = filter.operator === 'isn\'t' ? 'is_not' : 'is';
          const paramName = `owner_${operator}`;
          urlParams.push(`${paramName}=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'lead_status' && filter.value) {
          const operator = filter.operator === 'isn\'t' ? 'is_not' : 'is';
          const paramName = `status_${operator}`;
          urlParams.push(`${paramName}=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'tag' && filter.value) {
          const operator = filter.operator === 'is not' ? 'is_not' : 'is';
          const paramName = `tags_${operator}`;
          urlParams.push(`${paramName}=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'mailing_state' && filter.value) {
          const operator = filter.operator === 'is not' ? 'is_not' : 'is';
          const paramName = `state_${operator}`;
          urlParams.push(`${paramName}=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'mailing_country' && filter.value) {
          const operator = filter.operator === 'is not' ? 'is_not' : 'is';
          const paramName = `country_${operator}`;
          urlParams.push(`${paramName}=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'created_time' && filter.dateOperator === 'on' && filter.value) {
          urlParams.push(`date_type=on`);
          urlParams.push(`date=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'created_time' && filter.dateOperator === 'before' && filter.value) {
          urlParams.push(`date_type=before`);
          urlParams.push(`date=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'created_time' && filter.dateOperator === 'between' && filter.fromDate && filter.toDate) {
          urlParams.push(`date_type=between`);
          urlParams.push(`from=${encodeURIComponent(filter.fromDate)}`);
          urlParams.push(`to=${encodeURIComponent(filter.toDate)}`);
        }
      });
      
      url += urlParams.join('&');
      console.log('Full API URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API result:', result);
      
      if (result.data && Array.isArray(result.data)) {
        console.log('Combined filters successful');
        
        // Transform the filtered leads data
        const transformedLeads = result.data.map(lead => ({
          id: lead.id,
          contactName: lead.full_name || 'Unknown',
          phoneNumber: lead.phone || '',
          alternateNumber: lead.alternate_number || '',
          email: lead.email || '',
          companyName: lead.company_name || '',
          contactOwner: lead.owner || 'Unassigned',
          city: lead.city || '',
          state: lead.state || '',
          country: lead.country || 'IN',
          leadStatus: lead.status || 'New',
          tags: lead.tags || '',
          leadSource: lead.lead_source || '',
          description: lead.description || '',
          createdTime: lead.created_time || new Date().toISOString(),
          industry: lead.industry || '',
          createdBy: lead.created_by || 'System',
          modifiedBy: lead.modified_by || 'System',
          lastActivity: lead.last_activity || new Date().toISOString()
        }));
        
        setLeads(transformedLeads);
        setError(null);
        
        // Update filter state with combined criteria
        setIsFilterApplied(true);
        const filterDescriptions = filters.map(filter => {
          const operator = filter.operator === 'isn\'t' ? 'is not' : 'is';
          const property = filter.property.replace('_', ' ');
          return `${property.charAt(0).toUpperCase() + property.slice(1)} ${operator}: ${filter.value}`;
        });
        setCurrentFilterCriteria(filterDescriptions.join(', '));
        
        alert(`Leads filtered successfully! Found ${result.total || transformedLeads.length} records.`);
      } else {
        console.error('API returned unexpected format:', result);
        alert(`Failed to filter leads: Unexpected response format`);
      }
    } catch (err) {
      console.error('Network error filtering leads:', err);
      alert(`Network error: ${err.message || 'Unknown error occurred'}`);
    }
  };

  // Predefined tags options
  const predefinedTags = [
    'Sat2Farm Recurring',
    'Sat2Farm Non Recurring',
    'Sat2Farm Exclusivity',
    'Sat4Agri',
    'Sat4Risk',
    'Project',
    'WhiteLabelling',
    'API Client'
  ];

  // Predefined lead source options
  const predefinedLeadSources = [
    'FB Campaign',
    'Website Inbound',
    'Sales Inbound',
    'Mail Inbound',
    'External Referral',
    'Cold Call',
    'Event'
  ];

  // Predefined industry options
  const predefinedIndustries = [
    'Farmer',
    'FPO',
    'NGO',
    'Government',
    'Enterprise',
    'Agri Input',
    'Agri Output'
  ];

  // Editable field component
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
                  flex: 1,
                  padding: '6px 8px',
                  border: '1px solid var(--green-600)',
                  borderRadius: 'var(--r)',
                  fontSize: '12px',
                  background: 'var(--surface)',
                  color: 'var(--text)'
                }}
                autoFocus
              />
              <button
                onClick={saveEdit}
                style={{
                  padding: '4px 8px',
                  background: 'var(--green-600)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--r)',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                ✓
              </button>
              <button
                onClick={cancelEdit}
                style={{
                  padding: '4px 8px',
                  background: 'var(--gray-200)',
                  color: 'var(--text)',
                  border: 'none',
                  borderRadius: 'var(--r)',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </>
          ) : (
            <div 
              style={{ 
                flex: 1, 
                color: value ? 'var(--text)' : 'var(--text-3)', 
                fontStyle: value ? 'normal' : 'italic',
                minHeight: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px',
                borderRadius: 'var(--r)',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onClick={() => startEditing(fieldName, value)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--gray-100)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
              }}
            >
              <span>{value || 'Not specified'}</span>
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                style={{
                  opacity: 0,
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = '0';
                }}
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

  const handleCSVImport = async (file) => {
    console.log('Starting CSV import for file:', file.name);
    
    try {
      const formData = new FormData();
      formData.append('csv_file', file);
      formData.append('user', user?.name || user?.phone_number || 'operation');
      formData.append('contact_owner', user?.name || user?.phone_number || 'operation');
      
      console.log('Uploading CSV to API...');
      const currentUserName = user?.name || user?.phone_number || 'operation';
      const response = await fetch(`${import.meta.env.VITE_UPLOAD_CSV_API_URL}?user=${encodeURIComponent(currentUserName)}`, {
        method: 'POST',
        body: formData
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API result:', result);
      
      if (result.success) {
        console.log('CSV import successful');
        // Refresh leads data to show newly imported leads
        await fetchLeads();
        alert(`Successfully imported ${result.imported_count || result.count || 'unknown number of'} leads!`);
      } else {
        console.error('API returned failure:', result);
        alert(`Failed to import CSV: ${result.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error uploading CSV:', err);
      alert(`Error uploading CSV: ${err.message || 'Unknown error occurred'}`);
    }
  };
  
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const currentUserName = user?.name || user?.phone_number || 'operation';
      const response = await fetch(`${import.meta.env.VITE_LEADS_API_URL}?user=${encodeURIComponent(currentUserName)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform API data to match component structure
      const transformedLeads = data.map(lead => ({
        id: lead.id,
        contactName: lead.full_name || 'Unknown',
        phoneNumber: lead.phone || '',
        alternateNumber: lead.alternate_number || '',
        email: lead.email || '',
        companyName: lead.company_name || '',
        contactOwner: lead.owner || 'Unassigned',
        city: lead.city || '',
        state: lead.state || '',
        country: lead.country || 'IN',
        leadStatus: lead.status || 'New',
        tags: lead.tags || '',
        leadSource: lead.lead_source || '',
        description: lead.description || '',
        createdTime: lead.created_time || new Date().toISOString(),
        industry: lead.industry || '',
        createdBy: lead.created_by || 'System',
        modifiedBy: lead.modified_by || 'System',
        lastActivity: lead.last_activity || new Date().toISOString()
      }));
      
      setLeads(transformedLeads);
      setError(null);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to load leads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-full">
      <div style={{ padding: '16px', background: '#f8f7f4', height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '32px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border)'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Lead Pipeline
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
            Manage and track sales leads through the pipeline
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => {
              // Create file input element
              const fileInput = document.createElement('input');
              fileInput.type = 'file';
              fileInput.accept = '.csv,.xlsx,.xls';
              fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                  // Handle CSV import
                  handleCSVImport(file);
                }
              };
              fileInput.click();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'var(--green-600)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--r)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            <Upload size={16} />
            Import CSV
          </button>
        </div>
      </div>

      
      {/* Search and Filter */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '16px',
        flexWrap: 'wrap',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '300px' }}>
          <button
            onClick={() => setFilterSidebarOpen(!filterSidebarOpen)}
            style={{
              padding: '10px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r)',
              background: filterSidebarOpen ? 'var(--blue-600)' : 'var(--surface)',
              color: filterSidebarOpen ? 'white' : 'var(--text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Filters"
          >
            <Filter size={16} />
          </button>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b'
            }} />
            <input
              type="text"
              placeholder="Search leads by name, company, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '300px',
                padding: '8px 12px 8px 36px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r)',
                fontSize: '14px',
                background: 'var(--surface)',
                color: 'var(--text)'
              }}
            />
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-sm"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            padding: '5px 10px',
            background: 'var(--green-600)',
            color: '#fff',
            border: '1px solid var(--green-600)',
            borderRadius: 'var(--r)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--green-700)';
            e.currentTarget.style.borderColor = 'var(--green-700)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--green-600)';
            e.currentTarget.style.borderColor = 'var(--green-600)';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Lead
        </button>
        
        <button
          onClick={() => {
            if (isFilterApplied) {
              // Collect active filters for download
              const activeFilters = [];
              
              const contactOwnerProp = selectedProperties.find(prop => prop.property === 'contact_owner');
              if (contactOwnerProp && contactOwnerProp.value) {
                const selectedOwners = contactOwnerProp.value.split(',');
                if (selectedOwners.length > 0) {
                  const ownersString = selectedOwners.join(',');
                  activeFilters.push({
                    property: 'contact_owner',
                    value: ownersString,
                    operator: contactOwnerProp.operator
                  });
                }
              }
              
              const leadStatusProp = selectedProperties.find(prop => prop.property === 'lead_status');
              if (leadStatusProp && leadStatusProp.value) {
                const selectedStatuses = leadStatusProp.value.split(',');
                if (selectedStatuses.length > 0) {
                  const statusesString = selectedStatuses.join(',');
                  activeFilters.push({
                    property: 'lead_status',
                    value: statusesString,
                    operator: leadStatusProp.operator
                  });
                }
              }
              
              const tagProp = selectedProperties.find(prop => prop.property === 'tag');
              if (tagProp && tagProp.value) {
                const selectedTags = tagProp.value.split(',');
                if (selectedTags.length > 0) {
                  const tagsString = selectedTags.join(',');
                  activeFilters.push({
                    property: 'tag',
                    value: tagsString,
                    operator: tagProp.operator
                  });
                }
              }
              
              const mailingStateProp = selectedProperties.find(prop => prop.property === 'mailing_state');
              if (mailingStateProp && mailingStateProp.value) {
                const selectedStates = mailingStateProp.value.split(',');
                if (selectedStates.length > 0) {
                  const statesString = selectedStates.join(',');
                  activeFilters.push({
                    property: 'mailing_state',
                    value: statesString,
                    operator: mailingStateProp.operator
                  });
                }
              }
              
              const mailingCountryProp = selectedProperties.find(prop => prop.property === 'mailing_country');
              if (mailingCountryProp && mailingCountryProp.value) {
                const selectedCountries = mailingCountryProp.value.split(',');
                if (selectedCountries.length > 0) {
                  const countriesString = selectedCountries.join(',');
                  activeFilters.push({
                    property: 'mailing_country',
                    value: countriesString,
                    operator: mailingCountryProp.operator
                  });
                }
              }
              
              // Download filtered CSV if filters are applied
              if (activeFilters.length > 0) {
                handleFilteredCSVDownload(activeFilters);
              } else {
                downloadCSV(); // Fallback to regular download if no filters
              }
            } else {
              downloadCSV(); // Regular download if no filters applied
            }
          }}
          className="btn btn-sm"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            padding: '5px 10px',
            background: 'var(--green-600)',
            color: '#fff',
            border: '1px solid var(--green-600)',
            borderRadius: 'var(--r)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--green-700)';
            e.currentTarget.style.borderColor = 'var(--green-700)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--green-600)';
            e.currentTarget.style.borderColor = 'var(--green-600)';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download CSV
        </button>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={newThisWeekFilter}
            onChange={(e) => setNewThisWeekFilter(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ color: 'var(--text)', fontSize: '14px' }}>New This Week</span>
        </label>
      </div>

      {/* Filter Status Indicator */}
      {isFilterApplied && (
        <div style={{
          background: 'var(--blue-50)',
          border: '1px solid var(--blue-200)',
          borderRadius: 'var(--r)',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} style={{ color: 'var(--blue-600)' }} />
            <span style={{ color: 'var(--blue-600)', fontSize: '14px', fontWeight: '500' }}>
              Filtered Results: {currentFilterCriteria}
            </span>
            <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>
              ({leads.length} records found)
            </span>
          </div>
          <button
            onClick={() => {
              setIsFilterApplied(false);
              setCurrentFilterCriteria('');
              setContactOwnerFilter('');
              setContactOwnerFilterOperator('is');
              // Clear filter sidebar selections
              setSelectedProperties([]);
              setCurrentProperty('');
              setFilterStatus('all');
              setNewThisWeekFilter(false);
              setSearchTerm('');
              // Refetch all leads
              fetchLeads();
            }}
            style={{
              background: 'none',
              border: '1px solid var(--blue-600)',
              borderRadius: 'var(--r)',
              padding: '4px 8px',
              color: 'var(--blue-600)',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <X size={12} />
            Clear Filter
          </button>
        </div>
      )}

      {/* Lead Table */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 200px)',
        overflowX: 'auto',
        maxWidth: '100%',
        flex: 1
      }}>
        <div style={{
          overflowX: 'auto',
          maxWidth: '100%',
          flex: 1
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0',
            fontSize: '13px',
            height: '100%'
          }}>
            <thead>
              <tr style={{
                background: 'var(--gray-100)',
                borderBottom: '2px solid var(--border)'
              }}>
                <th style={{ padding: '12px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '2px solid var(--border)', position: 'sticky', left: '0', backgroundColor: 'var(--gray-100)', zIndex: 11 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={selectedRows.length === filteredLeads.length && filteredLeads.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(filteredLeads.map(lead => lead.id));
                        } else {
                          setSelectedRows([]);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>Contact Name</span>
                  </div>
                </th>
                <th style={{ padding: '12px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>Phone Number</th>
                <th style={{ padding: '12px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>Alternate Number</th>
                <th style={{ padding: '12px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>Email</th>
                <th style={{ padding: '12px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>Company Name</th>
                <th style={{ padding: '12px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>Contact Owner</th>
                <th style={{ padding: '12px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>City</th>
                <th style={{ padding: '12px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>State</th>
                <th style={{ padding: '12px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>Country</th>
                <th style={{ padding: '12px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>Lead Status</th>
                <th style={{ padding: '12px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>Tags</th>
                <th style={{ padding: '12px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>Lead Source</th>
                <th style={{ padding: '12px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>Description</th>
                <th style={{ padding: '12px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>Created Time</th>
                <th style={{ padding: '12px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>Industry</th>
                <th style={{ padding: '12px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>Created By</th>
                <th style={{ padding: '12px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>Modified By</th>
                <th style={{ padding: '12px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>Last Activity</th>
                <th style={{ padding: '12px 12px', textAlign: 'center', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="20" style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: 'var(--text-3)',
                    fontSize: '14px'
                  }}>
                    Loading leads...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="20" style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: 'var(--red-600)',
                    fontSize: '14px'
                  }}>
                    {error}
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="20" style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: 'var(--text-3)',
                    fontSize: '14px'
                  }}>
                    No leads found
                  </td>
                </tr>
              ) : (
                currentLeads.map(lead => (
                  <tr
                    key={lead.id}
                    style={{
                      borderBottom: '1px solid var(--border-soft)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--gray-50)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '12px 12px', color: 'var(--text)', fontWeight: '500', textAlign: 'left', borderRight: '2px solid var(--border)', position: 'sticky', left: '0', backgroundColor: 'var(--surface)', zIndex: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(lead.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRows([...selectedRows, lead.id]);
                            } else {
                              setSelectedRows(selectedRows.filter(id => id !== lead.id));
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        <button
                          onClick={() => {
                            setSelectedUser(lead);
                            setShowUserModal(true);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--blue-600)',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            padding: '0',
                            textAlign: 'left'
                          }}
                        >
                          {lead.contactName}
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>
                      {lead.phoneNumber}
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>
                      {lead.alternateNumber}
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>
                      {lead.email}
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>
                      {lead.companyName}
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>
                      {lead.contactOwner}
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>
                      {lead.city}
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>
                      {lead.state}
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>
                      {lead.country}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: 'var(--r)',
                        fontSize: '11px',
                        fontWeight: '500',
                        background: `${statusConfig[lead.leadStatus]?.color || '#6b7280'}15`,
                        color: statusConfig[lead.leadStatus]?.color || '#6b7280'
                      }}>
                        {lead.leadStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>
                        {lead.tags}
                      </span>
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>
                      {lead.leadSource}
                    </td>
                    <td style={{ padding: '12px 8px', color: 'var(--text)', maxWidth: '200px' }}>
                      <div style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }} title={lead.description}>
                        {lead.description}
                      </div>
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>
                        {new Date(lead.createdTime).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>
                      {lead.industry}
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>
                      {lead.createdBy}
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>
                      {lead.modifiedBy}
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>
                        {new Date(lead.lastActivity).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          style={{
                            padding: '4px 6px',
                            background: 'var(--red-100)',
                            color: 'var(--red-600)',
                            border: '1px solid var(--red-200)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                          title="Delete"
                        >
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
        {filteredLeads.length > itemsPerPage && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            borderTop: '1px solid var(--border)',
            background: 'var(--gray-50)'
          }}>
            <div style={{ color: 'var(--text-3)', fontSize: '14px' }}>
              Showing {indexOfFirstLead + 1} to {Math.min(indexOfLastLead, filteredLeads.length)} of {filteredLeads.length} leads
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  background: currentPage === 1 ? 'var(--gray-200)' : 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r)',
                  color: currentPage === 1 ? 'var(--text-3)' : 'var(--text)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '12px'
                }}
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              
              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      padding: '6px 10px',
                      background: currentPage === page ? 'var(--green-600)' : 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--r)',
                      color: currentPage === page ? 'white' : 'var(--text)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      minWidth: '32px'
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  background: currentPage === totalPages ? 'var(--gray-200)' : 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r)',
                  color: currentPage === totalPages ? 'var(--text-3)' : 'var(--text)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '12px'
                }}
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Sidebar */}
      {filterSidebarOpen && (
        <>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '320px',
            background: 'var(--surface)',
            borderRight: '1px solid var(--border)',
            zIndex: 1000,
            overflowY: 'auto'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid var(--border)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '16px', fontWeight: '600' }}>Filters</h3>
                <button
                  onClick={() => setFilterSidebarOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontSize: '14px', fontWeight: '500' }}>Property</label>
                <select
                  value={currentProperty}
                  onChange={(e) => {
                    const property = e.target.value;
                    if (property && !selectedProperties.find(p => p.property === property)) {
                      const newProperty = { 
                        property, 
                        value: '', 
                        operator: property === 'contact_name' ? 'is' : '' 
                      };
                      
                      // Set default dateOperator for created_time
                      if (property === 'created_time') {
                        newProperty.dateOperator = 'on';
                      }
                      
                      setSelectedProperties([...selectedProperties, newProperty]);
                    }
                    setCurrentProperty('');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r)',
                    fontSize: '13px',
                    background: 'var(--surface)',
                    color: 'var(--text)'
                  }}
                >
                  <option value="">Choose Property</option>
                  <option value="contact_owner">Contact Owner</option>
                  <option value="created_time">Created Time</option>
                  <option value="lead_status">Lead Status</option>
                  <option value="tag">Tag</option>
                  <option value="untouched_records">Untouched Records</option>
                  <option value="mailing_country">Mailing Country</option>
                  <option value="mailing_state">Mailing State</option>
                  <option value="activities">Activities</option>
                  <option value="notes">Notes</option>
                  <option value="pipelines">Pipelines</option>
                  <option value="pipeline_stage">Pipeline Stage</option>
                  <option value="created_by">Created By</option>
                  <option value="description">Description</option>
                  <option value="lead_source">Lead Source</option>
                  <option value="mailing_city">Mailing City</option>
                  <option value="mailing_street">Mailing Street</option>
                  <option value="modified_by">Modified By</option>
                  <option value="contact_name">Contact Name</option>
                  <option value="modified_time">Modified Time</option>
                </select>
              </div>
              
              {/* Selected Properties */}
              {selectedProperties.map((prop, index) => (
                <div key={index} style={{ marginBottom: '24px', position: 'relative' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <label style={{ color: 'var(--text)', fontSize: '14px', fontWeight: '500' }}>
                      {prop.property.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                    <button
                      onClick={() => {
                        setSelectedProperties(selectedProperties.filter((_, i) => i !== index));
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-3)',
                        cursor: 'pointer',
                        padding: '2px',
                        borderRadius: 'var(--r)'
                      }}
                      title="Remove filter"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  {/* Contact Name special case with is/isn't and search */}
                  {prop.property === 'contact_name' && (
                    <div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={prop.searchTerm || prop.value || ''}
                          onChange={(e) => {
                            const updated = [...selectedProperties];
                            updated[index].searchTerm = e.target.value;
                            setSelectedProperties(updated);
                          }}
                          placeholder="Search contact name..."
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--r)',
                            fontSize: '13px',
                            background: 'var(--surface)',
                            color: 'var(--text)'
                          }}
                        />
                        <select
                          value={prop.operator || 'is'}
                          onChange={(e) => {
                            const updated = [...selectedProperties];
                            updated[index].operator = e.target.value;
                            setSelectedProperties(updated);
                          }}
                          style={{
                            padding: '8px 12px',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--r)',
                            fontSize: '13px',
                            background: 'var(--surface)',
                            color: 'var(--text)',
                            minWidth: '80px'
                          }}
                        >
                          <option value="is">is</option>
                          <option value="isn't">isn't</option>
                        </select>
                      </div>
                      {prop.value && (
                        <div style={{ 
                          marginTop: '8px', 
                          fontSize: '12px', 
                          color: 'var(--text-3)',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '4px'
                        }}>
                          <span style={{
                            background: 'var(--blue-600)15',
                            color: 'var(--blue-600)',
                            padding: '2px 6px',
                            borderRadius: 'var(--r)',
                            fontSize: '11px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {prop.value}
                            <button
                              onClick={() => {
                                const updated = [...selectedProperties];
                                updated[index].value = '';
                                updated[index].searchTerm = '';
                                setSelectedProperties(updated);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--blue-600)',
                                cursor: 'pointer',
                                padding: '0',
                                fontSize: '12px',
                                lineHeight: '1',
                                borderRadius: '50%',
                                width: '14px',
                                height: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title={`Remove ${prop.value}`}
                            >
                              ×
                            </button>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Contact Owner special case with searchable dropdown and is/isn't */}
                  {prop.property === 'contact_owner' && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ minWidth: '80px' }}>
                        <select
                          value={prop.operator || 'is'}
                          onChange={(e) => {
                            const updated = [...selectedProperties];
                            updated[index].operator = e.target.value;
                            setSelectedProperties(updated);
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--r)',
                            fontSize: '13px',
                            background: 'var(--surface)',
                            color: 'var(--text)'
                          }}
                        >
                          <option value="is">is</option>
                          <option value="isn't">isn't</option>
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            placeholder="Search contact owners..."
                            value={prop.searchTerm || ''}
                            onChange={(e) => {
                              const updated = [...selectedProperties];
                              updated[index].searchTerm = e.target.value;
                              setSelectedProperties(updated);
                            }}
                            onFocus={() => {
                              const updated = [...selectedProperties];
                              updated[index].dropdownOpen = true;
                              setSelectedProperties(updated);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--r)',
                              fontSize: '13px',
                              background: 'var(--surface)',
                              color: 'var(--text)'
                            }}
                          />
                          {prop.dropdownOpen && (
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              background: 'var(--surface)',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--r)',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                              zIndex: 10,
                              maxHeight: '200px',
                              overflowY: 'auto',
                              marginTop: '4px'
                            }}>
                              {getUniqueValues(prop.property)
                                .filter(owner => !prop.searchTerm || owner.toLowerCase().includes(prop.searchTerm.toLowerCase()))
                                .map(owner => (
                                  <div
                                    key={owner}
                                    onClick={() => {
                                      const updated = [...selectedProperties];
                                      const currentValues = updated[index].value ? updated[index].value.split(',') : [];
                                      
                                      if (currentValues.includes(owner)) {
                                        const indexToRemove = currentValues.indexOf(owner);
                                        currentValues.splice(indexToRemove, 1);
                                      } else {
                                        currentValues.push(owner);
                                      }
                                      
                                      updated[index].value = currentValues.join(',');
                                      updated[index].dropdownOpen = false;
                                      updated[index].searchTerm = '';
                                      setSelectedProperties(updated);
                                    }}
                                    style={{
                                      padding: '8px 12px',
                                      cursor: 'pointer',
                                      fontSize: '13px',
                                      color: 'var(--text)',
                                      borderBottom: '1px solid var(--border-soft)',
                                      backgroundColor: prop.value && prop.value.includes(owner) ? 'var(--blue-600)15' : 'transparent'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = 'var(--gray-100)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = prop.value && prop.value.includes(owner) ? 'var(--blue-600)15' : 'transparent';
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <span>{owner}</span>
                                      {prop.value && prop.value.includes(owner) && (
                                        <span style={{ color: 'var(--blue-600)', fontSize: '12px' }}>✓</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                        {prop.value && (
                          <div style={{ 
                            marginTop: '8px', 
                            fontSize: '12px', 
                            color: 'var(--text-3)',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '4px'
                          }}>
                            {prop.value.split(',').map((owner, i) => (
                              <span key={i} style={{
                                background: 'var(--blue-600)15',
                                color: 'var(--blue-600)',
                                padding: '2px 6px',
                                borderRadius: 'var(--r)',
                                fontSize: '11px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                {owner}
                                <button
                                  onClick={() => {
                                    const updated = [...selectedProperties];
                                    const currentValues = updated[index].value ? updated[index].value.split(',') : [];
                                    const indexToRemove = currentValues.indexOf(owner);
                                    if (indexToRemove > -1) {
                                      currentValues.splice(indexToRemove, 1);
                                      updated[index].value = currentValues.join(',');
                                      setSelectedProperties(updated);
                                    }
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--blue-600)',
                                    cursor: 'pointer',
                                    padding: '0',
                                    fontSize: '12px',
                                    lineHeight: '1',
                                    borderRadius: '50%',
                                    width: '14px',
                                    height: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                  title={`Remove ${owner}`}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Lead Status special case with Is/Is Not and multiple selection */}
                  {prop.property === 'lead_status' && (
                    <div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ minWidth: '80px' }}>
                          <select
                            value={prop.operator || 'is'}
                            onChange={(e) => {
                              const updated = [...selectedProperties];
                              updated[index].operator = e.target.value;
                              setSelectedProperties(updated);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--r)',
                              fontSize: '13px',
                              background: 'var(--surface)',
                              color: 'var(--text)'
                            }}
                          >
                            <option value="is">Is</option>
                            <option value="is not">Is Not</option>
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              placeholder="Search lead status..."
                              value={prop.searchTerm || ''}
                              onChange={(e) => {
                                const updated = [...selectedProperties];
                                updated[index].searchTerm = e.target.value;
                                setSelectedProperties(updated);
                              }}
                              onFocus={() => {
                                const updated = [...selectedProperties];
                                updated[index].dropdownOpen = true;
                                setSelectedProperties(updated);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--r)',
                                fontSize: '13px',
                                background: 'var(--surface)',
                                color: 'var(--text)'
                              }}
                            />
                            {prop.dropdownOpen && (
                              <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--r)',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                zIndex: 10,
                                maxHeight: '200px',
                                overflowY: 'auto',
                                marginTop: '4px'
                              }}>
                                {[
                                  'Yet to Contact',
                                  'Attempted to Contact', 
                                  'Contacted',
                                  'Follow-up 1',
                                  'Follow-up 2',
                                  'In Discussion',
                                  'Interested',
                                  'Junk'
                                ].filter(status => !prop.searchTerm || status.toLowerCase().includes(prop.searchTerm.toLowerCase()))
                                .map(status => (
                                  <div
                                    key={status}
                                    onClick={() => {
                                      const updated = [...selectedProperties];
                                      const currentValues = updated[index].value ? updated[index].value.split(',') : [];
                                      
                                      if (currentValues.includes(status)) {
                                        const indexToRemove = currentValues.indexOf(status);
                                        currentValues.splice(indexToRemove, 1);
                                      } else {
                                        currentValues.push(status);
                                      }
                                      
                                      updated[index].value = currentValues.join(',');
                                      updated[index].dropdownOpen = false;
                                      updated[index].searchTerm = '';
                                      setSelectedProperties(updated);
                                    }}
                                    style={{
                                      padding: '8px 12px',
                                      cursor: 'pointer',
                                      fontSize: '13px',
                                      color: 'var(--text)',
                                      borderBottom: '1px solid var(--border-soft)',
                                      backgroundColor: prop.value && prop.value.includes(status) ? 'var(--blue-600)15' : 'transparent'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = 'var(--gray-100)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = prop.value && prop.value.includes(status) ? 'var(--blue-600)15' : 'transparent';
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <span>{status}</span>
                                      {prop.value && prop.value.includes(status) && (
                                        <span style={{ color: 'var(--blue-600)', fontSize: '12px' }}>✓</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          {prop.value && (
                            <div style={{ 
                              marginTop: '8px', 
                              fontSize: '12px', 
                              color: 'var(--text-3)',
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '4px'
                            }}>
                              {prop.value.split(',').map((status, i) => (
                                <span key={i} style={{
                                  background: 'var(--blue-600)15',
                                  color: 'var(--blue-600)',
                                  padding: '2px 6px',
                                  borderRadius: 'var(--r)',
                                  fontSize: '11px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  {status}
                                  <button
                                    onClick={() => {
                                      const updated = [...selectedProperties];
                                      const currentValues = updated[index].value ? updated[index].value.split(',') : [];
                                      const indexToRemove = currentValues.indexOf(status);
                                      if (indexToRemove > -1) {
                                        currentValues.splice(indexToRemove, 1);
                                        updated[index].value = currentValues.join(',');
                                        setSelectedProperties(updated);
                                      }
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--blue-600)',
                                      cursor: 'pointer',
                                      padding: '0',
                                      fontSize: '12px',
                                      lineHeight: '1',
                                      borderRadius: '50%',
                                      width: '14px',
                                      height: '14px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                    title={`Remove ${status}`}
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Tag special case with Is/Is Not and multiple selection */}
                  {prop.property === 'tag' && (
                    <div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ minWidth: '80px' }}>
                          <select
                            value={prop.operator || 'is'}
                            onChange={(e) => {
                              const updated = [...selectedProperties];
                              updated[index].operator = e.target.value;
                              setSelectedProperties(updated);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--r)',
                              fontSize: '13px',
                              background: 'var(--surface)',
                              color: 'var(--text)'
                            }}
                          >
                            <option value="is">Is</option>
                            <option value="is not">Is Not</option>
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              placeholder="Search tags..."
                              value={prop.searchTerm || ''}
                              onChange={(e) => {
                                const updated = [...selectedProperties];
                                updated[index].searchTerm = e.target.value;
                                setSelectedProperties(updated);
                              }}
                              onFocus={() => {
                                const updated = [...selectedProperties];
                                updated[index].dropdownOpen = true;
                                setSelectedProperties(updated);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--r)',
                                fontSize: '13px',
                                background: 'var(--surface)',
                                color: 'var(--text)'
                              }}
                            />
                            {prop.dropdownOpen && (
                              <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--r)',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                zIndex: 10,
                                maxHeight: '200px',
                                overflowY: 'auto',
                                marginTop: '4px'
                              }}>
                                {[
                                  'Sat2Farm Recurring',
                                  'Sat2Farm Non Recurring',
                                  'Sat2Farm Exclusivity',
                                  'Sat4Agri',
                                  'Sat4Risk',
                                  'Project',
                                  'WhiteLabelling',
                                  'API Client'
                                ].filter(tag => !prop.searchTerm || tag.toLowerCase().includes(prop.searchTerm.toLowerCase()))
                                .map(tag => (
                                  <div
                                    key={tag}
                                    onClick={() => {
                                      const updated = [...selectedProperties];
                                      const currentValues = updated[index].value ? updated[index].value.split(',') : [];
                                      
                                      if (currentValues.includes(tag)) {
                                        const indexToRemove = currentValues.indexOf(tag);
                                        currentValues.splice(indexToRemove, 1);
                                      } else {
                                        currentValues.push(tag);
                                      }
                                      
                                      updated[index].value = currentValues.join(',');
                                      updated[index].dropdownOpen = false;
                                      updated[index].searchTerm = '';
                                      setSelectedProperties(updated);
                                    }}
                                    style={{
                                      padding: '8px 12px',
                                      cursor: 'pointer',
                                      fontSize: '13px',
                                      color: 'var(--text)',
                                      borderBottom: '1px solid var(--border-soft)',
                                      backgroundColor: prop.value && prop.value.includes(tag) ? 'var(--blue-600)15' : 'transparent'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = 'var(--gray-100)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = prop.value && prop.value.includes(tag) ? 'var(--blue-600)15' : 'transparent';
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <span>{tag}</span>
                                      {prop.value && prop.value.includes(tag) && (
                                        <span style={{ color: 'var(--blue-600)', fontSize: '12px' }}>✓</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          {prop.value && (
                            <div style={{ 
                              marginTop: '8px', 
                              fontSize: '12px', 
                              color: 'var(--text-3)',
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '4px'
                            }}>
                              {prop.value.split(',').map((tag, i) => (
                                <span key={i} style={{
                                  background: 'var(--blue-600)15',
                                  color: 'var(--blue-600)',
                                  padding: '2px 6px',
                                  borderRadius: 'var(--r)',
                                  fontSize: '11px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  {tag}
                                  <button
                                    onClick={() => {
                                      const updated = [...selectedProperties];
                                      const currentValues = updated[index].value ? updated[index].value.split(',') : [];
                                      const indexToRemove = currentValues.indexOf(tag);
                                      if (indexToRemove > -1) {
                                        currentValues.splice(indexToRemove, 1);
                                        updated[index].value = currentValues.join(',');
                                        setSelectedProperties(updated);
                                      }
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--blue-600)',
                                      cursor: 'pointer',
                                      padding: '0',
                                      fontSize: '12px',
                                      lineHeight: '1',
                                      borderRadius: '50%',
                                      width: '14px',
                                      height: '14px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                    title={`Remove ${tag}`}
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Mailing Country special case with Is/Is Not/Contains and multiple selection */}
                  {prop.property === 'mailing_country' && (
                    <div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ minWidth: '100px' }}>
                          <select
                            value={prop.operator || 'is'}
                            onChange={(e) => {
                              const updated = [...selectedProperties];
                              updated[index].operator = e.target.value;
                              setSelectedProperties(updated);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--r)',
                              fontSize: '13px',
                              background: 'var(--surface)',
                              color: 'var(--text)'
                            }}
                          >
                            <option value="is">Is</option>
                            <option value="is not">Is Not</option>
                            <option value="contains">Contains</option>
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              placeholder="Search countries..."
                              value={prop.searchTerm || ''}
                              onChange={(e) => {
                                const updated = [...selectedProperties];
                                updated[index].searchTerm = e.target.value;
                                setSelectedProperties(updated);
                              }}
                              onFocus={() => {
                                const updated = [...selectedProperties];
                                updated[index].dropdownOpen = true;
                                setSelectedProperties(updated);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--r)',
                                fontSize: '13px',
                                background: 'var(--surface)',
                                color: 'var(--text)'
                              }}
                            />
                            {prop.dropdownOpen && (
                              <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--r)',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                zIndex: 10,
                                maxHeight: '200px',
                                overflowY: 'auto',
                                marginTop: '4px'
                              }}>
                                {getUniqueValues(prop.property)
                                  .filter(country => !prop.searchTerm || country.toLowerCase().includes(prop.searchTerm.toLowerCase()))
                                  .map(country => (
                                    <div
                                      key={country}
                                      onClick={() => {
                                        const updated = [...selectedProperties];
                                        const currentValues = updated[index].value ? updated[index].value.split(',') : [];
                                        
                                        if (currentValues.includes(country)) {
                                          const indexToRemove = currentValues.indexOf(country);
                                          currentValues.splice(indexToRemove, 1);
                                        } else {
                                          currentValues.push(country);
                                        }
                                        
                                        updated[index].value = currentValues.join(',');
                                        updated[index].dropdownOpen = false;
                                        updated[index].searchTerm = '';
                                        setSelectedProperties(updated);
                                      }}
                                      style={{
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        color: 'var(--text)',
                                        borderBottom: '1px solid var(--border-soft)',
                                        backgroundColor: prop.value && prop.value.includes(country) ? 'var(--blue-600)15' : 'transparent'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--gray-100)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = prop.value && prop.value.includes(country) ? 'var(--blue-600)15' : 'transparent';
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span>{country}</span>
                                        {prop.value && prop.value.includes(country) && (
                                          <span style={{ color: 'var(--blue-600)', fontSize: '12px' }}>✓</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                          {prop.value && (
                            <div style={{ 
                              marginTop: '8px', 
                              fontSize: '12px', 
                              color: 'var(--text-3)',
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '4px'
                            }}>
                              {prop.value.split(',').map((country, i) => (
                                <span key={i} style={{
                                  background: 'var(--blue-600)15',
                                  color: 'var(--blue-600)',
                                  padding: '2px 6px',
                                  borderRadius: 'var(--r)',
                                  fontSize: '11px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  {country}
                                  <button
                                    onClick={() => {
                                      const updated = [...selectedProperties];
                                      const currentValues = updated[index].value ? updated[index].value.split(',') : [];
                                      const indexToRemove = currentValues.indexOf(country);
                                      if (indexToRemove > -1) {
                                        currentValues.splice(indexToRemove, 1);
                                        updated[index].value = currentValues.join(',');
                                        setSelectedProperties(updated);
                                      }
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--blue-600)',
                                      cursor: 'pointer',
                                      padding: '0',
                                      fontSize: '12px',
                                      lineHeight: '1',
                                      borderRadius: '50%',
                                      width: '14px',
                                      height: '14px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                    title={`Remove ${country}`}
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Mailing State special case with Is/Is Not/Contains and multiple selection */}
                  {prop.property === 'mailing_state' && (
                    <div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ minWidth: '100px' }}>
                          <select
                            value={prop.operator || 'is'}
                            onChange={(e) => {
                              const updated = [...selectedProperties];
                              updated[index].operator = e.target.value;
                              setSelectedProperties(updated);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--r)',
                              fontSize: '13px',
                              background: 'var(--surface)',
                              color: 'var(--text)'
                            }}
                          >
                            <option value="is">Is</option>
                            <option value="is not">Is Not</option>
                            <option value="contains">Contains</option>
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              placeholder="Search states..."
                              value={prop.searchTerm || ''}
                              onChange={(e) => {
                                const updated = [...selectedProperties];
                                updated[index].searchTerm = e.target.value;
                                setSelectedProperties(updated);
                              }}
                              onFocus={() => {
                                const updated = [...selectedProperties];
                                updated[index].dropdownOpen = true;
                                setSelectedProperties(updated);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--r)',
                                fontSize: '13px',
                                background: 'var(--surface)',
                                color: 'var(--text)'
                              }}
                            />
                            {prop.dropdownOpen && (
                              <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--r)',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                zIndex: 10,
                                maxHeight: '200px',
                                overflowY: 'auto',
                                marginTop: '4px'
                              }}>
                                {getUniqueValues(prop.property)
                                  .filter(state => !prop.searchTerm || state.toLowerCase().includes(prop.searchTerm.toLowerCase()))
                                  .map(state => (
                                    <div
                                      key={state}
                                      onClick={() => {
                                        const updated = [...selectedProperties];
                                        const currentValues = updated[index].value ? updated[index].value.split(',') : [];
                                        
                                        if (currentValues.includes(state)) {
                                          const indexToRemove = currentValues.indexOf(state);
                                          currentValues.splice(indexToRemove, 1);
                                        } else {
                                          currentValues.push(state);
                                        }
                                        
                                        updated[index].value = currentValues.join(',');
                                        updated[index].dropdownOpen = false;
                                        updated[index].searchTerm = '';
                                        setSelectedProperties(updated);
                                      }}
                                      style={{
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        color: 'var(--text)',
                                        borderBottom: '1px solid var(--border-soft)',
                                        backgroundColor: prop.value && prop.value.includes(state) ? 'var(--blue-600)15' : 'transparent'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--gray-100)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = prop.value && prop.value.includes(state) ? 'var(--blue-600)15' : 'transparent';
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span>{state}</span>
                                        {prop.value && prop.value.includes(state) && (
                                          <span style={{ color: 'var(--blue-600)', fontSize: '12px' }}>✓</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                          {prop.value && (
                            <div style={{ 
                              marginTop: '8px', 
                              fontSize: '12px', 
                              color: 'var(--text-3)',
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '4px'
                            }}>
                              {prop.value.split(',').map((state, i) => (
                                <span key={i} style={{
                                  background: 'var(--blue-600)15',
                                  color: 'var(--blue-600)',
                                  padding: '2px 6px',
                                  borderRadius: 'var(--r)',
                                  fontSize: '11px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  {state}
                                  <button
                                    onClick={() => {
                                      const updated = [...selectedProperties];
                                      const currentValues = updated[index].value ? updated[index].value.split(',') : [];
                                      const indexToRemove = currentValues.indexOf(state);
                                      if (indexToRemove > -1) {
                                        currentValues.splice(indexToRemove, 1);
                                        updated[index].value = currentValues.join(',');
                                        setSelectedProperties(updated);
                                      }
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--blue-600)',
                                      cursor: 'pointer',
                                      padding: '0',
                                      fontSize: '12px',
                                      lineHeight: '1',
                                      borderRadius: '50%',
                                      width: '14px',
                                      height: '14px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                    title={`Remove ${state}`}
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Other properties with dropdown options */}
                  {['mailing_city', 'created_by', 'modified_by', 'lead_source'].includes(prop.property) && (
                    <select
                      value={prop.value}
                      onChange={(e) => {
                        const updated = [...selectedProperties];
                        updated[index].value = e.target.value;
                        setSelectedProperties(updated);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r)',
                        fontSize: '13px',
                        background: 'var(--surface)',
                        color: 'var(--text)'
                      }}
                    >
                      <option value="">All {prop.property.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                      {getUniqueValues(prop.property).map(value => (
                        <option key={value} value={value}>{value}</option>
                      ))}
                    </select>
                  )}
                  
                  {/* Created Time special case with advanced date filtering */}
                  {prop.property === 'created_time' && (
                    <div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <select
                          value={prop.dateOperator || 'on'}
                          onChange={(e) => {
                            const updated = [...selectedProperties];
                            updated[index].dateOperator = e.target.value;
                            updated[index].value = ''; // Reset values when operator changes
                            updated[index].fromDate = '';
                            updated[index].toDate = '';
                            setSelectedProperties(updated);
                          }}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--r)',
                            fontSize: '13px',
                            background: 'var(--surface)',
                            color: 'var(--text)'
                          }}
                        >
                          <option value="on">On</option>
                          <option value="before">Before</option>
                          <option value="after">After</option>
                          <option value="between">Between</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                      
                      {/* On, Before, After - Single Date Picker */}
                      {['on', 'before', 'after'].includes(prop.dateOperator) && (
                        <input
                          type="date"
                          value={prop.value || ''}
                          onChange={(e) => {
                            const updated = [...selectedProperties];
                            updated[index].value = e.target.value;
                            setSelectedProperties(updated);
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--r)',
                            fontSize: '13px',
                            background: 'var(--surface)',
                            color: 'var(--text)'
                          }}
                        />
                      )}
                      
                      {/* Between - From Date and To Date */}
                      {prop.dateOperator === 'between' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-3)' }}>From Date</label>
                            <input
                              type="date"
                              value={prop.fromDate || ''}
                              onChange={(e) => {
                                const updated = [...selectedProperties];
                                updated[index].fromDate = e.target.value;
                                setSelectedProperties(updated);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--r)',
                                fontSize: '13px',
                                background: 'var(--surface)',
                                color: 'var(--text)'
                              }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-3)' }}>To Date</label>
                            <input
                              type="date"
                              value={prop.toDate || ''}
                              onChange={(e) => {
                                const updated = [...selectedProperties];
                                updated[index].toDate = e.target.value;
                                setSelectedProperties(updated);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--r)',
                                fontSize: '13px',
                                background: 'var(--surface)',
                                color: 'var(--text)'
                              }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Custom - Advanced Range Picker with DateTime */}
                      {prop.dateOperator === 'custom' && (
                        <div>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-3)' }}>From DateTime</label>
                              <input
                                type="datetime-local"
                                value={prop.fromDateTime || ''}
                                onChange={(e) => {
                                  const updated = [...selectedProperties];
                                  updated[index].fromDateTime = e.target.value;
                                  setSelectedProperties(updated);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: '1px solid var(--border)',
                                  borderRadius: 'var(--r)',
                                  fontSize: '13px',
                                  background: 'var(--surface)',
                                  color: 'var(--text)'
                                }}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-3)' }}>To DateTime</label>
                              <input
                                type="datetime-local"
                                value={prop.toDateTime || ''}
                                onChange={(e) => {
                                  const updated = [...selectedProperties];
                                  updated[index].toDateTime = e.target.value;
                                  setSelectedProperties(updated);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: '1px solid var(--border)',
                                  borderRadius: 'var(--r)',
                                  fontSize: '13px',
                                  background: 'var(--surface)',
                                  color: 'var(--text)'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Modified Time special case with advanced date filtering */}
                  {prop.property === 'modified_time' && (
                    <div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <select
                          value={prop.dateOperator || 'on'}
                          onChange={(e) => {
                            const updated = [...selectedProperties];
                            updated[index].dateOperator = e.target.value;
                            updated[index].value = ''; // Reset values when operator changes
                            updated[index].fromDate = '';
                            updated[index].toDate = '';
                            setSelectedProperties(updated);
                          }}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--r)',
                            fontSize: '13px',
                            background: 'var(--surface)',
                            color: 'var(--text)'
                          }}
                        >
                          <option value="on">On</option>
                          <option value="before">Before</option>
                          <option value="after">After</option>
                          <option value="between">Between</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                      
                      {/* On, Before, After - Single Date Picker */}
                      {['on', 'before', 'after'].includes(prop.dateOperator) && (
                        <input
                          type="date"
                          value={prop.value || ''}
                          onChange={(e) => {
                            const updated = [...selectedProperties];
                            updated[index].value = e.target.value;
                            setSelectedProperties(updated);
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--r)',
                            fontSize: '13px',
                            background: 'var(--surface)',
                            color: 'var(--text)'
                          }}
                        />
                      )}
                      
                      {/* Between - From Date and To Date */}
                      {prop.dateOperator === 'between' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-3)' }}>From Date</label>
                            <input
                              type="date"
                              value={prop.fromDate || ''}
                              onChange={(e) => {
                                const updated = [...selectedProperties];
                                updated[index].fromDate = e.target.value;
                                setSelectedProperties(updated);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--r)',
                                fontSize: '13px',
                                background: 'var(--surface)',
                                color: 'var(--text)'
                              }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-3)' }}>To Date</label>
                            <input
                              type="date"
                              value={prop.toDate || ''}
                              onChange={(e) => {
                                const updated = [...selectedProperties];
                                updated[index].toDate = e.target.value;
                                setSelectedProperties(updated);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--r)',
                                fontSize: '13px',
                                background: 'var(--surface)',
                                color: 'var(--text)'
                              }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Custom - Advanced Range Picker with DateTime */}
                      {prop.dateOperator === 'custom' && (
                        <div>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-3)' }}>From DateTime</label>
                              <input
                                type="datetime-local"
                                value={prop.fromDateTime || ''}
                                onChange={(e) => {
                                  const updated = [...selectedProperties];
                                  updated[index].fromDateTime = e.target.value;
                                  setSelectedProperties(updated);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: '1px solid var(--border)',
                                  borderRadius: 'var(--r)',
                                  fontSize: '13px',
                                  background: 'var(--surface)',
                                  color: 'var(--text)'
                                }}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-3)' }}>To DateTime</label>
                              <input
                                type="datetime-local"
                                value={prop.toDateTime || ''}
                                onChange={(e) => {
                                  const updated = [...selectedProperties];
                                  updated[index].toDateTime = e.target.value;
                                  setSelectedProperties(updated);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: '1px solid var(--border)',
                                  borderRadius: 'var(--r)',
                                  fontSize: '13px',
                                  background: 'var(--surface)',
                                  color: 'var(--text)'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Untouched Records special case with Yes/No dropdown */}
                  {prop.property === 'untouched_records' && (
                    <select
                      value={prop.value || ''}
                      onChange={(e) => {
                        const updated = [...selectedProperties];
                        updated[index].value = e.target.value;
                        setSelectedProperties(updated);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r)',
                        fontSize: '13px',
                        background: 'var(--surface)',
                        color: 'var(--text)'
                      }}
                    >
                      <option value="">Select...</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  )}
                  
                  {/* Activities special case with Is/Is Not dropdown */}
                  {prop.property === 'activities' && (
                    <div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ minWidth: '80px' }}>
                          <select
                            value={prop.operator || 'is'}
                            onChange={(e) => {
                              const updated = [...selectedProperties];
                              updated[index].operator = e.target.value;
                              setSelectedProperties(updated);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--r)',
                              fontSize: '13px',
                              background: 'var(--surface)',
                              color: 'var(--text)'
                            }}
                          >
                            <option value="is">Is</option>
                            <option value="is not">Is Not</option>
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          <select
                            value={prop.value || ''}
                            onChange={(e) => {
                              const updated = [...selectedProperties];
                              updated[index].value = e.target.value;
                              setSelectedProperties(updated);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--r)',
                              fontSize: '13px',
                              background: 'var(--surface)',
                              color: 'var(--text)'
                            }}
                          >
                            <option value="">Select...</option>
                            <option value="has_activities">Has Activities</option>
                            <option value="no_activities">No Activities</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Other properties with text input */}
                  {['description', 'mailing_street', 'notes', 'pipelines', 'pipeline_stage'].includes(prop.property) && (
                    <input
                      type="text"
                      value={prop.value}
                      onChange={(e) => {
                        const updated = [...selectedProperties];
                        updated[index].value = e.target.value;
                        setSelectedProperties(updated);
                      }}
                      placeholder={`Enter ${prop.property.replace('_', ' ')}...`}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r)',
                        fontSize: '13px',
                        background: 'var(--surface)',
                        color: 'var(--text)'
                      }}
                    />
                  )}
                </div>
              ))}
              
                            
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setNewThisWeekFilter(false);
                    setSearchTerm('');
                    setSelectedProperties([]);
                    setCurrentProperty('');
                    setIsFilterApplied(false);
                    setCurrentFilterCriteria('');
                    setContactOwnerFilter('');
                    setContactOwnerFilterOperator('is');
                    // Refetch all leads to show unfiltered results
                    fetchLeads();
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r)',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => {
                    // Collect all active filters
                    const activeFilters = [];
                    
                    // Add contact owner filter if configured
                    const contactOwnerProp = selectedProperties.find(prop => prop.property === 'contact_owner');
                    if (contactOwnerProp && contactOwnerProp.value) {
                      const selectedOwners = contactOwnerProp.value.split(',');
                      if (selectedOwners.length > 0) {
                        // Send all selected owners as comma-separated values
                        const ownersString = selectedOwners.join(',');
                        activeFilters.push({
                          property: 'contact_owner',
                          value: ownersString,
                          operator: contactOwnerProp.operator
                        });
                      }
                    }
                    
                    // Add lead status filter if configured
                    const leadStatusProp = selectedProperties.find(prop => prop.property === 'lead_status');
                    if (leadStatusProp && leadStatusProp.value) {
                      const selectedStatuses = leadStatusProp.value.split(',');
                      if (selectedStatuses.length > 0) {
                        // Send all selected statuses as comma-separated values
                        const statusesString = selectedStatuses.join(',');
                        activeFilters.push({
                          property: 'lead_status',
                          value: statusesString,
                          operator: leadStatusProp.operator
                        });
                      }
                    }
                    
                    // Add tag filter if configured
                    const tagProp = selectedProperties.find(prop => prop.property === 'tag');
                    if (tagProp && tagProp.value) {
                      const selectedTags = tagProp.value.split(',');
                      if (selectedTags.length > 0) {
                        // Send all selected tags as comma-separated values
                        const tagsString = selectedTags.join(',');
                        activeFilters.push({
                          property: 'tag',
                          value: tagsString,
                          operator: tagProp.operator
                        });
                      }
                    }
                    
                    // Add mailing state filter if configured
                    const mailingStateProp = selectedProperties.find(prop => prop.property === 'mailing_state');
                    if (mailingStateProp && mailingStateProp.value) {
                      const selectedStates = mailingStateProp.value.split(',');
                      if (selectedStates.length > 0) {
                        // Send all selected states as comma-separated values
                        const statesString = selectedStates.join(',');
                        activeFilters.push({
                          property: 'mailing_state',
                          value: statesString,
                          operator: mailingStateProp.operator
                        });
                      }
                    }
                    
                    // Add mailing country filter if configured
                    const mailingCountryProp = selectedProperties.find(prop => prop.property === 'mailing_country');
                    if (mailingCountryProp && mailingCountryProp.value) {
                      const selectedCountries = mailingCountryProp.value.split(',');
                      if (selectedCountries.length > 0) {
                        // Send all selected countries as comma-separated values
                        const countriesString = selectedCountries.join(',');
                        activeFilters.push({
                          property: 'mailing_country',
                          value: countriesString,
                          operator: mailingCountryProp.operator
                        });
                      }
                    }
                    
                    // Add created_time filter if configured
                    const createdTimeProp = selectedProperties.find(prop => prop.property === 'created_time');
                    if (createdTimeProp) {
                      if ((createdTimeProp.dateOperator === 'on' || createdTimeProp.dateOperator === 'before') && createdTimeProp.value) {
                        activeFilters.push({
                          property: 'created_time',
                          value: createdTimeProp.value,
                          dateOperator: createdTimeProp.dateOperator
                        });
                      } else if (createdTimeProp.dateOperator === 'between' && createdTimeProp.fromDate && createdTimeProp.toDate) {
                        activeFilters.push({
                          property: 'created_time',
                          fromDate: createdTimeProp.fromDate,
                          toDate: createdTimeProp.toDate,
                          dateOperator: createdTimeProp.dateOperator
                        });
                      }
                    }
                    
                    // Apply all filters together in single API call
                    if (activeFilters.length > 0) {
                      handleCombinedFilters(activeFilters);
                    }
                    
                    setFilterSidebarOpen(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    border: '1px solid var(--blue-600)',
                    borderRadius: 'var(--r)',
                    background: 'var(--blue-600)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
          
          {/* Overlay for sidebar */}
          <div
            onClick={() => setFilterSidebarOpen(false)}
            style={{
              position: 'absolute',
              top: 0,
              left: '320px',
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.3)',
              zIndex: 999
            }}
          />
        </>
      )}
      
      {/* User Information Modal */}
      {showUserModal && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            position: 'relative',
            background: 'var(--surface)',
            borderRadius: 'var(--r-xl)',
            width: '95%',
            maxWidth: '1200px',
            height: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px 24px 16px',
              borderBottom: '1px solid var(--border)'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--text)',
                fontFamily: 'var(--font-display)'
              }}>
                Lead Information
              </h2>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-3)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '24px' }}>
              {/* Contact Information Section */}
              <div style={{ 
                marginBottom: '24px', 
                padding: '16px', 
                background: 'var(--surface)', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--r)' 
              }}>
                <h3 style={{ 
                  margin: '0 0 16px 0', 
                  color: 'var(--text)', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  borderBottom: '1px solid var(--border-soft)',
                  paddingBottom: '8px'
                }}>
                  Contact Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <EditableField 
                    label="Contact Name" 
                    value={selectedUser.contactName} 
                    fieldName="contactName" 
                  />
                  <EditableField 
                    label="Email" 
                    value={selectedUser.email} 
                    fieldName="email" 
                    type="email"
                  />
                  <EditableField 
                    label="Phone" 
                    value={selectedUser.phoneNumber} 
                    fieldName="phoneNumber" 
                    type="tel"
                  />
                  <EditableField 
                    label="Alternate Phone" 
                    value={selectedUser.alternateNumber} 
                    fieldName="alternateNumber" 
                    type="tel"
                  />
                </div>
              </div>

              {/* Company Information Section */}
              <div style={{ 
                marginBottom: '24px', 
                padding: '16px', 
                background: 'var(--surface)', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--r)' 
              }}>
                <h3 style={{ 
                  margin: '0 0 16px 0', 
                  color: 'var(--text)', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  borderBottom: '1px solid var(--border-soft)',
                  paddingBottom: '8px'
                }}>
                  Company Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <EditableField 
                    label="Company Name" 
                    value={selectedUser.companyName} 
                    fieldName="companyName" 
                  />
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Industry Type</label>
                    <div style={{ position: 'relative' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '8px 12px',
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--r)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: 'var(--text)',
                          transition: 'background-color 0.2s ease'
                        }}
                        onClick={() => setIndustryDropdownOpen(!industryDropdownOpen)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--gray-100)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--surface)';
                        }}
                      >
                        <span>{selectedUser.industry || 'Select industry'}</span>
                        <ChevronDownIcon size={14} style={{ transition: 'transform 0.2s ease' }} />
                      </div>
                      
                      {industryDropdownOpen && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--r)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          zIndex: 10,
                          marginTop: '4px',
                          maxHeight: '200px',
                          overflowY: 'auto'
                        }}>
                          {predefinedIndustries.map(industry => (
                            <button
                              key={industry}
                              onClick={() => {
                                handleFieldUpdate(selectedUser.id, 'industry', industry);
                                setIndustryDropdownOpen(false);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'none',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '12px',
                                color: 'var(--text)',
                                borderBottom: '1px solid var(--border-soft)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--gray-100)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'none';
                              }}
                            >
                              {industry}
                            </button>
                          ))}
                          
                          <button
                            onClick={() => {
                              setShowCustomIndustryInput(true);
                              setIndustryDropdownOpen(false);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'none',
                              border: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '12px',
                              color: 'var(--text)',
                              fontWeight: '500',
                              color: 'var(--green-600)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--green-100)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'none';
                            }}
                          >
                            + Custom
                          </button>
                        </div>
                      )}
                      
                      {showCustomIndustryInput && (
                        <div style={{
                          marginTop: '8px',
                          padding: '8px',
                          background: 'var(--green-50)',
                          border: '1px solid var(--green-200)',
                          borderRadius: 'var(--r)'
                        }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={customIndustry}
                              onChange={(e) => setCustomIndustry(e.target.value)}
                              placeholder="Enter custom industry..."
                              style={{
                                flex: 1,
                                padding: '6px 8px',
                                border: '1px solid var(--green-300)',
                                borderRadius: 'var(--r)',
                                fontSize: '12px',
                                background: 'var(--surface)',
                                color: 'var(--text)'
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                if (customIndustry.trim()) {
                                  handleFieldUpdate(selectedUser.id, 'industry', customIndustry.trim());
                                  setCustomIndustry('');
                                  setShowCustomIndustryInput(false);
                                }
                              }}
                              style={{
                                padding: '6px 12px',
                                background: 'var(--green-600)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--r)',
                                fontSize: '11px',
                                cursor: 'pointer',
                                fontWeight: '500'
                              }}
                            >
                              Apply
                            </button>
                            <button
                              onClick={() => {
                                setCustomIndustry('');
                                setShowCustomIndustryInput(false);
                              }}
                              style={{
                                padding: '6px 12px',
                                background: 'var(--gray-200)',
                                color: 'var(--text)',
                                border: 'none',
                                borderRadius: 'var(--r)',
                                fontSize: '11px',
                                cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Information Section */}
              <div style={{ 
                marginBottom: '24px', 
                padding: '16px', 
                background: 'var(--surface)', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--r)' 
              }}>
                <h3 style={{ 
                  margin: '0 0 16px 0', 
                  color: 'var(--text)', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  borderBottom: '1px solid var(--border-soft)',
                  paddingBottom: '8px'
                }}>
                  Location Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <EditableField 
                    label="City Name" 
                    value={selectedUser.city} 
                    fieldName="city" 
                  />
                  <EditableField 
                    label="State Name" 
                    value={selectedUser.state} 
                    fieldName="state" 
                  />
                  <EditableField 
                    label="Country Name" 
                    value={selectedUser.country} 
                    fieldName="country" 
                  />
                </div>
              </div>

              {/* Lead Management Section */}
              <div style={{ 
                marginBottom: '24px', 
                padding: '16px', 
                background: 'var(--surface)', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--r)' 
              }}>
                <h3 style={{ 
                  margin: '0 0 16px 0', 
                  color: 'var(--text)', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  borderBottom: '1px solid var(--border-soft)',
                  paddingBottom: '8px'
                }}>
                  Lead Management
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Lead Status</label>
                    <div style={{ position: 'relative' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '8px 12px',
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--r)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: 'var(--text)',
                          transition: 'background-color 0.2s ease'
                        }}
                        onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--gray-100)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--surface)';
                        }}
                      >
                        <span>{selectedUser.leadStatus}</span>
                        <ChevronDownIcon size={14} style={{ transition: 'transform 0.2s ease' }} />
                      </div>
                      
                      {statusDropdownOpen && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--r)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          zIndex: 10,
                          marginTop: '4px'
                        }}>
                          {Object.keys(statusConfig).map(status => (
                            <button
                              key={status}
                              onClick={() => {
                                handleFieldUpdate(selectedUser.id, 'leadStatus', status);
                                setStatusDropdownOpen(false);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'none',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '12px',
                                color: 'var(--text)',
                                borderBottom: '1px solid var(--border-soft)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = statusConfig[status].color + '15';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'none';
                              }}
                            >
                              {statusConfig[status].label}
                            </button>
                          ))}
                          
                          <button
                            onClick={() => {
                              setShowCustomStatusInput(true);
                              setStatusDropdownOpen(false);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'none',
                              border: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '12px',
                              color: 'var(--text)',
                              borderBottom: '1px solid var(--border-soft)',
                              fontWeight: '500',
                              color: 'var(--green-600)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--green-100)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'none';
                            }}
                          >
                            + Custom Status
                          </button>
                        </div>
                      )}
                      
                      {showCustomStatusInput && (
                        <div style={{
                          marginTop: '8px',
                          padding: '8px',
                          background: 'var(--green-50)',
                          border: '1px solid var(--green-200)',
                          borderRadius: 'var(--r)'
                        }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={customStatus}
                              onChange={(e) => setCustomStatus(e.target.value)}
                              placeholder="Enter custom status..."
                              style={{
                                flex: 1,
                                padding: '6px 8px',
                                border: '1px solid var(--green-300)',
                                borderRadius: 'var(--r)',
                                fontSize: '12px',
                                background: 'var(--surface)',
                                color: 'var(--text)'
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                if (customStatus.trim()) {
                                  handleFieldUpdate(selectedUser.id, 'leadStatus', customStatus.trim());
                                  setCustomStatus('');
                                  setShowCustomStatusInput(false);
                                }
                              }}
                              style={{
                                padding: '6px 12px',
                                background: 'var(--green-600)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--r)',
                                fontSize: '11px',
                                cursor: 'pointer',
                                fontWeight: '500'
                              }}
                            >
                              Apply
                            </button>
                            <button
                              onClick={() => {
                                setCustomStatus('');
                                setShowCustomStatusInput(false);
                              }}
                              style={{
                                padding: '6px 12px',
                                background: 'var(--gray-200)',
                                color: 'var(--text)',
                                border: 'none',
                                borderRadius: 'var(--r)',
                                fontSize: '11px',
                                cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Contact Owner</label>
                    <div style={{ position: 'relative' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '8px 12px',
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--r)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: 'var(--text)',
                          transition: 'background-color 0.2s ease'
                        }}
                        onClick={() => setOwnerDropdownOpen(!ownerDropdownOpen)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--gray-100)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--surface)';
                        }}
                      >
                        <span>{selectedUser.contactOwner}</span>
                        <ChevronDownIcon size={14} style={{ transition: 'transform 0.2s ease' }} />
                      </div>
                      
                      {ownerDropdownOpen && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--r)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          zIndex: 10,
                          marginTop: '4px',
                          maxHeight: '200px',
                          overflowY: 'auto'
                        }}>
                          {getUniqueContactOwners().map(owner => (
                            <button
                              key={owner}
                              onClick={() => {
                                handleFieldUpdate(selectedUser.id, 'contactOwner', owner);
                                setOwnerDropdownOpen(false);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'none',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '12px',
                                color: 'var(--text)',
                                borderBottom: '1px solid var(--border-soft)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--gray-100)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'none';
                              }}
                            >
                              {owner}
                            </button>
                          ))}
                          
                          <button
                            onClick={() => {
                              setShowCustomOwnerInput(true);
                              setOwnerDropdownOpen(false);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'none',
                              border: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '12px',
                              color: 'var(--text)',
                              fontWeight: '500',
                              color: 'var(--green-600)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--green-100)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'none';
                            }}
                          >
                            + Custom Owner
                          </button>
                        </div>
                      )}
                      
                      {showCustomOwnerInput && (
                        <div style={{
                          marginTop: '8px',
                          padding: '8px',
                          background: 'var(--green-50)',
                          border: '1px solid var(--green-200)',
                          borderRadius: 'var(--r)'
                        }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={customOwner}
                              onChange={(e) => setCustomOwner(e.target.value)}
                              placeholder="Enter custom owner..."
                              style={{
                                flex: 1,
                                padding: '6px 8px',
                                border: '1px solid var(--green-300)',
                                borderRadius: 'var(--r)',
                                fontSize: '12px',
                                background: 'var(--surface)',
                                color: 'var(--text)'
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                if (customOwner.trim()) {
                                  handleFieldUpdate(selectedUser.id, 'contactOwner', customOwner.trim());
                                  setCustomOwner('');
                                  setShowCustomOwnerInput(false);
                                }
                              }}
                              style={{
                                padding: '6px 12px',
                                background: 'var(--green-600)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--r)',
                                fontSize: '11px',
                                cursor: 'pointer',
                                fontWeight: '500'
                              }}
                            >
                              Apply
                            </button>
                            <button
                              onClick={() => {
                                setCustomOwner('');
                                setShowCustomOwnerInput(false);
                              }}
                              style={{
                                padding: '6px 12px',
                                background: 'var(--gray-200)',
                                color: 'var(--text)',
                                border: 'none',
                                borderRadius: 'var(--r)',
                                fontSize: '11px',
                                cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Lead Source</label>
                    <div style={{ position: 'relative' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '8px 12px',
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--r)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: 'var(--text)',
                          transition: 'background-color 0.2s ease'
                        }}
                        onClick={() => setLeadSourceDropdownOpen(!leadSourceDropdownOpen)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--gray-100)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--surface)';
                        }}
                      >
                        <span>{selectedUser.leadSource || 'Select lead source'}</span>
                        <ChevronDownIcon size={14} style={{ transition: 'transform 0.2s ease' }} />
                      </div>
                      
                      {leadSourceDropdownOpen && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--r)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          zIndex: 10,
                          marginTop: '4px',
                          maxHeight: '200px',
                          overflowY: 'auto'
                        }}>
                          {predefinedLeadSources.map(source => (
                            <button
                              key={source}
                              onClick={() => {
                                handleFieldUpdate(selectedUser.id, 'leadSource', source);
                                setLeadSourceDropdownOpen(false);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'none',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '12px',
                                color: 'var(--text)',
                                borderBottom: '1px solid var(--border-soft)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--gray-100)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'none';
                              }}
                            >
                              {source}
                            </button>
                          ))}
                          
                          <button
                            onClick={() => {
                              setShowCustomLeadSourceInput(true);
                              setLeadSourceDropdownOpen(false);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'none',
                              border: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '12px',
                              color: 'var(--text)',
                              fontWeight: '500',
                              color: 'var(--green-600)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--green-100)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'none';
                            }}
                          >
                            + Custom
                          </button>
                        </div>
                      )}
                      
                      {showCustomLeadSourceInput && (
                        <div style={{
                          marginTop: '8px',
                          padding: '8px',
                          background: 'var(--green-50)',
                          border: '1px solid var(--green-200)',
                          borderRadius: 'var(--r)'
                        }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={customLeadSource}
                              onChange={(e) => setCustomLeadSource(e.target.value)}
                              placeholder="Enter custom lead source..."
                              style={{
                                flex: 1,
                                padding: '6px 8px',
                                border: '1px solid var(--green-300)',
                                borderRadius: 'var(--r)',
                                fontSize: '12px',
                                background: 'var(--surface)',
                                color: 'var(--text)'
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                if (customLeadSource.trim()) {
                                  handleFieldUpdate(selectedUser.id, 'leadSource', customLeadSource.trim());
                                  setCustomLeadSource('');
                                  setShowCustomLeadSourceInput(false);
                                }
                              }}
                              style={{
                                padding: '6px 12px',
                                background: 'var(--green-600)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--r)',
                                fontSize: '11px',
                                cursor: 'pointer',
                                fontWeight: '500'
                              }}
                            >
                              Apply
                            </button>
                            <button
                              onClick={() => {
                                setCustomLeadSource('');
                                setShowCustomLeadSourceInput(false);
                              }}
                              style={{
                                padding: '6px 12px',
                                background: 'var(--gray-200)',
                                color: 'var(--text)',
                                border: 'none',
                                borderRadius: 'var(--r)',
                                fontSize: '11px',
                                cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Tags</label>
                    <div style={{ position: 'relative' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '8px 12px',
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--r)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: 'var(--text)',
                          transition: 'background-color 0.2s ease'
                        }}
                        onClick={() => setTagsDropdownOpen(!tagsDropdownOpen)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--gray-100)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--surface)';
                        }}
                      >
                        <span>{selectedUser.tags || 'Select tag'}</span>
                        <ChevronDownIcon size={14} style={{ transition: 'transform 0.2s ease' }} />
                      </div>
                      
                      {tagsDropdownOpen && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--r)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          zIndex: 10,
                          marginTop: '4px',
                          maxHeight: '200px',
                          overflowY: 'auto'
                        }}>
                          {predefinedTags.map(tag => (
                            <button
                              key={tag}
                              onClick={() => {
                                handleFieldUpdate(selectedUser.id, 'tags', tag);
                                setTagsDropdownOpen(false);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'none',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '12px',
                                color: 'var(--text)',
                                borderBottom: '1px solid var(--border-soft)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--gray-100)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'none';
                              }}
                            >
                              {tag}
                            </button>
                          ))}
                          
                          <button
                            onClick={() => {
                              setShowCustomTagsInput(true);
                              setTagsDropdownOpen(false);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'none',
                              border: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '12px',
                              color: 'var(--text)',
                              fontWeight: '500',
                              color: 'var(--green-600)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--green-100)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'none';
                            }}
                          >
                            + Custom Tag
                          </button>
                        </div>
                      )}
                      
                      {showCustomTagsInput && (
                        <div style={{
                          marginTop: '8px',
                          padding: '8px',
                          background: 'var(--green-50)',
                          border: '1px solid var(--green-200)',
                          borderRadius: 'var(--r)'
                        }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={customTags}
                              onChange={(e) => setCustomTags(e.target.value)}
                              placeholder="Enter custom tag..."
                              style={{
                                flex: 1,
                                padding: '6px 8px',
                                border: '1px solid var(--green-300)',
                                borderRadius: 'var(--r)',
                                fontSize: '12px',
                                background: 'var(--surface)',
                                color: 'var(--text)'
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                if (customTags.trim()) {
                                  handleFieldUpdate(selectedUser.id, 'tags', customTags.trim());
                                  setCustomTags('');
                                  setShowCustomTagsInput(false);
                                }
                              }}
                              style={{
                                padding: '6px 12px',
                                background: 'var(--green-600)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--r)',
                                fontSize: '11px',
                                cursor: 'pointer',
                                fontWeight: '500'
                              }}
                            >
                              Apply
                            </button>
                            <button
                              onClick={() => {
                                setCustomTags('');
                                setShowCustomTagsInput(false);
                              }}
                              style={{
                                padding: '6px 12px',
                                background: 'var(--gray-200)',
                                color: 'var(--text)',
                                border: 'none',
                                borderRadius: 'var(--r)',
                                fontSize: '11px',
                                cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information Section */}
              <div style={{ 
                marginBottom: '24px', 
                padding: '16px', 
                background: 'var(--surface)', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--r)' 
              }}>
                <h3 style={{ 
                  margin: '0 0 16px 0', 
                  color: 'var(--text)', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  borderBottom: '1px solid var(--border-soft)',
                  paddingBottom: '8px'
                }}>
                  Additional Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  <EditableField 
                    label="Notes" 
                    value={selectedUser.notes} 
                    fieldName="notes" 
                  />
                  <EditableField 
                    label="Description" 
                    value={selectedUser.description} 
                    fieldName="description" 
                  />
                </div>
              </div>

              {/* System Information Section */}
              <div style={{ 
                marginBottom: '0', 
                padding: '16px', 
                background: 'var(--surface)', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--r)' 
              }}>
                <h3 style={{ 
                  margin: '0 0 16px 0', 
                  color: 'var(--text)', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  borderBottom: '1px solid var(--border-soft)',
                  paddingBottom: '8px'
                }}>
                  System Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Created Time</label>
                    <div style={{ color: 'var(--text)' }}>
                      {new Date(selectedUser.createdTime).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Last Activity Time</label>
                    <div style={{ color: 'var(--text)' }}>
                      {new Date(selectedUser.lastActivity).toLocaleString('en-IN')}
                    </div>
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
            </div>
          </div>
        </div>
      )}

      {/* Lead Details Modal */}
      {selectedLead && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>Lead Details</h2>
              <button
                onClick={() => setSelectedLead(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Contact Name</label>
                  <div style={{ color: 'var(--text)', fontWeight: '500' }}>{selectedLead.contactName}</div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Email</label>
                  <div style={{ color: 'var(--text)', fontWeight: '500' }}>{selectedLead.email}</div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Phone Number</label>
                  <div style={{ color: 'var(--text)', fontWeight: '500' }}>{selectedLead.phoneNumber}</div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Alternate Number</label>
                  <input
                    type="text"
                    value={selectedLead.alternateNumber || ''}
                    onChange={(e) => {
                      const newAlternateNumber = e.target.value;
                      // Update local state immediately for better UX
                      setSelectedLead(prev => ({ ...prev, alternateNumber: newAlternateNumber }));
                    }}
                    onBlur={(e) => {
                      const newAlternateNumber = e.target.value;
                      if (newAlternateNumber !== selectedLead.alternateNumber) {
                        handleAlternateNumberUpdate(selectedLead.id, newAlternateNumber);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.target.blur();
                      }
                    }}
                    placeholder="Enter alternate phone number"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--r)',
                      color: 'var(--text)',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Company Name</label>
                  <div style={{ color: 'var(--text)', fontWeight: '500' }}>{selectedLead.companyName}</div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Contact Owner</label>
                  <div style={{ color: 'var(--text)', fontWeight: '500' }}>{selectedLead.contactOwner}</div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>City</label>
                  <div style={{ color: 'var(--text)', fontWeight: '500' }}>{selectedLead.city}</div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>State</label>
                  <div style={{ color: 'var(--text)', fontWeight: '500' }}>{selectedLead.state}</div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Country</label>
                  <div style={{ color: 'var(--text)', fontWeight: '500' }}>{selectedLead.country}</div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Lead Status</label>
                  <select
                    value={selectedLead.leadStatus}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      handleLeadInfoStatusUpdate(selectedLead.id, newStatus);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--r)',
                      color: 'var(--text)',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Lead Source</label>
                  <div style={{ color: 'var(--text)', fontWeight: '500' }}>{selectedLead.leadSource}</div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Industry</label>
                  <div style={{ color: 'var(--text)', fontWeight: '500' }}>{selectedLead.industry}</div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Tags</label>
                  <div style={{ color: 'var(--text)', fontWeight: '500' }}>{selectedLead.tags}</div>
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Description</label>
                <div style={{ color: 'var(--text)', fontWeight: '500' }}>{selectedLead.description}</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Created Time</label>
                  <div style={{ color: 'var(--text)', fontWeight: '500' }}>
                    {new Date(selectedLead.createdTime).toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Created By</label>
                  <div style={{ color: 'var(--text)', fontWeight: '500' }}>{selectedLead.createdBy}</div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Modified By</label>
                  <div style={{ color: 'var(--text)', fontWeight: '500' }}>{selectedLead.modifiedBy}</div>
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Last Activity</label>
                <div style={{ color: 'var(--text)', fontWeight: '500' }}>
                  {new Date(selectedLead.lastActivity).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setSelectedLead(null)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'var(--blue-600)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--r)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Edit Lead
              </button>
              <button
                onClick={() => setSelectedLead(null)}
                style={{
                  padding: '10px 20px',
                  background: '#1e293b',
                  color: '#e2e8f0',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>Add New Lead</h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form id="addLeadForm" style={{ display: 'grid', gap: '16px' }}>
              {/* Contact Information */}
              <div>
                <h3 style={{ margin: '0 0 12px 0', color: 'var(--text)', fontSize: '14px', fontWeight: '600' }}>Contact Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Contact Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Enter contact name"
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r)',
                        color: 'var(--text)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter phone number"
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r)',
                        color: 'var(--text)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Alternate Number</label>
                    <input
                      type="tel"
                      name="alternateNumber"
                      placeholder="Enter alternate number"
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r)',
                        color: 'var(--text)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter email address"
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r)',
                        color: 'var(--text)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div>
                <h3 style={{ margin: '0 0 12px 0', color: 'var(--text)', fontSize: '14px', fontWeight: '600' }}>Company Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      placeholder="Enter company name"
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r)',
                        color: 'var(--text)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Contact Owner</label>
                    <input
                      type="text"
                      name="contactOwner"
                      placeholder="Enter contact owner"
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r)',
                        color: 'var(--text)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h3 style={{ margin: '0 0 12px 0', color: 'var(--text)', fontSize: '14px', fontWeight: '600' }}>Location Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>City</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="Enter city"
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r)',
                        color: 'var(--text)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>State</label>
                    <input
                      type="text"
                      name="state"
                      placeholder="Enter state"
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r)',
                        color: 'var(--text)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Country</label>
                    <input
                      type="text"
                      name="country"
                      placeholder="Enter country"
                      defaultValue="IN"
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r)',
                        color: 'var(--text)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Lead Details */}
              <div>
                <h3 style={{ margin: '0 0 12px 0', color: 'var(--text)', fontSize: '14px', fontWeight: '600' }}>Lead Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Lead Status</label>
                    <select
                      name="leadStatus"
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r)',
                        color: 'var(--text)',
                        fontSize: '14px'
                      }}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Proposal">Proposal</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Closed Won">Closed Won</option>
                      <option value="Closed Lost">Closed Lost</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Industry</label>
                    <select
                      name="industry"
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r)',
                        color: 'var(--text)',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Select Industry</option>
                      <option value="Farmer">Farmer</option>
                      <option value="FPO">FPO</option>
                      <option value="NGO">NGO</option>
                      <option value="Government">Government</option>
                      <option value="Enterprise">Enterprise</option>
                      <option value="Agri Input">Agri Input</option>
                      <option value="Agri Output">Agri Output</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Tags</label>
                    <input
                      type="text"
                      name="tags"
                      placeholder="Enter tags (comma separated)"
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r)',
                        color: 'var(--text)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Lead Source</label>
                    <select
                      name="leadSource"
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r)',
                        color: 'var(--text)',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Select Source</option>
                      <option value="FB Campaign">FB Campaign</option>
                      <option value="Website Inbound">Website Inbound</option>
                      <option value="Sales Inbound">Sales Inbound</option>
                      <option value="Mail Inbound">Mail Inbound</option>
                      <option value="External Referral">External Referral</option>
                      <option value="Cold Call">Cold Call</option>
                      <option value="Event">Event</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 style={{ margin: '0 0 12px 0', color: 'var(--text)', fontSize: '14px', fontWeight: '600' }}>Additional Information</h3>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Description</label>
                  <textarea
                    name="description"
                    placeholder="Enter description"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--r)',
                      color: 'var(--text)',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>

              {/* System Fields (Read-only) */}
              <div>
                <h3 style={{ margin: '0 0 12px 0', color: 'var(--text)', fontSize: '14px', fontWeight: '600' }}>System Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Created By</label>
                    <input
                      type="text"
                      name="createdBy"
                      value={user?.name || user?.phone_number || 'operation'}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'var(--gray-100)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r)',
                        color: 'var(--text-3)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Modified By</label>
                    <input
                      type="text"
                      name="modifiedBy"
                      value={user?.name || user?.phone_number || 'operation'}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'var(--gray-100)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r)',
                        color: 'var(--text-3)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Last Activity</label>
                    <input
                      type="text"
                      name="lastActivity"
                      value={new Date().toISOString()}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'var(--gray-100)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r)',
                        color: 'var(--text-3)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              </div>
            </form>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => {
                  // Collect form data
                  const form = document.querySelector('#addLeadForm');
                  if (!form) {
                    alert('Form not found');
                    return;
                  }
                  
                  const formData = new FormData(form);
                  const leadData = {
                    full_name: formData.get('fullName') || '',
                    phone: formData.get('phone') || '',
                    alternate_number: formData.get('alternateNumber') || '',
                    email: formData.get('email') || '',
                    company_name: formData.get('companyName') || '',
                    owner: formData.get('contactOwner') || 'Unassigned',
                    city: formData.get('city') || '',
                    state: formData.get('state') || '',
                    country: formData.get('country') || 'IN',
                    status: formData.get('leadStatus') || 'New',
                    tags: formData.get('tags') || '',
                    lead_source: formData.get('leadSource') || '',
                    description: formData.get('description') || '',
                    industry: formData.get('industry') || '',
                    created_by: user?.name || user?.phone_number || 'operation',
                    modified_by: user?.name || user?.phone_number || 'operation',
                    last_activity: formData.get('lastActivity') || new Date().toISOString()
                  };
                  
                  // Basic validation
                  if (!leadData.full_name.trim()) {
                    alert('Contact Name is required');
                    return;
                  }
                  
                  if (!leadData.email.trim() && !leadData.phone.trim()) {
                    alert('Either Email or Phone Number is required');
                    return;
                  }
                  
                  // Call API to create lead
                  handleCreateLead(leadData);
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'var(--green-600)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--r)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Add Lead
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  padding: '10px 20px',
                  background: '#1e293b',
                  color: '#e2e8f0',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
