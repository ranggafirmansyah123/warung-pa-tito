export function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className="bg-primary-700 text-white px-4 py-2 rounded-lg hover:bg-primary-800 transition" {...props}>{children}</button>;
}
