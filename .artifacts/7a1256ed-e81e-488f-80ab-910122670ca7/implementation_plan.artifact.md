# Fresh Start: FamilyFinance Clean Reconstruction

This plan outlines the steps to rebuild the project from scratch, ensuring a clean state, stable dependencies, and compatibility with the Expo Go app for mobile viewing.

## User Review Required

> [!IMPORTANT]
> This process will **delete all existing files** in the project directory after backing up the core logic.
> I have identified the following "needed" contents to preserve:
> - **Stores:** `useExpenseStore`, `useInvestmentStore`, `useFIREStore`, `useProfileStore`.
> - **Logic:** `calculations.ts`, `theme.ts`, `types/index.ts`.
> - **Screens:** Dashboard, Expenses, Investments, FIRE, and Profile tabs.

> [!WARNING]
> I will remove `react-native-worklets-core` and other complex native dependencies that are likely causing the "Update Expo Go" error, as they require a custom Development Build. We will stick to standard Expo modules to ensure you can view the app immediately on your phone.

## Proposed Changes

### 1. Backup & Cleanup
- Move core logic and UI components to a temporary `backup/` directory.
- Clear the root directory (excluding `.git` and the backup).

### 2. Initialization [NEW]
- Initialize a fresh Expo project using the current stable SDK (aligned with Expo Go).
- Install only necessary dependencies: `zustand`, `@react-native-async-storage/async-storage`, `expo-router`, `lucide-react-native` (or `@expo/vector-icons`), and `react-native-safe-area-context`.

### 3. Restoration [MODIFY]
- Restore the backed-up stores and utils.
- Re-implement the `app/` directory structure with optimized, clean versions of your current screens.
- Ensure the `App.tsx` redirects correctly to the new `app/` router.

### 4. Configuration [MODIFY]
- Update `app.json` with correct naming (`FamilyFinance`) and styling (Dark Mode).
- Configure `package.json` scripts for easy running.

## Verification Plan

### Automated Tests
- I will run `npx expo lint` (if configured) or check for TypeScript errors.

### Manual Verification
1. Run `npx expo start --tunnel`.
2. I will ask you to scan the QR code with Expo Go.
3. Verify that the Dashboard loads and calculations work as expected.
