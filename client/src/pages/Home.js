import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ProductGridSection from "../components/ProductGridSection";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function Home() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/products/deals`);
        console.log("API response:", res.data);
        setDeals(res.data);
        setLoading(false); // Fixed: Set loading to false after successful fetch
      } catch (err) {
        console.error("Error fetching Deals: ", err);
        setError("Failed to load deals. Please try again.");
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  return (
    <>
      <Navbar />
      <div
        id="heroCarousel"
        className="carousel slide carousel-fade"
        data-bs-ride="carousel"
      >
        <div className="carousel-inner">
          {[
            {
              image:
                "https://images.pexels.com/photos/1050244/pexels-photo-1050244.jpeg",
              heading: "Welcome to DealSpark",
              subtext: "Negotiate real-time deals and spark your savings!",
            },
            {
              image:
                "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg",
              heading: "🔥 Hot Deals Daily",
              subtext: "Grab the best offers before they’re gone!",
            },
            {
              image:
                "https://images.pexels.com/photos/325876/pexels-photo-325876.jpeg",
              heading: "Shop Smart. Pay Less.",
              subtext: "Thousands of negotiable items await you.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`carousel-item ${idx === 0 ? "active" : ""}`}
            >
              <img
                src={item.image}
                className="d-block w-100"
                alt={item.heading}
                style={{
                  objectFit: "cover",
                  height: "600px",
                  filter: "brightness(70%)",
                }}
              />
              <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-75 rounded-3 p-4">
                <h2
                  className="fw-bold text-white mb-3"
                  style={{ letterSpacing: "1px" }}
                >
                  {item.heading}
                </h2>
                <p className="lead text-light mb-4">{item.subtext}</p>
                <Link
                  to="/shop"
                  className="btn btn-primary btn-lg rounded-pill"
                  style={{
                    background: "linear-gradient(90deg, #0d6efd, #6610f2)",
                  }}
                >
                  Start Shopping
                </Link>
              </div>
            </div>
          ))}
        </div>
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#heroCarousel"
          data-bs-slide="prev"
        >
          <span
            className="carousel-control-prev-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#heroCarousel"
          data-bs-slide="next"
        >
          <span
            className="carousel-control-next-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      <div className="container py-4">
        <h2
          className="mb-5 text-center fw-bold text-primary"
          style={{ letterSpacing: "1px" }}
        >
          🔥 Deals of the Day
        </h2>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : deals.length === 0 ? (
          <div className="card border-0 shadow-sm p-4 text-center">
            <p className="mb-0 fs-5 text-muted">
              No deals available right now. Check back soon!
            </p>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-3 g-4">
            {deals.map((product) => (
              <div key={product._id} className="col">
                <div
                  className="card h-100 shadow-sm"
                  style={{ borderRadius: "12px" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-5px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  <img
                    src={product.imageUrl}
                    className="card-img-top"
                    alt={product.name}
                    style={{ height: "200px", objectFit: "cover",borderTopLeftRadius: "12px",
                  borderTopRightRadius: "12px", }}
                  />
                  {product.stock === 0 ? (
                    <span className="badge bg-danger position-absolute top-0 end-0 m-2">
                      Out of Stock
                    </span>
                  ) : product.stock <= 2 ? (
                    <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-2">
                      Hurry! Only {product.stock} left
                    </span>
                  ) : (
                    <span className="badge bg-success position-absolute top-0 end-0 m-2">
                      In Stock
                    </span>
                  )}

                  <div className="card-body d-flex flex-column justify-content-between">
                    <h5 className="card-title">
                      {product.name}
                    </h5>
                    <p
                      className="card-text text-muted mb-2"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {product.description?.substring(0, 60) ||
                        "No description available"}
                      ...
                    </p>
                    <div className="d-flex align-items-center mb-3">
                      <span className="text-decoration-line-through text-muted me-2">
                        ₹{product.originalPrice?.toFixed(2)}
                      </span>
                      <span className="fw-bold text-success fs-5">
                        ₹
                        {product.dealPrice?.toFixed(2) ||
                          product.originalPrice?.toFixed(2)}
                      </span>
                    </div>
                    <Link
                      to={`/product/${product._id}`}
                      className="btn btn-outline-primary btn-sm w-100 mt-auto"
                      style={{borderRadius: "6px"}}
                    >
                      View & Offer
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <ProductGridSection
          title="🧠 Recommended for You"
          endpoint={`${process.env.REACT_APP_API_URL}/api/products/random`}
        />
        <ProductGridSection
          title="💻 Electronics Zone"
          endpoint={`${process.env.REACT_APP_API_URL}/api/products/category/electronics`}
        />
        <ProductGridSection
          title="👕 Fashion Picks"
          endpoint={`${process.env.REACT_APP_API_URL}/api/products/category/fashion`}
        />

        <div className="row g-4 mt-5">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <i className="bi bi-basket fs-1 text-primary mb-3"></i>
                <h5 className="card-title fw-bold text-primary">
                  Wide Selection
                </h5>
                <p className="card-text text-muted">
                  Explore thousands of products from trusted sellers.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <i className="bi bi-chat-dots fs-1 text-primary mb-3"></i>
                <h5 className="card-title fw-bold text-primary">
                  Real-Time Negotiation
                </h5>
                <p className="card-text text-muted">
                  Haggle directly with sellers to get the best price.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <i className="bi bi-shield-check fs-1 text-primary mb-3"></i>
                <h5 className="card-title fw-bold text-primary">
                  Secure Transactions
                </h5>
                <p className="card-text text-muted">
                  Shop with confidence with our secure platform.
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

export default Home;
