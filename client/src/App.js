import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SearchResults from "./components/SearchResults";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerOffers from "./pages/OwnerOffers";
import BuyerOffers from "./pages/BuyerOffers";
import MyOrders from "./pages/MyOrders";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import AboutUs from "./pages/about";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function App() {
  return (
    
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/owner" element={<OwnerDashboard />} />
        </Route>
        <Route path="/shop" element={<Shop />} />
        <Route path="/owneroffers" element={<OwnerOffers />} />
        <Route path="/buyeroffers" element={<BuyerOffers />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
    </Router>
  );
}

export default App;
