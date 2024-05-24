import { Metadata } from "next"
import { UserAuthForm } from "~/components/user-auth-form"
import Image from "next/image";


export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
}

export default function AuthenticationPage() {
  return (
    <>
      <div className="container flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative">
          <div className="w-full h-screen hidden md:block">
            <Image src="/bg2.jpeg" alt="background" width={1000} height={2000} className="w-full h-full object-cover"/>
          </div>
          <div className="md:absolute hidden md:block inset-0 w-full h-screen bg-zinc-900 opacity-50 z-10"></div>
          <div className="md:absolute inset-0 p-5 z-20">
            <div className="items-center flex justify-center mt-2 md:mt-[30vh] mb-[10px]">
              <img className="md:h-[45vh] h-32 items-center m-auto" alt='logo' src="/logo.png" style={{color: `white`}}/>
            </div>
            <div className="relative z-20 mt-auto md:text-white flex justify-center">
              <blockquote className="space-y-2">
              <p className="md:text-lg text-sm text-center">
                  &ldquo;SISTEM INFORMASI ADMINISTRASI PEMBANGUNAN&rdquo;
                </p>
              </blockquote>
            </div>
          </div>
        </div>

        <div className="container lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Login
              </h1>
              <p className="text-sm text-muted-foreground">
                Input email and password
              </p>
            </div>
            <UserAuthForm/>
          </div>
        </div>
      </div>
    </>
  )
}

