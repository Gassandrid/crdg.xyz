if (typeof window !== "undefined") {
  const existing = document.querySelector('script[data-three-runtime]')
  if (!existing) {
    const script = document.createElement("script")
    script.type = "module"
    script.src = "/three-runtime.js"
    script.setAttribute("data-three-runtime", "true")
    document.head.appendChild(script)
  }
}