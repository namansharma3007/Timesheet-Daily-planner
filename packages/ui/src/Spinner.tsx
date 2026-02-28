interface SpinnerProps {
  large?: boolean;
}

export function Spinner({ large }: SpinnerProps) {
  return <span className={`spinner${large ? ' spinner--lg' : ''}`} aria-label="Loading" />;
}
