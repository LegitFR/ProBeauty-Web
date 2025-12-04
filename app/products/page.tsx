import { fetchProducts, transformProducts } from "../../lib/api/products";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
  const apiProducts = await fetchProducts(100); // Fetch more products for the full page
  const products = transformProducts(apiProducts);

  return <ProductsClient products={products} />;
}
