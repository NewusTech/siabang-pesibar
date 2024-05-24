import * as React from "react"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Layout } from "~/components/layout"
import { useSession } from "next-auth/react"
import { Activity, Check, ChevronsUpDown, CreditCard, DollarSign, Users } from "lucide-react"
import { Button } from "~/components/ui/button"
import { CardsMetric } from "~/components/Metrics"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "~/components/ui/command"
import { cn } from "~/lib/utils"
import { api } from "~/utils/api"
import { TopFiveMetrics } from "~/components/TopFiveMetrics"

export default function Dashboard() {
  // const { data: session } = useSession()
  const session = useSession()
  const [tahun, setTahun] = React.useState(new Date().getFullYear().toString())
  const [dinasId, setDinasId] =  React.useState('')
  const { data: dinas } = api.dinas.getSelect.useQuery()
  const { data } = api.dashboard.get.useQuery({ tahun: Number(tahun), dinasId })

  useEffect(() => {
    if (session.data) {
      if (session.data.user.role === 'admin') {
        setDinasId('all')
        console.log(dinasId)
      } else {
        setDinasId(session.data.user.dinas.id)
        console.log(dinasId)
      }
    }
  }, [session])
  // console.log('aaaaaa', session.data.user.dinas.id)

  return (
    <Layout>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            {/* <CalendarDateRangePicker /> */}
            {session?.data?.user?.role === 'admin' && <PilihDinas data={dinas} value={dinasId} setValue={setDinasId} />}
            <PilihTahun value={tahun} setValue={setTahun} />
            {/* <Button>Download</Button> */}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Anggaran
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">Rp {data?.totalAnggaran?.toLocaleString('id-ID')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Realisasi (Rp)
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">Rp {data?.totalRealisasi?.toLocaleString('id-ID')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Realisasi (%) </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{data?.totalRealisasiPercent ? data?.totalRealisasiPercent : ''}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sisa Alokasi</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">Rp {data?.totalSisaAlokasi?.toLocaleString('id-ID')}</div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4">
          <div className="col-span-12">
            {data?.charts && <CardsMetric data={data.charts} />}
          </div>
          <div className="col-span-12">
            {data?.topFive && <TopFiveMetrics data={data.topFive} />}
          </div>
        </div>
      </main>
    </Layout>
  )
}

const frameworks = [
  {
    value: "2023",
    label: "2023",
  },
  {
    value: "2024",
    label: "2024",
  },
]

function PilihDinas({ data, value, setValue }: any) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? data?.find((framework: any) => framework.value === value)?.label
            : "Pilih OPD..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Pilih OPD..." />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup>
            {data?.map((framework: any) => (
              <CommandItem
                defaultValue={'Pilih OPD'}
                key={framework.value}
                value={framework.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === framework.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {framework.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


function PilihTahun({ value, setValue }: any) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? frameworks.find((framework) => framework.value === value)?.label
            : "Pilih Tahun..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Pilih Tahun..." />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup>
            {frameworks.map((framework) => (
              <CommandItem
                key={framework.value}
                value={framework.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === framework.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {framework.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
