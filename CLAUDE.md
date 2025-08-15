# TIM-CARE Development Context

## Completed Tasks

### 2025-08-07: Remove Calendar View from N8N Instance
**Jira Task**: [Frontend][N8N] Quitar vista de "calendario" para instancia de N8N

**Description**: Removed the calendar view from the navigation menu for the N8N instance, as this view should not be available when connected to N8N workflows.

**Changes Made**:
- Created branch: `feature/remove-calendar-view-n8n`
- Modified `app/components/sidebar.tsx`:
  - Removed calendar navigation item from `navigationItems` array (lines 46-51)
  - Cleaned up unused imports: `Calendar` icon from lucide-react
  - Removed `CalendarView` component import
- Navigation menu now only contains:
  - Dashboard
  - Pacientes (with subcategories: Todos, En proceso, Estancado, Agendado, Pagado, Posventa)

**Files Modified**:
- `app/components/sidebar.tsx`

**Status**: ✅ Completed

### 2025-08-07: Implement Manual Message Sending Functionality
**Task**: Complete the `handleSendMessage` function in chat-window.tsx to send manual messages to users via WhatsApp

**Description**: Implemented secure message sending functionality that allows sending manual messages to WhatsApp users through the N8N integration, following security best practices by not exposing API keys on the frontend.

**Changes Made**:
- Created secure API route: `/app/api/messages/send/route.ts`
  - Handles message sending to Supabase Edge Function
  - Validates required fields (toNumber, message, phoneNumberId, clinicId, userId)
  - Uses environment variables for secure API key handling
  - Proper error handling and logging
- Created clinic information API route: `/app/api/clinic/[clinicId]/route.ts`
  - Fetches clinic data from N8N server
  - Used to get phoneNumberId for message sending
- Updated `handleSendMessage` function in `app/components/chat-window.tsx`:
  - Full async implementation with proper error handling
  - Validates customer WhatsApp number and clinic ID
  - Fetches clinic data to get phoneNumberId
  - Sends message through secure API route
  - Clears input after successful send
  - User-friendly error alerts
  - TODO comments for future improvements (user authentication, message list updates)
- Fixed TypeScript diagnostics:
  - Removed unused `isApiMessage` variable
  - Replaced deprecated `onKeyPress` with `onKeyDown`

**Security Features**:
- API keys stored in environment variables only
- No sensitive data exposed to frontend
- Proper input validation and sanitization
- Secure API route patterns following existing codebase conventions

**Backend Integration**: 
- Endpoint: `https://yqpxflpusarujavllhpz.supabase.co/functions/v1/messages-manual-response`
- Headers: `x-api-key: WrTvm^Z3n_s*k1VCXM8`
- Payload format matches backend requirements

**Files Modified**:
- `app/components/chat-window.tsx` - Implemented handleSendMessage function
- `app/api/messages/send/route.ts` - New secure API route for sending messages  
- `app/api/clinic/[clinicId]/route.ts` - New API route for clinic data

**Status**: ✅ Completed

**Note**: The userId is hardcoded to "51eae6e6-b29f-981e-cd02-d50bc8147fac" since the project doesn't have authentication implemented yet.