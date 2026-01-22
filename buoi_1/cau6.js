console.log("CÂU 6");
const accessoriesProducts = products.filter(product => product.category === "Accessories");
const allAccessoriesAvailable = accessoriesProducts.every(product => product.isAvailable === true);
console.log(`Tất cả Accessories đang được bán: ${allAccessoriesAvailable}`);

