import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from 'mongoose';


@Schema({
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  })
  export class Members {
    @Prop({ type: Types.ObjectId, ref: 'Employee' })
    employer_id: Types.ObjectId;
    @Prop({type: Types.ObjectId, ref: 'Category'})
    role: Types.ObjectId;
    @Prop()
    allocated_hours: number;
    @Prop({default:0})
    burned_hours: number;
    @Prop()
    allocated_hours_per_day: number;
    @Prop({ required: true, default: Date.now })
    start_date: Date
    @Prop({ required: true })
    end_date: Date
    @Prop({enum: ['Active', 'In-Active']})
    status: string
    @Prop({type: Types.ObjectId, ref: 'Master'})
    employement_type:Types.ObjectId;
    @Prop({type: Types.ObjectId, ref: 'Admin'})
    created_by: Types.ObjectId
    @Prop({type: Types.ObjectId, ref: 'Admin'})
    updated_by: Types.ObjectId
  }
  export const MembersSchema = SchemaFactory.createForClass(Members);

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})
export class Project {
    @Prop()
    project_name: string
    @Prop()
    project_code: string
    @Prop({type: Types.ObjectId, ref: 'Account'})
    account:  Types.ObjectId
    @Prop({type: Types.ObjectId, ref: 'Master'})
    project_type: Types.ObjectId
    @Prop({type: Types.ObjectId, ref: 'Employee'})
    project_manager: Types.ObjectId
    @Prop({ required: true, default: Date.now })
    start_date: Date
    @Prop({ required: true })
    end_date: Date
    @Prop({enum: ['Active', 'Completed', 'On-Hold']})
    status: string
    @Prop()
    total_allocated_hours: number
    @Prop({default:0})
    total_hours_currently_used: number   //burned hours
    @Prop({type: Types.ObjectId, ref: 'Skill'})
    tech_stack: Types.ObjectId []
    @Prop({type: [MembersSchema], default: []})
    members: Members[]
    @Prop()
    percentage: Number
    @Prop({type: Types.ObjectId, ref: 'Admin'})
    created_by: Types.ObjectId
    @Prop({type: Types.ObjectId, ref: 'Admin'})
    updated_by: Types.ObjectId

}
export const ProjectSchema = SchemaFactory.createForClass(Project)