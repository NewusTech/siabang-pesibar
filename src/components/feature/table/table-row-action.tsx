"use client"

import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Row } from "@tanstack/react-table"

import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  onDeleteClick: (row: any) => void
  onEditClick: (row: any) => void
}

export function DataTableRowActions<TData>({
  row,
  onDeleteClick,
  onEditClick
}: DataTableRowActionsProps<TData>) {

  const handleEditClick = () => {
    onEditClick(row)
  }

  const handleDeteleClick = () => {
    onDeleteClick(row)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={handleEditClick}>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={handleDeteleClick}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
