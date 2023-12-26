import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cors from "cors";
const { Schema } = mongoose;

const app = express();
const port = 4000;
const privateKey = "salamilkin";

app.use(express.json());
app.use(cors());

const UserSchema = new Schema({
  userName: String,
  role: String,
  password: String,
});

const User = mongoose.model("User", UserSchema);

app.get("/", async (req, res) => {
  const data = await User.find({});
  res.send(data);
});

app.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await User.findById(id).exec();
    const token = jwt.sign(
      { userName: data.userName, role: data.role },
      privateKey
    );
    res.send(token);    
  } catch (error) {
    res.status(404).send("User is Not Found");
  }
});

app.post("/register", async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const data = new User({
      userName: req.body.userName,
      role: req.body.role,
      password: hash,
    });
    await data.save();
    const token = jwt.sign(
      { userName: data.userName, role: data.role },
      privateKey
    );
    res.status(200).send(token);
  } catch (error) {
    res.status(404).send(error);
  }
});

app.delete("/:id", async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, privateKey);
    if (decoded) {
      const { id } = req.params;
      const data = await User.findByIdAndDelete(id).exec();
      res.send(data);
    }
  } catch (error) {
    res.status(404).send("Not deleted");
  }
});

// --------------------login---------------------

app.post("/login", async (req, res) => {
  try {
    const { userName, password } = req.body;
    if (!userName || !password) {
      res.status(404).send("Not fill");
      return;
    }
    const user = await User.findOne({ userName: userName });
    if (!user) {
      res.status(404).send("User not found");
      return;
    }
    console.log(password);
    const isPassValid = await bcrypt.compare(password, user.password)
    if (!isPassValid) {
      res.status(404).send("User password wrong");
      return;
    }
    const token = jwt.sign(
      { userName: user.userName, role: user.role },
      privateKey
    );
    res.send(token);
  } catch (error) {
    res.status(404).send(error);
  }
});

mongoose
  .connect("mongodb+srv://AliIsmayil:ali123@cluster0.tzldidp.mongodb.net/")
  .then(() => console.log("Connected!"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
