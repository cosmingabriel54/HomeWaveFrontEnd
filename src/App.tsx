import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Main from "./components/Main.tsx";
import Welcome from "./components/Welcome.tsx";
import Register from "./components/Register.tsx";
import ProtectedRoute from "./components/ProtectedRoute";
import VerifyCode from "./props/VerifyCode.tsx";
import ForgotPassword from "./props/ForgotPassword.tsx";
import ResetPassword from "./props/ResetPassword.tsx";
import Verify2FAScreen from "./props/Verify2FAScreen.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-code" element={<VerifyCode />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-2fa" element={<Verify2FAScreen />} />
                <Route
                    path="/main"
                    element={
                        <ProtectedRoute>
                            <Main />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
