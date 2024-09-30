class Payment {
    constructor(title, quantity, unitPrice) {
        this.title = title;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }

    getTotal() {
        return this.quantity * this.unitPrice;
    }
}

export default Payment;