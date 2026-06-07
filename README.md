# 🍽️ مطعم الحبايب - AlHabayeb Restaurant

مشروع موقع مطعم احترافي متكامل مبني بـ React + Vite + Tailwind CSS

## 🚀 تشغيل المشروع

```bash
npm install
npm run dev
```

ثم افتح المتصفح على: http://localhost:5173

## 🛠️ التقنيات المستخدمة

- **React 18** - مكتبة واجهة المستخدم
- **Vite** - أداة البناء السريعة
- **Tailwind CSS** - إطار عمل CSS
- **React Router v6** - التوجيه
- **Framer Motion** - الأنيميشن
- **Zustand** - إدارة الحالة
- **React Hot Toast** - الإشعارات
- **Recharts** - الرسوم البيانية
- **React Icons** - الأيقونات
- **Local Storage** - حفظ البيانات

## 📱 الصفحات

### الموقع الرئيسي
- `/` - الصفحة الرئيسية
- `/menu` - المنيو مع بحث وفلترة
- `/cart` - سلة التسوق
- `/checkout` - إتمام الطلب
- `/order-success` - تأكيد الطلب
- `/track-order/:id` - تتبع الطلب

### لوحة الإدارة
- `/admin` - الداشبورد
- `/admin/orders` - إدارة الطلبات
- `/admin/products` - إدارة المنتجات
- `/admin/categories` - إدارة التصنيفات
- `/admin/customers` - إدارة العملاء
- `/admin/settings` - الإعدادات

## ⚙️ الإعدادات

لتغيير رقم واتساب المطعم:
1. افتح `/admin/settings`
2. غيّر رقم واتساب المطعم
3. اضغط حفظ الإعدادات

## 📦 البناء للإنتاج

```bash
npm run build
npm run preview
```

## 🎨 الألوان

- **الذهبي**: `#C8960C`
- **الأسود**: `#0f0f0f`
- **الأحمر**: للتنبيهات والإلغاء

## 📂 هيكل المشروع

```
src/
├── components/
│   ├── common/      # مكونات مشتركة
│   └── home/        # مكونات الصفحة الرئيسية
├── layouts/         # تخطيطات الصفحات
├── pages/
│   ├── admin/       # صفحات الإدارة
│   └── *.jsx        # الصفحات الرئيسية
├── store/           # Zustand store
└── utils/           # مساعدات وبيانات
```
