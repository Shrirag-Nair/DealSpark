import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("dealspark_user"));

  useEffect(() => {
    if (!storedUser) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveOrder = async (orderId) => {
    try {
      await api.delete(`/orders/${orderId}`);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (err) {
      console.error("Failed to remove order", err);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container py-5 text-center">Loading your orders...</div>
        <Footer />
      </div>
    );
  }

  if (!storedUser) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <h3>Please login to view your orders.</h3>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <h1 className="text-primary fw-bold mb-4">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center p-5 bg-light rounded shadow-sm">
            <p className="text-muted fs-5">No orders placed yet.</p>
            <button
              className="btn btn-outline-primary mt-3"
              onClick={() => navigate("/")}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {orders.map((order) => {
              const delivered = new Date(order.deliveryDate) < new Date();

              return (
                <div key={order._id} className="col-12">
                  <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                      <h5 className="mb-0 text-dark">Order #{order._id.slice(-6)}</h5>
                      <span
                        className={`badge px-3 py-2 ${delivered ? "bg-success" : "bg-warning text-dark"}`}
                      >
                        {delivered ? "Delivered" : "Processing"}
                      </span>
                    </div>
                    <div className="card-body">
                      <div className="d-flex justify-content-between flex-wrap mb-3">
                        <p className="mb-1 text-muted">
                          <strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="mb-1 text-muted">
                          <strong>Total:</strong> ₹{order.totalAmount}
                        </p>
                      </div>

                      {/* Order Items */}
                      <div className="row g-3 mb-3">
                        {order.items.map((item) => (
                          <div key={item._id} className="col-md-4 col-sm-6">
                            <div className="card h-100 border-0 shadow-sm p-3">
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="img-fluid rounded"
                                style={{ maxHeight: "120px", objectFit: "contain" }}
                              />
                              <div className="mt-2">
                                <h6 className="text-dark mb-1">{item.product.name}</h6>
                                <p className="text-muted small mb-0">
                                  Qty: {item.quantity} × ₹{item.price}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Date */}
                      <div className="border-top pt-3">
                        <p className="mb-1 text-muted">
                          <strong>Delivery Date:</strong> {new Date(order.deliveryDate).toDateString()}
                        </p>
                      </div>

                      {/* Remove order button if delivered */}
                      {delivered && (
                        <div className="mt-3 d-flex justify-content-end">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemoveOrder(order._id)}
                          >
                            ❌ Remove Order
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
