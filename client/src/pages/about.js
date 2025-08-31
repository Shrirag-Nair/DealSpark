// src/pages/AboutUs.js
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const AboutUs = () => {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="bg-dark text-light text-center py-5 mb-5">
        <div className="container">
          <h1 className="display-4 fw-bold">Welcome to DealSpark</h1>
          <p className="lead">
            Connecting Buyers & Owners with the Best Deals — Fast, Secure, and Reliable.
          </p>
        </div>
      </section>

      <div className="container">
        {/* About Section */}
        <section className="text-center mb-5">
          <h2 className="fw-bold mb-4">What is DealSpark?</h2>
          <p className="lead text-muted mx-auto" style={{ maxWidth: "800px" }}>
            DealSpark is a smart marketplace where buyers explore exclusive deals,
            negotiate offers, and complete purchases securely. Owners manage
            their products effortlessly, reaching new customers with ease.
          </p>
        </section>

        {/* Features Section */}
        <section className="mb-5">
          <h2 className="fw-bold text-center mb-4">Why Choose Us?</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card shadow h-100 border-0 text-center p-4">
                <div className="fs-1 text-primary mb-3">⚡</div>
                <h5 className="fw-bold">Fast & Seamless</h5>
                <p className="text-muted">Quick browsing, easy offers, and smooth checkout for all users.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow h-100 border-0 text-center p-4">
                <div className="fs-1 text-success mb-3">🔒</div>
                <h5 className="fw-bold">Secure Payments</h5>
                <p className="text-muted">Integrated Stripe gateway ensures safe and reliable transactions.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow h-100 border-0 text-center p-4">
                <div className="fs-1 text-warning mb-3">🤝</div>
                <h5 className="fw-bold">Trusted Platform</h5>
                <p className="text-muted">Owners and buyers connect transparently for the best deals.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Meet the Developer Section */}
        <section className="mb-5 text-center">
          <h2 className="fw-bold mb-4">Meet the Developer</h2>
          <div className="d-flex justify-content-center">
            <div className="card border-0 shadow-lg p-4" style={{ maxWidth: "400px" }}>
              <img
                src="/Assests/DevImage1.png" // replace with actual image in public/Assests
                alt="Developer"
                className="rounded-circle shadow mb-3 mx-auto"
                width="160"
                height="160"
              />
              <h4 className="fw-bold">Shrirag Nair</h4>
              <p className="text-muted">Full Stack Developer</p>
              <p>
                I love crafting smooth web applications with React, Node.js,
                and MongoDB, ensuring users have the best possible experience.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-light p-5 rounded shadow-sm mb-5 text-center">
          <h2 className="fw-bold mb-3">Contact Us</h2>
          <p className="text-muted">We’d love to hear from you. Reach out anytime:</p>
          <ul className="list-unstyled fs-5">
            <li>📧 <a href="mailto:support@dealspark.com">support@dealspark.com</a></li>
            <li>📞 +91 8329640166</li>
            <li>📍 Mumbai, India</li>
          </ul>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default AboutUs;
