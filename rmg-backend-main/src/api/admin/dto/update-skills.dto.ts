import { Types } from "mongoose";

export class UpdateSkillsDto {
    readonly name?: string;
    readonly is_Active?: boolean;
    readonly skill_code?: string;
    readonly version?: number;
    readonly category?: Types.ObjectId;
    readonly skill_type?: Types.ObjectId;
  }
  