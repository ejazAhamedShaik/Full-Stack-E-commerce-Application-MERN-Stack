// function generateOTP() {
//     const digits = '0123456789';
//     let otp = '';

//     for (let i = 0; i < 6; i++) {
//         otp += digits[Math.floor(Math.random() * 10)];
//     }

//     return otp;
// }

// Method 2
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};


export { generateOTP };