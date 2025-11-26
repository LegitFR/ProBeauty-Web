import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { Minus, Plus, X, ShoppingBag, CreditCard, Truck } from "lucide-react";
import { useCart } from "./CartContext";
import { toast } from "sonner";
import { motion } from "motion/react";
import { navigationActions } from "./ScrollManager";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    getTotalItems,
  } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [clickedItemId, setClickedItemId] = useState<string | number | null>(
    null
  );

  // const handleProductClick = (productId: string | number) => {
  //   // Close the cart drawer
  //   onClose();

  //   // Small delay to ensure cart closes before scrolling
  //   setTimeout(() => {
  //     // Dispatch event to Shop component to highlight the product
  //     window.dispatchEvent(
  //       new CustomEvent("highlightProduct", {
  //         detail: { productId },
  //       })
  //     );
  //   }, 100);
  // };

  const handleQuantityChange = (id: string | number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(id);
      toast.success("Item removed from cart");
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleCheckout = () => {
    // Close the drawer
    onClose();

    // Navigate to checkout page
    router.push("/checkout");
  };

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md p-6 min-h-screen overflow-y-auto bg-[#ECE3DC]">
        <SheetHeader className="pb-4 border-b-[#CBCBCB] border-b-2">
          <SheetTitle className="flex items-center gap-2 font-display">
            <ShoppingBag className="h-5 w-5 text-[#FF7A00]" />
            Shopping Cart
            {totalItems > 0 && (
              <Badge className="bg-[#FF7A00] text-white">{totalItems}</Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Review your items and proceed to checkout
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full mt-4">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 mb-6">
                Add some beautiful products to get started
              </p>
              <Button
                onClick={onClose}
                className="bg-[#FF7A00] hover:bg-[#e66900]"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-4 py-2">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      className="flex items-center space-x-4 bg-transparent rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-20 w-20 rounded-md object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          ${item.price.toFixed(2)} each
                        </p>
                        <div className="flex items-center mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full bg-transparent"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="mx-3 text-sm font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full bg-transparent"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <button
                          onClick={() => {
                            removeFromCart(item.id);
                            toast.success("Item removed from cart");
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors mb-2"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <p className="text-sm text-[#616161]">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t -mx-6 px-6 pt-6 mt-6 space-y-4 pb-2">
                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-[#717171]">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#717171]">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="border-t -mx-6 px-6 pt-6 mt-6 flex justify-between font-medium">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="flex items-center gap-2 text-sm text-green-600 p-3 rounded-lg">
                  <Truck className="h-4 w-4" />
                  <span>Free shipping on all orders</span>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-[#F44A01] hover:bg-[#e66900] text-white py-6"
                >
                  {isCheckingOut ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Checkout - ${totalPrice.toFixed(2)}
                    </div>
                  )}
                </Button>

                <Button variant="outline" onClick={onClose} className="w-full">
                  Continue Shopping
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
