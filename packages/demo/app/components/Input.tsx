export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    state: [string, (v: string) => void];
    label?: string;
  },
) {
  return (
    <div className="flex w-96 flex-col gap-1">
      <label>{props.label ? props.label : "Input"}</label>
      <input
        {...props}
        className={`w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${props.className ?? ""}`}
        type="text"
        value={props.state[0]}
        onInput={(e) => props.state[1](e.currentTarget.value)}
      />
    </div>
  );
}
