import { supabase } from "../config/supabase";

export type supabaseUser = {
  full_name: string,
  user_name: string,
  email: string,
  phone: string,
  password: string
} 

const UserServices = {
  create: async function(user: supabaseUser) {
    const result = await supabase.from("users").insert(user);
    return result;
  },
  findAll: async function() {
    return supabase.from("users").select('*');
  },

  findByID: async function(id: string) {
    return supabase.from("users").select('*').eq("user_id", id).maybeSingle();
  },

  findByIdentity: async function(email: string, user_name: string, phone: string) {
    return supabase
      .from("users")
      .select('*')
      .or(`email.eq.${email},user_name.eq.${user_name},phone.eq.${phone}`) 
      .maybeSingle();
  },

  findByEmail: async function(email: string) {
    return supabase.from("users").select('*').eq("email", email).maybeSingle();
  },

  findByUsername: async function(user_name: string) {
    return supabase.from('users').select('*').eq("user_name", user_name).maybeSingle();
  },

  update: async function(user: any) {
    await supabase.from("users").update(user).eq("user_id", user.id)

  }
}

export default UserServices;