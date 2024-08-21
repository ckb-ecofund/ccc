export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`flex items-center rounded-full bg-black px-5 py-2 text-white disabled:bg-gray-700 ${props.className}`}
    />
  );
}
