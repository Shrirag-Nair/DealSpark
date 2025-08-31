import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function ProductGridSection({ title, endpoint }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get(endpoint)
      .then((res) => setProducts(res.data))
      .catch((err) => console.log("Error Loading Section:", err));
  }, [endpoint]);

  return (
    <div className="container py-4">
      <h3 className="mb-3 fw-bold">{title}</h3>
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {products.map((product) => (
          <div key={product._id} className="col">
            <div
              className="card h-100 shadow-sm"
              style={{ borderRadius: "12px" }}
            >
              <img
                src={product.imageUrl}
                className="card-img-top"
                alt={product.name}
                style={{
                  height: "200px",
                  objectFit: "cover",
                  borderTopLeftRadius: "12px",
                  borderTopRightRadius: "12px",
                }}
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
                <h5 className="card-title">{product.name}</h5>
                                    <p
                      className="card-text text-muted mb-2"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {product.description?.substring(0, 60) ||
                        "No description available"}
                      ...
                    </p>
                <p className="card-text text-muted">
                  <del>₹{product.originalPrice.toFixed(2)}</del>
                  <span className="text-success fw-bold ms-2">
                    ₹{product.dealPrice.toFixed(2)}
                  </span>
                </p>
                {(() => {
                  const deliveryDate = new Date();
                  deliveryDate.setDate(
                    deliveryDate.getDate() + Math.floor(Math.random() * 2) + 2
                  );
                  const formattedDate = deliveryDate.toLocaleDateString(
                    "en-IN",
                    {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    }
                  );
                  return (
                    <>
                      <p className="text-success mb-1">Free Delivery</p>
                      <small className="text-muted">
                        Delivery by <strong>{formattedDate}</strong>
                      </small>
                    </>
                  );
                })()}
                <Link
                  to={`/product/${product._id}`}
                  className="btn btn-outline-primary btn-sm w-100 mt-auto"
                  style={{ borderRadius: "6px" }}
                >
                  View & Offer
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductGridSection;
