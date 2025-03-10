
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from 'mongoose';



@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})
export class Skill {
    @Prop()
    name: string
    @Prop({ type: Types.ObjectId, ref: 'Category' })
    category: Types.ObjectId;
    @Prop()
    is_Active: boolean;
    @Prop()
    version : number
    @Prop({type: Types.ObjectId, ref: 'Master'})
    skill_type: Types.ObjectId
    @Prop({type: String, required: true, maxlength: 10,minlength: 2,trim: true})
    skills_code: string;
    // @Prop({ type: Types.ObjectId, ref: 'skill_type' })
    // skill_type: Types.ObjectId;
    @Prop()
    is_active: boolean;
    @Prop({type: Types.ObjectId, ref: 'Admin'})
    created_by: Types.ObjectId
    @Prop({type: Types.ObjectId, ref: 'Admin'})
    updated_by: Types.ObjectId

}
export const SkillSchema = SchemaFactory.createForClass(Skill)