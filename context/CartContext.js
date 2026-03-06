import React, {
  createContext,
  useState,
  useContext,
  useMemo,
} from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);

  /* ---------------------------
     ADD TO CART (Supports qty)
  ---------------------------- */
  const addToCart = (item, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);

      if (existing) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }

      return [
        ...prev,
        {
          ...item,
          price: Number(item.price), // normalize price
          quantity,
        },
      ];
    });
  };

  /* ---------------------------
     REMOVE
  ---------------------------- */
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  /* ---------------------------
     UPDATE QTY
  ---------------------------- */
  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity }
          : item
      )
    );
  };

  /* ---------------------------
     CLEAR
  ---------------------------- */
  const clearCart = () => {
    setCartItems([]);
  };

  /* ---------------------------
     MEMOIZED SUBTOTAL
  ---------------------------- */
  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  /* ---------------------------
     CART COUNT
  ---------------------------- */
  const cartCount = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }, [cartItems]);

  /* ---------------------------
     PLACE ORDER
  ---------------------------- */
  const placeOrder = async (orderData) => {
    setIsProcessingOrder(true);
    setOrderError(null);

    try {
      const response = await fetch(
        "https://jekfarms.com.ng/orders/pay_order.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Order failed");
      }

      clearCart();
      return { success: true, data };
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
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        cartCount,
        placeOrder,
        isProcessingOrder,
        orderError,
        setOrderError,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used within CartProvider"
    );
  }

  return context;
};