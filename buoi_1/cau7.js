console.log("CÂU 7");
const totalInventoryValue = products.reduce((total, product) => {
    return total + (product.price * product.quantity);
}, 0);
console.log(`Tổng giá trị kho hàng: ${totalInventoryValue.toLocaleString()}`);
