export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    state: [string, (v: string) => void];
    label?: string,
  },
) {
  return (
    <div className="flex flex-col gap-1 w-96">
      <label>{props.label ? props.label: 'Input'}</label>
      <input
        {...props}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 ${props.className ?? ""}`}
        type="text"
        value={props.state[0]}
        onInput={(e) => props.state[1](e.currentTarget.value)}
      />
    </div>
  );
}
