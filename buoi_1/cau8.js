console.log("CÂU 8");
for (const product of products) {
    const status = product.isAvailable ? "Đang bán" : "Hết hàng";
    console.log(`${product.name} - ${product.category} - ${status}`);
}

