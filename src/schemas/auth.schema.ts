import {z} from "zod"

export const registerSchema=z.object({
    name:z.string().min(2,"Name is required"),
   email: z.string().email("Invalid email"),
    password:z.string().min(8,"Password must be of 8 characters"),
    confirmPassword:z.string(),

}).refine((data)=>data.password===data.confirmPassword,{
    message:"Passwords do not match", path: ["confirmPassword"],
})

export type RegisterFormValues = z.infer<typeof registerSchema>;


export const loginSchema=z.object({
   email: z.string().email("Invalid email"),
    password:z.string().min(8,"Password must be of 8 characters")
})

export type LoginFormValues=z.infer<typeof loginSchema>