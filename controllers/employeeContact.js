const asyncHandler = require("express-async-handler");
const { buildPagination } = require("../Utilities/buildPagination");
const EmployeeContact = require("./../models/EmployeeContact");
const EmployeePosition = require("./../models/EmployeePosition");
const Authenticate = require("./../models/Authenticate");
const mongoose = require("mongoose");
const { anyUploader, imageUpload } = require("./../lib/upload");

const deleteContact = asyncHandler(async (req, res) => {
  const { _id } = req.body;

  const contact = await EmployeeContact.findById(_id);
  if (!contact) {
    throw Error("Contact not found !");
  }
  contact.isDelete = true;
  await contact.save();
  res.send({});
});

const contactList = asyncHandler(async (req, res) => {
  try {
    let {
      pageSize,
      page,
      position,
      type,
      status,
      sortKey,
      sortType,
      text,
      tags,
    } = req.query;

    page = parseInt(page) || 1;
    pageSize = parseInt(pageSize) || 10;
    const skip = (page - 1) * pageSize;
    const { user } = req;

    let sort = 1;
    if (sortType == "desc") {
      sort = -1;
    }

    let query = {
      userId: mongoose.Types.ObjectId(req.user.id ? req.user.id : req.user._id),
      isDelete: false,
    };

    if (position && position !== null && position !== undefined) {
      query = {
        ...query,
        position,
      };
    }

    if (type && type !== null && type !== undefined) {
      query = {
        ...query,
        type,
      };
    }

    if (status && status !== null && status !== undefined) {
      query = {
        ...query,
        status,
      };
    }

    if (text !== "" && text !== undefined) {
      let regex = new RegExp(text, "i");
      query = {
        ...query,
        $or: [{ fullName: regex }],
      };
    }

    if (tags) {
      query = {
        ...query,
        tags: {
          $elemMatch: {
            $in: [tags, "$tags"],
          },
        },
      };
    }

    const employeeContact = await EmployeeContact.aggregate([
      {
        $match: query,
      },
      {
        $sort: {
          [sortKey]: sort,
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }, { $addFields: { page } }],
          data: [{ $skip: skip }, { $limit: pageSize }],
        },
      },
    ]);

    console.log(employeeContact[0].metadata, query);

    const data = buildPagination(employeeContact);
    res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      errors: { common: { msg: err.message } },
    });
  }
});

const contactAdd = asyncHandler(async (req, res) => {
  const { fullName, email, phone, outletId, position, password } = req.body;

  if (!req.user) {
    throw Error("user not Found !");
  }

  let outlet = null;
  if (outletId !== "") {
    outlet = outletId;
  }

  // Check phone exist or not
  if (phone !== "") {
    const checkExist = await EmployeeContact.findOne({
      phone,
      isDelete: false,
    });
    if (checkExist) {
      throw Error("Phone number already Exist");
    }
  }

  // Check Email exist or not
  if (email !== "") {
    const checkExist = await EmployeeContact.findOne({
      email,
      isDelete: false,
    });
    if (checkExist) {
      throw Error("Email already Exist");
    }
  }

  const employeeContact = new EmployeeContact({
    fullName,
    email,
    phone,
    outletId: outlet,
    position,
    userId: req.user.id ? req.user.id : req.user._id,
  });

  // validation
  if (!fullName || fullName === "") {
    throw Error("Full name must not empty !");
  }

  employeeContact.save(async (err, success) => {
    if (err) {
      if (err) {
        throw Error(err);
      }
    } else {
      // Add Employee to Authen Credential
      const emp = await new Authenticate({
        email,
        phone,
        password,
        accType: "user-employee",
      }).save();

      console.log(emp);

      return res.status(201).json({
        success: "Client contact created successfull",
      });
    }
  });
});

const contactById = asyncHandler(async (req, res) => {
  //----------------------------------------

  const { id } = req.params;
  const { user } = req;

  EmployeeContact.findOne(
    { _id: id, isDelete: false, userId: user.id ? user.id : user._id },
    (err, contact) => {
      if (err) {
        return res.status(500).json({
          errors: { common: { msg: err.message } },
        });
      }

      res.status(200).json(contact);
    }
  );
});

const updateContact = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { user } = req;
  const {
    _id,
    fullName,
    email,
    phone,
    photo,
    gender,
    address,
    status,
    note,
    tags,
    dob,
    type,
    salary,
    isFormer,
    isinternship,
  } = req.body;

  const contact = await EmployeeContact.findById(_id);
  if (!contact) throw Error("Contact not Found");

  contact.fullName = fullName ? fullName : "";
  contact.email = email ? email : "";
  contact.phone = phone ? phone : "";
  contact.gender = gender ? gender : "";
  contact.address = address ? address : "";
  contact.status = status ? status : "";
  contact.note = note ? note : "";
  contact.tags = tags ? tags : "";
  contact.dob = dob ? dob : "";
  contact.type = type ? type : "";
  contact.salary = salary ? salary : 0;
  contact.isFormer = isFormer ? isFormer : contact.isFormer;
  contact.isinternship = isinternship ? isinternship : contact.isinternship;
  await contact.save();
  return res.json({});
});

const uploadAvatar = async (req, res) => {
  try {
    const { id } = req.body;

    const employee = await EmployeeContact.findById(id);
    if (!employee) {
      return res.status(404).send("ID not found ");
    }

    employee.photo = req.file.location;
    await employee.save();
    res.status(200).json({});
  } catch (err) {
    return res.status(500).json({
      errors: { common: { msg: err.message } },
    });
  }
};

const updateSocialLink = async (req, res) => {
  try {
    const { id, links } = req.body;

    const employee = await EmployeeContact.findById(id);
    if (!employee) {
      return res.status(404).send("ID not found ");
    }

    const socialLinks = employee.socialLinks;
    const newLinks = [];
    for (let link of links) {
      let findExisting = Array.from(socialLinks).find(
        (x) => String(x.name) === String(link.name)
      );
      if (findExisting) {
        findExisting.link = link.link;
        newLinks.push(findExisting);
      } else {
        newLinks.push(link);
      }
    }

    employee.socialLinks = newLinks;
    await employee.save();
    res.status(200).json({});
  } catch (err) {
    return res.status(500).json({
      errors: { common: { msg: err.message } },
    });
  }
};

// Rnak add Or Update
const rankAddOrUpdate = async (req, res) => {
  try {
    const { createdAt, name, photo, _id, id } = req.body;

    // console.log(req.body);

    const employee = await EmployeeContact.findById(id);
    if (!employee) {
      return res.status(404).send("ID not found ");
    }

    if (_id === "") {
      // Add
      employee.ranks.push({
        createdAt,
        name,
        photo: req.file.location,
      });
    } else {
      // update
      employee.ranks = employee.ranks.map((x) => {
        if (String(x._id) === String(_id)) {
          x.name = name ? name : x.name;
          x.createdAt = createdAt ? createdAt : x.createdAt;

          if (req.file) {
            x.photo = req.file.location;
          }
          return x;
        } else {
          return x;
        }
      });
    }

    await employee.save();
    res.status(200).json({});
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      errors: { common: { msg: err.message } },
    });
  }
};
// Rnak Delete
const deleteRank = async (req, res) => {
  try {
    const { _id, employeeId } = req.body;

    const employee = await EmployeeContact.findById(employeeId);
    if (!employee) {
      return res.status(404).send("ID not found ");
    }

    employee.ranks = employee.ranks.filter(
      (x) => String(x._id) !== String(_id)
    );

    await employee.save();
    res.status(200).json({});
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      errors: { common: { msg: err.message } },
    });
  }
};

// File Add
const fileAddAndUpdate = async (req, res) => {
  try {
    const { _id, employeeId, createdAt, name } = req.body;
    const employee = await EmployeeContact.findById(employeeId);
    if (!employee) {
      return res.status(404).send("ID not found ");
    }

    if (_id === "") {
      // Add
      employee.files.push({
        title: name,
        file: req.file.location,
        createdAt: Date.now(),
      });
    }
    {
      employee.files = employee.files.map((x) => {
        if (String(x._id) === String(_id)) {
          x.title = name ? name : x.title;
          if (req.file) {
            x.file = req.file.location;
          }

          return x;
        }
        return x;
      });
    }

    await employee.save();
    res.status(200).json({});
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      errors: { common: { msg: err.message } },
    });
  }
};

// File Add
const deleteFile = async (req, res) => {
  try {
    const { _id, employeeId } = req.body;
    const employee = await EmployeeContact.findById(employeeId);
    if (!employee) {
      return res.status(404).send("ID not found ");
    }

    employee.files = employee.files.filter(
      (x) => String(x._id) !== String(_id)
    );

    await employee.save();
    res.status(200).json({});
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      errors: { common: { msg: err.message } },
    });
  }
};

// Update ===== >  Billing
const updateBillingAddress = async (req, res) => {
  try {
    // console.log(req.body);
    const {
      zipCode,
      state,
      street,
      city,
      country,
      email,
      phone,
      taxId,
      vatNo,
      addressLineOne,
      addressLineTwo,
      employeeId,
    } = req.body;

    const employee = await EmployeeContact.findById(employeeId);
    if (!employee) {
      return res.status(404).send("ID not found ");
    }

    employee.billingAddress = {
      email: email,
      phone: phone,
      taxId: taxId,
      vatNo: vatNo,
      addressLineOne: addressLineOne,
      addressLineTwo: addressLineTwo,
      zipCode: zipCode,
      state: state,
      street: street,
      city: city,
      country: country,
    };

    await employee.save();
    res.status(200).json({});
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      errors: { common: { msg: err.message } },
    });
  }
};

async function totalEmployee(req, res) {
  try {
    const employees = await EmployeeContact.countDocuments({
      userId: req.user._id,
      isDelete: false,
    });
    res.send(employees + "");
  } catch (error) {
    return res.status(404).send("data not found");
  }
}
async function activeEmployee(req, res) {
  try {
    const employees = await EmployeeContact.countDocuments({
      status: "active",
      userId: req.user._id,
      isDelete: false,
    });
    res.send(employees + "");
  } catch (error) {
    return res.status(404).send("data not found");
  }
}
async function internshipEmployee(req, res) {
  try {
    const employees = await EmployeeContact.countDocuments({
      isInternship: true,
      userId: req.user._id,
      isDelete: false,
    });
    res.send(employees + "");
  } catch (error) {
    return res.status(404).send("data not found");
  }
}
async function formerEmployee(req, res) {
  try {
    const employees = await EmployeeContact.countDocuments({
      isFormer: true,
      userId: req.user._id,
      isDelete: false,
    });
    res.send(employees + "");
  } catch (error) {
    return res.status(404).send("data not found");
  }
}

// Import Contacts
const importContactsFromArray = async (req, res) => {
  try {
    const { contacts } = req.body;

    if (contacts.length === 0) {
      return res.status(500).json({
        errors: { common: { msg: "Contact Length is 0" } },
      });
    }

    const formatedData = contacts.map((x) => ({
      ...x,
      userId: req.user._id,
      fullName: x[0],
      email: x[1],
      phone: x[2],
      type: x[3],
    }));

    await EmployeeContact.insertMany(formatedData);

    return res.status(200).send("Imported");
  } catch (err) {
    return res.status(500).json({
      errors: { common: { msg: err.message } },
    });
  }
};

// Desc Create New Position
// Route POST /employee-contact/position
// Access Public
const employeePosition = asyncHandler(async (req, res) => {
  const { position } = req.body;
  // console.log(position);

  const employeePosition = new EmployeePosition({
    userId: req.user.id ? req.user.id : req.user._id,
    position,
  });

  employeePosition.save((error, success) => {
    if (error) {
      throw Error(error);
    } else {
      return res.status(201).json({
        success: "employee position created",
      });
    }
  });
});

// Get All Positions

const getEmployeePositions = async (req, res) => {
  try {
    const { user } = req;
    const employeePositions = await EmployeePosition.find({
      userId: user._id,
    });

    return res.status(200).send(employeePositions);
  } catch (err) {
    return res.status(500).json({
      errors: { common: { msg: err.message } },
    });
  }
};

// Get All employees

const getAllEmployees = async (req, res) => {
  try {
    const allEmployees = await EmployeeContact.find();
    return res.status(200).send(allEmployees);
  } catch (err) {
    return res.status(500).json({
      errors: { common: { msg: err.message } },
    });
  }
};

// Delete one Position

const deleteEmployeePosition = async (req, res) => {
  try {
    const { id } = req.params;
    await EmployeePosition.deleteOne({ _id: id });

    return res.status(200).json({
      success: "Position deleted successfull",
    });
  } catch (err) {
    return res.status(500).json({
      errors: { common: { msg: err.message } },
    });
  }
};

// Put Lead Position Data
const putEmployeePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { position } = req.body;
    const filter = { _id: id };
    const options = { upsert: true };
    const updatedDoc = {
      $set: {
        position: position,
      },
    };
    await EmployeePosition.updateOne(filter, updatedDoc, options);

    return res.status(200).json({
      success: "Position edited successfully!",
    });
  } catch (err) {
    return res.status(500).json({
      errors: { common: { msg: err.message } },
    });
  }
};

module.exports = {
  contactList,
  contactAdd,
  contactById,
  updateContact,
  uploadAvatar,
  updateSocialLink,
  rankAddOrUpdate,
  deleteRank,
  fileAddAndUpdate,
  deleteFile,
  updateBillingAddress,
  totalEmployee,
  activeEmployee,
  internshipEmployee,
  formerEmployee,
  deleteContact,
  importContactsFromArray,
  employeePosition,
  getEmployeePositions,
  getAllEmployees,
  deleteEmployeePosition,
  putEmployeePosition
};
