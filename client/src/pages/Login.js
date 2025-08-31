import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axios";
import Footer from "../components/Footer";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const nav = useNavigate();
const handleLogin = async () => {
    if (!email || !password) {
        return alert("Please fill in both fields");
    }
    try {
        const res = await api.post("/auth/login", { email, password });
        console.log("Login response:", res.data); // Debug the response
        localStorage.setItem("dealspark_token", res.data.token);
        localStorage.setItem("dealspark_role", res.data.user.role);
        localStorage.setItem("dealspark_userId", res.data.user.id);
        localStorage.setItem("dealspark_user", JSON.stringify(res.data.user));
        window.dispatchEvent(new Event("storage"));
        alert("Login successful!");
        nav(res.data.user.role === "owner" ? "/owner" : "/");
    } catch (err) {
        console.error(err);
        alert(err?.response?.data?.message || "Login failed");
    }
};
    return (
        <>
            <Navbar />
            <div className="container mt-5 mb-5">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-4">
                        <div className="card border-0 shadow-lg">
                            <div className="card-body p-4">
                                <h2 className="text-center fw-bold mb-4 text-primary">Login to DealSpark</h2>
                                <div className="mb-3">
                                    <label className="form-label fw-medium">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-control form-control-lg"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-medium">Password</label>
                                    <input
                                        type="password"
                                        className="form-control form-control-lg"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary btn-lg w-100 rounded-pill"
                                    onClick={handleLogin}
                                >
                                    Login
                                </button>
                                <p className="text-center mt-3 text-muted">
                                    Don't have an account?{" "}
                                    <Link to="/register" className="text-primary fw-medium">
                                        Register
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Login;
