import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Use your actual server IP or URL. 
// If running on a local machine, find your machine's IP (e.g., using 'ipconfig' or 'ifconfig') 
// and replace 'localhost' with it for the app to connect.
const BASE_URL = 'http://192.168.1.10:3000/api'; 

export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Store the JWT for future authenticated requests
            await AsyncStorage.setItem('mualo_token', data.token);
            return { success: true, user: data.user };
        } else {
            return { success: false, message: data.message || 'Login failed due to an unknown error.' };
        }
    } catch (error) {
        console.error('API Error during login:', error);
        return { success: false, message: 'Could not connect to the server. Check network settings.' };
    }
};