interface ButtonProps {
  isActive?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
export function Button(props: ButtonProps) {
  return (
    <button onClick={props.onClick} className={`${props.isActive ? 'bg-cyan-800' : 'bg-cyan-600'} text-white px-3 py-2 rounded`}>
      {props.children}
    </button>
  );
}
