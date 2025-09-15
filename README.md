# PedalNepal - Bike Rental System

A modern bike rental application built with Next.js 14, featuring external API integration and local storage fallback.

## Features

- **External API Integration**: Connects to external authentication service with fallback to localStorage
- **Multi-language Support**: English and Nepali language support
- **Real-time User Tracking**: Admin dashboard with active user monitoring
- **Smart Slot Management**: Dynamic bike slot allocation and return system
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Admin Dashboard**: Comprehensive management interface

## Technologies Used

- [Next.js 14](https://nextjs.org/docs/getting-started)
- [HeroUI v2](https://heroui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tailwind Variants](https://tailwind-variants.org)
- [TypeScript](https://www.typescriptlang.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [next-themes](https://github.com/pacocoursey/next-themes)

[Try it on CodeSandbox](https://githubbox.com/heroui-inc/heroui/next-app-template)

## Technologies Used

- [Next.js 14](https://nextjs.org/docs/getting-started)
- [HeroUI v2](https://heroui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tailwind Variants](https://tailwind-variants.org)
- [TypeScript](https://www.typescriptlang.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [next-themes](https://github.com/pacocoursey/next-themes)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# External API Configuration
NEXT_PUBLIC_EXTERNAL_API_BASE_URL=http://13.204.148.32
NEXT_PUBLIC_USE_EXTERNAL_API=true
NEXT_PUBLIC_APP_NAME=PedalNepal
```

### Environment Variables Explained

- `NEXT_PUBLIC_EXTERNAL_API_BASE_URL`: Base URL for the external authentication API
- `NEXT_PUBLIC_USE_EXTERNAL_API`: Enable/disable external API usage (true/false)
- `NEXT_PUBLIC_APP_NAME`: Application name for branding

## How to Use

### Install dependencies

```bash
npm install
```

### Setup Environment Variables

Copy the `.env.example` file to `.env.local` and update the values:

```bash
cp .env.example .env.local
```

### Run the development server

```bash
npm run dev
```

## External API Integration

The application integrates with an external authentication service with automatic fallback to localStorage:

### API Endpoints

- **Login**: `POST /auth/login` with `{ mobile, password }`
- **Signup**: `POST /auth/signup` with `{ mobile, email, password, name }`

### Testing External API

Use the browser console to test the external API connection:

```javascript
// Test external API connection
testExternalAPI();

// Toggle between external and local APIs
toggleExternalAPI();

// Clear local storage
clearpedalNepalStorage();
```

### Setup pnpm (optional)

If you are using `pnpm`, you need to add the following code to your `.npmrc` file:

```bash
public-hoist-pattern[]=*@heroui/*
```

After modifying the `.npmrc` file, you need to run `pnpm install` again to ensure that the dependencies are installed correctly.

## License

Licensed under the [MIT license](https://github.com/heroui-inc/next-app-template/blob/main/LICENSE).
