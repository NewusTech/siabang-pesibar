import { useRouter } from "next/router"
import { cn } from "~/lib/utils"
import { Button } from "./ui/button"
import { ArrowRight, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { type ReactNode } from "react"

interface Data {
  name: string
  link: string
}

interface Props {
  data: Data[]
  children: ReactNode
  onNext: () => void
  type: string
}

export default function MultiStep({ data, children, onNext, type }: Props) {
  const router = useRouter()
  const slug = router.query.slug as string[]
  const step = slug?.length

  const showButton = type === 'pembangunan' ? (step >= 1 && step <= 3) : (step >= 1 && step <= 6);

  return (
    <div className="">
      {slug[1] !== "result" && <div className="flex justify-between border rounded-full p-4">
        {data.map((v, i) => (
          <div key={i} className="flex space-x-1">
            <p className={cn("text-sm font-semibold", step === i + 1 && 'text-blue-600')}>{i + 1}</p>
            <p className={cn('text-sm', step === i + 1 && 'text-blue-600 font-semibold')}>{v.name}</p>
          </div>
        ))}
      </div> }
      <div>
        {children}
      </div>
      <div className="flex justify-end mt-16">
        <div className="flex space-x-4">
          {step > 1 && <Link href={`/${type}/dpa/${slug.slice(0, -1).join('/')}`} >
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Sebelumnya
            </Button>
          </Link>
          }
          {showButton &&
            <Button onClick={onNext}>
              Selanjutnya <ArrowRight className="mr-2 h-4 w-4" />
            </Button>
          }
        </div>
      </div>
    </div>
  )
}

