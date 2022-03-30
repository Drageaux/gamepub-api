import { model, Schema, Document } from 'mongoose';
import { Asset } from '@/interfaces/asset.interface';

const assetSchema: Schema = new Schema({
  creator: { type: String, required: true },
  githubRepo: { type: String, required: true },
  displayName: { type: String, min: 3, max: 100 },
  tags: [String],
  description: String,
  private: Boolean,
});
// .index({ creator: 1, name: 1 }, { unique: true });

const assetModel = model<Asset & Document>('Asset', assetSchema);

export default assetModel;
