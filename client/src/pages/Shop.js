import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Shop() {
  const [products, setProducts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          category
            ? `${process.env.REACT_APP_API_URL}/api/products/shop?category=${category}`
            : `${process.env.REACT_APP_API_URL}/api/products/shop`
        );
        setProducts(res.data);
      } catch (err) {
        console.error("Error Loading Shop Products:", err);
      }
    };
    fetchProducts();
  }, [category]);

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <h2 className="fw-bold mb-4">
          🛍️ Shop {category ? `: ${category}` : ""}
        </h2>

        <div className="mb-3">
          <strong>Filter By Category:</strong>
          <button
            className="btn btn-sm btn-outline-primary mx-1"
            onClick={() => setSearchParams({})}
          >
            All
          </button>
          <button
            className="btn btn-sm btn-outline-primary mx-1"
            onClick={() => setSearchParams({ category: "electronics" })}
          >
            Electronics
          </button>
          <button
            className="btn btn-sm btn-outline-primary mx-1"
            onClick={() => setSearchParams({ category: "fashion" })}
          >
            Fashion
          </button>
        </div>

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
                  <p className="card-text text-muted">
                    Original Price = 
                    <del>₹{product.originalPrice}</del>
                    <br />
                    <span className="text-success fw-bold">
                      Discount Price =
                      ₹{product.dealPrice}
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
                    View & Make Offer
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Shop;
