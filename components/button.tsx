import React from "react"

interface RoundedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline"
}

const RoundedButton = React.forwardRef<HTMLButtonElement, RoundedButtonProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    const baseStyles =
      "rounded-full font-medium transition-all duration-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"

    const variantStyles = {
      default: "bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg",
      outline: "bg-transparent border-2 border-purple-600 text-purple-600 hover:bg-purple-50",
    }

    const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${className}`

    return (
      <button ref={ref} className={buttonStyles} {...props}>
        {children}
      </button>
    )
  },
)

RoundedButton.displayName = "RoundedButton"

export { RoundedButton }
