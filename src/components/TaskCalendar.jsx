import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, ChevronLeft, ChevronRight, Filter, Search, User, Clock, CheckCircle, AlertCircle, MoreVertical, Eye, Edit, Trash2, X, ChevronDown, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { normalizeUserRole } from '../utils/roleUtils';

// ---- Design tokens -------------------------------------------------------
const palette = {
  canvas: '#F5F7F1',
  surface: '#FFFFFF',
  border: '#E2E7DD',
  ink: '#16241C',
  inkSoft: '#5B6B5E',
  inkFaint: '#8B9A8E',
  pine: '#2F5233',
  pineDeep: '#16241C',
  amber: '#C98A2C',
  amberDeep: '#A56A1D',
  growth: '#3D8361',
  slate: '#3E6D9C',
  rust: '#B5432B',
  teal: '#14B8A6',
};

// Helper to normalize user parameter for backend API
const getApiUserName = (u) => {
  const name = u?.name || u?.username || u?.phone_number || 'Operation';
  if (!name || name.toLowerCase() === 'operation' || name === '8970095700' || name === 'admin') {
    return 'Operation';
  }
  return name;
};

// Robust Date Parser to handle YYYY-MM-DD, DD-MM-YYYY, ISO strings, etc.
const parseDateRobust = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;
  const str = String(dateStr).trim();
  if (!str || str === 'Invalid Date' || str === 'undefined' || str === 'null') return null;

  // Try DD-MM-YYYY HH:mm:ss or DD-MM-YYYY HH:mm or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
  if (dmyMatch) {
    const [, day, month, year, hours = '0', minutes = '0', seconds = '0'] = dmyMatch;
    const d = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds));
    if (!isNaN(d.getTime())) return d;
  }

  // Try YYYY-MM-DD HH:mm:ss or YYYY-MM-DD HH:mm
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
  if (ymdMatch) {
    const [, year, month, day, hours = '0', minutes = '0', seconds = '0'] = ymdMatch;
    const d = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds));
    if (!isNaN(d.getTime())) return d;
  }

  // Try standard JS Date parsing
  let d = new Date(str.includes(' ') && !str.includes('T') ? str.replace(' ', 'T') : str);
  if (!isNaN(d.getTime())) return d;

  d = new Date(str);
  if (!isNaN(d.getTime())) return d;

  return null;
};

const formatDateSafe = (dateStr, options = { day: 'numeric', month: 'short', year: 'numeric' }) => {
  if (!dateStr) return '-';
  const d = parseDateRobust(dateStr);
  if (!d) return (dateStr === 'Invalid Date' ? '-' : dateStr) || '-';
  try {
    return d.toLocaleDateString('en-IN', options);
  } catch (err) {
    return dateStr || '-';
  }
};

const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  const d = parseDateRobust(dateStr);
  if (!d) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTimeForInput = (dateStr, timeStr) => {
  if (timeStr && /^\d{2}:\d{2}/.test(timeStr)) {
    return timeStr.slice(0, 5);
  }
  if (dateStr && dateStr.includes('T')) {
    const t = dateStr.split('T')[1];
    if (t) return t.slice(0, 5);
  }
  if (dateStr && dateStr.includes(' ')) {
    const parts = dateStr.split(' ');
    if (parts[1] && /^\d{2}:\d{2}/.test(parts[1])) {
      return parts[1].slice(0, 5);
    }
  }
  return '23:59';
};

export default function TaskCalendar() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editedTaskName, setEditedTaskName] = useState('');
  const [editedDueDate, setEditedDueDate] = useState('');
  const [editedDueTime, setEditedDueTime] = useState('');
  const [editedStatus, setEditedStatus] = useState('');
  const [editingField, setEditingField] = useState(null);
  const [selectedDayTasks, setSelectedDayTasks] = useState(null);
  const [showDayTasksModal, setShowDayTasksModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [contactOwnerOptions, setContactOwnerOptions] = useState([]);
  const [createdTimeFilter, setCreatedTimeFilter] = useState('all');
  const [createdTimeDate, setCreatedTimeDate] = useState('');
  const [createdTimeStartDate, setCreatedTimeStartDate] = useState('');
  const [createdTimeEndDate, setCreatedTimeEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showTodayTasks, setShowTodayTasks] = useState(true);

  const userRole = normalizeUserRole(user);
  const currentUserName = getApiUserName(user);
  const isOperationsUser = userRole === 'ops';
  const isSalesUser = userRole === 'sales';

  // Fetch contact owner options from API
  const fetchContactOwnerOptions = useCallback(async () => {
    try {
      const dropdownApiUrl = import.meta.env.VITE_DROPDOWN_OPTIONS_API_URL;
      const response = await fetch(`${dropdownApiUrl}?category=contact_owner`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.status && result.data) {
        setContactOwnerOptions(result.data);
      }
    } catch (error) {
      console.error('Error fetching contact owner options:', error);
    }
  }, []);

  // Fetch all tasks from the API
  const fetchAllTasks = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const calendarApiUrl = import.meta.env.VITE_CALENDAR_API_URL;
      
      // Build API URL based on user role
      let apiUrl = `${calendarApiUrl}?role=${userRole}`;
      
      if (isSalesUser) {
        // Sales users need user parameter
        apiUrl += `&user=${encodeURIComponent(currentUserName)}`;
      }
      
      // Add filter parameters
      if (filters.contact_owner && filters.contact_owner !== 'all') {
        apiUrl += `&contact_owner=${encodeURIComponent(filters.contact_owner)}`;
      }
      
      if (filters.status && filters.status !== 'all' && filters.status !== 'overdue') {
        apiUrl += `&status=${encodeURIComponent(filters.status)}`;
      }
      
      // Created time filters
      if (filters.createdTimeFilter && filters.createdTimeFilter !== 'all') {
        if (filters.createdTimeFilter === 'on' && filters.createdTimeDate) {
          apiUrl += `&created_time_on=${encodeURIComponent(filters.createdTimeDate)}`;
        } else if (filters.createdTimeFilter === 'before' && filters.createdTimeDate) {
          apiUrl += `&created_time_before=${encodeURIComponent(filters.createdTimeDate)}`;
        } else if (filters.createdTimeFilter === 'after' && filters.createdTimeDate) {
          apiUrl += `&created_time_after=${encodeURIComponent(filters.createdTimeDate)}`;
        } else if (filters.createdTimeFilter === 'custom' && filters.createdTimeStartDate && filters.createdTimeEndDate) {
          apiUrl += `&created_time_between=${encodeURIComponent(filters.createdTimeStartDate)},${encodeURIComponent(filters.createdTimeEndDate)}`;
        }
      }
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Filter for task activities only and sort by due_date
        const allTasks = result.data
          .filter(activity => activity.activity_type === 'task' || activity.task_name)
          .sort((a, b) => {
            const dateA = parseDateRobust(a.due_date);
            const dateB = parseDateRobust(b.due_date);
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return dateA - dateB;
          });
        
        setTasks(allTasks);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [userRole, isSalesUser, currentUserName]);



  useEffect(() => {
    fetchAllTasks();
    fetchContactOwnerOptions();
  }, [fetchAllTasks, fetchContactOwnerOptions]);

  // Handle escape key to cancel editing
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && editingField) {
        setEditingField(null);
        setEditedTaskName('');
        setEditedDueDate('');
        setEditedDueTime('');
        setEditedStatus('');
      }
    };

    if (editingField) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [editingField]);

  // Check if task is overdue
  const isTaskOverdue = useCallback((task) => {
    const taskDate = parseDateRobust(task.due_date);
    if (!taskDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    
    // Task is overdue if due date is before today and status is still "in progress"
    const statusLower = (task.status || 'Pending').toLowerCase();
    const isInProgress = statusLower === 'in progress';
    
    return taskDate < today && isInProgress;
  }, []);

  // Get effective status (overriding with overdue if applicable)
  const getEffectiveStatus = useCallback((task) => {
    if (isTaskOverdue(task)) {
      return 'Overdue';
    }
    return task.status || 'Pending';
  }, [isTaskOverdue]);

  // Helper function to get status priority for sorting
  const getStatusPriority = useCallback((task) => {
    const effectiveStatus = getEffectiveStatus(task);
    const statusLower = effectiveStatus.toLowerCase();
    const statusOrder = {
      'in progress': 1,
      'completed': 2,
      'due for': 3,
      'overdue': 4,
      'pending': 5
    };
    return statusOrder[statusLower] || 6;
  }, [getEffectiveStatus]);

  // Sort tasks by status priority: in progress -> completed -> due for -> others
  const sortTasksByStatus = useCallback((tasks) => {
    return tasks.sort((a, b) => {
      const priorityA = getStatusPriority(a);
      const priorityB = getStatusPriority(b);
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // If same priority, sort by due date
      const dateA = parseDateRobust(a.due_date);
      const dateB = parseDateRobust(b.due_date);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA - dateB;
    });
  }, [getStatusPriority]);

  // Filter tasks based on user role and filters
  useEffect(() => {
    let filtered = [...tasks];

    // Role-based filtering
    if (isSalesUser) {
      // Sales users can only see their own tasks
      filtered = filtered.filter(task => {
        const taskOwner = task.task_owner || task.created_by || task.user || '';
        return taskOwner.toLowerCase() === currentUserName.toLowerCase();
      });
    }
    // Operations users can see all tasks (no filtering needed)

    // Status filter (only for overdue since server handles other statuses)
    if (statusFilter === 'overdue') {
      // Filter for overdue tasks
      filtered = filtered.filter(task => isTaskOverdue(task));
    }

    // Search filter (client-side since API doesn't support search)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        (task.task_name || '').toLowerCase().includes(searchLower) ||
        (task.lead_name || '').toLowerCase().includes(searchLower) ||
        (task.account_name || '').toLowerCase().includes(searchLower)
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, userRole, currentUserName, isSalesUser, isOperationsUser, statusFilter, searchTerm, isTaskOverdue]);

  // Fetch tasks with filters when filters change
  useEffect(() => {
    const filters = {
      contact_owner: ownerFilter,
      status: statusFilter,
      createdTimeFilter,
      createdTimeDate,
      createdTimeStartDate,
      createdTimeEndDate
    };
    fetchAllTasks(filters);
  }, [ownerFilter, statusFilter, createdTimeFilter, createdTimeDate, createdTimeStartDate, createdTimeEndDate, fetchAllTasks]);

  // Calendar navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  // Get tasks for a specific day
  const getTasksForDay = (date) => {
    if (!date) return [];
    
    const tasks = filteredTasks.filter(task => {
      const taskDate = parseDateRobust(task.due_date);
      if (!taskDate) return false;
      
      return taskDate.toDateString() === date.toDateString();
    });
    
    return sortTasksByStatus(tasks);
  };

  // Check if any filters are active
  const areFiltersActive = () => {
    return statusFilter !== 'all' || 
           ownerFilter !== 'all' || 
           createdTimeFilter !== 'all' ||
           searchTerm.trim() !== '';
  };

  // Get today's tasks or filtered tasks
  const getTodayTasks = () => {
    // If filters are active, return all filtered tasks instead of just today's
    if (areFiltersActive()) {
      return sortTasksByStatus(filteredTasks);
    }
    
    // Otherwise, return only today's tasks
    const today = new Date();
    const tasks = filteredTasks.filter(task => {
      const taskDate = parseDateRobust(task.due_date);
      if (!taskDate) return false;
      
      return taskDate.toDateString() === today.toDateString();
    });
    
    return sortTasksByStatus(tasks);
  };

  // Status color mapping
  const getStatusColor = (status) => {
    const statusLower = (status || 'Pending').toLowerCase();
    switch (statusLower) {
      case 'completed':
        return { bg: '#dcfce7', text: '#166534', border: '#22c55e' };
      case 'in progress':
        return { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' };
      case 'due for':
        return { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' };
      case 'overdue':
        return { bg: '#fee2e2', text: palette.rust, border: '#ef4444' };
      default:
        return { bg: palette.canvas, text: palette.ink, border: palette.border };
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const todayTasks = getTodayTasks();

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'row',
      background: palette.canvas,
      overflow: 'hidden'
    }}>
      <style>{`
        .fr-eyebrow { font-family: var(--font-mono), monospace; letter-spacing: 0.14em; text-transform: uppercase; }
        .fr-display { font-family: var(--font-display), Georgia, serif; }
        .fr-body { font-family: var(--font-display), Georgia, serif; }
        .fr-mono { font-family: var(--font-mono), monospace; }
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
      
      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div className="topbar" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '16px 20px',
          background: palette.surface,
          borderBottom: `1px solid ${palette.border}`,
          flexShrink: 0
        }}>
        <div className="tb-left">
          <div className="tb-page fr-body" style={{ fontWeight: 600, color: palette.ink, fontSize: '20px' }}>
            Task Calendar
          </div>
          <div className="fr-body" style={{ margin: '4px 0 0', fontSize: '13px', color: palette.inkSoft }}>
            {isOperationsUser ? 'View all tasks from all contact owners' : 'View your assigned tasks'}
          </div>
        </div>
        
        <div className="tb-right" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: palette.inkFaint }} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="fr-body"
              style={{
                padding: '6px 10px 6px 32px',
                border: `1px solid ${palette.border}`,
                borderRadius: '6px',
                fontSize: '13px',
                outline: 'none',
                width: '180px',
                background: palette.surface,
                color: palette.ink
              }}
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="fr-body"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              border: `1px solid ${palette.border}`,
              borderRadius: '6px',
              background: palette.surface,
              cursor: 'pointer',
              fontSize: '13px',
              color: palette.ink
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = palette.growth}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = palette.border}
          >
            <Filter size={14} />
            Filters
          </button>

          {/* Refresh Button */}
          <button
            onClick={fetchAllTasks}
            className="fr-body"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              border: `1px solid ${palette.border}`,
              borderRadius: '6px',
              background: palette.surface,
              cursor: 'pointer',
              fontSize: '13px',
              color: palette.ink
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = palette.growth}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = palette.border}
          >
            <Calendar size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div style={{ 
          background: palette.surface, 
          padding: '12px 20px', 
          borderBottom: `1px solid ${palette.border}`,
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div>
            <label className="fr-body" style={{ display: 'block', fontSize: '11px', color: palette.inkSoft, marginBottom: '4px' }}>
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="fr-body"
              style={{
                padding: '6px 10px',
                border: `1px solid ${palette.border}`,
                borderRadius: '6px',
                fontSize: '13px',
                outline: 'none',
                minWidth: '140px',
                background: palette.surface,
                color: palette.ink
              }}
            >
              <option value="all">All Status</option>
              <option value="completed" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>Completed</option>
              <option value="in progress" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>In Progress</option>
              <option value="overdue" style={{ backgroundColor: '#fee2e2', color: '#B5432B' }}>Overdue</option>
            </select>
          </div>

          {isOperationsUser && (
            <div>
              <label className="fr-body" style={{ display: 'block', fontSize: '11px', color: palette.inkSoft, marginBottom: '4px' }}>
                Contact Owner
              </label>
              <select
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
                className="fr-body"
                style={{
                  padding: '6px 10px',
                  border: `1px solid ${palette.border}`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  outline: 'none',
                  minWidth: '140px',
                  background: palette.surface,
                  color: palette.ink
                }}
              >
                <option value="all">All Contact Owners</option>
                {contactOwnerOptions.map(owner => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="fr-body" style={{ display: 'block', fontSize: '11px', color: palette.inkSoft, marginBottom: '4px' }}>
              Created Time
            </label>
            <select
              value={createdTimeFilter}
              onChange={(e) => {
                setCreatedTimeFilter(e.target.value);
                setCreatedTimeDate('');
                setCreatedTimeStartDate('');
                setCreatedTimeEndDate('');
              }}
              className="fr-body"
              style={{
                padding: '6px 10px',
                border: `1px solid ${palette.border}`,
                borderRadius: '6px',
                fontSize: '13px',
                outline: 'none',
                minWidth: '140px',
                background: palette.surface,
                color: palette.ink
              }}
            >
              <option value="all">All Time</option>
              <option value="on">On</option>
              <option value="after">After</option>
              <option value="before">Before</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {createdTimeFilter === 'on' && (
            <div>
              <label className="fr-body" style={{ display: 'block', fontSize: '11px', color: palette.inkSoft, marginBottom: '4px' }}>
                Date
              </label>
              <input
                type="date"
                value={createdTimeDate}
                onChange={(e) => setCreatedTimeDate(e.target.value)}
                className="fr-body"
                style={{
                  padding: '6px 10px',
                  border: `1px solid ${palette.border}`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  outline: 'none',
                  minWidth: '140px',
                  background: palette.surface,
                  color: palette.ink
                }}
              />
            </div>
          )}

          {createdTimeFilter === 'after' && (
            <div>
              <label className="fr-body" style={{ display: 'block', fontSize: '11px', color: palette.inkSoft, marginBottom: '4px' }}>
                From Date
              </label>
              <input
                type="date"
                value={createdTimeDate}
                onChange={(e) => setCreatedTimeDate(e.target.value)}
                className="fr-body"
                style={{
                  padding: '6px 10px',
                  border: `1px solid ${palette.border}`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  outline: 'none',
                  minWidth: '140px',
                  background: palette.surface,
                  color: palette.ink
                }}
              />
            </div>
          )}

          {createdTimeFilter === 'before' && (
            <div>
              <label className="fr-body" style={{ display: 'block', fontSize: '11px', color: palette.inkSoft, marginBottom: '4px' }}>
                Before Date
              </label>
              <input
                type="date"
                value={createdTimeDate}
                onChange={(e) => setCreatedTimeDate(e.target.value)}
                className="fr-body"
                style={{
                  padding: '6px 10px',
                  border: `1px solid ${palette.border}`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  outline: 'none',
                  minWidth: '140px',
                  background: palette.surface,
                  color: palette.ink
                }}
              />
            </div>
          )}

          {createdTimeFilter === 'custom' && (
            <>
              <div>
                <label className="fr-body" style={{ display: 'block', fontSize: '11px', color: palette.inkSoft, marginBottom: '4px' }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={createdTimeStartDate}
                  onChange={(e) => setCreatedTimeStartDate(e.target.value)}
                  className="fr-body"
                  style={{
                    padding: '6px 10px',
                    border: `1px solid ${palette.border}`,
                    borderRadius: '6px',
                    fontSize: '13px',
                    outline: 'none',
                    minWidth: '140px',
                    background: palette.surface,
                    color: palette.ink
                  }}
                />
              </div>
              <div>
                <label className="fr-body" style={{ display: 'block', fontSize: '11px', color: palette.inkSoft, marginBottom: '4px' }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={createdTimeEndDate}
                  onChange={(e) => setCreatedTimeEndDate(e.target.value)}
                  className="fr-body"
                  style={{
                    padding: '6px 10px',
                    border: `1px solid ${palette.border}`,
                    borderRadius: '6px',
                    fontSize: '13px',
                    outline: 'none',
                    minWidth: '140px',
                    background: palette.surface,
                    color: palette.ink
                  }}
                />
              </div>
            </>
          )}

          <button
            onClick={() => {
              setStatusFilter('all');
              setOwnerFilter('all');
              setCreatedTimeFilter('all');
              setCreatedTimeDate('');
              setCreatedTimeStartDate('');
              setCreatedTimeEndDate('');
              setSearchTerm('');
            }}
            className="fr-body"
            style={{
              padding: '6px 12px',
              border: `1px solid ${palette.border}`,
              borderRadius: '6px',
              background: palette.surface,
              cursor: 'pointer',
              fontSize: '13px',
              color: palette.ink,
              marginLeft: 'auto'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = palette.growth}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = palette.border}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Calendar Navigation */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '12px 20px',
        background: palette.surface,
        borderBottom: `1px solid ${palette.border}`,
        flexShrink: 0
      }}>
        <button
          onClick={goToPreviousMonth}
          className="fr-body"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            border: `1px solid ${palette.border}`,
            borderRadius: '6px',
            background: palette.surface,
            cursor: 'pointer',
            fontSize: '13px',
            color: palette.ink
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = palette.growth}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = palette.border}
        >
          <ChevronLeft size={14} />
          Previous
        </button>

        <h2 className="fr-body" style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: palette.ink }}>
          {monthName}
        </h2>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={goToToday}
            className="fr-body"
            style={{
              padding: '6px 12px',
              border: `1px solid ${palette.border}`,
              borderRadius: '6px',
              background: palette.surface,
              cursor: 'pointer',
              fontSize: '13px',
              color: palette.ink
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = palette.growth}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = palette.border}
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="fr-body"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              border: `1px solid ${palette.border}`,
              borderRadius: '6px',
              background: palette.surface,
              cursor: 'pointer',
              fontSize: '13px',
              color: palette.ink
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = palette.growth}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = palette.border}
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto',
        background: palette.surface
      }}>
        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}>
            <div className="fr-body" style={{ fontSize: '14px', color: palette.inkSoft }}>Loading tasks...</div>
          </div>
        ) : (
          <>
            {/* Day Headers */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)',
              background: palette.canvas,
              borderBottom: `1px solid ${palette.border}`,
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="fr-body" style={{ 
                  padding: '8px', 
                  textAlign: 'center', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  color: palette.ink
                }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)',
              minHeight: '100%'
            }}>
              {days.map((date, index) => {
                const dayTasks = getTasksForDay(date);
                const isToday = date && date.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={index}
                    style={{
                      minHeight: '80px',
                      padding: '6px',
                      borderRight: `1px solid ${palette.border}`,
                      borderBottom: `1px solid ${palette.border}`,
                      borderLeft: index % 7 === 0 ? `1px solid ${palette.border}` : 'none',
                      background: isToday ? '#f0fdf4' : palette.surface,
                      position: 'relative'
                    }}
                  >
                    {date && (
                      <>
                        <div className="fr-body" style={{ 
                          fontSize: '12px', 
                          fontWeight: isToday ? '600' : '400',
                          color: isToday ? palette.growth : palette.ink,
                          marginBottom: '4px'
                        }}>
                          {date.getDate()}
                        </div>
                        
                        {dayTasks.slice(0, 3).map(task => {
                          const effectiveStatus = getEffectiveStatus(task);
                          const statusColors = getStatusColor(effectiveStatus);
                          const displayName = isOperationsUser 
                            ? (task.task_owner || task.created_by || task.user || 'N/A')
                            : (task.lead_name || task.task_owner || task.created_by || task.user || 'N/A');
                          
                          return (
                            <div
                              key={task.id}
                              onClick={() => {
                                setSelectedTask(task);
                                setShowTaskModal(true);
                              }}
                              className="fr-body"
                              style={{
                                padding: '2px 6px',
                                borderRadius: '3px',
                                background: statusColors.bg,
                                border: `1px solid ${statusColors.border}`,
                                color: statusColors.text,
                                fontSize: '10px',
                                marginBottom: '3px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                              title={`${task.task_name}${displayName ? ` - ${displayName}` : ''}${task.message ? `: ${task.message}` : ''}${isTaskOverdue(task) ? ' (Overdue)' : ''}`}
                            >
                              <div style={{ 
                                fontWeight: '500',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {task.task_name}
                              </div>
                              {displayName && (
                                <div style={{ 
                                  fontSize: '9px',
                                  opacity: 0.8,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  marginTop: '1px'
                                }}>
                                  {displayName}
                                </div>
                              )}
                              {task.message && (
                                <div style={{ 
                                  fontSize: '9px',
                                  opacity: 0.8,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  marginTop: '1px'
                                }}>
                                  {task.message}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        
                        {dayTasks.length > 3 && (
                          <div 
                            onClick={() => {
                              setSelectedDayTasks(dayTasks);
                              setShowDayTasksModal(true);
                            }}
                            className="fr-body"
                            style={{ 
                              fontSize: '10px', 
                              color: palette.inkFaint,
                              textAlign: 'center',
                              cursor: 'pointer',
                              padding: '2px 4px',
                              borderRadius: '3px',
                              background: palette.canvas,
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = palette.border;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = palette.canvas;
                            }}
                          >
                            +{dayTasks.length - 3} more
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <div 
          onClick={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
            setEditingField(null);
            setEditedTaskName('');
            setEditedDueDate('');
            setEditedDueTime('');
            setEditedStatus('');
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}>
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: palette.surface,
              borderRadius: '12px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '75vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              animation: 'modalSlideIn 0.3s ease-out'
            }}>
            {/* Header with gradient background */}
            <div style={{ 
              padding: '16px', 
              background: `linear-gradient(135deg, ${palette.pineDeep} 0%, ${palette.pine} 100%)`,
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'relative'
            }}>
              <div>
                <h3 className="fr-body" style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'white' }}>
                  Task Details
                </h3>
                <div className="fr-body" style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
                  {selectedTask.task_name}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTaskModal(false);
                    setSelectedTask(null);
                    setEditingField(null);
                    setEditedTaskName('');
                    setEditedDueDate('');
                    setEditedDueTime('');
                    setEditedStatus('');
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  }}
                >
                  <X size={18} style={{ color: 'white' }} />
                </button>
              </div>
            </div>
            
            <div style={{ padding: '16px' }}>
              {/* Status Badge */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="fr-body" style={{
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '600',
                    ...getStatusColor(getEffectiveStatus(selectedTask)),
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    {getEffectiveStatus(selectedTask) === 'Completed' && <CheckCircle size={14} />}
                    {getEffectiveStatus(selectedTask) === 'In Progress' && <Clock size={14} />}
                    {getEffectiveStatus(selectedTask) === 'Overdue' && <AlertCircle size={14} />}
                    {getEffectiveStatus(selectedTask)}
                  </span>
                  {isTaskOverdue(selectedTask) && (
                    <span className="fr-body" style={{ 
                      fontSize: '11px', 
                      color: palette.rust, 
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}>
                      <AlertCircle size={12} />
                      Overdue
                    </span>
                  )}
                </div>
              </div>

              {/* Task Name */}
              <div style={{ marginBottom: '14px' }}>
                <label className="fr-body" style={{ display: 'block', fontSize: '10px', color: palette.inkSoft, marginBottom: '4px', fontWeight: '500', letterSpacing: '0.5px' }}>
                  TASK NAME
                </label>
                {editingField === 'taskName' ? (
                  <select
                    value={editedTaskName}
                    onChange={(e) => setEditedTaskName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.target.blur();
                      } else if (e.key === 'Escape') {
                        setEditingField(null);
                        setEditedTaskName('');
                      }
                    }}
                    autoFocus
                    className="fr-body"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: `2px solid ${palette.growth}`,
                      borderRadius: '6px',
                      fontSize: '13px',
                      outline: 'none',
                      background: palette.surface,
                      color: palette.ink,
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <option value="mail">📧 Mail</option>
                    <option value="follow up">🔄 Follow Up</option>
                    <option value="meet">🤝 Meet</option>
                    <option value="call">📞 Call</option>
                    <option value="payment follow up">💰 Payment Follow Up</option>
                  </select>
                ) : (
                  <div 
                    onClick={() => {
                      setEditingField('taskName');
                      setEditedTaskName(selectedTask.task_name || '');
                    }}
                    className="fr-body" 
                    style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: palette.ink,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: `1px solid transparent`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = palette.canvas;
                      e.currentTarget.style.borderColor = palette.border;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >
                    {selectedTask.task_name === 'mail' && '📧'}
                    {selectedTask.task_name === 'follow up' && '🔄'}
                    {selectedTask.task_name === 'meet' && '🤝'}
                    {selectedTask.task_name === 'call' && '📞'}
                    {selectedTask.task_name === 'payment follow up' && '💰'}
                    {selectedTask.task_name}
                    <Edit size={12} style={{ color: palette.inkFaint, marginLeft: 'auto' }} />
                  </div>
                )}
              </div>

              {/* Status */}
              <div style={{ marginBottom: '14px' }}>
                <label className="fr-body" style={{ display: 'block', fontSize: '10px', color: palette.inkSoft, marginBottom: '4px', fontWeight: '500', letterSpacing: '0.5px' }}>
                  STATUS
                </label>
                {editingField === 'status' ? (
                  <select
                    value={editedStatus}
                    onChange={(e) => setEditedStatus(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.target.blur();
                      } else if (e.key === 'Escape') {
                        setEditingField(null);
                        setEditedStatus('');
                      }
                    }}
                    autoFocus
                    className="fr-body"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: `2px solid ${palette.growth}`,
                      borderRadius: '6px',
                      fontSize: '13px',
                      outline: 'none',
                      background: palette.surface,
                      color: palette.ink,
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <option value="In Progress" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>⏳ In Progress</option>
                    <option value="Completed" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>✅ Completed</option>
                  </select>
                ) : (
                  <div 
                    onClick={() => {
                      if (!isTaskOverdue(selectedTask)) {
                        setEditingField('status');
                        setEditedStatus(selectedTask.status || 'Pending');
                      }
                    }}
                    style={{ 
                      display: 'inline-block',
                      cursor: isTaskOverdue(selectedTask) ? 'not-allowed' : 'pointer',
                      opacity: isTaskOverdue(selectedTask) ? 0.6 : 1
                    }}
                  >
                    <span className="fr-body" style={{
                      padding: '5px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      backgroundColor: getStatusColor(getEffectiveStatus(selectedTask)).bg,
                      color: getStatusColor(getEffectiveStatus(selectedTask)).text,
                      border: `1px solid ${getStatusColor(getEffectiveStatus(selectedTask)).border}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s'
                    }}>
                      {getEffectiveStatus(selectedTask)}
                      {!isTaskOverdue(selectedTask) && <Edit size={10} style={{ color: 'inherit', opacity: 0.6 }} />}
                    </span>
                  </div>
                )}
              </div>

              {/* Due Date & Time */}
              <div style={{ marginBottom: '14px' }}>
                <label className="fr-body" style={{ display: 'block', fontSize: '10px', color: palette.inkSoft, marginBottom: '4px', fontWeight: '500', letterSpacing: '0.5px' }}>
                  DUE DATE & TIME
                </label>
                {editingField === 'dueDate' ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="date"
                      value={editedDueDate}
                      onChange={(e) => setEditedDueDate(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setEditingField(null);
                          setEditedDueDate('');
                          setEditedDueTime('');
                        }
                      }}
                      autoFocus
                      className="fr-body"
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        border: `2px solid ${palette.growth}`,
                        borderRadius: '6px',
                        fontSize: '13px',
                        outline: 'none',
                        background: palette.surface,
                        color: palette.ink,
                        transition: 'border-color 0.2s'
                      }}
                    />
                    <input
                      type="time"
                      value={editedDueTime}
                      onChange={(e) => setEditedDueTime(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setEditingField(null);
                          setEditedDueDate('');
                          setEditedDueTime('');
                        }
                      }}
                      className="fr-body"
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        border: `2px solid ${palette.growth}`,
                        borderRadius: '6px',
                        fontSize: '13px',
                        outline: 'none',
                        background: palette.surface,
                        color: palette.ink,
                        transition: 'border-color 0.2s'
                      }}
                    />
                  </div>
                ) : (
                  <div 
                    onClick={() => {
                      setEditingField('dueDate');
                      setEditedDueDate(formatDateForInput(selectedTask.due_date));
                      setEditedDueTime(formatTimeForInput(selectedTask.due_date, selectedTask.due_time));
                    }}
                    className="fr-body" 
                    style={{ 
                      fontSize: '13px', 
                      color: palette.ink, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      padding: '8px 10px',
                      background: palette.canvas,
                      borderRadius: '6px',
                      border: `1px solid ${palette.border}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = palette.growth;
                      e.currentTarget.style.background = '#f0fdf4';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = palette.border;
                      e.currentTarget.style.background = palette.canvas;
                    }}
                  >
                    <Calendar size={14} style={{ color: palette.growth }} />
                    {selectedTask.due_date && selectedTask.due_date.includes(' ') 
                      ? formatDateSafe(selectedTask.due_date, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : (formatDateSafe(selectedTask.due_date) + (selectedTask.due_time ? ` ${selectedTask.due_time}` : ''))
                    }
                    <Edit size={12} style={{ color: palette.inkFaint, marginLeft: 'auto' }} />
                  </div>
                )}
              </div>

              {/* Task Owner */}
              <div style={{ marginBottom: '14px' }}>
                <label className="fr-body" style={{ display: 'block', fontSize: '10px', color: palette.inkSoft, marginBottom: '4px', fontWeight: '500', letterSpacing: '0.5px' }}>
                  TASK OWNER
                </label>
                <div className="fr-body" style={{ 
                  fontSize: '13px', 
                  color: palette.ink, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  padding: '8px 10px',
                  background: palette.canvas,
                  borderRadius: '6px',
                  border: `1px solid ${palette.border}`
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${palette.pine} 0%, ${palette.growth} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {(selectedTask.task_owner || selectedTask.created_by || selectedTask.user || 'N/A').charAt(0).toUpperCase()}
                  </div>
                  {selectedTask.task_owner || selectedTask.created_by || selectedTask.user || 'N/A'}
                </div>
              </div>

              {/* Related Lead */}
              {selectedTask.lead_name && (
                <div style={{ marginBottom: '14px' }}>
                  <label className="fr-body" style={{ display: 'block', fontSize: '10px', color: palette.inkSoft, marginBottom: '4px', fontWeight: '500', letterSpacing: '0.5px' }}>
                    RELATED LEAD
                  </label>
                  <div className="fr-body" style={{ 
                    fontSize: '13px', 
                    color: palette.ink,
                    padding: '8px 10px',
                    background: palette.canvas,
                    borderRadius: '6px',
                    border: `1px solid ${palette.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <User size={14} style={{ color: palette.growth }} />
                    {selectedTask.lead_name}
                  </div>
                </div>
              )}

              {/* Contact Number */}
              {selectedTask.contact_number && (
                <div style={{ marginBottom: '14px' }}>
                  <label className="fr-body" style={{ display: 'block', fontSize: '10px', color: palette.inkSoft, marginBottom: '4px', fontWeight: '500', letterSpacing: '0.5px' }}>
                    CONTACT NUMBER
                  </label>
                  <div className="fr-body" style={{ 
                    fontSize: '13px', 
                    color: palette.ink,
                    padding: '8px 10px',
                    background: palette.canvas,
                    borderRadius: '6px',
                    border: `1px solid ${palette.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Phone size={14} style={{ color: palette.teal }} />
                    {selectedTask.contact_number}
                  </div>
                </div>
              )}

              {/* Message */}
              {selectedTask.message && (
                <div style={{ marginBottom: '14px' }}>
                  <label className="fr-body" style={{ display: 'block', fontSize: '10px', color: palette.inkSoft, marginBottom: '4px', fontWeight: '500', letterSpacing: '0.5px' }}>
                    MESSAGE
                  </label>
                  <div className="fr-body" style={{ 
                    fontSize: '13px', 
                    color: palette.ink,
                    background: palette.canvas,
                    padding: '10px',
                    borderRadius: '6px',
                    border: `1px solid ${palette.border}`,
                    lineHeight: '1.4',
                    fontStyle: 'italic'
                  }}>
                    "{selectedTask.message}"
                  </div>
                </div>
              )}

              {/* Related Account */}
              {selectedTask.account_name && (
                <div style={{ marginBottom: '14px' }}>
                  <label className="fr-body" style={{ display: 'block', fontSize: '10px', color: palette.inkSoft, marginBottom: '4px', fontWeight: '500', letterSpacing: '0.5px' }}>
                    RELATED ACCOUNT
                  </label>
                  <div className="fr-body" style={{ 
                    fontSize: '13px', 
                    color: palette.ink,
                    padding: '8px 10px',
                    background: palette.canvas,
                    borderRadius: '6px',
                    border: `1px solid ${palette.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ fontSize: '14px' }}>🏢</span>
                    {selectedTask.account_name}
                  </div>
                </div>
              )}

              {/* Created Date */}
              <div style={{ marginBottom: '14px' }}>
                <label className="fr-body" style={{ display: 'block', fontSize: '10px', color: palette.inkSoft, marginBottom: '4px', fontWeight: '500', letterSpacing: '0.5px' }}>
                  CREATED DATE
                </label>
                <div className="fr-body" style={{ 
                  fontSize: '13px', 
                  color: palette.ink, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  padding: '8px 10px',
                  background: palette.canvas,
                  borderRadius: '6px',
                  border: `1px solid ${palette.border}`
                }}>
                  <Clock size={14} style={{ color: palette.amber }} />
                  {formatDateSafe(selectedTask.created_time)}
                </div>
              </div>

              {/* Save Button */}
              {editingField && (
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: `1px solid ${palette.border}`
                }}>
                  <button
                    onClick={() => {
                      setEditingField(null);
                      setEditedTaskName('');
                      setEditedDueDate('');
                      setEditedDueTime('');
                      setEditedStatus('');
                    }}
                    className="fr-body"
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      border: `1px solid ${palette.border}`,
                      borderRadius: '6px',
                      background: palette.surface,
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: palette.ink,
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = palette.growth;
                      e.currentTarget.style.background = palette.canvas;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = palette.border;
                      e.currentTarget.style.background = palette.surface;
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const activityApiUrl = import.meta.env.VITE_LEAD_ACTIVITY_API_URL;
                        const finalTaskName = editingField === 'taskName' ? editedTaskName : (selectedTask.task_name || '');
                        const finalDueDate = editingField === 'dueDate' ? editedDueDate : formatDateForInput(selectedTask.due_date);
                        const finalDueTime = editingField === 'dueDate' ? (editedDueTime || '23:59') : formatTimeForInput(selectedTask.due_date, selectedTask.due_time);
                        const finalStatus = editingField === 'status' ? editedStatus : (selectedTask.status || 'In Progress');

                        const requestBody = {
                          id: String(selectedTask.id),
                          activity_type: 'task',
                          task_name: finalTaskName,
                          due_date: finalDueDate,
                          due_time: finalDueTime ? finalDueTime.slice(0, 5) : '23:59',
                          status: finalStatus,
                          task_owner: selectedTask.task_owner || selectedTask.created_by || currentUserName,
                          user: currentUserName
                        };

                        console.log('Updating task with:', requestBody);
                        
                        const headers = {
                          'Content-Type': 'application/json',
                        };
                        const stored = localStorage.getItem('sat2farm_user');
                        if (stored) {
                          try {
                            const { jwt, token } = JSON.parse(stored);
                            const actualToken = jwt || token;
                            if (actualToken) {
                              headers['Authorization'] = `Bearer ${actualToken}`;
                            }
                          } catch (e) { }
                        }

                        const response = await fetch(activityApiUrl, {
                          method: 'PUT',
                          headers,
                          body: JSON.stringify(requestBody)
                        });

                        const result = await response.json();
                        console.log('API response:', result);

                        if (response.ok && (result.success || result.message || result.id || result.status)) {
                          toast.success('Task updated successfully');

                          // Update selectedTask in modal state
                          setSelectedTask(prev => prev ? {
                            ...prev,
                            task_name: finalTaskName,
                            due_date: finalDueDate ? `${finalDueDate} ${finalDueTime}` : prev.due_date,
                            due_time: finalDueTime,
                            status: finalStatus
                          } : null);

                          await fetchAllTasks();
                          setEditingField(null);
                          setEditedTaskName('');
                          setEditedDueDate('');
                          setEditedDueTime('');
                          setEditedStatus('');
                        } else {
                          console.error('API error:', result);
                          toast.error(result.message || 'Failed to update task');
                        }
                      } catch (error) {
                        console.error('Error updating task:', error);
                        toast.error('Failed to update task');
                      }
                    }}
                    className="fr-body"
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      border: 'none',
                      borderRadius: '6px',
                      background: `linear-gradient(135deg, ${palette.pineDeep} 0%, ${palette.pine} 100%)`,
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 8px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Day Tasks Modal */}
      {showDayTasksModal && selectedDayTasks && (
        <div 
          onClick={() => {
            setShowDayTasksModal(false);
            setSelectedDayTasks(null);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: palette.surface,
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '70vh',
              overflow: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}>
            <div style={{ 
              padding: '16px', 
              borderBottom: `1px solid ${palette.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 className="fr-body" style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: palette.ink }}>
                All Tasks for This Day ({selectedDayTasks.length})
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDayTasksModal(false);
                  setSelectedDayTasks(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={18} style={{ color: palette.inkFaint }} />
              </button>
            </div>
            
            <div style={{ padding: '16px' }}>
              {selectedDayTasks.map(task => {
                const effectiveStatus = getEffectiveStatus(task);
                const statusColors = getStatusColor(effectiveStatus);
                const displayName = isOperationsUser 
                  ? (task.task_owner || task.created_by || task.user || 'N/A')
                  : (task.lead_name || task.task_owner || task.created_by || task.user || 'N/A');
                const displayIcon = isOperationsUser ? '👤' : '📋';
                
                return (
                  <div
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTask(task);
                      setShowTaskModal(true);
                      setShowDayTasksModal(false);
                    }}
                    className="fr-body"
                    style={{
                      padding: '12px',
                      marginBottom: '8px',
                      borderRadius: '6px',
                      border: `1px solid ${statusColors.border}`,
                      background: statusColors.bg,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <div style={{ flex: 1, fontWeight: '500', color: statusColors.text, fontSize: '13px' }}>
                        {task.task_name}
                      </div>
                      <span className="fr-body" style={{
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: '500',
                        background: palette.surface,
                        color: statusColors.text,
                        border: `1px solid ${statusColors.border}`
                      }}>
                        {effectiveStatus}
                      </span>
                    </div>
                    
                    {isTaskOverdue(task) && (
                      <div className="fr-body" style={{ 
                        fontSize: '10px', 
                        color: palette.rust, 
                        marginTop: '2px',
                        fontWeight: '500'
                      }}>
                        ⚠️ Overdue
                      </div>
                    )}
                    
                    {task.message && (
                      <div className="fr-body" style={{ 
                        fontSize: '12px', 
                        color: statusColors.text,
                        marginTop: '4px',
                        fontStyle: 'italic',
                        opacity: 0.8
                      }}>
                        {task.message}
                      </div>
                    )}
                    
                    <div className="fr-body" style={{ 
                      display: 'flex', 
                      gap: '12px', 
                      marginTop: '6px',
                      fontSize: '11px',
                      color: statusColors.text,
                      opacity: 0.7
                    }}>
                      <span>{displayIcon} {displayName}</span>
                      {isSalesUser && task.contact_number && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={12} style={{ color: palette.teal }} />
                          {task.contact_number}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Today's Tasks Sidebar */}
      {showTodayTasks && (
        <div style={{
          width: '320px',
          background: palette.surface,
          borderLeft: `1px solid ${palette.border}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px',
            borderBottom: `1px solid ${palette.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: palette.canvas
          }}>
            <div>
              <h3 className="fr-body" style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: palette.ink }}>
                {areFiltersActive() ? 'Filtered Tasks' : "Today's Tasks"}
              </h3>
              <p className="fr-body" style={{ margin: '4px 0 0', fontSize: '12px', color: palette.inkSoft }}>
                {areFiltersActive() 
                  ? `${todayTasks.length} task${todayTasks.length !== 1 ? 's' : ''} matching filters`
                  : `${todayTasks.length} task${todayTasks.length !== 1 ? 's' : ''} for today`
                }
              </p>
            </div>
            <button
              onClick={() => setShowTodayTasks(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={16} style={{ color: palette.inkFaint }} />
            </button>
          </div>

          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '12px'
          }}>
            {todayTasks.length === 0 ? (
              <div className="fr-body" style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: palette.inkFaint,
                fontSize: '13px'
              }}>
                {areFiltersActive() ? 'No tasks match the current filters' : 'No tasks scheduled for today'}
              </div>
            ) : (
              todayTasks.map(task => {
                const effectiveStatus = getEffectiveStatus(task);
                const statusColors = getStatusColor(effectiveStatus);
                const displayName = isOperationsUser 
                  ? (task.task_owner || task.created_by || task.user || 'N/A')
                  : (task.lead_name || task.task_owner || task.created_by || task.user || 'N/A');
                const displayIcon = isOperationsUser ? '👤' : '📋';
                
                return (
                  <div
                    key={task.id}
                    onClick={() => {
                      setSelectedTask(task);
                      setShowTaskModal(true);
                    }}
                    className="fr-body"
                    style={{
                      padding: '12px',
                      marginBottom: '10px',
                      borderRadius: '6px',
                      border: `1px solid ${statusColors.border}`,
                      background: statusColors.bg,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div style={{ flex: 1, fontWeight: '500', color: statusColors.text, fontSize: '13px', lineHeight: '1.4' }}>
                        {task.task_name}
                      </div>
                      <span className="fr-body" style={{
                        padding: '3px 8px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: '500',
                        marginLeft: '8px',
                        flexShrink: 0,
                        background: palette.surface,
                        color: statusColors.text,
                        border: `1px solid ${statusColors.border}`
                      }}>
                        {effectiveStatus}
                      </span>
                    </div>
                    
                    {isTaskOverdue(task) && (
                      <div className="fr-body" style={{ 
                        fontSize: '10px', 
                        color: palette.rust, 
                        marginTop: '2px',
                        fontWeight: '500'
                      }}>
                        ⚠️ Overdue
                      </div>
                    )}
                    
                    {task.message && (
                      <div className="fr-body" style={{ 
                        fontSize: '12px', 
                        color: statusColors.text,
                        marginTop: '6px',
                        fontStyle: 'italic',
                        lineHeight: '1.3',
                        opacity: 0.8
                      }}>
                        {task.message}
                      </div>
                    )}
                    
                    <div className="fr-body" style={{ 
                      display: 'flex', 
                      gap: '12px', 
                      marginTop: '8px',
                      fontSize: '11px',
                      color: statusColors.text,
                      opacity: 0.7
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {displayIcon} {displayName}
                      </span>
                      {isSalesUser && task.contact_number && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={12} style={{ color: palette.teal }} />
                          {task.contact_number}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Toggle button for sidebar */}
      {!showTodayTasks && (
        <button
          onClick={() => setShowTodayTasks(true)}
          className="fr-body"
          style={{
            position: 'fixed',
            right: '20px',
            bottom: '20px',
            padding: '12px 16px',
            background: palette.pineDeep,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 100
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = palette.pine;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = palette.pineDeep;
          }}
        >
          <Calendar size={16} />
          {areFiltersActive() ? `Filtered Tasks (${todayTasks.length})` : `Today's Tasks (${todayTasks.length})`}
        </button>
      )}
    </div>
  );
}
