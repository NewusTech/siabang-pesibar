import { useEffect, useReducer } from "react";
import { type UseFormReturn } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";

type TextInputProps = {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder: string;
  className?: string
  desc?: string
  disabled?: boolean
};

const moneyFormatter = Intl.NumberFormat("id-ID", {
  currency: "IDR",
  style: "currency",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

export default function MoneyInput(props: TextInputProps) {
  const formValue = props.form.watch(props.name);
  const formattedInitialValue = formValue ? moneyFormatter.format(formValue) : "";

  const [value, setValue] = useReducer((_: any, nextValue: string) => {
    const digits = nextValue.replace(/\D/g, "");
    return moneyFormatter.format(Number(digits));
  }, formattedInitialValue);

  useEffect(() => {
    const newValue = formValue ? moneyFormatter.format(formValue) : "";
    setValue(newValue);
  }, [formValue]);

  function handleChange(realChangeFn: Function, formattedValue: string) {
    const digits = formattedValue.replace(/\D/g, "");
    realChangeFn(Number(digits));
  }

  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => {
        field.value = value;
        const _change = field.onChange;

        return (
          <FormItem className={props.className}>
            <FormLabel>{props.label}</FormLabel>
            <FormControl>
              <Input
                placeholder={props.placeholder}
                type="text"
                disabled={props.disabled ?? false}
                {...field}
                onChange={(ev) => {
                  setValue(ev.target.value);
                  handleChange(_change, ev.target.value);
                }}
                value={value}
              />
            </FormControl>
            {props.desc && <FormDescription>
              {props.desc}
            </FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}