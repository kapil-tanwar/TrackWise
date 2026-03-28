const mongoose = require("mongoose");
const Note = require("../models/Note");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "title is required",
      });
    }

    const note = await Note.create({
      title,
      content: content || "",
      owner: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Note created successfully",
      data: note,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyNotes = async (req, res) => {
  try {
    const includeArchived = req.query.includeArchived === "true";

    const query = {
      owner: req.user._id,
    };

    if (!includeArchived) {
      query.isArchived = false;
    }

    const notes = await Note.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSingleNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note id",
      });
    }

    const note = await Note.findOne({
      _id: id,
      owner: req.user._id,
    }).populate("owner", "name email");

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note id",
      });
    }

    const updates = {};

    if (typeof req.body.title !== "undefined") {
      updates.title = req.body.title;
    }
    if (typeof req.body.content !== "undefined") {
      updates.content = req.body.content;
    }
    if (typeof req.body.isArchived !== "undefined") {
      updates.isArchived = req.body.isArchived;
      updates.archivedAt = req.body.isArchived ? new Date() : null;
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      updates,
      { new: true, runValidators: true },
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note updated successfully",
      data: note,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const archiveNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note id",
      });
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      { isArchived: true, archivedAt: new Date() },
      { new: true },
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note archived successfully",
      data: note,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const restoreNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note id",
      });
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      { isArchived: false, archivedAt: null },
      { new: true },
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note restored successfully",
      data: note,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note id",
      });
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      { isArchived: true, archivedAt: new Date() },
      { new: true },
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note soft-deleted (archived) successfully",
      data: note,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createNote,
  getMyNotes,
  getSingleNote,
  updateNote,
  archiveNote,
  restoreNote,
  deleteNote,
};
