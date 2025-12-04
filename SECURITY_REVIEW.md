# Security Review - Authentication System

## ✅ **Good Security Practices Already Implemented**

1. **Password Security**
   - ✅ Bcrypt hashing with salt
   - ✅ Password validation (8-16 chars, uppercase, lowercase, number)
   - ✅ Passwords never logged or exposed

2. **JWT Token Security**
   - ✅ HttpOnly cookies (prevents XSS)
   - ✅ Secure flag in production
   - ✅ SameSite=Lax (CSRF protection)
   - ✅ Token expiration (24 hours)
   - ✅ No tokens in URLs

3. **OAuth Security**
   - ✅ State parameter for CSRF protection
   - ✅ State stored in HttpOnly cookie
   - ✅ State expiration (10 minutes)
   - ✅ State marked as used (prevents replay)

4. **Email Verification**
   - ✅ Token expiration (24 hours)
   - ✅ Tokens invalidated after use
   - ✅ Email verification required for email/password login

5. **Input Validation**
   - ✅ Pydantic schemas with validators
   - ✅ SQLAlchemy ORM (prevents SQL injection)
   - ✅ Email format validation

6. **Error Handling**
   - ✅ Generic error messages (prevents enumeration)
   - ✅ No sensitive data in error responses

## ⚠️ **Security Issues Found**

### 🔴 **CRITICAL Issues**

1. **No Rate Limiting**
   - **Risk**: Brute force attacks on login/register/resend-verification
   - **Impact**: Attackers can attempt unlimited login attempts
   - **Fix**: Implement rate limiting middleware (e.g., `slowapi` or `fastapi-limiter`)

2. **Email Enumeration in Resend Verification**
   - **Location**: `user_email.py:248-260`
   - **Issue**: Different responses reveal if email exists
   - **Current**: Returns 400 if already verified (reveals email exists)
   - **Fix**: Always return success message, even if email doesn't exist or is verified

3. **OAuth State Storage in Memory**
   - **Location**: `user_oauth.py:48`
   - **Issue**: `oauth_states = {}` - lost on server restart, not scalable
   - **Risk**: State validation fails after restart, potential DoS
   - **Fix**: Use Redis or database for state storage

4. **Console.log in Production Code**
   - **Location**: `email-verify/page.tsx:42`
   - **Issue**: `console.log("status", status)` exposes sensitive state
   - **Fix**: Remove or use proper logging with environment checks

### 🟡 **MEDIUM Priority Issues**

5. **Missing CSRF Token for State-Changing Operations**
   - **Issue**: POST requests (register, login, resend) don't have CSRF tokens
   - **Risk**: CSRF attacks if SameSite cookie is bypassed
   - **Fix**: Add CSRF tokens for state-changing operations OR ensure SameSite=Strict

6. **Token in URL Parameters (Email Verification)**
   - **Location**: Email verification links include token in URL
   - **Risk**: Tokens can be logged in server logs, browser history, referrer headers
   - **Mitigation**: Already using POST for verification, but email links use GET
   - **Fix**: Consider POST-based verification or very short-lived tokens

7. **No Account Lockout**
   - **Issue**: No account lockout after failed login attempts
   - **Risk**: Brute force attacks can continue indefinitely
   - **Fix**: Implement account lockout after N failed attempts

8. **Unverified Account Cleanup Too Aggressive**
   - **Location**: `user_email.py:78-84`
   - **Issue**: Deletes unverified accounts after 5 minutes (too short)
   - **Risk**: Legitimate users might lose accounts if email is delayed
   - **Fix**: Increase to 24-48 hours or make configurable

9. **No Password Reset Rate Limiting**
   - **Issue**: Resend verification can be called unlimited times
   - **Risk**: Email spam, DoS on email service
   - **Fix**: Rate limit resend verification (e.g., 3 per hour per email)

10. **Missing Security Headers**
    - **Issue**: No explicit security headers (CSP, X-Frame-Options, etc.)
    - **Risk**: XSS, clickjacking attacks
    - **Fix**: Add security headers middleware

### 🟢 **LOW Priority / Best Practices**

11. **JWT Secret Key Validation**
    - ✅ Already validated at startup (good!)

12. **Password Requirements**
    - ✅ Good validation rules

13. **Email Verification Token Length**
    - ✅ Using `secrets.token_urlsafe(32)` - good entropy

14. **Cookie Domain Configuration**
    - ⚠️ Domain set to `None` for localhost (correct)
    - ⚠️ Should verify production domain is correct

15. **Error Message Consistency**
    - ✅ Good generic error messages

## 📋 **Recommended Fixes**

### Priority 1 (Critical - Fix Immediately)

1. **Add Rate Limiting**
```python
# Add to requirements.txt
slowapi==0.1.9

# In main.py or router
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Apply to routes
@router.post("/login")
@limiter.limit("5/minute")
async def login(...):
    ...

@router.post("/register")
@limiter.limit("3/hour")
async def register(...):
    ...

@router.post("/resend-verification")
@limiter.limit("3/hour")
async def resend_verification(...):
    ...
```

2. **Fix Email Enumeration**
```python
@router.post("/resend-verification")
async def resend_verification(...):
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    
    # Always return success to prevent enumeration
    if not user:
        return {"message": "If the email exists, a verification email has been sent"}
    
    if user.email_verified:
        # Don't reveal verification status - just return success
        return {"message": "If the email exists, a verification email has been sent"}
    
    # Continue with sending email...
```

3. **Remove Console.log**
```typescript
// Remove this from email-verify/page.tsx
useEffect(() => {
  console.log("status", status); // ❌ REMOVE THIS
}, [status]);
```

4. **Use Redis for OAuth State**
```python
import redis
import json

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def store_oauth_state(state: str, data: dict):
    redis_client.setex(
        f"oauth_state:{state}",
        STATE_EXPIRATION_MINUTES * 60,
        json.dumps(data)
    )

def get_oauth_state(state: str) -> Optional[dict]:
    data = redis_client.get(f"oauth_state:{state}")
    if data:
        return json.loads(data)
    return None
```

### Priority 2 (High - Fix Soon)

5. **Add Account Lockout**
```python
# Add to User model
failed_login_attempts: int = 0
locked_until: Optional[datetime] = None

# In login route
if user.locked_until and datetime.utcnow() < user.locked_until:
    raise HTTPException(status_code=423, detail="Account temporarily locked")

if not verify_password(...):
    user.failed_login_attempts += 1
    if user.failed_login_attempts >= 5:
        user.locked_until = datetime.utcnow() + timedelta(minutes=30)
    await db.commit()
    raise HTTPException(...)
```

6. **Add Security Headers Middleware**
```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        return response

app.add_middleware(SecurityHeadersMiddleware)
```

### Priority 3 (Medium - Nice to Have)

7. **Increase Unverified Account Cleanup Time**
```python
# Change from 5 minutes to 24 hours
await db.execute(
    text("""
        DELETE FROM users 
        WHERE email_verified = false 
        AND created_at < NOW() - INTERVAL '24 hours'
    """)
)
```

8. **Add Request ID for Logging**
```python
import uuid
from starlette.middleware.base import BaseHTTPMiddleware

class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        request_id = str(uuid.uuid4())
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
```

## ✅ **Summary**

**Overall Security Rating: 7/10**

**Strengths:**
- Good password hashing and validation
- HttpOnly cookies for JWT
- OAuth state protection
- Email verification required
- Input validation

**Critical Gaps:**
- No rate limiting (brute force vulnerability)
- Email enumeration possible
- OAuth state in memory (not production-ready)
- Console.log in production code

**Recommendation:** Implement Priority 1 fixes before production deployment.

