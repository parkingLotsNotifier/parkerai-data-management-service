const mongoose = require(`mongoose`);
const { initializeApp } = require("firebase/app");
const { getStorage } = require("firebase/storage");

let firebaseStorage;

const connectMongoDB = async (username, password, host) => {
  const uri = `mongodb+srv://${username}:${password}@${host}?retryWrites=true&w=majority`;
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  mongoose.set("strictQuery", true);
  console.log(`connected to database`);
};

const connectFirebase = async (
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId
) => {
  const app = initializeApp({
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId,
  });
  firebaseStorage = getStorage(app);
  return firebaseStorage;
};

const getStorageInstance = () => {
  if (!firebaseStorage) {
    throw new Error(
      "Firebase storage is not initialized. Call connect() first."
    );
  }
  return firebaseStorage;
};

module.exports = { connectMongoDB, connectFirebase, getStorageInstance };
