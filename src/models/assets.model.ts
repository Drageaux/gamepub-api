import { model, Schema, Document } from 'mongoose';
import { Asset } from '@/interfaces/asset.interface';
import { customAlphabet } from 'nanoid';

const assetSchema: Schema = new Schema({
  puid: {
    type: String,
    default: () => customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8)(),
  },
  creator: { type: String, required: true },
  githubRepo: { type: String, required: true },
  displayName: { type: String, min: 3, max: 100, required: true, trim: true },
  slug: { type: String, max: 70, required: true },
  tags: [String],
  description: { type: String, trim: true },
  private: Boolean,
});

const assetModel = model<Asset & Document>('Asset', assetSchema);

export default assetModel;
