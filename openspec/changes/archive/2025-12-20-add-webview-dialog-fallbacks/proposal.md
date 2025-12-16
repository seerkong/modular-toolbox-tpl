# Change: Add webview-safe dialog primitives

## Why
Desktop WebView lacks native `alert`/`confirm`/`prompt` support, leaving current Vue flows broken and React without any replacements. We need consistent, in-app toast/confirm/alert feedback that works in the embedded browser.

## What Changes
- Add custom toast + confirm/alert UI components for both Vue and React shells, exported as functions that mimic native ergonomics without relying on browser dialogs.
- Replace existing `alert`/`confirm`/`showToast` usages in frontend modules with the new wrappers.
- Add execution result toasts for Admin Assign single and batch actions so users get success/failure feedback in both shells.

## Impact
- Affected specs: frontend-ui-feedback
- Affected code: frontend/packages/vue, frontend/packages/react
