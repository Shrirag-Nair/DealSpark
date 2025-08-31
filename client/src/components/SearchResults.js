import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";

function SearchResults() {
    const query = new URLSearchParams(useLocation().search).get("q");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (query) {
            setLoading(true);
            setError(null);
            axios
                .get(`${process.env.REACT_APP_API_URL}/api/products/search?q=${query}`)
                .then((res) => {
                    setResults(res.data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Search Error: ", err);
                    setError("Failed to load search results. Please try again.");
                    setLoading(false);
                });
        }
    }, [query]);

    return (
        <>
            <Navbar />
            <div className="container py-5">
                <h3 className="mb-4 fw-bold text-primary" style={{ letterSpacing: '1px' }}>
                    Search Results for: <em className="text-warning">{query || "All Products"}</em>
                </h3>
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
                ) : results.length === 0 ? (
                    <div className="card border-0 shadow-sm p-4 text-center">
                        <p className="mb-0 fs-5 text-muted">No products found for "{query}". Try a different search term!</p>
                    </div>
                ) : (
                    <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
                        {results.map((product) => (
                            <div key={product._id} className="col">
                                <div className="card h-100 border-0 shadow-sm" style={{ transition: 'transform 0.3s ease' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}>
                                    <img
                                        src={product.imageUrl}
                                        className="card-img-top"
                                        alt={product.name}
                                        style={{ height: "200px", objectFit: "cover" }}
                                    />
                                    <div className="card-body">
                                        <h5 className="card-title fw-bold text-primary">{product.name}</h5>
                                        <p className="card-text text-muted mb-2" style={{ fontSize: '0.9rem' }}>
                                            {product.description?.substring(0, 60) || "No description available"}...
                                        </p>
                                        <div className="d-flex align-items-center mb-3">
                                            <span className="text-decoration-line-through text-muted me-2">
                                                ${product.originalPrice?.toFixed(2)}
                                            </span>
                                            <span className="fw-bold text-primary fs-5">
                                                ${product.currentPrice?.toFixed(2) || product.originalPrice?.toFixed(2)}
                                            </span>
                                        </div>
                                        <Link
                                            to={`/product/${product._id}`}
                                            className="btn btn-primary btn-lg w-100 rounded-pill"
                                            style={{ background: 'linear-gradient(90deg, #0d6efd, #6610f2)' }}
                                        >
                                            View & Offer
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}

export default SearchResults;