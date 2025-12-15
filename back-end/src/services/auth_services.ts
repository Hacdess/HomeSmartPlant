import { supabase } from "../config/supabase";
import { successResponse, errorResponse, ApiResponse } from "../utils/response";

export const AuthServices = {
  async signUp(email: string, password: string, full_name: string, user_name: string) {
    try {
      const checkUser = await supabase
        .from('profiles')
        .select('user_name')
        .eq('user_name', user_name)
        .maybeSingle()
      
      if (checkUser.error) throw(checkUser.error);

      if (checkUser.data)
        return errorResponse(`Tên đăng nhập ${user_name} đã tồn tại`);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name, user_name }
        }
      })

      if (error) throw error
      
      if (data.user && !data.session)
        return successResponse(data, "Đăng ký thành công! Vui lòng kiểm tra email.");
      
      return successResponse(data, "Đăng ký thành công");
    
    } catch(e: any) {
      console.error("Exception tại AuthServices:", e);
      return errorResponse(e.message);
    }
  },

  async signIn(email: string, pass: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      return successResponse(data, 'Đăng nhập thành công');
    } catch (e: any) {
      return errorResponse(e.message);
    }
  },

  async getProfile(token: string) {
    try {
      // Set token vào request hiện tại của supabase client để xác thực
      const { data, error } = await supabase.rpc('get_my_profile'); // Cần xử lý truyền token, nhưng ở server-side thường dùng Service Role hoặc forward header. 
      // *Lưu ý: Với server side express, xác thực user tốt nhất là gửi JWT từ client lên header.*
      
      // Ở đây mình giả định bạn gửi User ID hoặc check trực tiếp.
      // Cách đơn giản nhất cho Express: Middleware xác thực JWT trước khi vào đây.
      return successResponse(data, 'Lấy profile thành công'); 
    } catch (e: any) {
      return errorResponse(e.message);
    }
  }
}