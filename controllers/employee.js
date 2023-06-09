const mongoose = require("mongoose");
const { Employee } = require("../models");

exports.newEmployee = async (req, res) => {
  const {
    fullName,
    email,
    phone,
    photo,
    gender,
    address,
    socialLinks,
    note,
    tags,
    dob,
    ranks,
    salary,
  } = req.body;
  const { user } = req;

  try {
    const employee = new Employee({
      userId: user._id,
      fullName,
      email,
      phone,
      photo,
      gender,
      address,
      socialLinks,
      note,
      tags,
      dob,
      ranks,
      salary,
    });

    await employee.save();

    return res.status(201).json({
      success: "New employee created successful",
    });
  } catch (error) {
    return res.status(500).json({
      errors: { common: { msg: error } },
    });
  }
};

exports.updateEmployee = async (req, res) => {
  const {
    fullName,
    email,
    phone,
    photo,
    gender,
    address,
    socialLinks,
    status,
    note,
    tags,
    dob,
    type,
    ranks,
    salary,
    isFormer,
    isinternship,
  } = req.body;
  const { id } = req.params;

  try {
    const employee = await Employee.findOne({ _id: id, isDelete: false });

    if (!employee) {
      return res.status(404).json({
        errors: { common: { msg: "No employee data found" } },
      });
    }

    employee.fullName = fullName ? fullName : employee.fullName;
    employee.email = email ? email : employee.email;
    employee.phone = phone ? phone : employee.phone;
    employee.photo = photo ? photo : employee.photo;
    employee.gender = gender ? gender : employee.gender;
    employee.address = address ? address : employee.address;
    employee.socialLinks = socialLinks ? socialLinks : employee.socialLinks;
    employee.status = status ? status : employee.status;
    employee.note = note ? note : employee.note;
    employee.tags = tags ? tags : employee.tags;
    employee.dob = dob ? dob : employee.dob;
    employee.type = type ? type : employee.type;
    employee.ranks = ranks ? ranks : employee.ranks;
    employee.salary = salary ? salary : employee.salary;
    employee.isFormer = isFormer ? isFormer : employee.isFormer;
    employee.isinternship = isinternship ? isinternship : employee.isinternship;

    await employee.save();

    return res.status(200).json({
      success: "Employee updated successful",
    });
  } catch (error) {
    return res.status(500).json({
      errors: { common: { msg: error } },
    });
  }
};

exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const employee = await Employee.findOne({ _id: id, isDelete: false });

    if (!employee) {
      return res.status(404).json({
        errors: { common: { msg: "No employee data found" } },
      });
    }

    employee.isDelete = true;
    await employee.save();

    return res.status(200).json({
      success: "Employee deleted successful",
    });
  } catch (error) {
    return res.status(500).json({
      errors: { common: { msg: error } },
    });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    let { pageSize, page } = req.query;
    page = parseInt(page) || 1;
    pageSize = parseInt(pageSize) || 10;
    const skip = (page - 1) * pageSize;
    const { user } = req;

    const employee = await Employee.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(user._id),
          isDelete: false,
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }, { $addFields: { page } }],
          data: [{ $skip: skip }, { $limit: pageSize }],
        },
      },
    ]);

    const data = {
      list: employee.length > 0 ? employee[0].data : [],
      total:
        employee[0].metadata.length > 0 ? employee[0].metadata[0].total : 0,
      noOfPage:
        employee[0].metadata.length > 0 ? employee[0].metadata[0].page : 0,
    };

    res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      errors: { common: { msg: err.message } },
    });
  }
};

exports.getEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const employee = await Employee.findOne({ _id: id, isDelete: false });
    if (!employee) {
      return res.status(500).json({
        message: "No employee data found",
      });
    }
    res.status(200).json(employee);
  } catch (error) {
    return res.status(500).json({
      errors: { common: { msg: error } },
    });
  }
};
