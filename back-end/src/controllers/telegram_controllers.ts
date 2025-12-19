import { Request, Response } from "express"
import { successResponse, errorResponse } from "../utils/response";
import { TelegramServices } from "../services/telegram_services";
import UserServices from "../services/user_services";

export const TelegramControllers = {
  send: async (req: Request, res: Response) => {
    try {
      const id = res.locals.user.user_id;
      if (!id) return res.status(404).json(errorResponse("Không có người dùng nào được lưu"));

      const user = await UserServices.findByID(id);

      if (user.error) throw user.error;

      if (!user.data || !user.data.telegram_id)
        return res.status(400).json(errorResponse("Gửi telegram thất bại"));

      const { content } = req.body as {content: string};

      await TelegramServices.send(user.data.telegram_id, content);

      return res.status(200).json(successResponse(null, "Gửi telegram thành công"));

    } catch(e: any) {
      console.error("Telegram Send Error:", e);

      // 6. Xử lý lỗi cụ thể từ Axios/Telegram trả về
      if (e.response && e.response.data) {
        const telegramError = e.response.data.description;
        
        // Telegram hay trả về lỗi này nếu user chưa bấm /start
        if (telegramError.includes("chat not found") || telegramError.includes("Forbidden")) {
          return res.status(400).json(errorResponse("Không tìm thấy Chat ID hoặc bạn chưa bấm Start bot. Hãy chat với Bot trước."));
        }
        
        return res.status(500).json(errorResponse(`Lỗi từ Telegram: ${telegramError}`));
      }

      // Lỗi Server nội bộ
      return res.status(500).json(errorResponse(e.message || "Lỗi hệ thống khi gửi Telegram"));    }
  }
}