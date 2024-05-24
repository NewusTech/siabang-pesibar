import { useEffect, useState } from "react";
import { Input } from "./ui/input";

const moneyFormatter = Intl.NumberFormat("id-ID", {
  currency: "IDR",
  style: "currency",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const EditableCell = ({ getValue, row, column, table }: any) => {
  const initialRawValue = getValue();  // Assuming this is a number
  const initialFormattedValue = moneyFormatter.format(initialRawValue);

  const [rawValue, setRawValue] = useState(initialRawValue);
  const [formattedValue, setFormattedValue] = useState(initialFormattedValue);

  // When the input is blurred, update the data with raw numeric value
  const onBlur = () => {
    table.options.meta?.updateData(row.index, column.id, rawValue);
  };

  const handleChange = (inputValue: string) => {
    const digits = inputValue.replace(/\D/g, "");
    const numberValue = Number(digits);
    setRawValue(numberValue);
    setFormattedValue(moneyFormatter.format(numberValue));
  };

  // Sync state with external changes
  useEffect(() => {
    setRawValue(initialRawValue);
    setFormattedValue(initialFormattedValue);
  }, [initialRawValue, initialFormattedValue]);

  return (
    <Input
      value={formattedValue}
      onChange={(ev) => handleChange(ev.target.value)}
      onBlur={onBlur}
    />
  );
};

export default EditableCell;
