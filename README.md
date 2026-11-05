# Portal Quản Trị & Giám Sát Hệ Thống (my-first-vercel)

Ứng dụng Single Page Application (SPA) hiện đại xây dựng trên nền tảng **React 19 + TypeScript + Vite 8**, tích hợp trực tiếp với backend **NestJS API** trên Render (`render1-api`) và cơ sở dữ liệu **Supabase PostgreSQL**, sẵn sàng triển khai tối ưu trên **Vercel**.

---

## 🚀 Các Công Nghệ Cốt Lõi

- **Core & Build**: [React 19](https://react.dev/), [TypeScript 6](https://www.typescriptlang.org/), [Vite 8](https://vite.dev/) (Module Bundling & ES2022 target).
- **Styling & UI**: [HeroUI v3](https://heroui.com/) (formerly NextUI), [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`), [Lucide React](https://lucide.dev/) Icons, `tailwind-merge` & `clsx`.
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Client Auth State, Sidebar Collapse/Expand Persistence & Theme).
- **Server State & Cache**: [TanStack Query v5](https://tanstack.com/query/latest) (Auto Polling, Smart Caching, Garbage Collection).
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) Schema Validation.
- **Routing & Guards**: [React Router DOM v7](https://reactrouter.com/) (Role-based Protected Routes, Public-only Routes, Admin Guards).
- **Testing**: [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) (22 suites, 123 automated tests đạt 100% pass).
- **Deployment**: [Vercel](https://vercel.com/) (SPA Rewrite, Asset Caching).

---

## 🌐 Thông Tin Backend API Kết Nối

- **Live Base URL**: [`https://render1-api.onrender.com/`](https://render1-api.onrender.com/)
- **Tài liệu API tương tác Scalar**: [`https://render1-api.onrender.com/scalar`](https://render1-api.onrender.com/scalar)
- **OpenAPI Schema (JSON)**: [`https://render1-api.onrender.com/openapi.json`](https://render1-api.onrender.com/openapi.json)

### Các Endpoint Chính
| Phương thức | Endpoint | Phân quyền | Chức năng |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Công khai | Kiểm tra kết nối cơ sở |
| `POST` | `/auth/register` | Công khai | Đăng ký tài khoản người dùng mới |
| `POST` | `/auth/login` | Công khai | Đăng nhập lấy JWT Bearer token |
| `GET` | `/auth/me` (hoặc `/auth/profile`) | Yêu cầu JWT | Lấy hồ sơ tài khoản hiện tại |
| `POST` | `/auth/logout` | Yêu cầu JWT | Đăng xuất và đưa token vào danh sách thu hồi (Blacklist) |
| `GET` | `/users` (hoặc `/admin/users`) | Admin Only | Quản trị danh sách người dùng Supabase |
| `GET` | `/health` | Công khai | Báo cáo sức khỏe hệ thống chuẩn IETF RFC Draft |
| `GET` | `/health/live` | Công khai | Liveness Probe (Uptime, Memory) |
| `GET` | `/health/ready` | Công khai | Readiness Probe (Kiểm tra kết nối Supabase) |
| `GET` | `/healthz` | Công khai | Kubernetes / APM Monitoring Probe |

---

## ⚙️ Biến Môi Trường (Environment Variables)

Hệ thống sử dụng file `.env` cho môi trường cục bộ và thiết lập qua Vercel Dashboard cho production:

| Tên biến | Bắt buộc | Giá trị mẫu | Ý nghĩa |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | **Có** | `https://render1-api.onrender.com` | Base URL của backend NestJS |

Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

Nội dung `.env`:
```env
# URL kết nối tới backend NestJS (my-first-api trên Render)
VITE_API_URL=https://render1-api.onrender.com
```

---

## 💻 Hướng Dẫn Chạy Môi Trường Cục Bộ (Local Development)

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Khởi chạy máy chủ phát triển
```bash
npm run dev
```
Ứng dụng sẽ khả dụng tại `http://localhost:5173`.

### 3. Kiểm tra mã nguồn (Linting)
```bash
npm run lint
```

### 4. Chạy bộ kiểm thử tự động (Unit & Integration Tests)
```bash
npm test
```

### 5. Build kiểm tra sản phẩm (Production Build)
```bash
npm run build
```
Kết quả build được tạo trong thư mục `dist/` kèm code-splitting theo từng trang và vendor chunks.

### 6. Xem trước bản build cục bộ
```bash
npm run preview
```

---

## ☁️ Hướng Dẫn Triển Khai Lên Vercel (Production Deployment)

### Cách 1: Triển Khai Tự Động Qua Vercel Dashboard & GitHub (Khuyên Dùng)

1. **Đẩy mã nguồn lên Git Repository** (GitHub, GitLab hoặc Bitbucket):
   ```bash
   git add .
   git commit -m "feat: complete production optimization and vercel setup"
   git push origin main
   ```
2. **Import Dự Án trên Vercel**:
   - Truy cập [Vercel Dashboard](https://vercel.com/dashboard) và bấm **Add New...** > **Project**.
   - Chọn kho lưu trữ chứa mã nguồn `my-first-vercel`.
3. **Cấu hình Project Settings**:
   - **Framework Preset**: `Vite` (Vercel tự động nhận diện).
   - **Root Directory**: `./` (hoặc thư mục chứa `package.json`).
   - **Build Command**: `npm run build` (hoặc `tsc -b && vite build`).
   - **Output Directory**: `dist`.
4. **Cấu hình Environment Variables**:
   - Key: `VITE_API_URL`
   - Value: `https://render1-api.onrender.com`
   - Targets: Chọn tất cả (Production, Preview, Development).
5. **Bấm nút Deploy**:
   - Quá trình build và xuất bản sẽ hoàn tất trong ~30-60 giây.

---

### Cách 2: Triển Khai Nhanh Bằng Vercel CLI

1. Cài đặt Vercel CLI toàn cục (nếu chưa có):
   ```bash
   npm i -g vercel
   ```
2. Đăng nhập Vercel:
   ```bash
   vercel login
   ```
3. Chạy lệnh triển khai bản Preview:
   ```bash
   vercel
   ```
4. Thiết lập biến môi trường trên Vercel CLI:
   ```bash
   vercel env add VITE_API_URL production
   # Nhập giá trị: https://render1-api.onrender.com
   ```
5. Xuất bản lên môi trường Production:
   ```bash
   vercel --prod
   ```

---

## 🛠️ Cấu Hình SPA Rewrite & Tối Ưu Hóa (vercel.json)

Để giải quyết vấn đề phổ biến của Single Page Application (lỗi `404 Not Found` khi người dùng tải lại trang tại các đường dẫn con như `/dashboard`, `/profile`, `/admin/users`), file `vercel.json` đã được thiết lập:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

- **`rewrites`**: Chuyển hướng mọi URL không khớp file tĩnh về `index.html` để React Router xử lý định tuyến phía client.
- **`headers`**: Thiết lập bộ nhớ cache tối đa (`max-age=31536000, immutable`) cho các bundle tĩnh trong thư mục `/assets/`, giúp tăng tốc độ tải trang cho các lần truy cập tiếp theo.

---

## 🧪 Kịch Bản Kiểm Thử Người Dùng (UAT Scenarios)

### Tài khoản kiểm thử có sẵn trên hệ thống:
- **Tài khoản Quản trị viên (Admin)**:
  - Email: `admin@example.com`
  - Mật khẩu: `Admin@123456`
  - Quyền hạn: Toàn quyền truy cập Dashboard, Profile, Health Monitor, và module **Quản Trị Người Dùng** (`/admin/users`).
- **Tài khoản Người dùng tiêu chuẩn (User)**:
  - Email: `user@example.com`
  - Mật khẩu: `Password123!`
  - Quyền hạn: Truy cập Dashboard, Profile, Health Monitor; khi truy cập `/admin/users` sẽ bị Route Guard chặn và điều hướng về trang 403 Forbidden.

### 4 Kịch Bản Kiểm Thử Trọng Yếu:
1. **Đăng Ký Tài Khoản Mới (`/register`)**:
   - Nhập họ tên, email hợp lệ và mật khẩu >= 6 ký tự.
   - Hệ thống tự động tạo tài khoản qua `POST /auth/register`, lưu token và đưa vào Dashboard.
2. **Đăng Nhập & Kiểm Soát Phiên (`/login`)**:
   - Đăng nhập với tài khoản Admin hoặc User (có nút 1-click tự động điền form).
   - Kiểm tra hiển thị thông tin phiên JWT 24h, thời gian đếm ngược còn lại và phân quyền tại trang Profile.
3. **Phân Quyền Quản Trị Viên (`/admin/users`)**:
   - Với tài khoản Admin: Xem danh sách thành viên, tìm kiếm theo tên/email, lọc theo vai trò, sắp xếp cột, xem modal chi tiết và xuất dữ liệu CSV/JSON.
   - Với tài khoản User thường: Thử truy cập `/admin/users` bị chặn với trang 403 thân thiện.
4. **Đăng Xuất & Thu Hồi Token An Toàn (`POST /auth/logout`)**:
   - Bấm nút "Đăng xuất" trên thanh điều hướng Header.
   - Backend đưa token vào Blacklist và xóa sạch thông tin phiên lưu trữ cục bộ.
   - Thử sử dụng lại token cũ sẽ bị từ chối với mã lỗi 401 Unauthorized.
5. **Tính Năng Thu Gọn & Mở Rộng Sidebar (Collapsible Sidebar)**:
   - **Desktop**: Bấm nút chuyển đổi trên thanh Header hoặc tại đầu/chân Sidebar (hoặc bấm tổ hợp phím **`Ctrl+B`** / **`Cmd+B`**) để thu gọn sang chế độ icon thanh mảnh (`w-[72px]`) hoặc mở rộng đầy đủ (`w-72`).
   - **Tooltip Thông Minh**: Khi thu gọn, rê chuột vào các biểu tượng sẽ hiển thị Tooltip nhãn và huy hiệu trạng thái (Live, Admin, Dev, Trạng thái máy chủ).
   - **Ghi Nhớ Trạng Thái**: Tự động lưu lựa chọn thu gọn vào `localStorage` (`sidebar-collapsed`), duy trì khi tải lại trang hoặc điều hướng.
   - **Mobile Drawer**: Tự động chuyển đổi thành drawer toàn màn hình có lớp phủ backdrop và hỗ trợ đóng nhanh bằng phím `Escape`.
