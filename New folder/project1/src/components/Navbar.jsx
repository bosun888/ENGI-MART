import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">ENGI-MART</Link>

      <div className="nav-links">
        <Link to="/products">Products</Link>
        <Link to="/packages">Packages</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/login">Login</Link>
      </div>
    </nav>
  );
}
