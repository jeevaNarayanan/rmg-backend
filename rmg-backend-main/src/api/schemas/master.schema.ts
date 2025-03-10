import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})
export class Master {
  @Prop()
  type: string
  @Prop()
  value: string
}

export const MasterSchema = SchemaFactory.createForClass(Master);
