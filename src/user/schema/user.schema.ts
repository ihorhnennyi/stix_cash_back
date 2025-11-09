import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as fs from 'fs/promises'
import { Document, Types } from 'mongoose'
import * as path from 'path'

export type UserDocument = User & Document & { _id: Types.ObjectId }

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string

  @Prop({ required: true })
  lastName: string

  @Prop({ required: true, unique: true, index: true })
  email: string

  @Prop({ required: true })
  phone: string

  @Prop({ required: true })
  country: string

  @Prop({ required: true })
  password: string

  @Prop({ required: true })
  isTermsAccepted: boolean

  @Prop({ type: [String], default: ['user'] })
  roles: string[]

  @Prop({ type: Boolean, default: false })
  emailVerified: boolean

  @Prop({ type: Date, default: null })
  emailVerifiedAt: Date | null

  @Prop({
    type: String,
    enum: ['unverified', 'pending', 'verified'],
    default: 'unverified'
  })
  kycStatus: 'unverified' | 'pending' | 'verified'

  @Prop({ type: String, default: '0' })
  balance: string

  @Prop({ type: String, default: '0' })
  balanceBTC: string

  @Prop({ default: false })
  showBTCBalance: boolean

  @Prop({ default: false })
  isTransactionAllowed: boolean

  @Prop({
    type: [
      {
        date: { type: Date, default: Date.now },
        type: { type: String, enum: ['deposit', 'withdrawal'], required: true },
        amount: { type: String, required: true },
        currency: { type: String, enum: ['USD', 'BTC'], required: true },
        status: { type: String, enum: ['pending', 'completed', 'failed'], required: true }
      }
    ],
    default: []
  })
  transactions: {
    date: Date
    type: 'deposit' | 'withdrawal'
    amount: string
    currency: 'USD' | 'BTC'
    status: 'pending' | 'completed' | 'failed'
  }[]

  @Prop({ default: '' })
  walletBTCAddress: string

  @Prop({ default: '' })
  paypalAddress: string

  @Prop({
    type: {
      firstName: { type: String, default: '' },
      lastName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      routingNumber: { type: String, default: '' },
      bankName: { type: String, default: '' },
      address: { type: String, default: '' }
    },
    default: {}
  })
  wireTransfer: {
    firstName: string
    lastName: string
    accountNumber: string
    routingNumber: string
    bankName: string
    address: string
  }

  @Prop({
    type: {
      recipientName: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' }
    },
    default: {}
  })
  zelleTransfer: {
    recipientName: string
    email: string
    phone: string
  }

  @Prop({ default: '' })
  backendFolderPath: string

  @Prop({ default: '' })
  merchantAddress: string
}

export const UserSchema = SchemaFactory.createForClass(User)

UserSchema.pre('save', async function (next) {
  try {
    const doc = this as UserDocument & { verificationStatus?: string }

    // --- Мягкая миграция со старого поля ---
    if (!doc.kycStatus && doc.verificationStatus) {
      // переносим старое значение в новое поле
      const v = doc.verificationStatus
      if (v === 'unverified' || v === 'pending' || v === 'verified') {
        // @ts-ignore — присваиваем на лету
        doc.kycStatus = v
      }
      // @ts-ignore — подчистим в рантайме
      doc.verificationStatus = undefined
    }

    const root = process.env.USER_FILES_ROOT || path.resolve(process.cwd(), 'storage/users')
    const userDir = path.join(root, doc._id.toString())
    await fs.mkdir(userDir, { recursive: true })

    if (!doc.backendFolderPath || doc.backendFolderPath !== userDir) {
      doc.backendFolderPath = userDir
    }

    next()
  } catch (e) {
    console.error('[UserSchema] create dir error:', e)
    next()
  }
})
