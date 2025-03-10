import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from 'mongoose';


@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})
export class Admin {
    @Prop()
    name: string
    @Prop({unique: true, sparse: true})
    email: string
    @Prop({select:false})
    password: string
    @Prop({select:false})
    salt: string
    @Prop()
    country_code: string
    @Prop()
    mobile: string
    @Prop({enum: ['active', 'disabled', 'archived']})
    is_active: string;
    @Prop({type: Types.ObjectId, ref: 'Admin'})
    created_by: Types.ObjectId
    @Prop({type: Types.ObjectId, ref: 'Admin'})
    updated_by: Types.ObjectId
    @Prop({enum: [true, false]})
    is_primary: boolean;
    @Prop({ type: Date, default: null })
    password_update_date: Date;

}
export const AdminSchema = SchemaFactory.createForClass(Admin)