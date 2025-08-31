import { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function OwnerDashboard() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    brand: "",
    description: "",
    imageUrl: "",
    originalPrice: "",
    dealPrice: "",
    category: "",
    stock: 10,
  });
  const [enableSizes, setEnableSizes] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [images, setImages] = useState([""]);

  const ownerId = localStorage.getItem("dealspark_userId");

  useEffect(() => {
    if(ownerId){
    fetchProducts();
    }
  }, [ownerId]);

  const fetchProducts = async () => {
    try {
      const res = await api.get(`/products/owner/${ownerId}`);
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const handleImageChange = (index, value) => {
    const updated = [...images];
    updated[index] = value;
    setImages(updated);
  };

  const addImageField = () => {
    setImages([...images, ""]);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
    const payload = {
      ...form,
      ownerId,
      images, 
      enableSizes,
      sizes
    };

      await api.post("/products",payload);
      alert("Product added successfully!");
      setForm({
        name: "",
        brand: "",
        description: "",
        imageUrl: "",
        originalPrice: "",
        dealPrice: "",
        category: "",
        stock: 10,
      });
      setImages([""]);
      setSizes([]);
      setEnableSizes(false);
      fetchProducts();
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <h2 className="fw-bold mb-4">Owner Dashboard</h2>

        {/* Add Product Form */}
        <div className="card p-4 shadow-sm mb-5">
          <h4 className="mb-3">Add New Product</h4>
          <form onSubmit={handleAddProduct}>
            <div className="row g-3">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Product Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Brand"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-12">
                <textarea
                  className="form-control"
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Image URL"
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm({ ...form, imageUrl: e.target.value })
                  }
                  required
                />
              </div>
              <div className="col-md-3">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Original Price"
                  value={form.originalPrice}
                  onChange={(e) =>
                    setForm({ ...form, originalPrice: e.target.value })
                  }
                  required
                />
              </div>
              <div className="col-md-3">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Deal Price"
                  value={form.dealPrice}
                  onChange={(e) =>
                    setForm({ ...form, dealPrice: e.target.value })
                  }
                  required
                />
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Category"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  required
                />
              </div>
              <div className="col-md-4">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Stock"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </div>
              <div className="col-md-4">
                <button className="btn btn-primary w-100" type="submit">
                  Add Product
                </button>
              </div>
              <div className="mb-3">
                <label>
                  <input
                    type="checkbox"
                    checked={enableSizes}
                    onChange={() => setEnableSizes(!enableSizes)}
                  />{" "}
                  Enable size selection
                </label>
              </div>

              {enableSizes && (
                <div className="mb-3">
                  <label>Sizes (comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="6, 7, 8, 9, 10"
                    onChange={(e) =>
                      setSizes(e.target.value.split(",").map((s) => s.trim()))
                    }
                  />
                </div>
              )}

              <div className="mb-3">
                <label>Product Images</label>
                {images.map((img, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={img}
                    className="form-control mb-2"
                    placeholder="Image URL"
                    onChange={(e) => handleImageChange(idx, e.target.value)}
                  />
                ))}
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={addImageField}
                >
                  Add Another Image
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Your Products Section */}
        <h4 className="mb-3">Your Products</h4>
        <div className="row">
          {products.map((p) => (
            <div className="col-md-4 mb-4" key={p._id}>
              <div className="card h-100 shadow-sm">
                <img
                  src={p.imageUrl}
                  className="card-img-top"
                  alt={p.name}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <h5>{p.name}</h5>
                  <p className="text-muted">{p.brand}</p>
                  <p>
                    ₹{p.dealPrice}{" "}
                    <del className="text-muted">₹{p.originalPrice}</del>
                  </p>
                  <span
                    className={`badge ${
                      p.stock > 0 ? "bg-success" : "bg-danger"
                    }`}
                  >
                    {p.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                  <div className="mt-3">
                    {p.offers && p.offers.length > 0 ? (
                      <button className="btn btn-warning btn-sm">
                        View Offers ({p.offers.length})
                      </button>
                    ) : (
                      <span className="text-muted small">No offers yet</span>
                    )}
                  </div>
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

export default OwnerDashboard;
