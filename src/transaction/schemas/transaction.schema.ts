import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../../user/schema/user.schema';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId;

  @Prop({ enum: ['deposit', 'withdrawal'], required: true })
  type: 'deposit' | 'withdrawal';

  @Prop({ type: String, required: true })
  amount: string;

  @Prop({ type: String })
  balance?: string;

  @Prop({ enum: ['USD', 'BTC'], required: true })
  currency: 'USD' | 'BTC';

  @Prop({
    enum: ['pending', 'completed', 'failed', 'canceled'],
    default: 'pending',
  })
  status: 'pending' | 'completed' | 'failed' | 'canceled';

  @Prop({ default: false })
  createdByAdmin: boolean;

  @Prop({
    type: String,
    enum: [
      'walletBTCAddress',
      'wireTransfer',
      'zelleTransfer',
      'paypalAddress',
    ],
  })
  method?:
    | 'walletBTCAddress'
    | 'wireTransfer'
    | 'zelleTransfer'
    | 'paypalAddress';

  @Prop({ type: String })
  note?: string;

  @Prop({ type: Date })
  date?: Date;

  @Prop({ type: String })
  transactionId?: string;

  @Prop({ type: Object })
  paymentDetails?: Record<string, any>;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
