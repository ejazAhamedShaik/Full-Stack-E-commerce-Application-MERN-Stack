import express from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import cors from "cors";
import crypto from "crypto";

const app = express();

app.use(cors());

/**
 * express.json() parses the request body into an object.
 * But Razorpay signs the raw bytes, not the parsed object.
 * So if you verify against req.body after JSON parsing, the signature will usually fail
 * Instead, register a raw body parser specifically for the webhook route before the JSON parser
 */
app.use("/verify", express.raw({ type: "application/json" }));

app.use(express.json());

dotenv.config();

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.get("/", (req, res) => {
  res.send("Payments server is running");
});

app.post("/checkout", async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    console.log(items);
    console.log(totalAmount);

    const order = await instance.orders.create({
      amount: totalAmount * 100, // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Unable to create order",
    });
  }
});

/**
 * We need to verify the webhook signature to ensure that the request is coming from Razorpay and not from any other source. This is important for security reasons, as it prevents unauthorized access to your webhook endpoint.
 */
app.post("/verify", (req, res) => {
  try {
    console.log("Webhook called ", req.body);

    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.log("Invalid signature");
      return res.status(400).json({ msg: "Invalid signature" });
    }

    console.log("Webhook verified successfully");

    const payload = JSON.parse(req.body.toString());

    console.log(payload.event);

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
  }
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
