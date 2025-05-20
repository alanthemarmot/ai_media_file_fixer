# Copilot Instructions

## Code Elegance Guidelines

### Simplicity Principles
- Functions should generally be under 20 lines
- Components should generally be under 150 lines
- Aim for component props to be under 7 items
- Use destructuring for cleaner component interfaces
- Group related state items in meaningful objects
- Follow the principle of least knowledge (components only know what they need)

### Performance Considerations
- Implement lazy loading for heavier React components with `client:only` when needed
- Use Island Architecture to minimize JavaScript sent to the client
- Leverage Astro's static generation for content that doesn't change frequently
- Build component-specific stores to avoid unnecessary re-renders

### Code Organization
- Default export for the main component in a file
- Named exports for utility functions
- Group related hooks at the top of a component
- Keep event handlers inside the component, but separate from the JSX

### Python Setup - Use `uv` for Python Environments
- Setting Up uv for Python Environments - https://docs.astral.sh/uv/guides/

### Node.js Setup
- Install Node.js v18.x or higher (recommend using nvm)
- Run `npm install` in the project root to install frontend dependencies
- Start the React development server with `npm run dev` or `yarn dev`
- Build production-ready assets with `npm run build`
- Scripts and commands are defined in `package.json`
