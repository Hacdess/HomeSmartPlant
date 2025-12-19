import { Request, Response } from "express"
import { successResponse, errorResponse } from "../utils/response";
import { EspServices } from "../services/esp_services";

export const EspControllers = {
  bind: async (req: Request, res: Response) => {
    try {
      const user_id = res.locals.user.user_id;
      const { esp_id } = req.body as { esp_id: string };
      if (!esp_id) return res.status(400).json(errorResponse("Nhập vào Esp ID"));

      const { data: existingBind, error: error } = await EspServices.findByID(esp_id);

      if (error) throw error;

      if (existingBind) {
        if (existingBind.user_id !== user_id)
          return res.status(409).json(errorResponse("Thiết bị được kết nối với account khác!"));
        return res.status(201).json(successResponse(null, 'Kết nối thiết bị thành công'));
      }

      const { error: insertError } = await EspServices.insert(esp_id, user_id);

      if (insertError) throw insertError;

      return res.status(200).json(successResponse(true, "Kết nối thiết bị thành công"));

    } catch(e: any) {
      return res.status(500).json(errorResponse(e.message));
    }

  }
}