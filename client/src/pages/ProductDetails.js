import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [customPrice, setCustomPrice] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [pincode, setPincode] = useState("");
  const [deliveryMsg, setDeliveryMsg] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState("");
  const [existingOffer, setExistingOffer] = useState(null);
  const [minOffer, setMinOffer] = useState(0);
  const [isBuyer, setIsBuyer] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setActiveImage(res.data.image?.[0] || res.data.imageUrl);
        setMinOffer(Math.floor(res.data.dealPrice * 0.95));
      })
      .catch((err) => console.error("Error Loading Product:", err));
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("dealspark_token");
    const storedUser = JSON.parse(localStorage.getItem("dealspark_user"));
    if (token && storedUser && storedUser.role === "buyer") {
      setIsBuyer(true);
      fetchExistingOffer(token);
    }
  }, [id]);

  const fetchExistingOffer = async (token) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/offers/my-offer/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setExistingOffer(res.data);
    } catch (err) {
      console.error("Error fetching existing offer:", err);
    }
  };

  if (!product) return <div>Loading..</div>;

  const discount = Math.round(
    ((product.originalPrice - product.dealPrice) / product.originalPrice) * 100
  );

  const handlePincodeCheck = () => {
    if (pincode.length === 6) {
      setDeliveryMsg(
        `Estimated Delivery: ${new Date(
          Date.now() + 4 * 24 * 60 * 60 * 1000
        ).toDateString()}`
      );
    } else {
      setDeliveryMsg("Please enter a Valid 6-digit Pincode.");
    }
  };
  const handleAddToCart = async () => {
    const storedUser = JSON.parse(localStorage.getItem("dealspark_user"));
    const token = localStorage.getItem("dealspark_token");
    if (!storedUser || !token || !token.startsWith("eyJ")) {
      alert("Please log in to add items to your cart.");
      localStorage.clear();
      window.location.href = "/login";
      return;
    }
    if (!product?._id) {
      alert("Product not loaded. Please try again.");
      console.error("Product ID is undefined:", product);
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/cart/add`,
        {
          productId: product._id,
          qty: 1,
          price: product.dealPrice,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Product added to cart!");
      window.location.href = "/profile";
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(error.response?.data?.message || "Failed to add to cart.");
    }
  };

  const handleReviewSubmit = () => {
    if (reviewText && reviewRating) {
      alert(`Review submitted: ${reviewRating}★ - "${reviewText}"`);
      setReviewText("");
      setReviewRating("");
    } else {
      alert("Please fill review and rating");
    }
  };

  const handleBuyNow = () => {
    const storedUser = JSON.parse(localStorage.getItem("dealspark_user"));
    const token = localStorage.getItem("dealspark_token");

    if (!storedUser || !token || !token.startsWith("eyJ")) {
      alert("Please log in to continue with Buy Now.");
      localStorage.clear();
      window.location.href = "/login";
      return;
    }
    setShowPaymentModal(true);
  };

  const PaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/offers/create-payment-intent`,
          {
            amount: product.dealPrice,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "dealspark_token"
              )}`,
            },
          }
        );
        const clientSecret = data.clientSecret;

        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: elements.getElement(CardElement),
              billing_details: {
                name:
                  JSON.parse(localStorage.getItem("dealspark_user"))?.name ||
                  "Guest",
              },
            },
          }
        );

        if (error) {
          setPaymentError(error.message);
        } else if (paymentIntent.status === "succeeded") {
          try {
            const user = JSON.parse(localStorage.getItem("dealspark_user"));
            await axios.post(
              `${process.env.REACT_APP_API_URL}/api/orders`,
              {
                items: [
                  {
                    product: product._id,
                    quantity: 1,
                    price: product.dealPrice,
                  },
                ],
                totalAmount: product.dealPrice,
                shippingAddress:
                  user?.addresses?.find((a) => a.isDefault) ||
                  user?.addresses?.[0],
                paymentIntentId: paymentIntent.id,
                deliveryDate: new Date(
                  Date.now() +
                    (Math.floor(Math.random() * 2) + 2) * 24 * 60 * 60 * 1000
                ),
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
          } catch (err) {
            console.error("Failed to save order", err);
            setPaymentError(
              "Order could not be saved. Please contact support."
            );
          }
        }
      } catch (err) {
        setPaymentError("Payment failed. Please try again.");
      }
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="p-3 border rounded shadow-sm bg-light"
      >
        <div className="p-2 bg-white border rounded">
          <CardElement
            options={{
              hidePostalCode: true,
              style: { base: { fontSize: "16px" } },
            }}
          />
        </div>
        {paymentError && (
          <p className="text-danger small mt-2">{paymentError}</p>
        )}
        {paymentSuccess && (
          <p className="text-success small mt-2">Payment successful!</p>
        )}
        <button className="btn btn-primary w-100 mt-3 fw-bold" type="submit">
          Pay ₹{product.dealPrice}
        </button>
      </form>
    );
  };

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="row">
          <div className="col-md-5 d-flex flex-column align-items-center justify-content-center">
            <div className="d-flex justify-content-center w-100">
              <img
                src={activeImage}
                alt={product.name}
                className="img-fluid rounded shadow-sm mb-3"
                style={{
                  height: "100%",
                  objectFit: "contain",
                  maxHeight: "600px",
                }}
              />
            </div>
            <div className="d-flex justify-content-center flex-wrap gap-2 mt-3">
              {[product.imageUrl, ...(product.images || [])].map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt="thumb"
                  className={`img-thumbnail mb-2 ${
                    activeImage === img ? "border-primary" : ""
                  }`}
                  style={{
                    cursor: "pointer",
                    width: "70px",
                    height: "70px",
                    objectFit: "contain",
                  }}
                  onClick={() => setActiveImage(img)}
                />
              ))}
            </div>
          </div>
          <div className="col-md-6">
            <h2 className="fw-bold ">{product.name}</h2>
            <p className="text-muted">{product.brand}</p>

            {product.stock === 0 ? (
              <span className="badge bg-danger mt-3">Out of Stock</span>
            ) : product.stock <= 2 ? (
              <span className="badge bg-warning text-dark mt-3">
                Hurry! Only {product.stock} left!
              </span>
            ) : (
              <span className="badge bg-success mt-3">In Stock</span>
            )}
            <div className="d-flex align-items-center mb-2">
              <span className="badge bg-success me-2 mt-2">
                {product.rating.toFixed(1)} ★
              </span>
              <small className="mt-2">{product.numReviews} reviews</small>
            </div>
            <h4>
              ₹{product.dealPrice}{" "}
              <del className="text-muted fw-normal">
                ₹{product.originalPrice}
              </del>
              <span className="text-success fs-6">({discount}% OFF)</span>
            </h4>
            {(() => {
              const deliveryDate = new Date();
              deliveryDate.setDate(
                deliveryDate.getDate() + Math.floor(Math.random() * 2) + 2
              );
              const formattedDate = deliveryDate.toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
              });
              return (
                <small className="text-muted d-block mt-2">
                  Delivery by {formattedDate} | Free
                </small>
              );
            })()}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="mt-4">
                <h6>Select Size:</h6>
                <div className="d-flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`btn btn-outline-secondary rounded-circle p-2 ${
                        selectedSize === size ? "active" : ""
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Make an Offer */}
            {isBuyer && (
              <div className="mt-4 d-flex flex-column">
                <h6>Make an Offer (Min: ₹{minOffer})</h6>
                {existingOffer &&
                [
                  "pending",
                  "countered_by_owner",
                  "countered_by_buyer",
                ].includes(existingOffer.status) ? (
                  <p className="text-muted">
                    You have an active offer for this product. Check My Offers.
                  </p>
                ) : (
                  <div className="d-flex gap-2">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter your offer"
                      min={minOffer}
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                    />
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => {
                        if (!customPrice || Number(customPrice) < minOffer) {
                          return alert(
                            `Please enter an offer of at least ₹${minOffer}!`
                          );
                        }

                        axios
                          .post(
                            `${process.env.REACT_APP_API_URL}/api/offers`,
                            {
                              productId: product._id,
                              offeredPrice: Number(customPrice),
                            },
                            {
                              headers: {
                                Authorization: `Bearer ${localStorage.getItem(
                                  "dealspark_token"
                                )}`,
                              },
                            }
                          )
                          .then(() => {
                            alert(
                              `Your offer of ₹${customPrice} has been sent to the seller!`
                            );
                            setCustomPrice("");
                            fetchExistingOffer(
                              localStorage.getItem("dealspark_token")
                            );
                          })
                          .catch((err) => {
                            console.error("Error sending offer:", err);
                            alert(
                              err.response?.data?.message ||
                                "Something went wrong. Please try again."
                            );
                          });
                      }}
                    >
                      Make an Offer
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 p-3 border rounded">
              <h6>Seller Information</h6>
              <p>
                <strong>Sold by:</strong>{" "}
                {product.seller?.name || "Trusted Seller"}
              </p>
              <p>
                <strong>Seller Rating:</strong>{" "}
                {product.seller?.rating || "4.5"} ★
              </p>
            </div>

            <div className="mt-3 p-3 border rounded">
              <h6>Delivery Information</h6>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="form-control"
                  style={{ maxWidth: "200px" }}
                />
                <button
                  className="btn btn-primary"
                  onClick={handlePincodeCheck}
                >
                  Check
                </button>
              </div>
              {deliveryMsg && (
                <small className="text-success">{deliveryMsg}</small>
              )}
            </div>

            <div className="mt-4 d-flex gap-2">
              <button
                className="btn btn-warning px-4"
                disabled={product.stock === 0}
                onClick={handleAddToCart}
              >
                🛒 Add to Cart
              </button>
              <button
                className="btn btn-danger px-4"
                disabled={product.stock === 0}
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>

            {showPaymentModal && (
              <div className="modal show" style={{ display: "block" }}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Secure Payment</h5>
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
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-5">
          <h4>Product Description</h4>
          <p>{product.description}</p>
        </div>

        <div className="mt-5">
          <h4>Customer Reviews</h4>
          <div className="d-flex align-items-center mb-3">
            <span className="badge bg-success me-2 fs-5">
              {product.rating.toFixed(1)} ★
            </span>
            <small className="text-muted">
              {product.numReviews} ratings & reviews
            </small>
          </div>
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="d-flex align-items-center mb-1">
              <span className="me-2">{star} ★</span>
              <div
                className="progress"
                style={{ height: "8px", width: "200px" }}
              >
                <div
                  className="progress-bar bg-warning"
                  role="progressbar"
                  style={{
                    width: `${
                      (product.reviews?.filter((r) => r.rating === star)
                        .length /
                        product.numReviews) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          ))}

          {/* Reviews List */}
          <div
            className="mt-3 border rounded p-3"
            style={{ maxHeight: "300px", overflowY: "auto" }}
          >
            {product.reviews?.length > 0 ? (
              product.reviews.map((review, idx) => (
                <div key={idx} className="mb-3">
                  <strong>{review.name}</strong>{" "}
                  <span className="badge bg-success">{review.rating} ★</span>
                  {review.verified && (
                    <span className="badge bg-primary ms-2">
                      Verified Purchase
                    </span>
                  )}
                  <p className="mb-1">{review.comment}</p>
                  <small className="text-muted">
                    {new Date(review.date).toLocaleDateString()}
                  </small>
                  <hr />
                </div>
              ))
            ) : (
              <p className="text-muted">No reviews yet.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ProductDetail;
