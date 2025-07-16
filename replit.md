# AI Filing Platform

## Overview

This is a comprehensive AI-powered document management platform designed for professionals in real estate, legal services, and other service-based industries. The system provides intelligent document organization, OCR processing, AI-driven folder structure generation, and smart file tagging capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **January 16, 2025**: Added voice capabilities for enhanced accessibility
  - Voice recognition for answering onboarding questions by speech
  - "Talk to Assistant" feature for complete voice-based setup
  - Voice search capability in the filing system
  - Intelligent voice-to-text processing with smart answer mapping
  - Enhanced accessibility for small business owners
  - Voice buttons on text input fields throughout the interface
  - Speech synthesis to read questions aloud during voice setup

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **File Upload**: Multer for multipart form handling

### Data Storage Solutions
- **Primary Database**: PostgreSQL (via Neon Database service)
- **ORM**: Drizzle ORM with migrations support
- **File Storage**: Local file system with configurable upload directory
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple

## Key Components

### Authentication System
- **Provider**: Replit Auth with OIDC integration
- **Session Management**: Secure HTTP-only cookies with 7-day TTL
- **User Management**: Complete user profile system with onboarding flow
- **Authorization**: Route-level authentication middleware

### Document Management
- **File Processing**: Multi-step pipeline including OCR, AI summarization, and auto-tagging
- **Folder Structure**: Hierarchical organization with AI-generated folder suggestions
- **File Types**: Support for images, PDFs, and various document formats
- **Metadata**: Rich file metadata including summaries, tags, and processing status

### AI Integration
- **Service**: OpenAI GPT integration for document processing
- **Capabilities**: 
  - Document summarization
  - Automatic tag generation
  - Smart folder structure creation
  - Business-specific organization suggestions
- **OCR**: Tesseract.js for text extraction from images and scanned documents
- **Voice Processing**: Web Speech API for voice recognition and synthesis

### User Interface
- **Design System**: Consistent component library with dark/light mode support
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **File Management**: Drag-and-drop upload with processing options
- **Search**: Real-time file and folder search functionality with voice input
- **Preview**: Modal-based file preview system
- **Voice Interface**: Speech recognition for text input and complete voice-based setup
- **Accessibility**: Voice capabilities for users who prefer speaking over typing

## Data Flow

### User Onboarding
1. User authenticates via Replit Auth
2. System creates user profile with basic information
3. Onboarding flow collects industry, team size, and business description
4. User selects document types they work with most frequently
5. User chooses preferred organization method (by-client, by-project, etc.)
6. User specifies collaboration style and access needs
7. User selects storage type (local or cloud) with pricing information
8. AI generates initial folder structure based on detailed preferences
9. User can customize and approve folder structure
10. System creates folder hierarchy in database

### File Upload and Processing
1. User selects files and processing options (OCR, summarization, tagging)
2. Files uploaded to server with metadata
3. Background processing pipeline:
   - OCR extraction for supported file types
   - AI summarization of content
   - Automatic tag generation
   - File metadata updates
4. Real-time updates to client via query invalidation

### AI Command System
1. User inputs natural language commands
2. System processes command through OpenAI API
3. Commands can trigger file operations, folder creation, or search
4. Results displayed in real-time with status updates

## External Dependencies

### Core Services
- **Database**: Neon Database (PostgreSQL)
- **Authentication**: Replit Auth service
- **AI Processing**: OpenAI API
- **File Processing**: Tesseract.js for OCR

### Development Tools
- **Replit Integration**: Cartographer plugin for development environment
- **Error Handling**: Runtime error overlay for development
- **Build Process**: ESBuild for server bundling, Vite for client

### UI Libraries
- **Component Framework**: Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Icons**: Lucide React icons
- **Utilities**: Various utility libraries for date formatting, class merging

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR
- **Database**: Environment-based DATABASE_URL configuration
- **Authentication**: Replit domain-based OIDC setup

### Production Build
- **Client**: Vite build with optimized bundle
- **Server**: ESBuild compilation to ESM format
- **Static Assets**: Served from dist/public directory
- **Process Management**: Single Node.js process handling both API and static serving

### Environment Configuration
- **Database**: PostgreSQL connection via DATABASE_URL
- **Authentication**: REPLIT_DOMAINS and ISSUER_URL configuration
- **AI Services**: OPENAI_API_KEY for AI processing
- **Sessions**: SESSION_SECRET for secure session management

### Security Considerations
- **Authentication**: Secure OIDC implementation with session management
- **File Upload**: Size limits and type validation
- **Database**: Parameterized queries via Drizzle ORM
- **Sessions**: HTTP-only cookies with secure flags in production