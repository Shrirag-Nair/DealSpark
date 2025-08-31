import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="bg-dark text-white py-5" style={{ background: 'linear-gradient(90deg, #0d6efd, #6610f2)' }}>
            <div className="container">
                <div className="row g-4">
                    <div className="col-md-4">
                        <h5 className="fw-bold mb-3" style={{ letterSpacing: '1px' }}>
                            <span className="text-warning">Deal</span><span className="text-white">Spark</span>
                        </h5>
                        <p className="text-white">
                            DealSpark is your go-to platform for negotiating the best deals in real-time with trusted sellers. Shop smart, save big!
                        </p>
                    </div>
                    <div className="col-md-4">
                        <h5 className="fw-bold mb-3">Quick Links</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2">
                                <Link
                                    to="/"
                                    className="text-white text-decoration-none"
                                    style={{ transition: 'color 0.3s ease' }}
                                    onMouseEnter={(e) => (e.target.style.color = '#ffc107')}
                                    onMouseLeave={(e) => (e.target.style.color = '#fff')}
                                >
                                    Home
                                </Link>
                            </li>
                            <li className="mb-2">
                                <Link
                                    to="/shop"
                                    className="text-white text-decoration-none"
                                    style={{ transition: 'color 0.3s ease' }}
                                    onMouseEnter={(e) => (e.target.style.color = '#ffc107')}
                                    onMouseLeave={(e) => (e.target.style.color = '#fff')}
                                >
                                    Shop
                                </Link>
                            </li>
                            <li className="mb-2">
                                <Link
                                    to="/login"
                                    className="text-white text-decoration-none"
                                    style={{ transition: 'color 0.3s ease' }}
                                    onMouseEnter={(e) => (e.target.style.color = '#ffc107')}
                                    onMouseLeave={(e) => (e.target.style.color = '#fff')}
                                >
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/register"
                                    className="text-white text-decoration-none"
                                    style={{ transition: 'color 0.3s ease' }}
                                    onMouseEnter={(e) => (e.target.style.color = '#ffc107')}
                                    onMouseLeave={(e) => (e.target.style.color = '#fff')}
                                >
                                    Register
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="col-md-4">
                        <h5 className="fw-bold mb-3">Connect With Us</h5>
                        <div className="d-flex gap-3">
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white"
                                style={{ transition: 'color 0.3s ease' }}
                                onMouseEnter={(e) => (e.target.style.color = '#ffc107')}
                                onMouseLeave={(e) => (e.target.style.color = '#fff')}
                            >
                                <i className="bi bi-twitter fs-4"></i>
                            </a>
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white"
                                style={{ transition: 'color 0.3s ease' }}
                                onMouseEnter={(e) => (e.target.style.color = '#ffc107')}
                                onMouseLeave={(e) => (e.target.style.color = '#fff')}
                            >
                                <i className="bi bi-facebook fs-4"></i>
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white"
                                style={{ transition: 'color 0.3s ease' }}
                                onMouseEnter={(e) => (e.target.style.color = '#ffc107')}
                                onMouseLeave={(e) => (e.target.style.color = '#fff')}
                            >
                                <i className="bi bi-instagram fs-4"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="text-center mt-4 pt-4 border-top border-primary">
                    <p className="text-white mb-0">
                        &copy; {new Date().getFullYear()} DealSpark. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;