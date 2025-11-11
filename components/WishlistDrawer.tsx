import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { Heart, X, ShoppingBag, Star, Trash2, Sparkles } from "lucide-react";
import { useWishlist } from "./WishlistContext";
import { useCart } from "./CartContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WishlistDrawer({ isOpen, onClose }: WishlistDrawerProps) {
  const { items, removeFromWishlist, getTotalItems } = useWishlist();
  const { addToCart } = useCart();

  const handleRemoveItem = (id: string | number, name: string) => {
    removeFromWishlist(id);
    toast.success(`${name} removed from wishlist`);
  };

  const handleMoveToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
    removeFromWishlist(item.id);
    toast.success(`${item.name} moved to cart!`);
  };

  const totalItems = getTotalItems();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md bg-[linear-gradient(135deg,_#FFF7ED_0%,_#FFFBEB_15%,_#FFF1F2_35%,_#FFFFFF_50%,_#FFF1F2_65%,_#FFFBEB_85%,_#FEF2F2_100%)] backdrop-blur-3xl border-l border-orange-200/40 shadow-2xl p-6">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 font-display text-xl">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="h-5 w-5 text-red-500 fill-red-500" />
            </motion.div>
            <span className="bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
              My Wishlist
            </span>
            {totalItems > 0 && (
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-xs">
                {totalItems}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription className="text-gray-600 text-sm">
            Your favorite beauty products in one place
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full mt-4">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="relative mb-4"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <Heart className="h-16 w-16 text-gray-300 relative" />
              </motion.div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 font-display">
                Your wishlist is empty
              </h3>
              <p className="text-gray-500 mb-4 max-w-xs text-sm">
                Start adding your favorite products to keep track of what you
                love
              </p>
              <Button
                onClick={onClose}
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Discover Products
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-4 py-2">
                  <AnimatePresence>
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="group relative bg-white/80 backdrop-blur-md rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-orange-100/70"
                      >
                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id, item.name)}
                          className="absolute top-2 right-2 z-10 p-1.5 bg-red-50 hover:bg-red-100 rounded-full transition-colors group-hover:scale-110 duration-200"
                        >
                          <X className="h-3.5 w-3.5 text-red-500" />
                        </button>

                        <div className="flex items-start space-x-4">
                          {/* Product Image */}
                          <div className="relative flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-20 w-20 rounded-lg object-cover ring-2 ring-orange-100 group-hover:ring-orange-300 transition-all duration-300"
                            />
                            {item.discount && (
                              <div className="absolute -top-1 -left-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">
                                {item.discount}%
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0 pr-6">
                            <p className="text-[10px] text-orange-600 font-medium mb-0.5">
                              {item.brand}
                            </p>
                            <h4 className="text-xs font-bold text-gray-900 line-clamp-2 mb-1.5 group-hover:text-orange-600 transition-colors leading-tight">
                              {item.name}
                            </h4>

                            {/* Rating */}
                            {item.rating && (
                              <div className="flex items-center space-x-1 mb-1.5">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-2.5 w-2.5 ${
                                        i < Math.floor(item.rating!)
                                          ? "fill-orange-500 text-orange-500"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                {item.reviews && (
                                  <span className="text-[10px] text-gray-500">
                                    ({item.reviews})
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Price */}
                            <div className="flex items-center space-x-1.5 mb-2">
                              <span className="text-sm font-bold text-gray-900">
                                ₹{item.price.toLocaleString()}
                              </span>
                              {item.originalPrice && (
                                <span className="text-[11px] text-gray-400 line-through">
                                  ₹{item.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>

                            {/* Move to Cart Button */}
                            <Button
                              onClick={() => handleMoveToCart(item)}
                              size="sm"
                              className="w-full h-7 text-xs bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group/btn"
                            >
                              <ShoppingBag className="h-3 w-3 mr-1.5 group-hover/btn:rotate-12 transition-transform" />
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>

              <div className="border-t border-orange-100/60 -mx-6 px-6 pt-6 mt-5 space-y-3">
                {/* Summary */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 backdrop-blur-md rounded-xl p-3 border border-orange-100/70">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-600">Total Items</span>
                    <span className="text-base font-bold text-gray-900">
                      {totalItems}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      Estimated Value
                    </span>
                    <span className="text-base font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
                      ₹
                      {items
                        .reduce((sum, item) => sum + item.price, 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      items.forEach((item) => handleMoveToCart(item));
                    }}
                    className="w-full h-10 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                    Add All to Cart
                  </Button>

                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-full h-9 border-2 border-orange-200 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl text-sm"
                  >
                    Continue Shopping
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => {
                      items.forEach((item) => removeFromWishlist(item.id));
                      toast.success("Wishlist cleared");
                    }}
                    className="w-full h-9 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-sm"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Clear Wishlist
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
