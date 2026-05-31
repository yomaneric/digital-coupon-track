# Planning Guide

A mobile-first digital coupon wallet that helps users organize, track, and quickly access their online coupons and promo codes with merchant information, values, and scannable QR codes.

**Experience Qualities**:
1. **Swift** - Users can add or access coupons in under 3 seconds, perfect for checkout situations
2. **Organized** - Clear visual hierarchy makes it easy to scan through coupons and find what you need
3. **Reliable** - Coupons persist securely and are always available when needed

**Complexity Level**: Light Application (multiple features with basic state)
This is a straightforward CRUD application with persistent storage, but includes advanced features like QR code generation and URL handling that elevate it beyond a basic list manager.

## Essential Features

### Add New Coupon
- **Functionality**: Creates a new coupon entry with merchant name, value/discount, and URL/QR code
- **Purpose**: Allows users to save coupons they receive via email, websites, or apps
- **Trigger**: Tap floating action button or "Add Coupon" button
- **Progression**: Tap add button → Form appears with merchant, value, and URL fields → Fill information → Tap save → Coupon appears in list with auto-generated QR code
- **Success criteria**: Coupon persists to storage, appears in list immediately, QR code generates from URL if provided

### View Coupon List
- **Functionality**: Displays all saved coupons in an organized, scannable card layout
- **Purpose**: Quick overview of all available coupons
- **Trigger**: Default view on app load
- **Progression**: Open app → See list of coupon cards showing merchant, value, and preview
- **Success criteria**: All coupons load within 1 second, cards are easily tappable, information is readable at a glance

### View Coupon Details
- **Functionality**: Shows full coupon information including large QR code for scanning
- **Purpose**: Access the coupon for use at checkout
- **Trigger**: Tap any coupon card
- **Progression**: Tap coupon card → Details view opens → See full merchant info, coupon value, large QR code, and URL link
- **Success criteria**: QR code is scannable from screen, URL is clickable, all information is clearly visible

### Edit Coupon
- **Functionality**: Modify existing coupon information
- **Purpose**: Update changed codes, fix typos, or add missing information
- **Trigger**: Tap edit button in coupon details or from card menu
- **Progression**: Tap edit → Form pre-fills with current data → Modify fields → Save → Returns to updated view
- **Success criteria**: Changes persist immediately, QR code regenerates if URL changed

### Delete Coupon
- **Functionality**: Remove expired or used coupons
- **Purpose**: Keep the list clean and relevant
- **Trigger**: Swipe-to-delete on card or delete button in details
- **Progression**: Swipe left on card → Delete button appears → Confirm deletion → Card animates out of list
- **Success criteria**: Deletion is permanent, no orphaned data remains, list reflows smoothly

## Edge Case Handling

- **Empty State** - Show welcoming illustration and clear "Add your first coupon" prompt when no coupons exist
- **Invalid URLs** - Accept any text input; generate QR code from whatever is provided (could be a code, not just URL)
- **Long Merchant Names** - Truncate with ellipsis in card view, show full name in details
- **Duplicate Coupons** - Allow duplicates (user might have multiple codes for same merchant)
- **QR Code Generation Failure** - Show coupon code as text if QR generation fails
- **Rapid Actions** - Debounce saves to prevent data corruption from quick repeated taps

## Design Direction

The design should evoke a sense of **modern digital efficiency** - like a sleek wallet or organized filing system that's always in your pocket. It should feel **trustworthy and premium** (these are valuable savings), **energetic and action-oriented** (ready to use instantly), and **clean without being sterile** (friendly but focused).

## Color Selection

A vibrant, savings-focused palette that feels energetic and valuable without being overwhelming.

- **Primary Color**: Rich Purple `oklch(0.55 0.2 290)` - Communicates premium value and digital sophistication, used for primary actions and key UI elements
- **Secondary Colors**: Deep navy background `oklch(0.15 0.02 260)` creates depth and focus, with soft slate cards `oklch(0.22 0.02 260)` that feel substantial like physical cards
- **Accent Color**: Electric Lime `oklch(0.85 0.18 130)` - High-energy highlight for coupon values and savings amounts that draws attention and communicates benefit
- **Foreground/Background Pairings**:
  - Background (Deep Navy #1a1a2e): White text `oklch(0.98 0 0)` - Ratio 13.2:1 ✓
  - Card (Slate #2d2d44): White text `oklch(0.98 0 0)` - Ratio 10.8:1 ✓
  - Primary (Rich Purple): White text `oklch(0.98 0 0)` - Ratio 5.1:1 ✓
  - Accent (Electric Lime): Navy text `oklch(0.15 0.02 260)` - Ratio 9.8:1 ✓

## Font Selection

Typography should feel modern and highly legible on mobile screens, with strong distinction between merchant names and coupon information.

- **Typographic Hierarchy**:
  - H1 (Screen Titles): Space Grotesk Bold/32px/tight leading - Strong, geometric headers
  - H2 (Merchant Names): Space Grotesk SemiBold/20px/normal leading - Clear brand identification
  - Coupon Values: JetBrains Mono Bold/24px/tight leading - Monospace emphasizes code/value nature
  - Body (Details): Inter Regular/16px/relaxed leading - Clean, readable descriptions
  - Labels: Inter Medium/14px/normal leading - Subtle form guidance

## Animations

Animations should reinforce the tactile, card-based nature of the interface while maintaining speed. Card additions should feel like sliding into a wallet (slide-in from bottom with slight elastic bounce, 300ms). Deletions should feel decisive with a swipe-away motion (200ms). Opening coupon details should expand from the tapped card position (400ms ease-out). Loading states use a subtle shimmer effect rather than spinners. All interactions provide immediate feedback with micro-animations (scale on tap, 100ms).

## Component Selection

- **Components**:
  - **Card**: Primary container for coupon entries in list view, with hover/tap states
  - **Dialog**: Full-screen on mobile for add/edit forms and coupon details
  - **Sheet**: Alternative for detail view that slides up from bottom
  - **Button**: Primary actions (Add, Save, Delete) with loading states
  - **Input**: Text fields for merchant, value, URL with clear labels
  - **Textarea**: For longer URLs or notes field
  - **Alert Dialog**: Confirmation for destructive delete action
  - **Badge**: Display coupon value/discount prominently on cards
  - **Separator**: Subtle dividers between form sections
- **Customizations**:
  - QR Code Generator: Custom component using `qrcode` library or canvas API
  - Coupon Card: Custom card component with swipe-to-delete gesture support
  - Empty State: Custom illustration and messaging component
  - Floating Action Button: Fixed position add button with purple gradient
- **States**:
  - Buttons: Resting (vibrant purple), Pressed (darker shade + scale 0.95), Disabled (muted opacity 0.5)
  - Cards: Resting (slate background), Hover/Tap (subtle glow + lift), Swiping (translate + opacity change)
  - Inputs: Focused (purple border + subtle glow), Error (red border with shake animation), Valid (lime accent)
- **Icon Selection**:
  - Add: Plus (bold weight) on floating action button
  - Edit: PencilSimple for edit actions
  - Delete: Trash for destructive actions
  - QR Code: QrCode icon as visual indicator
  - Link: Link or LinkSimple for URL fields
  - Store: Storefront for merchant field indicator
  - Tag: Tag or Percent for coupon value field
- **Spacing**:
  - Container padding: p-4 (16px) for mobile screens
  - Card spacing: gap-3 (12px) between cards in list
  - Form fields: gap-4 (16px) between inputs
  - Internal card padding: p-4 (16px) for comfortable touch targets
  - Section spacing: gap-6 (24px) between major sections
- **Mobile**:
  - Single column layout throughout (no grid needed)
  - Full-screen dialogs/sheets for forms and details
  - Minimum touch targets of 44px height for all interactive elements
  - Bottom navigation or floating action button for primary add action
  - Swipe gestures for delete (left swipe reveals delete button)
  - Fixed header with title stays visible during scroll
  - Cards stretch full width with slight horizontal margin (mx-4)
