import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type UserFileDocument = UserFile & Document;

@Schema({ timestamps: true })
export class UserFile {
  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  user: Types.ObjectId;

  @Prop({
    required: true,
    description: "Original file name stored on the server",
  })
  name: string;

  @Prop({
    required: true,
    description: "Relative path to the file within user storage",
  })
  relPath: string;

  @Prop({
    required: true,
    description:
      "MIME type of the uploaded file (e.g. image/jpeg, application/pdf)",
  })
  mime: string;

  @Prop({
    required: true,
    description: "File size in bytes",
  })
  size: number;
}

export const UserFileSchema = SchemaFactory.createForClass(UserFile);
