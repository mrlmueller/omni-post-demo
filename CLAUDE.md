# Omni-Post Coding Guidelines

### Prerequesites

- When you use a dependency, make sure to also install everything that is needed for it yourself.

## Build Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Code Style Guidelines

### TypeScript

- Use strict TypeScript typing with explicit interfaces
- Prefer explicit return types on functions
- Use React.FC<Props> for functional components

### Imports

- Use absolute imports with `@/` prefix (configured in tsconfig.json)
- Group imports: React/Next, external libraries, internal components/utils

### Naming Conventions

- PascalCase for components and interfaces (e.g., `UserChip`, `OAuthLoginButtonProps`)
- camelCase for variables, functions, and instances
- Use descriptive names that indicate purpose

### Component Structure

- Use "use client" directive for client-side components
- Use TypeScript interfaces for props
- Organize hooks at the top of the component
- Keep components focused on a single responsibility

### Error Handling

- Use try/catch for async operations
- Log errors with console.error
- Return appropriate HTTP status codes in API routes

### API Routes

- Validate request method and required parameters
- Use NextResponse for responses with appropriate status codes
- Handle errors gracefully with meaningful error messages

### State Management

- Use React hooks (useState, useEffect) for component state
- Create custom hooks for reusable logic

### Formatting

- Use consistent indentation (2 spaces)
- Include semicolons at the end of statements
- Follow Next.js and React best practices
