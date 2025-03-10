import * as _ from 'lodash';
import { Types } from 'mongoose';

export const transformFilters = async (obj: any): Promise<any> => {
    if (_.isArray(obj)) {
        return Promise.all(obj.map(transformFilters));
    } else if (_.isPlainObject(obj)) {
        const transformedObject: { [key: string]: any } = {};
        for (const key in obj) {
            if (['skill_id'].includes(key) && _.isPlainObject(obj[key])) {
                const innerObject = obj[key];
                for (const innerKey in innerObject) {
                    const newKey = `${key}.${innerKey}`;
                    transformedObject[newKey] = await transformFilters(innerObject[innerKey]);
                }
            } else {
                transformedObject[key] = await transformFilters(obj[key]);
            }
        }
        return transformedObject;
    }
    return obj;
};

const convertToObjectIdArray = async (ids: string[]): Promise<Types.ObjectId[]> => {
  return ids.map(id => new Types.ObjectId(id));
};

export const processInput = async (body: any, fieldsToConvert: string[]): Promise<any> => {
  const filterInput: any = {};

  for (const field of fieldsToConvert) {
    if (body[field]) {
      if (Array.isArray(body[field]) && body[field].length > 0) {
        if (field === 'skill_name') {
          // For skill_name, use regex for partial match (case-insensitive)
          filterInput[field] = { $regex: body[field][0], $options: 'i' };
        } else if (['experience', 'is_active'].includes(field)) {
          // For fields like experience or status, apply $in filter
          filterInput[field] = { $in: body[field] };
        } else {
          // Convert to ObjectId array for fields requiring references
          filterInput[field] = { $in: await convertToObjectIdArray(body[field]) };
        }
      }
    }
  }

  // Additional specific filters
  if (body.experience_low && body.experience_high) {
    filterInput.experience = {
      $gte: body.experience_low,
      $lte: body.experience_high,
    };
  }

  if (body.status && typeof body.status === 'string') {
    filterInput.status = body.status.toLowerCase() === 'active' ? 'active' : 'inactive';
  }

  return filterInput;
};
