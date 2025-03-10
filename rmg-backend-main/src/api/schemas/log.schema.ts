import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from 'mongoose';


@Schema({
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  })
  export class Log {
    @Prop({ type: Types.ObjectId, ref: 'Employee' })
    employer_id: Types.ObjectId;
    @Prop({type: Types.ObjectId, ref: 'Project'})
    project_id: Types.ObjectId;
    @Prop()
    log_time: number;
    @Prop()
    activity: string;
    @Prop({default: Date.now})
    date: Date;
    @Prop({type: Types.ObjectId, ref: 'Employee'})
    created_by: Types.ObjectId
    @Prop({type: Types.ObjectId, ref: 'Employee'})
    updated_by: Types.ObjectId
  }
  export const LogSchema = SchemaFactory.createForClass(Log);
