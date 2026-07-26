import { InputAdornment, TextField, TextFieldProps } from "@mui/material";
import { Search } from "lucide-react";

type SearchFieldProps = Omit<TextFieldProps, "value" | "onChange" | "slotProps"> & {
  value: string;
  onSearchChange: (value: string) => void;
};

export function SearchField({ value, onSearchChange, size = "small", ...props }: SearchFieldProps) {
  return (
    <TextField
      {...props}
      value={value}
      onChange={(event) => onSearchChange(event.target.value)}
      size={size}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Search size={16} color="#64748b" />
            </InputAdornment>
          )
        }
      }}
    />
  );
}
