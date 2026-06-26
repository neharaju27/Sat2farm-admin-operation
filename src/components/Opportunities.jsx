import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Plus, Edit, Trash2, Eye, Phone, Mail, Calendar, MapPin, TrendingUp, Users, DollarSign, Activity, ChevronDown, ChevronRight, ChevronLeft, X, Check, Clock, AlertCircle, FileText, Upload, Building2, User, GripVertical, Tag, Briefcase, Globe, Map, CreditCard, MessageSquare, FileEdit, UserCheck, Building, List, ThumbsUp, ThumbsDown } from 'lucide-react';
import toast from 'react-hot-toast';
import SalesPipelineKanbanBoard from './kanban/SalesPipelineKanbanBoard';
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

        const apiUrl = import.meta.env.VITE_ACCOUNTS_API_URL;
        if (!apiUrl) {
          console.log('Accounts API URL not configured, using mock data');
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
          dealPresent: opp.deal_present || false,
          website: opp.website || '',
          accountType: opp.account_type || '',
          modifiedTime: opp.modified_time || ''
        }));
        
        setOpportunities(transformedOpportunities);
        fetchAllDealCounts(transformedOpportunities);
        setError(null);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
        const mockOpps = getMockOpportunities();
        setOpportunities(mockOpps);
        fetchAllDealCounts(mockOpps);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
    fetchAllKanbanDeals();
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

  const [accountTypeDropdownOpen, setAccountTypeDropdownOpen] = useState(false);
  const [customAccountType, setCustomAccountType] = useState('');
  const [showCustomAccountTypeInput, setShowCustomAccountTypeInput] = useState(false);

  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);
  const [kanbanUpdateTimestamp, setKanbanUpdateTimestamp] = useState(Date.now());

  // ── Close all dropdowns when one is opened ─────────────────────────────────
  const closeAllDropdowns = () => {
  setStatusDropdownOpen(false);
  setOwnerDropdownOpen(false);
  setTagsDropdownOpen(false);
  setLeadSourceDropdownOpen(false);
  setIndustryDropdownOpen(false);
  setAccountTypeDropdownOpen(false);
};

  // ── Table / filter state ──────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [newThisWeekFilter, setNewThisWeekFilter] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [showUpdateFieldsModal, setShowUpdateFieldsModal] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [currentProperty, setCurrentProperty] = useState('');
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [currentFilterCriteria, setCurrentFilterCriteria] = useState('');

  // Get unique values for a specific property from opportunities data
  const getUniqueValues = (property) => {
    const propertyMap = {
      'contact_owner': 'contactOwner',
      'lead_status': 'leadStatus',
      'tag': 'tags',
      'mailing_country': 'country',
      'mailing_state': 'state',
      'mailing_city': 'city',
      'mailing_street': 'companyName',
      'created_by': 'createdBy',
      'modified_by': 'modifiedBy',
      'lead_source': 'leadSource',
      'pipeline_stage': 'leadStatus',
      'contact_name': 'contactName',
      'industry': 'industry',
      'account_type': 'accountType'
    };

    const field = propertyMap[property];
    if (!field) return [];

    const values = [...new Set(opportunities.map(opp => opp[field]).filter(value => value && value.toString().trim() !== ''))];
    return values.sort();
  };

  const handleCombinedFilters = async (filters) => {
    console.log('Applying combined filters:', filters);

    try {
      let url = `${import.meta.env.VITE_FILTER_ACCOUNTS_API_URL}?`;
      const urlParams = [];

      // Add base parameters
      const currentUserName = user?.name || user?.phone_number || 'operation';
      urlParams.push(`user=${encodeURIComponent(currentUserName)}`);
      //urlParams.push('status_is_not=junk');

      // Build URL parameters for all filters
      filters.forEach(filter => {
        if (filter.property === 'contact_owner' && filter.value) {
          const operator = filter.operator === 'isn\'t' ? 'is_not' : 'is';
          const paramName = `owner_${operator}`;
          urlParams.push(`${paramName}=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'lead_status' && filter.value) {
          const operator = filter.operator === 'isn\'t' || filter.operator === 'is not' ? 'is_not' : 'is';
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
        } else if (filter.property === 'created_by' && filter.value) {
          const operator = filter.operator === 'is not' ? 'is_not' : 'is';
          const paramName = `created_by_${operator}`;
          urlParams.push(`${paramName}=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'modified_by' && filter.value) {
          const operator = filter.operator === 'is not' ? 'is_not' : 'is';
          const paramName = `modified_by_${operator}`;
          urlParams.push(`${paramName}=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'mailing_city' && filter.value) {
          const operator = filter.operator === 'is not' ? 'is_not' : 'is';
          const paramName = `city_${operator}`;
          urlParams.push(`${paramName}=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'lead_source' && filter.value) {
          const operator = filter.operator === 'is not' ? 'is_not' : 'is';
          const paramName = `lead_source_${operator}`;
          urlParams.push(`${paramName}=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'description' && filter.value) {
          const operator = filter.operator === 'is not' ? 'is_not' : 'is';
          const paramName = `description_${operator}`;
          urlParams.push(`${paramName}=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'created_time' && filter.dateOperator === 'on' && filter.value) {
          urlParams.push(`date_type=on`);
          urlParams.push(`date=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'created_time' && filter.dateOperator === 'after' && filter.value) {
          urlParams.push(`date_type=after`);
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
      console.log('URL params:', urlParams);

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

        // Set filter applied state and criteria
        setIsFilterApplied(true);
        const criteriaText = filters.map(f => {
          const propLabel = f.property.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
          const operatorText = f.operator === 'is' || f.operator === 'is not' ? f.operator === 'is' ? 'is' : 'isn\'t' : '';
          return `${propLabel} ${operatorText} ${f.value}`;
        }).join(', ');
        setCurrentFilterCriteria(criteriaText);

        // Transform the filtered opportunities data
        const transformedOpportunities = result.data.map(opp => ({
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
          dealPresent: opp.deal_present || false,
          website: opp.website || '',
          accountType: opp.account_type || '',
          modifiedTime: opp.modified_time || ''
        }));

        setOpportunities(transformedOpportunities);
        fetchAllDealCounts(transformedOpportunities);
      } else {
        console.error('Unexpected API response format:', result);
        throw new Error('Unexpected API response format');
      }
    } catch (err) {
      console.error('Error applying combined filters:', err);
      alert(`Error applying filters: ${err.message || 'Unknown error occurred'}`);
    }
  };

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFieldToUpdate, setSelectedFieldToUpdate] = useState('');
  const [updateFieldValue, setUpdateFieldValue] = useState('');
  const [updateNewFieldValue, setUpdateNewFieldValue] = useState('');

  // ── Tab state for modal right panel ──────────────────────────────────────
  const [activeModalTab, setActiveModalTab] = useState('timeline');
  const [showCreateDealModal, setShowCreateDealModal] = useState(false);
  const [showDealInfoModal, setShowDealInfoModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'
  const [collapsedStages, setCollapsedStages] = useState({}); // Track collapsed stages
  const [columnWidths, setColumnWidths] = useState({}); // Track column widths for resize
  const [timelineData, setTimelineData] = useState([]); // Timeline data
  const [timelineLoading, setTimelineLoading] = useState(false); // Timeline loading state
  const [taskName, setTaskName] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskOwner, setTaskOwner] = useState('');
  const [dealName, setDealName] = useState('');
  const [dealClosingDate, setDealClosingDate] = useState('');
  const [dealStage, setDealStage] = useState('');
  const [dealAmount, setDealAmount] = useState('');
  const [dealProbability, setDealProbability] = useState('');
  const [dealDescription, setDealDescription] = useState('');
  const [dealType, setDealType] = useState('');
  const [dealsData, setDealsData] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(false);
  const [dealCounts, setDealCounts] = useState({});
  const [editingDealField, setEditingDealField] = useState(null);
  const [editDealValue, setEditDealValue] = useState('');
  const [showDeleteDealModal, setShowDeleteDealModal] = useState(false);
  const [dealToDelete, setDealToDelete] = useState(null);
  const [showCustomDealTypeInput, setShowCustomDealTypeInput] = useState(false);
  const [showCustomDealStageInput, setShowCustomDealStageInput] = useState(false);
  const [showCustomDealOwnerInput, setShowCustomDealOwnerInput] = useState(false);
  const [customDealType, setCustomDealType] = useState('');
  const [customDealStage, setCustomDealStage] = useState('');
  const [customDealOwner, setCustomDealOwner] = useState('');
  const [taskStatus, setTaskStatus] = useState('Pending');
  const [noteInput, setNoteInput] = useState('');
  const [activities, setActivities] = useState([]);
  const [addingNote, setAddingNote] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [kanbanDeals, setKanbanDeals] = useState({}); // Store deals by stage for Kanban
  const [pipelineViewMode, setPipelineViewMode] = useState('kanban'); // Track sales pipeline view mode (kanban vs list)

  // ── Sales Pipeline Filter State ─────────────────────────────────────────────
  const [salesFilterSidebarOpen, setSalesFilterSidebarOpen] = useState(false);
  const [selectedSalesProperties, setSelectedSalesProperties] = useState([]);
  const [currentSalesProperty, setCurrentSalesProperty] = useState('');
  const [salesFiltersApplied, setSalesFiltersApplied] = useState(false);

  // ── Summary Deal Filter State ───────────────────────────────────────────────
  const [dealFilter, setDealFilter] = useState('all'); // 'all', 'with_deals', 'without_deals'

  // ── Sales Pipeline List View Pagination State ───────────────────────────────
  const [salesPipelineItemsPerPage, setSalesPipelineItemsPerPage] = useState(10);
  const [salesPipelineCurrentPage, setSalesPipelineCurrentPage] = useState(1);

  // Handle deal filter click
  const handleDealFilterClick = async (filter) => {
    setDealFilter(prev => (prev === filter ? 'all' : filter));
    setCurrentPage(1);
  };

  // Fetch filtered opportunities based on deal filter
  useEffect(() => {
    const fetchFilteredOpportunities = async () => {
      if (dealFilter === 'all') {
        // Fetch all opportunities
        const currentUserName = user?.name || user?.phone_number || 'operation';
        const apiUrl = import.meta.env.VITE_ACCOUNTS_API_URL;
        if (!apiUrl) {
          setOpportunities(getMockOpportunities());
          return;
        }

        try {
          const response = await fetch(`${apiUrl}?user=${encodeURIComponent(currentUserName)}`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
            dealPresent: opp.deal_present || false,
            website: opp.website || '',
            accountType: opp.account_type || '',
            modifiedTime: opp.modified_time || ''
          }));
          setOpportunities(transformedOpportunities);
          fetchAllDealCounts(transformedOpportunities);
        } catch (err) {
          console.error('Error fetching opportunities:', err);
          const mockOpps = getMockOpportunities();
          setOpportunities(mockOpps);
          fetchAllDealCounts(mockOpps);
        }
      } else {
        // Fetch filtered opportunities
        const currentUserName = user?.name || user?.phone_number || 'operation';
        const apiUrl = import.meta.env.VITE_FILTER_ACCOUNTS_API_URL;
        if (!apiUrl) {
          console.log('Filter API URL not configured');
          return;
        }

        try {
          const response = await fetch(`${apiUrl}?user=${encodeURIComponent(currentUserName)}&deal_filter=${dealFilter}`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const responseData = await response.json();
          const data = responseData.data || [];
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
            dealPresent: opp.deal_present ? parseInt(opp.deal_present) > 0 : false,
            website: opp.website || '',
            accountType: opp.account_type || '',
            modifiedTime: opp.modified_time || ''
          }));
          setOpportunities(transformedOpportunities);
          fetchAllDealCounts(transformedOpportunities);
        } catch (err) {
          console.error('Error fetching filtered opportunities:', err);
        }
      }
    };

    fetchFilteredOpportunities();
  }, [dealFilter]);

  // ── Filter Logic ─────────────────────────────────────────────────────────────
  const applyFilters = (deals) => {
    let filtered = [...deals];

    selectedSalesProperties.forEach(prop => {
      if (prop.property === 'deal_owner' && prop.value) {
        const values = prop.value.split(',').filter(v => v);
        if (prop.operator === 'is') {
          filtered = filtered.filter(deal => values.includes(deal.deal_owner));
        } else if (prop.operator === 'is_not' || prop.operator === "isn't") {
          filtered = filtered.filter(deal => !values.includes(deal.deal_owner));
        }
      }

      if (prop.property === 'deal_name' && prop.value) {
        const searchValue = prop.value.toLowerCase();
        if (prop.operator === 'contains') {
          filtered = filtered.filter(deal => deal.deal_name?.toLowerCase().includes(searchValue));
        } else if (prop.operator === 'equals') {
          filtered = filtered.filter(deal => deal.deal_name?.toLowerCase() === searchValue);
        } else if (prop.operator === 'starts_with') {
          filtered = filtered.filter(deal => deal.deal_name?.toLowerCase().startsWith(searchValue));
        }
      }

      if (prop.property === 'amount' && prop.value) {
        const dealAmount = parseFloat(prop.value) || 0;
        if (prop.operator === 'equals') {
          filtered = filtered.filter(deal => parseFloat(deal.deal_amount) === dealAmount);
        } else if (prop.operator === 'greater_than') {
          filtered = filtered.filter(deal => parseFloat(deal.deal_amount) > dealAmount);
        } else if (prop.operator === 'less_than') {
          filtered = filtered.filter(deal => parseFloat(deal.deal_amount) < dealAmount);
        } else if (prop.operator === 'between' && prop.value2) {
          const dealAmount2 = parseFloat(prop.value2) || 0;
          const min = Math.min(dealAmount, dealAmount2);
          const max = Math.max(dealAmount, dealAmount2);
          filtered = filtered.filter(deal => {
            const amount = parseFloat(deal.deal_amount) || 0;
            return amount >= min && amount <= max;
          });
        }
      }

      if (prop.property === 'closing_date') {
        if (prop.dateOperator === 'on' && prop.value) {
          const filterDate = new Date(prop.value);
          filtered = filtered.filter(deal => {
            if (!deal.deal_close_date) return false;
            const dealDate = new Date(deal.deal_close_date);
            return dealDate.toDateString() === filterDate.toDateString();
          });
        } else if (prop.dateOperator === 'before' && prop.value) {
          const filterDate = new Date(prop.value);
          filtered = filtered.filter(deal => {
            if (!deal.deal_close_date) return false;
            const dealDate = new Date(deal.deal_close_date);
            return dealDate < filterDate;
          });
        } else if (prop.dateOperator === 'after' && prop.value) {
          const filterDate = new Date(prop.value);
          filtered = filtered.filter(deal => {
            if (!deal.deal_close_date) return false;
            const dealDate = new Date(deal.deal_close_date);
            return dealDate > filterDate;
          });
        } else if (prop.dateOperator === 'between' && prop.fromDate && prop.toDate) {
          const minDate = new Date(prop.fromDate);
          const maxDate = new Date(prop.toDate);
          filtered = filtered.filter(deal => {
            if (!deal.deal_close_date) return false;
            const dealDate = new Date(deal.deal_close_date);
            return dealDate >= minDate && dealDate <= maxDate;
          });
        } else if (prop.dateOperator === 'in_the_last' && prop.period) {
          const now = new Date();
          let startDate;
          if (prop.period === 'day') {
            startDate = new Date(now.setDate(now.getDate() - 1));
          } else if (prop.period === 'week') {
            startDate = new Date(now.setDate(now.getDate() - 7));
          } else if (prop.period === 'month') {
            startDate = new Date(now.setMonth(now.getMonth() - 1));
          }
          filtered = filtered.filter(deal => {
            if (!deal.deal_close_date) return false;
            const dealDate = new Date(deal.deal_close_date);
            return dealDate >= startDate;
          });
        }
      }

      if (prop.property === 'deal_type' && prop.value) {
        const values = prop.value.split(',').filter(v => v);
        if (prop.operator === 'is') {
          filtered = filtered.filter(deal => values.includes(deal.deal_type));
        } else if (prop.operator === 'is_not') {
          filtered = filtered.filter(deal => !values.includes(deal.deal_type));
        }
      }

      if (prop.property === 'deal_stage' && prop.value) {
        const values = prop.value.split(',').filter(v => v);
        if (prop.operator === 'is') {
          filtered = filtered.filter(deal => values.includes(deal.deal_stage));
        } else if (prop.operator === 'is_not') {
          filtered = filtered.filter(deal => !values.includes(deal.deal_stage));
        }
      }

      if (prop.property === 'created_by' && prop.value) {
        const values = prop.value.split(',').filter(v => v);
        if (prop.operator === 'is') {
          filtered = filtered.filter(deal => values.includes(deal.created_by));
        } else if (prop.operator === 'is_not' || prop.operator === "isn't") {
          filtered = filtered.filter(deal => !values.includes(deal.created_by));
        }
      }

      if (prop.property === 'created_time') {
        if (prop.dateOperator === 'on' && prop.value) {
          const filterDate = new Date(prop.value);
          filtered = filtered.filter(deal => {
            if (!deal.created_time) return false;
            const dealDate = new Date(deal.created_time);
            return dealDate.toDateString() === filterDate.toDateString();
          });
        } else if (prop.dateOperator === 'before' && prop.value) {
          const filterDate = new Date(prop.value);
          filtered = filtered.filter(deal => {
            if (!deal.created_time) return false;
            const dealDate = new Date(deal.created_time);
            return dealDate < filterDate;
          });
        } else if (prop.dateOperator === 'after' && prop.value) {
          const filterDate = new Date(prop.value);
          filtered = filtered.filter(deal => {
            if (!deal.created_time) return false;
            const dealDate = new Date(deal.created_time);
            return dealDate > filterDate;
          });
        } else if (prop.dateOperator === 'between' && prop.fromDate && prop.toDate) {
          const minDate = new Date(prop.fromDate);
          const maxDate = new Date(prop.toDate);
          filtered = filtered.filter(deal => {
            if (!deal.created_time) return false;
            const dealDate = new Date(deal.created_time);
            return dealDate >= minDate && dealDate <= maxDate;
          });
        } else if (prop.dateOperator === 'in_the_last' && prop.period) {
          const now = new Date();
          let startDate;
          if (prop.period === 'day') {
            startDate = new Date(now.setDate(now.getDate() - 1));
          } else if (prop.period === 'week') {
            startDate = new Date(now.setDate(now.getDate() - 7));
          } else if (prop.period === 'month') {
            startDate = new Date(now.setMonth(now.getMonth() - 1));
          }
          filtered = filtered.filter(deal => {
            if (!deal.created_time) return false;
            const dealDate = new Date(deal.created_time);
            return dealDate >= startDate;
          });
        }
      }

      if (prop.property === 'modified_by' && prop.value) {
        const values = prop.value.split(',').filter(v => v);
        if (prop.operator === 'is') {
          filtered = filtered.filter(deal => values.includes(deal.modified_by));
        } else if (prop.operator === 'is_not' || prop.operator === "isn't") {
          filtered = filtered.filter(deal => !values.includes(deal.modified_by));
        }
      }

      if (prop.property === 'modified_time') {
        if (prop.dateOperator === 'on' && prop.value) {
          const filterDate = new Date(prop.value);
          filtered = filtered.filter(deal => {
            if (!deal.modified_at) return false;
            const dealDate = new Date(deal.modified_at);
            return dealDate.toDateString() === filterDate.toDateString();
          });
        } else if (prop.dateOperator === 'before' && prop.value) {
          const filterDate = new Date(prop.value);
          filtered = filtered.filter(deal => {
            if (!deal.modified_at) return false;
            const dealDate = new Date(deal.modified_at);
            return dealDate < filterDate;
          });
        } else if (prop.dateOperator === 'after' && prop.value) {
          const filterDate = new Date(prop.value);
          filtered = filtered.filter(deal => {
            if (!deal.modified_at) return false;
            const dealDate = new Date(deal.modified_at);
            return dealDate > filterDate;
          });
        } else if (prop.dateOperator === 'between' && prop.fromDate && prop.toDate) {
          const minDate = new Date(prop.fromDate);
          const maxDate = new Date(prop.toDate);
          filtered = filtered.filter(deal => {
            if (!deal.modified_at) return false;
            const dealDate = new Date(deal.modified_at);
            return dealDate >= minDate && dealDate <= maxDate;
          });
        } else if (prop.dateOperator === 'in_the_last' && prop.period) {
          const now = new Date();
          let startDate;
          if (prop.period === 'day') {
            startDate = new Date(now.setDate(now.getDate() - 1));
          } else if (prop.period === 'week') {
            startDate = new Date(now.setDate(now.getDate() - 7));
          } else if (prop.period === 'month') {
            startDate = new Date(now.setMonth(now.getMonth() - 1));
          }
          filtered = filtered.filter(deal => {
            if (!deal.modified_at) return false;
            const dealDate = new Date(deal.modified_at);
            return dealDate >= startDate;
          });
        }
      }
    });
    
    return filtered;
  };

  // Compute filtered kanban deals
  const filteredKanbanDeals = useMemo(() => {
    // If filters are applied via API, return kanbanDeals directly (already filtered by API)
    if (salesFiltersApplied) {
      return kanbanDeals;
    }

    // Otherwise, apply client-side filtering
    const filteredByStage = {};
    const stages = ['Opportunity', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost', 'Invoiced', 'Paid'];

    for (const stage of stages) {
      const stageDeals = kanbanDeals[stage] || [];
      let filtered = applyFilters(stageDeals);

      // Apply search term filtering
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(deal =>
          (deal.deal_name && deal.deal_name.toLowerCase().includes(searchLower)) ||
          (deal.deal_amount && deal.deal_amount.toString().includes(searchLower)) ||
          (deal.deal_owner && deal.deal_owner.toLowerCase().includes(searchLower)) ||
          (deal.full_name && deal.full_name.toLowerCase().includes(searchLower))
        );
      }

      filteredByStage[stage] = filtered;
    }

    return filteredByStage;
  }, [kanbanDeals, selectedSalesProperties, salesFiltersApplied, searchTerm, kanbanUpdateTimestamp]);

  // Calculate deal metrics for summary
  const dealMetrics = useMemo(() => {
    const allDeals = Object.values(filteredKanbanDeals).flat();
    const openDeals = allDeals.filter(deal =>
      ['Opportunity', 'Proposal', 'Negotiation'].includes(deal.deal_stage)
    );
    const positiveDeals = allDeals.filter(deal =>
      ['Closed Won', 'Invoiced', 'Paid'].includes(deal.deal_stage)
    );
    const negativeDeals = allDeals.filter(deal =>
      deal.deal_stage === 'Closed Lost'
    );

    return {
      total: allDeals.length,
      open: openDeals.length,
      positive: positiveDeals.length,
      negative: negativeDeals.length
    };
  }, [filteredKanbanDeals]);

  // Update filter applied indicator
  useEffect(() => {
    const hasActiveFilters = selectedSalesProperties.some(prop => {
      if (prop.property === 'deal_owner' || prop.property === 'deal_type' || prop.property === 'deal_stage' || prop.property === 'created_by' || prop.property === 'modified_by') {
        return prop.value && prop.value.split(',').filter(v => v).length > 0;
      }
      if (prop.property === 'deal_name' || prop.property === 'amount') {
        return prop.value;
      }
      if (prop.property === 'closing_date' || prop.property === 'created_time' || prop.property === 'modified_time') {
        return (prop.value || prop.fromDate || prop.period);
      }
      return false;
    });
    
    setSalesFiltersApplied(hasActiveFilters);
  }, [selectedSalesProperties]);

  // Reset Sales Pipeline Filters
  const resetSalesFilters = () => {
    setSelectedSalesProperties([]);
    setCurrentSalesProperty('');
    setSalesFiltersApplied(false);
    fetchAllKanbanDeals(); // Reload all deals when filters are reset
  };

  // Apply Sales Pipeline Filters via API
  // Apply Sales Pipeline Filters via API
  const applySalesFilters = async () => {
    try {
      const apiUrl = import.meta.env.VITE_FILTER_DEALS_API_URL;
      if (!apiUrl) {
        console.log('Filter Deals API URL not configured');
        toast.error('Filter API URL not configured');
        return;
      }

      const currentUser = user?.name || user?.phone_number || 'operation';
      let url = `${apiUrl}?user=${encodeURIComponent(currentUser)}`;
      const urlParams = [];

      // Maps each date-property to its backend date_field name
      const dateFieldMap = {
        closing_date: 'deal_close_date',
        created_time: 'created_time',
        modified_time: 'modified_time'
      };

      selectedSalesProperties.forEach(filter => {
        // ── Deal Owner: deal_owner_is / deal_owner_is_not ──────────────────
        if (filter.property === 'deal_owner' && filter.value) {
          const param = (filter.operator === "isn't" || filter.operator === 'is not') ? 'deal_owner_is_not' : 'deal_owner_is';
          filter.value.split(',').filter(v => v.trim()).forEach(value => {
            urlParams.push(`${param}=${encodeURIComponent(value.trim())}`);
          });
        }

        // ── Deal Name: deal_name_operator=contains/equals/starts_with ──────
        else if (filter.property === 'deal_name' && (filter.value || filter.searchTerm)) {
          const operator = filter.operator || 'contains';
          urlParams.push(`deal_name_operator=${operator}`);
          urlParams.push(`deal_name=${encodeURIComponent(filter.value || filter.searchTerm)}`);
        }

        // ── Amount: equals / greater_than / less_than / between ────────────
        else if (filter.property === 'amount' && (filter.value || filter.operator === 'between')) {
          if (filter.operator === 'between') {
            urlParams.push(`amount_operator=between`);
            urlParams.push(`from_amount=${encodeURIComponent(filter.value || '0')}`);
            urlParams.push(`to_amount=${encodeURIComponent(filter.value2 || '')}`);
          } else {
            const operator = filter.operator || 'equals';
            urlParams.push(`amount_operator=${operator}`);
            urlParams.push(`amount=${encodeURIComponent(filter.value)}`);
          }
        }

        // ── Deal Type: deal_type_is / deal_type_is_not ─────────────────────
        else if (filter.property === 'deal_type' && filter.value) {
          const param = filter.operator === 'is not' ? 'deal_type_is_not' : 'deal_type_is';
          filter.value.split(',').filter(v => v.trim()).forEach(value => {
            urlParams.push(`${param}=${encodeURIComponent(value.trim())}`);
          });
        }

        // ── Deal Stage: deal_stage_is / deal_stage_is_not ──────────────────
        else if (filter.property === 'deal_stage' && filter.value) {
          const param = filter.operator === 'is not' ? 'deal_stage_is_not' : 'deal_stage_is';
          filter.value.split(',').filter(v => v.trim()).forEach(value => {
            urlParams.push(`${param}=${encodeURIComponent(value.trim())}`);
          });
        }

        // ── Created By: created_by_is / created_by_is_not ─────────────────
        else if (filter.property === 'created_by' && filter.value) {
          const param = (filter.operator === "isn't" || filter.operator === 'is not') ? 'created_by_is_not' : 'created_by_is';
          filter.value.split(',').filter(v => v.trim()).forEach(value => {
            urlParams.push(`${param}=${encodeURIComponent(value.trim())}`);
          });
        }

        // ── Modified By: modified_by_is / modified_by_is_not ──────────────
        else if (filter.property === 'modified_by' && filter.value) {
          const param = (filter.operator === "isn't" || filter.operator === 'is not') ? 'modified_by_is_not' : 'modified_by_is';
          filter.value.split(',').filter(v => v.trim()).forEach(value => {
            urlParams.push(`${param}=${encodeURIComponent(value.trim())}`);
          });
        }

        // ── Date filters: closing_date / created_time / modified_time ─────
        else if (['closing_date', 'created_time', 'modified_time'].includes(filter.property)) {
          const dateField = dateFieldMap[filter.property];

          if (filter.dateOperator === 'on' && filter.value) {
            urlParams.push(`date_field=${dateField}`);
            urlParams.push(`date_type=on`);
            urlParams.push(`date=${encodeURIComponent(filter.value)}`);
          } else if (filter.dateOperator === 'before' && filter.value) {
            urlParams.push(`date_field=${dateField}`);
            urlParams.push(`date_type=before`);
            urlParams.push(`date=${encodeURIComponent(filter.value)}`);
          } else if (filter.dateOperator === 'after' && filter.value) {
            urlParams.push(`date_field=${dateField}`);
            urlParams.push(`date_type=after`);
            urlParams.push(`date=${encodeURIComponent(filter.value)}`);
          } else if (filter.dateOperator === 'between' && filter.fromDate && filter.toDate) {
            urlParams.push(`date_field=${dateField}`);
            urlParams.push(`date_type=between`);
            urlParams.push(`from=${encodeURIComponent(filter.fromDate)}`);
            urlParams.push(`to=${encodeURIComponent(filter.toDate)}`);
          } else if (filter.dateOperator === 'in_the_last' && filter.period) {
            const unitMap = { day: 'days', week: 'weeks', month: 'months' };
            const countMap = { day: 1, week: 7, month: 30 };
            // Use custom count if provided, otherwise use default countMap
            const count = filter.count ? parseInt(filter.count) : countMap[filter.period] || 1;
            urlParams.push(`date_field=${dateField}`);
            urlParams.push(`date_type=in_last`);
            urlParams.push(`last_count=${count}`);
            urlParams.push(`last_unit=${unitMap[filter.period] || 'days'}`);
          }
        }
      });

      if (urlParams.length > 0) {
        url += '&' + urlParams.join('&');
      }

      console.log('Filter API URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Filter response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Filter error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Filter API result:', result);

      if (result.data && Array.isArray(result.data)) {
        // Group filtered deals by stage
        const stages = ['Opportunity', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost', 'Invoiced', 'Paid'];
        const dealsByStage = {};
        
        stages.forEach(stage => {
          dealsByStage[stage] = result.data.filter(deal => deal.deal_stage === stage);
        });

        setKanbanDeals(dealsByStage);
        setSalesFiltersApplied(true);
        setSalesFilterSidebarOpen(false);
        toast.success(`Filter applied successfully! Found ${result.data.length} records.`);
      } else {
        console.error('API returned unexpected format:', result);
        toast.error('Failed to apply filter: Unexpected response format');
      }
    } catch (err) {
      console.error('Error applying sales filters:', err);
      toast.error(`Error applying filter: ${err.message || 'Unknown error occurred'}`);
    }
  };

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

  const [predefinedTags, setPredefinedTags] = useState(() => {
    const saved = localStorage.getItem('opportunities_predefinedTags');
    return saved ? JSON.parse(saved) : ['Sat2Farm Recurring', 'Sat2Farm Non Recurring', 'Sat2Farm Exclusivity', 'Sat4Agri', 'Sat4Risk', 'Project', 'WhiteLabelling', 'API Client','Positive response'];
  });

  const [predefinedLeadSources, setPredefinedLeadSources] = useState(() => {
    const saved = localStorage.getItem('opportunities_predefinedLeadSources');
    return saved ? JSON.parse(saved) : ['FB Campaign', 'Website Inbound', 'Sales Inbound', 'Mail Inbound', 'External Referral', 'Cold Call', 'Event'];
  });

  const [predefinedIndustries, setPredefinedIndustries] = useState(() => {
    const saved = localStorage.getItem('opportunities_predefinedIndustries');
    return saved ? JSON.parse(saved) : ['Farmer', 'FPO', 'NGO', 'Government', 'Enterprise', 'Agri Input', 'Agri Output'];
  });

  const [predefinedAccountTypes, setPredefinedAccountTypes] = useState(() => {
    const saved = localStorage.getItem('opportunities_predefinedAccountTypes');
    return saved ? JSON.parse(saved) : ['Sat2Farm Recurring', 'Sat2Farm Non Recurring', 'Sat2Farm Exclusivity', 'Sat4Agri', 'Sat4Risk', 'Project', 'WhiteLabelling', 'API Client','Positive response'];
  });

  const [predefinedContactOwners, setPredefinedContactOwners] = useState(() => {
    const saved = localStorage.getItem('opportunities_predefinedContactOwners');
    return saved ? JSON.parse(saved) : ['Chaturya', 'Nirosha', 'Priyanshu', 'Bhagwati', 'Harshitha', 'Aymen', 'Shurti', 'Abubakar', 'Vijay K B', 'Mustaqeem', 'Operation','Amith'];
  });

  const [predefinedDealTypes, setPredefinedDealTypes] = useState(() => {
    const saved = localStorage.getItem('opportunities_predefinedDealTypes');
    return saved ? JSON.parse(saved) : ['Trial', 'Starter', 'Growth', 'Entrepreneur'];
  });
  const [predefinedDealStages, setPredefinedDealStages] = useState(() => {
    const saved = localStorage.getItem('opportunities_predefinedDealStages');
    return saved ? JSON.parse(saved) : ['Opportunity', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost', 'Invoiced', 'Paid'];
  });

  // Save to localStorage when predefined values change
  useEffect(() => {
    localStorage.setItem('opportunities_predefinedTags', JSON.stringify(predefinedTags));
  }, [predefinedTags]);

  useEffect(() => {
    localStorage.setItem('opportunities_predefinedLeadSources', JSON.stringify(predefinedLeadSources));
  }, [predefinedLeadSources]);

  useEffect(() => {
    localStorage.setItem('opportunities_predefinedIndustries', JSON.stringify(predefinedIndustries));
  }, [predefinedIndustries]);

  useEffect(() => {
    localStorage.setItem('opportunities_predefinedAccountTypes', JSON.stringify(predefinedAccountTypes));
  }, [predefinedAccountTypes]);

  useEffect(() => {
    localStorage.setItem('opportunities_predefinedContactOwners', JSON.stringify(predefinedContactOwners));
  }, [predefinedContactOwners]);

  useEffect(() => {
    localStorage.setItem('opportunities_predefinedDealTypes', JSON.stringify(predefinedDealTypes));
  }, [predefinedDealTypes]);

  useEffect(() => {
    localStorage.setItem('opportunities_predefinedDealStages', JSON.stringify(predefinedDealStages));
  }, [predefinedDealStages]);

  // ── Helper: unique contact owners ────────────────────────────────────────
  const getUniqueContactOwners = () => {
    return [...new Set(opportunities.map(o => o.contactOwner).filter(v => v && v.trim()))].sort();
  };

  // ── Helper: get icon for timeline field ─────────────────────────────────
  const getTimelineIcon = (field) => {
    const iconMap = {
      'contactName': User,
      'phoneNumber': Phone,
      'email': Mail,
      'companyName': Building,
      'alternateNumber': Phone,
      'city': MapPin,
      'state': Map,
      'country': Globe,
      'leadStatus': Activity,
      'industry': Briefcase,
      'contactOwner': UserCheck,
      'leadSource': TrendingUp,
      'tags': Tag,
      'notes': MessageSquare,
      'description': FileText
    };
    const IconComponent = iconMap[field] || FileEdit;
    return IconComponent;
  };

  // Add note using API
  const handleAddNote = async () => {
    if (!noteInput.trim()) {
      toast.error('Please enter a note');
      return;
    }

    if (!selectedUser) {
      toast.error('No opportunity selected');
      return;
    }

    setAddingNote(true);
    const currentUserName = user?.name || user?.phone_number || 'operation';
    const url = `${import.meta.env.VITE_LEAD_ACTIVITY_API_URL}?lead_id=${selectedUser.id}&activity_type=note&message=${encodeURIComponent(noteInput)}&user=${encodeURIComponent(currentUserName)}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error adding note:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Note added successfully:', result);

      if (result.success || result.message) {
        toast.success('Note added successfully');
        setNoteInput('');
        // Refresh timeline to show the new note
        fetchTimeline(selectedUser.id);
        // Refresh activities to show the new note
        fetchActivities(selectedUser.id);
      } else {
        toast.error('Failed to add note');
      }
    } catch (err) {
      console.error('Error adding note:', err);
      toast.error('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  // Fetch deals by stage for Kanban dashboard
  const fetchDealsByStage = async (stage) => {
    try {
      const apiUrl = import.meta.env.VITE_DEALS_API_URL;
      if (!apiUrl) {
        console.log('Deals API URL not configured');
        return [];
      }

      const currentUser = user?.name || user?.phone_number || 'operation';
      const response = await fetch(`${apiUrl}?deal_stage=${encodeURIComponent(stage)}&user=${encodeURIComponent(currentUser)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Deals for stage ${stage}:`, result);
      
      const deals = result.data || [];
      return deals;
    } catch (err) {
      console.error(`Error fetching deals for stage ${stage}:`, err);
      return [];
    }
  };

  // Fetch all deals for all stages
  const fetchAllKanbanDeals = async () => {
    const stages = ['Opportunity', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost', 'Invoiced', 'Paid'];
    const dealsByStage = {};
    
    for (const stage of stages) {
      const deals = await fetchDealsByStage(stage);
      dealsByStage[stage] = deals;
    }
    
    setKanbanDeals(dealsByStage);
  };

  // Add task using API
  const handleAddTask = async () => {
    if (!taskName.trim()) {
      toast.error('Please enter task name');
      return;
    }

    if (!selectedUser) {
      toast.error('No opportunity selected');
      return;
    }

    setAddingTask(true);
    const currentUserName = user?.name || user?.phone_number || 'operation';
    const url = `${import.meta.env.VITE_LEAD_ACTIVITY_API_URL}?lead_id=${selectedUser.id}&activity_type=task&task_name=${encodeURIComponent(taskName)}&due_date=${encodeURIComponent(taskDueDate)}&status=${encodeURIComponent(taskStatus)}&task_owner=${encodeURIComponent(currentUserName)}&user=${encodeURIComponent(currentUserName)}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error adding task:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Task added successfully:', result);

      if (result.success || result.message) {
        toast.success('Task created successfully');
        setTaskName('');
        setTaskDueDate('');
        setTaskStatus('Pending');
        setShowCreateTaskModal(false);
        // Refresh timeline to show the new task
        fetchTimeline(selectedUser.id);
        // Refresh activities to show the new task
        fetchActivities(selectedUser.id);
      } else {
        toast.error('Failed to create task');
      }
    } catch (err) {
      console.error('Error adding task:', err);
      toast.error('Failed to create task');
    } finally {
      setAddingTask(false);
    }
  };

  // Edit task - populate form with task data
  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskName(task.task_name);
    setTaskDueDate(task.due_date);
    setTaskStatus(task.status);
    setShowEditTaskModal(true);
  };

  // Update task using API
  const handleUpdateTask = async () => {
    if (!taskName.trim()) {
      toast.error('Please enter task name');
      return;
    }

    if (!editingTask) {
      toast.error('No task selected');
      return;
    }

    setAddingTask(true);
    const currentUserName = user?.name || user?.phone_number || 'operation';
    const url = `${import.meta.env.VITE_LEAD_ACTIVITY_API_URL}?id=${editingTask.id}&activity_type=task&task_name=${encodeURIComponent(taskName)}&due_date=${encodeURIComponent(taskDueDate)}&status=${encodeURIComponent(taskStatus)}&task_owner=${encodeURIComponent(currentUserName)}&user=${encodeURIComponent(currentUserName)}`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error updating task:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Task updated successfully:', result);

      if (result.success || result.message) {
        toast.success('Task updated successfully');
        setTaskName('');
        setTaskDueDate('');
        setTaskStatus('Pending');
        setEditingTask(null);
        setShowEditTaskModal(false);
        // Refresh timeline to show the updated task
        fetchTimeline(selectedUser.id);
        // Refresh activities to show the updated task
        fetchActivities(selectedUser.id);
      } else {
        toast.error('Failed to update task');
      }
    } catch (err) {
      console.error('Error updating task:', err);
      toast.error('Failed to update task');
    } finally {
      setAddingTask(false);
    }
  };

  // Fetch activities from API
  const fetchActivities = async (leadId) => {
    try {
      const url = `${import.meta.env.VITE_LEAD_ACTIVITY_API_URL}?lead_id=${leadId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        console.error('Error fetching activities:', response.status);
        return;
      }

      const result = await response.json();
      console.log('Activities fetched:', result);
      setActivities(result || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
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

  // ── Drag and drop handler for Kanban board (Pragmatic DnD) ───────────────
  const handleKanbanDealMove = async ({
    dealId,
    sourceColumnId,
    destinationColumnId,
    sourceIndex,
    destinationIndex,
  }) => {
    if (
      sourceColumnId === destinationColumnId &&
      sourceIndex === destinationIndex
    ) {
      return;
    }

    const columnToStageMap = {
      opportunity: 'Opportunity',
      proposal: 'Proposal',
      negotiation: 'Negotiation',
      'closed-won': 'Closed Won',
      'closed-lost': 'Closed Lost',
      invoiced: 'Invoiced',
      paid: 'Paid',
    };

    const newStage = columnToStageMap[destinationColumnId];
    const oldStage = columnToStageMap[sourceColumnId];

    if (!newStage) {
      toast.error('Invalid destination column');
      return;
    }

    const updatedKanbanDeals = { ...kanbanDeals };
    const sourceDeals = [...updatedKanbanDeals[oldStage]];
    const [movedDeal] = sourceDeals.splice(sourceIndex, 1);

    if (movedDeal) {
      movedDeal.deal_stage = newStage;
      const destDeals = [...updatedKanbanDeals[newStage]];
      destDeals.splice(destinationIndex, 0, movedDeal);
      updatedKanbanDeals[oldStage] = sourceDeals;
      updatedKanbanDeals[newStage] = destDeals;
      setKanbanDeals(updatedKanbanDeals);
      setKanbanUpdateTimestamp(Date.now());
    }

    if (sourceColumnId === destinationColumnId) {
      return;
    }

    toast.loading('Updating deal stage...');

    try {
      const currentUserName = user?.name || user?.phone_number || 'operation';
      const apiUrl = import.meta.env.VITE_UPDATE_DEAL_API_URL;
      if (!apiUrl) {
        console.log('Update deal API URL not configured');
        toast.dismiss();
        toast.error('Update Deal API URL not configured');
        fetchAllKanbanDeals();
        return;
      }

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deal_id: dealId,
          deal_stage: newStage,
          user: currentUserName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Deal stage updated successfully:', result);

      toast.dismiss();
      if (result.success || result.message) {
        toast.success('Deal stage updated successfully');
      } else {
        toast.error('Failed to update deal stage');
        fetchAllKanbanDeals();
      }
    } catch (err) {
      console.error('Error updating deal stage:', err);
      toast.dismiss();
      toast.error('Failed to update deal stage');
      fetchAllKanbanDeals();
    }
  };

  const handleKanbanDealClick = (deal) => {
    setSelectedDeal({
      deal_id: deal.deal_id,
      deal_name: deal.deal_name,
      contact_name: deal.full_name || 'John Smith',
      amount: `₹${deal.deal_amount}`,
      closing_date: deal.deal_close_date
        ? new Date(deal.deal_close_date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : '-',
      description: deal.description || '',
      deal_type: deal.deal_type || '',
      deal_stage: deal.deal_stage || '',
      contact_owner: deal.deal_owner || '',
      probability: `${deal.deal_probability}%`,
    });
    setShowDealInfoModal(true);
  };

  // ── Fetch timeline data for a lead ─────────────────────────────────────────
  const fetchTimeline = async (leadId) => {
    setTimelineLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_LEAD_TIMELINE_API_URL}?lead_id=${leadId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch timeline');
      }
      const data = await response.json();
      setTimelineData(data);
    } catch (error) {
      console.error('Error fetching timeline:', error);
      toast.error('Failed to fetch timeline');
      setTimelineData([]);
    } finally {
      setTimelineLoading(false);
    }
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
  const fetchDeals = async (accountId) => {
    try {
      setDealsLoading(true);
      const apiUrl = import.meta.env.VITE_DEALS_API_URL;
      
      if (!apiUrl) {
        console.log('Deals API URL not configured');
        setDealsData([]);
        setDealCounts(prev => ({ ...prev, [accountId]: 0 }));
        return;
      }

      const currentUser = user?.name || user?.phone_number || 'operation';
      const response = await fetch(`${apiUrl}?account_id=${accountId}&user=${encodeURIComponent(currentUser)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Deals API Result:', result);
      
      const deals = result.data || [];
      setDealsData(deals);
      setDealCounts(prev => ({ ...prev, [accountId]: deals.length }));
    } catch (err) {
      console.error('Error fetching deals:', err);
      setDealsData([]);
      setDealCounts(prev => ({ ...prev, [accountId]: 0 }));
    } finally {
      setDealsLoading(false);
    }
  };

  const fetchAllDealCounts = async (opportunities) => {
    const apiUrl = import.meta.env.VITE_DEALS_API_URL;
    if (!apiUrl) {
      console.log('Deals API URL not configured');
      return;
    }

    const currentUser = user?.name || user?.phone_number || 'operation';
    const counts = {};
    const promises = opportunities.map(async (opp) => {
      try {
        const response = await fetch(`${apiUrl}?account_id=${opp.id}&user=${encodeURIComponent(currentUser)}`);
        if (response.ok) {
          const result = await response.json();
          counts[opp.id] = (result.data || []).length;
        } else {
          counts[opp.id] = 0;
        }
      } catch (err) {
        console.error(`Error fetching deal count for account ${opp.id}:`, err);
        counts[opp.id] = 0;
      }
    });

    await Promise.all(promises);
    setDealCounts(counts);
  };

  const startDealEditing = (fieldName, currentValue) => {
    setEditingDealField(fieldName);
    setEditDealValue(currentValue || '');
  };

  const saveDealEdit = async () => {
    if (editingDealField && selectedDeal) {
      try {
        toast.loading('Updating deal...');
        
        const currentUserName = user?.name || user?.phone_number || 'operation';
        const apiUrl = import.meta.env.VITE_UPDATE_DEAL_API_URL;
        
        if (!apiUrl) {
          toast.dismiss();
          toast.error('Update Deal API URL not configured');
          return;
        }

        const requestBody = {
          deal_id: selectedDeal.deal_id,
          user: currentUserName
        };

        // Map field names to API field names
        const fieldMapping = {
          'deal_name': 'deal_name',
          'deal_amount': 'deal_amount',
          'deal_close_date': 'deal_close_date',
          'deal_type': 'deal_type',
          'deal_stage': 'deal_stage',
          'deal_owner': 'deal_owner',
          'contact_owner': 'contact_owner',
          'deal_probability': 'deal_probability',
          'description': 'description'
        };

        const apiFieldName = fieldMapping[editingDealField];
        if (apiFieldName) {
          requestBody[apiFieldName] = editDealValue;
        }

        console.log('Updating deal with:', requestBody);

        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('HTTP Error:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('API Result:', result);

        toast.dismiss();
        toast.success('Deal updated successfully');
        setEditingDealField(null);
        setEditDealValue('');

        // Update selectedDeal with new value
        setSelectedDeal({
          ...selectedDeal,
          [editingDealField]: editDealValue
        });

        // Refresh deals data
        fetchDeals(selectedUser?.id);
      } catch (err) {
        console.error('Error updating deal:', err);
        toast.dismiss();
        toast.error('Failed to update deal');
      }
    }
  };

  const cancelDealEdit = () => {
    setEditingDealField(null);
    setEditDealValue('');
  };

  const handleDeleteDeal = async () => {
    if (!dealToDelete) return;

    try {
      toast.loading('Deleting deal...');
      
      const currentUserName = user?.name || user?.phone_number || 'operation';
      const apiUrl = import.meta.env.VITE_DELETE_DEAL_API_URL;
      
      if (!apiUrl) {
        toast.dismiss();
        toast.error('Delete Deal API URL not configured');
        return;
      }

      const response = await fetch(`${apiUrl}?deal_id=${dealToDelete.deal_id}&user=${currentUserName}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Delete API Result:', result);

      toast.dismiss();
      toast.success('Deal deleted successfully');
      setShowDeleteDealModal(false);
      setDealToDelete(null);
      setShowDealInfoModal(false);
      setSelectedDeal(null);
      setDealCounts(prev => ({ ...prev, [selectedUser?.id]: (prev[selectedUser?.id] || 1) - 1 }));
      fetchDeals(selectedUser?.id);
    } catch (err) {
      console.error('Error deleting deal:', err);
      toast.dismiss();
      toast.error('Failed to delete deal');
    }
  };

  // CSV Import handler
  const handleCSVImport = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          toast.loading('Uploading CSV...');
          
          const currentUserName = user?.name || user?.phone_number || 'operation';
          const apiUrl = import.meta.env.VITE_UPLOAD_ACCOUNT_CSV_API_URL;
          
          if (!apiUrl) {
            toast.dismiss();
            toast.error('Upload CSV API URL not configured');
            return;
          }

          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch(`${apiUrl}?user=${encodeURIComponent(currentUserName)}`, {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          console.log('CSV upload result:', result);

          toast.dismiss();
          toast.success('CSV uploaded successfully');
          
          // Refresh the data
          fetchAccounts();
        } catch (err) {
          console.error('Error uploading CSV:', err);
          toast.dismiss();
          toast.error('Failed to upload CSV');
        }
      }
    };
    fileInput.click();
  };

  // Filtered CSV download handler
  const handleFilteredCSVDownload = async (filters) => {
    console.log('Downloading filtered CSV with filters:', filters);
    
    try {
      toast.loading('Downloading CSV...');
      const currentUser = user?.name || user?.phone_number || 'operation';
      let url = `${import.meta.env.VITE_DOWNLOAD_ACCOUNT_CSV_API_URL}?user=${encodeURIComponent(currentUser)}`;
      const urlParams = [];
      
      // Build URL parameters for all filters
      filters.forEach(filter => {
        if (filter.property === 'contact_owner' && filter.value) {
          const operator = filter.operator === 'isn\'t' ? 'is_not' : 'is';
          const paramName = `owner_${operator}`;
          urlParams.push(`${paramName}=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'lead_status' && filter.value) {
          const operator = filter.operator === 'isn\'t' || filter.operator === 'is not' ? 'is_not' : 'is';
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
        } else if (filter.property === 'created_by' && filter.value) {
          const operator = filter.operator === 'is not' ? 'is_not' : 'is';
          const paramName = `created_by_${operator}`;
          urlParams.push(`${paramName}=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'modified_by' && filter.value) {
          const operator = filter.operator === 'is not' ? 'is_not' : 'is';
          const paramName = `modified_by_${operator}`;
          urlParams.push(`${paramName}=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'mailing_city' && filter.value) {
          const operator = filter.operator === 'is not' ? 'is_not' : 'is';
          const paramName = `city_${operator}`;
          urlParams.push(`${paramName}=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'lead_source' && filter.value) {
          const operator = filter.operator === 'is not' ? 'is_not' : 'is';
          const paramName = `lead_source_${operator}`;
          urlParams.push(`${paramName}=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'description' && filter.value) {
          const operator = filter.operator === 'is not' ? 'is_not' : 'is';
          const paramName = `description_${operator}`;
          urlParams.push(`${paramName}=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'created_time' && filter.dateOperator === 'on' && filter.value) {
          urlParams.push(`date_type=on`);
          urlParams.push(`date=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'created_time' && filter.dateOperator === 'before' && filter.value) {
          urlParams.push(`date_type=before`);
          urlParams.push(`date=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'created_time' && filter.dateOperator === 'after' && filter.value) {
          urlParams.push(`date_type=after`);
          urlParams.push(`date=${encodeURIComponent(filter.value)}`);
        } else if (filter.property === 'created_time' && filter.dateOperator === 'between' && filter.fromDate && filter.toDate) {
          urlParams.push(`date_type=between`);
          urlParams.push(`from=${encodeURIComponent(filter.fromDate)}`);
          urlParams.push(`to=${encodeURIComponent(filter.toDate)}`);
        }
      });
      
      if (urlParams.length > 0) {
        url += '&' + urlParams.join('&');
      }
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
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'accounts.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      toast.dismiss();
      toast.success('CSV downloaded successfully');
    } catch (err) {
      console.error('Network error downloading filtered CSV:', err);
      toast.error(`Failed to download CSV: ${err.message || 'Unknown error occurred'}`);
    }
  };

  // Editable deal field component
  const EditableDealField = ({ label, value, fieldName, type = 'text', options = [] }) => {
    const isEditing = editingDealField === fieldName;
    const textareaRef = React.useRef(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [localTextareaValue, setLocalTextareaValue] = useState('');

    // Initialize local value when editing starts
    React.useEffect(() => {
      if (isEditing && type === 'textarea') {
        setLocalTextareaValue(editDealValue);
      }
    }, [isEditing, type, editDealValue]);

    // Sync local value to parent when editing ends
    React.useEffect(() => {
      if (!isEditing && type === 'textarea') {
        setLocalTextareaValue('');
      }
    }, [isEditing, type]);

    const handleTextareaChange = (e) => {
      setLocalTextareaValue(e.target.value);
      setEditDealValue(e.target.value);
    };

    // Handle custom input for deal_type, deal_stage, and contact_owner
    const showCustomInput = fieldName === 'deal_type' ? showCustomDealTypeInput : 
                           fieldName === 'deal_stage' ? showCustomDealStageInput : 
                           fieldName === 'contact_owner' ? showCustomDealOwnerInput : false;
    const customValue = fieldName === 'deal_type' ? customDealType : 
                      fieldName === 'deal_stage' ? customDealStage : 
                      fieldName === 'contact_owner' ? customDealOwner : '';
    const setCustomValue = fieldName === 'deal_type' ? setCustomDealType : 
                          fieldName === 'deal_stage' ? setCustomDealStage : 
                          fieldName === 'contact_owner' ? setCustomDealOwner : null;
    const setShowCustomInput = fieldName === 'deal_type' ? setShowCustomDealTypeInput : 
                              fieldName === 'deal_stage' ? setShowCustomDealStageInput : 
                              fieldName === 'contact_owner' ? setShowCustomDealOwnerInput : null;
    
    return (
      <div>
        {label && <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>{label}</label>}
        <div style={{ display: 'flex', alignItems: type === 'textarea' ? 'flex-start' : 'center', gap: '8px' }}>
          {isEditing ? (
            <>
              {type === 'select' ? (
                <div style={{ position: 'relative', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '6px 8px', background: 'var(--surface)', border: '1px solid var(--green-600)', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: '12px', color: 'var(--text)' }}
                    onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <span>{editDealValue || 'Select...'}</span><ChevronDown size={14} />
                  </div>
                  {dropdownOpen && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10, marginTop: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                      {options.map(opt => (
                        <button key={opt} onClick={() => { setEditDealValue(opt); setDropdownOpen(false); }}
                          style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '12px', color: 'var(--text)', borderBottom: '1px solid var(--border-soft)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                        >{opt}</button>
                      ))}
                      {(fieldName === 'deal_type' || fieldName === 'deal_stage' || fieldName === 'contact_owner') && (user?.role?.toLowerCase().trim() === 'operation' || user?.role?.toLowerCase().trim() === 'operations') && (
                        <button onClick={() => { setShowCustomInput(true); setDropdownOpen(false); }}
                          style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: 'var(--green-600)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--green-100)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                        >+ Custom</button>
                      )}
                    </div>
                  )}
                  {showCustomInput && (
                    <div style={{ marginTop: '8px', padding: '8px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 'var(--r)' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input type="text" value={customValue} onChange={(e) => setCustomValue(e.target.value)} placeholder={`Enter custom ${fieldName.replace('_', ' ')}...`}
                          style={{ flex: 1, padding: '6px 8px', border: '1px solid var(--green-300)', borderRadius: 'var(--r)', fontSize: '12px', background: 'var(--surface)', color: 'var(--text)' }} autoFocus />
                        <button onClick={() => { if (customValue.trim()) { setEditDealValue(customValue.trim()); if (fieldName === 'deal_type') setPredefinedDealTypes([...predefinedDealTypes, customValue.trim()]); if (fieldName === 'deal_stage') setPredefinedDealStages([...predefinedDealStages, customValue.trim()]); if (fieldName === 'contact_owner') setPredefinedContactOwners([...predefinedContactOwners, customValue.trim()]); setCustomValue(''); setShowCustomInput(false); } }}
                          style={{ padding: '6px 12px', background: 'var(--green-600)', color: 'white', border: 'none', borderRadius: 'var(--r)', fontSize: '11px', cursor: 'pointer', fontWeight: '500' }}>Apply</button>
                        <button onClick={() => { setCustomValue(''); setShowCustomInput(false); }}
                          style={{ padding: '6px 12px', background: 'var(--gray-200)', color: 'var(--text)', border: 'none', borderRadius: 'var(--r)', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ) : type === 'date' ? (
                <input
                  type="date"
                  value={editDealValue}
                  onChange={(e) => setEditDealValue(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    border: '1px solid var(--green-600)',
                    borderRadius: 'var(--r)',
                    fontSize: '12px',
                    outline: 'none',
                    background: 'var(--surface)',
                    color: 'var(--text)'
                  }}
                  autoFocus
                />
              ) : type === 'number' ? (
                <input
                  type="number"
                  value={editDealValue}
                  onChange={(e) => setEditDealValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveDealEdit();
                    if (e.key === 'Escape') cancelDealEdit();
                  }}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    border: '1px solid var(--green-600)',
                    borderRadius: 'var(--r)',
                    fontSize: '12px',
                    outline: 'none',
                    background: 'var(--surface)',
                    color: 'var(--text)'
                  }}
                  autoFocus
                />
              ) : type === 'textarea' ? (
                <textarea
                  ref={textareaRef}
                  value={localTextareaValue}
                  onChange={handleTextareaChange}
                  rows={4}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    border: '1px solid var(--green-600)',
                    borderRadius: 'var(--r)',
                    fontSize: '12px',
                    outline: 'none',
                    resize: 'vertical',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    fontFamily: 'inherit'
                  }}
                  autoFocus
                />
              ) : (
                <input
                  type={type}
                  value={editDealValue}
                  onChange={(e) => setEditDealValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveDealEdit();
                    if (e.key === 'Escape') cancelDealEdit();
                  }}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    border: '1px solid var(--green-600)',
                    borderRadius: 'var(--r)',
                    fontSize: '12px',
                    outline: 'none',
                    background: 'var(--surface)',
                    color: 'var(--text)'
                  }}
                  autoFocus
                />
              )}
              <button
                onClick={saveDealEdit}
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
                onClick={cancelDealEdit}
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
              onClick={() => startDealEditing(fieldName, value)}
              style={{ 
                flex: 1, 
                padding: '8px 12px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r)',
                color: value ? 'var(--text)' : 'var(--text-3)', 
                fontSize: '12px',
                fontStyle: value ? 'normal' : 'italic',
                minHeight: '20px',
                display: 'flex',
                alignItems: type === 'textarea' ? 'flex-start' : 'center'
              }}
            >
              {value || '-'}
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleFieldUpdate = async (leadId, fieldName, newValue) => {
    // Show updating message
    toast.loading('Updating...', { id: 'field-update' });

    try {
      const currentUserName = user?.name || user?.phone_number || 'operation';
      let url;

      // Account-related fields use the update-account API
      if (fieldName === 'accountName' || fieldName === 'accountType' || fieldName === 'website') {
        const accountName = fieldName === 'accountName' ? newValue : selectedUser?.accountName || '';
        const accountType = fieldName === 'accountType' ? newValue : selectedUser?.accountType || '';
        const website = fieldName === 'website' ? newValue : selectedUser?.website || '';
        const dealPresent = selectedUser?.dealPresent ? 1 : 0;
        const owner = selectedUser?.contactOwner || currentUserName;

        url = `${import.meta.env.VITE_UPDATE_ACCOUNT_API_URL}?id=${leadId}&account_name=${encodeURIComponent(accountName)}&account_type=${encodeURIComponent(accountType)}&website=${encodeURIComponent(website)}&deal_present=${dealPresent}&status=active&owner=${encodeURIComponent(owner)}&user=${encodeURIComponent(currentUserName)}`;
      } else if (fieldName === 'contactName') {
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
        url = `${import.meta.env.VITE_UPDATE_ACCOUNT_API_URL}?id=${leadId}&description=${encodeURIComponent(newValue)}&user=${encodeURIComponent(currentUserName)}`;
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
          // Auto-refresh timeline for this lead
          fetchTimeline(leadId);
        }
        const fieldMessages = {
          contactName: 'Contact name updated', phoneNumber: 'Phone number updated',
          email: 'Email updated', companyName: 'Company name updated',
          alternateNumber: 'Alternate phone number updated', city: 'City updated',
          state: 'State updated', country: 'Country updated', leadStatus: 'Lead status updated',
          industry: 'Industry updated', contactOwner: 'Contact owner updated',
          leadSource: 'Lead source updated', tags: 'Tags updated',
          notes: 'Notes updated', description: 'Description updated',
          accountName: 'Account name updated', accountType: 'Account type updated', website: 'Website updated'
        };
        toast.success(fieldMessages[fieldName] || `${fieldName} updated`, { id: 'field-update' });
      } else {
        console.error('API returned unsuccessful:', result);
        toast.error('Failed to update field', { id: 'field-update' });
      }
    } catch (err) {
      console.error('Error updating field:', err);
      toast.error('Failed to update field', { id: 'field-update' });
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
      opp.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.contactOwner.toLowerCase().includes(searchTerm.toLowerCase());
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
              onClick={() => setViewMode(viewMode === 'table' ? 'kanban' : 'table')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: viewMode === 'table' ? '#3b82f6' : '#10b981', color: 'white', border: 'none', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
            >
              {viewMode === 'table' ? <TrendingUp size={16} /> : <Activity size={16} />}
              {viewMode === 'table' ? 'Deal Pipeline' : 'Table View'}
            </button>
            <button
              onClick={handleCSVImport}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--green-600)', color: 'white', border: 'none', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
            >
              <Upload size={16} /> Import CSV
            </button>
          </div>
        </div>

        <>
        {/* Search and Filter - Only show in table view */}
        {viewMode === 'table' && (
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
            onClick={async () => {
              try {
                setIsDownloadingCSV(true);
                
                // Check if filters are applied
                if (isFilterApplied) {
                  // Collect all active filters
                  const activeFilters = [];

                  // Add contact owner filter if configured
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

                  // Add lead status filter if configured
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

                  // Add tag filter if configured
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

                  // Add mailing state filter if configured
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

                  // Add mailing country filter if configured
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

                  // Add created_by filter if configured
                  const createdByProp = selectedProperties.find(prop => prop.property === 'created_by');
                  if (createdByProp && createdByProp.value) {
                    activeFilters.push({
                      property: 'created_by',
                      value: createdByProp.value,
                      operator: createdByProp.operator || 'is'
                    });
                  }

                  // Add modified_by filter if configured
                  const modifiedByProp = selectedProperties.find(prop => prop.property === 'modified_by');
                  if (modifiedByProp && modifiedByProp.value) {
                    activeFilters.push({
                      property: 'modified_by',
                      value: modifiedByProp.value,
                      operator: modifiedByProp.operator || 'is'
                    });
                  }

                  // Add city filter if configured
                  const cityProp = selectedProperties.find(prop => prop.property === 'mailing_city');
                  if (cityProp && cityProp.value) {
                    activeFilters.push({
                      property: 'mailing_city',
                      value: cityProp.value,
                      operator: cityProp.operator || 'is'
                    });
                  }

                  // Add lead_source filter if configured
                  const leadSourceProp = selectedProperties.find(prop => prop.property === 'lead_source');
                  if (leadSourceProp && leadSourceProp.value) {
                    activeFilters.push({
                      property: 'lead_source',
                      value: leadSourceProp.value,
                      operator: leadSourceProp.operator || 'is'
                    });
                  }

                  // Add description filter if configured
                  const descriptionProp = selectedProperties.find(prop => prop.property === 'description');
                  if (descriptionProp && descriptionProp.value) {
                    activeFilters.push({
                      property: 'description',
                      value: descriptionProp.value,
                      operator: descriptionProp.operator || 'is'
                    });
                  }

                  // Add created_time filter if configured
                  const createdTimeProp = selectedProperties.find(prop => prop.property === 'created_time');
                  if (createdTimeProp) {
                    if ((createdTimeProp.dateOperator === 'on' || createdTimeProp.dateOperator === 'before' || createdTimeProp.dateOperator === 'after') && createdTimeProp.value) {
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

                  // Download filtered CSV
                  if (activeFilters.length > 0) {
                    await handleFilteredCSVDownload(activeFilters);
                  } else {
                    // Fallback to regular download if no active filters
                    toast.loading('Downloading CSV...');
                    const currentUser = user?.name || user?.phone_number || 'operation';
                    const response = await fetch(`${import.meta.env.VITE_DOWNLOAD_ACCOUNT_CSV_API_URL}?user=${encodeURIComponent(currentUser)}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
                    if (!response.ok) throw new Error('Failed to download CSV');
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = 'accounts.csv';
                    document.body.appendChild(a); a.click();
                    window.URL.revokeObjectURL(url); document.body.removeChild(a);
                    toast.dismiss();
                    toast.success('CSV downloaded successfully');
                  }
                } else {
                  // Regular download without filters
                  toast.loading('Downloading CSV...');
                  const currentUser = user?.name || user?.phone_number || 'operation';
                  const response = await fetch(`${import.meta.env.VITE_DOWNLOAD_ACCOUNT_CSV_API_URL}?user=${encodeURIComponent(currentUser)}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
                  if (!response.ok) throw new Error('Failed to download CSV');
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = 'accounts.csv';
                  document.body.appendChild(a); a.click();
                  window.URL.revokeObjectURL(url); document.body.removeChild(a);
                  toast.dismiss();
                  toast.success('CSV downloaded successfully');
                }
              } catch (error) {
                console.error('Error downloading CSV:', error);
                toast.error('Failed to download CSV');
              } finally {
                setIsDownloadingCSV(false);
              }
            }}
            disabled={isDownloadingCSV}
            className="btn btn-sm"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '5px 10px', background: 'var(--green-600)', color: '#fff', border: '1px solid var(--green-600)', borderRadius: 'var(--r)', cursor: isDownloadingCSV ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: isDownloadingCSV ? 0.6 : 1 }}
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
        )}

        {/* Filtered Results Display */}
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
                ({opportunities.length} records found)
              </span>
            </div>
            <button
              onClick={() => {
                setIsFilterApplied(false);
                setCurrentFilterCriteria('');
                setSelectedProperties([]);
                setCurrentProperty('');
                setNewThisWeekFilter(false);
                setSearchTerm('');
                // Refetch all opportunities to show unfiltered results
                const fetchOpportunities = async () => {
                  try {
                    setLoading(true);
                    const currentUserName = user?.name || user?.phone_number || 'operation';
                    const apiUrl = import.meta.env.VITE_ACCOUNTS_API_URL;
                    if (!apiUrl) {
                      setOpportunities(getMockOpportunities());
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
                      dealPresent: opp.deal_present || false,
                      website: opp.website || '',
                      accountType: opp.account_type || '',
                      modifiedTime: opp.modified_time || ''
                    }));
                    setOpportunities(transformedOpportunities);
                  } catch (err) {
                    console.error('Error fetching opportunities:', err);
                    setOpportunities(getMockOpportunities());
                  } finally {
                    setLoading(false);
                  }
                };
                fetchOpportunities();
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

        {/* More Dropdown Button - Shows when items are selected */}
        {selectedRows.length > 0 && (
          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>{selectedRows.length} item(s) selected</span>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--green-600)', color: 'white', border: 'none', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                >
                  More <ChevronDown size={16} />
                </button>
                {showMoreDropdown && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 100, minWidth: '160px' }}>
                    <button
                      onClick={() => {
                        setShowMoreDropdown(false);
                        setShowUpdateFieldsModal(true);
                        setSelectedFieldToUpdate('');
                        setUpdateFieldValue('');
                      }}
                      style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: 'var(--text)', borderBottom: '1px solid var(--border-soft)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-100)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      Update Fields
                    </button>
                    {user?.role === 'operation' && (
                      <button
                        onClick={() => {
                          setShowMoreDropdown(false);
                          setShowDeleteConfirmModal(true);
                        }}
                        style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#ef4444' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--red-50)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Opportunity Table - Only show in table view */}
        {viewMode === 'table' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', overflowX: 'auto', maxWidth: '100%', flex: 1 }}>
            <div style={{ overflowX: 'auto', maxWidth: '100%', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', fontSize: '13px', height: '100%' }}>
              <thead>
                <tr style={{ background: 'var(--gray-100)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '2px solid var(--border)', position: 'sticky', left: 0, backgroundColor: 'var(--gray-100)', zIndex: 11 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" checked={selectedRows.length === currentOpportunities.length && currentOpportunities.length > 0 && currentOpportunities.every(opp => selectedRows.includes(opp.id))} onChange={(e) => { if (e.target.checked) setSelectedRows(currentOpportunities.map(o => o.id)); else setSelectedRows(selectedRows.filter(id => !currentOpportunities.find(opp => opp.id === id))); }} style={{ cursor: 'pointer' }} />
                      <span>Contact Name</span>
                    </div>
                  </th>
                  {['Phone Number','Alternate Number','Email','Company Name','Account Name','Account Number','No. of Deals','Account Type','Contact Owner','City','State','Country','Tags','Description','Created Time','Industry','Created By','Modified By','Last Activity','Modified Time'].map(h => (
                    <th key={h} style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>{h}</th>
                  ))}
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
                          <button onClick={() => { setSelectedUser(opp); setShowUserModal(true); fetchTimeline(opp.id); fetchActivities(opp.id); fetchDeals(opp.id); }} style={{ background: 'none', border: 'none', color: 'var(--blue-600)', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px', fontWeight: '500', padding: 0, textAlign: 'left' }}>
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
                        <span style={{ color: dealCounts[opp.id] > 0 ? '#10b981' : '#ef4444', fontSize: '13px', fontWeight: '500' }}>
                          {dealCounts[opp.id] || 0}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>{opp.accountType || '-'}</td>
                      <td style={{ padding: '16px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>{opp.contactOwner}</td>
                      <td style={{ padding: '16px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>{opp.city}</td>
                      <td style={{ padding: '16px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>{opp.state}</td>
                      <td style={{ padding: '16px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}>{opp.country}</td>
                      <td style={{ padding: '16px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)' }}><span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{opp.tags}</span></td>
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
                      <td style={{ padding: '16px', color: 'var(--text)', textAlign: 'left' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{opp.modifiedTime ? new Date(opp.modifiedTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb', background: '#fff', display: 'flex', gap: '24px', fontSize: '13px', color: '#4b5563', flexShrink: 0 }}>
            <span style={{ whiteSpace: 'nowrap' }}>
              Total{' '}
              <span style={{ color: '#9ca3af', margin: '0 4px' }}>•</span>{' '}
              <strong style={{ color: '#111827', fontWeight: 600 }}>{opportunities.length}</strong>
            </span>

            {/* Total with deals - clickable */}
            {dealFilter === 'with_deals' ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleDealFilterClick('with_deals')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: 'none',
                    background: '#dcfce7',
                    color: '#374151',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Total with deals{' '}
                  <span style={{ color: '#9ca3af', margin: '0 4px' }}>•</span>{' '}
                  <strong style={{ color: '#111827', fontWeight: 600 }}>{opportunities.filter(opp => (dealCounts[opp.id] || 0) > 0).length}</strong>
                </button>
                <button
                  type="button"
                  onClick={() => handleDealFilterClick('all')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#2563eb',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontFamily: 'inherit'
                  }}
                >
                  Clear
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleDealFilterClick('with_deals')}
                title="Filter by accounts with deals"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#4b5563',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#111827'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#4b5563'; }}
              >
                Total with deals{' '}
                <span style={{ color: '#9ca3af', margin: '0 4px' }}>•</span>{' '}
                <strong style={{ color: '#111827', fontWeight: 600 }}>{opportunities.filter(opp => (dealCounts[opp.id] || 0) > 0).length}</strong>
              </button>
            )}

            {/* Total without deals - clickable */}
            {dealFilter === 'without_deals' ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleDealFilterClick('without_deals')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: 'none',
                    background: '#dcfce7',
                    color: '#374151',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Total without deals{' '}
                  <span style={{ color: '#9ca3af', margin: '0 4px' }}>•</span>{' '}
                  <strong style={{ color: '#111827', fontWeight: 600 }}>{opportunities.filter(opp => (dealCounts[opp.id] || 0) === 0).length}</strong>
                </button>
                <button
                  type="button"
                  onClick={() => handleDealFilterClick('all')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#2563eb',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontFamily: 'inherit'
                  }}
                >
                  Clear
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleDealFilterClick('without_deals')}
                title="Filter by accounts without deals"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#4b5563',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#111827'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#4b5563'; }}
              >
                Total without deals{' '}
                <span style={{ color: '#9ca3af', margin: '0 4px' }}>•</span>{' '}
                <strong style={{ color: '#111827', fontWeight: 600 }}>{opportunities.filter(opp => (dealCounts[opp.id] || 0) === 0).length}</strong>
              </button>
            )}
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
        )}

        {/* Kanban Dashboard View */}
        {viewMode === 'kanban' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Kanban Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px', borderBottom: '1px solid var(--border)', background: 'white', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'var(--text)' }}>Sales Pipeline</h2>
                {salesFiltersApplied && (
                  <span style={{ padding: '4px 12px', background: '#dbeafe', color: '#1e40af', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>
                    Filters Applied
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b'
                  }} />
                  <input
                    type="text"
                    placeholder="Search deals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '250px',
                      padding: '8px 12px 8px 36px',
                      border: '1px solid #d1d5db',
                      borderRadius: 'var(--r)',
                      fontSize: '14px',
                      background: 'white',
                      color: '#374151'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setSalesFilterSidebarOpen(!salesFilterSidebarOpen)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: salesFilterSidebarOpen ? '#3b82f6' : 'white', color: salesFilterSidebarOpen ? 'white' : '#374151', border: '1px solid #d1d5db', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                  >
                    <Filter size={16} />
                    Filters
                  </button>
                  <button
                    onClick={() => setPipelineViewMode(pipelineViewMode === 'kanban' ? 'list' : 'kanban')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: pipelineViewMode === 'kanban' ? '#3b82f6' : '#10b981', color: 'white', border: 'none', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                  >
                    {pipelineViewMode === 'kanban' ? <List size={16} /> : <Activity size={16} />}
                    {pipelineViewMode === 'kanban' ? 'List View' : 'Kanban View'}
                  </button>
                </div>
              </div>
            </div>

            {/* Sales Pipeline Filter Sidebar */}
            {salesFilterSidebarOpen && (
              <>
                <div style={{
                  position: 'absolute',
                  top: '73px',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 999
                }} onClick={() => setSalesFilterSidebarOpen(false)} />
                <div style={{
                  position: 'absolute',
                  top: '73px',
                  left: 0,
                  bottom: 0,
                  width: '320px',
                  background: 'white',
                  borderRight: '1px solid var(--border)',
                  zIndex: 1000,
                  overflowY: 'auto',
                  boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    padding: '16px',
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--surface)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '16px', fontWeight: '600' }}>Filters</h3>
                      <button
                        onClick={() => setSalesFilterSidebarOpen(false)}
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
                  </div>

                  <div style={{ padding: '16px' }}>
                    {/* Property Selector */}
                    <div style={{ marginBottom: '16px' }}>
                      <select
                        value={currentSalesProperty}
                        onChange={(e) => {
                          const property = e.target.value;
                          setCurrentSalesProperty(property);
                          if (property && !selectedSalesProperties.find(p => p.property === property)) {
                            setSelectedSalesProperties([...selectedSalesProperties, { 
                              property, 
                              operator: property === 'deal_name' ? 'contains' : 'is',
                              value: '', 
                              value2: '', 
                              fromDate: '', 
                              toDate: '', 
                              period: '', 
                              dateOperator: 'on',
                              searchTerm: '',
                              dropdownOpen: false
                            }]);
                          }
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
                        <option value="">Add Filter Property</option>
                        <option value="deal_owner">Deal Owner</option>
                        <option value="deal_name">Deal Name</option>
                        <option value="amount">Amount</option>
                        <option value="closing_date">Closing Date</option>
                        <option value="deal_type">Deal Type</option>
                        <option value="deal_stage">Deal Stage</option>
                        <option value="created_by">Created By</option>
                        <option value="created_time">Created Time</option>
                        <option value="modified_by">Modified By</option>
                        <option value="modified_time">Modified Time</option>
                      </select>
                    </div>

                    {/* Selected Properties */}
                    {selectedSalesProperties.map((prop, index) => (
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
                              setSelectedSalesProperties(selectedSalesProperties.filter((_, i) => i !== index));
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

                        {/* Deal Owner - User dropdown with is/isn't */}
                        {prop.property === 'deal_owner' && (
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ minWidth: '80px' }}>
                              <select
                                value={prop.operator || 'is'}
                                onChange={(e) => {
                                  const updated = [...selectedSalesProperties];
                                  updated[index].operator = e.target.value;
                                  setSelectedSalesProperties(updated);
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
                                  placeholder="Search owners..."
                                  value={prop.searchTerm || ''}
                                  onChange={(e) => {
                                    const updated = [...selectedSalesProperties];
                                    updated[index].searchTerm = e.target.value;
                                    setSelectedSalesProperties(updated);
                                  }}
                                  onFocus={() => {
                                    const updated = [...selectedSalesProperties];
                                    updated[index].dropdownOpen = true;
                                    setSelectedSalesProperties(updated);
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
                                    {predefinedContactOwners.filter(owner => !prop.searchTerm || owner.toLowerCase().includes(prop.searchTerm.toLowerCase()))
                                      .map(owner => (
                                        <div
                                          key={owner}
                                          onClick={() => {
                                            const updated = [...selectedSalesProperties];
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
                                            setSelectedSalesProperties(updated);
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
                                    {(user?.role?.toLowerCase().trim() === 'operation' || user?.role?.toLowerCase().trim() === 'operations') && (
                                    <div
                                      onClick={() => {
                                        const updated = [...selectedSalesProperties];
                                        updated[index].showCustomInput = true;
                                        updated[index].dropdownOpen = false;
                                        setSelectedSalesProperties(updated);
                                      }}
                                      style={{
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        color: 'var(--green-600)',
                                        borderBottom: 'none'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--green-100)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                      }}
                                    >
                                      + Custom Owner
                                    </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              {prop.showCustomInput && (
  <div style={{ marginTop: '8px', padding: '10px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 'var(--r)', position: 'relative', zIndex: 20 }}>
    <input 
      type="text" 
      value={prop.customValue || ''} 
      onChange={(e) => {
        const updated = [...selectedSalesProperties];
        updated[index].customValue = e.target.value;
        setSelectedSalesProperties(updated);
      }} 
      placeholder="Enter custom owner..."
      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--green-300)', borderRadius: 'var(--r)', fontSize: '13px', background: 'var(--surface)', color: 'var(--text)', marginBottom: '8px', boxSizing: 'border-box' }} 
      autoFocus 
    />
    <div style={{ display: 'flex', gap: '8px' }}>
      <button 
        onClick={() => { 
          if (prop.customValue && prop.customValue.trim()) { 
            const updated = [...selectedSalesProperties];
            const currentValues = updated[index].value ? updated[index].value.split(',') : [];
            currentValues.push(prop.customValue.trim());
            updated[index].value = currentValues.join(',');
            updated[index].customValue = '';
            updated[index].showCustomInput = false;
            setSelectedSalesProperties(updated);
          } 
        }}
        style={{ flex: 1, padding: '8px 12px', background: 'var(--green-600)', color: 'white', border: 'none', borderRadius: 'var(--r)', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}
      >Apply</button>
      <button 
        onClick={() => { 
          const updated = [...selectedSalesProperties];
          updated[index].customValue = '';
          updated[index].showCustomInput = false;
          setSelectedSalesProperties(updated);
        }}
        style={{ flex: 1, padding: '8px 12px', background: 'var(--gray-200)', color: 'var(--text)', border: 'none', borderRadius: 'var(--r)', fontSize: '13px', cursor: 'pointer' }}
      >Cancel</button>
    </div>
  </div>
)}
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
                                          const updated = [...selectedSalesProperties];
                                          const currentValues = updated[index].value ? updated[index].value.split(',') : [];
                                          const indexToRemove = currentValues.indexOf(owner);
                                          if (indexToRemove > -1) {
                                            currentValues.splice(indexToRemove, 1);
                                            updated[index].value = currentValues.join(',');
                                            setSelectedSalesProperties(updated);
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

                        {/* Deal Name - Search box with operators */}
                        {prop.property === 'deal_name' && (
                          <div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input
                                type="text"
                                value={prop.searchTerm || prop.value || ''}
                                onChange={(e) => {
                                  const updated = [...selectedSalesProperties];
                                  updated[index].searchTerm = e.target.value;
                                  setSelectedSalesProperties(updated);
                                }}
                                placeholder="Search deal name..."
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
                                value={prop.operator || 'contains'}
                                onChange={(e) => {
                                  const updated = [...selectedSalesProperties];
                                  updated[index].operator = e.target.value;
                                  setSelectedSalesProperties(updated);
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
                                <option value="contains">contains</option>
                                <option value="equals">equals</option>
                                <option value="starts_with">starts with</option>
                              </select>
                            </div>
                            {prop.searchTerm && (
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
                                  {prop.searchTerm}
                                  <button
                                    onClick={() => {
                                      const updated = [...selectedSalesProperties];
                                      updated[index].value = '';
                                      updated[index].searchTerm = '';
                                      setSelectedSalesProperties(updated);
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
                                    title={`Remove ${prop.searchTerm}`}
                                  >
                                    ×
                                  </button>
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Amount - Number filter with operators */}
                        {prop.property === 'amount' && (
                          <div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                              <select
                                value={prop.operator || 'equals'}
                                onChange={(e) => {
                                  const updated = [...selectedSalesProperties];
                                  updated[index].operator = e.target.value;
                                  setSelectedSalesProperties(updated);
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
                                <option>Choose a value</option>
                                <option value="greater_than">greater than</option>
                                <option value="less_than">less than</option>
                                <option value="between">between</option>
                              </select>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input
                                type="number"
                                placeholder="Amount"
                                value={prop.value || ''}
                                onChange={(e) => {
                                  const updated = [...selectedSalesProperties];
                                  updated[index].value = e.target.value;
                                  setSelectedSalesProperties(updated);
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
                              />
                              {prop.operator === 'between' && (
                                <input
                                  type="number"
                                  placeholder="To"
                                  value={prop.value2 || ''}
                                  onChange={(e) => {
                                    const updated = [...selectedSalesProperties];
                                    updated[index].value2 = e.target.value;
                                    setSelectedSalesProperties(updated);
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
                                />
                              )}
                            </div>
                          </div>
                        )}

                        {/* Closing Date - Date filter with operators */}
                        {prop.property === 'closing_date' && (
                          <div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                              <select
                                value={prop.dateOperator || 'on'}
                                onChange={(e) => {
                                  const updated = [...selectedSalesProperties];
                                  updated[index].dateOperator = e.target.value;
                                  updated[index].value = '';
                                  updated[index].fromDate = '';
                                  updated[index].toDate = '';
                                  setSelectedSalesProperties(updated);
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
                                <option value="on">on</option>
                                <option value="before">before</option>
                                <option value="after">after</option>
                                <option value="between">between</option>
                                <option value="in_the_last">in the last</option>
                              </select>
                            </div>
                            {['on', 'before', 'after'].includes(prop.dateOperator) && (
                              <input
                                type="date"
                                value={prop.value || ''}
                                onChange={(e) => {
                                  const updated = [...selectedSalesProperties];
                                  updated[index].value = e.target.value;
                                  setSelectedSalesProperties(updated);
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
                            {prop.dateOperator === 'between' && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <div style={{ flex: 1 }}>
                                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-3)' }}>From</label>
                                  <input
                                    type="date"
                                    value={prop.fromDate || ''}
                                    onChange={(e) => {
                                      const updated = [...selectedSalesProperties];
                                      updated[index].fromDate = e.target.value;
                                      setSelectedSalesProperties(updated);
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
                                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-3)' }}>To</label>
                                  <input
                                    type="date"
                                    value={prop.toDate || ''}
                                    onChange={(e) => {
                                      const updated = [...selectedSalesProperties];
                                      updated[index].toDate = e.target.value;
                                      setSelectedSalesProperties(updated);
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
                            {prop.dateOperator === 'in_the_last' && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <select
                                  value={prop.period || ''}
                                  onChange={(e) => {
                                    const updated = [...selectedSalesProperties];
                                    updated[index].period = e.target.value;
                                    setSelectedSalesProperties(updated);
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
                                  <option value="">Select period</option>
                                  <option value="day">Day</option>
                                  <option value="week">Week</option>
                                  <option value="month">Month</option>
                                </select>
                                <input
                                  type="number"
                                  value={prop.count || ''}
                                  onChange={(e) => {
                                    const updated = [...selectedSalesProperties];
                                    updated[index].count = e.target.value;
                                    setSelectedSalesProperties(updated);
                                  }}
                                  placeholder="Count"
                                  min="1"
                                  style={{
                                    width: '80px',
                                    padding: '8px 12px',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--r)',
                                    fontSize: '13px',
                                    background: 'var(--surface)',
                                    color: 'var(--text)'
                                  }}
                                />
                              </div>
                            )}
                            
                          </div>
                        )}

                        {/* Deal Type - Dropdown with is/isn't */}
                        {prop.property === 'deal_type' && (
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ minWidth: '80px' }}>
                              <select
                                value={prop.operator || 'is'}
                                onChange={(e) => {
                                  const updated = [...selectedSalesProperties];
                                  updated[index].operator = e.target.value;
                                  setSelectedSalesProperties(updated);
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
                                <option value="is not">is not</option>
                              </select>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ position: 'relative' }}>
                                <input
                                  type="text"
                                  placeholder="Search deal types..."
                                  value={prop.searchTerm || ''}
                                  onChange={(e) => {
                                    const updated = [...selectedSalesProperties];
                                    updated[index].searchTerm = e.target.value;
                                    setSelectedSalesProperties(updated);
                                  }}
                                  onFocus={() => {
                                    const updated = [...selectedSalesProperties];
                                    updated[index].dropdownOpen = true;
                                    setSelectedSalesProperties(updated);
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
                                    {['Trail', 'Starter', 'Growth', 'Entrepreneur'].filter(type => !prop.searchTerm || type.toLowerCase().includes(prop.searchTerm.toLowerCase()))
                                      .map(type => (
                                        <div
                                          key={type}
                                          onClick={() => {
                                            const updated = [...selectedSalesProperties];
                                            const currentValues = updated[index].value ? updated[index].value.split(',') : [];
                                            
                                            if (currentValues.includes(type)) {
                                              const indexToRemove = currentValues.indexOf(type);
                                              currentValues.splice(indexToRemove, 1);
                                            } else {
                                              currentValues.push(type);
                                            }
                                            
                                            updated[index].value = currentValues.join(',');
                                            updated[index].dropdownOpen = false;
                                            updated[index].searchTerm = '';
                                            setSelectedSalesProperties(updated);
                                          }}
                                          style={{
                                            padding: '8px 12px',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            color: 'var(--text)',
                                            borderBottom: '1px solid var(--border-soft)',
                                            backgroundColor: prop.value && prop.value.includes(type) ? 'var(--blue-600)15' : 'transparent'
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'var(--gray-100)';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.background = prop.value && prop.value.includes(type) ? 'var(--blue-600)15' : 'transparent';
                                          }}
                                        >
                                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span>{type}</span>
                                            {prop.value && prop.value.includes(type) && (
                                              <span style={{ color: 'var(--blue-600)', fontSize: '12px' }}>✓</span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    {(user?.role?.toLowerCase().trim() === 'operation' || user?.role?.toLowerCase().trim() === 'operations') && (
                                    <div
                                      onClick={() => {
                                        const updated = [...selectedSalesProperties];
                                        updated[index].showCustomInput = true;
                                        updated[index].dropdownOpen = false;
                                        setSelectedSalesProperties(updated);
                                      }}
                                      style={{
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        color: 'var(--green-600)',
                                        borderBottom: 'none'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--green-100)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                      }}
                                    >
                                      + Custom Type
                                    </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              {prop.showCustomInput && (
  <div style={{ marginTop: '8px', padding: '10px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 'var(--r)', position: 'relative', zIndex: 20 }}>
    <input 
      type="text" 
      value={prop.customValue || ''} 
      onChange={(e) => {
        const updated = [...selectedSalesProperties];
        updated[index].customValue = e.target.value;
        setSelectedSalesProperties(updated);
      }} 
      placeholder="Enter custom deal type..."
      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--green-300)', borderRadius: 'var(--r)', fontSize: '13px', background: 'var(--surface)', color: 'var(--text)', marginBottom: '8px', boxSizing: 'border-box' }} 
      autoFocus 
    />
    <div style={{ display: 'flex', gap: '8px' }}>
      <button 
        onClick={() => { 
          if (prop.customValue && prop.customValue.trim()) { 
            const updated = [...selectedSalesProperties];
            const currentValues = updated[index].value ? updated[index].value.split(',') : [];
            currentValues.push(prop.customValue.trim());
            updated[index].value = currentValues.join(',');
            updated[index].customValue = '';
            updated[index].showCustomInput = false;
            setSelectedSalesProperties(updated);
          } 
        }}
        style={{ flex: 1, padding: '8px 12px', background: 'var(--green-600)', color: 'white', border: 'none', borderRadius: 'var(--r)', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}
      >Apply</button>
      <button 
        onClick={() => { 
          const updated = [...selectedSalesProperties];
          updated[index].customValue = '';
          updated[index].showCustomInput = false;
          setSelectedSalesProperties(updated);
        }}
        style={{ flex: 1, padding: '8px 12px', background: 'var(--gray-200)', color: 'var(--text)', border: 'none', borderRadius: 'var(--r)', fontSize: '13px', cursor: 'pointer' }}
      >Cancel</button>
    </div>
  </div>
)}
                              {prop.value && (
                                <div style={{ 
                                  marginTop: '8px', 
                                  fontSize: '12px', 
                                  color: 'var(--text-3)',
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: '4px'
                                }}>
                                  {prop.value.split(',').map((type, i) => (
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
                                      {type}
                                      <button
                                        onClick={() => {
                                          const updated = [...selectedSalesProperties];
                                          const currentValues = updated[index].value ? updated[index].value.split(',') : [];
                                          const indexToRemove = currentValues.indexOf(type);
                                          if (indexToRemove > -1) {
                                            currentValues.splice(indexToRemove, 1);
                                            updated[index].value = currentValues.join(',');
                                            setSelectedSalesProperties(updated);
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
                                        title={`Remove ${type}`}
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

                        {/* Deal Stage - Dropdown with is/isn't */}
                        {prop.property === 'deal_stage' && (
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ minWidth: '80px' }}>
                              <select
                                value={prop.operator || 'is'}
                                onChange={(e) => {
                                  const updated = [...selectedSalesProperties];
                                  updated[index].operator = e.target.value;
                                  setSelectedSalesProperties(updated);
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
                                <option value="is not">is not</option>
                              </select>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ position: 'relative' }}>
                                <input
                                  type="text"
                                  placeholder="Search deal stages..."
                                  value={prop.searchTerm || ''}
                                  onChange={(e) => {
                                    const updated = [...selectedSalesProperties];
                                    updated[index].searchTerm = e.target.value;
                                    setSelectedSalesProperties(updated);
                                  }}
                                  onFocus={() => {
                                    const updated = [...selectedSalesProperties];
                                    updated[index].dropdownOpen = true;
                                    setSelectedSalesProperties(updated);
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
                                    {['Proposal', 'Negotiation', 'Closed Won', 'Invoiced', 'Paid', 'Closed Lost'].filter(stage => !prop.searchTerm || stage.toLowerCase().includes(prop.searchTerm.toLowerCase()))
                                      .map(stage => (
                                        <div
                                          key={stage}
                                          onClick={() => {
                                            const updated = [...selectedSalesProperties];
                                            const currentValues = updated[index].value ? updated[index].value.split(',') : [];
                                            
                                            if (currentValues.includes(stage)) {
                                              const indexToRemove = currentValues.indexOf(stage);
                                              currentValues.splice(indexToRemove, 1);
                                            } else {
                                              currentValues.push(stage);
                                            }
                                            
                                            updated[index].value = currentValues.join(',');
                                            updated[index].dropdownOpen = false;
                                            updated[index].searchTerm = '';
                                            setSelectedSalesProperties(updated);
                                          }}
                                          style={{
                                            padding: '8px 12px',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            color: 'var(--text)',
                                            borderBottom: '1px solid var(--border-soft)',
                                            backgroundColor: prop.value && prop.value.includes(stage) ? 'var(--blue-600)15' : 'transparent'
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'var(--gray-100)';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.background = prop.value && prop.value.includes(stage) ? 'var(--blue-600)15' : 'transparent';
                                          }}
                                        >
                                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span>{stage}</span>
                                            {prop.value && prop.value.includes(stage) && (
                                              <span style={{ color: 'var(--blue-600)', fontSize: '12px' }}>✓</span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    <div
                                      onClick={() => {
                                        if (user?.role?.toLowerCase().trim() !== 'operation' && user?.role?.toLowerCase().trim() !== 'operations') return;
                                        const updated = [...selectedSalesProperties];
                                        updated[index].showCustomInput = true;
                                        updated[index].dropdownOpen = false;
                                        setSelectedSalesProperties(updated);
                                      }}
                                      style={{
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        color: 'var(--green-600)',
                                        borderBottom: 'none'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--green-100)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                      }}
                                    >
                                      + Custom Stage
                                    </div>
                                  </div>
                                )}
                              </div>
                              {prop.showCustomInput && (
  <div style={{ marginTop: '8px', padding: '10px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 'var(--r)', position: 'relative', zIndex: 20 }}>
    <input 
      type="text" 
      value={prop.customValue || ''} 
      onChange={(e) => {
        const updated = [...selectedSalesProperties];
        updated[index].customValue = e.target.value;
        setSelectedSalesProperties(updated);
      }} 
      placeholder="Enter custom deal stage..."
      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--green-300)', borderRadius: 'var(--r)', fontSize: '13px', background: 'var(--surface)', color: 'var(--text)', marginBottom: '8px', boxSizing: 'border-box' }} 
      autoFocus 
    />
    <div style={{ display: 'flex', gap: '8px' }}>
      <button 
        onClick={() => { 
          if (prop.customValue && prop.customValue.trim()) { 
            const updated = [...selectedSalesProperties];
            const currentValues = updated[index].value ? updated[index].value.split(',') : [];
            currentValues.push(prop.customValue.trim());
            updated[index].value = currentValues.join(',');
            updated[index].customValue = '';
            updated[index].showCustomInput = false;
            setSelectedSalesProperties(updated);
          } 
        }}
        style={{ flex: 1, padding: '8px 12px', background: 'var(--green-600)', color: 'white', border: 'none', borderRadius: 'var(--r)', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}
      >Apply</button>
      <button 
        onClick={() => { 
          const updated = [...selectedSalesProperties];
          updated[index].customValue = '';
          updated[index].showCustomInput = false;
          setSelectedSalesProperties(updated);
        }}
        style={{ flex: 1, padding: '8px 12px', background: 'var(--gray-200)', color: 'var(--text)', border: 'none', borderRadius: 'var(--r)', fontSize: '13px', cursor: 'pointer' }}
      >Cancel</button>
    </div>
  </div>
)}
                              {prop.value && (
                                <div style={{ 
                                  marginTop: '8px', 
                                  fontSize: '12px', 
                                  color: 'var(--text-3)',
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: '4px'
                                }}>
                                  {prop.value.split(',').map((stage, i) => (
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
                                      {stage}
                                      <button
                                        onClick={() => {
                                          const updated = [...selectedSalesProperties];
                                          const currentValues = updated[index].value ? updated[index].value.split(',') : [];
                                          const indexToRemove = currentValues.indexOf(stage);
                                          if (indexToRemove > -1) {
                                            currentValues.splice(indexToRemove, 1);
                                            updated[index].value = currentValues.join(',');
                                            setSelectedSalesProperties(updated);
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
                                        title={`Remove ${stage}`}
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

                        {/* Created By - User dropdown with is/isn't */}
                        {prop.property === 'created_by' && (
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ minWidth: '80px' }}>
                              <select
                                value={prop.operator || 'is'}
                                onChange={(e) => {
                                  const updated = [...selectedSalesProperties];
                                  updated[index].operator = e.target.value;
                                  setSelectedSalesProperties(updated);
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
                                  placeholder="Search users..."
                                  value={prop.searchTerm || ''}
                                  onChange={(e) => {
                                    const updated = [...selectedSalesProperties];
                                    updated[index].searchTerm = e.target.value;
                                    setSelectedSalesProperties(updated);
                                  }}
                                  onFocus={() => {
                                    const updated = [...selectedSalesProperties];
                                    updated[index].dropdownOpen = true;
                                    setSelectedSalesProperties(updated);
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
                                    {predefinedContactOwners.filter(owner => !prop.searchTerm || owner.toLowerCase().includes(prop.searchTerm.toLowerCase()))
                                      .map(owner => (
                                        <div
                                          key={owner}
                                          onClick={() => {
                                            const updated = [...selectedSalesProperties];
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
                                            setSelectedSalesProperties(updated);
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
                                    <div
                                      onClick={() => {
                                        if (user?.role?.toLowerCase().trim() !== 'operation' && user?.role?.toLowerCase().trim() !== 'operations') return;
                                        const updated = [...selectedSalesProperties];
                                        updated[index].showCustomInput = true;
                                        updated[index].dropdownOpen = false;
                                        setSelectedSalesProperties(updated);
                                      }}
                                      style={{
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        color: 'var(--green-600)',
                                        borderBottom: 'none'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--green-100)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                      }}
                                    >
                                      + Custom User
                                    </div>
                                  </div>
                                )}
                              </div>
                              {prop.showCustomInput && (
  <div style={{ marginTop: '8px', padding: '10px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 'var(--r)', position: 'relative', zIndex: 20 }}>
    <input 
      type="text" 
      value={prop.customValue || ''} 
      onChange={(e) => {
        const updated = [...selectedSalesProperties];
        updated[index].customValue = e.target.value;
        setSelectedSalesProperties(updated);
      }} 
      placeholder="Enter custom user..."
      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--green-300)', borderRadius: 'var(--r)', fontSize: '13px', background: 'var(--surface)', color: 'var(--text)', marginBottom: '8px', boxSizing: 'border-box' }} 
      autoFocus 
    />
    <div style={{ display: 'flex', gap: '8px' }}>
      <button 
        onClick={() => { 
          if (prop.customValue && prop.customValue.trim()) { 
            const updated = [...selectedSalesProperties];
            const currentValues = updated[index].value ? updated[index].value.split(',') : [];
            currentValues.push(prop.customValue.trim());
            updated[index].value = currentValues.join(',');
            updated[index].customValue = '';
            updated[index].showCustomInput = false;
            setSelectedSalesProperties(updated);
          } 
        }}
        style={{ flex: 1, padding: '8px 12px', background: 'var(--green-600)', color: 'white', border: 'none', borderRadius: 'var(--r)', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}
      >Apply</button>
      <button 
        onClick={() => { 
          const updated = [...selectedSalesProperties];
          updated[index].customValue = '';
          updated[index].showCustomInput = false;
          setSelectedSalesProperties(updated);
        }}
        style={{ flex: 1, padding: '8px 12px', background: 'var(--gray-200)', color: 'var(--text)', border: 'none', borderRadius: 'var(--r)', fontSize: '13px', cursor: 'pointer' }}
      >Cancel</button>
    </div>
  </div>
)}
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
                                          const updated = [...selectedSalesProperties];
                                          const currentValues = updated[index].value ? updated[index].value.split(',') : [];
                                          const indexToRemove = currentValues.indexOf(owner);
                                          if (indexToRemove > -1) {
                                            currentValues.splice(indexToRemove, 1);
                                            updated[index].value = currentValues.join(',');
                                            setSelectedSalesProperties(updated);
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

                        {/* Created Time - Date filter with operators */}
                        {prop.property === 'created_time' && (
                          <div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                              <select
                                value={prop.dateOperator || 'on'}
                                onChange={(e) => {
                                  const updated = [...selectedSalesProperties];
                                  updated[index].dateOperator = e.target.value;
                                  updated[index].value = '';
                                  updated[index].fromDate = '';
                                  updated[index].toDate = '';
                                  setSelectedSalesProperties(updated);
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
                                <option value="on">on</option>
                                <option value="before">before</option>
                                <option value="after">after</option>
                                <option value="between">between</option>
                                <option value="in_the_last">in the last</option>
                              </select>
                            </div>
                            {['on', 'before', 'after'].includes(prop.dateOperator) && (
                              <input
                                type="date"
                                value={prop.value || ''}
                                onChange={(e) => {
                                  const updated = [...selectedSalesProperties];
                                  updated[index].value = e.target.value;
                                  setSelectedSalesProperties(updated);
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
                            {prop.dateOperator === 'between' && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <div style={{ flex: 1 }}>
                                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-3)' }}>From</label>
                                  <input
                                    type="date"
                                    value={prop.fromDate || ''}
                                    onChange={(e) => {
                                      const updated = [...selectedSalesProperties];
                                      updated[index].fromDate = e.target.value;
                                      setSelectedSalesProperties(updated);
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
                                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-3)' }}>To</label>
                                  <input
                                    type="date"
                                    value={prop.toDate || ''}
                                    onChange={(e) => {
                                      const updated = [...selectedSalesProperties];
                                      updated[index].toDate = e.target.value;
                                      setSelectedSalesProperties(updated);
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
                            {prop.dateOperator === 'in_the_last' && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <select
                                  value={prop.period || ''}
                                  onChange={(e) => {
                                    const updated = [...selectedSalesProperties];
                                    updated[index].period = e.target.value;
                                    setSelectedSalesProperties(updated);
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
                                  <option value="">Select period</option>
                                  <option value="day">Day</option>
                                  <option value="week">Week</option>
                                  <option value="month">Month</option>
                                </select>
                                <input
                                  type="number"
                                  value={prop.count || ''}
                                  onChange={(e) => {
                                    const updated = [...selectedSalesProperties];
                                    updated[index].count = e.target.value;
                                    setSelectedSalesProperties(updated);
                                  }}
                                  placeholder="Count"
                                  min="1"
                                  style={{
                                    width: '80px',
                                    padding: '8px 12px',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--r)',
                                    fontSize: '13px',
                                    background: 'var(--surface)',
                                    color: 'var(--text)'
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Modified By - User dropdown with is/isn't */}
                        {prop.property === 'modified_by' && (
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ minWidth: '80px' }}>
                              <select
                                value={prop.operator || 'is'}
                                onChange={(e) => {
                                  const updated = [...selectedSalesProperties];
                                  updated[index].operator = e.target.value;
                                  setSelectedSalesProperties(updated);
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
                                  placeholder="Search users..."
                                  value={prop.searchTerm || ''}
                                  onChange={(e) => {
                                    const updated = [...selectedSalesProperties];
                                    updated[index].searchTerm = e.target.value;
                                    setSelectedSalesProperties(updated);
                                  }}
                                  onFocus={() => {
                                    const updated = [...selectedSalesProperties];
                                    updated[index].dropdownOpen = true;
                                    setSelectedSalesProperties(updated);
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
                                    {predefinedContactOwners.filter(owner => !prop.searchTerm || owner.toLowerCase().includes(prop.searchTerm.toLowerCase()))
                                      .map(owner => (
                                        <div
                                          key={owner}
                                          onClick={() => {
                                            const updated = [...selectedSalesProperties];
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
                                            setSelectedSalesProperties(updated);
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
                                    <div
                                      onClick={() => {
                                        if (user?.role?.toLowerCase().trim() !== 'operation' && user?.role?.toLowerCase().trim() !== 'operations') return;
                                        const updated = [...selectedSalesProperties];
                                        updated[index].showCustomInput = true;
                                        updated[index].dropdownOpen = false;
                                        setSelectedSalesProperties(updated);
                                      }}
                                      style={{
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        color: 'var(--green-600)',
                                        borderBottom: 'none'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--green-100)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                      }}
                                    >
                                      + Custom User
                                    </div>
                                  </div>
                                )}
                              </div>
                              {prop.showCustomInput && (
  <div style={{ marginTop: '8px', padding: '10px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 'var(--r)', position: 'relative', zIndex: 20 }}>
    <input 
      type="text" 
      value={prop.customValue || ''} 
      onChange={(e) => {
        const updated = [...selectedSalesProperties];
        updated[index].customValue = e.target.value;
        setSelectedSalesProperties(updated);
      }} 
      placeholder="Enter custom user..."
      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--green-300)', borderRadius: 'var(--r)', fontSize: '13px', background: 'var(--surface)', color: 'var(--text)', marginBottom: '8px', boxSizing: 'border-box' }} 
      autoFocus 
    />
    <div style={{ display: 'flex', gap: '8px' }}>
      <button 
        onClick={() => { 
          if (prop.customValue && prop.customValue.trim()) { 
            const updated = [...selectedSalesProperties];
            const currentValues = updated[index].value ? updated[index].value.split(',') : [];
            currentValues.push(prop.customValue.trim());
            updated[index].value = currentValues.join(',');
            updated[index].customValue = '';
            updated[index].showCustomInput = false;
            setSelectedSalesProperties(updated);
          } 
        }}
        style={{ flex: 1, padding: '8px 12px', background: 'var(--green-600)', color: 'white', border: 'none', borderRadius: 'var(--r)', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}
      >Apply</button>
      <button 
        onClick={() => { 
          const updated = [...selectedSalesProperties];
          updated[index].customValue = '';
          updated[index].showCustomInput = false;
          setSelectedSalesProperties(updated);
        }}
        style={{ flex: 1, padding: '8px 12px', background: 'var(--gray-200)', color: 'var(--text)', border: 'none', borderRadius: 'var(--r)', fontSize: '13px', cursor: 'pointer' }}
      >Cancel</button>
    </div>
  </div>
)}
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
                                          const updated = [...selectedSalesProperties];
                                          const currentValues = updated[index].value ? updated[index].value.split(',') : [];
                                          const indexToRemove = currentValues.indexOf(owner);
                                          if (indexToRemove > -1) {
                                            currentValues.splice(indexToRemove, 1);
                                            updated[index].value = currentValues.join(',');
                                            setSelectedSalesProperties(updated);
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

                        {/* Modified Time - Date filter with operators */}
                        {prop.property === 'modified_time' && (
                          <div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                              <select
                                value={prop.dateOperator || 'on'}
                                onChange={(e) => {
                                  const updated = [...selectedSalesProperties];
                                  updated[index].dateOperator = e.target.value;
                                  updated[index].value = '';
                                  updated[index].fromDate = '';
                                  updated[index].toDate = '';
                                  setSelectedSalesProperties(updated);
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
                                <option value="on">on</option>
                                <option value="before">before</option>
                                <option value="after">after</option>
                                <option value="between">between</option>
                                <option value="in_the_last">in the last</option>
                              </select>
                            </div>
                            {['on', 'before', 'after'].includes(prop.dateOperator) && (
                              <input
                                type="date"
                                value={prop.value || ''}
                                onChange={(e) => {
                                  const updated = [...selectedSalesProperties];
                                  updated[index].value = e.target.value;
                                  setSelectedSalesProperties(updated);
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
                            {prop.dateOperator === 'between' && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <div style={{ flex: 1 }}>
                                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-3)' }}>From</label>
                                  <input
                                    type="date"
                                    value={prop.fromDate || ''}
                                    onChange={(e) => {
                                      const updated = [...selectedSalesProperties];
                                      updated[index].fromDate = e.target.value;
                                      setSelectedSalesProperties(updated);
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
                                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-3)' }}>To</label>
                                  <input
                                    type="date"
                                    value={prop.toDate || ''}
                                    onChange={(e) => {
                                      const updated = [...selectedSalesProperties];
                                      updated[index].toDate = e.target.value;
                                      setSelectedSalesProperties(updated);
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
                            {prop.dateOperator === 'in_the_last' && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <select
                                  value={prop.period || ''}
                                  onChange={(e) => {
                                    const updated = [...selectedSalesProperties];
                                    updated[index].period = e.target.value;
                                    setSelectedSalesProperties(updated);
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
                                  <option value="">Select period</option>
                                  <option value="day">Day</option>
                                  <option value="week">Week</option>
                                  <option value="month">Month</option>
                                </select>
                                <input
                                  type="number"
                                  value={prop.count || ''}
                                  onChange={(e) => {
                                    const updated = [...selectedSalesProperties];
                                    updated[index].count = e.target.value;
                                    setSelectedSalesProperties(updated);
                                  }}
                                  placeholder="Count"
                                  min="1"
                                  style={{
                                    width: '80px',
                                    padding: '8px 12px',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--r)',
                                    fontSize: '13px',
                                    background: 'var(--surface)',
                                    color: 'var(--text)'
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          resetSalesFilters();
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
                          applySalesFilters();
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
              </>
            )}

            {/* Filter Applied Indicator */}
            {salesFiltersApplied && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                padding: '12px 16px',
                background: 'var(--blue-600)15',
                border: '1px solid var(--blue-600)30',
                borderRadius: 'var(--r)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Filter size={14} style={{ color: 'var(--blue-600)' }} />
                  <span style={{ color: 'var(--text)', fontSize: '13px', fontWeight: '500' }}>
                    Filter Applied
                  </span>
                  <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>
                    ({Object.values(filteredKanbanDeals).flat().length} records found)
                  </span>
                </div>
                <button
                  onClick={() => {
                    resetSalesFilters();
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

            {/* Content Area */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {/* List View */}
                  {pipelineViewMode === 'list' && (
                    <div style={{ flex: 1, overflow: 'auto', padding: '20px', background: '#f5f5f5' }}>
                      {/* Summary Section */}
                      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e0e0e0', marginBottom: '16px', padding: '12px 16px', display: 'flex', gap: '24px', alignItems: 'center', fontSize: '13px', color: '#4b5563' }}>
                        <span style={{ whiteSpace: 'nowrap' }}>
                          Total{' '}
                          <span style={{ color: '#9ca3af', margin: '0 4px' }}>•</span>{' '}
                          <strong style={{ color: '#111827', fontWeight: 600 }}>{dealMetrics.total}</strong>
                        </span>
                        <span style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Activity size={14} style={{ color: '#3b82f6' }} />
                          Open{' '}
                          <span style={{ color: '#9ca3af', margin: '0 4px' }}>•</span>{' '}
                          <strong style={{ color: '#111827', fontWeight: 600 }}>{dealMetrics.open}</strong>
                        </span>
                        <span style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ThumbsUp size={14} style={{ color: '#10b981' }} />
                          Won{' '}
                          <span style={{ color: '#9ca3af', margin: '0 4px' }}>•</span>{' '}
                          <strong style={{ color: '#111827', fontWeight: 600 }}>{dealMetrics.positive}</strong>
                        </span>
                        <span style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ThumbsDown size={14} style={{ color: '#ef4444' }} />
                          Lost{' '}
                          <span style={{ color: '#9ca3af', margin: '0 4px' }}>•</span>{' '}
                          <strong style={{ color: '#111827', fontWeight: 600 }}>{dealMetrics.negative}</strong>
                        </span>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '13px', color: '#6b7280' }}>Records per page</span>
                          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                            <select
                              value={salesPipelineItemsPerPage}
                              onChange={(e) => {
                                setSalesPipelineItemsPerPage(Number(e.target.value));
                                setSalesPipelineCurrentPage(1);
                              }}
                              style={{
                                appearance: 'none',
                                WebkitAppearance: 'none',
                                padding: '6px 32px 6px 14px',
                                borderRadius: '20px',
                                border: '1px solid #d1d5db',
                                background: '#fff',
                                fontSize: '13px',
                                color: '#374151',
                                cursor: 'pointer',
                                minWidth: '56px',
                                fontFamily: 'inherit'
                              }}
                            >
                              {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }} />
                          </div>
                        </div>
                      </div>

                      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                            <tr>
                              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#333' }}>Deal Name</th>
                              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#333' }}>Contact Name</th>
                              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#333' }}>Amount</th>
                              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#333' }}>Stage</th>
                              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#333' }}>Probability</th>
                              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#333' }}>Closing Date</th>
                              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#333' }}>Deal Type</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.values(filteredKanbanDeals).flat()
                              .slice((salesPipelineCurrentPage - 1) * salesPipelineItemsPerPage, salesPipelineCurrentPage * salesPipelineItemsPerPage)
                              .map((deal) => (
                              <tr key={deal.deal_id} style={{ borderBottom: '1px solid #e0e0e0', '&:hover': { background: '#f8f9fa' } }}>
                                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#333', cursor: 'pointer', transition: 'color 0.2s ease' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedDeal({
                                        deal_id: deal.deal_id,
                                        deal_name: deal.deal_name,
                                        contact_name: deal.full_name || 'John Smith',
                                        amount: `₹${deal.deal_amount}`,
                                        closing_date: deal.deal_close_date ? new Date(deal.deal_close_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
                                        description: deal.description || '',
                                        deal_type: deal.deal_type || '',
                                        deal_stage: deal.deal_stage || '',
                                        contact_owner: deal.deal_owner ||'',
                                        probability: `${deal.deal_probability}%`
                                      });
                                      setShowDealInfoModal(true);
                                    }}>
                                  {deal.deal_name}
                                </td>
                                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#666' }}>{deal.full_name || '-'}</td>
                                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#666', fontWeight: '600' }}>₹{deal.deal_amount}</td>
                                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#666' }}>{deal.deal_stage}</td>
                                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#666' }}>{deal.deal_probability}%</td>
                                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#666' }}>
                                  {deal.deal_close_date ? new Date(deal.deal_close_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                </td>
                                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#666' }}>{deal.deal_type || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {dealMetrics.total > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '12px 16px', background: 'white', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                          <span style={{ fontSize: '13px', color: '#6b7280' }}>
                            {Math.min((salesPipelineCurrentPage - 1) * salesPipelineItemsPerPage + 1, dealMetrics.total)} to {Math.min(salesPipelineCurrentPage * salesPipelineItemsPerPage, dealMetrics.total)} of {dealMetrics.total}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => setSalesPipelineCurrentPage(p => Math.max(p - 1, 1))}
                              disabled={salesPipelineCurrentPage === 1}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '28px',
                                height: '28px',
                                padding: 0,
                                background: 'none',
                                border: 'none',
                                color: salesPipelineCurrentPage === 1 ? '#d1d5db' : '#6b7280',
                                cursor: salesPipelineCurrentPage === 1 ? 'not-allowed' : 'pointer'
                              }}
                            >
                              <ChevronLeft size={18} />
                            </button>
                            <span style={{ fontSize: '13px', color: '#374151', minWidth: '56px', textAlign: 'center' }}>
                              {salesPipelineCurrentPage}
                            </span>
                            <button
                              onClick={() => setSalesPipelineCurrentPage(p => Math.min(p + 1, Math.ceil(dealMetrics.total / salesPipelineItemsPerPage)))}
                              disabled={salesPipelineCurrentPage >= Math.ceil(dealMetrics.total / salesPipelineItemsPerPage)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '28px',
                                height: '28px',
                                padding: 0,
                                background: 'none',
                                border: 'none',
                                color: salesPipelineCurrentPage >= Math.ceil(dealMetrics.total / salesPipelineItemsPerPage) ? '#d1d5db' : '#6b7280',
                                cursor: salesPipelineCurrentPage >= Math.ceil(dealMetrics.total / salesPipelineItemsPerPage) ? 'not-allowed' : 'pointer'
                              }}
                            >
                              <ChevronRight size={18} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Kanban Board */}
                  {pipelineViewMode === 'kanban' && (
                    <SalesPipelineKanbanBoard
                      filteredKanbanDeals={filteredKanbanDeals}
                      kanbanDeals={kanbanDeals}
                      collapsedStages={collapsedStages}
                      setCollapsedStages={setCollapsedStages}
                      columnWidths={columnWidths}
                      setColumnWidths={setColumnWidths}
                      onDealMove={handleKanbanDealMove}
                      onDealClick={handleKanbanDealClick}
                    />
                  )}
                </div>
              </div>
                )}
                    
          

        {/* Update Fields Modal */}
        {showUpdateFieldsModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ position: 'relative', background: 'var(--surface)', borderRadius: '12px', width: '500px', maxWidth: '90%', boxShadow: '0 20px 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
              {/* Modal header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>Update Fields</h2>
                <button onClick={() => setShowUpdateFieldsModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '4px' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Modal body */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Field selector */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontSize: '14px', fontWeight: '500' }}>Select Field to Update</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={selectedFieldToUpdate}
                      onChange={(e) => { setSelectedFieldToUpdate(e.target.value); setUpdateFieldValue(''); }}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
                    >
                      <option value="">Choose a field...</option>
                      <option value="tags">Tags</option>
                      <option value="industry">Industry</option>
                      <option value="state">State</option>
                      <option value="country">Country</option>
                      <option value="leadStatus">Lead Status</option>
                      <option value="contactOwner">Contact Owner</option>
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
                  </div>
                </div>

                {/* Current value and new value */}
                {selectedFieldToUpdate && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Current value */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontSize: '14px', fontWeight: '500' }}>Change From</label>
                      <div style={{ position: 'relative' }}>
                        {selectedFieldToUpdate === 'leadStatus' ? (
                          <select
                            value={updateFieldValue}
                            onChange={(e) => setUpdateFieldValue(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
                          >
                            <option value="">All selected</option>
                            {[...new Set(opportunities.filter(o => selectedRows.includes(o.id)).map(o => o.leadStatus))].filter(Boolean).sort().map(status => (
                              <option key={status} value={status}>{statusConfig[status]?.label || status}</option>
                            ))}
                          </select>
                        ) : selectedFieldToUpdate === 'industry' ? (
                          <select
                            value={updateFieldValue}
                            onChange={(e) => setUpdateFieldValue(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
                          >
                            <option value="">All selected</option>
                            {[...new Set(opportunities.filter(o => selectedRows.includes(o.id)).map(o => o.industry))].filter(Boolean).sort().map(industry => (
                              <option key={industry} value={industry}>{industry}</option>
                            ))}
                          </select>
                        ) : selectedFieldToUpdate === 'contactOwner' ? (
                          <select
                            value={updateFieldValue}
                            onChange={(e) => setUpdateFieldValue(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
                          >
                            <option value="">All selected</option>
                            {[...new Set(opportunities.filter(o => selectedRows.includes(o.id)).map(o => o.contactOwner))].filter(Boolean).sort().map(owner => (
                              <option key={owner} value={owner}>{owner}</option>
                            ))}
                          </select>
                        ) : selectedFieldToUpdate === 'state' ? (
                          <select
                            value={updateFieldValue}
                            onChange={(e) => setUpdateFieldValue(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
                          >
                            <option value="">All selected</option>
                            {[...new Set(opportunities.filter(o => selectedRows.includes(o.id)).map(o => o.state))].filter(Boolean).sort().map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                        ) : selectedFieldToUpdate === 'country' ? (
                          <select
                            value={updateFieldValue}
                            onChange={(e) => setUpdateFieldValue(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
                          >
                            <option value="">All selected</option>
                            {[...new Set(opportunities.filter(o => selectedRows.includes(o.id)).map(o => o.country))].filter(Boolean).sort().map(country => (
                              <option key={country} value={country}>{country}</option>
                            ))}
                          </select>
                        ) : selectedFieldToUpdate === 'tags' ? (
                          <select
                            value={updateFieldValue}
                            onChange={(e) => setUpdateFieldValue(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
                          >
                            <option value="">All selected</option>
                            {[...new Set(opportunities.filter(o => selectedRows.includes(o.id)).map(o => o.tags))].filter(Boolean).sort().map(tag => (
                              <option key={tag} value={tag}>{tag}</option>
                            ))}
                          </select>
                        ) : null}
                        <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
                      </div>
                    </div>

                    {/* New value */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontSize: '14px', fontWeight: '500' }}>Change To</label>
                      <div style={{ position: 'relative' }}>
                        {selectedFieldToUpdate === 'leadStatus' ? (
                          <select
                            value={updateNewFieldValue}
                            onChange={(e) => setUpdateNewFieldValue(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
                          >
                            <option value="">Select new status...</option>
                            {Object.keys(statusConfig).map(status => (
                              <option key={status} value={status}>{statusConfig[status].label}</option>
                            ))}
                          </select>
                        ) : selectedFieldToUpdate === 'industry' ? (
                          <select
                            value={updateNewFieldValue}
                            onChange={(e) => setUpdateNewFieldValue(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
                          >
                            <option value="">Select industry...</option>
                            {predefinedIndustries.map(industry => (
                              <option key={industry} value={industry}>{industry}</option>
                            ))}
                          </select>
                        ) : selectedFieldToUpdate === 'contactOwner' ? (
                          <select
                            value={updateNewFieldValue}
                            onChange={(e) => setUpdateNewFieldValue(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
                          >
                            <option value="">Select owner...</option>
                            {[...new Set(opportunities.map(o => o.contactOwner))].filter(Boolean).sort().map(owner => (
                              <option key={owner} value={owner}>{owner}</option>
                            ))}
                          </select>
                        ) : selectedFieldToUpdate === 'state' ? (
                          <select
                            value={updateNewFieldValue}
                            onChange={(e) => setUpdateNewFieldValue(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
                          >
                            <option value="">Select state...</option>
                            {[...new Set(opportunities.map(o => o.state))].filter(Boolean).sort().map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                        ) : selectedFieldToUpdate === 'country' ? (
                          <select
                            value={updateNewFieldValue}
                            onChange={(e) => setUpdateNewFieldValue(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
                          >
                            <option value="">Select country...</option>
                            {[...new Set(opportunities.map(o => o.country))].filter(Boolean).sort().map(country => (
                              <option key={country} value={country}>{country}</option>
                            ))}
                          </select>
                        ) : selectedFieldToUpdate === 'tags' ? (
                          <select
                            value={updateNewFieldValue}
                            onChange={(e) => setUpdateNewFieldValue(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
                          >
                            <option value="">Select tags...</option>
                            {[...new Set(opportunities.map(o => o.tags))].filter(Boolean).sort().map(tag => (
                              <option key={tag} value={tag}>{tag}</option>
                            ))}
                          </select>
                        ) : null}
                        <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 24px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
                <button
                  onClick={() => setShowUpdateFieldsModal(false)}
                  style={{ padding: '10px 20px', background: 'var(--gray-200)', color: 'var(--text)', border: 'none', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!selectedFieldToUpdate || !updateNewFieldValue) {
                      toast.error('Please select a field and enter a new value');
                      return;
                    }
                    const fieldMap = {
                      tags: 'tags',
                      industry: 'industry',
                      state: 'state',
                      country: 'country',
                      leadStatus: 'status',
                      contactOwner: 'owner'
                    };
                    const field = fieldMap[selectedFieldToUpdate];
                    const currentUserName = user?.name || user?.phone_number || 'operation';
                    const ids = selectedRows.join(',');
                    
                    setIsUpdating(true);
                    try {
                      const valueParam = updateFieldValue ? updateFieldValue : 'all';
                      const url = `${import.meta.env.VITE_BULK_UPDATE_LEADS_API_URL}?ids=${ids}&field=${field}&value=${encodeURIComponent(valueParam)}&update_value=${encodeURIComponent(updateNewFieldValue)}&user=${encodeURIComponent(currentUserName)}`;
                      
                      const response = await fetch(url, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                        }
                      });

                      if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                      }

                      const data = await response.json();
                      
                      setOpportunities(prev => prev.map(opp => {
                        if (!selectedRows.includes(opp.id)) return opp;
                        // If "Change From" is empty, update all selected items
                        if (!updateFieldValue) {
                          return { ...opp, [field]: updateNewFieldValue };
                        }
                        // Only update items that match the "Change From" value
                        if (opp[field] === updateFieldValue) {
                          return { ...opp, [field]: updateNewFieldValue };
                        }
                        return opp;
                      }));
                      
                      const updatedCount = opportunities.filter(opp => 
                        selectedRows.includes(opp.id) && (!updateFieldValue || opp[field] === updateFieldValue)
                      ).length;
                      
                      toast.success(`Updated ${selectedFieldToUpdate} for ${updatedCount} item(s)`);
                      setShowUpdateFieldsModal(false);
                      setSelectedRows([]);
                      setUpdateFieldValue('');
                      setUpdateNewFieldValue('');
                    } catch (error) {
                      console.error('Error updating fields:', error);
                      toast.error('Failed to update fields. Please try again.');
                    } finally {
                      setIsUpdating(false);
                    }
                  }}
                  disabled={!selectedFieldToUpdate || !updateNewFieldValue || isUpdating}
                  style={{ padding: '10px 20px', background: 'var(--green-600)', color: 'white', border: 'none', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: '14px', fontWeight: '500', opacity: (!selectedFieldToUpdate || !updateNewFieldValue || isUpdating) ? 0.5 : 1 }}
                >
                  {isUpdating ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ position: 'relative', background: 'var(--surface)', borderRadius: '12px', width: '400px', maxWidth: '90%', boxShadow: '0 20px 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
              {/* Modal header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>Confirm Delete</h2>
                <button onClick={() => setShowDeleteConfirmModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '4px' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Modal body */}
              <div style={{ padding: '24px' }}>
                <p style={{ margin: 0, color: 'var(--text)', fontSize: '14px' }}>
                  Are you sure you want to delete {selectedRows.length} item(s)? This action cannot be undone.
                </p>
              </div>

              {/* Modal footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 24px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
                <button
                  onClick={() => setShowDeleteConfirmModal(false)}
                  style={{ padding: '10px 20px', background: 'var(--gray-200)', color: 'var(--text)', border: 'none', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                >
                  No
                </button>
                <button
                  onClick={async () => {
                    const currentUserName = user?.name || user?.phone_number || 'operation';
                    
                    setIsDeleting(true);
                    try {
                      // Delete each item individually using the delete-account API
                      const deletePromises = selectedRows.map(id => {
                        const url = `${import.meta.env.VITE_DELETE_ACCOUNT_API_URL}?id=${id}&user=${encodeURIComponent(currentUserName)}`;
                        return fetch(url, {
                          method: 'DELETE',
                          headers: {
                            'Content-Type': 'application/json',
                          }
                        });
                      });
                      
                      const responses = await Promise.all(deletePromises);
                      
                      // Check if any response failed
                      const failedResponse = responses.find(response => !response.ok);
                      if (failedResponse) {
                        throw new Error(`HTTP error! status: ${failedResponse.status}`);
                      }

                      // Delete selected items from local state
                      setOpportunities(prev => prev.filter(opp => !selectedRows.includes(opp.id)));
                      setSelectedRows([]);
                      setShowDeleteConfirmModal(false);
                      toast.success(`Deleted ${selectedRows.length} item(s)`);
                    } catch (error) {
                      console.error('Error deleting items:', error);
                      toast.error('Failed to delete items. Please try again.');
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                  disabled={isDeleting}
                  style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: '14px', fontWeight: '500', opacity: isDeleting ? 0.5 : 1 }}
                >
                  {isDeleting ? 'Deleting...' : 'Yes'}
                </button>
              </div>
            </div>
          </div>
        )}

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
                      <EditableField label="Phone Number" value={selectedUser.phoneNumber} fieldName="phoneNumber" type="tel" />
                      <EditableField label="Alternate Number" value={selectedUser.alternateNumber} fieldName="alternateNumber" type="tel" />
                    </div>
                  </div>

                  {/* Company Information */}
                  <div style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: 'var(--text)', fontSize: '14px', fontWeight: '600', borderBottom: '1px solid var(--border-soft)', paddingBottom: '8px' }}>Company Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <EditableField label="Company Name" value={selectedUser.companyName} fieldName="companyName" />
                      <EditableField label="Account Name" value={selectedUser.accountName} fieldName="accountName" />
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Account Number</label>
                        <div style={{ padding: '8px 12px', background: 'var(--gray-100)', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '12px', color: 'var(--text)' }}>{selectedUser.accountNumber || '-'}</div>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>No. of Deals</label>
                        <div style={{ padding: '8px 12px', background: 'var(--gray-100)', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '12px', color: 'var(--text)' }}>
                          {dealCounts[selectedUser?.id] || 0}
                        </div>
                      </div>
                      <EditableField label="Website" value={selectedUser.website} fieldName="website" />
                      {/* Account Type dropdown */}
<div>
  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Account Type</label>
  <div style={{ position: 'relative' }}>
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: '12px', color: 'var(--text)' }}
      onClick={() => {
        closeAllDropdowns();
        setAccountTypeDropdownOpen(!accountTypeDropdownOpen);
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)'; }}
    >
      <span>{selectedUser.accountType || 'Select account type'}</span>
      <ChevronDown size={14} />
    </div>
    {accountTypeDropdownOpen && (
      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10, marginTop: '4px', maxHeight: '200px', overflowY: 'auto' }}>
        {predefinedAccountTypes.map(accountType => (
          <button key={accountType} onClick={() => { handleFieldUpdate(selectedUser.id, 'accountType', accountType); setAccountTypeDropdownOpen(false); }}
            style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '12px', color: 'var(--text)', borderBottom: '1px solid var(--border-soft)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
          >{accountType}</button>
        ))}
        {(user?.role?.toLowerCase().trim() === 'operation' || user?.role?.toLowerCase().trim() === 'operations') && (
          <button onClick={() => { setShowCustomAccountTypeInput(true); setAccountTypeDropdownOpen(false); }}
            style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: 'var(--green-600)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--green-100)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
          >+ Custom</button>
        )}
      </div>
    )}
    {showCustomAccountTypeInput && (
      <div style={{ marginTop: '8px', padding: '8px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 'var(--r)' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input type="text" value={customAccountType} onChange={(e) => setCustomAccountType(e.target.value)} placeholder="Enter custom account type..."
            style={{ flex: 1, padding: '6px 8px', border: '1px solid var(--green-300)', borderRadius: 'var(--r)', fontSize: '12px', background: 'var(--surface)', color: 'var(--text)' }} autoFocus />
          <button onClick={() => { if (customAccountType.trim()) { handleFieldUpdate(selectedUser.id, 'accountType', customAccountType.trim()); setPredefinedAccountTypes([...predefinedAccountTypes, customAccountType.trim()]); setCustomAccountType(''); setShowCustomAccountTypeInput(false); } }}
            style={{ padding: '6px 12px', background: 'var(--green-600)', color: 'white', border: 'none', borderRadius: 'var(--r)', fontSize: '11px', cursor: 'pointer', fontWeight: '500' }}>Apply</button>
          <button onClick={() => { setCustomAccountType(''); setShowCustomAccountTypeInput(false); }}
            style={{ padding: '6px 12px', background: 'var(--gray-200)', color: 'var(--text)', border: 'none', borderRadius: 'var(--r)', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    )}
  </div>
</div>
                      {/* Industry dropdown */}
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Industry</label>
                        <div style={{ position: 'relative' }}>
                          <div
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: '12px', color: 'var(--text)' }}
                            onClick={() => {
                              closeAllDropdowns();
                              setIndustryDropdownOpen(!industryDropdownOpen);
                            }}
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
                              {(user?.role?.toLowerCase().trim() === 'operation' || user?.role?.toLowerCase().trim() === 'operations') && (
                                <button onClick={() => { setShowCustomIndustryInput(true); setIndustryDropdownOpen(false); }}
                                  style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: 'var(--green-600)' }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--green-100)'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                                >+ Custom</button>
                              )}
                            </div>
                          )}
                          {showCustomIndustryInput && (
                            <div style={{ marginTop: '8px', padding: '8px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 'var(--r)' }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input type="text" value={customIndustry} onChange={(e) => setCustomIndustry(e.target.value)} placeholder="Enter custom industry..."
                                  style={{ flex: 1, padding: '6px 8px', border: '1px solid var(--green-300)', borderRadius: 'var(--r)', fontSize: '12px', background: 'var(--surface)', color: 'var(--text)' }} autoFocus />
                                <button onClick={() => { if (customIndustry.trim()) { handleFieldUpdate(selectedUser.id, 'industry', customIndustry.trim()); setPredefinedIndustries([...predefinedIndustries, customIndustry.trim()]); setCustomIndustry(''); setShowCustomIndustryInput(false); } }}
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
                      <EditableField label="City" value={selectedUser.city} fieldName="city" />
                      <EditableField label="State" value={selectedUser.state} fieldName="state" />
                      <EditableField label="Country" value={selectedUser.country} fieldName="country" />
                    </div>
                  </div>

                  {/* Lead Management */}
                  <div style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: 'var(--text)', fontSize: '14px', fontWeight: '600', borderBottom: '1px solid var(--border-soft)', paddingBottom: '8px' }}>Lead Management</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

                      {/* Contact Owner */}
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Contact Owner</label>
                        <div style={{ position: 'relative' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: '12px', color: 'var(--text)' }}
                            onClick={() => {
                              closeAllDropdowns();
                              setOwnerDropdownOpen(!ownerDropdownOpen);
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)'; }}>
                            <span>{selectedUser.contactOwner}</span><ChevronDown size={14} />
                          </div>
                          {ownerDropdownOpen && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10, marginTop: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                              {predefinedContactOwners.map(owner => (
                                <button key={owner} onClick={() => { handleFieldUpdate(selectedUser.id, 'contactOwner', owner); setOwnerDropdownOpen(false); }}
                                  style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '12px', color: 'var(--text)', borderBottom: '1px solid var(--border-soft)' }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                                >{owner}</button>
                              ))}
                              {(user?.role?.toLowerCase().trim() === 'operation' || user?.role?.toLowerCase().trim() === 'operations') && (
                              <button onClick={() => { setShowCustomOwnerInput(true); setOwnerDropdownOpen(false); }}
                                style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: 'var(--green-600)' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--green-100)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                              >+ Custom Owner</button>
                              )}
                            </div>
                          )}
                          {showCustomOwnerInput && (
                            <div style={{ marginTop: '8px', padding: '8px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 'var(--r)' }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input type="text" value={customOwner} onChange={(e) => setCustomOwner(e.target.value)} placeholder="Enter custom owner..."
                                  style={{ flex: 1, padding: '6px 8px', border: '1px solid var(--green-300)', borderRadius: 'var(--r)', fontSize: '12px', background: 'var(--surface)', color: 'var(--text)' }} autoFocus />
                                <button onClick={() => { if (customOwner.trim()) { handleFieldUpdate(selectedUser.id, 'contactOwner', customOwner.trim()); setPredefinedContactOwners([...predefinedContactOwners, customOwner.trim()]); setCustomOwner(''); setShowCustomOwnerInput(false); } }}
                                  style={{ padding: '6px 12px', background: 'var(--green-600)', color: 'white', border: 'none', borderRadius: 'var(--r)', fontSize: '11px', cursor: 'pointer', fontWeight: '500' }}>Apply</button>
                                <button onClick={() => { setCustomOwner(''); setShowCustomOwnerInput(false); }}
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
                            onClick={() => {
                              closeAllDropdowns();
                              setTagsDropdownOpen(!tagsDropdownOpen);
                            }}
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
                              {(user?.role?.toLowerCase().trim() === 'operation' || user?.role?.toLowerCase().trim() === 'operations') && (
                                <button onClick={() => { setShowCustomTagsInput(true); setTagsDropdownOpen(false); }}
                                  style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: 'var(--green-600)' }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--green-100)'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                                >+ Custom Tag</button>
                              )}
                            </div>
                          )}
                          {showCustomTagsInput && (
                            <div style={{ marginTop: '8px', padding: '8px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 'var(--r)' }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input type="text" value={customTags} onChange={(e) => setCustomTags(e.target.value)} placeholder="Enter custom tag..."
                                  style={{ flex: 1, padding: '6px 8px', border: '1px solid var(--green-300)', borderRadius: 'var(--r)', fontSize: '12px', background: 'var(--surface)', color: 'var(--text)' }} autoFocus />
                                <button onClick={() => { if (customTags.trim()) { handleFieldUpdate(selectedUser.id, 'tags', customTags.trim()); setPredefinedTags([...predefinedTags, customTags.trim()]); setCustomTags(''); setShowCustomTagsInput(false); } }}
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
                        <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Last Activity</label>
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
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Modified Time</label>
                        <div style={{ color: 'var(--text)' }}>{new Date(selectedUser.modifiedTime).toLocaleString('en-IN')}</div>
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
                      { id: 'notes', label: 'Notes' },
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
                        {timelineLoading ? (
                          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-3)' }}>Loading timeline...</div>
                        ) : timelineData.length > 0 ? (
                          <div style={{ paddingLeft: '32px', borderLeft: '2px solid var(--border)', marginLeft: '20px' }}>
                            {timelineData.map((item, index) => {
                              const IconComponent = getTimelineIcon(item.field);
                              return (
                                <div key={item.id} style={{ paddingBottom: index < timelineData.length - 1 ? '20px' : '0' }}>
                                  <div style={{ marginLeft: '-36px', marginBottom: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--green-100)', border: '2px solid var(--green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <IconComponent size={16} style={{ color: 'var(--green-600)' }} />
                                    </div>
                                  </div>
                                  <div style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '4px' }}>{new Date(item.created_time).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                  <div style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '4px' }}>
                                    {item.activity_type === 'deal_deleted' ? (
                                      <span>Deal deleted by <span style={{ fontWeight: 'bold' }}>{item.changed_by}</span></span>
                                    ) : item.field === 'note' ? (
                                      <span>Note added by <span style={{ fontWeight: 'bold' }}>{item.changed_by}</span></span>
                                    ) : item.field === 'task' ? (
                                      <span>Task added by <span style={{ fontWeight: 'bold' }}>{item.changed_by}</span></span>
                                    ) : (
                                      <span>{item.field} updated by <span style={{ fontWeight: 'bold' }}>{item.changed_by}</span></span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '14px', color: 'var(--text)', fontStyle: 'Georgia' }}>
                                    {item.activity_type === 'deal_deleted' ? (
                                      <span>' {item.old_value} '</span>
                                    ) : item.field === 'note' ? (
                                      <span>' {item.new_value} '</span>
                                    ) : item.field === 'task' ? (
                                      <span>' {item.new_value} '</span>
                                    ) : item.old_value === null || item.old_value === '' ? (
                                      <span>' {item.new_value} '</span>
                                    ) : (
                                      <span>{`' ${item.old_value} ' to '${item.new_value}'`}</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-3)' }}>No timeline data available</div>
                        )}
                      </div>
                    )}

                    {activeModalTab === 'notes' && (
                      <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
                        <div style={{ marginBottom: '16px' }}>
                          <textarea placeholder="Add a note..." rows={3}
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                            style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', resize: 'vertical', outline: 'none', background: 'var(--surface)', color: 'var(--text)' }} />
                          <button onClick={handleAddNote} disabled={addingNote} style={{ marginTop: '8px', backgroundColor: addingNote ? 'var(--gray-400)' : 'var(--green-600)', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', cursor: addingNote ? 'not-allowed' : 'pointer' }}>{addingNote ? 'Adding...' : 'Add Note'}</button>
                        </div>
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                          {activities.filter(activity => activity.message).length > 0 ? (
                          activities.filter(activity => activity.message).map((activity) => (
                            <div key={activity.id} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                              <div style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '4px',fontWeight:'bold' }}>
                                {activity.created_by}</div>
                              <div style={{fontSize: '10px', color: 'var(--text)', margBottom: '4px'}}>

                                {new Date(activity.created_time).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <div style={{ fontSize: '15px', color: 'var(--text-3)',fontWeight:'bold' }}>{activity.message}</div>
                            </div>
                            ))
                          ) : (
                            <div style={{ fontSize: '13px', color: 'var(--text-3)' }}>No notes yet</div>
                          )}
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
                              {['Task Name','Due Date','Status','Task Owner','Actions'].map(h => (
                                <th key={h} style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600', color: 'var(--text-3)', fontSize: '12px' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {activities.filter(activity => activity.activity_type === 'task' && activity.task_name).map((activity) => (
                              <tr key={activity.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '10px 8px', color: 'var(--text)' }}>{activity.task_name}</td>
                                <td style={{ padding: '10px 8px', color: 'var(--text-3)', fontSize: '12px' }}>{activity.due_date ? new Date(activity.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</td>
                                <td style={{ padding: '10px 8px' }}>
                                  <span style={{
                                    backgroundColor: activity.status === 'Completed' ? '#d1fae5' : activity.status === 'In Progress' ? '#fef3c7' : activity.status === 'Due For' ? '#fee2e2' : '#dbeafe',
                                    color: activity.status === 'Completed' ? '#047857' : activity.status === 'In Progress' ? '#b45309' : activity.status === 'Due For' ? '#dc2626' : '#1d4ed8',
                                    padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '500'
                                  }}>{activity.status}</span>
                                </td>
                                <td style={{ padding: '10px 8px', color: 'var(--text)' }}>{activity.task_owner || '-'}</td>
                                <td style={{ padding: '10px 8px' }}>
                                  <button onClick={() => handleEditTask(activity)} style={{ backgroundColor: 'var(--green-600)', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', fontWeight: '500', cursor: 'pointer' }}>Edit</button>
                                </td>
                              </tr>
                            ))}
                            {activities.filter(activity => activity.activity_type === 'task' && activity.task_name).length === 0 && (
                              <tr>
                                <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-3)' }}>No tasks yet</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {activeModalTab === 'pipelines' && (
                      <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                          <button onClick={() => setShowCreateDealModal(true)}
                            style={{ backgroundColor: 'var(--green-600)', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Plus size={14} /> Deal
                          </button>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', fontSize: '13px' }}>
                          <thead>
                            <tr style={{ background: 'var(--gray-100)', borderBottom: '2px solid var(--border)' }}>
                              {['Deal Name','Amount','Stage','Probability','Closing Date'].map(h => (
                                <th key={h} style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600', color: 'var(--text-3)', fontSize: '12px' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {dealsLoading ? (
                              <tr>
                                <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-3)' }}>Loading deals...</td>
                              </tr>
                            ) : dealsData.length === 0 ? (
                              <tr>
                                <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-3)' }}>No deals yet</td>
                              </tr>
                            ) : (
                              dealsData.map(deal => (
                                <tr key={deal.deal_id} style={{ borderBottom: '1px solid var(--border)' }}>
                                  <td style={{ padding: '10px 8px', color: 'var(--text)' }}>
                                    <span
                                      style={{ color: 'var(--blue-600)', cursor: 'pointer', textDecoration: 'underline' }}
                                      onClick={() => {
                                        setSelectedDeal({
                                          deal_id: deal.deal_id,
                                          deal_name: deal.deal_name,
                                          contact_name: selectedUser?.contactName || 'John Smith',
                                          amount: `₹${deal.deal_amount}`,
                                          closing_date: deal.deal_close_date ? new Date(deal.deal_close_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
                                          description: deal.description || '',
                                          deal_type: deal.deal_type || '',
                                          deal_stage: deal.deal_stage || '',
                                          contact_owner: deal.deal_owner ||'',
                                          probability: `${deal.deal_probability}%`
                                        });
                                        setShowDealInfoModal(true);
                                      }}
                                    >
                                      {deal.deal_name}
                                    </span>
                                  </td>
                                  <td style={{ padding: '10px 8px', color: 'var(--text)' }}>₹{deal.deal_amount}</td>
                                  <td style={{ padding: '10px 8px' }}>
                                    <span style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '500' }}>
                                      {deal.deal_stage}
                                    </span>
                                  </td>
                                  <td style={{ padding: '10px 8px', color: 'var(--text)' }}>{deal.deal_probability}%</td>
                                  <td style={{ padding: '10px 8px', color: 'var(--text-3)', fontSize: '12px' }}>
                                    {deal.deal_close_date ? new Date(deal.deal_close_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                  </td>
                                </tr>
                              ))
                            )}
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
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
            <div style={{ position: 'relative', background: 'var(--surface)', borderRadius: '12px', width: '650px', maxWidth: '92%', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 20px 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>Create Deal</h3>
                <button onClick={() => setShowCreateDealModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '4px' }}>
                  <X size={20} />
                </button>
              </div>
              <div style={{ padding: '24px', maxHeight: 'calc(90vh - 140px)', overflowY: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-3)', fontSize: '12px', fontWeight: '500', marginBottom: '6px' }}>
                      Deal Name<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>
                    </label>
                    <input type="text" value={dealName} onChange={(e) => setDealName(e.target.value)} placeholder="Enter deal name"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '13px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-3)', fontSize: '12px', fontWeight: '500', marginBottom: '6px' }}>Closing Date</label>
                    <input type="date" value={dealClosingDate} onChange={(e) => setDealClosingDate(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '13px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-3)', fontSize: '12px', fontWeight: '500', marginBottom: '6px' }}>Stage <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></label>
                    <select value={dealStage} onChange={(e) => setDealStage(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '13px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', cursor: 'pointer' }}>
                      <option value="">Choose a stage</option>
                      {['Opportunity','Proposal','Negotiation','Closed Won','Closed Lost','Invoiced','Paid'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-3)', fontSize: '12px', fontWeight: '500', marginBottom: '6px' }}>Deal Type<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></label>
                    <select value={dealType} onChange={(e) => setDealType(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '13px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', cursor: 'pointer' }}>
                      <option value="">Choose a deal type</option>
                      {['Trial', 'Starter', 'Growth', 'Entrepreneur'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-3)', fontSize: '12px', fontWeight: '500', marginBottom: '6px' }}>Amount</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontSize: '13px', fontWeight: '500' }}>₹</span>
                      <input type="text" value={dealAmount} onChange={(e) => setDealAmount(e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '13px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-3)', fontSize: '12px', fontWeight: '500', marginBottom: '6px' }}>Probability</label>
                    <div style={{ position: 'relative' }}>
                      <input type="number" value={dealProbability} onChange={(e) => setDealProbability(e.target.value)} placeholder="0" min="0" max="100" style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '13px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)' }} />
                      <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontSize: '13px', fontWeight: '500' }}>%</span>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-3)', fontSize: '12px', fontWeight: '500', marginBottom: '6px' }}>Description</label>
                    <textarea value={dealDescription} onChange={(e) => setDealDescription(e.target.value)} placeholder="A few words about this deal" rows={4}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '13px', outline: 'none', resize: 'vertical', backgroundColor: 'var(--surface)', color: 'var(--text)', fontFamily: 'inherit' }} />
                  </div>
                </div>
              </div>
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: 'var(--surface)', flexShrink: 0 }}>
                <button onClick={() => { setShowCreateDealModal(false); setDealName(''); setDealClosingDate(''); setDealStage(''); setDealAmount(''); setDealProbability(''); setDealDescription(''); setDealType(''); }} style={{ backgroundColor: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '8px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Cancel</button>
                <button onClick={async () => {
                  if (dealName.trim() && dealStage) {
                    try {
                      toast.loading('Saving deal...');
                      
                      const currentUserName = user?.name || user?.phone_number || 'operation';
                      const apiUrl = import.meta.env.VITE_CREATE_DEAL_API_URL;
                      
                      if (!apiUrl) {
                        toast.dismiss();
                        toast.error('Create Deal API URL not configured');
                        return;
                      }

                      const requestBody = {
                        account_id: selectedUser?.id?.toString() || '',
                        deal_name: dealName,
                        deal_amount: dealAmount || '0',
                        deal_probability: dealProbability || '0',
                        deal_stage: dealStage,
                        deal_close_date: dealClosingDate || '',
                        deal_type: dealType || 'New Business',
                        description: dealDescription || '',
                        user: currentUserName
                      };

                      console.log('Creating deal with:', requestBody);

                      const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(requestBody)
                      });

                      if (!response.ok) {
                        const errorText = await response.text();
                        console.error('HTTP Error:', errorText);
                        throw new Error(`HTTP error! status: ${response.status}`);
                      }

                      const result = await response.json();
                      console.log('API Result:', result);

                      toast.dismiss();
                      toast.success('Deal created successfully');
                      setDealCounts(prev => ({ ...prev, [selectedUser?.id]: (prev[selectedUser?.id] || 0) + 1 }));
                      setShowCreateDealModal(false);
                      setDealName('');
                      setDealClosingDate('');
                      setDealStage('');
                      setDealAmount('');
                      setDealProbability('');
                      setDealDescription('');
                      setDealType('');
                      fetchDeals(selectedUser?.id);
                    } catch (err) {
                      console.error('Error creating deal:', err);
                      toast.dismiss();
                      toast.error('Failed to create deal');
                    }
                  } else {
                    toast.error('Please fill in required fields');
                  }
                }} style={{ background: 'var(--green-600)', color: '#fff', border: 'none', borderRadius: 'var(--r)', padding: '8px 20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(16,185,129,0.2)' }}>Save Deal</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Deal Information Modal ── */}
        {showDealInfoModal && selectedDeal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
            <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--r)', maxWidth: '900px', width: '92%', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              {/* Modal header */}
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
                  Deal Information
                </h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => { setDealToDelete(selectedDeal); setShowDeleteDealModal(true); }}
                    style={{
                      padding: '8px 16px',
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: 'var(--r)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Delete Deal
                  </button>
                  <button
                    onClick={() => { setShowDealInfoModal(false); setSelectedDeal(null); setEditingDealField(null); setEditDealValue(''); }}
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
              </div>
              
              {/* Modal body: single column layout for deal info */}
              <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Deal Details Section */}
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
                      Deal Details
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <EditableDealField label="Deal Name" value={selectedDeal.deal_name} fieldName="deal_name" />
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Contact Name</label>
                        <div style={{ 
                          padding: '8px 12px', 
                          background: 'var(--gray-100)', 
                          border: '1px solid var(--border)', 
                          borderRadius: 'var(--r)', 
                          fontSize: '12px', 
                          color: 'var(--text)' 
                        }}>{selectedDeal.contact_name}</div>
                      </div>
                      <EditableDealField label="Amount" value={selectedDeal.amount?.replace('₹', '') || ''} fieldName="deal_amount" type="number" />
                      <EditableDealField label="Closing Date" value={selectedDeal.closing_date !== '-' ? selectedDeal.closing_date : ''} fieldName="deal_close_date" type="date" />
                      <EditableDealField label="Deal Type" value={selectedDeal.deal_type || ''} fieldName="deal_type" type="select" options={predefinedDealTypes} />
                      <EditableDealField label="Deal Stage" value={selectedDeal.deal_stage || ''} fieldName="deal_stage" type="select" options={predefinedDealStages} />
                      {(user?.role?.toLowerCase().trim() === 'operation' || user?.role?.toLowerCase().trim() === 'operations') ? (
                        <EditableDealField label="Deal Owner" value={selectedDeal.contact_owner || ''} fieldName="contact_owner" type="select" options={predefinedContactOwners} />
                      ) : (
                        <div>
                          <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Deal Owner</label>
                          <div style={{ 
                            padding: '8px 12px', 
                            background: 'var(--gray-100)', 
                            border: '1px solid var(--border)', 
                            borderRadius: 'var(--r)', 
                            fontSize: '12px', 
                            color: 'var(--text)' 
                          }}>{selectedDeal.contact_owner || '-'}</div>
                        </div>
                      )}
                      <EditableDealField label="Probability" value={selectedDeal.probability?.replace('%', '') || ''} fieldName="deal_probability" type="number" />
                    </div>
                  </div>

                  {/* Description Section */}
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
                      Description
                    </h3>
                    <EditableDealField label="Description" value={selectedDeal?.description || ''} fieldName="description" type="textarea" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete Deal Confirmation Modal ── */}
        {showDeleteDealModal && dealToDelete && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002 }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', maxWidth: '400px', width: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                  </svg>
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>Delete Deal?</h3>
                <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
                  Are you sure you want to delete <strong>{dealToDelete.deal_name}</strong>? This action cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button onClick={() => { setShowDeleteDealModal(false); setDealToDelete(null); }} style={{ backgroundColor: '#fff', color: '#475569', border: '2px solid #e2e8f0', borderRadius: '10px', padding: '10px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleDeleteDeal} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Create Task Modal ── */}
        {showCreateTaskModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002 }}>
            <div style={{ position: 'relative', background: 'var(--surface)', borderRadius: '12px', width: '450px', maxWidth: '90%', boxShadow: '0 20px 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>Create Task</h3>
                <button onClick={() => setShowCreateTaskModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '4px' }}>
                  <X size={20} />
                </button>
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-3)', fontSize: '12px', fontWeight: '500', marginBottom: '6px' }}>Task Type</label>
                  <select
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '13px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', cursor: 'pointer' }}
                  >
                    <option value="">Select task type</option>
                    <option value="mail">Mail</option>
                    <option value="call">Call</option>
                    <option value="meet">Meet</option>
                    <option value="proposal">Proposal</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-3)', fontSize: '12px', fontWeight: '500', marginBottom: '6px' }}>Due Date</label>
                  <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '13px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-3)', fontSize: '12px', fontWeight: '500', marginBottom: '6px' }}>Status</label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '13px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', cursor: 'pointer' }}
                  >
                    <option value="">Choose a Task status</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Due For">Due For</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-3)', fontSize: '12px', fontWeight: '500', marginBottom: '6px' }}>Task Owner</label>
                  <input type="text" value={user?.name || user?.phone_number || 'operation'} readOnly style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '13px', outline: 'none', backgroundColor: 'var(--gray-100)', color: 'var(--text-3)', cursor: 'not-allowed' }} />
                </div>
              </div>
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: 'var(--surface)', flexShrink: 0 }}>
                <button onClick={() => { setShowCreateTaskModal(false); setTaskName(''); setTaskDueDate(''); setTaskStatus('Pending'); }} style={{ backgroundColor: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '8px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleAddTask} disabled={addingTask} style={{ background: 'var(--green-600)', color: '#fff', border: 'none', borderRadius: 'var(--r)', padding: '8px 20px', fontSize: '13px', fontWeight: '500', cursor: addingTask ? 'not-allowed' : 'pointer' }}>{addingTask ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Edit Task Modal ── */}
        {showEditTaskModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002 }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', maxWidth: '450px', width: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Edit Task</h3>
                <button onClick={() => { setShowEditTaskModal(false); setEditingTask(null); setTaskName(''); setTaskDueDate(''); setTaskStatus('Pending'); }} style={{ backgroundColor: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                  <X size={18} />
                </button>
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#334155', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Task Type</label>
                  <select
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#fafbfc', color: '#1e293b', cursor: 'pointer' }}
                  >
                    <option value="">Select task type</option>
                    <option value="mail">Mail</option>
                    <option value="call">Call</option>
                    <option value="meet">Meet</option>
                    <option value="proposal">Proposal</option>

                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#334155', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Due Date</label>
                  <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#fafbfc', color: '#1e293b' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#334155', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Status</label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#fafbfc', color: '#1e293b', cursor: 'pointer' }}
                  >
                    
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Due For">Due For</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#334155', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Task Owner</label>
                  <input type="text" value={user?.name || user?.phone_number || 'operation'} readOnly style={{ width: '100%', padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }} />
                </div>
              </div>
              <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#fafbfc', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                <button onClick={() => { setShowEditTaskModal(false); setEditingTask(null); setTaskName(''); setTaskDueDate(''); setTaskStatus('Pending'); }} style={{ backgroundColor: '#fff', color: '#475569', border: '2px solid #e2e8f0', borderRadius: '8px', padding: '8px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleUpdateTask} disabled={addingTask} style={{ background: addingTask ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 24px', fontSize: '14px', fontWeight: '600', cursor: addingTask ? 'not-allowed' : 'pointer' }}>{addingTask ? 'Updating...' : 'Update'}</button>
              </div>
            </div>
          </div>
        )}
        </>

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
                        operator: (property === 'contact_name' || property === 'created_by' || property === 'modified_by' || property === 'mailing_city' || property === 'lead_source' || property === 'description') ? 'is' : ''
                      };

                      if (property === 'created_time' || property === 'modified_time') {
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
                  <option value="tag">Tags</option>
                  <option value="mailing_country">Country</option>
                  <option value="mailing_state">State</option>
                  <option value="mailing_city">City</option>
                  <option value="created_by">Created By</option>
                  <option value="modified_by">Modified By</option>
                </select>
              </div>

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

                  {prop.property === 'mailing_city' && (
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
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
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
                            <option value="">All Cities</option>
                            {getUniqueValues(prop.property).map(value => (
                              <option key={value} value={value}>{value}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {prop.property === 'created_by' && (
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
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
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
                            <option value="">All Created By</option>
                            {getUniqueValues(prop.property).map(value => (
                              <option key={value} value={value}>{value}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {prop.property === 'modified_by' && (
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
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
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
                            <option value="">All Modified By</option>
                            {getUniqueValues(prop.property).map(value => (
                              <option key={value} value={value}>{value}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {prop.property === 'created_time' && (
                    <div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <select
                          value={prop.dateOperator || 'on'}
                          onChange={(e) => {
                            const updated = [...selectedProperties];
                            updated[index].dateOperator = e.target.value;
                            updated[index].value = '';
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
                        </select>
                      </div>

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
                    </div>
                  )}

                  {prop.property === 'modified_time' && (
                    <div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <select
                          value={prop.dateOperator || 'on'}
                          onChange={(e) => {
                            const updated = [...selectedProperties];
                            updated[index].dateOperator = e.target.value;
                            updated[index].value = '';
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
                        </select>
                      </div>

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
                    </div>
                  )}

                  {prop.property === 'account_type' && (
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
                      <option value="">Select value</option>
                      {predefinedAccountTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  )}

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
                                {predefinedAccountTypes.filter(tag => !prop.searchTerm || tag.toLowerCase().includes(prop.searchTerm.toLowerCase()))
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

                  {prop.property !== 'contact_name' && prop.property !== 'contact_owner' && prop.property !== 'lead_status' && prop.property !== 'tag' && prop.property !== 'mailing_country' && prop.property !== 'mailing_state' && prop.property !== 'mailing_city' && prop.property !== 'created_time' && prop.property !== 'modified_time' && prop.property !== 'industry' && prop.property !== 'account_type' && prop.property !== 'created_by' && prop.property !== 'modified_by' && prop.property !== 'lead_source' && prop.property !== 'description' && (
                    <input
                      type="text"
                      value={prop.value}
                      onChange={(e) => {
                        const updated = [...selectedProperties];
                        updated[index].value = e.target.value;
                        setSelectedProperties(updated);
                      }}
                      placeholder="Enter value"
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
                    setSelectedProperties([]);
                    setCurrentProperty('');
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
                        const countriesString = selectedCountries.join(',');
                        activeFilters.push({
                          property: 'mailing_country',
                          value: countriesString,
                          operator: mailingCountryProp.operator
                        });
                      }
                    }

                    // Add created_by filter if configured
                    const createdByProp = selectedProperties.find(prop => prop.property === 'created_by');
                    if (createdByProp && createdByProp.value) {
                      activeFilters.push({
                        property: 'created_by',
                        value: createdByProp.value,
                        operator: createdByProp.operator || 'is'
                      });
                    }

                    // Add modified_by filter if configured
                    const modifiedByProp = selectedProperties.find(prop => prop.property === 'modified_by');
                    if (modifiedByProp && modifiedByProp.value) {
                      activeFilters.push({
                        property: 'modified_by',
                        value: modifiedByProp.value,
                        operator: modifiedByProp.operator || 'is'
                      });
                    }

                    // Add city filter if configured
                    const cityProp = selectedProperties.find(prop => prop.property === 'mailing_city');
                    if (cityProp && cityProp.value) {
                      activeFilters.push({
                        property: 'mailing_city',
                        value: cityProp.value,
                        operator: cityProp.operator || 'is'
                      });
                    }

                    // Add lead_source filter if configured
                    const leadSourceProp = selectedProperties.find(prop => prop.property === 'lead_source');
                    if (leadSourceProp && leadSourceProp.value) {
                      activeFilters.push({
                        property: 'lead_source',
                        value: leadSourceProp.value,
                        operator: leadSourceProp.operator || 'is'
                      });
                    }

                    // Add description filter if configured
                    const descriptionProp = selectedProperties.find(prop => prop.property === 'description');
                    if (descriptionProp && descriptionProp.value) {
                      activeFilters.push({
                        property: 'description',
                        value: descriptionProp.value,
                        operator: descriptionProp.operator || 'is'
                      });
                    }

                    // Add created_time filter if configured
                    const createdTimeProp = selectedProperties.find(prop => prop.property === 'created_time');
                    if (createdTimeProp) {
                      if ((createdTimeProp.dateOperator === 'on' || createdTimeProp.dateOperator === 'before' || createdTimeProp.dateOperator === 'after') && createdTimeProp.value) {
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

      </div>
    </div>
  );
}
