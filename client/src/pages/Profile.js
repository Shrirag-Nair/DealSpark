import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PaymentForm = ({ total, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || isProcessing) return;

    setIsProcessing(true);
    setPaymentError("");

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/offers/create-payment-intent`,
        { amount: total},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("dealspark_token")}` },
        }
      );

      const clientSecret = data.clientSecret;

      const cardElement = elements.getElement(CardElement);

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: JSON.parse(localStorage.getItem("dealspark_user"))?.name || "Guest",
            email: JSON.parse(localStorage.getItem("dealspark_user"))?.email || "",
          },
        },
      });

      if (error) {
        setPaymentError(error.message);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        setPaymentSuccess(true);
        onSuccess(paymentIntent);
      }
    } catch (err) {
      console.error(err);
      setPaymentError("Payment failed. Please try again or contact support.");
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#32325d",
        fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
        "::placeholder": { color: "#aab7c4" },
      },
      invalid: { color: "#fa755a", iconColor: "#fa755a" },
    },
    hidePostalCode: false,
  };

  return (
    <div className="payment-container p-4">
      <h4 className="text-center mb-4 text-primary">Complete Your Payment</h4>
      <form onSubmit={handleSubmit} className="payment-form">
        <div className="mb-3">
          <label className="form-label fw-semibold">Card Details</label>
          <CardElement options={cardElementOptions} className="form-control p-3 border-secondary rounded" />
        </div>
        {paymentError && <p className="text-danger text-center mb-2">{paymentError}</p>}
        {paymentSuccess && <p className="text-success text-center mb-2">Payment successful! Redirecting...</p>}
        <button
          type="submit"
          className="btn btn-primary w-100 py-2"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? "Processing..." : `Pay ₹${total}`}
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary w-100 mt-2"
          onClick={onClose}
          disabled={isProcessing}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(null);
  const [editingAddr, setEditingAddr] = useState(null);
  const [addrForm, setAddrForm] = useState({
    street: "",
    city: "",
    state: "",
    phone: "",
    pincode: "",
    country: "India",
    isDefault: false,
  });

  const [dob, setDob] = useState("");
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("dealspark_user"));

  useEffect(() => {
    if (!storedUser) {
      setLoading(false);
      return;
    }
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await api.get(`users/${storedUser.id}`);
      setUser(res.data);
      setDob(res.data.dob || "");
      setCart(res.data.cart || []);
    } catch (err) {
      console.error("Failed to load User", err);
    } finally {
      setLoading(false);
    }
  };

  const openAddAddress = () => {
    setEditingAddr(null);
    setAddrForm({
      street: "",
      city: "",
      state: "",
      phone: "",
      pincode: "",
      country: "India",
      isDefault: false,
    });
    setShowAddressForm(true);
  };

  const openEditAddress = (addr) => {
    setEditingAddr(addr.id);
    setAddrForm({
      street: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      phone: addr.phone || "",
      pincode: addr.pincode || "",
      country: addr.country || "India",
      isDefault: !!addr.isDefault,
    });
    setShowAddressForm(true);
  };

  const submitAddress = async (e) => {
    e.preventDefault();
    try {
      if (!editingAddr) {
        await api.post(`/users/${storedUser.id}/addresses`, addrForm);
      } else {
        await api.put(`/users/${storedUser.id}/addresses/${editingAddr}`, addrForm);
      }
      await fetchUser();
      setShowAddressForm(false);
    } catch (err) {
      console.error("Address save failed", err);
      alert("Could not save address");
    }
  };

  const deleteAddress = async (addrId) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await api.delete(`/users/${storedUser.id}/addresses/${addrId}`);
      await fetchUser();
    } catch (err) {
      console.error("Delete address failed", err);
    }
  };

  const setDefault = async (addrId) => {
    try {
      await api.patch(`/users/${storedUser.id}/addresses/${addrId}/default`);
      await fetchUser();
    } catch (err) {
      console.error("Set default failed", err);
    }
  };

  const saveDob = async () => {
    try {
      await api.patch(`/users/${storedUser.id}`, { dob });
      await fetchUser();
    } catch (err) {
      console.error("Save dob failed", err);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/${storedUser.id}/cart/${productId}`);
      setCart(cart.filter((item) => item.ProductId._id !== productId));
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  const handleCheckout = () => {
    const total = cart.reduce((total, item) => total + item.price * item.qty, 0);
    if (total > 0) {
      setShowPaymentModal(true);
    } else {
      alert("Your cart is empty!");
    }
  };

  const handlePaymentSuccess = async(paymentIntent) => {
   try{
    await axios.post(
      `${process.env.REACT_APP_API_URL}/api/orders`,
      {
         items: cart.map((item) => ({
          product: item.ProductId._id,
          quantity: item.qty,
          price: item.price,
        })),
        totalAmount: cart.reduce((total, item) => total + item.price * item.qty, 0),
        shippingAddress: user.addresses.find((a) => a.isDefault) || user.addresses[0], 
        paymentIntentId: paymentIntent.id,
        deliveryDate: new Date(Date.now() + (Math.floor(Math.random() * 2) + 2) * 24 * 60 * 60 * 1000),
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("dealspark_token")}` },
      }
    );
    setShowPaymentModal(false);
    setCart([]);
    navigate("/my-orders");
   } catch(err){
    console.error("Failed to save order:", err);
    alert("Payment was successful but order could not be saved. Please contact support.");
   }
  }
  if (loading)
    return (
      <div>
        <Navbar />
        <div className="container py-5">Loading...</div>
        <Footer />
      </div>
    );

  if (!storedUser) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <h3>Please login to view your profile.</h3>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <h1 className="mb-3">{user?.name}'s Profile</h1>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>

        {/* DOB Section */}
        <div className="mb-4">
          <strong>Date of Birth:</strong> {user?.dob ? user.dob : "Not set"}
          <div className="d-flex align-items-center mt-2">
            <input
              type="date"
              className="form-control"
              style={{ maxWidth: 220 }}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
            <button className="btn btn-primary ms-2" onClick={saveDob}>
              Save DOB
            </button>
          </div>
        </div>

        {/* Address Section */}
        <div className="mb-4">
          <h2 className="text-primary fw-bold">Saved Addresses</h2>
          <button className="btn btn-primary mb-3" onClick={openAddAddress}>
            Add New Address
          </button>

          <div className="row g-3">
            {user?.addresses?.map((addr) => (
              <div key={addr._id} className="col-md-6">
                <div className="card shadow-sm border-0 h-100 rounded-3">
                  <div className="card-body">
                    <h5 className="card-title text-dark mb-2">{addr.street}</h5>
                    <p className="mb-1 text-muted">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="mb-1"><strong>Phone:</strong> {addr.phone}</p>
                    <p className="mb-1"><strong>Country:</strong> {addr.country}</p>

                    {addr.isDefault && (
                      <span className="badge bg-success text-white mb-2">Default Address</span>
                    )}

                    <div className="d-flex gap-2 mt-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => openEditAddress(addr)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteAddress(addr._id)}
                      >
                        Delete
                      </button>
                      {!addr.isDefault && (
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => setDefault(addr._id)}
                        >
                          Set Default
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div>
          <h2>My Cart</h2>
          {cart.length > 0 ? (
            <>
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="cart-card d-flex align-items-center border rounded p-3 mb-2 shadow-sm bg-white"
                  onClick={() => navigate(`/product/${item.ProductId._id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={item.ProductId.imageUrl}
                    alt={item.ProductId.name}
                    style={{ width: "80px", height: "80px", objectFit: "cover", marginRight: "15px" }}
                  />
                  <div style={{ flex: 1 }}>
                    <h5 className="mb-1">{item.ProductId.name}</h5>
                    <p className="mb-0">₹{item.price} × {item.qty}</p>
                  </div>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromCart(item.ProductId._id);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div className="border-top pt-3 mt-3">
                <h4>
                  Total: ₹{cart.reduce((total, item) => total + item.price * item.qty, 0)}
                </h4>
                <p>Items: {cart.reduce((total, item) => total + item.qty, 0)}</p>
                <button className="btn btn-warning text-white mt-2" onClick={handleCheckout}>
                  Proceed to Checkout
                </button>
              </div>
            </>
          ) : (
            <p>Your cart is empty.</p>
          )}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="modal show" style={{ display: "block" }} tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">Secure Payment</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowPaymentModal(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body p-5 bg-light">
                  <Elements stripe={stripePromise}>
                    <PaymentForm
                      total={cart.reduce((total, item) => total + item.price * item.qty, 0)}
                      onSuccess={handlePaymentSuccess}
                      onClose={() => setShowPaymentModal(false)}
                    />
                  </Elements>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
