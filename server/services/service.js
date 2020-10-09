import { db } from '../app.js';
import { User } from '../models/user.js';
export const validateIncommingData = async (data, modelName) => {
  const user = new User(data);
  const invalidError = user.validateSync();
  if (invalidError) {
    return { status: 403, msgError: { success: false, msg: `Invalid format for ${modelName}` } };
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
    return { status: 403, msgError: { success: false, msg: `Invalid format for ${modelName}` } };
  }
};

export const findAll = async (collectionName) => {
  const response = await db
    .collection(collectionName)
    .find({}).toArray();
  return response;
};

export const findByUuid = async (collectionName, userUuid) => {
  const response = await db
    .collection(collectionName)
    .findOne({ uuid: userUuid });
  if (!response) {
    return ({ status: 404, msgError: { success: false, msg: "ressource not found" } })
  }
  return response;
};
