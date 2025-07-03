import axios from "axios";

const BASE_URL = "https://backendapi.ctce.ro/apicosmin";

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
export const loginWith2FA = async (
    username: string,
    password: string,
    navigate: Function
): Promise<void> => {
    const uuid = await login(username, password);
    if (!uuid) return;

    const twofa = localStorage.getItem("twofa_enabled");

    if (twofa === "true") {
        const userInfo = await getUserInfo(uuid);
        const email = userInfo?.email;
        if (!email) return;

        const codeRes = await axios.post(`${BASE_URL}/twofacodeemail?email=${email}`);
        if (codeRes.status === 200) {
            navigate("/verify-2fa", { state: { uuid } });
        } else {
            console.error("2FA code request failed");
        }
    } else {
        localStorage.setItem("uuid", uuid);
        navigate("/main");
    }
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
        const response = await axios.post(`${BASE_URL}/userinfo?uuid=${uuid}`)

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error("Failed to fetch user info", error);
    }

    return null;
};
export const sendPasswordResetEmail = async (email: string): Promise<string | null> => {
    try {
        const response = await axios.post(
            `${BASE_URL}/passwordResetEmail`,
            email,
            {
                headers: { "Content-Type": "application/json" },
                transformRequest: [(data) => data],
            }
        );


        if (response.status === 200) {
            return response.data.trim();
        }
    } catch (error) {
        console.error("Failed to send reset email", error);
    }

    return null;
};
