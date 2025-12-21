# Google Translate Integration

## Overview

This implementation provides a beautiful, captivating language selector integrated with Google Translate for automatic website translation.

## Components

### 1. GoogleTranslate Component

**File:** `components/GoogleTranslate.tsx`

- Loads the Google Translate script dynamically
- Hides the default Google Translate widget
- Supports 13 languages: English, Spanish, French, German, Italian, Portuguese, Arabic, Hindi, Chinese, Japanese, Korean, Russian, Turkish
- TypeScript-safe with proper type definitions

### 2. LanguageSelector Component

**File:** `components/LanguageSelector.tsx`

A beautiful, modern language dropdown with:

- 🎨 **Captivating Design**: Gradient backgrounds, smooth animations, and hover effects
- 🌍 **Visual Language Selection**: Flag emojis for each language
- ✨ **Smooth Animations**: Fade-in effects and rotation transitions
- 📱 **Responsive**: Works on both desktop and mobile
- 🎯 **Active State**: Shows checkmark for currently selected language
- 🎨 **Custom Scrollbar**: Orange-themed scrollbar matching your brand

### 3. Integration in Header

**File:** `components/Header.tsx`

- Desktop: Language selector appears in the navigation bar between "List Your Business" and user profile
- Mobile: Language selector appears in the mobile menu at the top

## Features

### Visual Design

- **Gradient Background**: Black to gray gradient with blur effect
- **Orange Accent**: Orange/pink gradient for selected language
- **Globe Icon**: Animated globe icon with rotation on hover
- **Flag Emojis**: Visual representation of each language
- **Smooth Transitions**: All interactions are animated smoothly

### Supported Languages

1. 🇬🇧 English (en)
2. 🇪🇸 Español (es)
3. 🇫🇷 Français (fr)
4. 🇩🇪 Deutsch (de)
5. 🇮🇹 Italiano (it)
6. 🇵🇹 Português (pt)
7. 🇸🇦 العربية (ar)
8. 🇮🇳 हिन्दी (hi)
9. 🇨🇳 中文 (zh-CN)
10. 🇯🇵 日本語 (ja)
11. 🇰🇷 한국어 (ko)
12. 🇷🇺 Русский (ru)
13. 🇹🇷 Türkçe (tr)

## How It Works

1. **GoogleTranslate Component**: Loads in the background, hidden from view
2. **LanguageSelector Dropdown**: User sees a beautiful, branded dropdown
3. **Selection Trigger**: When user selects a language, the component programmatically triggers Google Translate
4. **Translation**: Google Translate translates the entire page to the selected language
5. **Persistence**: Language preference is maintained while browsing the site

## Customization

### Adding More Languages

Edit `components/LanguageSelector.tsx`:

```typescript
const languages: Language[] = [
  // Add new languages here
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  // ...
];
```

Then update `components/GoogleTranslate.tsx`:

```typescript
includedLanguages: "en,es,fr,de,it,pt,ar,hi,zh-CN,ja,ko,ru,tr,nl",
```

### Changing Colors

The component uses Tailwind CSS classes. Main colors:

- Background: `from-gray-900 to-black`
- Selected: `from-orange-500/30 to-pink-500/30`
- Hover: `hover:bg-white/5`

### Custom Styles

Additional styles are in `app/globals.css` under the "Custom animations for language selector" section.

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Google Translate API support required

## Notes

- Google Translate may take a moment to load on first page visit
- The original Google Translate widget is completely hidden
- No Google Translate branding appears on the page
- Translation persists across page navigations
