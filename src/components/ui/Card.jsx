export default function Card({ children, className = '' }) {
  return (
    <div className={`card-dark ${className}`}>
      {children}
    </div>
  )
}
