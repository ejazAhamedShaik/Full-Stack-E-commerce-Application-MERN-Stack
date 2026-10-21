import crypto from "crypto";
import Razorpay from "razorpay";
import { Order } from "../models/orderModel.js";
import { Product } from "../models/productModel.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function verifyPayment(req, res) {
  try {
    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: "Missing Razorpay payment details" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const providedBuffer = Buffer.from(razorpaySignature, "hex");
    const signatureMatches =
      expectedBuffer.length === providedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, providedBuffer);

    if (!signatureMatches) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Make a repeated client callback idempotent rather than creating a duplicate.
    const existingOrder = await Order.findOne({ razorpayOrderId });
    if (existingOrder && existingOrder.status !== "pending") {
      if (existingOrder.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Order does not belong to this user" });
      }
      return res.status(200).json({
        message: "Payment was already verified",
        paymentId: existingOrder.razorpayPaymentId,
        order: existingOrder,
      });
    }

    // Fetch Razorpay's order metadata; never trust client-provided price/product.
    const razorpayOrder = await razorpay.orders.fetch(razorpayOrderId);
    const { productId, orderId, userId } = razorpayOrder.notes || {};
    if ((!productId && !orderId) || userId !== req.user._id.toString()) {
      return res.status(400).json({ message: "Invalid Razorpay order metadata" });
    }

    let orderData = {
      user: req.user._id,
      priceAtOrder: razorpayOrder.amount / 100,
      status: "confirmed",
      razorpayOrderId,
      razorpayPaymentId,
    };
    if (orderId) {
      const pendingOrder = await Order.findOne({ _id: orderId, user: req.user._id, status: "pending" });
      if (!pendingOrder) return res.status(400).json({ message: "Cart order not found" });
      pendingOrder.status = "confirmed";
      pendingOrder.razorpayPaymentId = razorpayPaymentId;
      await pendingOrder.save();
      orderData = null;
    } else {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });
      orderData.product = product._id;
    }
    const order = orderData ? await Order.create(orderData) : await Order.findOne({ _id: orderId });

    return res.status(201).json({
      message: "Payment verified and order created successfully",
      paymentId: razorpayPaymentId,
      order,
    });
  } catch (error) {
    console.error("Payment verification failed:", error);
    return res.status(500).json({ message: "Unable to verify payment" });
  }
}

async function createRazorpayOrder(req, res) {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.stock <= 0) {
      return res.status(400).json({ message: "Product is out of stock" });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(product.price * 100),
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        productId: product._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    return res.status(201).json({
      message: "Razorpay order created successfully",
      razorpayOrder,
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    return res.status(500).json({ message: "Unable to create Razorpay order" });
  }
}

async function createCartRazorpayOrder(req, res) {
  try {
    const requestedItems = req.body.items;
    if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    const normalized = new Map();
    for (const item of requestedItems) {
      const id = String(item.productId || "");
      const quantity = Number(item.quantity);
      if (!/^[a-f\d]{24}$/i.test(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return res.status(400).json({ message: "Invalid cart item" });
      }
      normalized.set(id, (normalized.get(id) || 0) + quantity);
    }
    const products = await Product.find({ _id: { $in: [...normalized.keys()] } });
    if (products.length !== normalized.size) return res.status(400).json({ message: "A cart product is unavailable" });
    const items = products.map((product) => {
      const quantity = normalized.get(product._id.toString());
      if (product.stock < quantity) throw new Error(`${product.productName} does not have enough stock`);
      return { product: product._id.toString(), quantity, priceAtOrder: product.price };
    });
    const amount = items.reduce((sum, item) => sum + item.priceAtOrder * item.quantity, 0);
    const pendingOrder = await Order.create({
      user: req.user._id,
      items,
      priceAtOrder: amount,
      status: "pending",
      razorpayOrderId: `pending_${Date.now()}_${req.user._id}`,
      razorpayPaymentId: `pending_${Date.now()}_${req.user._id}`,
    });
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `cart_${Date.now()}`,
      notes: { userId: req.user._id.toString(), orderId: pendingOrder._id.toString() },
    });
    pendingOrder.razorpayOrderId = razorpayOrder.id;
    await pendingOrder.save();
    return res.status(201).json({ message: "Cart order created", razorpayOrder });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Unable to create cart order" });
  }
}

async function getUserOrders(req, res) {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("product", "productName")
      .populate("items.product", "productName");
    return res.status(200).json({ message: "Orders fetched successfully", orders });
  } catch (error) {
    console.error("Fetching orders failed:", error);
    return res.status(500).json({ message: "Unable to fetch orders" });
  }
}

export { verifyPayment, createRazorpayOrder, createCartRazorpayOrder, getUserOrders };
