import Navbar from "../components/Navbar";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Footer from "../components/Footer";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("buyer");
    const nav = useNavigate();

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            return alert("Please fill in all fields");
        }
        if (password !== confirmPassword) {
            return alert("Passwords do not match");
        }

        try {
            const res = await api.post("/auth/register", {
                name,
                email,
                password,
                role
            });
            localStorage.setItem("dealspark_token", res.data.token);
            localStorage.setItem("dealspark_role", res.data.user.role);
            localStorage.setItem("dealspark_user", JSON.stringify(res.data.user));
            alert("Registration successful!");
            if(res.data.user.role==="owner"){
                nav("/owner");
            }else{
            nav("/");
            }
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Registration failed");
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
                                <h2 className="text-center fw-bold mb-4 text-primary">Join DealSpark</h2>

                                <div className="mb-3">
                                    <label className="form-label fw-medium">Full Name</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your full name"
                                    />
                                </div>
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
                                <div className="mb-3">
                                    <label className="form-label fw-medium">Password</label>
                                    <input
                                        type="password"
                                        className="form-control form-control-lg"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-medium">Confirm Password</label>
                                    <input
                                        type="password"
                                        className="form-control form-control-lg"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm your password"
                                    />
                                </div>

                                {/* Role Selection */}
                                <div className="mb-4">
                                    <label className="form-label fw-medium">Register as:</label>
                                    <div>
                                        <label className="me-3">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="buyer"
                                                checked={role === "buyer"}
                                                onChange={(e) => setRole(e.target.value)}
                                            />{" "}
                                            Buyer
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="role"
                                                value="owner"
                                                checked={role === "owner"}
                                                onChange={(e) => setRole(e.target.value)}
                                            />{" "}
                                            Owner (Seller)
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-primary btn-lg w-100 rounded-pill"
                                    onClick={handleRegister}
                                >
                                    Sign Up
                                </button>
                                <p className="text-center mt-3 text-muted">
                                    Already have an account?{" "}
                                    <Link to="/login" className="text-primary fw-medium">
                                        Login
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

export default Register;
