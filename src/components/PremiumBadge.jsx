export default function PremiumBadge() {
  return (
    <span
      title="Instructor Premium verificado"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 18,
        height: 18,
        borderRadius: '50%',
        backgroundColor: '#1D6FD6',
        marginLeft: 6,
        verticalAlign: 'middle',
        flexShrink: 0
      }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
        <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.9-6.2 3.9 1.6-7L2 9.2l7.1-.6L12 2z" />
      </svg>
    </span>
  )
}