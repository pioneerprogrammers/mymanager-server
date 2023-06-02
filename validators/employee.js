const { check, param } = require("express-validator");
const mongoose = require("mongoose");

const validateEmail = require("../validators/utilities/validateEmail");
const validatePhone = require("../validators/utilities/validatePhone");
const validateURL = require("../validators/utilities/validateURL");

exports.newEmployeeValidator = [
  check("fullName").notEmpty().withMessage("Full name is required").trim(),

  check("email")
    .trim()
    .custom(async (e) => {
      try {
        if (e) {
          const { email } = validateEmail(e);
          if (email) {
            throw email;
          }
        }
      } catch (error) {
        throw error;
      }
    }),

  check("phone")
    .trim()
    .custom(async (p) => {
      try {
        if (p) {
          const { phone } = validatePhone(p);
          if (phone) {
            throw phone;
          }
        }
      } catch (error) {
        throw error;
      }
    }),

  check("address").custom(async (address) => {
    try {
      if (address.zipCode) {
        if (isNaN(address.zipCode)) {
          throw "Zip code must be a numeric value";
        }
      }
    } catch (error) {
      throw error;
    }
  }),

  check("socialLinks").custom(async (socialLinks) => {
    try {
      if (socialLinks.length > 0) {
        socialLinks.map((l) => {
          const { name, url } = validateURL(l);
          if (url) {
            throw `${name} url for [${l.link}] is invalid`;
          }
        });
      }
    } catch (error) {
      throw error;
    }
  }),

  check("salary")
    .trim()
    .custom(async (salary) => {
      try {
        if (salary) {
          if (isNaN(salary)) {
            throw "Salary must be a numeric value";
          }
        }
      } catch (error) {
        throw error;
      }
    }),
];

exports.updateEmployeeValidator = [
  check("email")
    .trim()
    .custom(async (e) => {
      try {
        if (e) {
          const { email } = validateEmail(e);
          throw email;
        }
      } catch (error) {
        throw error;
      }
    }),

  check("phone")
    .trim()
    .custom(async (p) => {
      try {
        if (p) {
          const { phone } = validatePhone(p);
          throw phone;
        }
      } catch (error) {
        throw error;
      }
    }),

  check("socialLinks")
    .trim()
    .custom(async (urls) => {
      try {
        if (urls.length > 0) {
          urls.map((u) => {
            const { _, url } = validateURL(u);
            throw `Invalid URL for ${url}`;
          });
        }
      } catch (error) {
        throw error;
      }
    }),

  check("salary")
    .trim()
    .custom(async (salary) => {
      try {
        if (salary) {
          if (isNaN(salary)) {
            throw "Salary must be a numeric value";
          }
        }
      } catch (error) {
        throw error;
      }
    }),
];

exports.deleteEmployeeValidator = [
  param("id").custom(async (id) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw "No data found";
      }
    } catch (error) {
      throw error;
    }
  }),
];

exports.getEmployeeValidator = [
  param("id").custom(async (id) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw "No data found";
      }
    } catch (error) {
      throw error;
    }
  }),
];
