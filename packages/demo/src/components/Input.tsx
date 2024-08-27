export function TextInput(
  props: React.ComponentPropsWithoutRef<"input"> & {
    state: [string, (v: string) => void];
    label?: string;
  },
) {
  return (
    <div className={`relative bg-white/75 p-4 ${props.className ?? ""}`}>
      {props.label ? (
        <label className="text-sm">{props.label}</label>
      ) : undefined}
      <input
        {...props}
        className={`w-full border-b-2 border-gray-300 bg-transparent px-4 py-2 text-gray-700 focus:border-solid focus:outline-none ${props.state[0].length !== 0 ? "border-solid" : "border-dashed"}`}
        type="text"
        value={props.state[0]}
        onInput={(e) => props.state[1](e.currentTarget.value)}
      />
    </div>
  );
}
