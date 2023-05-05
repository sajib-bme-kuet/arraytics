const router = require("express").Router();
// const User = require("../models/User");
const Item = require("../models/Item");

const verifyToken = require("../middlewares/verifier");
//CREATE Item
router.post("/", verifyToken, async (req, res) => {
  const newItem = new Item({
    ...req.body,
    created_by: req.user._id,
  });
  try {
    const savedItem = await newItem.save();
    res.status(200).json(savedItem);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE Item
router.patch("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    try {
      const updatedItem = await Item.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedItem);
    } catch (err) {
      res.status(500).json(err);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE ITEM
router.delete("/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);

    res.status(200).json("Item has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET Item
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL Items
router.get("/", verifyToken, async (req, res) => {
  try {
    const allItem = await Item.find().populate("created_by", "name");

    res.status(200).json(allItem);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
