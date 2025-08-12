# Resume Builder Application

## Overview

This is a modern, full-stack resume builder application that enables users to create professional resumes through a step-by-step guided interface. The application features AI-powered content generation, real-time preview functionality, and PDF export capabilities. Built with React, Express, and PostgreSQL, it provides a comprehensive solution for resume creation with an intuitive user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built using React with TypeScript and follows a component-based architecture. The application uses Vite as the build tool and development server, providing fast hot module replacement and optimized builds. The UI is constructed with shadcn/ui components built on top of Radix UI primitives, ensuring accessibility and consistent design patterns.

**Key architectural decisions:**
- **Component Library**: Uses shadcn/ui for consistent, accessible UI components
- **State Management**: React Query for server state management and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with CSS variables for theming support
- **Form Handling**: React Hook Form with Zod for validation

### Backend Architecture
The server follows a traditional Express.js REST API pattern with TypeScript for type safety. The architecture separates concerns between routes, storage, and external services.

**Key architectural decisions:**
- **API Design**: RESTful endpoints for resume CRUD operations
- **Storage Strategy**: Abstracted storage interface supporting both in-memory and database implementations
- **File Handling**: Multer middleware for photo uploads with size and type restrictions
- **Error Handling**: Centralized error handling middleware
- **Development Setup**: Integrated Vite development server for seamless full-stack development

### Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema is designed to store resume data as JSONB fields, providing flexibility for complex nested data structures.

**Key architectural decisions:**
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe queries and migrations
- **Schema Design**: JSONB columns for flexible resume section storage
- **Fallback Storage**: In-memory storage implementation for development/testing

### Authentication and Authorization
Currently implements a minimal authentication approach focused on resume data access. The application is designed to be extended with full user authentication systems.

**Key architectural decisions:**
- **Session Management**: Uses connect-pg-simple for PostgreSQL-backed sessions
- **Security**: Basic CORS and request validation
- **Extensibility**: Architecture supports addition of user authentication systems

### External Dependencies

**Third-party Services:**
- **OpenAI API**: AI-powered content generation for professional summaries, experience descriptions, and skill suggestions
- **Neon Database**: Serverless PostgreSQL hosting
- **Google Fonts**: Typography (Inter, Poppins, DM Sans, Fira Code, Geist Mono)

**Key Libraries:**
- **Frontend**: React, React Query, React Hook Form, Radix UI, Tailwind CSS, Wouter
- **Backend**: Express, Drizzle ORM, Multer, OpenAI SDK
- **Development**: Vite, TypeScript, ESBuild
- **PDF Generation**: jsPDF for client-side PDF creation

**Build and Deployment:**
- **Build System**: Vite for frontend, ESBuild for backend bundling
- **Package Management**: npm with lock file for dependency consistency
- **Environment**: Node.js with ES modules support