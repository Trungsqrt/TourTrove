const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");

dotenv.config({ path: "./config.env" });

const connectDB = async () => {
  try {
    const DB = process.env.DATABASE.replace(
      "<PASSWORD>",
      process.env.DATABASE_PASSWORD
    );
    await mongoose.connect(DB);
    console.log("\x1b[38;5;34m", "Connection successful", "\x1b[0m");
  } catch {
    console.log("\x1b[38;5;9m", "Database connection failed", "\x1b[0m");
    process.exit(1);
  }
};

const startServer = () => {
  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => {
    console.log(
      `\x1b[0m\x1b[32m App running on port \x1b[37m\x1b[42m${port}\x1b[0m\x1b[32m...\x1b[0m`
    );
  });

  // Handle unhandle rejection error
  process.on("unhandledRejection", (err) => {
    console.log(err.name, err.message);
    console.log(
      "\x1b[43m",
      "Unhandle Rejection! ... Server is shutting down...",
      "\x1b[0m"
    );
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle uncaught exception error
  process.on("uncaughtException", (err) => {
    console.log(err.name, err.message);
    console.log(
      "\x1b[43m",
      "Uncaught Exception! ... Server is shutting down...",
      "\x1b[0m"
    );
    server.close(() => {
      process.exit(1);
    });
  });
};

const initializeApp = async () => {
  await connectDB();
  startServer();
};

initializeApp();
