import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as fs from 'fs/promises';
import { Document, Types } from 'mongoose';
import * as path from 'path';

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

  @Prop({
    type: String,
    enum: ['unverified', 'pending', 'verified'],
    default: 'unverified',
  })
  verificationStatus: 'unverified' | 'pending' | 'verified';

  @Prop({ type: String, default: '0' })
  balance: string;

  @Prop({ type: String, default: '0' })
  balanceBTC: string;

  @Prop({ default: false })
  showBTCBalance: boolean;

  @Prop({ default: false })
  isTransactionAllowed: boolean;

  @Prop({
    type: [
      {
        date: { type: Date, default: Date.now },
        type: { type: String, enum: ['deposit', 'withdrawal'], required: true },
        amount: { type: String, required: true },
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
    amount: string;
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

  @Prop({ default: '' })
  backendFolderPath: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.post('save', async function (doc: UserDocument, next) {
  try {
    const root =
      process.env.USER_FILES_ROOT ||
      path.resolve(process.cwd(), 'storage/users');

    const userDir = path.join(root, doc._id.toString());
    await fs.mkdir(userDir, { recursive: true });

    if ((doc as any).backendFolderPath !== userDir) {
      (doc as any).backendFolderPath = userDir;
      await doc.save({ validateModifiedOnly: true });
    }

    console.log('[UserSchema] created user dir:', userDir);
    next();
  } catch (e) {
    console.error('[UserSchema] create dir error:', e);
    next();
  }
});
