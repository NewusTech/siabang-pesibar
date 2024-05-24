import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Layout } from "~/components/layout"
import { useSession } from "next-auth/react"

export default function Dashboard() {
  const { data } = useSession()

  return (
    <div>error</div>
  )
}
