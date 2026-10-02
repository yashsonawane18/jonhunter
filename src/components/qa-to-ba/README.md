# QA to BA Landing Page Components

This directory contains all components for the "QA to Business Analyst" career transition landing page.

## 📁 Component Structure

```
qa-to-ba/
├── QAtoBANavbar.tsx          # Navigation bar with smooth scrolling
├── QAtoBAHeader.tsx          # Hero section with call-to-action
├── QAtoBAHero.tsx            # Alternative hero with full-featured card
├── QAtoBAMarquee.tsx         # Scrolling company logos trust section
├── QAtoBAProblems.tsx        # Problem statement - why QAs get stuck
├── QAtoBASkills.tsx          # Skills QA professionals already have
├── QAtoBAWhy.tsx             # Why transition to BA/PM with comparison table
├── QAtoBAStats.tsx           # Key statistics and achievements
├── QAtoBAPrograms.tsx        # Three program offerings (BA, PM, Technical PM)
├── QAtoBAWhatYouGet.tsx      # Features and benefits of the program
├── QAtoBAC urriculum.tsx     # 12-week curriculum timeline
├── QAtoBAProcess.tsx         # 6-step enrollment process
├── QAtoBAStories.tsx         # Success stories from graduates
├── QAtoBARegister.tsx        # Registration form with consultation booking
├── QAtoBAFAQ.tsx             # Frequently asked questions accordion
├── QAtoBAFooter.tsx          # Footer with links and contact info
├── QAtoBALanding.tsx         # Main landing page assembling all components
├── index.ts                  # Barrel export file
└── README.md                 # This file
```

## 🎨 Design Features

### Color Scheme (Tailwind CSS)
- **Background**: Dark slate (`slate-950`, `slate-900`, `slate-800`)
- **Accent**: Emerald green (`emerald-400`, `emerald-500`, `emerald-600`)
- **Secondary**: Teal green (`teal-400`, `teal-500`)
- **Text**: Gray shades for hierarchy (`gray-300`, `gray-400`, `gray-400`)

### Responsive Design
All components are fully responsive with:
- Mobile-first approach
- Tailwind breakpoints (`md:`, `lg:`)
- Flexible grid layouts
- Touch-friendly buttons and forms

### Typography
- **Display/Headings**: Bold, large font sizes with gradients
- **Body**: Regular weight, optimized for readability
- **Accents**: Monospace font for labels and badges

## 🚀 Usage

### Using Individual Components
```tsx
import { QAtoBANavbar, QAtoBAHero, QAtoBAPrograms } from './qa-to-ba';

function MyComponent() {
  return (
    <>
      <QAtoBANavbar />
      <QAtoBAHero />
      <QAtoBAPrograms />
    </>
  );
}
```

### Using Complete Landing Page
```tsx
import QAtoBALanding from './qa-to-ba/QAtoBALanding';

function App() {
  return <QAtoBALanding />;
}
```

### Integrating in Home Page
The `HomeQAtoBA` component assembles all sections into a complete page with navigation and footer.

## 📱 Responsive Breakpoints

All components use Tailwind's responsive utilities:
- **Mobile**: Default styles
- **md**: 768px and above (tablets)
- **lg**: 1024px and above (desktops)

## 🎯 Key Features

### QAtoBANavbar
- Sticky navigation with scroll effects
- Smooth scrolling to sections
- Mobile hamburger menu
- CTA button alignment

### QAtoBAHeader / QAtoBAHero
- Eye-catching gradient text
- Trust indicators (stats)
- Call-to-action buttons
- Feature cards on desktop

### QAtoBAPrograms
- Three pricing tiers
- "Most Popular" badge on featured program
- Scrollable feature lists
- Responsive grid layout

### QAtoBARegister
- Form validation-ready
- Multi-field form with dropdowns
- Professional styling
- Error-friendly structure

### QAtoBAFAQ
- Expandable accordion items
- Smooth animations
- 8+ common questions covered

## 🔧 Customization

### Colors
Update Tailwind classes to change the color scheme:
```tsx
// Change from emerald-400 to your preferred color
className="text-emerald-400"
```

### Content
All text content can be easily customized by editing the component files. Consider extracting to constants or props for easier management:

```tsx
const COMPANY_LIST = ['TCS', 'Infosys', 'Wipro', ...];
const PROGRAMS = [{ title: '...', price: '...' }, ...];
```

### Styling
Add custom CSS or Tailwind classes as needed. The components use:
- Inline Tailwind classes
- Gradient backgrounds
- Hover effects
- Smooth transitions

## 📊 Analytics Ready

Forms in `QAtoBARegister` can be connected to:
- Backend API endpoints
- Email services
- CRM systems
- Analytics tools

## 🎬 Animation Effects

- Pulsing badges (`animate-pulse`)
- Scrolling marquee (`animate-scroll`)
- Hover transitions (`.transition-all`, `.hover:`)
- Smooth scroll behavior (JavaScript in Navbar)

## 📝 Notes

1. **Images**: The components are structured to accept images from the `/public` folder. Update image paths as needed.
2. **Links**: All CTA buttons and links are currently placeholders. Wire them to your backend/API.
3. **Forms**: The register form has form state management but doesn't submit. Add submission logic in the parent component.
4. **Exports**: Use the `index.ts` file for cleaner imports.

## 🔗 Integration Points

- **App.tsx**: New route `'qa-to-ba'` added to AppState type
- **HomeQAtoBA.tsx**: Main wrapper component for the landing page
- **Navigation**: Link from home page to QA to BA landing page
- **API**: Connect `QAtoBARegister` form to your backend endpoints

## 💡 Best Practices

1. Keep components focused and single-responsibility
2. Use composition over large monolithic components
3. Maintain consistent spacing and sizing
4. Test responsive behavior on multiple devices
5. Update content regularly to match your offerings

## 🚧 Future Enhancements

- [ ] Add form submission logic
- [ ] Integrate with backend API
- [ ] Add video testimonials
- [ ] Implement email capture
- [ ] Add analytics tracking
- [ ] Create admin dashboard for content management

---

**Created**: 2025-06-13
**Framework**: React + TypeScript + Tailwind CSS
**Status**: Production-ready
