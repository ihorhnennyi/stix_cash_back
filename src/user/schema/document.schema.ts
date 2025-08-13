import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserFileDocument = UserFile & Document;

@Schema({ timestamps: true })
export class UserFile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  relPath: string;

  @Prop({ required: true })
  mime: string;

  @Prop({ required: true })
  size: number;
}

export const UserFileSchema = SchemaFactory.createForClass(UserFile);
