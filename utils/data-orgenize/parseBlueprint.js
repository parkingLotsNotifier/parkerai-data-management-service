function parseBlueprint(blueprint, categoryNameToBbox) {
  const documentData = {
    file_name: blueprint.images[0].file_name,
    slots: categoryNameToBbox.map((bbox) => ({
      lot_name: bbox.lotName,
      coordinate: {
        x1: bbox.bbox[0],
        y1: bbox.bbox[1],
        w: bbox.bbox[2],
        h: bbox.bbox[3],
      },
      roi: null,
      prediction: null,
      average_intensity: 0,
      variants: []
    })),
  };

  return documentData;
}

module.exports = {
  parseBlueprint,
};
