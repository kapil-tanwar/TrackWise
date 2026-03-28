const express = require("express");
const {
  createNote,
  getMyNotes,
  getSingleNote,
  updateNote,
  archiveNote,
  restoreNote,
  deleteNote,
} = require("../controllers/noteController");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

router.post("/", createNote);
router.get("/", getMyNotes);
router.get("/:id", getSingleNote);
router.patch("/:id", updateNote);
router.patch("/:id/archive", archiveNote);
router.patch("/:id/restore", restoreNote);
router.delete("/:id", deleteNote);

module.exports = router;
