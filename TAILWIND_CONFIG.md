# Adicione isso no seu tailwind.config.ts (dentro de theme.extend):

theme: {
  extend: {
    animation: {
      ticker: "ticker 32s linear infinite",
    },
    keyframes: {
      ticker: {
        "0%":   { transform: "translateX(0)" },
        "100%": { transform: "translateX(-50%)" },
      },
    },
  },
},
