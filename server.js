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
    console.log("connection successful");
  } catch {
    console.log("Database connection failed");
    process.exit(1);
  }
};

const startServer = () => {
  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
  });

  // Handle unhandle rejection error
  process.on("unhandledRejection", (err) => {
    console.log(err.name, err.message);
    console.log("Unhandle Rejection! ... Server is shutting down...");
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle uncaught exception error
  process.on("uncaughtException", (err) => {
    console.log(err.name, err.message);
    console.log("Uncaught Exception! ... Server is shutting down...");
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
