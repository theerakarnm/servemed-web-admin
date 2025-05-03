import { Sidebar } from '~/components/Sidebar'
import Loader from "~/components/ui/Loader"
import { useEffect } from "react";
import { jnavigate } from "~/libs/utils";
import { createAuthClient } from 'better-auth/react';
const { useSession } = createAuthClient()

type Props = {
  children: React.ReactNode
  className?: string
}

const MainLayout = (props: Props) => {

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
  }, [session, isPending])

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <main className="p-6">{props.children}</main>
      </div>
    </div>
  )
}

export default MainLayout
