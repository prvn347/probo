
import {
  Card,
  CardContent,
  CardDescription,

  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import SignInForm from "./SigninForm";
import SignUpForm from "./SignupForm";
import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { isAuthenticated } from "@/store/atom";
import { useNavigate } from "react-router-dom";



export default function Auth() {
  const isAuthenticatedValue = useRecoilValue(isAuthenticated)
  const navigate = useNavigate()
  useEffect(()=>{
    isAuthenticatedValue ? navigate('/home') : null

  },[])


  return (<div className="flex min-h-screen">
      {/* Left side with background */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-400 to-indigo-600 justify-center items-center">
        <div className="max-w-md text-white p-8">
          <h1 className="text-4xl font-bold mb-6">Welcome to Probo</h1>
          <p className="text-xl"></p>
        </div>
      </div>

      {/* Right side with auth forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>Sign in to your account or create a new one.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <SignInForm />
              </TabsContent>
              <TabsContent value="signup">
                <SignUpForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
