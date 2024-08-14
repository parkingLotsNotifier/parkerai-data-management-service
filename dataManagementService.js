const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const cameraRoutes = require('./routes/cameraRoutes');
const parkingLotRoutes = require('./routes/parkingLotRoutes');
const documentRoutes = require('./routes/documentRoutes');
const userRoutes = require('./routes/userRoutes');
const { DB_USERNAME, DB_PASSWORD, DB_HOST, DATA_MANAGEMENT_SERVICE_PORT } = require('./configs/env');
const database = require('./configs/database');

database.connect(DB_USERNAME, DB_PASSWORD, DB_HOST).then(() => {
  const app = express();
  app.use(cors());

  // middleware
  app.use(express.json());
  app.use(cookieParser());

  // Use camera management routes
  app.use('/data-management/camera', cameraRoutes);

  // Use parking lot management routes
  app.use('/data-management/parking-lot', parkingLotRoutes);

  // Use document management routes
  app.use('/data-management/document', documentRoutes);

  // Use user management routes
  app.use('/data-management/user', userRoutes);

  // Start the service
  app.listen(DATA_MANAGEMENT_SERVICE_PORT,'0.0.0.0', () => {
    console.log(`user Management Service is running on port ${DATA_MANAGEMENT_SERVICE_PORT}`);
  });
});
