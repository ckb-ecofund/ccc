export function SelectInput(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & {
    state: [string, (v: string) => void];
    options: { label: string; value: string }[];
  },
) {
  return (
    <select
      {...props}
      className={`rounded-full border border-black px-4 py-2 ${props.className ?? ""}`}
      onChange={(e) => {
        props.state[1](e.target.value);
      }}
      value={props.state[0]}
    >
      {props.options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
