const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const cameraRoutes = require("./routes/cameraRoutes");
const parkingLotRoutes = require("./routes/parkingLotRoutes");
const documentRoutes = require("./routes/documentRoutes");
const userRoutes = require("./routes/userRoutes");
const {
  DB_USERNAME,
  DB_PASSWORD,
  DB_HOST,
  DATA_MANAGEMENT_SERVICE_PORT: DATA_MANAGMENT_SERVICE_PORT,
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} = require("./configs/env");
const { connectMongoDB, connectFirebase } = require("./configs/database");
const multer = require("multer");

connectMongoDB(DB_USERNAME, DB_PASSWORD, DB_HOST).then(() => {
  // Initialize Firebase Storage
  connectFirebase(
    FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID
  );

  const app = express();
  // CORS configuration
  app.use(
    cors({
      origin: "http://localhost:3002",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allow standard HTTP methods
      allowedHeaders: "Content-Type,Authorization", // Allow specific headers
      credentials: true, // Allow credentials like cookies
      exposedHeaders: ["Authorization"], // Expose additional headers if needed
      maxAge: 600, // Cache the preflight request for 10 minutes
    })
  );
  // middleware
  app.use(cookieParser());

  // Use user management routes
  app.use("/data-management/user", userRoutes);

  app.use(express.json({ limit: "10mb" })); // Set max request size to 10MB

  // Use camera management routes
  app.use("/data-management/camera", cameraRoutes);

  // Use parking lot management routes
  app.use("/data-management/parkingLot", parkingLotRoutes);

  // Use document management routes
  app.use("/data-management/document", documentRoutes);



  // Start the service
  app.listen(DATA_MANAGMENT_SERVICE_PORT, "0.0.0.0", () => {
    console.log(
      `Data Management Service is running on port ${DATA_MANAGMENT_SERVICE_PORT}`
    );
  });
});
