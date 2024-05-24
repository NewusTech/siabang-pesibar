import { Fragment } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"

type Data = {
  name: string
  link?: string
}

interface Props {
  data: Data[]
}

export default function Breadcrumbs({ data }: Props) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
        </BreadcrumbItem>
        {
          data.map((v, i) => (
            <Fragment key={i}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {v.link ?
                  <BreadcrumbLink href={v.link}>{v.name}</BreadcrumbLink>
                  :
                  <BreadcrumbPage>{v.name}</BreadcrumbPage>
                }
              </BreadcrumbItem>
            </Fragment>
          ))
        }
      </BreadcrumbList>
    </Breadcrumb>
  )
}