import React from "react";
import { Link } from "react-router-dom";
i
const Header = ({ totalItems }) => {
  return (
    <header>
      <div className="logo">
        <Link to="/">ENGI-MART</Link>
      </div>
      <nav>
        <Link to="/products">Products</Link>
        <Link to="/cart">Cart ({totalItems})</Link>
      </nav>
    </header>
  );
};

export default Header;