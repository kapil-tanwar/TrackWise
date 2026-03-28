const User = require("../models/User");

const getMe = async (req, res) => {
  try {
    const includeArchived = req.query.includeArchived === "true";

    const user = await User.findById(req.user._id)
      .select("-password")
      .populate({
        path: "notes",
        match: includeArchived ? {} : { isArchived: false },
        options: { sort: { createdAt: -1 } },
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getMe,
};
