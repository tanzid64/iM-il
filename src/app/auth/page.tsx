import SignInForm from "@/components/forms/sign-in";
import SignUpForm from "@/components/forms/sign-up";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AuthPage = () => {
  return (
    <Tabs defaultValue="register" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Register</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <SignInForm />
      </TabsContent>
      <TabsContent value="register">
        <SignUpForm />
      </TabsContent>
    </Tabs>
  );
};

export default AuthPage;
