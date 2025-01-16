const phoneNumberRegex = /^\+91\d{10}$/;

export default function validatePhoneNumber(phoneNumber) {
  return phoneNumberRegex.test(phoneNumber);
}


