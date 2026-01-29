import type { FC } from 'react'

export const IpfsLogo: FC<{ className?: string }> = ({ className }) => (
    <svg
        viewBox="0 0 40 40"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M20 2L3 11V29L20 38L37 29V11L20 2ZM34 27.3L20 34.6L6 27.3V12.7L20 5.4L34 12.7V27.3Z" />
        <path d="M20 10L8 16.5V23.5L20 30L32 23.5V16.5L20 10ZM29 21.8L20 26.6L11 21.8V18.2L20 13.4L29 18.2V21.8Z" />
        <circle cx="20" cy="20" r="3" />
    </svg>
)
