import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from 'mongoose';


@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})
export class PrimaryContact{
    @Prop()
    name: string
    @Prop({ unique: true, sparse: true })
    email: string
    @Prop()
    mobile_number: number
}

export const PrimaryContactSchema = SchemaFactory.createForClass(PrimaryContact)



@Schema({
    timestamps :{
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})
export class ContactInformation{
    @Prop({ unique: true, sparse: true })
    account_email: string
    @Prop()
    account_number: number
    @Prop()
    address: string
}
export const ContactInformationSchema = SchemaFactory.createForClass(ContactInformation)



@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})
export class Account {
    @Prop()
    name: string
    @Prop({type: String, required: true, maxlength: 10,minlength: 1,trim: true})
    account_code : string
    @Prop({ type: [{ type: Types.ObjectId, ref: 'Project' }] })
    projects: Types.ObjectId[];
    @Prop({type: [PrimaryContact], default: []})
    primary_contact: PrimaryContact[]
    @Prop({type: [ContactInformation], default:[]})
    contact_information: ContactInformation []
    @Prop({enum:['Active', 'In-Active']})
    status: string;
    @Prop({ type: Date, default: null })
    status_update_date: Date;
    @Prop({type: Types.ObjectId, ref: 'Admin'})
    created_by: Types.ObjectId
    @Prop({type: Types.ObjectId, ref: 'Admin'})
    updated_by: Types.ObjectId

}
export const AccountSchema = SchemaFactory.createForClass(Account)