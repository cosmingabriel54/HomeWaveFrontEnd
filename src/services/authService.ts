import axios from "axios";

const BASE_URL = "https://homewavebackend.onrender.com";

export const login = async (username: string, password: string): Promise<string | null> => {
    try {
        const response = await axios.post(`${BASE_URL}/login`, {
            username,
            password,
        });

        if (response.status === 200) {
            return response.data.trim();
        }
    } catch (error) {
        console.error("Login failed", error);
    }

    return null;
};
export const registerUser = async (data: {
    email: string;
    password: string;
    phoneNumber: string;
    username: string;
}): Promise<boolean> => {
    try {
        const response = await axios.post(`${BASE_URL}/register`, data);
        return response.status === 200;
    } catch (error) {
        console.error("Registration failed", error);
        return false;
    }
};
export const getUserInfo = async (uuid: string): Promise<Record<string, never> | null> => {
    try {
        const response = await axios.post(`${BASE_URL}/userinfo`, {
            uuid,
        });

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error("Failed to fetch user info", error);
    }

    return null;
};
