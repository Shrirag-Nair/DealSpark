import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function Navbar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [buyerOfferCount, setBuyerOfferCount] = useState(0);
  const [ownerOfferCount, setOwnerOfferCount] = useState(0);

  useEffect(() => {
    const checkUser = () => {
      const storedUser = JSON.parse(localStorage.getItem("dealspark_user"));
      setUser(storedUser);
      if (storedUser) {
        fetchOfferCounts();
        if (storedUser.role === "owner") {
          if (
            window.location.pathname === "/" ||
            window.location.pathname === "/login"
          ) {
            navigate("/owner");
          }
        }
      } else {
        setBuyerOfferCount(0);
        setOwnerOfferCount(0);
      }
    };
    window.addEventListener("storage", checkUser);
    checkUser();
    return () => window.removeEventListener("storage", checkUser);
  }, [navigate]);

  const fetchOfferCounts = async () => {
    try {
      const token = localStorage.getItem("dealspark_token");
      if (!token) return;

      // Fetch buyer offer count
      const buyerRes = await axios.get(
        "http://localhost:5000/api/offers/buyer/count",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBuyerOfferCount(buyerRes.data.count);

      // Fetch owner offer count
      const ownerRes = await axios.get(
        "http://localhost:5000/api/offers/owner/count",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOwnerOfferCount(ownerRes.data.count);
    } catch (err) {
      console.error("Error fetching offer counts:", err);
    }
  };

  const handleMarkBuyerOffersSeen = async () => {
    try {
      const token = localStorage.getItem("dealspark_token");
      if (!token) return;
      await axios.post(
        "http://localhost:5000/api/offers/buyer/mark-seen",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBuyerOfferCount(0);
    } catch (err) {
      console.error("Error marking buyer offers as seen:", err);
    }
  };

  const handleMarkOwnerOffersSeen = async () => {
    try {
      const token = localStorage.getItem("dealspark_token");
      if (!token) return;
      await axios.post(
        "http://localhost:5000/api/offers/owner/mark-seen",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOwnerOfferCount(0);
    } catch (err) {
      console.error("Error marking owner offers as seen:", err);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("dealspark_user");
    localStorage.removeItem("dealspark_token");
    setUser(null);
    setBuyerOfferCount(0);
    setOwnerOfferCount(0);
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  return (
    <nav
      className="navbar navbar-expand-lg sticky-top"
      style={{
        background: "linear-gradient(90deg, #0d6efd, #6610f2)",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
    >
      <div className="container-fluid px-4">
        <Link
          className="navbar-brand fw-bold fs-3"
          to={user?.role === "owner" ? "/owner" : "/"}
          style={{ letterSpacing: "1.5px", color: "#fff" }}
        >
          <span className="text-warning">Deal</span>
          <span className="text-white">Spark</span>
        </Link>

        {user?.role !== "owner" && (
          <div className="col-5">
            <form className="d-flex w-70" onSubmit={handleSearch}>
              <input
                type="search"
                className="form-control me-2"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="btn btn-outline-light" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </form>
          </div>
        )}

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {user?.role !== "owner" && (
              <li className="nav-item">
                <Link
                  to="/shop"
                  className="nav-link text-white px-4 py-2 mx-1 rounded-3"
                  style={{ transition: "all 0.3s ease" }}
                >
                  Shop
                </Link>
              </li>
            )}

            <li className="nav-item">
              <Link
                to="/about"
                className="nav-link text-white px-4 py-2 mx-1 rounded-3"
                style={{ transition: "all 0.3s ease" }}
              >
                About Us
              </Link>
            </li>

            {user ? (
              <>
                {user.role === "buyer" && (
                  <>
                    <li className="nav-item">
                      <Link
                        to="/buyeroffers"
                        className="nav-link text-white px-3 py-2 mx-1"
                        style={{
                          backgroundColor: "#ffffff0d",
                          borderRadius: "5px",
                        }}
                        onClick={handleMarkBuyerOffersSeen}
                      >
                        My Offers
                        {buyerOfferCount > 0 && (
                          <span className="badge bg-danger rounded-pill ms-2">
                            {buyerOfferCount}
                          </span>
                        )}
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        to="/my-orders"
                        className="nav-link text-white px-3 py-2 mx-1"
                        style={{
                          backgroundColor: "#ffffff0d",
                          borderRadius: "5px",
                        }}
                      >
                        My Orders
                      </Link>
                    </li>
                  </>
                )}
                {user.role === "owner" && (
                  <li className="nav-item">
                    <Link
                      to="/owneroffers"
                      className="nav-link text-white px-3 py-2 mx-1"
                      style={{
                        backgroundColor: "#ffffff0d",
                        borderRadius: "5px",
                      }}
                      onClick={handleMarkOwnerOffersSeen}
                    >
                      Offers Received
                      {ownerOfferCount > 0 && (
                        <span className="badge bg-danger rounded-pill ms-2">
                          {ownerOfferCount}
                        </span>
                      )}
                    </Link>
                  </li>
                )}

                {user.role !== "owner" && (
                  <li className="nav-item">
                    <Link
                      to="/profile"
                      className="nav-link text-white px-3 py-2 mx-1"
                      style={{
                        backgroundColor: "#ffffff0d",
                        borderRadius: "5px",
                        transition: "all 0.3s ease",
                        fontWeight: "500",
                      }}
                    >
                      <i className="bi bi-person-circle me-2"></i>
                      {user.name}
                    </Link>
                  </li>
                )}

                <li className="nav-item">
                  <button
                    onClick={handleSignOut}
                    className="btn btn-light text-primary ms-2"
                    style={{
                      borderRadius: "5px",
                      padding: "6px 15px",
                      fontWeight: "500",
                    }}
                  >
                    SignOut
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link
                    to="/login"
                    className="nav-link text-white px-4 py-2 mx-1 rounded-3"
                  >
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/register"
                    className="nav-link text-white px-4 py-2 mx-1 rounded-3"
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
