import type { MetaFunction } from "@remix-run/node";

import Loader from "~/components/ui/Loader"
import { useEffect } from "react";
import { jnavigate } from "~/libs/utils";
import { createAuthClient } from 'better-auth/react';

const { useSession } = createAuthClient()

export const meta: MetaFunction = () => {
  return [
    { title: "SERVEMED - ADMIN PORTAL" },
    { name: "description", content: "Welcome to admin portal" },
  ];
};

export default function NewProductPage() {
  const {
    data: session,
    isPending, //loading state
  } = useSession()

  useEffect(() => {

    console.log("session", session);


    if (!session && !isPending) {
      jnavigate({
        path: "/sign-in",
        target: "_self",
      })
    }

    if (session?.user && !isPending) {
      jnavigate({
        path: "/dashboard",
        target: "_self",
      })
    }


  }, [session, isPending])

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <Loader />
    </div>
  )
}

