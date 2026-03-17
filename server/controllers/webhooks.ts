import { verifyWebhook } from "@clerk/express/webhooks"
import { Request, Response } from "express"
import User from "../models/User.js";

export const clerkWebhook = async (req: Request, res: Response) => {
    try {
        const evt = await verifyWebhook(req);

        if (evt.type === 'user.created' || evt.type === 'user.updated') {
            const user = await User.findOne({ clerkId: evt.data.id });

            // Chuẩn bị dữ liệu người dùng để lưu vào MongoDB [6]
            const userData = {
                clerkId: evt.data.id,
                email: evt.data.email_addresses[0]?.email_address,
                name: evt.data.first_name + ' ' + evt.data.last_name,
                image: evt.data?.image_url,
            };

            if (user) {
                await User.findOneAndUpdate({ clerkId: evt.data.id }, userData);[6]
            } else {
                await User.create(userData);[7]
            }
        }
        return res.json({ success: true, message: 'Webhook received' });
    } catch (err) {
        console.error('Error verifying webhook:', err)
        return res.status(400).send('Error verifying webhook')
    }
}