import { OutDeviceServices } from "../services/outdevice_services";
import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response";

export const OutDeviceControllers = {
  get: async (req: Request, res: Response) => {
    try {
      const id = res.locals.user.user_id;
      if (!id) return res.status(404).json(errorResponse("No user stored"));

      const { data: pump, error: pump_error } = await OutDeviceServices.get(id, "PUMP");

      if (pump_error) throw pump_error;

      const { data: light, error: light_error } = await OutDeviceServices.get(id, "GROW_LIGHT");

      if (light_error) throw light_error;

      const { user_id: pump_user, ...rest_pump} = pump;
      const { user_id: light_user, ...rest_light} = light;
      
      return res.status(200).json(successResponse({rest_pump, rest_light}, "Get output devices successfully"));

    } catch(e: any) {
      return res.status(500).json(errorResponse(e.message));
    }
  },

  getPump: async (req: Request, res: Response) => {
    try {
      const id = res.locals.user.user_id;
      if (!id) return res.status(404).json(errorResponse("No user stored"));

      const { data, error } = await OutDeviceServices.get(id, "PUMP");

      if (error) throw error;

      const { user_id, ...rest} = data;
      
      return res.status(200).json(successResponse(rest, "Get pump successfully"));

    } catch(e: any) {
      return res.status(500).json(errorResponse(e.message));
    }
  },

  getLight: async (req: Request, res: Response) => {
    try {
      const id = res.locals.user.user_id;
      if (!id) return res.status(404).json(errorResponse("No user stored"));

      const { data, error } = await OutDeviceServices.get(id, "GROW_LIGHT");

      if (error) throw error;

      const { user_id, ...rest} = data;
      
      return res.status(200).json(successResponse(rest, "Get light successfully"));

    } catch(e: any) {
      return res.status(500).json(errorResponse(e.message));
    }
  },
};