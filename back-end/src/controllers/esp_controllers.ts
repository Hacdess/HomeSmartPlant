import { Request, Response } from "express"
import { successResponse, errorResponse } from "../utils/response";
import { EspServices } from "../services/esp_services";

export const EspControllers = {
  bind: async (req: Request, res: Response) => {
    try {
      const user_id = res.locals.user.user_id;
      const { esp_id } = req.body;

      if (!esp_id) return res.status(400).json(errorResponse("Please provide Esp ID"));

      const { data: existingBind, error: error } = await EspServices.findByID(esp_id);

      if (error) throw error;

      if (existingBind) {
        if (existingBind.user_id !== user_id)
          return res.status(409).json(errorResponse("Device is binded with anoter account!"));
        return res.status(201).json(successResponse(null, 'Binded successfully'));
      }

      const { error: insertError } = await EspServices.insert(esp_id, user_id);

      if (insertError) throw insertError;

      return res.status(200).json(successResponse(true, "Binded successfully"));

    } catch(e: any) {
      return res.status(500).json(errorResponse(e.message));
    }

  }
}