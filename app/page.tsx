import { fetchProducts, transformProducts } from "../lib/api/products";
import HomeClient from "./HomeClient";

export default async function Home() {
  // Fetch products server-side (API URL is not exposed to client)
  const apiProducts = await fetchProducts(50);
  const products = transformProducts(apiProducts);

  return <HomeClient products={products} />;
}
