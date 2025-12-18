import { LogServices } from "../services/log_services";
import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response";

export const LogControllers = {
  getAll: async (req: Request, res: Response) => {
    try {
      const id = res.locals.user.user_id;
      if (!id) return res.status(404).json(errorResponse("No user stored"));

      const { data, error } = await LogServices.getAll(id);

      if (error) throw error;

      return res.status(200).json(successResponse(data.map(({user_id, log_id, ...rest}) => rest), "Get all logs successfully"))

    } catch(e: any) {
      return res.status(500).json(errorResponse(e.message));
    }
  },

  write: async (req: Request, res: Response) => {
    try {
      const id = res.locals.user.user_id;
      if (!id) return res.status(404).json(errorResponse("No user stored"));

      

    } catch(e: any) {
      return res.status(500).json(errorResponse(e.message));
    }
  }
}