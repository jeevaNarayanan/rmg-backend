import { ObjectId } from 'mongodb';

export interface Audit {
  user_id: ObjectId;
  related_to: 'Project';
  action: string;
  designation: string;
}
