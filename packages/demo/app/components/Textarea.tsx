export function Textarea(
  props: React.InputHTMLAttributes<HTMLTextAreaElement> & {
    state: [string, (v: string) => void];
  },
) {
  return (
    <textarea
      {...props}
      className={`rounded-3xl border border-black px-4 py-2 ${props.className ?? ""}`}
      value={props.state[0]}
      onInput={(e) => props.state[1](e.currentTarget.value)}
    />
  );
}
