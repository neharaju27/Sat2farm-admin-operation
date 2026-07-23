import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Plus, Edit, Trash2, Eye, Phone, Mail, Calendar, MapPin, TrendingUp, Users, DollarSign, Activity, ChevronDown, ChevronRight, X, Check, Clock, AlertCircle, FileText, ChevronLeft, Upload, ChevronDown as ChevronDownIcon, User, Building, Tag, Briefcase, Globe, Map, CreditCard, MessageSquare, FileEdit, UserCheck, Building2, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/Sat2FarmAdminPortal.css';

export default function LeadPipeline({ onPageChange }) {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalLeads, setTotalLeads] = useState(0);

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

  // ── Edit dialog state ─────────────────────────────────────────────────────────
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editDialogField, setEditDialogField] = useState('');
  const [editDialogValue, setEditDialogValue] = useState('');
  const [editDialogRowId, setEditDialogRowId] = useState(null);
  const [editDialogDropdownOpen, setEditDialogDropdownOpen] = useState(false);
  const [showEditDialogCustomInput, setShowEditDialogCustomInput] = useState(false);
  const [editDialogCustomValue, setEditDialogCustomValue] = useState('');

  // ── Get predefined options for field ───────────────────────────────────────────
  const getFieldOptions = (fieldName) => {
    const optionMap = {
      'leadStatus': Object.keys(statusConfig),
      'industry': predefinedIndustries,
      'contactOwner': predefinedContactOwners,
      'leadSource': predefinedLeadSources,
      'tags': predefinedTags
    };
    return optionMap[fieldName] || null;
  };

  const isFieldWithDropdown = (fieldName) => {
    return getFieldOptions(fieldName) !== null;
  };

  // ── Edit dialog handlers ─────────────────────────────────────────────────────
  const openEditDialog = (rowId, fieldName, currentValue) => {
    setEditDialogRowId(rowId);
    setEditDialogField(fieldName);
    setEditDialogValue(currentValue);
    setEditDialogDropdownOpen(false);
    setShowEditDialogCustomInput(false);
    setEditDialogCustomValue('');
    setShowEditDialog(true);
  };

  const closeEditDialog = () => {
    setShowEditDialog(false);
    setEditDialogField('');
    setEditDialogValue('');
    setEditDialogRowId(null);
    setEditDialogDropdownOpen(false);
    setShowEditDialogCustomInput(false);
    setEditDialogCustomValue('');
  };

  const handleEditDialogSave = async () => {
    const valueToSave = showEditDialogCustomInput ? editDialogCustomValue : editDialogValue;
    if (!valueToSave.trim() || !editDialogRowId || !editDialogField) {
      toast.error('Please enter a value');
      return;
    }

    await handleFieldUpdate(editDialogRowId, editDialogField, valueToSave.trim());
    
    // Update predefined options if custom value was added
    if (showEditDialogCustomInput && valueToSave.trim()) {
      if (editDialogField === 'industry') {
        setPredefinedIndustries([...predefinedIndustries, valueToSave.trim()]);
      } else if (editDialogField === 'contactOwner') {
        setPredefinedContactOwners([...predefinedContactOwners, valueToSave.trim()]);
      } else if (editDialogField === 'leadSource') {
        setPredefinedLeadSources([...predefinedLeadSources, valueToSave.trim()]);
      } else if (editDialogField === 'tags') {
        setPredefinedTags([...predefinedTags, valueToSave.trim()]);
      }
    }
    
    closeEditDialog();
  };

  const handleEditDialogOptionSelect = (value) => {
    setEditDialogValue(value);
    setEditDialogDropdownOpen(false);
  };

  const handleEditDialogCustomInput = () => {
    setEditDialogCustomValue(editDialogValue);
    setShowEditDialogCustomInput(true);
    setEditDialogDropdownOpen(false);
  };

  // ── Close all dropdowns when one is opened ─────────────────────────────────
  const closeAllDropdowns = () => {
    setStatusDropdownOpen(false);
    setOwnerDropdownOpen(false);
    setTagsDropdownOpen(false);
    setLeadSourceDropdownOpen(false);
    setIndustryDropdownOpen(false);
  };

  // ── Close dropdowns when clicking outside ─────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('[data-dropdown]')) {
        closeAllDropdowns();
      }
      if (!event.target.closest('[data-editable-field]') && editingField) {
        cancelEdit();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingField]);

  // ── Tab state for modal right panel ──────────────────────────────────────
  const [activeModalTab, setActiveModalTab] = useState('timeline');
  const [showCreateDealModal, setShowCreateDealModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [timelineData, setTimelineData] = useState([]); // Timeline data
  const [timelineLoading, setTimelineLoading] = useState(false); // Timeline loading state
  const [taskName, setTaskName] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskOwner, setTaskOwner] = useState('');
  const [taskStatus, setTaskStatus] = useState('Pending');
  const [noteInput, setNoteInput] = useState('');
  const [activities, setActivities] = useState([]);
  const [addingNote, setAddingNote] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  
  const [contactOwnerFilter, setContactOwnerFilter] = useState('');
  const [contactOwnerFilterOperator, setContactOwnerFilterOperator] = useState('is');
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [currentFilterCriteria, setCurrentFilterCriteria] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRows, setSelectedRows] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [newThisWeekFilter, setNewThisWeekFilter] = useState(false);
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState([]); // Array of {property, value, operator} objects
  const [currentProperty, setCurrentProperty] = useState('');
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [showUpdateFieldsModal, setShowUpdateFieldsModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFieldToUpdate, setSelectedFieldToUpdate] = useState('');
  const [updateFieldValue, setUpdateFieldValue] = useState('');
  const [updateNewFieldValue, setUpdateNewFieldValue] = useState('');
  const [convertAccountName, setConvertAccountName] = useState('');
  const [convertWebsite, setConvertWebsite] = useState('');
  const [convertAccountType, setConvertAccountType] = useState('');

  // Helper to construct query parameter keys with _is or _is_not suffixes
  const getFilterQueryParamKey = (property, operator = 'is') => {
    const fieldMap = {
      'contact_owner': 'owner',
      'owner': 'owner',
      'lead_status': 'status',
      'status': 'status',
      'tag': 'tags',
      'tags': 'tags',
      'lead_source': 'lead_source',
      'mailing_city': 'city',
      'city': 'city',
      'mailing_state': 'state',
      'state': 'state',
      'mailing_country': 'country',
      'country': 'country',
      'description': 'description',
      'created_by': 'created_by',
      'modified_by': 'modified_by'
    };
    const baseKey = fieldMap[property] || property;
    const opLower = String(operator || '').toLowerCase().trim();
    const isNot = opLower.includes('not') || opLower.includes("isn't") || opLower.includes('isnt') || opLower === 'is_not';
    const suffix = isNot ? '_is_not' : '_is';
    return `${baseKey}${suffix}`;
  };

  // Fetch leads from API (standardized user, offset, limit and filter integration with graceful fallback)
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const currentUserName = user?.name || user?.phone_number || 'operation';
        
        let url;
        const isSearching = typeof searchTerm !== 'undefined' && searchTerm.trim() !== '';
        const fetchLimit = isSearching ? 1000 : limit;
        const fetchOffset = isSearching ? 0 : offset;

        const hasActiveFilter = (typeof isFilterApplied !== 'undefined' && isFilterApplied) || 
                                (typeof filterStatus !== 'undefined' && filterStatus !== 'all') || 
                                isSearching || 
                                (typeof newThisWeekFilter !== 'undefined' && newThisWeekFilter) || 
                                (typeof contactOwnerFilter !== 'undefined' && contactOwnerFilter !== '') || 
                                (isFilterApplied && typeof selectedProperties !== 'undefined' && selectedProperties.length > 0);

        let response;
        if (hasActiveFilter && import.meta.env.VITE_FILTER_LEADS_API_URL) {
          try {
            const params = new URLSearchParams({
              user: currentUserName,
              offset: fetchOffset.toString(),
              limit: fetchLimit.toString()
            });

            if (typeof filterStatus !== 'undefined' && filterStatus !== 'all') {
              params.append('status_is', filterStatus);
            }
            if (typeof searchTerm !== 'undefined' && searchTerm.trim()) {
              params.append('search', searchTerm.trim());
            }
            if (typeof contactOwnerFilter !== 'undefined' && contactOwnerFilter) {
              const opLower = String(contactOwnerFilterOperator || '').toLowerCase().trim();
              const isNot = opLower.includes('not') || opLower.includes("isn't") || opLower.includes('isnt') || opLower === 'is_not';
              const ownerKey = isNot ? 'owner_is_not' : 'owner_is';
              params.append(ownerKey, contactOwnerFilter);
            }
            if (typeof newThisWeekFilter !== 'undefined' && newThisWeekFilter) {
              const sevenDaysAgoStr = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
              params.append('created_time_after', sevenDaysAgoStr);
            }
            if (isFilterApplied && typeof selectedProperties !== 'undefined' && selectedProperties.length > 0) {
              selectedProperties.forEach(p => {
                if (p.property && p.value) {
                  const paramKey = getFilterQueryParamKey(p.property, p.operator || 'is');
                  params.append(paramKey, p.value);
                }
              });
            }
            url = `${import.meta.env.VITE_FILTER_LEADS_API_URL}?${params.toString()}`;
            response = await fetch(url);
          } catch (filterErr) {
            console.warn('Filter API fetch failed, falling back to main leads API:', filterErr);
          }
        }

        // If no active filter or if filter API request failed/returned non-ok status, call main leads URL
        if (!response || !response.ok) {
          url = `${import.meta.env.VITE_LEADS_API_URL}?user=${encodeURIComponent(currentUserName)}&offset=${fetchOffset}&limit=${fetchLimit}`;
          response = await fetch(url);
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('API Response structure:', data);
        
        // Handle paginated API response structure
        let leadsArray = data;
        let totalCount = 0;
        
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          // API returns paginated response object with metadata
          console.log('API response keys:', Object.keys(data));
          leadsArray = data.data || data.results || data.leads || data.items || data.records || data.rows || [];
          
          // Fallback: find the first array property in the response
          if (!Array.isArray(leadsArray) || leadsArray.length === 0) {
            for (const key in data) {
              if (Array.isArray(data[key]) && data[key].length > 0) {
                console.log(`Found leads array in property: ${key}`);
                leadsArray = data[key];
                break;
              }
            }
          }
          
          totalCount = data.total || data.count || data.total_count || 0;
          setTotalLeads(totalCount);
        } else if (Array.isArray(data)) {
          totalCount = data.length;
          setTotalLeads(totalCount);
        }
        
        // Validate that data is an array before mapping
        if (!Array.isArray(leadsArray)) {
          console.error('API response is not an array:', data);
          setLeads([]);
          setError('Invalid data format received from server');
          return;
        }
        
        // Transform API data to match component structure
        const transformedLeads = leadsArray.map(lead => ({
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
  }, [offset, limit, user, isFilterApplied, filterStatus, searchTerm, newThisWeekFilter, contactOwnerFilter]);

  const [allLeadsData, setAllLeadsData] = useState([]);

  const [isFetchingFilterOptions, setIsFetchingFilterOptions] = useState(true);
  const [filterFetchProgress, setFilterFetchProgress] = useState(0);

  // Optimized: parallel batch fetching — all remaining batches fire simultaneously
  // after first response reveals total count. Reduces N×RTT to ~2×RTT.
  useEffect(() => {
    let active = true;

    const fetchAllLeadsForFilters = async () => {
      const currentUserName = user?.name || user?.phone_number || 'operation';
      const apiUrl = import.meta.env.VITE_LEADS_API_URL;
      if (!apiUrl) {
        if (active) setIsFetchingFilterOptions(false);
        return;
      }

      const batchLimit = 1000;
      const buildUrl = (offset) =>
        `${apiUrl}?user=${encodeURIComponent(currentUserName)}&offset=${offset}&limit=${batchLimit}`;
      const parseItems = (data) =>
        Array.isArray(data) ? data : (data.data || data.results || data.leads || data.records || data.items || []);

      try {
        if (active) {
          setIsFetchingFilterOptions(true);
          setFilterFetchProgress(10);
        }

        // --- Step 1: First batch ---
        const firstRes = await fetch(buildUrl(0));
        if (!firstRes.ok || !active) return;
        const firstData = await firstRes.json();
        if (!active) return;

        const firstItems = parseItems(firstData);
        if (!firstItems.length) {
          if (active) {
            setFilterFetchProgress(100);
            setIsFetchingFilterOptions(false);
          }
          return;
        }

        let allFetched = [...firstItems];
        const totalCount = firstData.total || firstData.count || firstData.total_count || 0;

        if (totalCount > batchLimit) {
          const offsets = [];
          for (let o = batchLimit; o < Math.min(totalCount, 30000); o += batchLimit) {
            offsets.push(o);
          }

          if (active) setFilterFetchProgress(30);

          const batchResponses = await Promise.all(
            offsets.map(o => fetch(buildUrl(o)).then(r => (r.ok ? r.json() : null)).catch(() => null))
          );

          if (!active) return;

          for (const batchData of batchResponses) {
            if (batchData) {
              const items = parseItems(batchData);
              allFetched = allFetched.concat(items);
            }
          }
        } else if (firstItems.length === batchLimit) {
          // Fetch subsequent batches in parallel chunks of 5
          let currentOffset = batchLimit;
          let keepGoing = true;

          while (keepGoing && currentOffset < 30000 && active) {
            const chunkOffsets = [
              currentOffset,
              currentOffset + batchLimit,
              currentOffset + batchLimit * 2,
              currentOffset + batchLimit * 3,
              currentOffset + batchLimit * 4
            ];

            if (active) {
              const approxProgress = Math.min(Math.round((allFetched.length / (allFetched.length + 3000)) * 100), 95);
              setFilterFetchProgress(approxProgress);
            }

            const chunkResults = await Promise.all(
              chunkOffsets.map(o => fetch(buildUrl(o)).then(r => (r.ok ? r.json() : null)).catch(() => null))
            );

            if (!active) return;

            for (const batchData of chunkResults) {
              if (!batchData) {
                keepGoing = false;
                break;
              }
              const items = parseItems(batchData);
              allFetched = allFetched.concat(items);
              if (items.length < batchLimit) {
                keepGoing = false;
                break;
              }
            }

            currentOffset += batchLimit * 5;
          }
        }

        if (!active) return;

        setFilterFetchProgress(99);

        // --- Step 3: Transform ---
        const transformed = allFetched.map(lead => ({
          id: lead.id,
          contactName: lead.full_name || lead.contact_name || lead.name || '',
          phoneNumber: lead.phone || lead.phone_number || '',
          alternateNumber: lead.alternate_number || '',
          email: lead.email || '',
          companyName: lead.company_name || lead.company || '',
          contactOwner: lead.owner || lead.contact_owner || lead.owner_name || '',
          city: lead.city || lead.mailing_city || '',
          state: lead.state || lead.mailing_state || '',
          country: lead.country || lead.mailing_country || 'IN',
          leadStatus: lead.status || lead.lead_status || '',
          tags: lead.tags || lead.tag || '',
          leadSource: lead.lead_source || lead.source || '',
          description: lead.description || '',
          createdTime: lead.created_time || lead.created_at || '',
          industry: lead.industry || '',
          createdBy: lead.created_by || lead.createdBy || lead.created_user || lead.creator || lead.created_by_name || '',
          modifiedBy: lead.modified_by || lead.modifiedBy || lead.modified_user || lead.modifier || lead.modified_by_name || '',
          lastActivity: lead.last_activity || lead.updated_at || '',
          _raw: lead
        }));

        if (active) {
          setAllLeadsData(transformed);
          setFilterFetchProgress(100);
        }
      } catch (err) {
        console.warn('Failed to fetch full leads dataset for filter options:', err);
      } finally {
        if (active) {
          setIsFetchingFilterOptions(false);
        }
      }
    };

    fetchAllLeadsForFilters();

    return () => {
      active = false;
    };
  }, [user?.name, user?.phone_number]);

  // Memoized unique values map — recomputes only when allLeadsData changes, not on every render
  const uniqueValuesMap = useMemo(() => {
    const propertyMap = {
      'contact_owner': ['contactOwner', 'owner', 'contact_owner', 'owner_name'],
      'lead_status':   ['leadStatus', 'status', 'lead_status'],
      'tag':           ['tags', 'tag'],
      'mailing_country': ['country', 'mailing_country'],
      'mailing_state': ['state', 'mailing_state'],
      'mailing_city':  ['city', 'mailing_city'],
      'mailing_street':['companyName', 'company_name', 'street'],
      'created_by':    ['createdBy', 'created_by', 'created_user', 'creator', 'created_by_name'],
      'modified_by':   ['modifiedBy', 'modified_by', 'modified_user', 'modifier', 'modified_by_name'],
      'lead_source':   ['leadSource', 'lead_source', 'source'],
      'pipeline_stage':['leadStatus', 'status'],
      'contact_name':  ['contactName', 'contact_name', 'full_name', 'name'],
      'industry':      ['industry'],
      'account_type':  ['accountType', 'account_type']
    };

    const sourceData = (allLeadsData && allLeadsData.length > 0) ? allLeadsData : leads;
    const result = {};

    for (const [property, possibleFields] of Object.entries(propertyMap)) {
      if (property === 'tag') {
        const allTags = sourceData.flatMap(item => {
          const tagStr = item.tags || (item._raw && (item._raw.tags || item._raw.tag)) || '';
          return (tagStr && typeof tagStr === 'string' && tagStr.trim())
            ? tagStr.split(',').map(t => t.trim()).filter(Boolean)
            : [];
        });
        result[property] = [...new Set(allTags)].sort((a, b) => String(a).localeCompare(String(b)));
        continue;
      }

      const extracted = sourceData.flatMap(item => {
        const vals = [];
        for (const field of possibleFields) {
          if (item[field]) vals.push(item[field]);
          if (item._raw && item._raw[field]) vals.push(item._raw[field]);
        }
        return vals;
      }).filter(val => val && String(val).trim() !== '' && String(val).toLowerCase() !== 'null' && String(val).toLowerCase() !== 'undefined');

      result[property] = [...new Set(extracted)].sort((a, b) => String(a).localeCompare(String(b)));
    }
    return result;
  }, [allLeadsData, leads]);

  // Get unique values for a property — reads from memoized cache
  const getUniqueValues = (property) => uniqueValuesMap[property] || [];

  // Get unique contact owners from leads data
  const getUniqueContactOwners = () => {
    return getUniqueValues('contact_owner');
  };

  // Get unique tags from leads data
  const getUniqueTags = () => {
    const allTags = leads.flatMap(lead => {
      if (lead.tags && lead.tags.trim()) {
        return lead.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
      return [];
    });
    return [...new Set(allTags)].sort();
  };

  // Get icon for timeline field
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
      toast.error('No lead selected');
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

  // Add task using API
  const handleAddTask = async () => {
    if (!taskName.trim()) {
      toast.error('Please enter task name');
      return;
    }

    if (!selectedUser) {
      toast.error('No lead selected');
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

  const [statusConfig, setStatusConfig] = useState(() => {
    const saved = localStorage.getItem('statusConfig');
    return saved ? JSON.parse(saved) : {
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
  });

  // Save to localStorage when statusConfig changes
  useEffect(() => {
    localStorage.setItem('statusConfig', JSON.stringify(statusConfig));
  }, [statusConfig]);

  const getLeadsByStatus = (status) => {
    return leads.filter(lead => lead.leadStatus === status);
  };

  const getStatusSummary = () => {
    const counts = {};
    leads.forEach(lead => {
      const status = lead.leadStatus || 'Unknown';
      counts[status] = (counts[status] || 0) + 1;
    });

    const allowedStatuses = ['Enterprise', 'Growth', 'Starter', 'In Discussion'];

    const orderedStatuses = allowedStatuses.filter(status => counts[status] > 0);

    return orderedStatuses.map(status => ({
      status,
      count: counts[status] || 0,
      color: statusConfig[status]?.color || '#6b7280',
      label: statusConfig[status]?.label || status
    }));
  };

  const handleStatusSummaryClick = (status) => {
    setFilterStatus(prev => (prev === status ? 'all' : status));
    setOffset(0);
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

      const currentUser = user?.name || user?.phone_number || 'operation';
      const response = await fetch(`${import.meta.env.VITE_DOWNLOAD_LEADS_CSV_URL}?user=${encodeURIComponent(currentUser)}`, {
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
    const term = (searchTerm || '').toLowerCase().trim();
    const matchesSearch = !term ||
      (lead.contactName && lead.contactName.toLowerCase().includes(term)) ||
      (lead.companyName && lead.companyName.toLowerCase().includes(term)) ||
      (lead.email && lead.email.toLowerCase().includes(term)) ||
      (lead.phoneNumber && lead.phoneNumber.toString().includes(term)) ||
      (lead.alternateNumber && lead.alternateNumber.toString().includes(term)) ||
      (lead.city && lead.city.toLowerCase().includes(term)) ||
      (lead.state && lead.state.toLowerCase().includes(term)) ||
      (lead.country && lead.country.toLowerCase().includes(term)) ||
      (lead.contactOwner && lead.contactOwner.toLowerCase().includes(term)) ||
      (lead.leadStatus && lead.leadStatus.toLowerCase().includes(term)) ||
      (lead.tags && lead.tags.toLowerCase().includes(term)) ||
      (lead.leadSource && lead.leadSource.toLowerCase().includes(term)) ||
      (lead.description && lead.description.toLowerCase().includes(term));
    
    // New This Week filter
    let isNewThisWeek = true;
    if (newThisWeekFilter) {
      if (!lead.createdTime) {
        isNewThisWeek = false;
      } else {
        const str = String(lead.createdTime).trim().replace(' ', 'T');
        const createdDate = new Date(str);
        const now = new Date();
        const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        isNewThisWeek = !isNaN(createdDate.getTime()) && createdDate >= sevenDaysAgo;
      }
    }
    
    const matchesStatus = filterStatus === 'all' || lead.leadStatus === filterStatus;

    return matchesSearch && (!newThisWeekFilter || isNewThisWeek) && matchesStatus;
  });

  const isSearching = typeof searchTerm !== 'undefined' && searchTerm.trim() !== '';
  const isClientPaginated = isSearching || newThisWeekFilter || isFilterApplied;
  const displayedLeads = isClientPaginated
    ? filteredLeads.slice(offset, offset + limit)
    : filteredLeads;
  const effectiveTotalLeads = isClientPaginated
    ? filteredLeads.length
    : (totalLeads || leads.length);

  const statusSummary = getStatusSummary();  

  // Pagination - using server-side pagination
  const totalPages = Math.ceil(effectiveTotalLeads / limit);
  const currentPage = Math.floor(offset / limit) + 1;


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

    // Show updating message
    toast.loading('Updating...', { id: 'field-update' });

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
      } else if (fieldName === 'description') {
        url = `${import.meta.env.VITE_UPDATE_LEAD_DESCRIPTION_API_URL}?id=${leadId}&description=${encodeURIComponent(newValue)}`;
        successMessage = `Description updated successfully!`;
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
          // Auto-refresh timeline for this lead
          fetchTimeline(leadId);
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
        toast.success(fieldMessages[fieldName] || `${fieldName} updated`, { id: 'field-update' });
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
            // Auto-refresh timeline for this lead
            fetchTimeline(leadId);
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
          toast.success(fieldMessages[fieldName] || `${fieldName} updated`, { id: 'field-update' });
        } else {
          // Genuine error
          // alert(`Failed to update lead ${fieldName}: ${message}`); // Removed alert
        }
      }
    } catch (err) {
      console.error('Network error updating lead field:', err);
      toast.error('Failed to update field', { id: 'field-update' });
    }
  };

  const startEditing = (fieldName, currentValue) => {
    closeAllDropdowns();
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
      const currentUser = user?.name || user?.phone_number || 'operation';
      let url = `${import.meta.env.VITE_DOWNLOAD_LEADS_CSV_URL}?user=${encodeURIComponent(currentUser)}`;
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
    toast.loading('Adding lead...', { id: 'create-lead' });
    
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
        toast.dismiss('create-lead');
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API result:', result);
      
      if (result.success || result.message || response.ok) {
        console.log('Lead creation successful');
        // Refresh the leads list
        fetchLeads();
        setShowAddModal(false);
        toast.dismiss('create-lead');
        toast.success('Lead created successfully!');
      } else {
        console.error('API returned failure:', result);
        toast.dismiss('create-lead');
        toast.error('Failed to create lead');
      }
    } catch (err) {
      console.error('Network error creating lead:', err);
      toast.dismiss('create-lead');
      alert(`Network error: ${err.message || 'Unknown error occurred'}`);
    }
  };

  const handleCombinedFilters = async (filters) => {
    console.log('Applying combined filters:', filters);
    
    try {
      let url = `${import.meta.env.VITE_FILTER_LEADS_API_URL}?`;
      const urlParams = [];
      
      // Add base parameters
      const currentUserName = user?.name || user?.phone_number || 'operation';
      urlParams.push(`user=${encodeURIComponent(currentUserName)}`);
      urlParams.push('status_is_not=junk');
      
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
        
        console.log('Setting filtered leads:', transformedLeads.length);
        console.log('Filtered leads sample:', transformedLeads.slice(0, 3));
        
        // Debug: Show unique states in the data
        const uniqueStates = [...new Set(transformedLeads.map(lead => lead.state).filter(state => state))];
        console.log('Unique states in data:', uniqueStates);
        
        // Debug: Show Karnataka records
        const karnatakaRecords = transformedLeads.filter(lead => 
          lead.state && lead.state.toLowerCase().includes('karnatak')
        );
        console.log('Records with Karnataka in state:', karnatakaRecords.length);
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
        
        // Show toast message for successful filtering
        const filterCount = result.total || transformedLeads.length;
        if (filters.length === 1) {
          toast.success(`Filter applied: ${filterDescriptions[0]} (${filterCount} records found)`);
        } else {
          toast.success(`${filters.length} filters applied (${filterCount} records found)`);
        }
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
  const [predefinedTags, setPredefinedTags] = useState(() => {
    const saved = localStorage.getItem('predefinedTags');
    return saved ? JSON.parse(saved) : ['Sat2Farm Recurring', 'Sat2Farm Non Recurring', 'Sat2Farm Exclusivity', 'Sat4Agri', 'Sat4Risk', 'Project', 'WhiteLabelling', 'API Client','Positive response'];
  });

  // Predefined lead source options
  const [predefinedLeadSources, setPredefinedLeadSources] = useState(() => {
    const saved = localStorage.getItem('predefinedLeadSources');
    return saved ? JSON.parse(saved) : ['FB Campaign', 'Website Inbound', 'Sales Inbound', 'Mail Inbound', 'External Referral', 'Cold Call', 'Event'];
  });

  // Predefined industry options
  const [predefinedIndustries, setPredefinedIndustries] = useState(() => {
    const saved = localStorage.getItem('predefinedIndustries');
    return saved ? JSON.parse(saved) : ['Farmer', 'FPO', 'NGO', 'Government', 'Enterprise', 'Agri Input', 'Agri Output'];
  });

  // Predefined contact owner options
  const [predefinedContactOwners, setPredefinedContactOwners] = useState(() => {
    const saved = localStorage.getItem('predefinedContactOwners');
    return saved ? JSON.parse(saved) : ['Operation', 'Chaturya', 'Nirosha', 'Priyanshu', 'Bhagwati', 'Harshitha', 'Aymen', 'Shurti', 'Abubakar', 'Vijay K B', 'Mustaqeem','Amith','Hemanth','Likhitha','Rohini'];
  });

  // Save to localStorage when predefined values change
  useEffect(() => {
    localStorage.setItem('predefinedTags', JSON.stringify(predefinedTags));
  }, [predefinedTags]);

  useEffect(() => {
    localStorage.setItem('predefinedLeadSources', JSON.stringify(predefinedLeadSources));
  }, [predefinedLeadSources]);

  useEffect(() => {
    localStorage.setItem('predefinedIndustries', JSON.stringify(predefinedIndustries));
  }, [predefinedIndustries]);

  useEffect(() => {
    localStorage.setItem('predefinedContactOwners', JSON.stringify(predefinedContactOwners));
  }, [predefinedContactOwners]);

  // Editable field component
  const EditableField = ({ label, value, fieldName, type = 'text' }) => {
    const isEditing = editingField === fieldName;
    
    return (
      <div data-editable-field>
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
      toast.loading('Uploading CSV...');
      
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
      
      if (result.message === 'CSV processed' || result.success || result.total_added !== undefined) {
        console.log('CSV import successful');
        // Refresh leads data to show newly imported leads
        await fetchLeads();
        toast.dismiss();
        toast.success(`Successfully imported ${result.total_added || result.imported_count || result.count || 'unknown number of'} leads!`);
      } else {
        console.error('API returned failure:', result);
        toast.dismiss();
        toast.error(`Failed to import CSV: ${result.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error uploading CSV:', err);
      toast.dismiss();
      toast.error(`Error uploading CSV: ${err.message || 'Unknown error occurred'}`);
    }
  };
  
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const currentUserName = user?.name || user?.phone_number || 'operation';
      const response = await fetch(`${import.meta.env.VITE_LEADS_API_URL}?user=${encodeURIComponent(currentUserName)}&offset=${offset}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      let leadsList = data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        leadsList = data.data || data.results || data.leads || data.items || data.records || [];
        if (data.total !== undefined) {
          setTotalLeads(data.total);
        }
      } else if (Array.isArray(data)) {
        leadsList = data;
        setTotalLeads(data.length);
      }
      
      // Transform API data to match component structure
      const transformedLeads = leadsList.map(lead => ({
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
        marginBottom: '4px',
        paddingBottom: '4px',
        borderBottom: '1px solid var(--border)'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            margin: '0 0 4px 0',
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setOffset(0);
              }}
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
            onChange={(e) => {
              setNewThisWeekFilter(e.target.checked);
              setOffset(0);
            }}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ color: 'var(--text)', fontSize: '14px' }}>New This Week</span>
        </label>
      </div>

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
                  {selectedRows.length === 1 && (
                    <button
                      onClick={() => {
                        setShowMoreDropdown(false);
                        setShowConvertModal(true);
                        setConvertAccountName('');
                        setConvertWebsite('');
                        setConvertAccountType('');
                      }}
                      style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: 'var(--text)', borderBottom: '1px solid var(--border-soft)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-100)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      Convert
                    </button>
                  )}
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
              setOffset(0);
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
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '2px solid var(--border)', position: 'sticky', left: '0', backgroundColor: 'var(--gray-100)', zIndex: 11, width: '150px', maxWidth: '150px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="checkbox"
                      checked={selectedRows.length === filteredLeads.length && filteredLeads.length > 0 && filteredLeads.every(lead => selectedRows.includes(lead.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(filteredLeads.map(lead => lead.id));
                        } else {
                          setSelectedRows(selectedRows.filter(id => !filteredLeads.find(lead => lead.id === id)));
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>Contact Name</span>
                  </div>
                </th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)', width: '130px', maxWidth: '130px' }}>Phone Number</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)', width: '130px', maxWidth: '130px' }}>Alternate Number</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)', width: '180px', maxWidth: '180px' }}>Email</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)', width: '150px', maxWidth: '150px' }}>Company Name</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)', width: '130px', maxWidth: '130px' }}>Contact Owner</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)', width: '100px', maxWidth: '100px' }}>City</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)', width: '100px', maxWidth: '100px' }}>State</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)', width: '100px', maxWidth: '100px' }}>Country</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)', width: '120px', maxWidth: '120px' }}>Lead Status</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)', width: '100px', maxWidth: '100px' }}>Tags</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)', width: '130px', maxWidth: '130px' }}>Lead Source</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)', width: '200px', maxWidth: '200px' }}>Description</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)', width: '120px', maxWidth: '120px' }}>Created Time</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)', width: '120px', maxWidth: '120px' }}>Industry</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)', width: '120px', maxWidth: '120px' }}>Created By</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)', width: '120px', maxWidth: '120px' }}>Modified By</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)', width: '120px', maxWidth: '120px' }}>Modified Time</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)', width: '120px', maxWidth: '120px' }}>Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="19" style={{
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
                  <td colSpan="19" style={{
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
                  <td colSpan="19" style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: 'var(--text-3)',
                    fontSize: '14px'
                  }}>
                    No leads found
                  </td>
                </tr>
              ) : (
                displayedLeads.map(lead => (
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
                    <td style={{ padding: '8px 12px', color: 'var(--text)', fontWeight: '500', textAlign: 'left', borderRight: '2px solid var(--border)', position: 'sticky', left: '0', backgroundColor: 'var(--surface)', zIndex: 6, width: '150px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
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
                            fetchTimeline(lead.id);
                            fetchActivities(lead.id);
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
                            textAlign: 'left',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {lead.contactName}
                        </button>
                        <button onClick={() => openEditDialog(lead.id, 'contactName', lead.contactName)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', marginLeft: 'auto' }} title="Edit contact name">
                          <FileEdit size={14} style={{ color: 'var(--text-3)' }} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)', width: '130px', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.phoneNumber}</span>
                        <button onClick={() => openEditDialog(lead.id, 'phoneNumber', lead.phoneNumber)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} title="Edit phone number">
                          <FileEdit size={14} style={{ color: 'var(--text-3)' }} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)', width: '130px', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.alternateNumber}</span>
                        <button onClick={() => openEditDialog(lead.id, 'alternateNumber', lead.alternateNumber)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} title="Edit alternate number">
                          <FileEdit size={14} style={{ color: 'var(--text-3)' }} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)', width: '180px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.email}</span>
                        <button onClick={() => openEditDialog(lead.id, 'email', lead.email)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} title="Edit email">
                          <FileEdit size={14} style={{ color: 'var(--text-3)' }} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)', width: '150px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.companyName}</span>
                        <button onClick={() => openEditDialog(lead.id, 'companyName', lead.companyName)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} title="Edit company name">
                          <FileEdit size={14} style={{ color: 'var(--text-3)' }} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)', width: '130px', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.contactOwner}</span>
                        <button onClick={() => openEditDialog(lead.id, 'contactOwner', lead.contactOwner)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} title="Edit contact owner">
                          <FileEdit size={14} style={{ color: 'var(--text-3)' }} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)', width: '100px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.city}</span>
                        <button onClick={() => openEditDialog(lead.id, 'city', lead.city)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} title="Edit city">
                          <FileEdit size={14} style={{ color: 'var(--text-3)' }} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)', width: '100px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.state}</span>
                        <button onClick={() => openEditDialog(lead.id, 'state', lead.state)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} title="Edit state">
                          <FileEdit size={14} style={{ color: 'var(--text-3)' }} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)', width: '100px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.country}</span>
                        <button onClick={() => openEditDialog(lead.id, 'country', lead.country)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} title="Edit country">
                          <FileEdit size={14} style={{ color: 'var(--text-3)' }} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px', width: '120px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
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
                        <button onClick={() => openEditDialog(lead.id, 'leadStatus', lead.leadStatus)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} title="Edit lead status">
                          <FileEdit size={14} style={{ color: 'var(--text-3)' }} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)', width: '100px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lead.tags}
                        </span>
                        <button onClick={() => openEditDialog(lead.id, 'tags', lead.tags)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} title="Edit tags">
                          <FileEdit size={14} style={{ color: 'var(--text-3)' }} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)', width: '130px', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.leadSource}</span>
                        <button onClick={() => openEditDialog(lead.id, 'leadSource', lead.leadSource)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} title="Edit lead source">
                          <FileEdit size={14} style={{ color: 'var(--text-3)' }} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', width: '200px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }} title={lead.description}>
                          {lead.description}
                        </div>
                        <button onClick={() => openEditDialog(lead.id, 'description', lead.description)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', flexShrink: 0 }} title="Edit description">
                          <FileEdit size={14} style={{ color: 'var(--text-3)' }} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)', width: '120px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {new Date(lead.createdTime).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)', width: '120px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.industry}</span>
                        <button onClick={() => openEditDialog(lead.id, 'industry', lead.industry)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} title="Edit industry">
                          <FileEdit size={14} style={{ color: 'var(--text-3)' }} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)', width: '120px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.createdBy}</span>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)', width: '120px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.modifiedBy}</span>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)', width: '120px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {new Date(lead.lastActivity).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', textAlign: 'left', borderRight: '1px solid var(--border)', width: '120px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {new Date(lead.lastActivity).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && !error && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1px 10px',
            borderTop: '1px solid #e5e7eb',
            background: '#fff',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#6b7280' }}>
              <span>Records per page</span>
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    const newItemsPerPage = Number(e.target.value);
                    setItemsPerPage(newItemsPerPage);
                    setLimit(newItemsPerPage);
                    setOffset(0);
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
                  {[10, 25, 50, 100].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: '#9ca3af'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setOffset((prev) => Math.max(prev - limit, 0));
                }}
                disabled={offset === 0 || leads.length === 0}
                aria-label="Previous page"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  padding: 0,
                  background: 'none',
                  border: 'none',
                  color: offset === 0 || leads.length === 0 ? '#d1d5db' : '#6b7280',
                  cursor: offset === 0 || leads.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronLeft size={18} />
              </button>

              <span style={{
                fontSize: '13px',
                color: '#374151',
                minWidth: '56px',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}>
                {filteredLeads.length === 0
                  ? '0 to 0'
                  : `${offset + 1} to ${Math.min(offset + limit, effectiveTotalLeads)} of ${effectiveTotalLeads}`}
              </span>

              <button
                type="button"
                onClick={() => {
                  setOffset((prev) => prev + limit);
                }}
                disabled={offset + limit >= effectiveTotalLeads || leads.length === 0}
                aria-label="Next page"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  padding: 0,
                  background: 'none',
                  border: 'none',
                  color: offset + limit >= totalLeads || leads.length === 0 ? '#d1d5db' : '#6b7280',
                  cursor: offset + limit >= totalLeads || leads.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status summary — horizontal footer bar */}
      {!loading && !error && (
        <div style={{
          marginTop: '0',
          padding: '8px 16px',
          background: '#fff',
          borderTop: '1px solid #e5e7eb',
          flexShrink: 0
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '20px 28px',
            fontSize: '13px',
            color: '#4b5563',
            lineHeight: 1.4
          }}>
            <span style={{ color: '#4b5563', whiteSpace: 'nowrap' }}>
              Total Leads{' '}
              <span style={{ color: '#9ca3af', margin: '0 4px' }}>•</span>{' '}
              <strong style={{ color: '#111827', fontWeight: 600 }}>{totalLeads || leads.length}</strong>
            </span>

            {statusSummary.map(({ status, count, label }) => {
              const isActive = filterStatus === status;
              const itemContent = (
                <>
                  {label}{' '}
                  <span style={{ color: '#9ca3af', margin: '0 4px' }}>•</span>{' '}
                  <strong style={{ color: '#111827', fontWeight: 600 }}>{count}</strong>
                </>
              );

              if (isActive) {
                return (
                  <span
                    key={status}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}
                  >
                    <button
                      type="button"
                      onClick={() => handleStatusSummaryClick(status)}
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
                      {itemContent}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterStatus('all');
                        setOffset(0);
                      }}
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
                );
              }

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusSummaryClick(status)}
                  title={`Filter by ${label}`}
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
                  {itemContent}
                </button>
              );
            })}
          </div>
        </div>
      )}

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
              {isFetchingFilterOptions && (
                <div style={{
                  padding: '20px 16px',
                  borderRadius: '10px',
                  background: 'var(--gray-50, #f9fafb)',
                  border: '1px solid var(--border)',
                  marginTop: '4px'
                }}>
                  <style>{`@keyframes filterSpin { to { transform: rotate(360deg); } }`}</style>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{
                      width: '16px', height: '16px', flexShrink: 0,
                      border: '2px solid #3b82f6',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'filterSpin 0.7s linear infinite'
                    }} />
                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)', flex: 1 }}>
                      Loading filters...
                    </span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#3b82f6',
                      minWidth: '36px',
                      textAlign: 'right'
                    }}>
                      {filterFetchProgress}%
                    </span>
                  </div>
                  <div style={{
                    height: '5px',
                    background: 'var(--border, #e5e7eb)',
                    borderRadius: '99px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${filterFetchProgress}%`,
                      background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                      borderRadius: '99px',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              )}
              {!isFetchingFilterOptions && (
              <>
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
                    <option value="mailing_country">Mailing Country</option>
                    <option value="mailing_state">Mailing State</option>
                    <option value="created_by">Created By</option>
                    <option value="lead_source">Lead Source</option>
                    <option value="mailing_city">Mailing City</option>
                    <option value="modified_by">Modified By</option>
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
                                  'Starter',
                                  'Growth',
                                  'Enterprise',
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
                                  'API Client',
                                'Positive response'
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
                        <div style={{ width: '100px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                        <div style={{ width: '100px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                  {prop.property === 'mailing_city' && (
                    <div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ width: '100px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                        <div style={{ width: '100px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                            {isFetchingFilterOptions ? (
                              <option value="" disabled>Loading options, please wait...</option>
                            ) : (
                              getUniqueValues(prop.property).map(value => (
                                <option key={value} value={value}>{value}</option>
                              ))
                            )}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {prop.property === 'modified_by' && (
                    <div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ width: '100px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                            {isFetchingFilterOptions ? (
                              <option value="" disabled>Loading options, please wait...</option>
                            ) : (
                              getUniqueValues(prop.property).map(value => (
                                <option key={value} value={value}>{value}</option>
                              ))
                            )}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {prop.property === 'lead_source' && (
                    <div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ width: '100px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                            <option value="">All Lead Sources</option>
                            {getUniqueValues(prop.property).map(value => (
                              <option key={value} value={value}>{value}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {prop.property === 'description' && (
                    <div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ width: '100px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                          <input
                            type="text"
                            value={prop.value}
                            onChange={(e) => {
                              const updated = [...selectedProperties];
                              updated[index].value = e.target.value;
                              setSelectedProperties(updated);
                            }}
                            placeholder="Enter description..."
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
                    setOffset(0);
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
              </>)}
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
            borderRadius: '0',
            width: '85%',
            height: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column'
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
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    setShowConvertModal(true);
                    setConvertAccountName('');
                    setConvertWebsite('');
                    setConvertAccountType('');
                  }}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--green-600)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--r)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Convert
                </button>
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
            </div>
            
            {/* Modal body: two-column layout */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

              {/* ── Left panel: all editable sections ── */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                        onClick={() => {
                          closeAllDropdowns();
                          setIndustryDropdownOpen(!industryDropdownOpen);
                        }}
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
                        <div data-dropdown style={{
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
                          
                          {(user?.role?.toLowerCase().trim() === 'operation' || user?.role?.toLowerCase().trim() === 'operations') && (
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
                          )}
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
                                  setPredefinedIndustries([...predefinedIndustries, customIndustry.trim()]);
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
                        onClick={() => {
                          closeAllDropdowns();
                          setStatusDropdownOpen(!statusDropdownOpen);
                        }}
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
                        <div data-dropdown style={{
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
                          
                          {(user?.role?.toLowerCase().trim() === 'operation' || user?.role?.toLowerCase().trim() === 'operations') && (
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
                          )}
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
                                  setStatusConfig({ ...statusConfig, [customStatus.trim()]: { color: '#6b7280', label: customStatus.trim() } });
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
                        onClick={() => {
                          closeAllDropdowns();
                          setOwnerDropdownOpen(!ownerDropdownOpen);
                        }}
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
                        <div data-dropdown style={{
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
                          {predefinedContactOwners.map(owner => (
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
                          
                          {(user?.role?.toLowerCase().trim() === 'operation' || user?.role?.toLowerCase().trim() === 'operations') && (
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
                          )}
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
                                  setPredefinedContactOwners([...predefinedContactOwners, customOwner.trim()]);
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
                        onClick={() => {
                          closeAllDropdowns();
                          setLeadSourceDropdownOpen(!leadSourceDropdownOpen);
                        }}
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
                        <div data-dropdown style={{
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
                          
                          {(user?.role?.toLowerCase().trim() === 'operation' || user?.role?.toLowerCase().trim() === 'operations') && (
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
                          )}
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
                                  setPredefinedLeadSources([...predefinedLeadSources, customLeadSource.trim()]);
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
                        onClick={() => {
                          closeAllDropdowns();
                          setTagsDropdownOpen(!tagsDropdownOpen);
                        }}
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
                        <div data-dropdown style={{
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
                          
                          {(user?.role?.toLowerCase().trim() === 'operation' || user?.role?.toLowerCase().trim() === 'operations') && (
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
                          )}
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
                                  setPredefinedTags([...predefinedTags, customTags.trim()]);
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
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Modified Time</label>
                    <div style={{ color: 'var(--text)' }}>
                      {new Date(selectedUser.lastActivity).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Last Activity</label>
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

              </div>{/* end left panel */}

              {/* ── Right panel: tabs (Timeline / Notes / Activities / Pipelines) ── */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)', padding: '0 20px', flexShrink: 0 }}>
                  {[
                    { id: 'timeline', label: 'Timeline' },
                    { id: 'notes', label: 'Notes'},
                    { id: 'activities', label: 'Activities' },
                 
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
                          {selectedUser?.contactName?.charAt(0) || 'L'}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>{selectedUser?.contactName || 'Lead'}</div>
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
                                  {item.field === 'note' ? (
                                    <span>Note added by <span style={{ fontWeight: 'bold' }}>{item.changed_by}</span></span>
                                  ) : item.field === 'task' ? (
                                    <span>Task added by <span style={{ fontWeight: 'bold' }}>{item.changed_by}</span></span>
                                  ) : (
                                    <span>{item.field} updated by <span style={{ fontWeight: 'bold' }}>{item.changed_by}</span></span>
                                  )}
                                </div>
                                <div style={{ fontSize: '14px', color: 'var(--text)', fontStyle: 'Georgia' }}>
                                  {item.field === 'note' ? (
                                    <span>' {item.new_value} '</span>
                                  ) : item.field === 'task' ? (
                                    <span>' {item.new_value} '</span>
                                  ) : item.old_value === null || item.old_value === '' ? (
                                    <span>' {item.new_value} '</span>
                                  ) : (
                                    <span>{`' ${item.old_value} '  to  ' ${item.new_value} '`}</span>
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

                 

                </div>
              </div>{/* end right panel */}
            </div>{/* end two-column layout */}
          </div>
        </div>
      )}

      {/* ── Create Task Modal ── */}
      {showCreateTaskModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002 }}>
          <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--r-lg)', maxWidth: '450px', width: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>Create Task</h3>
              <button onClick={() => setShowCreateTaskModal(false)} style={{ backgroundColor: 'var(--gray-100)', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '8px', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-3)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Task Type</label>
                <select
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', cursor: 'pointer' }}
                >
                  <option value="">Select task type</option>
                  <option value="mail">Mail</option>
                  <option value="call">Call</option>
                  <option value="meet">Meet</option>
                  <option value="follow-up">Follow Up</option>
                  <option value="proposal sent">Proposal Sent</option>

                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-3)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Due Date</label>
                <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-3)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Status</label>
                <select
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', cursor: 'pointer' }}
                >
                 <option>Choose a Task Stage</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Due For">Due For</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-3)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Task Owner</label>
                <input type="text" value={user?.name || user?.phone_number || 'operation'} readOnly style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', outline: 'none', backgroundColor: 'var(--gray-100)', color: 'var(--text-3)', cursor: 'not-allowed' }} />
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: 'var(--gray-50)', borderBottomLeftRadius: 'var(--r-lg)', borderBottomRightRadius: 'var(--r-lg)' }}>
              <button onClick={() => { setShowCreateTaskModal(false); setTaskName(''); setTaskDueDate(''); setTaskStatus('Pending'); }} style={{ backgroundColor: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '8px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleAddTask} disabled={addingTask} style={{ backgroundColor: addingTask ? 'var(--gray-400)' : 'var(--green-600)', color: '#fff', border: 'none', borderRadius: 'var(--r)', padding: '8px 24px', fontSize: '14px', fontWeight: '600', cursor: addingTask ? 'not-allowed' : 'pointer' }}>{addingTask ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Task Modal ── */}
      {showEditTaskModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002 }}>
          <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--r-lg)', maxWidth: '450px', width: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>Edit Task</h3>
              <button onClick={() => { setShowEditTaskModal(false); setEditingTask(null); setTaskName(''); setTaskDueDate(''); setTaskStatus('Pending'); }} style={{ backgroundColor: 'var(--gray-100)', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '8px', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-3)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Task Type</label>
                <select
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', cursor: 'pointer' }}
                >
                  <option value="">Select task type</option>
                  <option value="mail">Mail</option>
                  <option value="call">Call</option>
                  <option value="meet">Meet</option>
                  <option value="follow-up">Follow Up</option>
                  <option value="proposal sent">Proposal Sent</option>

                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-3)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Due Date</label>
                <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-3)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Status</label>
                <select
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', cursor: 'pointer' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Due For">Due For</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-3)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Task Owner</label>
                <input type="text" value={user?.name || user?.phone_number || 'operation'} readOnly style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', outline: 'none', backgroundColor: 'var(--gray-100)', color: 'var(--text-3)', cursor: 'not-allowed' }} />
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: 'var(--gray-50)', borderBottomLeftRadius: 'var(--r-lg)', borderBottomRightRadius: 'var(--r-lg)' }}>
              <button onClick={() => { setShowEditTaskModal(false); setEditingTask(null); setTaskName(''); setTaskDueDate(''); setTaskStatus('Pending'); }} style={{ backgroundColor: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '8px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleUpdateTask} disabled={addingTask} style={{ backgroundColor: addingTask ? 'var(--gray-400)' : 'var(--green-600)', color: '#fff', border: 'none', borderRadius: 'var(--r)', padding: '8px 24px', fontSize: '14px', fontWeight: '600', cursor: addingTask ? 'not-allowed' : 'pointer' }}>{addingTask ? 'Updating...' : 'Update'}</button>
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
                <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Modified Time</label>
                <div style={{ color: 'var(--text)', fontWeight: '500' }}>
                  {new Date(selectedLead.lastActivity).toLocaleString('en-IN')}
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
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Phone Number *</label>
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
                      defaultValue={user?.name || user?.phone_number || 'operation'}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'var(--gray-100)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r)',
                        color: 'var(--text)',
                        fontSize: '14px',
                        cursor: 'not-allowed'
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
                    <select
                      name="tags"
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
                      <option value="">Select a tag</option>
                      {getUniqueTags().map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
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
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-3)', fontSize: '12px' }}>Modified Time</label>
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
                            {[...new Set(leads.filter(l => selectedRows.includes(l.id)).map(l => l.leadStatus))].filter(Boolean).sort().map(status => (
                              <option key={status} value={status}>{statusConfig[status]?.label || status}</option>
                            ))}
                          </select>
                        ) : selectedFieldToUpdate === 'contactOwner' ? (
                          <select
                            value={updateFieldValue}
                            onChange={(e) => setUpdateFieldValue(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
                          >
                            <option value="">All selected</option>
                            {[...new Set(leads.filter(l => selectedRows.includes(l.id)).map(l => l.contactOwner))].filter(Boolean).sort().map(owner => (
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
                            {[...new Set(leads.filter(l => selectedRows.includes(l.id)).map(l => l.state))].filter(Boolean).sort().map(state => (
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
                            {[...new Set(leads.filter(l => selectedRows.includes(l.id)).map(l => l.country))].filter(Boolean).sort().map(country => (
                              <option key={country} value={country}>{country}</option>
                            ))}
                          </select>
                        ) : selectedFieldToUpdate === 'industry' ? (
                          <select
                            value={updateFieldValue}
                            onChange={(e) => setUpdateFieldValue(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
                          >
                            <option value="">All selected</option>
                            {[...new Set(leads.filter(l => selectedRows.includes(l.id)).map(l => l.industry))].filter(Boolean).sort().map(industry => (
                              <option key={industry} value={industry}>{industry}</option>
                            ))}
                          </select>
                        ) : selectedFieldToUpdate === 'tags' ? (
                          <select
                            value={updateFieldValue}
                            onChange={(e) => setUpdateFieldValue(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
                          >
                            <option value="">All selected</option>
                            {[...new Set(leads.filter(l => selectedRows.includes(l.id)).map(l => l.tags))].filter(Boolean).sort().map(tag => (
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
                        ) : selectedFieldToUpdate === 'contactOwner' ? (
                          <select
                            value={updateNewFieldValue}
                            onChange={(e) => setUpdateNewFieldValue(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
                          >
                            <option value="">Select owner...</option>
                            {[...new Set(leads.map(l => l.contactOwner))].filter(Boolean).sort().map(owner => (
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
                            {[...new Set(leads.map(l => l.state))].filter(Boolean).sort().map(state => (
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
                            {[...new Set(leads.map(l => l.country))].filter(Boolean).sort().map(country => (
                              <option key={country} value={country}>{country}</option>
                            ))}
                          </select>
                        ) : selectedFieldToUpdate === 'industry' ? (
                          <select
                            value={updateNewFieldValue}
                            onChange={(e) => setUpdateNewFieldValue(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
                          >
                            <option value="">Select industry...</option>
                            {[...new Set(leads.map(l => l.industry))].filter(Boolean).sort().map(industry => (
                              <option key={industry} value={industry}>{industry}</option>
                            ))}
                          </select>
                        ) : selectedFieldToUpdate === 'tags' ? (
                          <select
                            value={updateNewFieldValue}
                            onChange={(e) => setUpdateNewFieldValue(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
                          >
                            <option value="">Select tags...</option>
                            {[...new Set(leads.map(l => l.tags))].filter(Boolean).sort().map(tag => (
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
                    
                    setLeads(prev => prev.map(lead => {
                      if (!selectedRows.includes(lead.id)) return lead;
                      // If "Change From" is empty, update all selected items
                      if (!updateFieldValue) {
                        return { ...lead, [field]: updateNewFieldValue };
                      }
                      // Only update items that match the "Change From" value
                      if (lead[field] === updateFieldValue) {
                        return { ...lead, [field]: updateNewFieldValue };
                      }
                      return lead;
                    }));
                    
                    const updatedCount = leads.filter(lead => 
                      selectedRows.includes(lead.id) && (!updateFieldValue || lead[field] === updateFieldValue)
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

      {/* Convert Modal */}
      {showConvertModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ position: 'relative', background: 'var(--surface)', borderRadius: '12px', width: '500px', maxWidth: '90%', boxShadow: '0 20px 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>Convert Lead</h2>
              <button onClick={() => setShowConvertModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontSize: '14px', fontWeight: '500' }}>Account Name *</label>
                <input
                  type="text"
                  value={convertAccountName}
                  onChange={(e) => setConvertAccountName(e.target.value)}
                  placeholder="Enter account name"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontSize: '14px', fontWeight: '500' }}>Website</label>
                <input
                  type="text"
                  value={convertWebsite}
                  onChange={(e) => setConvertWebsite(e.target.value)}
                  placeholder="Enter website"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontSize: '14px', fontWeight: '500' }}>Account Type</label>
                <select
                  value={convertAccountType}
                  onChange={(e) => setConvertAccountType(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)' }}
                >
                  <option value="">Select account type</option>
                  <option value="Sat2Farm Recurring">Sat2Farm Recurring</option>
                  <option value="Sat2Farm Non Recurring">Sat2Farm Non Recurring</option>
                  <option value="Sat2Farm Exclusivity">Sat2Farm Exclusivity</option>
                  <option value="Sat4Agri">Sat4Agri</option>
                  <option value="Sat4Risk">Sat4Risk</option>
                  <option value="Project">Project</option>
                  <option value="WhiteLabelling">WhiteLabelling</option>
                  <option value="API Client">API Client</option>
                  <option value="Positive response">Positive response</option>
                </select>
              </div>
            </div>

            {/* Modal footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 24px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
              <button
                onClick={() => setShowConvertModal(false)}
                style={{ padding: '10px 20px', background: 'var(--gray-200)', color: 'var(--text)', border: 'none', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!convertAccountName) {
                    toast.error('Please enter account name');
                    return;
                  }
                  const currentUserName = user?.name || user?.phone_number || 'operation';
                  const leadId = selectedRows.length === 1 ? selectedRows[0] : (selectedLead?.id || selectedUser?.id);
                  if (!leadId) {
                    toast.error('No lead selected');
                    return;
                  }
                  try {
                    const apiUrl = import.meta.env.VITE_MOVE_TO_ACCOUNT_API_URL;
                    if (!apiUrl) {
                      toast.error('Move to account API URL not configured');
                      return;
                    }
                    const url = `${apiUrl}?id=${leadId}&account_name=${encodeURIComponent(convertAccountName)}&website=${encodeURIComponent(convertWebsite)}&account_type=${encodeURIComponent(convertAccountType)}&user=${encodeURIComponent(currentUserName)}`;
                    const response = await fetch(url, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      }
                    });
                    if (!response.ok) {
                      const errorText = await response.text();
                      console.error('Error moving to account:', errorText);
                      throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const result = await response.json();
                    console.log('Lead moved to account successfully:', result);
                    if (result.success || result.message) {
                      toast.success('Lead converted successfully');
                      setShowConvertModal(false);
                      setConvertAccountName('');
                      setConvertWebsite('');
                      setConvertAccountType('');
                      setSelectedRows([]);
                      fetchLeads();
                    } else {
                      toast.error('Failed to convert lead');
                    }
                  } catch (err) {
                    console.error('Error moving to account:', err);
                    toast.error('Failed to convert lead');
                  }
                }}
                disabled={!convertAccountName}
                style={{ padding: '10px 20px', background: 'var(--green-600)', color: 'white', border: 'none', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: '14px', fontWeight: '500', opacity: !convertAccountName ? 0.5 : 1 }}
              >
                Convert
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
                  const ids = selectedRows.join(',');
                  
                  setIsDeleting(true);
                  try {
                    const url = `${import.meta.env.VITE_BULK_DELETE_LEADS_API_URL}?ids=${ids}&user=${encodeURIComponent(currentUserName)}&confirm=Yes`;
                    
                    const response = await fetch(url, {
                      method: 'DELETE',
                      headers: {
                        'Content-Type': 'application/json',
                      }
                    });

                    if (!response.ok) {
                      throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    
                    // Delete selected items from local state
                    setLeads(prev => prev.filter(lead => !selectedRows.includes(lead.id)));
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

      {/* Edit Dialog */}
      {showEditDialog && (
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
            background: 'white',
            borderRadius: '8px',
            padding: '24px',
            minWidth: '400px',
            maxWidth: '500px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
              Edit {editDialogField.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}
            </h3>
            
            {showEditDialogCustomInput ? (
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  value={editDialogCustomValue}
                  onChange={(e) => setEditDialogCustomValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleEditDialogSave(); if (e.key === 'Escape') closeEditDialog(); }}
                  placeholder={`Enter custom ${editDialogField.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}...`}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  autoFocus
                />
              </div>
            ) : isFieldWithDropdown(editDialogField) ? (
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '10px 12px',
                    background: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: editDialogValue ? '#111827' : '#6b7280'
                  }}
                  onClick={() => setEditDialogDropdownOpen(!editDialogDropdownOpen)}
                >
                  <span>{editDialogValue || `Select ${editDialogField.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}...`}</span>
                  <ChevronDown size={16} style={{ transition: 'transform 0.2s ease', transform: editDialogDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </div>
                {editDialogDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 10,
                    marginTop: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {getFieldOptions(editDialogField).map(option => (
                      <button
                        key={option}
                        onClick={() => handleEditDialogOptionSelect(option)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'none',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: '#111827',
                          borderBottom: '1px solid #e5e7eb'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                      >
                        {editDialogField === 'leadStatus' ? statusConfig[option]?.label || option : option}
                      </button>
                    ))}
                    {(user?.role?.toLowerCase().trim() === 'operation' || user?.role?.toLowerCase().trim() === 'operations') && (
                      <button
                        onClick={handleEditDialogCustomInput}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'none',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#10b981'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#ecfdf5'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                      >
                        + Custom
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <input
                type="text"
                value={editDialogValue}
                onChange={(e) => setEditDialogValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleEditDialogSave(); if (e.key === 'Escape') closeEditDialog(); }}
                placeholder={`Enter ${editDialogField.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}...`}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  marginBottom: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />
            )}
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeEditDialog}
                style={{
                  padding: '8px 16px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleEditDialogSave}
                style={{
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

