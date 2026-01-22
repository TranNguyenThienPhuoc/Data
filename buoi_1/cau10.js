console.log("CÂU 10");
const availableAndInStock = products
    .filter(product => product.isAvailable === true && product.quantity > 0)
    .map(product => product.name);
console.log(availableAndInStock);

