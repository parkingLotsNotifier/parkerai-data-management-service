const Slot = require("./Slot");
const Coordinate = require("./Coordinate");

class Document {
  #_filename = null;
  #_slots = [];
  #_datetime = null;
  #_parkingName = null;

  constructor(filename, rois, avgs, lstOfDictLotNameBbox, parkingName) {
    this.#_filename = filename;
    for (let i = 0; i < lstOfDictLotNameBbox.length; i++) {
      let coordinate = new Coordinate(...lstOfDictLotNameBbox[i].bbox);
      let slot = new Slot(
        lstOfDictLotNameBbox[i].lotName,
        coordinate,
        "",
        rois[i],
        avgs[i]
      ); // Pass empty string for croppedFilename
      this.addSlot(slot);
    }
    this.#_parkingName = parkingName;
  }

  toString() {
    const slotsStr = this.#_slots.map((slot) => slot.toString());
    const obj = {
      fileName: this.#_filename,
      slots: slotsStr,
      parkingName: this.#_parkingName,
    };
    return JSON.stringify(obj, null, 2);
  }

  get slots() {
    return this.#_slots;
  }

  get datetime() {
    return this.#_datetime;
  }

  get filename() {
    return this.#_filename;
  }

  set datetime(datetime) {
    this.#_datetime = datetime;
  }

  addSlot(slot) {
    this.#_slots.push(slot);
  }

  cpPredictOldToNew(oldDoc, index, slot) {
    if (oldDoc.slots[index] && oldDoc.slots[index].prediction) {
      slot.prediction = oldDoc.slots[index].prediction;
    }
  }

  cpPredictOldToNewBeforeStore(oldDoc) {
    if (oldDoc != undefined) {
      this.slots.forEach((slot, index) => {
        if (slot.toPredict === null || slot.toPredict === false) {
          this.cpPredictOldToNew(oldDoc, index, slot);
        }
      });
    }
  }

  compareAverageIntensity(oldMessage, threshold) {
    if (
      !oldMessage ||
      !Array.isArray(oldMessage.slots) ||
      !Array.isArray(this.slots)
    ) {
      throw new Error("Invalid messages provided.");
    }
    if (oldMessage.slots.length !== this.slots.length) {
      throw new Error(
        "Mismatch in number of slots between old and new messages."
      );
    }
    for (let i = 0; i < oldMessage.slots.length; i++) {
      const oldSlot = oldMessage.slots[i];
      const newSlot = this.slots[i];
      newSlot.toPredict =
        Math.abs(oldSlot.averageIntensity - newSlot.averageIntensity) >
        threshold
          ? true
          : false;
    }
    return this;
  }

  initSlotPredictions(predictions) {
    predictions.forEach((prediction) => {
      this.slots[prediction.index].prediction = prediction.prediction;
    });
  }

  toJSON() {
    return {
      filename: this.#_filename,
      slots: this.#_slots.map((slot) => slot.toJSON()),
      datetime: this.#_datetime,
      parkingName: this.#_parkingName,
    };
  }
}

module.exports = Document;
