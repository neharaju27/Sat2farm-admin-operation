import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'opportunity_task_status_cache';

const loadCache = () => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
};

const saveCache = (cacheObj) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cacheObj));
  } catch (e) { }
};

const inFlightRequests = new Set();
const memoryCache = loadCache();

// Export helper to allow updating cache when task is created/updated
export const updateAccountTaskCache = (accountId, status, taskName) => {
  if (!accountId) return;
  memoryCache[accountId] = { status, taskName: taskName || '' };
  saveCache(memoryCache);
};

export default function AccountTaskStatusIcon({ accountId, initialTaskStatus, initialTaskName, user, refreshKey }) {
  const [statusInfo, setStatusInfo] = useState(() => {
    if (initialTaskStatus) {
      return { status: initialTaskStatus, taskName: initialTaskName || '' };
    }
    if (accountId && memoryCache[accountId] !== undefined) {
      return memoryCache[accountId];
    }
    return null;
  });

  useEffect(() => {
    if (initialTaskStatus) {
      const info = { status: initialTaskStatus, taskName: initialTaskName || '' };
      setStatusInfo(info);
      if (accountId) updateAccountTaskCache(accountId, initialTaskStatus, initialTaskName);
      return;
    }

    if (!accountId) return;

    if (memoryCache[accountId] !== undefined) {
      setStatusInfo(memoryCache[accountId]);
      return;
    }

    if (inFlightRequests.has(accountId)) return;
    inFlightRequests.add(accountId);

    let active = true;
    const fetchAccountActivity = async () => {
      try {
        const activityApiUrl = import.meta.env.VITE_LEAD_ACTIVITY_API_URL;
        if (!activityApiUrl) return;
        const currentUserName = user?.user_name || user?.name || user?.email || 'Operations';
        const headers = { 'Content-Type': 'application/json' };

        const url = `${activityApiUrl}?lead_id=${encodeURIComponent(accountId)}&user=${encodeURIComponent(currentUserName)}`;
        const res = await fetch(url, { headers });
        let resultInfo = { status: null, taskName: null };
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.activities || data.data || []);
          const t = list.find(a => (a.activity_type === 'task' || a.task_name) && a.status);
          if (t) {
            resultInfo = { status: t.status, taskName: t.task_name };
          }
        }
        memoryCache[accountId] = resultInfo;
        saveCache(memoryCache);
        if (active) {
          setStatusInfo(resultInfo);
        }
      } catch (err) {
        memoryCache[accountId] = { status: null, taskName: null };
        saveCache(memoryCache);
        if (active) {
          setStatusInfo({ status: null, taskName: null });
        }
      } finally {
        inFlightRequests.delete(accountId);
      }
    };

    fetchAccountActivity();

    return () => { active = false; };
  }, [accountId, initialTaskStatus, initialTaskName, user, refreshKey]);

  if (!statusInfo || !statusInfo.status) return null;

  const s = String(statusInfo.status).trim().toLowerCase();
  if (!s || s === 'choose a task status' || s === 'choose a task stage' || s === 'null' || s === 'undefined') return null;

  const taskNameStr = statusInfo.taskName || '';

  if (s.includes('complete') || s === 'done' || s === 'finished') {
    return (
      <span
        title={taskNameStr ? `Task (${taskNameStr}): Completed` : 'Task: Completed'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#dcfce7',
          color: '#16a34a',
          border: '1px solid #bbf7d0',
          borderRadius: '50%',
          padding: '3px',
          flexShrink: 0,
          cursor: 'help'
        }}
      >
        <CheckCircle size={13} style={{ color: '#16a34a' }} />
      </span>
    );
  }

  if (s.includes('overdue') || s.includes('delay') || s.includes('expired')) {
    return (
      <span
        title={taskNameStr ? `Task (${taskNameStr}): Overdue` : 'Task: Overdue'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fca5a5',
          borderRadius: '50%',
          padding: '3px',
          flexShrink: 0,
          cursor: 'help'
        }}
      >
        <AlertCircle size={13} style={{ color: '#dc2626' }} />
      </span>
    );
  }

  return (
    <span
      title={taskNameStr ? `Task (${taskNameStr}): ${statusInfo.status}` : `Task: ${statusInfo.status}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fef3c7',
        color: '#d97706',
        border: '1px solid #fde68a',
        borderRadius: '50%',
        padding: '3px',
        flexShrink: 0,
        cursor: 'help'
      }}
    >
      <Clock size={13} style={{ color: '#d97706' }} />
    </span>
  );
}
