import { fetchProducts, transformProducts } from "../../lib/api/products";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
  // Fetch products with filters - now supports minPrice, maxPrice, salonId, inStock, page, limit
  const apiProducts = await fetchProducts({
    limit: 100, // Fetch more products for the full page
    inStock: true, // Only show in-stock products by default
  });
  const products = transformProducts(apiProducts);

  return <ProductsClient products={products} />;
}
