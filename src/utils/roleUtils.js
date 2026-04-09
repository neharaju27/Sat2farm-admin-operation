/**
 * Normalizes user role to standard values used in the UI
 * @param {Object} user - User object containing role information
 * @returns {string} Normalized role ('ops', 'sales', 'client', or the original role)
 */
export const normalizeUserRole = (user) => {
  const userRole = user?.role || user?.user_role || user?.type || 'ops';
  const normalizedRole = userRole.toLowerCase();
  
  // Map various role names to standard values
  if (normalizedRole === 'operation' || normalizedRole === 'operations' || 
      normalizedRole === 'admin' || normalizedRole === 'administrator' || 
      normalizedRole === 'ops') {
    return 'ops';
  } else if (normalizedRole === 'sale' || normalizedRole === 'sales') {
    return 'sales';
  } else if (normalizedRole === 'client' || normalizedRole === 'customer') {
    return 'client';
  }
  
  return normalizedRole;
};
