// This file handles admin configuration with a focus on security

// The admin user ID from environment variables
export const ADMIN_USER_ID = process.env.ADMIN_USER_ID || '';

// Function to check if a user ID is the admin
export const isAdminUser = (uid: string): boolean => {
  // If admin ID not configured, deny all access
  if (!ADMIN_USER_ID) {
    console.warn('ADMIN_USER_ID is not set in environment variables');
    return false;
  }
  
  // Only exact match is allowed
  return uid === ADMIN_USER_ID;
};

// Validate that the admin config is set
export const validateAdminConfig = (): boolean => {
  if (!ADMIN_USER_ID) {
    console.warn('ADMIN_USER_ID environment variable is not set. Admin functionality will be disabled.');
    return false;
  }
  return true;
};