import mongoose, { Schema, Model } from "mongoose";

export interface AttendanceRecord {
    staffId: string;
    firstName: string;
    lastName: string;
    designation: string;
    status: "Present" | "Absent";
}

export interface IAttendance {
    date: string; // YYYY-MM-DD
    records: AttendanceRecord[];
}

const AttendanceRecordSchema = new Schema<AttendanceRecord>(
    {
        staffId: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        designation: { type: String, required: true },
        status: { type: String, enum: ["Present", "Absent"], default: "Present" },
    },
    { _id: false }
);

const AttendanceSchema = new Schema<IAttendance>(
    {
        date: { type: String, required: true, unique: true },
        records: [AttendanceRecordSchema],
    },
    { timestamps: true }
);

const Attendance: Model<IAttendance> =
    mongoose.models.Attendance ||
    mongoose.model<IAttendance>("Attendance", AttendanceSchema);

export default Attendance;
