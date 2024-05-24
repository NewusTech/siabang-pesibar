import { Fragment } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Separator } from "./ui/separator"

type Data = {
  dinas: string
  nilai: number

}

interface Props {
  title: string
  data: Data[]
}

export function ListCard({ title, data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <p className="text-sm font-semibold leading-none">OPD</p>
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">Realisasi</p>
          </div>
        </div>
        {data.map((v, i) => (
          <Fragment key={i}>

            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <p className="text-sm leading-none">{v.dinas}</p>
              </div>
              <div>
                <p className="text-sm leading-none">{v.nilai}%</p>
              </div>
            </div>
            <Separator />
          </Fragment>
        ))}
      </CardContent>
    </Card>
  )
}
