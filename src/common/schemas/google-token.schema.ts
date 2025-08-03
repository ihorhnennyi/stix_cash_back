import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class GoogleToken {
  @Prop({ required: true })
  access_token: string;

  @Prop({ required: true })
  refresh_token: string;

  @Prop({ required: true })
  expiry_date: number;
}

export type GoogleTokenDocument = GoogleToken & Document;
export const GoogleTokenSchema = SchemaFactory.createForClass(GoogleToken);
