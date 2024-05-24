import { Bar, ComposedChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"


export function CardsMetric({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Grafik realisasi</CardTitle>
        <CardDescription>
          Realisasi dalam bulan januari sampai desember
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4 pl-1">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <XAxis dataKey="month" padding={{ left: 10 }} />
              <YAxis hide />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Sisa
                            </span>
                            <span className="font-bold text-muted-foreground">
                              Rp {payload[1]?.value?.toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Realisasi
                            </span>
                            <span className="font-bold">
                              Rp {payload[0]?.value?.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="realisasi" fill="rgb(191 219 254)" />
              <Line
                type="monotone"
                dataKey="sisa"
                strokeWidth={2}
                activeDot={{
                  r: 8,
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
