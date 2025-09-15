# Logo Size Adjustment Guide

## ✅ **What I've Done:**

- ✅ **Increased default size** from 36px to 48px in `components/icons.tsx`
- ✅ **Set navbar logo size** to 60px in `components/navbar.tsx`

## 🎯 **Different Ways to Change Logo Size:**

### **Method 1: Change Default Size (Global)**

```tsx
// In components/icons.tsx
export const Logo = ({ size = 48, ...props }) => (
  // This sets the default size for all logos
);
```

### **Method 2: Set Size in Specific Component**

```tsx
// In any component where you use <Logo />
<Logo size={80} />  // Large logo
<Logo size={40} />  // Medium logo
<Logo size={24} />  // Small logo
```

### **Method 3: Use CSS Classes**

```tsx
<Logo className="w-16 h-16" />  // 64px using Tailwind
<Logo className="w-20 h-20" />  // 80px using Tailwind
```

## 📏 **Size Examples:**

| Size (px) | Usage            | Example               |
| --------- | ---------------- | --------------------- |
| **24**    | Small icons      | `<Logo size={24} />`  |
| **36**    | Default (old)    | `<Logo size={36} />`  |
| **48**    | Default (new)    | `<Logo size={48} />`  |
| **60**    | Navbar (current) | `<Logo size={60} />`  |
| **80**    | Large            | `<Logo size={80} />`  |
| **100**   | Extra large      | `<Logo size={100} />` |

## 🎨 **Responsive Sizes:**

```tsx
// Different sizes for different screen sizes
<Logo size={60} className="md:w-16 md:h-16 lg:w-20 lg:h-20" />
```

## 🔧 **Quick Size Changes:**

### **Make it Bigger:**

```tsx
<Logo size={80} />
```

### **Make it Smaller:**

```tsx
<Logo size={40} />
```

### **Make it Responsive:**

```tsx
<Logo size={48} className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20" />
```

## 📱 **Current Settings:**

- **Default size**: 48px (in Logo component)
- **Navbar size**: 60px (in navbar)
- **Responsive**: Works on all screen sizes

---

Your logo is now larger and more prominent! 🚴‍♂️
