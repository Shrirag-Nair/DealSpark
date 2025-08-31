import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function OwnerOffers() {
  const [offers, setOffers] = useState([]);
  const [counterValues, setCounterValues] = useState({});

  useEffect(() => {
    fetchOffers();
    // Mark offers as seen
    markOffersAsSeen();
  }, []);

  const fetchOffers = async () => {
    try {
      const token = localStorage.getItem("dealspark_token");
      const res = await axios.get("http://localhost:5000/api/offers/owner", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOffers(res.data);
    } catch (err) {
      console.error("Error fetching owner offers:", err);
    }
  };

  const markOffersAsSeen = async () => {
    try {
      const token = localStorage.getItem("dealspark_token");
      if (!token) return;
      await axios.post("http://localhost:5000/api/offers/owner/mark-seen", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Trigger storage event to refresh Navbar counts
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error("Error marking owner offers as seen:", err);
    }
  };

  const updateOffer = async (id, status, counterPrice) => {
    try {
      const token = localStorage.getItem("dealspark_token");
      await axios.patch(
        `http://localhost:5000/api/offers/${id}`,
        { status, counterPrice: counterPrice ? Number(counterPrice) : undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOffers();
      // Trigger storage event to refresh Navbar counts
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error("Error updating offer:", err);
      alert("Failed to update offer. Please try again.");
    }
  };

  const removeOffer = async (id) => {
    try {
      const token = localStorage.getItem("dealspark_token");
      await axios.delete(`http://localhost:5000/api/offers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOffers(offers.filter((o) => o._id !== id));
      // Trigger storage event to refresh Navbar counts
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // Offer already deleted, remove from local state
        setOffers(offers.filter((o) => o._id !== id));
        // Trigger storage event to refresh Navbar counts
        window.dispatchEvent(new Event("storage"));
      } else {
        console.error("Error deleting offer:", err);
        alert("Failed to delete offer. Please try again.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="container my-5">
        <h2 className="mb-4 text-center fw-bold">Offers on Your Products</h2>
        {offers.length === 0 ? (
          <div className="alert alert-info text-center" role="alert">
            No offers on your products yet.
          </div>
        ) : (
          <div className="row g-4">
            {offers.map((offer) => (
              <div key={offer._id} className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="row g-0">
                    <div className="col-md-3 d-flex align-items-center">
                      <img
                        src={offer.productId.imageUrl || "https://via.placeholder.com/150"}
                        alt={offer.productId.name}
                        className="img-fluid rounded-start"
                        style={{ width: "150px", height: "150px", objectFit: "cover" }}
                      />
                    </div>
                    <div className="col-md-9">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h5 className="card-title mb-0">{offer.productId.name}</h5>
                          <span
                            className={`badge ${
                              offer.status === "pending"
                                ? "bg-warning text-dark"
                                : offer.status === "accepted"
                                ? "bg-success"
                                : offer.status === "rejected"
                                ? "bg-danger"
                                : offer.status === "countered_by_owner"
                                ? "bg-info text-dark"
                                : "bg-warning text-dark"
                            } fs-6 px-3 py-2`}
                          >
                            {offer.status === "pending" && "Pending"}
                            {offer.status === "countered_by_buyer" && "Buyer Countered"}
                            {offer.status === "countered_by_owner" && "You Countered"}
                            {offer.status === "accepted" && "Accepted ✅"}
                            {offer.status === "rejected" && "Rejected ❌"}
                          </span>
                        </div>
                        <p className="mb-2">
                          <strong>Buyer:</strong> {offer.buyerId.name} ({offer.buyerId.email})
                        </p>
                        <p className="mb-2">
                          <strong>Offered:</strong> ₹{offer.offeredPrice}
                        </p>
                        {offer.status === "accepted" ? (
                          <p className="mb-2">
                            <strong>Final Amount:</strong> ₹{offer.counterPrice || offer.offeredPrice}
                          </p>
                        ) : (
                          offer.counterPrice && offer.status.includes("countered") && (
                            <p className="mb-2">
                              <strong>Counter Offer:</strong> ₹{offer.counterPrice}
                            </p>
                          )
                        )}
                        {(offer.status === "pending" || offer.status === "countered_by_buyer") && (
                          <div className="mt-3 d-flex flex-wrap gap-2">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => updateOffer(offer._id, "accepted")}
                            >
                              <i className="bi bi-check-circle me-1"></i> Accept
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => updateOffer(offer._id, "rejected")}
                            >
                              <i className="bi bi-x-circle me-1"></i> Reject
                            </button>
                            <div className="input-group input-group-sm w-auto">
                              <input
                                type="number"
                                placeholder="Counter price"
                                value={counterValues[offer._id] || ""}
                                onChange={(e) =>
                                  setCounterValues({
                                    ...counterValues,
                                    [offer._id]: e.target.value,
                                  })
                                }
                                className="form-control"
                              />
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() =>
                                  updateOffer(offer._id, "countered", counterValues[offer._id])
                                }
                                disabled={!counterValues[offer._id]}
                              >
                                <i className="bi bi-arrow-repeat me-1"></i> Counter
                              </button>
                            </div>
                          </div>
                        )}
                        {(offer.status === "accepted" || offer.status === "rejected") && (
                          <div className="mt-3">
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => removeOffer(offer._id)}
                            >
                              <i className="bi bi-trash me-1"></i> Close
                            </button>
                          </div>
                        )}
                        {offer.status === "countered_by_owner" && (
                          <p className="text-muted mt-3">Waiting for buyer's response to your counter...</p>
                        )}
                      </div>
                    </div>
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

export default OwnerOffers;