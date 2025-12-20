import axios from 'axios';
import { config } from '../config/config';

export const TelegramServices = {
  send: async (chat_id: string, message: string) => {
    const url = `https://api.telegram.org/bot${config.TELEGRAM_TOKEN}/sendMessage`;
      
    return axios.post(url, {
        chat_id: chat_id,
        text: message,
        parse_mode: 'HTML'
      });
  }
};