graph TD
    A[User clicks protected route] --> B[Router checks authGuard]
    B --> C[Guard injects AuthService]
    C --> D{User authenticated?}
    D -->|Yes| E[Allow navigation]
    D -->|No| F[Redirect to /auth]
    F --> G[Store intended route]
