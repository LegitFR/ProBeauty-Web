import { fetchProducts, transformProducts } from "../lib/api/products";
import HomeClient from "./HomeClient";

export default async function Home() {
  const apiProducts = await fetchProducts(50);
  const products = transformProducts(apiProducts);

  return <HomeClient products={[]} />;
  {
    /* Pass products var in products props instead of empty arr here while production. */
  }
}
