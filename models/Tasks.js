const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "auth",
      required: true,
    },
    taskName: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    repeat: {
      type: Array,
      default: [],
      // insert days name of week [friday,sunday,wendesday,sunday] etc
    },
    allowAsNa: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("tasks", taskSchema);
