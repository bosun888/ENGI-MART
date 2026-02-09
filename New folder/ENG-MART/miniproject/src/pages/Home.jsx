import { products } from "../data/products";
import ProductCard from "../components/ProductCard";

export default function Home() {
  return (
    <div className="container">
      <h2>Featured Engineering Packages</h2>
      <div className="products-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
