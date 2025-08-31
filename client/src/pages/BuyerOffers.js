import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function BuyerOffers() {
  const [offers, setOffers] = useState([]);
  const [recounterValues, setRecounterValues] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    fetchOffers();
    // Mark offers as seen
    markOffersAsSeen();
  }, []);

  const fetchOffers = async () => {
    try {
      const token = localStorage.getItem("dealspark_token");
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/offers/buyer`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOffers(res.data);
    } catch (err) {
      console.error("Error fetching buyer offers:", err);
    }
  };

  const markOffersAsSeen = async () => {
    try {
      const token = localStorage.getItem("dealspark_token");
      if (!token) return;
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/offers/buyer/mark-seen`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Trigger storage event to refresh Navbar counts
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error("Error marking buyer offers as seen:", err);
    }
  };

  const updateOffer = async (id, status, counterPrice) => {
    try {
      const token = localStorage.getItem("dealspark_token");
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/offers/${id}`,
        {
          status,
          counterPrice: counterPrice ? Number(counterPrice) : undefined,
        },
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
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/offers/${id}`, {
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

  const handleCheckout = (offer) => {
    setSelectedOffer(offer);
    setShowPaymentModal(true);
  };

  const PaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (e) => {
      e.preventDefault();
      setPaymentError("");
      setPaymentSuccess(false);

      const finalPrice =
        selectedOffer.status === "accepted"
          ? selectedOffer.counterPrice || selectedOffer.offeredPrice
          : selectedOffer.offeredPrice;

      try {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/offers/create-payment-intent`,
          { amount: finalPrice },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "dealspark_token"
              )}`,
            },
          }
        );

        const { error, paymentIntent } = await stripe.confirmCardPayment(
          data.clientSecret,
          {
            payment_method: {
              card: elements.getElement(CardElement),
              billing_details: {
                name: JSON.parse(localStorage.getItem("dealspark_user")).name,
              },
            },
          }
        );

        if (error) {
          setPaymentError(error.message);
          return;
        }

        if (paymentIntent && paymentIntent.status === "succeeded") {
          setPaymentError(""); // clear any old error
          setPaymentSuccess(true); // show only success

          const deliveryDate = new Date();
          deliveryDate.setDate(deliveryDate.getDate() + 5);

          await axios.post(
            `${process.env.REACT_APP_API_URL}/api/orders`,
            {
              items: [{ product: selectedOffer.productId, quantity: 1, price: finalPrice  }],
              totalAmount: finalPrice,
              shippingAddress: "Default address here", // or collect from user
              paymentIntentId: paymentIntent.id,
              deliveryDate,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem(
                  "dealspark_token"
                )}`,
              },
            }
          );

          window.location.href = "/my-orders";
        }
      } catch (err) {
        console.error("Order/payment error:", err);
        // ✅ Only show error if payment itself was not successful
        if (!paymentSuccess) {
          setPaymentError(
            "Something went wrong after payment. Please check your orders."
          );
        }
      }
    };

    return (
      <form onSubmit={handleSubmit}>
        <div className="mb-3 p-3 border rounded">
          <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
        </div>
        <button
          type="submit"
          disabled={!stripe}
          className="btn btn-primary w-100 fw-bold"
        >
          Pay ₹{selectedOffer.counterPrice || selectedOffer.offeredPrice}
        </button>
      </form>
    );
  };

  return (
    <>
      <Navbar />
      <div className="container my-5">
        <h2 className="mb-4 text-center fw-bold">My Offers</h2>
        {offers.length === 0 ? (
          <div className="alert alert-info text-center" role="alert">
            You haven't made any offers yet.
          </div>
        ) : (
          <div className="row g-4">
            {offers.map((offer) => (
              <div key={offer._id} className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="row g-0">
                    <div className="col-md-3 d-flex align-items-center">
                      <img
                        src={
                          offer.productId.imageUrl ||
                          "https://via.placeholder.com/150"
                        }
                        alt={offer.productId.name}
                        className="img-fluid rounded-start"
                        style={{
                          width: "150px",
                          height: "150px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div className="col-md-9">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h5 className="card-title mb-0">
                            {offer.productId.name}
                          </h5>
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
                            {offer.status === "countered_by_owner" &&
                              "Countered by Owner"}
                            {offer.status === "countered_by_buyer" &&
                              "You Countered"}
                            {offer.status === "accepted" && "Accepted ✅"}
                            {offer.status === "rejected" && "Rejected ❌"}
                          </span>
                        </div>
                        <p className="mb-2">
                          <strong>Your Offer:</strong> ₹{offer.offeredPrice}
                        </p>
                        {offer.status === "accepted" ? (
                          <p className="mb-2">
                            <strong>Final Amount:</strong> ₹
                            {offer.counterPrice || offer.offeredPrice}
                          </p>
                        ) : (
                          offer.counterPrice &&
                          offer.status.includes("countered") && (
                            <p className="mb-2">
                              <strong>Counter Offer:</strong> ₹
                              {offer.counterPrice}
                            </p>
                          )
                        )}
                        {offer.status === "pending" && (
                          <div className="mt-3">
                            <p className="text-muted">
                              Awaiting owner's response...
                            </p>
                          </div>
                        )}
                        {offer.status === "countered_by_owner" && (
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
                                placeholder="Your counter"
                                value={recounterValues[offer._id] || ""}
                                onChange={(e) =>
                                  setRecounterValues({
                                    ...recounterValues,
                                    [offer._id]: e.target.value,
                                  })
                                }
                                className="form-control"
                              />
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() =>
                                  updateOffer(
                                    offer._id,
                                    "countered",
                                    recounterValues[offer._id]
                                  )
                                }
                                disabled={!recounterValues[offer._id]}
                              >
                                <i className="bi bi-arrow-repeat me-1"></i>{" "}
                                Re-counter
                              </button>
                            </div>
                          </div>
                        )}
                        {offer.status === "countered_by_buyer" && (
                          <p className="text-muted mt-3">
                            Waiting for owner's response to your counter...
                          </p>
                        )}
                        {offer.status === "accepted" && (
                          <div className="mt-3 d-flex flex-wrap gap-2">
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleCheckout(offer)}
                            >
                              <i className="bi bi-cart-check me-1"></i> Proceed
                              to Checkout
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => removeOffer(offer._id)}
                            >
                              <i className="bi bi-trash me-1"></i> Close
                            </button>
                          </div>
                        )}
                        {offer.status === "rejected" && (
                          <div className="mt-3">
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => removeOffer(offer._id)}
                            >
                              <i className="bi bi-trash me-1"></i> Close
                            </button>
                          </div>
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
      {showPaymentModal && (
        <div className="modal show" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Payment</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPaymentModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <Elements stripe={stripePromise}>
                  <PaymentForm />
                </Elements>
                {paymentError && <p className="text-danger">{paymentError}</p>}
                {paymentSuccess && (
                  <p className="text-success">Payment successful!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}

export default BuyerOffers;
