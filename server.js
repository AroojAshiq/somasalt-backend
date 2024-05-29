import express from "express";
import cors from "cors";
import { readdirSync } from "fs";
import mongoose from "mongoose";
import csrf from "csurf";
import cookieParser from "cookie-parser";
import { fatalErrorHandler, notFound } from "./middleware/errorMiddleware";
const route = require("./routes/auth");
const morgan = require("morgan");
require("dotenv").config();

const csrfProtection = csrf({ cookie: true });

// create express app
const app = express();
//db
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("*****DB CONNECTED******", process.env.MONGO_URI))
  .catch((err) => console.log("DB ERROR => ", err));

// apply middlewares
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(cookieParser());
app.use(morgan("dev"));


// route
readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));
// csrf
app.use(csrfProtection);

//middleware
// app.use(notFound)
// app.use(fatalErrorHandler)

app.get("/api/test", (req, res) => {
  res.json("The server is up!");
});

app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// port
const port = process.env.PORT || 8000;

const server = app.listen(port, () =>
  console.log(`Server is running on port ${port}`)
);

console.log(process.env.FRONTEND);
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log("USER ID SOCKET IO", userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
