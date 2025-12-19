import { Request, Response } from "express"
import { successResponse, errorResponse } from "../utils/response";
import { MailServices } from "../services/mail_services";
import UserServices from "../services/user_services";

export const MailControllers = {
  send: async (req: Request, res: Response) => {
    try {
      const id = res.locals.user.user_id;
      if (!id) return res.status(404).json(errorResponse("Không có người dùng nào được lưu"));

      const user = await UserServices.findByID(id);

      if (user.error) throw user.error;

      if (!user.data || !user.data.email)
        return res.status(400).json(errorResponse("Gửi mail thất bại"));

      const { content } = req.body as {content: string};

      await MailServices.send(user.data.email, content);

      return res.status(200).json(successResponse(null, "Gửi mail thành công"));

    } catch(e: any) {
      return res.status(500).json(errorResponse(e.message));
    }
  }
}