import { User } from "../models/userModel.js";
import { emailBuilder } from "../utils/nodemailer.js";
import { generateOTP } from "../utils/otpGenerator.js";
import jwt from "jsonwebtoken";

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (decoded) {
      const userId = await User.findById(decoded.data);
      if (!userId) {
        return res.status(401).send({ message: "Unauthorized" });
      }
      req.user = userId;
      return next();
    }
    return res.status(401).send({ message: "Unauthorized" });
  } catch (e) {
    res.status(401).send({
      message: "Unauthorized",
    });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (user.role === "admin") {
      next();
    } else {
      res.status(401).send({
        message: "Unauthorized",
      });
    }
  } catch (e) {
    res.status(500).send({
      message: e.message,
    });
  }
};

const signUpHandler = async (req, res) => {
  try {
    const userObject = req.body;
    const user = await User.create(userObject);
    res.json({
      user: user,
      message: "User created successfully",
    });
  } catch (error) {
    res.json({
      message: error.message,
    });
  }
};

const loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).send({
        message: "User not found",
      });
    } else {
      if (password === user.password) {
        const token = jwt.sign({ data: user._id }, process.env.SECRET_KEY, {
          expiresIn: "1h",
        });
        res.cookie("token", token, {
          maxAge: 1000 * 60 * 60 * 24,
          httpOnly: true,
          // Frontend and API both run on localhost, so Lax cookies are sent
          // with credentialed fetch requests without requiring HTTPS.
          sameSite: "lax",
        });
        res.status(200).send({
          message: "Login Successful",
          data: user,
        });
      } else {
        res.status(400).json({
          message: "invalid credentials",
        });
      }
    }
  } catch (error) {
    res.status(error.status).send({
      message: error.message,
    });
  }
};

const forgotPasswordHandler = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    } else {
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpires = Date.now() + 5 * 60 * 1000;
      await user.save();

      emailBuilder(user.email, "Reset Password", `Your OTP is ${otp}`);

      res.status(200).json({
        status: "success",
        message: "Token is sent to your email",
      });
    }
  } catch (e) {
    res.status(400).json({
      status: "fail",
      message: e.message,
    });
  }
};

const resetPasswordHandler = async (req, res, next) => {
  try {
    const { password, otp } = req.body;
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    } else if (user.otpExpires < Date.now()) {
      return res.status(400).json({
        status: "fail",
        message: "OTP expired",
      });
    } else if (user.otp !== otp) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid OTP",
      });
    } else {
      user.password = password;
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();

      res.status(200).json({
        status: "success",
        message: "Password reset successful",
      });
    }
  } catch (e) {
    res.status(400).json({
      status: "fail",
      message: e.message,
    });
  }
};

const logoutHandler = async (req, res) => {
  try {
    res.clearCookie("token", { sameSite: "lax" });
    res.status(200).send({
      message: "Logged out successfully",
    });
  } catch (e) {
    res.status(500).send({
      message: e.message,
    });
  }
};

const isAuthorized = (allowedRoles) => {
  return async (req, res, next) => {
    const userId = req.userId;
    const user = await User.findById(userId);

    if(allowedRoles.includes(user.role)) {
      next();
    } else {
      res.status(401).send({
        message: "Unauthorized",
      });
    }
  }
}
export {
  protectRoute,
  isAdmin,
  signUpHandler,
  loginHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  logoutHandler,
  isAuthorized
};
