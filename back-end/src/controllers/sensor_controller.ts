import { SensorLimit, SensorServices } from "../services/sensor_services";
import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response";

export const SensorControllers = {
  getLimit: async (req: Request, res: Response) => {
    try {
      const id = res.locals.user.user_id;
      if (!id) return res.status(404).json(errorResponse("No user stored"));

      const { data, error } = await SensorServices.getLimitByID(id);

      if (error) throw error;

      const {user_id, ...rest} = data;
      return res.status(200).json(successResponse(rest, "Get record's limit successfully"));

    } catch(e: any) {
      return res.status(500).json(errorResponse(e.message));
    }
  },

  updateLimit: async (req: Request, res: Response) => {
    try {
      const id = res.locals.user.user_id;
      if (!id) return res.status(404).json(errorResponse("No user stored"));

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

      return res.status(200).json(successResponse(null, "Update record's limit successfully"));

    } catch(e: any) {
      return res.status(500).json(errorResponse(e.message));
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const id = res.locals.user.user_id;
      if (!id) return res.status(404).json(errorResponse("No user stored"));

      const { data, error } = await SensorServices.getAllRecordsByID(id);

      if (error) throw error;
      
      return res.status(200).json(successResponse(data.map(({ user_id, rec_id, ...rest }) => rest), "Get all records successfully"));
    } catch(e: any) {
      return res.status(500).json(errorResponse(e.message));
    }
  },

  getLatest: async (req: Request, res: Response) => {
    try {
      const id = res.locals.user.user_id;
      if (!id) return res.status(404).json(errorResponse("No user stored"));

      const { data, error } = await SensorServices.getLatestRecordByID(id);

      if (error) throw error;

      if (!data) return res.status(400).json(errorResponse("Lấy bản ghi mới nhất thất bại"))
      
      const {user_id, rec_id, ...record} = data;

      const alerts = [];

      const { data: limit,  error: error1} = await SensorServices.getLimitByID(user_id);
      
      if (!error1 && limit) {
        if (record.humid < limit.humid_min || record.humid > limit.humid_max)
          alerts.push(`Độ ấm không khí vượt ngưỡng (${record.humid})`)
        if (record.temperature < limit.temp_min || record.temperature > limit.temp_max)
          alerts.push(`Nhiệt độ không khí vượt ngưỡng (${record.temperature})`)
        if (record.soil_moisture < limit.soil_min || record.soil_moisture > limit.soil_max)
          alerts.push(`Độ ấm đất vượt ngưỡng (${record.soil_moisture})`)
        if (record.light < limit.light_min || record.light > limit.light_max)
          alerts.push(`Ánh sáng vượt ngưỡng (${record.light})`)
        if (record.water_level < limit.water_level_min|| record.water_level > limit.water_level_max)
          alerts.push(`Mực nước vượt ngưỡng (${record.water_level})`)
      }


      return res.status(200).json(successResponse(record, "Get latest record successfully"));
    } catch(e: any) {
      return res.status(500).json(errorResponse(e.message));
    }
  },
}