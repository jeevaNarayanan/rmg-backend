import { Types } from "mongoose";

export class UpdateCategoryDto {
    readonly name?: string;
    readonly is_active?: boolean;
    // readonly category_code?: string;
  }
  