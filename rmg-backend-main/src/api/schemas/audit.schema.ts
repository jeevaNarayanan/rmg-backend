import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema(
    {
      timestamps: {
        createdAt: 'created_at', 
        updatedAt: 'updated_at' 
      }
    }
  )
  export class Audit {
    @Prop({type: Types.ObjectId,  ref: 'Admin'})
    user_id: Types.ObjectId
    @Prop({enum: ['Project']})
    related_to: string
    @Prop()
    action: string
    @Prop({enum: ['admin']})
    designation: string
    @Prop({type: Types.ObjectId, ref: 'Admin'})
    created_by: Types.ObjectId
  }
  
  export const AuditSchema = SchemaFactory.createForClass(Audit);