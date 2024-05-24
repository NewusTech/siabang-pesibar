import { type UseFormReturn } from "react-hook-form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "~/components/ui/command"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { Button } from "./ui/button";
import { cn } from "~/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

type Data = {
  label: string
  value: string
  [key: string]: string;
}

type TextInputProps = {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder: string;
  className?: string
  data?: Data[]
  disabled?: boolean
};

const urusan = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Portuguese", value: "pt" },
  { label: "Russian", value: "ru" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Chinese", value: "zh" },
]



const SearchSelect = (props: TextInputProps) => {
  const [open, setOpen] = useState(false)

  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{props.label}</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  disabled={props.disabled ?? false}
                  className={cn(
                    " justify-between",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value
                    ? props.data?.find(
                      (data) => data?.value === field?.value
                    )?.label
                    : props.placeholder}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className=" p-0">
              <Command>
                <CommandInput placeholder={props.placeholder} />
                <CommandEmpty>No data.</CommandEmpty>
                <CommandGroup>
                  {props.data?.map((data) => (
                    <CommandItem
                      value={data.label}
                      key={data.value}
                      onSelect={() => {
                        props.form.setValue(props.name, data.value)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          data.value === field.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {data.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />

  )
}

export default SearchSelect