# Walkthrough - Bug Fix: Admin 401 Unauthorized Error & User Authentication Bypass

We have identified and resolved the authentication issues in the `auth-service` module.

## Issues Resolved

1. **Inverted Password Logic / Security Bypass**:
   - The password validation logic was checking `if (request.getPassword().equals(user.getPassword()))` and throwing an `UnauthorizedException` if they matched. This resulted in:
     - Users and Admin getting a **401 Unauthorized** error when they entered their **correct** password.
     - Users and Admin getting successfully logged in if they entered an **incorrect** password.
   - We corrected this validation by throwing the exception when passwords **do not** match.

2. **Plaintext Password Storage**:
   - The application had a `PasswordEncoder` bean (`BCryptPasswordEncoder`) defined but commented out in the authentication service, resulting in plaintext password comparisons.
   - We re-enabled and integrated the `PasswordEncoder` so that passwords are properly hashed in the database and compared securely.

---

## Detailed Changes

### [AuthServiceImpl.java](file:///C:/Intel/hackathon-template-main/auth-service/src/main/java/com/hackathon/auth/service/AuthServiceImpl.java)

- Uncommented the `PasswordEncoder` field injection in the constructor.
- Modified the registration mapping to hash user passwords before saving them:
  ```java
  .password(passwordEncoder.encode(request.getPassword()))
  ```
- Replaced the plaintext matching bug in the login route with BCrypt-based verification:
  ```java
  if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
      throw new UnauthorizedException("Invalid username or password");
  }
  ```

### [DatabaseInitializer.java](file:///C:/Intel/hackathon-template-main/auth-service/src/main/java/com/hackathon/auth/config/DatabaseInitializer.java)

- Hash the seeded admin user password using `passwordEncoder` when resetting/seeding the database, ensuring it matches the BCrypt hashing scheme:
  ```java
  .password(passwordEncoder.encode("Hackathon@123"))
  ```

---

## Verification

The service compiles and builds successfully with Maven:
- Built module with `mvn clean compile` -> **BUILD SUCCESS**
