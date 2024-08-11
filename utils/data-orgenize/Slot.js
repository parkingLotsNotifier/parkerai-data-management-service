const Coordinate = require("./Coordinate");

class Slot {
  #_lotName = null;
  #_coordinate = null;
  #_croppedFilename = ""; // Initialize as an empty string
  #_roi = null;
  #_prediction = null;
  #_averageIntensity = null;
  #_toPredict = null;

  constructor(lotName, coordinate, croppedFilename = "", roi, avg) {
    // Default value for croppedFilename is an empty string
    this.#_lotName = lotName;
    this.#_coordinate = coordinate;
    this.#_croppedFilename = croppedFilename; // This will be empty unless provided
    this.#_roi = roi;
    this.#_prediction = null;
    this.#_averageIntensity = avg;
    this.#_toPredict = null;
  }

  toString() {
    const obj = {
      lotName: this.#_lotName,
      coordinate: this.#_coordinate.toString(),
      fileName: this.#_croppedFilename,
      prediction: this.#_prediction,
      averageIntensity: this.#_averageIntensity,
      toPredict: this.#_toPredict,
    };
    return JSON.stringify(obj);
  }

  get lotName() {
    return this.#_lotName;
  }

  set lotName(value) {
    this.#_lotName = value;
  }

  get croppedFilename() {
    return this.#_croppedFilename;
  }

  set croppedFilename(value) {
    this.#_croppedFilename = value;
  }

  get roi() {
    return this.#_roi;
  }

  set roi(value) {
    this.#_roi = value;
  }

  get coordinate() {
    return this.#_coordinate;
  }

  set coordinate(value) {
    this.#_coordinate = new Coordinate(...value);
  }

  get prediction() {
    return this.#_prediction;
  }

  set prediction(value) {
    this.#_prediction = value;
  }

  get averageIntensity() {
    return this.#_averageIntensity;
  }

  set averageIntensity(value) {
    this.#_averageIntensity = value;
  }

  get toPredict() {
    return this.#_toPredict;
  }

  set toPredict(value) {
    this.#_toPredict = value;
  }

  toJSON() {
    return {
      lotName: this.#_lotName,
      coordinate: this.#_coordinate.toJSON(),
      fileName: this.#_croppedFilename,
      prediction: this.#_prediction,
      averageIntensity: this.#_averageIntensity,
      toPredict: this.#_toPredict,
    };
  }
}

module.exports = Slot;
