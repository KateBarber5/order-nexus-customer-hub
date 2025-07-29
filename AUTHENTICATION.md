# Authentication System Documentation

## Overview

The GovMetric Customer Hub implements a secure authentication system that handles user login, session management, and access control throughout the application.

## Features

### 🔐 Secure Authentication
- **API Integration**: Integrates with GovMetric API for user authentication
- **Session Management**: Secure session storage with automatic expiration
- **Remember Me**: Optional persistent login across browser sessions
- **Session Refresh**: Automatic session extension to prevent timeouts

### 🛡️ Security Best Practices
- **Token-based Sessions**: Secure session tokens with expiration times
- **Automatic Logout**: Session expiration handling with user notification
- **Protected Routes**: Route-level authentication checks
- **Secure Storage**: Proper use of localStorage vs sessionStorage
- **Session Validation**: Continuous session validity checking

### 🔄 Session Management
- **24-hour Sessions**: Default session duration for regular users
- **7-day Sessions**: Extended sessions for "Remember Me" users
- **Auto-refresh**: Sessions automatically refresh every 30 minutes
- **Expiry Warnings**: User notifications when sessions are about to expire

## API Integration

### Login Response Format
The system expects the following response format from the GovMetric API:

```json
{
  "LoginIsValid": true,
  "UserID": "f1e139c6-8555-464c-bde9-27bc12cce021",
  "OrganizationID": 1
}
```

### Error Response Format
```json
{
  "LoginIsValid": false,
  "Error": [
    {
      "Code": "AUTH_FAILED",
      "Message": "Invalid credentials"
    }
  ]
}
```

## Implementation Details

### Core Components

#### 1. AuthContext (`src/contexts/AuthContext.tsx`)
- **Purpose**: Central authentication state management
- **Features**: 
  - Login/logout functionality
  - Session management
  - Automatic session refresh
  - User session data access

#### 2. ProtectedRoute (`src/components/ProtectedRoute.tsx`)
- **Purpose**: Route-level authentication protection
- **Features**:
  - Automatic redirect for unauthenticated users
  - Loading states during authentication checks
  - Redirect URL preservation

#### 3. SessionWarning (`src/components/SessionWarning.tsx`)
- **Purpose**: User notification for session expiry
- **Features**:
  - Configurable warning time (default: 30 minutes)
  - One-click session refresh
  - Real-time countdown display

#### 4. Session Manager (`src/services/orderService.ts`)
- **Purpose**: Low-level session storage and retrieval
- **Features**:
  - Secure session storage
  - Session validation
  - Automatic cleanup of expired sessions

### Hooks

#### useAuth()
Provides access to authentication context:
```typescript
const { 
  isAuthenticated, 
  userSession, 
  login, 
  logout, 
  refreshSession 
} = useAuth();
```

#### useAuthData()
Provides convenient access to user data:
```typescript
const { 
  userID, 
  organizationID, 
  userEmail, 
  hasValidSession,
  isSessionExpiringSoon 
} = useAuthData();
```

## Usage Examples

### Basic Authentication Check
```typescript
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { isAuthenticated, userSession } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in to access this page.</div>;
  }
  
  return <div>Welcome, {userSession?.email}!</div>;
};
```

### Protected Route Implementation
```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

### Session Data Access
```typescript
import { useAuthData } from '@/hooks/useAuthData';

const MyComponent = () => {
  const { userID, organizationID, hasValidSession } = useAuthData();
  
  // Use user data in API calls
  const apiCall = async () => {
    const { iOrganizationID, iUserGuid } = getOrganizationAndUserData();
    // API call with user credentials
  };
};
```

## Session Storage Strategy

### Regular Sessions (sessionStorage)
- **Duration**: 24 hours
- **Storage**: Browser session storage
- **Behavior**: Cleared when browser/tab is closed
- **Use Case**: Standard user sessions

### Remember Me Sessions (localStorage)
- **Duration**: 7 days
- **Storage**: Browser local storage
- **Behavior**: Persists across browser sessions
- **Use Case**: User convenience for frequent access

## Security Considerations

### Session Security
- **Expiration**: All sessions have automatic expiration
- **Validation**: Continuous session validity checking
- **Cleanup**: Automatic cleanup of expired sessions
- **Refresh**: Secure session refresh mechanism

### Data Protection
- **No Sensitive Data**: Passwords are never stored
- **Encrypted Storage**: Session data is stored securely
- **Automatic Logout**: Sessions expire automatically
- **Cross-tab Sync**: Session state synchronized across tabs

### API Security
- **HTTPS Only**: All API calls use secure connections
- **Token Validation**: Session tokens validated on each request
- **Error Handling**: Secure error handling without data leakage

## Configuration

### Environment Variables
```env
VITE_API_BASE_URL=https://govmetricai-h0h4crd6a6gregbm.eastus-01.azurewebsites.net
```

### Session Configuration
```typescript
// Default session durations (in milliseconds)
const SESSION_DURATIONS = {
  REGULAR: 24 * 60 * 60 * 1000,    // 24 hours
  REMEMBER_ME: 7 * 24 * 60 * 60 * 1000,  // 7 days
  REFRESH_INTERVAL: 30 * 60 * 1000,      // 30 minutes
  WARNING_TIME: 30 * 60 * 1000           // 30 minutes
};
```

## Error Handling

### Common Error Scenarios
1. **Invalid Credentials**: User-friendly error messages
2. **Session Expired**: Automatic redirect to login
3. **Network Errors**: Graceful fallback with retry options
4. **API Unavailable**: Fallback to cached session data

### Error Recovery
- **Automatic Retry**: Failed API calls are retried
- **Session Recovery**: Attempt to restore from storage
- **Graceful Degradation**: Fallback to basic functionality
- **User Notification**: Clear error messages and next steps

## Testing

### Authentication Flow Testing
```typescript
// Test login flow
const testLogin = async () => {
  const result = await login('test@example.com', 'password', false);
  expect(result.success).toBe(true);
  expect(result.message).toContain('Login successful');
};

// Test session management
const testSession = () => {
  const session = sessionManager.getSession();
  expect(session).toBeTruthy();
  expect(session.isAuthenticated).toBe(true);
};
```

## Troubleshooting

### Common Issues

#### Session Not Persisting
- Check if "Remember Me" is enabled
- Verify localStorage is available
- Check for browser privacy settings

#### Authentication Fails
- Verify API endpoint is accessible
- Check credentials format
- Review network connectivity

#### Session Expires Unexpectedly
- Check system clock accuracy
- Verify session refresh is working
- Review browser storage limits

### Debug Information
Enable debug logging by checking browser console for:
- Session storage/retrieval logs
- Authentication flow logs
- API response logs
- Session refresh logs

## Future Enhancements

### Planned Features
- **Multi-factor Authentication**: Additional security layer
- **Role-based Access Control**: Granular permissions
- **Session Analytics**: Usage tracking and insights
- **Offline Support**: Limited functionality without network
- **Biometric Authentication**: Touch/Face ID support

### Security Improvements
- **JWT Tokens**: Enhanced token-based authentication
- **Refresh Tokens**: Separate refresh token mechanism
- **Session Encryption**: Enhanced session data encryption
- **Rate Limiting**: API call rate limiting
- **Audit Logging**: Comprehensive security audit trail 