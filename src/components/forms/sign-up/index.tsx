"use client";
import { FormGenerator } from "@/components/global/form-generator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { z } from "zod";
import { SignInSchema as SignUpSchema } from "../sign-in";

const SignUpForm = () => {
  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    mode: "onTouched",
  });
  return (
    <Card className="w-[400px]">
      <CardHeader className="text-center">
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Welcome! Please fill in the details to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Social Logins */}
        <div className="my-4 flex items-center justify-evenly">
          <Button className="flex min-w-[8rem] items-center gap-2">
            <FaGithub />
            <span>Github</span>
          </Button>
          <Button className="flex min-w-[8rem] items-center gap-2">
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
        <form action="" className="mt-4 flex flex-col gap-3">
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
          <Button type="submit" className="rounded-2xl">
            Sign Up with Email
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex items-center justify-center">
        <span className="text-muted-foreground mr-2">Secured by</span> iM@il
      </CardFooter>
    </Card>
  );
};

export default SignUpForm;
