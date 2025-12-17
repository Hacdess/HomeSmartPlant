import { config } from "../config/config";
import { supabase } from "../config/supabase";
import { successResponse, errorResponse } from "../utils/response";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const AuthServices = {
  hashPassword: async function (password: string) {
    return bcrypt.hash(password, 10);
  },

  validatePassword: async function(password: string, encryptedPassword: string) {
    return bcrypt.compare(password, encryptedPassword);
  },

  generateToken: async function(payload: any) {
    return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '1d' });
  },

  validateToken: async function(token: string) {
    return jwt.verify(token, config.JWT_SECRET);
  },

  // async signUp(email: string, password: string, full_name: string, user_name: string) {
  //   try {
  //     const { data: existingUser, error: duplicateError } = await supabase
  //       .from('profiles')
  //       .select('*')
  //       .or(`email.eq.${email},user_name.eq.${user_name}`)
  //       .maybeSingle()
      
  //     if (duplicateError) throw(duplicateError)

  //     if (existingUser) {
  //       if (existingUser.email === email)
  //         return errorResponse("Email existed")
        
  //       if (existingUser.user_name === user_name)
  //         return errorResponse("Username existed")
  //     }

  //     const { data, error: signUpError } = await supabase.auth.signUp({
  //       email,
  //       password,
  //       options: {
  //         data: { full_name, user_name }
  //       }
  //     })

  //     if (signUpError) throw signUpError
      
  //     if (data.user && !data.session)
  //       return successResponse(data, "Signed up successfully! Please check your email.");
      
  //     return successResponse(data, "Signed up successfully!");
    
  //   } catch(e: any) {
  //     console.log(e)
  //     return errorResponse(e.message);
  //   }
  // },

  async signIn(email: string, password: string) {
    try {
      // const found = await userServices.findByEmail(email);

      // if (!found)
      //   return errorResponse("Email or Password is invalid");

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      return successResponse({
        access_token: data.session.access_token,
        user: data.user
      }, 'Signed in successfully');

    } catch (e: any) {
      return errorResponse(e.message);
    }
  },

  // async getProfile(id: string) {
  //   try {
  //     const { data, error } = await supabase.rpc('get_my_profile').filter("user_id", "eq", id).maybeSingle();

  //     if (error) throw error;
  
  //     return successResponse({
  //       full_name: data?.full_name,
  //       user_name: data?.user_name,
  //       email: data?.email,
  //       created_at: data?.created_at,
  //       last_sign_in_at: data?.last_sign_in_at
  //     }, 'Get profile successfully'); 
  //   } catch (e: any) {
  //     return errorResponse(e.message);
  //   }
  // }
}