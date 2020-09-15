import { db } from '../app.js';
export const validateAndSaveIncommingData = async (model, modelName) => {
  if (!model.validateSync()) {
    const response = await model.save();
    console.log(`${modelName} with datas: ${model} saved`);
    return response;
  } else {
    console.log('shit');
    return `Invalid format for ${modelName}`;
  }
};

export const validateAndUpdateNewData = async (
  oldModel,
  newModel,
  modelName,
  collectionName
) => {
  if (!newModel.validateSync()) {
    const response = await db
      .collection(collectionName)
      .findOneAndUpdate({ uuid: oldModel.uuid }, { $set: newModel });
    console.log(
      `${modelName} ${oldModel.uuid} updated with datas: ${newModel}`
    );
    return response;
  } else {
    return `Invalid format for ${modelName}`;
  }
};

export const findOne = async (collectionName, userUuid) => {
  const response = await db
    .collection(collectionName)
    .findOne({ uuid: userUuid });
  if (!response) {
    res.status(404).send('ressource not found');
  }
  return response;
};
