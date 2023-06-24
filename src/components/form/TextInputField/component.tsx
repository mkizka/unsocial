import { TextInput } from "../TextInput";

type Props = {
  name: string;
  label: string;
  required?: boolean;
};

export function TextInputField({ name, label, required }: Props) {
  return (
    <div className="space-y-2">
      <label htmlFor={name}>{label}</label>
      <TextInput
        id={name}
        name={name}
        data-testid={`text-input-${name}`}
        required={required ?? true}
      />
    </div>
  );
}
