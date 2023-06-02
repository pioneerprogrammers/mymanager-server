module.exports = (phone) => {
  const errors = {
    phone: "",
  };
  let phoneNumberRegex = /^(\([0-9]{3}\) |[0-9]{3}-)[0-9]{3}-[0-9]{4}/;

  if (!phoneNumberRegex.test(phone)) {
    errors.phone = "Invalid phone number";
  }

  return errors;
};
