import { LogServices } from "../services/log_services";
import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response";
import type { supabaseLog } from "../services/log_services";

export const LogControllers = {
  getAll: async (req: Request, res: Response) => {
    try {
      const id = res.locals.user.user_id;
      if (!id) return res.status(404).json(errorResponse("Không có user được lưu"));

      const { data, error } = await LogServices.getAll(id);

      if (error) throw error;

      return res.status(200).json(successResponse(data.map(({user_id, log_id, ...rest}) => rest), "Lấy hết log thành công"))

    } catch(e: any) {
      return res.status(500).json(errorResponse(e.message));
    }
  },

  getLatest: async (req: Request, res: Response) => {
    try {
      const id = res.locals.user.user_id;
      if (!id) return res.status(404).json(errorResponse("Không có user được lưu"));

      const { data, error } = await LogServices.getLatest(id);

      if (error) throw error;

      if (!data) return res.status(404).json(errorResponse("Không tìm thấy log mới nhất"))

      const {log_id, user_id, ...rest} = data;

      return res.status(200).json(successResponse(rest, "Lấy log mới nhất thành công"))

    } catch(e: any) {
      return res.status(500).json(errorResponse(e.message));
    }
  },

  write: async (req: Request, res: Response) => {
    try {
      const id = res.locals.user.user_id;
      if (!id) return res.status(404).json(errorResponse("Không có user được lưu"));

      const { type, content } = req.body;

      const { error } = await LogServices.write({user_id: id, type: type, content: content})

      if (error) throw error;

      return res.status(200).json(successResponse(null, "Ghi log thành công"))

    } catch(e: any) {
      return res.status(500).json(errorResponse(e.message));
    }
  }
}