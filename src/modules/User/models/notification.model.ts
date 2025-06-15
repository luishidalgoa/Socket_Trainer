import { Schema, model, Document } from 'mongoose';

export interface INotification extends Document {
    username: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'trade' | 'system'; // puedes extender esto
    read?: boolean;
    redirectTo?: string; // URL opcional para redirigir al usuario
}

const NotificationSchema = new Schema<INotification>({
    username: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'warning', 'error', 'trade', 'system'], default: 'info' },
    read: { type: Boolean,required:true, default: false },
    redirectTo: { type: String, required: false }
});

export const NotificationModel = model<INotification>('User_Notification', NotificationSchema);
