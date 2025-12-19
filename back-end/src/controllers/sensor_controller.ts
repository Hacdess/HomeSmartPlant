import { SensorLimit, SensorServices } from "../services/sensor_services";
import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response";
import { hu } from "zod/v4/locales";

export const SensorControllers = {
  getLimit: async (req: Request, res: Response) => {
    try {
      const id = res.locals.user.user_id;
      if (!id) return res.status(404).json(errorResponse("Không có người dùng nào được lưu"));

      const { data, error } = await SensorServices.getLimitByID(id);

      if (error) throw error;

      const {user_id, ...rest} = data;
      return res.status(200).json(successResponse(rest, "Lấy ngưỡng sensor thành công"));

    } catch(e: any) {
      return res.status(500).json(errorResponse(e.message));
    }
  },

  updateLimit: async (req: Request, res: Response) => {
    try {
      const id = res.locals.user.user_id;
      if (!id) return res.status(404).json(errorResponse("Không có người dùng nào được lưu"));

      const { humid_max, humid_min, light_max, light_min, soil_max, soil_min, temp_max, temp_min, water_level_max, water_level_min} = req.body;

      const limit = {
        humid_max: humid_max,
        humid_min: humid_min,
        light_max: light_max,
        light_min: light_min,
        soil_max: soil_max,
        soil_min: soil_min,
        temp_max: temp_max,
        temp_min: temp_min,
        water_level_max: water_level_max,
        water_level_min: water_level_min,
        user_id: id
      }

      const result  = await SensorServices.updateLimitByID(id, limit);

      if (result.error) throw result.error;

      return res.status(200).json(successResponse(null, "Cập nhật ngưỡng sensor thành công"));

    } catch(e: any) {
      return res.status(500).json(errorResponse(e.message));
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const id = res.locals.user.user_id;
      if (!id) return res.status(404).json(errorResponse("Không có người dùng nào được lưu"));

      const { data, error } = await SensorServices.getAllRecordsByID(id);

      if (error) throw error;
      
      return res.status(200).json(successResponse(data.map(({ user_id, rec_id, ...rest }) => rest), "Lấy tất cả sensors record thành công"));
    } catch(e: any) {
      return res.status(500).json(errorResponse(e.message));
    }
  },

  getLatest: async (req: Request, res: Response) => {
    try {
      const id = res.locals.user.user_id;
      if (!id) return res.status(404).json(errorResponse("Không có người dùng nào được lưu"));

      const { data, error } = await SensorServices.getLatestRecordByID(id);

      if (error) throw error;

      if (!data) return res.status(400).json(errorResponse("Lấy record mới nhất thất bại"))
      
      const {user_id, rec_id, ...rest} = data;
      return res.status(200).json(successResponse(rest, "Lấy record mới nhất thành công"));
    } catch(e: any) {
      return res.status(500).json(errorResponse(e.message));
    }
  },
}