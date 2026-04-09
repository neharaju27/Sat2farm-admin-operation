// Farm API service using environment variables

// 1. After successful login - store user data
export function storeUserData(loginResponse) {
    localStorage.setItem('userMobileNumber', loginResponse.phone_number);
    localStorage.setItem('userName', loginResponse.name);
    localStorage.setItem('userRole', loginResponse.role);
    localStorage.setItem('authToken', loginResponse.token);
    localStorage.setItem('adminId', loginResponse.admin_id);
}

// 2. Get stored user data
export function getUserData() {
    return {
        mobileNumber: localStorage.getItem('userMobileNumber'),
        name: localStorage.getItem('userName'),
        role: localStorage.getItem('userRole'),
        token: localStorage.getItem('authToken'),
        adminId: localStorage.getItem('adminId')
    };
}

// 3. Clear user data (logout)
export function clearUserData() {
    localStorage.removeItem('userMobileNumber');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminId');
}

// 4. Fetch farm data using stored mobile number and environment variable
export async function fetchFarmData(farmId) {
    const { mobileNumber, token } = getUserData();
    
    if (!mobileNumber) {
        throw new Error('Mobile number not found. Please login again.');
    }

    if (!farmId) {
        throw new Error('Farm ID is required');
    }

    try {
        const apiUrl = import.meta.env.VITE_FETCH_FARM_API_URL;
        const url = `${apiUrl}?mobile_no=${mobileNumber}&farm_id=${farmId}`;
        
        console.log('Fetching farm data from:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Farm data response:', data);
        return data;
        
    } catch (error) {
        console.error('Error fetching farm data:', error);
        throw error;
    }
}

// 5. Check if user is authenticated
export function isAuthenticated() {
    const { token, mobileNumber } = getUserData();
    return !!(token && mobileNumber);
}

// 6. Redirect to login if not authenticated
export function requireAuth() {
    if (!isAuthenticated()) {
        // Redirect to login page or throw error
        window.location.href = '/login';
        return false;
    }
    return true;
}
