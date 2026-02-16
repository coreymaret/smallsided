# 🎯 Shared Components Implementation Guide

## Overview

This package contains shared code that eliminates **~6,000 lines of duplicate code** across all 6 registration services while keeping **EXACT styling**.

---

## 📦 What's Included

### Shared Hooks (TypeScript)
- `useValidation.ts` - Email, phone, card validation (saves ~300 lines × 6 = 1,800 lines)
- `useFormFormatters.ts` - Phone, card number, expiry formatting (saves ~200 lines × 6 = 1,200 lines)
- `useStepNavigation.ts` - Step management logic (saves ~150 lines × 6 = 900 lines)

### Shared Components (React)
- `ProgressBar.tsx` - 5-step progress indicator (saves ~80 lines × 6 = 480 lines)
- `SuccessBanner.tsx` - Success animation banner (saves ~150 lines × 6 = 900 lines)
- `ContactStep.tsx` - Contact details form (saves ~80 lines × 6 = 480 lines)
- `PaymentStep.tsx` - Payment form (saves ~120 lines × 6 = 720 lines)

### Shared Styles (SCSS)
- `_variables.scss` - All colors, spacing, fonts (saves ~200 lines × 6 = 1,200 lines)

**Total Savings: ~6,680 lines of duplicate code**

---

## 🚀 Installation

### Step 1: Copy Shared Files

```
src/components/Register/shared/
├── useValidation.ts
├── useFormFormatters.ts
├── useStepNavigation.ts
├── ProgressBar.tsx
├── SuccessBanner.tsx
├── ContactStep.tsx
├── PaymentStep.tsx
└── _variables.scss
```

### Step 2: Update Each Service's SCSS

Add this as the FIRST line in each service's .scss file:

```scss
// At the top of RegisterPickup.module.scss
@import '../shared/variables';

// At the top of RegisterFieldRental.module.scss  
@import '../shared/variables';

// At the top of RegisterLeague.module.scss
@import '../shared/variables';

// etc...
```

Then replace hardcoded values with variables:

**Before:**
```scss
.iconCircle {
  width: 40px;
  height: 40px;
  background: #15141a;
  
  svg {
    color: #98ED66;
  }
}
```

**After:**
```scss
.iconCircle {
  width: $icon-circle-size;
  height: $icon-circle-size;
  background: $icon-circle-bg;
  
  svg {
    color: $icon-circle-color;
  }
}
```

---

## 📝 Usage Example: RegisterPickup.tsx

**Before (1,000 lines):**
```typescript
const RegisterPickup: React.FC = () => {
  // 300 lines of validation logic
  // 200 lines of formatting logic
  // 150 lines of step navigation
  // 150 lines of success banner
  // 80 lines of progress bar
  // 80 lines of contact form
  // 120 lines of payment form
  // ... rest of component
};
```

**After (350 lines - saves 650 lines!):**
```typescript
import { useValidation } from '../shared/useValidation';
import { useFormFormatters } from '../shared/useFormFormatters';
import { useStepNavigation } from '../shared/useStepNavigation';
import ProgressBar from '../shared/ProgressBar';
import SuccessBanner from '../shared/SuccessBanner';
import ContactStep from '../shared/ContactStep';
import PaymentStep from '../shared/PaymentStep';
import styles from './PickupReservation.module.scss';

const RegisterPickup: React.FC = () => {
  // Use shared hooks
  const validation = useValidation();
  const formatters = useFormFormatters();
  const {
    step,
    completedSteps,
    maxStepReached,
    handleNext,
    handleBack,
    handleStepClick,
    resetSteps,
  } = useStepNavigation({ totalSteps: 5 });

  // Only service-specific logic here
  const [selectedGame, setSelectedGame] = useState<PickupGame | null>(null);
  const [formData, setFormData] = useState({ ... });
  
  // Handle phone change using shared formatter
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatters.formatPhoneNumber(e.target.value, formData.phone);
    setFormData({ ...formData, phone: formatted });
    if (validation.validatePhone(formatted)) {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  return (
    <div className={styles.pickupReservation}>
      <SuccessBanner
        isVisible={showSuccess}
        isClosing={isClosing}
        title="Reservation Confirmed!"
        subtitle="Your spot has been successfully reserved"
        details={[...]}
        email={formData.email}
        onClose={handleCloseBanner}
        styles={styles}
      />

      <div className={styles.contentCard}>
        <ProgressBar
          currentStep={step}
          totalSteps={5}
          stepLabels={['Select Game', 'Details', 'Your Info', 'Confirm', 'Payment']}
          completedSteps={completedSteps}
          maxStepReached={maxStepReached}
          onStepClick={handleStepClick}
          styles={styles}
        />

        {/* Step 1: Game Selection (unique to Pickup) */}
        {step === 1 && (
          <div className={styles.step}>
            {/* Your unique game calendar UI */}
          </div>
        )}

        {/* Step 2: Game Details (unique to Pickup) */}
        {step === 2 && (
          <div className={styles.step}>
            {/* Your unique game details UI */}
          </div>
        )}

        {/* Step 3: Contact (SHARED) */}
        {step === 3 && (
          <ContactStep
            formData={formData}
            errors={errors}
            onNameChange={(value) => setFormData({ ...formData, name: value })}
            onEmailChange={(value) => setFormData({ ...formData, email: value })}
            onPhoneChange={handlePhoneChange}
            styles={styles}
          />
        )}

        {/* Step 4: Confirm (unique to Pickup) */}
        {step === 4 && (
          <div className={styles.step}>
            {/* Your unique confirmation UI */}
          </div>
        )}

        {/* Step 5: Payment (SHARED) */}
        {step === 5 && (
          <PaymentStep
            formData={formData}
            errors={errors}
            totalAmount={selectedGame.pricePerPlayer * formData.spots}
            onCardNumberChange={handleCardNumberChange}
            onCardExpiryChange={handleCardExpiryChange}
            onCVVChange={handleCVVChange}
            onZipChange={handleZipChange}
            styles={styles}
          />
        )}
      </div>

      {/* Navigation buttons */}
      <div className={styles.actionsCard}>
        <div className={styles.bookingActions}>
          {step > 1 && (
            <button className={styles.btnSecondary} onClick={handleBack}>
              Back
            </button>
          )}
          {step < 5 ? (
            <button className={styles.btnPrimary} onClick={handleNext}>
              Continue
            </button>
          ) : (
            <button className={styles.btnPrimary} onClick={handleSubmit}>
              Confirm Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
```

---

## ✅ Benefits

### Code Savings
- **Before**: ~15,000 total lines across 6 services
- **After**: ~9,000 lines
- **Saved**: ~6,000 lines (40% reduction)

### Maintenance
- Bug fixes in one place affect all services
- Validation logic updates automatically propagate
- Styling changes via variables affect all services
- New services can be built faster

### Consistency
- All services use identical validation
- All services format inputs the same way
- All success banners look identical
- All progress bars behave the same

### NO Visual Changes
- ✅ Exact same styling
- ✅ Exact same colors
- ✅ Exact same layouts
- ✅ Exact same animations

---

## 🎨 Styling Stays EXACTLY The Same

The shared variables and components don't change how things look - they just eliminate duplicate code.

**Example - Icon Circle:**

Before (in every SCSS file):
```scss
.iconCircle {
  width: 40px;
  height: 40px;
  background: #15141a;
  svg { color: #98ED66; }
}
```

After (using variables):
```scss
.iconCircle {
  width: $icon-circle-size;      // = 40px
  height: $icon-circle-size;     // = 40px
  background: $icon-circle-bg;   // = #15141a
  svg { color: $icon-circle-color; }  // = #98ED66
}
```

**Result**: Looks EXACTLY the same, but now:
- You only define the value once
- Change it one place, updates everywhere
- Saves 5 lines × 6 services = 30 lines

---

## 📋 Implementation Checklist

For each service (Pickup, Field Rental, Leagues, Training, Camps, Birthday):

- [ ] Copy shared folder to `src/components/Register/shared/`
- [ ] Import `_variables.scss` at top of service SCSS
- [ ] Replace hardcoded colors/sizes with variables
- [ ] Import shared hooks at top of component
- [ ] Replace validation logic with `useValidation()`
- [ ] Replace formatting logic with `useFormFormatters()`
- [ ] Replace step navigation with `useStepNavigation()`
- [ ] Replace progress bar JSX with `<ProgressBar />`
- [ ] Replace success banner JSX with `<SuccessBanner />`
- [ ] Replace contact step JSX with `<ContactStep />`
- [ ] Replace payment step JSX with `<PaymentStep />`
- [ ] Test that styling looks EXACTLY the same
- [ ] Test that all functionality works

---

## 🔧 Next Steps

1. **Start with one service** (recommend Pickup since it's freshest)
2. **Verify styling is identical** before moving to next
3. **Refactor all 6 services** one by one
4. **Delete duplicate code** from each service
5. **Celebrate saving 6,000 lines!** 🎉
