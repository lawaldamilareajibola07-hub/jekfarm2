// data/products.js
export const products = [
  { 
    id: "1", 
    name: "Tomato 1", 
    price: "1,50 ₦", 
    image: require("../assets/tomato1.png") 
  },
  { 
    id: "2", 
    name: "Tomato 3", 
    price: "1,70 ₦", 
    image: require("../assets/tomato3.png") 
  },
  { 
    id: "3", 
    name: "Tomato 5", 
    price: "2,00 ₦", 
    image: require("../assets/tomato5.png") 
  },
  { 
    id: "4", 
    name: "Yellow Tomato", 
    price: "1,80 ₦", 
    image: require("../assets/yellotomato2.png") 
  },
  { 
    id: "5", 
    name: "Single Tomato", 
    price: "2,20 ₦", 
    image: require("../assets/singletomato4.png") 
  },
  { 
    id: "6", 
    name: "Pack Beef", 
    price: "5,50 ₦", 
    image: require("../assets/packbeaf.png") 
  },
  { 
    id: "7", 
    name: "Real Beef", 
    price: "7,00 ₦", 
    image: require("../assets/realbeef.png") 
  },
  { 
    id: "8", 
    name: "Carrots", 
    price: "1,00 ₦", 
    image: require("../assets/carots.png") 
  },
  { 
    id: "9", 
    name: "Black Cucumber", 
    price: "2,50 ₦", 
    image: require("../assets/blackcucumber.png") 
  },
];

// Just names for quick reference (for Home.js)
export const productNames = products.map(product => product.name);