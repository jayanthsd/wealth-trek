## MODIFIED Requirements

### Requirement: Pricing page includes call-to-action
The system SHALL provide visually distinct CTA buttons for each pricing tier with Framer Motion micro-interactions (scale 1.03 on hover, 0.97 on tap). For unauthenticated users, paid tier CTAs SHALL open the Clerk sign-up modal. For authenticated users, paid tier CTAs SHALL initiate the Razorpay Checkout payment flow. The Free tier CTA SHALL continue to open the Clerk sign-up modal for unauthenticated users and navigate to the dashboard for authenticated users.

#### Scenario: Unauthenticated user sees sign-in CTA on paid tiers
- **WHEN** an unauthenticated user views a paid pricing tier
- **THEN** system SHALL display the CTA button that opens the Clerk sign-up modal with clear pressed/loading feedback during interaction

#### Scenario: Authenticated user sees payment CTA on paid tiers
- **WHEN** an authenticated user views the Professional or Enterprise pricing tier
- **THEN** system SHALL display a CTA button that initiates the Razorpay Checkout payment flow with a loading state while the order is being created

#### Scenario: CTA redirects to authentication for free tier
- **WHEN** an unauthenticated user clicks the Free tier CTA
- **THEN** system SHALL open the Clerk sign-up modal

#### Scenario: Authenticated user on free tier sees dashboard link
- **WHEN** an authenticated user views the Free tier
- **THEN** system SHALL display a CTA that navigates to the dashboard

#### Scenario: CTA shows loading state during order creation
- **WHEN** an authenticated user clicks a paid tier CTA and the order is being created
- **THEN** system SHALL display a loading indicator on the button until the Razorpay Checkout modal opens

### Requirement: Pricing page shows current plan status
The system SHALL display the authenticated user's current subscription plan on the pricing page, highlighting their active tier.

#### Scenario: Authenticated user with active subscription
- **WHEN** an authenticated user with an active Professional subscription views the pricing page
- **THEN** system SHALL display a "Current Plan" badge on the Professional tier card and change its CTA to indicate the plan is active

#### Scenario: Authenticated user with no subscription
- **WHEN** an authenticated user with no active subscription views the pricing page
- **THEN** system SHALL display standard CTAs for all tiers with no "Current Plan" indicators

#### Scenario: Unauthenticated user sees no plan status
- **WHEN** an unauthenticated user views the pricing page
- **THEN** system SHALL NOT display any "Current Plan" badges or subscription status
