import { OutDeviceServices } from "../services/outdevice_services";
import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response";
import { MqttServices } from "../services/mqtt_services";
import { LogServices, type supabaseLog } from "../services/log_services";

export const OutDeviceControllers = {
  get: async (req: Request, res: Response) => {
    try {
      const id = res.locals.user.user_id;
      if (!id) return res.status(404).json(errorResponse("không có người dùng nào được lưu"));

      const { data: pump, error: pump_error } = await OutDeviceServices.get(id, "PUMP");

      if (pump_error) throw pump_error;

      const { data: light, error: light_error } = await OutDeviceServices.get(id, "GROW_LIGHT");

      if (light_error) throw light_error;

      const { user_id: pump_user, ...rest_pump} = pump;
      const { user_id: light_user, ...rest_light} = light;
      
      return res.status(200).json(successResponse({rest_pump, rest_light}, "Lấy thiết bị đầu ra thành công"));

    } catch(e: any) {
      return res.status(500).json(errorResponse(e.message));
    }
  },

  getPump: async (req: Request, res: Response) => {
    try {
      const id = res.locals.user.user_id;
      if (!id) return res.status(404).json(errorResponse("không có người dùng nào được lưu"));

      const { data, error } = await OutDeviceServices.get(id, "PUMP");

      if (error) throw error;

      const { user_id, ...rest} = data;
      
      return res.status(200).json(successResponse(rest, "Lấy máy bơm thành công"));

    } catch(e: any) {
      return res.status(500).json(errorResponse(e.message));
    }
  },

  getLight: async (req: Request, res: Response) => {
    try {
      const id = res.locals.user.user_id;
      if (!id) return res.status(404).json(errorResponse("không có người dùng nào được lưu"));

      const { data, error } = await OutDeviceServices.get(id, "GROW_LIGHT");

      if (error) throw error;

      const { user_id, ...rest} = data;
      
      return res.status(200).json(successResponse(rest, "Lấy đèn quang hợp thành công"));

    } catch(e: any) {
      return res.status(500).json(errorResponse(e.message));
    }
  },

  updateDevice: async ( req: Request, res: Response) => {
    try {
      const id = res.locals.user.user_id;
      if (!id) return res.status(404).json(errorResponse("không có người dùng nào được lưu"));

      const { esp_id, name, status } = req.body;

      if (!esp_id || !name || typeof status !== "boolean")
        return res.status(400).json(errorResponse("Thiếu thông tin điều khiển thiết bị"));

      if (name !== "PUMP" && name !== "GROW_LIGHT")
        return res.status(400).json(errorResponse("Tên thiết bị không hỗ trợ"));

      const { data, error } = await OutDeviceServices.update(id, name, status);

      if (error) throw error;

      const action = status ? "ON" : "OFF";

      MqttServices.sendCommand(esp_id, name, action);

      const log: supabaseLog = {
        user_id: id,
        type: "DEVICE",
        content: `${status ? "Bật" : "Tắt"} ${name === "PUMP" ? "máy bơm" : "đèn quang hợp"}`
      }

      await LogServices.write(log);
      
      return res.status(200).json(successResponse(null, `Điều khiển ${name} thành công`));
    } catch(e: any) {
      return res.status(500).json(errorResponse(e.message));
    }
  },
};