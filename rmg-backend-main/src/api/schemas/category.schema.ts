import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from 'mongoose';


@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})
export class Category {
    @Prop()
    name: string
    @Prop({enum: [true, false]})
    is_active: boolean;
    // @Prop({ type: [{ type: Types.ObjectId, ref: 'skill' }] })
    // skill: Types.ObjectId[];
    // @Prop({type: String, required: true, maxlength: 10,minlength: 1,trim: true})
    // category_code: string;
    @Prop({type: Types.ObjectId, ref: 'Admin'})
    created_by: Types.ObjectId
    @Prop({type: Types.ObjectId, ref: 'Admin'})
    updated_by: Types.ObjectId
    

}
export const CategorySchema = SchemaFactory.createForClass(Category)