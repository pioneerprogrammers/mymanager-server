const Temp = require("./Temp");
const UserToken = require("./UserToken");
const Authenticate = require("./Authenticate");
const Admin = require("./Admin");
const AEmployee = require("./AEmployee");
const User = require("./User");
const UEmployee = require("./UEmployee");
const ClientContact = require("./ClientContact");
const ClientPosition = require("./ClientPosition");
const LeadPosition = require("./LeadPosition");
const VendorPosition = require("./VendorPosition");
const TaskContact = require("./TaskContact");
const Project = require("./Project");
const Task = require("./Tasks");
const Employee = require("./Employee");
const EmployeeContact = require("./EmployeeContact");
const EmployeePosition = require("./EmployeePosition");
const CheckList = require("./CheckList");
const { ScheduleCheckList, ScheduleTask } = require("./CheckListAns");
const ResetPass = require("./resetPass");
const MenuData = require("./MenuData");

//NLM
const NLM_Admin = require("./NLM_Admin");

const models = {
  //Client
  Authenticate,
  Admin,
  AEmployee,
  User,
  UEmployee,
  Temp,
  ClientContact,
  ClientPosition,
  LeadPosition,
  VendorPosition,
  UserToken,
  TaskContact,
  Project,
  Task,
  Employee,
  EmployeeContact,
  EmployeePosition,
  CheckList,
  ScheduleCheckList,
  ScheduleTask,
  ResetPass,
  MenuData,
  //NLM Admin
  NLM_Admin,
};

module.exports = models;
