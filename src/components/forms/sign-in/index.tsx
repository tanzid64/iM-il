"use client";
import { FormGenerator } from "@/components/global/form-generator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { z } from "zod";

export const SignInSchema = z.object({
  email: z.string().email("You must give a valid email"),
  password: z
    .string()
    .min(8, { message: "Your password must be atleast 8 characters long" })
    .max(64, {
      message: "Your password can not be longer then 64 characters long",
    })
    .refine(
      (value) => /^[a-zA-Z0-9_.-]*$/.test(value ?? ""),
      "password should contain only alphabets and numbers",
    ),
});

const SignInForm = () => {
  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    mode: "onTouched",
  });
  return (
    <Card className="w-[400px]">
      <CardHeader className="text-center">
        <CardTitle>Sign in to iMail</CardTitle>
        <CardDescription>
          Welcome back! Please sign in to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Social Logins */}
        <div className="my-4 flex items-center justify-evenly">
          <Button className="flex items-center gap-2 min-w-[8rem]">
            <FaGithub />
            <span>Github</span>
          </Button>
          <Button className="flex items-center gap-2 min-w-[8rem]">
            <FaGoogle />
            <span>Google</span>
          </Button>
        </div>
        {/* Or */}
        <div className="flex items-center justify-center gap-2">
          <hr className="w-full bg-muted-foreground" />
          <span className="text-muted-foreground">Or</span>
          <hr className="w-full bg-muted-foreground" />
        </div>
        {/* Credintial Form */}
        {/* Email */}
        <form action="" className="flex flex-col gap-3 mt-4">
          <FormGenerator
            inputType="input"
            placeholder="Email"
            name="email"
            type="email"
            register={register}
            errors={errors}
          />
          {/* Password */}
          <FormGenerator
            inputType="input"
            placeholder="Password"
            name="password"
            type="password"
            register={register}
            errors={errors}
          />
          <Button type="submit" className="rounded-2xl">Sign Up with Email</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignInForm;
