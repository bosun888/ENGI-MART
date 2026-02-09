import { Link } from "react-router-dom";

export default function OrderSuccess() {
  return (
    <div className="container">
      <h2>Thank You for Your Purchase!</h2>
      <p>Your order has been successfully placed.</p>
      <Link to="/">Return to Home</Link>
    </div>
  );
}
