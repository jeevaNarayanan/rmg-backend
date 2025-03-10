import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from 'mongoose';


@Schema({
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  })
  export class MySkills {
    @Prop({ type: Types.ObjectId, ref: 'Skill' })
    skill_id: Types.ObjectId;
    @Prop()
    experience: number;
    @Prop({enum: ['active', 'disabled', ]})
    is_active: string;
    @Prop({ type: Date, default: null })
    last_updated: Date;
    @Prop({type: Types.ObjectId, ref: 'Admin'})
    created_by: Types.ObjectId
    @Prop({type: Types.ObjectId, ref: 'Admin'})
    updated_by: Types.ObjectId
  }
  export const MySkillsSchema = SchemaFactory.createForClass(MySkills);

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})
export class Employee {
    @Prop()
    first_name: string
    @Prop()
    last_name: string
    @Prop({unique: true, sparse: true})
    email: string
    @Prop()
    date_of_joined: Date
    @Prop()
    employer_id: string
    @Prop()
    country_code: number
    @Prop()
    mobile_number: number
    @Prop({select:false})
    password: string
    @Prop({select:false})
    salt: string
    @Prop()
    total_workExperience: number
    @Prop()
    gender: string
    @Prop()
    address: string
    @Prop({type: Types.ObjectId, ref: 'Project'})
    projects: Types.ObjectId []
    @Prop({type: [MySkillsSchema], default: []})
    my_skills: MySkills[]
    @Prop({enum: ['active', 'disabled', 'archived']})
    is_active: string;
    @Prop()
    profile: string
    @Prop({ enum: ['microsoft'] })
    provider: string;
    @Prop({type: Types.ObjectId, ref: 'Admin'})
    created_by: Types.ObjectId
    @Prop({type: Types.ObjectId, ref: 'Admin'})
    updated_by: Types.ObjectId
    @Prop({ type: Date, default: null })
    password_update_date: Date;

}
export const EmployeeSchema = SchemaFactory.createForClass(Employee)