import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { decimal128ToNumber } from 'src/utils/decimal128ToNumber';

export type UserDocument = User & Document & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, default: false })
  isTermsAccepted: boolean;

  @Prop({ type: [String], default: ['user'] })
  roles: string[];

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ type: [String], default: [] })
  documents: string[];

  @Prop({ default: '' })
  googleDriveFolderId: string;

  @Prop({ type: SchemaTypes.Decimal128, default: 0 })
  balance: any;

  @Prop({ type: SchemaTypes.Decimal128, default: 0 })
  balanceBTC: any;

  @Prop({ default: false })
  showBTCBalance: boolean;

  @Prop({
    type: [
      {
        date: { type: Date, default: Date.now },
        type: { type: String, enum: ['deposit', 'withdrawal'], required: true },
        amount: { type: Number, required: true },
        currency: { type: String, enum: ['USD', 'BTC'], required: true },
        status: {
          type: String,
          enum: ['pending', 'completed', 'failed'],
          required: true,
        },
      },
    ],
    default: [],
  })
  transactions: {
    date: Date;
    type: 'deposit' | 'withdrawal';
    amount: number;
    currency: 'USD' | 'BTC';
    status: 'pending' | 'completed' | 'failed';
  }[];

  @Prop({ default: '' })
  walletBTCAddress: string;

  @Prop({ default: '' })
  paypalAddress: string;

  @Prop({
    type: {
      firstName: { type: String, default: '' },
      lastName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      routingNumber: { type: String, default: '' },
      bankName: { type: String, default: '' },
      address: { type: String, default: '' },
    },
    default: {},
  })
  wireTransfer: {
    firstName: string;
    lastName: string;
    accountNumber: string;
    routingNumber: string;
    bankName: string;
    address: string;
  };

  @Prop({
    type: {
      recipientName: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    default: {},
  })
  zelleTransfer: {
    recipientName: string;
    email: string;
    phone: string;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    if (ret.balance && ret.balance._bsontype === 'Decimal128') {
      ret.balance = decimal128ToNumber(ret.balance);
    }

    if (ret.balanceBTC && ret.balanceBTC._bsontype === 'Decimal128') {
      ret.balanceBTC = decimal128ToNumber(ret.balanceBTC);
    }

    return ret;
  },
});
