import { Bar, BarChart, ComposedChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { BarList } from "./BarList"


export function TopFiveMetrics({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>5 Kegiatan Teratas</CardTitle>
        <CardDescription>
          5 Kegiatan Teratas
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <BarList data={data} valueFormatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
      </CardContent>
    </Card>
  )
}
