import { Request, Response } from "express";
import { MqttServices } from "../services/mqtt_services";

export const DeviceController = {
  control(req: Request, res: Response) {
    const { user_id, device, value } = req.body;

    MqttServices.sendDeviceCommand(user_id, device, value);

    res.json({ success: true });
  },
};
