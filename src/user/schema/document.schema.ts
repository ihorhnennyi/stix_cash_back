import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserDocument extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  fileId: string;

  @Prop({ required: true })
  webViewLink: string;
}

export const UserDocumentSchema = SchemaFactory.createForClass(UserDocument);
