export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    state: [string, (v: string) => void];
  },
) {
  return (
    <input
      {...props}
      className={`rounded-full border border-black px-4 py-2 ${props.className ?? ""}`}
      type="text"
      value={props.state[0]}
      onInput={(e) => props.state[1](e.currentTarget.value)}
    />
  );
}
