import mongoose, { Document, Schema } from 'mongoose';

export interface ITimesheetEntry {
  id: string;
  title: string;
  from: string;
  to: string;
  color: number;
  notes: string;
}

export interface IDaySheet extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  /** "YYYY-MM-DD" */
  date: string;
  entries: ITimesheetEntry[];
  updatedAt: Date;
}

const entrySchema = new Schema<ITimesheetEntry>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    from: {
      type: String,
      required: true,
      match: /^\d{2}:\d{2}$/,
    },
    to: {
      type: String,
      required: true,
      match: /^\d{2}:\d{2}$/,
    },
    color: { type: Number, required: true, min: 0, max: 9 },
    notes: { type: String, default: '', maxlength: 1000 },
  },
  { _id: false },
);

const daySheetSchema = new Schema<IDaySheet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    entries: { type: [entrySchema], default: [] },
  },
  { timestamps: true },
);

// Unique sheet per user per day
daySheetSchema.index({ userId: 1, date: 1 }, { unique: true });

daySheetSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret['__v'];
    return ret;
  },
});

export const DaySheetModel = mongoose.model<IDaySheet>('DaySheet', daySheetSchema);
