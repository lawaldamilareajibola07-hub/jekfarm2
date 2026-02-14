import React, { createContext, useState, useContext } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);

  const addToCart = (item) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(quantity, 1) } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Add this function to get cart count
  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price || item.originalPrice || 0) * item.quantity,
    0
  );

  const canPlaceOrder = (walletBalance) => {
    return walletBalance >= subtotal && cartItems.length > 0;
  };

  const placeOrder = async (orderData) => {
    setIsProcessingOrder(true);
    setOrderError(null);

    try {
      const response = await fetch("https://jekfarms.com.ng/orders/pay_order.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.text();
      let parsedResult;
      try {
        parsedResult = JSON.parse(result);
      } catch (e) {
        console.error("Failed to parse JSON response:", e);
        throw new Error("Invalid server response");
      }
      
      if (response.ok && parsedResult.status === "success") {
        clearCart();
        return { success: true, data: parsedResult };
      } else {
        throw new Error(parsedResult.message || "Failed to place order");
      }
    } catch (error) {
      setOrderError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsProcessingOrder(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        canPlaceOrder,
        placeOrder,
        isProcessingOrder,
        orderError,
        setOrderError,
        getCartCount, // Add this to the provider value
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};