import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Plus, Edit, Trash2, Eye, Phone, Mail, Calendar, MapPin, TrendingUp, Users, DollarSign, Activity, ChevronDown, ChevronRight, ChevronLeft, X, Check, Clock, AlertCircle, FileText, Upload, Building2, User, GripVertical, Tag, Briefcase, Globe, Map, CreditCard, MessageSquare, FileEdit, UserCheck, Building, List, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { KanbanDndProvider } from './kanban/KanbanDndContext';
import KanbanColumnDropZone from './kanban/KanbanColumnDropZone';
import KanbanDraggableCard from './kanban/KanbanDraggableCard';
import { GREEN_TEAM_KANBAN_COLUMNS } from './kanban/greenTeamConstants';
import satyuktLogo from '../assets/satyukt.webp';
import axios from 'axios';

const GREEN_TEAM_GET_ASSIGNMENTS_URL = import.meta.env.VITE_GREEN_TEAM_GET_ASSIGNMENTS_URL;
const GREEN_TEAM_UPDATE_STAGE_URL = import.meta.env.VITE_GREEN_TEAM_UPDATE_STAGE_URL;
const GREEN_TEAM_PUT_URL = import.meta.env.VITE_GREEN_TEAM_POST_ASSIGNMENT_URL;

// Get icon for timeline field
const getTimelineIcon = (field) => {
  const iconMap = {
    'assignment_created': Plus,
    'stage_change': Activity,
    'type': Tag,
    'admin_number': Phone,
    'farmer_number': Phone,
    'total_acres': Map,
    'plan': Calendar,
    'admin_name': User,
    'farmer_name': User,
    'description': FileText,
    'note': MessageSquare,
    'deal_name': Briefcase,
    'contact_name': User,
    'amount': DollarSign,
    'closing_date': Calendar,
    'account_number': CreditCard
  };
  const IconComponent = iconMap[field] || FileEdit;
  return IconComponent;
};

// Satyukt Loading Component (Within Content Area)
const SatyuktLoader = ({ message, subtitle }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
    padding: '40px'
  }}>
    <div style={{
      position: 'relative',
      width: '120px',
      height: '120px',
      marginBottom: '32px'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: '50%',
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #16a34a',
        animation: 'spin 1s linear infinite'
      }} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#f0fdf4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img 
          src={satyuktLogo} 
          alt="Satyukt" 
          style={{ 
            width: '50px', 
            height: '50px',
            objectFit: 'contain'
          }} 
        />
      </div>
    </div>
    <h2 style={{ 
      margin: '0 0 12px 0', 
      fontSize: '24px', 
      fontWeight: '700', 
      color: '#0f172a',
      textAlign: 'center'
    }}>
      {message || 'Loading Green Team Assignments...'}
    </h2>
    <p style={{ 
      margin: '0 0 24px 0', 
      fontSize: '16px', 
      color: '#64748b',
      textAlign: 'center',
      maxWidth: '400px'
    }}>
      {subtitle || 'Fetching your latest assignments. This may take a few seconds.'}
    </p>
    <div style={{
      width: '300px',
      height: '8px',
      backgroundColor: '#e5e7eb',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '16px'
    }}>
      <div style={{
        width: '60%',
        height: '100%',
        backgroundColor: '#16a34a',
        borderRadius: '4px',
        animation: 'progress 2s ease-in-out infinite'
      }} />
    </div>
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      fontSize: '14px',
      color: '#64748b'
    }}>
      <span style={{ 
        color: '#16a34a', 
        fontSize: '20px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }}>•</span> 
      Please don't close or refresh this page
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes progress {
        0% { width: 0%; }
        50% { width: 70%; }
        100% { width: 60%; }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `}</style>
  </div>
);

// Satyukt Empty State Component
const SatyuktEmptyState = ({ title, subtitle, onRefresh }) => (
  <div className="satyukt-empty-state-wrapper">
    <div className="satyukt-empty-icon-box">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="20" width="48" height="34" rx="6" fill="#22c55e" fillOpacity="0.15" />
        <path d="M12 24C12 21.7909 13.7909 20 16 20H26L30 24H52C54.2091 24 56 25.7909 56 28V48C56 50.2091 54.2091 52 52 52H12V24Z" fill="#16a34a" />
        <path d="M18 16H30L34 20H46C48.2091 20 50 21.7909 50 24V26H14V20C14 17.7909 15.7909 16 18 16Z" fill="#86efac" />
        <circle cx="40" cy="40" r="9" fill="white" stroke="#0f172a" strokeWidth="3" />
        <line x1="46" y1="46" x2="54" y2="54" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
    <h2 className="satyukt-empty-title">{title || 'No Green Team Assignments Found'}</h2>
    <p className="satyukt-empty-subtitle">{subtitle || 'No deals have been assigned to the Green Team yet.'}</p>
    {onRefresh && (
      <button onClick={onRefresh} className="satyukt-refresh-btn">
        <RefreshCw size={16} />
        Refresh
      </button>
    )}
  </div>
);

// Helper function to safely format dates with Indian Standard Time
const formatDateSafe = (dateValue, options = {}, fallback = 'N/A') => {
  if (!dateValue) return fallback;
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return fallback;
    
    // Always use complete IST formatting - never allow options to remove time
    const finalOptions = {
      day: 'numeric',
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    };
    
    // Use toLocaleString with Asia/Kolkata timezone for proper IST conversion
    return date.toLocaleString('en-IN', finalOptions);
  } catch (e) {
    return fallback;
  }
};

// Helper function to safely format amounts
const formatAmountSafe = (amountValue, fallback = 'Not available') => {
  if (amountValue === null || amountValue === undefined || amountValue === '') {
    return fallback;
  }
  
  try {
    // If it's already a string with currency symbol, return as is
    if (typeof amountValue === 'string' && (amountValue.includes('₹') || amountValue.includes('INR') || amountValue.includes('$'))) {
      return amountValue;
    }
    
    // Convert to number if it's a string
    const numAmount = typeof amountValue === 'string' ? parseFloat(amountValue) : amountValue;
    
    if (isNaN(numAmount)) {
      return fallback;
    }
    
    // Format as Indian currency
    return numAmount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
  } catch (e) {
    console.error('Error formatting amount:', e);
    return fallback;
  }
};

// Helper function to get ongoing value from timeline (used in both card and details view)
const getOngoingValue = (assignment, fallback = 'Unknown') => {
  if (assignment.timeline && assignment.timeline.length > 0) {
    // Sort timeline by created_at to get the most recent entry
    const sortedTimeline = [...assignment.timeline].sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB - dateA; // Sort in descending order (most recent first)
    });

    // Show the changed_by value from activity information
    return sortedTimeline[0].changed_by || fallback;
  }
  return assignment.submitted_by || fallback;
};

// Mock data generator
const getMockAssignments = () => {
  const now = new Date();
  return [
    {
      id: 1,
      deal_id: 'DEAL-001',
      deal_name: 'Sample Farm Project',
      type: 'Admin',
      admin_number: '9876543210',
      farmer_number: '9123456780',
      total_acres: '100',
      plan: 'Satellite monitoring for crop health',
      admin_name: 'John Admin',
      farmer_name: 'Jane Farmer',
      description: 'Initial farm setup project requiring satellite monitoring and crop health analysis for 100 acres.',
      stage: 'New Assignment',
      assigned_date: now.toISOString(),
      submitted_by: 'operation',
      stage_history: {
        'New Assignment': now.toISOString()
      },
      timeline: [
        {
          id: 1,
          field: 'assignment_created',
          activity_type: 'assignment_created',
          created_at: now.toISOString(),
          changed_by: 'operation',
          new_value: 'Assignment created and added to New Assignment stage'
        }
      ]
    },
    {
      id: 2,
      deal_id: 'DEAL-002',
      deal_name: 'Partner Integration',
      type: 'partner',
      admin_number: '9876543211',
      farmer_number: '9123456781',
      total_acres: '250',
      plan: 'Multi-location farm management',
      admin_name: 'Mike Admin',
      farmer_name: 'Sarah Farmer',
      description: 'Strategic partnership deployment for multi-location farm management across 250 acres with advanced analytics.',
      stage: 'In Progress',
      assigned_date: new Date(now - 86400000).toISOString(),
      submitted_by: 'operation',
      stage_history: {
        'New Assignment': new Date(now - 86400000).toISOString(),
        'In Progress': new Date(now - 43200000).toISOString()
      },
      timeline: [
        {
          id: 1,
          field: 'assignment_created',
          activity_type: 'assignment_created',
          created_at: new Date(now - 86400000).toISOString(),
          changed_by: 'operation',
          new_value: 'Assignment created and added to New Assignment stage'
        },
        {
          id: 2,
          field: 'stage_change',
          activity_type: 'stage_changed',
          created_at: new Date(now - 43200000).toISOString(),
          changed_by: 'operation',
          old_value: 'New Assignment',
          new_value: 'In Progress'
        }
      ]
    },
    {
      id: 3,
      deal_id: 'DEAL-003',
      deal_name: 'API Integration Project',
      type: 'API',
      admin_number: '9876543212',
      farmer_number: '9123456782',
      total_acres: '75',
      plan: 'Third-party system integration',
      admin_name: 'Alex Admin',
      farmer_name: 'Bob Farmer',
      description: 'Custom API integration for third-party farm management systems covering 75 acres with real-time data sync.',
      stage: 'Review',
      assigned_date: new Date(now - 172800000).toISOString(),
      submitted_by: 'operation',
      stage_history: {
        'New Assignment': new Date(now - 172800000).toISOString(),
        'In Progress': new Date(now - 129600000).toISOString(),
        'Review': new Date(now - 86400000).toISOString()
      },
      timeline: [
        {
          id: 1,
          field: 'assignment_created',
          activity_type: 'assignment_created',
          created_at: new Date(now - 172800000).toISOString(),
          changed_by: 'operation',
          new_value: 'Assignment created and added to New Assignment stage'
        },
        {
          id: 2,
          field: 'stage_change',
          activity_type: 'stage_changed',
          created_at: new Date(now - 129600000).toISOString(),
          changed_by: 'operation',
          old_value: 'New Assignment',
          new_value: 'In Progress'
        },
        {
          id: 3,
          field: 'stage_change',
          activity_type: 'stage_changed',
          created_at: new Date(now - 86400000).toISOString(),
          changed_by: 'operation',
          old_value: 'In Progress',
          new_value: 'Review'
        }
      ]
    },
    {
      id: 4,
      deal_id: 'DEAL-004',
      deal_name: 'White Label Deployment',
      type: 'White Label',
      admin_number: '9876543213',
      farmer_number: '9123456783',
      total_acres: '500',
      plan: 'Enterprise white-label solution',
      admin_name: 'Chris Admin',
      farmer_name: 'Diana Farmer',
      description: 'Complete white-label solution for enterprise client covering 500 acres with custom branding and dedicated support.',
      stage: 'Completed',
      assigned_date: new Date(now - 259200000).toISOString(),
      submitted_by: 'operation',
      stage_history: {
        'New Assignment': new Date(now - 259200000).toISOString(),
        'In Progress': new Date(now - 216000000).toISOString(),
        'Review': new Date(now - 172800000).toISOString(),
        'Completed': new Date(now - 86400000).toISOString()
      },
      timeline: [
        {
          id: 1,
          field: 'assignment_created',
          activity_type: 'assignment_created',
          created_at: new Date(now - 259200000).toISOString(),
          changed_by: 'operation',
          new_value: 'Assignment created and added to New Assignment stage'
        },
        {
          id: 2,
          field: 'stage_change',
          activity_type: 'stage_changed',
          created_at: new Date(now - 216000000).toISOString(),
          changed_by: 'operation',
          old_value: 'New Assignment',
          new_value: 'In Progress'
        },
        {
          id: 3,
          field: 'stage_change',
          activity_type: 'stage_changed',
          created_at: new Date(now - 172800000).toISOString(),
          changed_by: 'operation',
          old_value: 'In Progress',
          new_value: 'Review'
        },
        {
          id: 4,
          field: 'stage_change',
          activity_type: 'stage_changed',
          created_at: new Date(now - 86400000).toISOString(),
          changed_by: 'operation',
          old_value: 'Review',
          new_value: 'Completed'
        }
      ]
    }
  ];
};

export default function GreenTeam({ onPageChange }) {
  const { user } = useAuth();
  const [greenTeamAssignments, setGreenTeamAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [columnWidths, setColumnWidths] = useState({});
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentTimeline, setAssignmentTimeline] = useState([]);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [isEditingAssignment, setIsEditingAssignment] = useState(false);
  const [editingAssignmentDetails, setEditingAssignmentDetails] = useState({});
  const [savingAssignmentDetails, setSavingAssignmentDetails] = useState(false);

  // Fetch single assignment with timeline
  const fetchAssignmentWithTimeline = async (assignmentId) => {
    try {
      if (!GREEN_TEAM_GET_ASSIGNMENTS_URL) {
        return null;
      }

      const response = await axios.get(`${GREEN_TEAM_GET_ASSIGNMENTS_URL}?id=${assignmentId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.jwt || user?.token || ''}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching assignment with timeline:', error);
      return null;
    }
  };

  // Fetch Green Team assignments by stage
  const fetchGreenTeamAssignments = async () => {
    try {
      setLoading(true);
      
      if (!GREEN_TEAM_GET_ASSIGNMENTS_URL) {
        console.error('Green Team API URL not configured');
        setError('API URL not configured');
        setGreenTeamAssignments([]);
        return;
      }



      // First try to fetch all assignments without stage filter
      try {
        const response = await axios.get(GREEN_TEAM_GET_ASSIGNMENTS_URL, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.jwt || user?.token || ''}`
          }
        });
        

        
        // Handle the nested API response structure
        let assignmentsData = response.data;
        
        // Check if data is nested in an object with assignment property (single assignment)
        if (response.data && response.data.assignment && typeof response.data.assignment === 'object') {
          assignmentsData = [response.data.assignment];
          // Merge timeline if it exists at the top level
          if (response.data.timeline && Array.isArray(response.data.timeline)) {
            assignmentsData[0].timeline = response.data.timeline;
          }

        }
        // Check if data is nested in an object with assignments property (array of assignments)
        else if (response.data && response.data.assignments && Array.isArray(response.data.assignments)) {
          assignmentsData = response.data.assignments;

        }
        
        if (assignmentsData && Array.isArray(assignmentsData)) {
          // Log the structure of the first assignment to understand the data format
          if (assignmentsData.length > 0) {




          }
          
          // IMPORTANT: Field mapping for contact_name, amount, and closing_date
          // The API may return these fields with different names or may not return them at all.
          // We map them to standard names with fallbacks to handle different API response formats:
          // - contact_name: falls back to admin_name or farmer_name
          // - amount: falls back to deal_amount or total_amount
          // - closing_date: falls back to expected_close_date or close_date
          // If none of these fields exist, they will be set to null and display as "Not available"
          
          // Fetch timeline data for each assignment to ensure cards have correct ongoing values
          const assignmentsWithTimeline = await Promise.all(
            assignmentsData.map(async (assignment) => {
              const assignmentId = assignment.id?.toString() || assignment.deal_id?.toString();
              if (assignmentId) {
                try {
                  const timelineData = await fetchAssignmentWithTimeline(assignmentId);
                  if (timelineData && timelineData.timeline) {
                    return { ...assignment, timeline: timelineData.timeline };
                  }
                } catch (error) {
                  console.error(`Failed to fetch timeline for assignment ${assignmentId}:`, error);
                }
              }
              return assignment;
            })
          );

          // Ensure stage_history and timeline exist for all assignments
          const assignmentsWithHistory = assignmentsWithTimeline.map(assignment => {
            // Log each assignment's structure

            
            // Map API field names to our expected field names with fallbacks
            // The API may return fields with different names, so we map them to standard names
            const mappedAssignment = {
              ...assignment,
              stage: assignment.current_stage || 'New Assignment', // Map current_stage to stage
              assigned_date: assignment.created_at || new Date().toISOString(), // Map created_at to assigned_date
              stage_history: assignment.stage_history || {
                [assignment.current_stage]: assignment.created_at || new Date().toISOString()
              },
              timeline: assignment.timeline || [],
              // Map contact-related fields with fallbacks
              // Try contact_name first, then fall back to admin_name or farmer_name
              contact_name: assignment.contact_name || assignment.admin_name || assignment.farmer_name || null,
              // Map amount with fallback - try amount, deal_amount, or total_amount
              amount: assignment.amount || assignment.deal_amount || assignment.total_amount || null,
              // Map closing date with fallback - try closing_date, expected_close_date, or close_date
              closing_date: assignment.closing_date || assignment.expected_close_date || assignment.close_date || null,
              // Map new fields from updated API
              partner_name: assignment.partner_name || '',
              partner_number: assignment.partner_number || '',
              register_number: assignment.register_number || '',
              mail_id: assignment.mail_id || '',
              application_name: assignment.application_name || '',
              website: assignment.website || '',
              plan_1_month_acres: assignment.plan_1_month_acres || '',
              plan_6_months_acres: assignment.plan_6_months_acres || '',
              plan_12_months_acres: assignment.plan_12_months_acres || ''
            };
            
            // Always construct stage_history from API timeline data to ensure accuracy
            if (assignment.timeline && assignment.timeline.length > 0) {
              const constructedHistory = {};
              assignment.timeline.forEach(item => {
                if (item.action === 'stage changed' && item.description) {
                  const match = item.description.match(/moved from (.+?) to (.+?)$/i);
                  if (match) {
                    const targetStage = match[2].trim();
                    constructedHistory[targetStage] = item.created_at;
                  }
                } else if (item.action === 'assignment created') {
                  const initialStage = item.stage || assignment.current_stage || 'New Assignment';
                  constructedHistory[initialStage] = item.created_at;
                }
              });
              // Only use constructed history if it has data, otherwise keep API stage_history
              if (Object.keys(constructedHistory).length > 0) {
                mappedAssignment.stage_history = constructedHistory;
              }
            }
            

            return mappedAssignment;
          });
          

          
          // Log the stage values for debugging
          assignmentsWithHistory.forEach(assignment => {

          });
          
          setGreenTeamAssignments(assignmentsWithHistory);
          setError(null);
          return;
        }
      } catch (allFetchError) {
        console.error('Error fetching all assignments, trying stage-based fetch:', allFetchError);
        
        // Fallback to stage-based fetching
        const stagePromises = GREEN_TEAM_KANBAN_COLUMNS.map(async (column) => {
          try {
            const response = await axios.get(
              `${GREEN_TEAM_GET_ASSIGNMENTS_URL}?stage=${encodeURIComponent(column.stage)}`,
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${user?.jwt || user?.token || ''}`
                }
              }
            );
            

            
            // Handle the nested API response structure
            let stageAssignments = response.data;
            
            // Check if data is nested in an object with assignment property (single assignment)
            if (response.data && response.data.assignment && typeof response.data.assignment === 'object') {
              stageAssignments = [response.data.assignment];
              // Merge timeline if it exists at the top level
              if (response.data.timeline && Array.isArray(response.data.timeline)) {
                stageAssignments[0].timeline = response.data.timeline;
              }

            }
            // Check if data is nested in an object with assignments property (array of assignments)
            else if (response.data && response.data.assignments && Array.isArray(response.data.assignments)) {
              stageAssignments = response.data.assignments;

            }
            
            if (stageAssignments && Array.isArray(stageAssignments)) {
              // Ensure stage_history and timeline exist for all assignments
              return stageAssignments.map(assignment => ({
                ...assignment,
                stage: assignment.current_stage || 'New Assignment', // Map current_stage to stage
                assigned_date: assignment.created_at || new Date().toISOString(), // Map created_at to assigned_date
                stage_history: assignment.stage_history || {
                  [assignment.current_stage]: assignment.created_at || new Date().toISOString()
                },
                timeline: assignment.timeline || [
                  {
                    id: Date.now(),
                    field: 'assignment_created',
                    activity_type: 'assignment_created',
                    created_at: assignment.created_at || new Date().toISOString(),
                    changed_by: assignment.submitted_by || 'operation',
                    new_value: 'Assignment created and added to New Assignment stage'
                  }
                ],
                // Map contact-related fields with fallbacks
                // Try contact_name first, then fall back to admin_name or farmer_name
                contact_name: assignment.contact_name || assignment.admin_name || assignment.farmer_name || null,
                // Map amount with fallback - try amount, deal_amount, or total_amount
                amount: assignment.amount || assignment.deal_amount || assignment.total_amount || null,
                // Map closing date with fallback - try closing_date, expected_close_date, or close_date
                closing_date: assignment.closing_date || assignment.expected_close_date || assignment.close_date || null,
                // Map new fields from updated API
                partner_name: assignment.partner_name || '',
                partner_number: assignment.partner_number || '',
                register_number: assignment.register_number || '',
                mail_id: assignment.mail_id || '',
                application_name: assignment.application_name || '',
                website: assignment.website || '',
                plan_1_month_acres: assignment.plan_1_month_acres || '',
                plan_6_months_acres: assignment.plan_6_months_acres || '',
                plan_12_months_acres: assignment.plan_12_months_acres || ''
              }));
            }
            return [];
          } catch (err) {
            console.error(`Error fetching assignments for stage ${column.stage}:`, err);
            return [];
          }
        });

        const stageResults = await Promise.all(stagePromises);
        const allAssignments = stageResults.flat();
        

        setGreenTeamAssignments(allAssignments);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching Green Team assignments:', err);
      setError('Failed to fetch assignments');
      setGreenTeamAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchGreenTeamAssignments();
  }, []);

  // Save Green Team assignment details
  const saveAssignmentDetails = async () => {
    try {
      setSavingAssignmentDetails(true);
      if (!GREEN_TEAM_PUT_URL) {
        toast.error('API URL not configured');
        return;
      }

      // Build the payload with only changed fields
      const payload = {
        deal_id: editingAssignmentDetails.deal_id,
        changed_by: user?.name || user?.phone_number || user?.username || 'operation'
      };

      console.log('Current user object:', user);
      console.log('Payload being sent:', payload);
      console.log('Changed by value:', payload.changed_by);

      // Add fields that have changed (excluding non-editable fields)
      const editableFields = ['account_number', 'admin_number', 'admin_name', 'farmer_number', 'farmer_name', 'total_acres', 'plan', 'description', 'partner_name', 'partner_number', 'register_number', 'mail_id', 'application_name', 'website', 'plan_1_month_acres', 'plan_6_months_acres', 'plan_12_months_acres'];
      
      editableFields.forEach(field => {
        if (editingAssignmentDetails[field] !== selectedAssignment[field]) {
          // Convert plan fields to numbers if they have values
          if (field.includes('plan_') && editingAssignmentDetails[field]) {
            payload[field] = parseFloat(editingAssignmentDetails[field]);
          } else if (field.includes('plan_') && !editingAssignmentDetails[field]) {
            payload[field] = null;
          } else {
            payload[field] = editingAssignmentDetails[field];
          }
        }
      });

      const response = await axios.put(GREEN_TEAM_PUT_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.jwt || user?.token || ''}`
        }
      });

      console.log('API Response:', response.data);

      if (response.data) {
        toast.success('Assignment details updated successfully');

        // Update the selected assignment with the response data
        if (response.data.data) {
          setSelectedAssignment(response.data.data);
          setEditingAssignmentDetails(response.data.data);
        } else {
          setSelectedAssignment(editingAssignmentDetails);
          setEditingAssignmentDetails(editingAssignmentDetails);
        }

        setIsEditingAssignment(false);
        // Refresh the assignment list to get updated timeline
        await fetchGreenTeamAssignments();
      }
    } catch (error) {
      console.error('Error saving assignment details:', error);
      toast.error('Failed to update assignment details');
    } finally {
      setSavingAssignmentDetails(false);
    }
  };

  // Handle field change in edit mode
  const handleAssignmentFieldChange = (field, value) => {
    setEditingAssignmentDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Cancel editing
  const cancelAssignmentEditing = () => {
    setEditingAssignmentDetails(selectedAssignment);
    setIsEditingAssignment(false);
  };

  // Handle assignment click
  const handleAssignmentClick = async (assignment) => {

    
    // Set the clicked assignment immediately
    setSelectedAssignment(assignment);
    setEditingAssignmentDetails(assignment);
    
    // Try to fetch fresh timeline data from API using the assignment ID
    const assignmentId = assignment.id?.toString() || assignment.deal_id?.toString();

    
    if (assignmentId) {
      const freshData = await fetchAssignmentWithTimeline(assignmentId);

      
      if (freshData && freshData.timeline) {

        setAssignmentTimeline(freshData.timeline);
        
        // Update selected assignment with API timeline data and construct stage history
        // Apply field mapping to handle different API response formats
        const updatedAssignment = {
          ...assignment,
          ...freshData,
          timeline: freshData.timeline,
          // Map contact-related fields with fallbacks
          // Try contact_name first, then fall back to admin_name or farmer_name
          contact_name: freshData.contact_name || freshData.admin_name || freshData.farmer_name || assignment.contact_name || null,
          // Map amount with fallback - try amount, deal_amount, or total_amount
          amount: freshData.amount || freshData.deal_amount || freshData.total_amount || assignment.amount || null,
          // Map closing date with fallback - try closing_date, expected_close_date, or close_date
          closing_date: freshData.closing_date || freshData.expected_close_date || freshData.close_date || assignment.closing_date || null,
          // Map new fields from updated API
          partner_name: freshData.partner_name || assignment.partner_name || '',
          partner_number: freshData.partner_number || assignment.partner_number || '',
          register_number: freshData.register_number || assignment.register_number || '',
          mail_id: freshData.mail_id || assignment.mail_id || '',
          application_name: freshData.application_name || assignment.application_name || '',
          website: freshData.website || assignment.website || '',
          plan_1_month_acres: freshData.plan_1_month_acres || assignment.plan_1_month_acres || '',
          plan_6_months_acres: freshData.plan_6_months_acres || assignment.plan_6_months_acres || '',
          plan_12_months_acres: freshData.plan_12_months_acres || assignment.plan_12_months_acres || ''
        };
        
        // Construct stage history from API timeline
        if (freshData.timeline && freshData.timeline.length > 0) {
          const constructedHistory = {};
          freshData.timeline.forEach(item => {
            if (item.action === 'stage changed' && item.description) {
              const match = item.description.match(/moved from (.+?) to (.+?)$/i);
              if (match) {
                const targetStage = match[2].trim();
                constructedHistory[targetStage] = item.created_at;
              }
            } else if (item.action === 'assignment created') {
              const initialStage = item.stage || assignment.current_stage || 'New Assignment';
              constructedHistory[initialStage] = item.created_at;
            }
          });
          updatedAssignment.stage_history = constructedHistory;

      }
      
      setSelectedAssignment(updatedAssignment);
      setEditingAssignmentDetails(updatedAssignment);
      } else if (freshData && Array.isArray(freshData)) {
        // If the API returns the timeline directly as an array

        setAssignmentTimeline(freshData);
        
        // Update selected assignment with API timeline data
        // Apply field mapping to handle different API response formats
        const updatedAssignment = {
          ...assignment,
          ...freshData,
          timeline: freshData,
          // Map contact-related fields with fallbacks
          // Try contact_name first, then fall back to admin_name or farmer_name
          contact_name: freshData.contact_name || freshData.admin_name || freshData.farmer_name || assignment.contact_name || null,
          // Map amount with fallback - try amount, deal_amount, or total_amount
          amount: freshData.amount || freshData.deal_amount || freshData.total_amount || assignment.amount || null,
          // Map closing date with fallback - try closing_date, expected_close_date, or close_date
          closing_date: freshData.closing_date || freshData.expected_close_date || freshData.close_date || assignment.closing_date || null,
          // Map new fields from updated API
          partner_name: freshData.partner_name || assignment.partner_name || '',
          partner_number: freshData.partner_number || assignment.partner_number || '',
          register_number: freshData.register_number || assignment.register_number || '',
          mail_id: freshData.mail_id || assignment.mail_id || '',
          application_name: freshData.application_name || assignment.application_name || '',
          website: freshData.website || assignment.website || '',
          plan_1_month_acres: freshData.plan_1_month_acres || assignment.plan_1_month_acres || '',
          plan_6_months_acres: freshData.plan_6_months_acres || assignment.plan_6_months_acres || '',
          plan_12_months_acres: freshData.plan_12_months_acres || assignment.plan_12_months_acres || ''
        };
        
        // Construct stage history from API timeline
        if (freshData.length > 0) {
          const constructedHistory = {};
          freshData.forEach(item => {
            if (item.action === 'stage changed' && item.description) {
              const match = item.description.match(/moved from (.+?) to (.+?)$/i);
              if (match) {
                const targetStage = match[2].trim();
                constructedHistory[targetStage] = item.created_at;
              }
            } else if (item.action === 'assignment created') {
              const initialStage = item.stage || assignment.current_stage || 'New Assignment';
              constructedHistory[initialStage] = item.created_at;
            }
          });
          updatedAssignment.stage_history = constructedHistory;
  
        }
        
        setSelectedAssignment(updatedAssignment);
      } else {

        setAssignmentTimeline(assignment.timeline || []);
      }
    } else {

      setAssignmentTimeline(assignment.timeline || []);
    }
    
    setShowAssignmentModal(true);
  };

  // Handle stage change (drag and drop)
  const handleAssignmentMove = async ({ dealId, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex }) => {
    try {
      const columnToStageMap = {
        'new-assignment': 'New Assignment',
        'in-progress': 'In Progress',
        'review': 'Review',
        'completed': 'Completed'
      };

      const newStage = columnToStageMap[destinationColumnId];
      const oldStage = columnToStageMap[sourceColumnId];

      if (newStage === oldStage) {
        // Reordering within same column - not implemented for now
        return;
      }

      const assignmentToUpdate = greenTeamAssignments.find(
        a => a.id.toString() === dealId || a.deal_id?.toString() === dealId
      );

      if (!assignmentToUpdate) {
        toast.error('Assignment not found');
        return;
      }

      // Call PUT API to update current_stage
      if (!GREEN_TEAM_PUT_URL) {
        toast.error('API URL not configured');
        return;
      }

      const response = await axios.put(GREEN_TEAM_PUT_URL, {
        id: assignmentToUpdate.id?.toString() || assignmentToUpdate.deal_id?.toString(),
        deal_id: assignmentToUpdate.deal_id,
        current_stage: newStage,
        changed_by: user?.name || user?.phone_number || 'operation'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.jwt || user?.token || ''}`
        }
      });

      console.log('Stage update API response:', response.data);

      if (response.data && response.data.success) {
        // Refresh assignments to get updated data from API
        await fetchGreenTeamAssignments();
        toast.success(`Assignment moved from ${oldStage} to ${newStage}`);
      } else {
        toast.error('Failed to update assignment stage');
      }
    } catch (error) {
      console.error('Error updating assignment stage:', error);
      toast.error('Failed to update assignment stage');
    }
  };

  // Submit assignment to Green Team API
  const submitToGreenTeam = async (assignmentData) => {
    try {
      if (!GREEN_TEAM_GET_ASSIGNMENTS_URL) {
        throw new Error('API URL not configured');
      }

      const response = await axios.post(GREEN_TEAM_GET_ASSIGNMENTS_URL, assignmentData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.jwt || user?.token || ''}`
        }
      });
      
      if (response.data) {
        toast.success('Assignment submitted to Green Team successfully');
        return response.data;
      }
    } catch (error) {
      console.error('Error submitting to Green Team:', error);
      throw error;
    }
  };

  // Filter assignments based on search term
  const filteredAssignments = useMemo(() => {
    if (!searchTerm.trim()) return greenTeamAssignments;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return greenTeamAssignments.filter(assignment => 
      assignment.deal_name?.toLowerCase().includes(lowerSearchTerm) ||
      assignment.deal_id?.toLowerCase().includes(lowerSearchTerm) ||
      assignment.admin_name?.toLowerCase().includes(lowerSearchTerm) ||
      assignment.farmer_name?.toLowerCase().includes(lowerSearchTerm) ||
      assignment.type?.toLowerCase().includes(lowerSearchTerm)
    );
  }, [greenTeamAssignments, searchTerm]);

  // Group assignments by stage
  const assignmentsByStage = useMemo(() => {
    const grouped = {};
    GREEN_TEAM_KANBAN_COLUMNS.forEach(column => {
      const matchingAssignments = filteredAssignments.filter(
        assignment => assignment.stage === column.title
      );

      grouped[column.id] = matchingAssignments;
    });
    
    // Log the grouped results

    return grouped;
  }, [filteredAssignments]);

  // Get assignments for a specific column (for drag and drop)
  const getAssignmentsForColumn = useCallback((columnId) => {
    const assignments = assignmentsByStage[columnId] || [];
    // Map to ensure deal_id field exists for DnD context compatibility
    return assignments.map(assignment => ({
      ...assignment,
      deal_id: assignment.deal_id || assignment.id.toString() // Ensure deal_id exists
    }));
  }, [assignmentsByStage]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchGreenTeamAssignments();
    toast.success('Assignments refreshed successfully');
  };

  if (loading) {
    return <SatyuktLoader />;
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '400px',
        color: '#ef4444'
      }}>
        <AlertCircle size={48} style={{ marginBottom: '16px' }} />
        <h2 style={{ marginBottom: '8px' }}>Error Loading Assignments</h2>
        <p style={{ marginBottom: '16px' }}>{error}</p>
        <button 
          onClick={handleRefresh}
          style={{
            padding: '10px 20px',
            backgroundColor: '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#0f172a' 
          }}>
            Green Team Assignments
          </h1>
          <span style={{
            backgroundColor: '#dcfce7',
            color: '#166534',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            {greenTeamAssignments.length} Assignments
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search 
              size={18} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }} 
            />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={handleSearch}
              style={{
                padding: '10px 12px 10px 40px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                width: '300px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#16a34a'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          
          <button
            onClick={handleRefresh}
            style={{
              padding: '10px 16px',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#475569',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f1f5f9';
              e.target.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#e2e8f0';
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div style={{ 
        padding: '0 24px 16px 24px',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px'
      }}>
        <button
          onClick={() => setViewMode('kanban')}
          style={{
            padding: '8px 16px',
            background: viewMode === 'kanban' ? '#16a34a' : 'white',
            color: viewMode === 'kanban' ? 'white' : '#475569',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          <GripVertical size={16} />
          Kanban
        </button>
        <button
          onClick={() => setViewMode('list')}
          style={{
            padding: '8px 16px',
            background: viewMode === 'list' ? '#16a34a' : 'white',
            color: viewMode === 'list' ? 'white' : '#475569',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          <List size={16} />
          List
        </button>
      </div>

      {/* Kanban Board */}
      {viewMode === 'kanban' && (
      <div style={{ 
        flex: 1, 
        padding: '0 24px 24px 24px', 
        overflowX: 'auto',
        overflowY: 'hidden'
      }}>
        {greenTeamAssignments.length === 0 ? (
          <SatyuktEmptyState 
            onRefresh={handleRefresh}
          />
        ) : (
          <KanbanDndProvider
            getDealsForColumn={getAssignmentsForColumn}
            onDealMove={handleAssignmentMove}
          >
            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              height: '100%',
              minWidth: '1200px'
            }}>
              {GREEN_TEAM_KANBAN_COLUMNS.map(column => {
                const columnAssignments = assignmentsByStage[column.id] || [];
                return (
                  <div
                    key={column.id}
                    style={{
                      flex: 1,
                      minWidth: '280px',
                      maxWidth: '320px',
                      background: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      maxHeight: '100%',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{
                      padding: '16px',
                      borderBottom: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#0f172a'
                        }}>
                          {column.title}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          background: '#dcfce7',
                          color: '#166534',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontWeight: '600'
                        }}>
                          {columnAssignments.length}
                        </span>
                      </div>
                    </div>
                    <KanbanColumnDropZone
                      columnId={column.id}
                      style={{
                        padding: '12px',
                        overflowY: 'auto',
                        flex: 1,
                        minHeight: 0
                      }}
                    >
                      {columnAssignments.map((assignment) => (
                        <KanbanDraggableCard
                          key={assignment.deal_id || assignment.id}
                          dealId={assignment.deal_id || assignment.id.toString()}
                          columnId={column.id}
                          onClick={() => handleAssignmentClick(assignment)}
                        >
                          <div style={{
                            padding: '16px',
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#16a34a';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 163, 74, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                          }}
                          >
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'flex-start',
                              marginBottom: '12px'
                            }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ 
                                  fontSize: '14px', 
                                  fontWeight: '600', 
                                  color: '#0f172a',
                                  marginBottom: '4px',
                                  cursor: 'pointer'
                                }}>
                                  {assignment.deal_name}
                                </div>
                                <div style={{ 
                                  fontSize: '12px', 
                                  color: '#64748b',
                                  marginBottom: '8px'
                                }}>
                                  {assignment.deal_id}
                                </div>
                              </div>
                              <GripVertical 
                                size={16} 
                                style={{ 
                                  color: '#94a3b8', 
                                  cursor: 'grab' 
                                }} 
                              />
                            </div>
                            

                            
                            <div style={{ 
                              display: 'flex', 
                              gap: '8px', 
                              flexWrap: 'wrap',
                              marginBottom: '12px'
                            }}>
                              <span style={{
                                backgroundColor: '#dcfce7',
                                color: '#166534',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '500'
                              }}>
                                Submitted by: {assignment.submitted_by || 'Unknown'}
                              </span>
                              <span style={{
                                backgroundColor: '#e0f2fe',
                                color: '#0369a1',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '500'
                              }}>
                                Ongoing: {getOngoingValue(assignment)}
                              </span>
                            </div>
                            
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              fontSize: '12px',
                              color: '#64748b'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <User size={14} />
                                <span>{assignment.contact_name || assignment.admin_name}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={14} />
                                <span>{formatDateSafe(assignment.assigned_date, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                          </div>
                        </KanbanDraggableCard>
                      ))}
                    </KanbanColumnDropZone>
                  </div>
                );
              })}
            </div>
          </KanbanDndProvider>
        )}
      </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div style={{ 
          flex: 1, 
          padding: '0 24px 24px 24px',
          overflowY: 'auto'
        }}>
          {greenTeamAssignments.length === 0 ? (
            <SatyuktEmptyState 
              onRefresh={handleRefresh}
            />
          ) : (
            <div style={{
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden'
            }}>
              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
                padding: '16px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                fontWeight: '600',
                fontSize: '13px',
                color: '#64748b'
              }}>
                <div>Deal Name</div>
                <div>Deal ID</div>
                <div>Stage</div>
                <div>Type</div>
                <div>1 Month</div>
                <div>6 Months</div>
                <div>12 Months</div>
                <div>Assigned Date</div>
                <div>Submitted By</div>
                <div>Ongoing</div>
              </div>
              
              {/* Table Body */}
              {filteredAssignments.map(assignment => (
                <div
                  key={assignment.deal_id || assignment.id}
                  onClick={() => handleAssignmentClick(assignment)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
                    padding: '16px',
                    borderBottom: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    fontSize: '14px',
                    color: '#0f172a'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <div style={{ fontWeight: '500' }}>{assignment.deal_name}</div>
                  <div style={{ color: '#64748b' }}>{assignment.deal_id}</div>
                  <div>
                    <span style={{
                      background: '#dcfce7',
                      color: '#166534',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {assignment.stage}
                    </span>
                  </div>
                  <div style={{ textTransform: 'capitalize' }}>{assignment.type}</div>
                  <div style={{ color: '#64748b' }}>{assignment.plan_1_month_acres || '-'}</div>
                  <div style={{ color: '#64748b' }}>{assignment.plan_6_months_acres || '-'}</div>
                  <div style={{ color: '#64748b' }}>{assignment.plan_12_months_acres || '-'}</div>
                  <div style={{ color: '#64748b', fontSize: '13px' }}>
                    {formatDateSafe(assignment.assigned_date, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '13px' }}>
                    {assignment.submitted_by || 'Unknown'}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '13px' }}>
                    {getOngoingValue(assignment)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assignment Details Modal */}
      {showAssignmentModal && selectedAssignment && (
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
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowAssignmentModal(false);
            setSelectedAssignment(null);
            setAssignmentTimeline([]);
          }
        }}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '95%',
            maxWidth: '1200px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              backgroundColor: 'white',
              zIndex: 10
            }}>
              <div>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#0f172a' 
                }}>
                  {selectedAssignment.deal_name}
                </h2>
                <p style={{ 
                  margin: '4px 0 0 0', 
                  fontSize: '13px', 
                  color: '#64748b' 
                }}>
                  {selectedAssignment.deal_id}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {!isEditingAssignment && (
                  <button
                    onClick={() => {
                      setEditingAssignmentDetails(selectedAssignment);
                      setIsEditingAssignment(true);
                    }}
                    style={{
                      padding: '6px 12px',
                      background: '#dcfce7',
                      color: '#16a34a',
                      border: '1px solid #86efac',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setSelectedAssignment(null);
                    setAssignmentTimeline([]);
                    setIsEditingAssignment(false);
                    setEditingAssignmentDetails({});
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <X size={20} style={{ color: '#64748b' }} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', 
                gap: '24px'
              }}>
                {/* Left Column - Assignment Details */}
                <div>
                  {/* Deal Information */}
                  <div style={{
                    marginBottom: '20px',
                    padding: '16px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}>
                    <h3 style={{
                      margin: '0 0 12px 0',
                      color: '#0f172a',
                      fontSize: '14px',
                      fontWeight: '600',
                      borderBottom: '1px solid #e2e8f0',
                      paddingBottom: '8px'
                    }}>
                      Deal Information
                    </h3>
                    {/* For Admin, Partner, Whilelable, and Api types, show only specific deal fields */}
                    {(selectedAssignment.type === 'Admin' || selectedAssignment.type === 'Partner' || selectedAssignment.type === 'Whilelable' || selectedAssignment.type === 'Api') ? (
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(3, 1fr)', 
                        gap: '12px' 
                      }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Deal Name</div>
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.deal_name || 'Not available'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Deal ID</div>
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.deal_id || 'Not available'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Contact Name</div>
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.contact_name || 'Not available'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Amount</div>
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {formatAmountSafe(selectedAssignment.amount) || 'Not available'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Closing Date</div>
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.closing_date 
                              ? formatDateSafe(selectedAssignment.closing_date, { day: 'numeric', month: 'short', year: 'numeric' })
                              : 'Not available'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Submitted By</div>
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.submitted_by || 'Not available'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* For other types, show all deal fields with editing capability */
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(3, 1fr)', 
                        gap: '12px' 
                      }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Deal Name</div>
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.deal_name}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Deal ID</div>
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.deal_id}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Contact Name</div>
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.contact_name || 'Not available'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Amount</div>
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {formatAmountSafe(selectedAssignment.amount)}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Closing Date</div>
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.closing_date 
                              ? formatDateSafe(selectedAssignment.closing_date, { day: 'numeric', month: 'short', year: 'numeric' })
                              : 'Not available'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Account Number</div>
                          {isEditingAssignment ? (
                            <input
                              type="text"
                              value={editingAssignmentDetails.account_number || ''}
                              onChange={(e) => handleAssignmentFieldChange('account_number', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#0f172a',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                              {selectedAssignment.account_number || 'Not available'}
                            </div>
                          )}
                        </div>
                        <div style={{ gridColumn: 'span 3' }}>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Submitted By</div>
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.submitted_by}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Assignment Details */}
                  <div style={{
                    marginBottom: '20px',
                    padding: '16px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}>
                    <h3 style={{
                      margin: '0 0 12px 0',
                      color: '#0f172a',
                      fontSize: '14px',
                      fontWeight: '600',
                      borderBottom: '1px solid #e2e8f0',
                      paddingBottom: '8px'
                    }}>
                      Assignment Details
                    </h3>
                    {/* For Admin and Api types, show only specific fields */}
                    {(selectedAssignment.type === 'Admin' || selectedAssignment.type === 'Api') ? (
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(2, 1fr)', 
                        gap: '12px' 
                      }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Type</div>
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500', textTransform: 'capitalize' }}>
                            {selectedAssignment.type}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Assigned Date</div>
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {formatDateSafe(selectedAssignment.assigned_date, { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }, 'datetime')}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Admin Name</div>
                          {isEditingAssignment ? (
                            <input
                              type="text"
                              value={editingAssignmentDetails.admin_name || ''}
                              onChange={(e) => handleAssignmentFieldChange('admin_name', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#0f172a',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                              {selectedAssignment.admin_name || 'Not available'}
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Admin Number</div>
                          {isEditingAssignment ? (
                            <input
                              type="text"
                              value={editingAssignmentDetails.admin_number || ''}
                              onChange={(e) => handleAssignmentFieldChange('admin_number', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#0f172a',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                              {selectedAssignment.admin_number || 'Not available'}
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Farmer Name</div>
                          {isEditingAssignment ? (
                            <input
                              type="text"
                              value={editingAssignmentDetails.farmer_name || ''}
                              onChange={(e) => handleAssignmentFieldChange('farmer_name', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#0f172a',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                              {selectedAssignment.farmer_name || 'Not available'}
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Farmer Number</div>
                          {isEditingAssignment ? (
                            <input
                              type="text"
                              value={editingAssignmentDetails.farmer_number || ''}
                              onChange={(e) => handleAssignmentFieldChange('farmer_number', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#0f172a',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                              {selectedAssignment.farmer_number || 'Not available'}
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Plan 1 Month Acres</div>
                          {isEditingAssignment ? (
                            <input
                              type="number"
                              value={editingAssignmentDetails.plan_1_month_acres || ''}
                              onChange={(e) => handleAssignmentFieldChange('plan_1_month_acres', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#0f172a',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                              {selectedAssignment.plan_1_month_acres || 'Not available'}
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Plan 6 Months Acres</div>
                          {isEditingAssignment ? (
                            <input
                              type="number"
                              value={editingAssignmentDetails.plan_6_months_acres || ''}
                              onChange={(e) => handleAssignmentFieldChange('plan_6_months_acres', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#0f172a',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                              {selectedAssignment.plan_6_months_acres || 'Not available'}
                            </div>
                          )}
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Plan 12 Months Acres</div>
                          {isEditingAssignment ? (
                            <input
                              type="number"
                              value={editingAssignmentDetails.plan_12_months_acres || ''}
                              onChange={(e) => handleAssignmentFieldChange('plan_12_months_acres', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#0f172a',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                              {selectedAssignment.plan_12_months_acres || 'Not available'}
                            </div>
                          )}
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Description</div>
                          {isEditingAssignment ? (
                            <textarea
                              value={editingAssignmentDetails.description || ''}
                              onChange={(e) => handleAssignmentFieldChange('description', e.target.value)}
                              rows={3}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#0f172a',
                                outline: 'none',
                                resize: 'vertical'
                              }}
                              placeholder="Enter description (optional)"
                            />
                          ) : (
                            <div style={{ 
                              fontSize: '14px', 
                              color: '#0f172a', 
                              fontWeight: '500',
                              whiteSpace: 'pre-wrap',
                              backgroundColor: 'white',
                              padding: '8px',
                              borderRadius: '4px',
                              border: '1px solid #e2e8f0'
                            }}>
                              {selectedAssignment.description || 'No description provided'}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : selectedAssignment.type === 'Partner' ? (
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(2, 1fr)', 
                        gap: '12px' 
                      }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Type</div>
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500', textTransform: 'capitalize' }}>
                            {selectedAssignment.type}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Assigned Date</div>
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {formatDateSafe(selectedAssignment.assigned_date, { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }, 'datetime')}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Partner Name</div>
                          {isEditingAssignment ? (
                            <input
                              type="text"
                              value={editingAssignmentDetails.partner_name || ''}
                              onChange={(e) => handleAssignmentFieldChange('partner_name', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#0f172a',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                              {selectedAssignment.partner_name || 'Not available'}
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Partner Number</div>
                          {isEditingAssignment ? (
                            <input
                              type="text"
                              value={editingAssignmentDetails.partner_number || ''}
                              onChange={(e) => handleAssignmentFieldChange('partner_number', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#0f172a',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                              {selectedAssignment.partner_number || 'Not available'}
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Plan 1 Month Acres</div>
                          {isEditingAssignment ? (
                            <input
                              type="number"
                              value={editingAssignmentDetails.plan_1_month_acres || ''}
                              onChange={(e) => handleAssignmentFieldChange('plan_1_month_acres', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#0f172a',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                              {selectedAssignment.plan_1_month_acres || 'Not available'}
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Plan 6 Months Acres</div>
                          {isEditingAssignment ? (
                            <input
                              type="number"
                              value={editingAssignmentDetails.plan_6_months_acres || ''}
                              onChange={(e) => handleAssignmentFieldChange('plan_6_months_acres', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#0f172a',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                              {selectedAssignment.plan_6_months_acres || 'Not available'}
                            </div>
                          )}
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Plan 12 Months Acres</div>
                          {isEditingAssignment ? (
                            <input
                              type="number"
                              value={editingAssignmentDetails.plan_12_months_acres || ''}
                              onChange={(e) => handleAssignmentFieldChange('plan_12_months_acres', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#0f172a',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                              {selectedAssignment.plan_12_months_acres || 'Not available'}
                            </div>
                          )}
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Description</div>
                          {isEditingAssignment ? (
                            <textarea
                              value={editingAssignmentDetails.description || ''}
                              onChange={(e) => handleAssignmentFieldChange('description', e.target.value)}
                              rows={3}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#0f172a',
                                outline: 'none',
                                resize: 'vertical'
                              }}
                              placeholder="Enter description (optional)"
                            />
                          ) : (
                            <div style={{ 
                              fontSize: '14px', 
                              color: '#0f172a', 
                              fontWeight: '500',
                              whiteSpace: 'pre-wrap',
                              backgroundColor: 'white',
                              padding: '8px',
                              borderRadius: '4px',
                              border: '1px solid #e2e8f0'
                            }}>
                              {selectedAssignment.description || 'No description provided'}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : selectedAssignment.type === 'Whilelable' ? (
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(2, 1fr)', 
                        gap: '12px' 
                      }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Type</div>
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500', textTransform: 'capitalize' }}>
                            {selectedAssignment.type}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Assigned Date</div>
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {formatDateSafe(selectedAssignment.assigned_date, { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }, 'datetime')}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Register Number</div>
                          {isEditingAssignment ? (
                            <input
                              type="text"
                              value={editingAssignmentDetails.register_number || ''}
                              onChange={(e) => handleAssignmentFieldChange('register_number', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#0f172a',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                              {selectedAssignment.register_number || 'Not available'}
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Email ID</div>
                          {isEditingAssignment ? (
                            <input
                              type="text"
                              value={editingAssignmentDetails.mail_id || ''}
                              onChange={(e) => handleAssignmentFieldChange('mail_id', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#0f172a',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                              {selectedAssignment.mail_id || 'Not available'}
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Application Name</div>
                          {isEditingAssignment ? (
                            <input
                              type="text"
                              value={editingAssignmentDetails.application_name || ''}
                              onChange={(e) => handleAssignmentFieldChange('application_name', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#0f172a',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                              {selectedAssignment.application_name || 'Not available'}
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Website</div>
                          {isEditingAssignment ? (
                            <input
                              type="text"
                              value={editingAssignmentDetails.website || ''}
                              onChange={(e) => handleAssignmentFieldChange('website', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#0f172a',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                              {selectedAssignment.website || 'Not available'}
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Plan 1 Month Acres</div>
                          {isEditingAssignment ? (
                            <input
                              type="number"
                              value={editingAssignmentDetails.plan_1_month_acres || ''}
                              onChange={(e) => handleAssignmentFieldChange('plan_1_month_acres', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#0f172a',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                              {selectedAssignment.plan_1_month_acres || 'Not available'}
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Plan 6 Months Acres</div>
                          {isEditingAssignment ? (
                            <input
                              type="number"
                              value={editingAssignmentDetails.plan_6_months_acres || ''}
                              onChange={(e) => handleAssignmentFieldChange('plan_6_months_acres', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#0f172a',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                              {selectedAssignment.plan_6_months_acres || 'Not available'}
                            </div>
                          )}
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Plan 12 Months Acres</div>
                          {isEditingAssignment ? (
                            <input
                              type="number"
                              value={editingAssignmentDetails.plan_12_months_acres || ''}
                              onChange={(e) => handleAssignmentFieldChange('plan_12_months_acres', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#0f172a',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                              {selectedAssignment.plan_12_months_acres || 'Not available'}
                            </div>
                          )}
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Description</div>
                          {isEditingAssignment ? (
                            <textarea
                              value={editingAssignmentDetails.description || ''}
                              onChange={(e) => handleAssignmentFieldChange('description', e.target.value)}
                              rows={3}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: '#0f172a',
                                outline: 'none',
                                resize: 'vertical'
                              }}
                              placeholder="Enter description (optional)"
                            />
                          ) : (
                            <div style={{ 
                              fontSize: '14px', 
                              color: '#0f172a', 
                              fontWeight: '500',
                              whiteSpace: 'pre-wrap',
                              backgroundColor: 'white',
                              padding: '8px',
                              borderRadius: '4px',
                              border: '1px solid #e2e8f0'
                            }}>
                              {selectedAssignment.description || 'No description provided'}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* For other types, show all fields with editing capability */
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(2, 1fr)', 
                        gap: '12px' 
                      }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Type</div>
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500', textTransform: 'capitalize' }}>
                            {selectedAssignment.type}
                          </div>
                        </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Assigned Date</div>
                        <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                          {formatDateSafe(selectedAssignment.assigned_date, { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }, 'datetime')}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Plan</div>
                        {isEditingAssignment ? (
                          <select
                            value={editingAssignmentDetails.plan || ''}
                            onChange={(e) => handleAssignmentFieldChange('plan', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: '#0f172a',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="">Select plan</option>
                            <option value="1 month">1 month</option>
                            <option value="6 months">6 months</option>
                            <option value="12 months">12 months</option>
                          </select>
                        ) : (
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.plan}
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Total Acres</div>
                        {isEditingAssignment ? (
                          <input
                            type="text"
                            value={editingAssignmentDetails.total_acres || ''}
                            onChange={(e) => handleAssignmentFieldChange('total_acres', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: '#0f172a',
                              outline: 'none'
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.total_acres}
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Admin Number</div>
                        {isEditingAssignment ? (
                          <input
                            type="text"
                            value={editingAssignmentDetails.admin_number || ''}
                            onChange={(e) => handleAssignmentFieldChange('admin_number', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: '#0f172a',
                              outline: 'none'
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.admin_number}
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Farmer Number</div>
                        {isEditingAssignment ? (
                          <input
                            type="text"
                            value={editingAssignmentDetails.farmer_number || ''}
                            onChange={(e) => handleAssignmentFieldChange('farmer_number', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: '#0f172a',
                              outline: 'none'
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.farmer_number}
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Admin Name</div>
                        {isEditingAssignment ? (
                          <input
                            type="text"
                            value={editingAssignmentDetails.admin_name || ''}
                            onChange={(e) => handleAssignmentFieldChange('admin_name', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: '#0f172a',
                              outline: 'none'
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.admin_name}
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Farmer Name</div>
                        {isEditingAssignment ? (
                          <input
                            type="text"
                            value={editingAssignmentDetails.farmer_name || ''}
                            onChange={(e) => handleAssignmentFieldChange('farmer_name', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: '#0f172a',
                              outline: 'none'
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.farmer_name}
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Plan 1 Month Acres</div>
                        {isEditingAssignment ? (
                          <input
                            type="number"
                            value={editingAssignmentDetails.plan_1_month_acres || ''}
                            onChange={(e) => handleAssignmentFieldChange('plan_1_month_acres', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: '#0f172a',
                              outline: 'none'
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.plan_1_month_acres || 'Not available'}
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Plan 6 Months Acres</div>
                        {isEditingAssignment ? (
                          <input
                            type="number"
                            value={editingAssignmentDetails.plan_6_months_acres || ''}
                            onChange={(e) => handleAssignmentFieldChange('plan_6_months_acres', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: '#0f172a',
                              outline: 'none'
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.plan_6_months_acres || 'Not available'}
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Plan 12 Months Acres</div>
                        {isEditingAssignment ? (
                          <input
                            type="number"
                            value={editingAssignmentDetails.plan_12_months_acres || ''}
                            onChange={(e) => handleAssignmentFieldChange('plan_12_months_acres', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: '#0f172a',
                              outline: 'none'
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.plan_12_months_acres || 'Not available'}
                          </div>
                        )}
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Description</div>
                        {isEditingAssignment ? (
                          <textarea
                            value={editingAssignmentDetails.description || ''}
                            onChange={(e) => handleAssignmentFieldChange('description', e.target.value)}
                            rows={3}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: '#0f172a',
                              outline: 'none',
                              resize: 'vertical'
                            }}
                            placeholder="Enter description (optional)"
                          />
                        ) : (
                          <div style={{ 
                            fontSize: '14px', 
                            color: '#0f172a', 
                            fontWeight: '500',
                            whiteSpace: 'pre-wrap',
                            backgroundColor: 'white',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0'
                          }}>
                            {selectedAssignment.description || 'No description provided'}
                          </div>
                        )}
                      </div>
                    </div>
                    )}

                    {/* Activity Information - Show who submitted and who is working on it */}
                    <div style={{
                      marginBottom: '20px',
                      padding: '16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}>
                      <h3 style={{
                        margin: '0 0 12px 0',
                        color: '#0f172a',
                        fontSize: '14px',
                        fontWeight: '600',
                        borderBottom: '1px solid #e2e8f0',
                        paddingBottom: '8px'
                      }}>
                        Activity Information
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Submitted By</div>
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.submitted_by || 'Not available'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Ongoing</div>
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {getOngoingValue(selectedAssignment, 'Not available')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information - Only show for non-Admin, non-Partner, non-Whilelable, and non-Api types */}
                  {selectedAssignment.type !== 'Admin' && selectedAssignment.type !== 'Partner' && selectedAssignment.type !== 'Whilelable' && selectedAssignment.type !== 'Api' && (
                  <div style={{
                    marginBottom: '20px',
                    padding: '16px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}>
                    <h3 style={{
                      margin: '0 0 12px 0',
                      color: '#0f172a',
                      fontSize: '14px',
                      fontWeight: '600',
                      borderBottom: '1px solid #e2e8f0',
                      paddingBottom: '8px'
                    }}>
                      Additional Information
                    </h3>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(2, 1fr)', 
                      gap: '12px' 
                    }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Partner Name</div>
                        {isEditingAssignment ? (
                          <input
                            type="text"
                            value={editingAssignmentDetails.partner_name || ''}
                            onChange={(e) => handleAssignmentFieldChange('partner_name', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: '#0f172a',
                              outline: 'none'
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.partner_name || 'Not available'}
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Partner Number</div>
                        {isEditingAssignment ? (
                          <input
                            type="text"
                            value={editingAssignmentDetails.partner_number || ''}
                            onChange={(e) => handleAssignmentFieldChange('partner_number', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: '#0f172a',
                              outline: 'none'
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.partner_number || 'Not available'}
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Register Number</div>
              {isEditingAssignment ? (
                          <input
                            type="text"
                            value={editingAssignmentDetails.register_number || ''}
                            onChange={(e) => handleAssignmentFieldChange('register_number', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: '#0f172a',
                              outline: 'none'
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.register_number || 'Not available'}
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Email ID</div>
                        {isEditingAssignment ? (
                          <input
                            type="text"
                            value={editingAssignmentDetails.mail_id || ''}
                            onChange={(e) => handleAssignmentFieldChange('mail_id', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: '#0f172a',
                              outline: 'none'
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.mail_id || 'Not available'}
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Application Name</div>
                        {isEditingAssignment ? (
                          <input
                            type="text"
                            value={editingAssignmentDetails.application_name || ''}
                            onChange={(e) => handleAssignmentFieldChange('application_name', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: '#0f172a',
                              outline: 'none'
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.application_name || 'Not available'}
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Website</div>
                        {isEditingAssignment ? (
                          <input
                            type="text"
                            value={editingAssignmentDetails.website || ''}
                            onChange={(e) => handleAssignmentFieldChange('website', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: '#0f172a',
                              outline: 'none'
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.website || 'Not available'}
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Plan 1 Month Acres</div>
                        {isEditingAssignment ? (
                          <input
                            type="text"
                            value={editingAssignmentDetails.plan_1_month_acres || ''}
                            onChange={(e) => handleAssignmentFieldChange('plan_1_month_acres', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: '#0f172a',
                              outline: 'none'
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.plan_1_month_acres || 'Not available'}
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Plan 6 Months Acres</div>
                        {isEditingAssignment ? (
                          <input
                            type="text"
                            value={editingAssignmentDetails.plan_6_months_acres || ''}
                            onChange={(e) => handleAssignmentFieldChange('plan_6_months_acres', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: '#0f172a',
                              outline: 'none'
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.plan_6_months_acres || 'Not available'}
                          </div>
                        )}
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Plan 12 Months Acres</div>
                        {isEditingAssignment ? (
                          <input
                            type="text"
                            value={editingAssignmentDetails.plan_12_months_acres || ''}
                            onChange={(e) => handleAssignmentFieldChange('plan_12_months_acres', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: '#0f172a',
                              outline: 'none'
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedAssignment.plan_12_months_acres || 'Not available'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Current Stage */}
                  <div style={{
                    padding: '16px',
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '8px'
                  }}>
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px', display: 'block' }}>Current Stage</span>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#166534',
                        background: '#dcfce7',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        display: 'inline-block'
                      }}>
                        {selectedAssignment.stage}
                      </span>
                    </div>
                    
                    {/* Comprehensive Stage History - Always Show */}
                    <div style={{ 
                      borderTop: '1px solid #86efac', 
                      paddingTop: '12px',
                      marginTop: '8px'
                    }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                        Stage Progression
                      </div>
                      {(() => {

                        
                        // Use API stage_history or construct from timeline
                        const stageHistoryData = selectedAssignment.stage_history || {};
                        const stageEntries = Object.entries(stageHistoryData)
                          .sort((a, b) => new Date(b[1]) - new Date(a[1])); // Sort by date descending
                        

                        
                        // If no stage history, show current stage with created_at
                        if (stageEntries.length === 0) {

                          return (
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              fontSize: '12px',
                              padding: '8px',
                              background: '#dcfce7',
                              borderRadius: '6px',
                              border: '1px solid #166534'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ 
                                  background: '#166534',
                                  color: 'white',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: '600'
                                }}>
                                  Current
                                </span>
                                <span style={{ color: '#166534', fontWeight: '600' }}>
                                  {selectedAssignment.stage}
                                </span>
                              </div>
                              <span style={{ color: '#166534', fontWeight: '500' }}>
                                {formatDateSafe(selectedAssignment.created_at || selectedAssignment.assigned_date, { 
                                  day: 'numeric', 
                                  month: 'short', 
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          );
                        }
                        

                        
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {stageEntries.map(([stage, timestamp], index) => {
                              const isCurrentStage = stage === selectedAssignment.stage;
                              const colors = isCurrentStage 
                                ? { bg: '#dcfce7', border: '#166534', text: '#166534' }
                                : index === 1 
                                  ? { bg: '#e0f2fe', border: '#0369a1', text: '#0369a1' }
                                  : index === 2
                                    ? { bg: '#fef3c7', border: '#d97706', text: '#d97706' }
                                    : { bg: '#f1f5f9', border: '#64748b', text: '#64748b' };
                              
                              const label = isCurrentStage ? 'Current' : index === 1 ? 'Previous' : index === 2 ? 'Previous-2' : `Stage ${index}`;
                              
                              return (
                                <div key={stage} style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  fontSize: '12px',
                                  padding: '8px',
                                  background: colors.bg,
                                  borderRadius: '6px',
                                  border: `1px solid ${colors.border}`
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ 
                                      background: colors.border,
                                      color: 'white',
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                      fontWeight: '600'
                                    }}>
                                      {label}
                                    </span>
                                    <span style={{ color: colors.text, fontWeight: '600' }}>
                                      {stage}
                                    </span>
                                  </div>
                                  <span style={{ color: colors.text, fontWeight: '500' }}>
                                    {formatDateSafe(timestamp, { 
                                      day: 'numeric', 
                                      month: 'short', 
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Right Column - Timeline */}
                <div>
                  {/* Timeline Section */}
                  <div style={{
                    padding: '16px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    height: 'fit-content',
                    maxHeight: 'calc(90vh - 200px)',
                    overflowY: 'auto'
                  }}>
                    <h3 style={{
                      margin: '0 0 16px 0',
                      color: '#0f172a',
                      fontSize: '14px',
                      fontWeight: '600',
                      borderBottom: '1px solid #e2e8f0',
                      paddingBottom: '8px',
                      position: 'sticky',
                      top: 0,
                      background: '#f8fafc',
                      paddingTop: '8px',
                      zIndex: 1
                    }}>
                      Timeline
                    </h3>
                    {assignmentTimeline.length > 0 ? (
                      <div style={{ paddingLeft: '32px', borderLeft: '2px solid #e2e8f0', marginLeft: '20px' }}>
                        {assignmentTimeline
                          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort newest first
                          .map((item, index) => {

                          
                          // Map API field names to our expected field names
                          const field = item.action || item.field || 'activity';
                          const IconComponent = getTimelineIcon(field);
                          
                          // Parse stage change from description
                          let oldStage = null;
                          let newStage = null;
                          if (item.action === 'stage changed' && item.description) {
                            const match = item.description.match(/moved from (.+?) to (.+?)$/i);
                            if (match) {
                              oldStage = match[1].trim();
                              newStage = match[2].trim();
                            }
                          }
                          
                          return (
                            <div key={item.id || index} style={{ paddingBottom: index < assignmentTimeline.length - 1 ? '20px' : '0' }}>
                              <div style={{ marginLeft: '-36px', marginBottom: '12px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dcfce7', border: '2px solid #16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <IconComponent size={16} style={{ color: '#16a34a' }} />
                                </div>
                              </div>
                              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                                {item.created_at ? (
                                  formatDateSafe(item.created_at, { 
                                    day: 'numeric', 
                                    month: 'short', 
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                ) : (
                                  formatDateSafe(new Date().toISOString(), { 
                                    day: 'numeric', 
                                    month: 'short', 
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                )}
                              </div>
                              <div style={{ fontSize: '14px', color: '#0f172a', marginBottom: '4px' }}>
                                <span>
                                  {item.action ? String(item.action).replace(/_/g, ' ') : (field === 'note' ? 'Note added' : field === 'task' ? 'Task added' : `${field} updated`)} by <span style={{ fontWeight: 'bold' }}>{item.changed_by || 'Operation'}</span>
                                </span>
                              </div>
                              <div style={{ fontSize: '14px', color: '#0f172a', fontStyle: 'Georgia' }}>
                                {item.action === 'assignment created' ? (
                                  <span>' {item.description || 'Assignment created'} '</span>
                                ) : item.action === 'stage changed' ? (
                                  <div>
                                    <span>Moved from </span>
                                    <span style={{ 
                                      background: '#e0f2fe',
                                      color: '#0369a1',
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      fontSize: '12px',
                                      fontWeight: '500',
                                      margin: '0 4px'
                                    }}>
                                      {oldStage || 'Previous stage'}
                                    </span>
                                    <span> to </span>
                                    <span style={{ 
                                      background: '#dcfce7',
                                      color: '#166534',
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      fontSize: '12px',
                                      fontWeight: '500',
                                      margin: '0 4px'
                                    }}>
                                      {newStage || 'New stage'}
                                    </span>
                                  </div>
                                ) : (
                                  <span>' {item.description || 'Updated'} '</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px' }}>
                        No timeline activity yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div style={{ 
                padding: '16px 24px', 
                borderTop: '1px solid #e2e8f0', 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '12px',
                position: 'sticky',
                bottom: 0,
                backgroundColor: 'white',
                zIndex: 10
              }}>
                {isEditingAssignment ? (
                  <>
                    <button
                      onClick={cancelAssignmentEditing}
                      disabled={savingAssignmentDetails}
                      style={{
                        backgroundColor: 'white',
                        color: '#0f172a',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: savingAssignmentDetails ? 'not-allowed' : 'pointer',
                        opacity: savingAssignmentDetails ? 0.5 : 1
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveAssignmentDetails}
                      disabled={savingAssignmentDetails}
                      style={{
                        backgroundColor: savingAssignmentDetails ? '#9ca3af' : '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: savingAssignmentDetails ? 'not-allowed' : 'pointer',
                        opacity: savingAssignmentDetails ? 0.7 : 1
                      }}
                    >
                      {savingAssignmentDetails ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowAssignmentModal(false);
                      setSelectedAssignment(null);
                      setAssignmentTimeline([]);
                      setIsEditingAssignment(false);
                      setEditingAssignmentDetails({});
                    }}
                    style={{
                      backgroundColor: 'white',
                      color: '#0f172a',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
