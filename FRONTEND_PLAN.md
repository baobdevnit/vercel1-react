# KẾ HOẠCH TRIỂN KHAI FRONT-END PORTAL (MY-FIRST-VERCEL)
> Dự án kết nối trực tiếp với backend `render1-api` (NestJS + Supabase + JWT) và deploy lên Vercel.

---

## 📌 QUY TẮC THỰC HIỆN TỰ ĐỘNG GIỮA CÁC HỘI THOẠI (SESSION WORKFLOW PROTOCOL)

Khi người dùng mở một cuộc hội thoại mới và dán câu lệnh yêu cầu làm tính năng tiếp theo:
1. **Đọc tệp này (`FRONTEND_PLAN.md`)**: Quét từ trên xuống dưới để tìm tính năng đầu tiên có trạng thái `[ ] (Chưa thực hiện)`.
2. **Kiểm tra ngữ cảnh thực tế**: Đọc các file liên quan trong thư mục mã nguồn để nắm bắt code hiện có từ phiên trước.
3. **Triển khai trọn vẹn tính năng đó**:
   - Viết mã nguồn sạch, có chú thích, định kiểu TypeScript chặt chẽ.
   - Kiểm tra build hoặc chạy lint/typecheck (`npm run build` hoặc lệnh tương ứng) để đảm bảo không gãy ứng dụng.
4. **Cập nhật trạng thái**: Đánh dấu `[x] (Đã hoàn thành)` cho tính năng vừa làm trong `FRONTEND_PLAN.md` và ghi chú tóm tắt thay đổi.
5. **Bàn giao phiên**:
   - Tóm tắt những gì đã làm, hướng dẫn test nhanh tính năng.
   - Cung cấp sẵn đoạn **Prompt mẫu** để người dùng chỉ việc copy-paste sang hội thoại kế tiếp.

---

## 📋 PROMPT MẪU CHO CÁC HỘI THOẠI TIẾP THEO

Mỗi khi bắt đầu một cuộc hội thoại mới, người dùng chỉ cần copy đoạn text dưới đây gửi cho Agent:

```text
Tiếp tục thực hiện tính năng tiếp theo trong FRONTEND_PLAN.md. Hãy đọc file FRONTEND_PLAN.md, xác định tính năng đầu tiên đang ở trạng thái [ ], triển khai trọn vẹn tính năng đó, kiểm tra build/typecheck, cập nhật trạng thái [x] vào file và cung cấp prompt mẫu cho phiên tiếp theo.
```

---

## 🎯 DANH SÁCH CÁC TÍNH NĂNG / PHIÊN HỘI THOẠI (SESSIONS BREAKDOWN)

### [x] Phiên 1: Khởi Tạo Nền Tảng, Styling & Base UI Components *(Đã hoàn thành - 2026-11-05)*
- **Mục tiêu:** Cài đặt bộ công cụ nền tảng cho giao diện, cấu hình đường dẫn tuyệt đối (`@/*`), Tailwind CSS, icons và các component nguyên tử dùng chung.
- **Nội dung công việc:**
  1. Cài đặt Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/vite`) tương thích chuẩn React 19 + Vite 8.
  2. Cài đặt thư viện icon `lucide-react`, `clsx`, `tailwind-merge` và tạo hàm tiện ích `cn()` tại `src/lib/utils.ts`.
  3. Cấu hình TypeScript path alias `@/*` trong `vite.config.ts` và `tsconfig.app.json`.
  4. Tạo các Base UI components tái sử dụng trong `src/components/common/`:
     - `Button.tsx` (các biến thể: primary, secondary, outline, danger, ghost, loading spinner, kích cỡ sm/md/lg, icon prefix/suffix).
     - `Input.tsx` (forwardRef, label, error message, helperText, icon prefix/suffix, accessible input id).
     - `Card.tsx` (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter).
     - `Badge.tsx` (hiển thị trạng thái/vai trò `admin`, `user`, `pass`, `warn`, `fail`, `info`, `default` kèm chấm tín hiệu `dot`).
     - `Spinner.tsx` (loading spinner dùng `lucide-react Loader2` với các size xs/sm/md/lg/xl).
     - `index.ts` (export tập trung).
  5. Thiết lập file `.env.example` và `.env` với biến `VITE_API_URL=http://localhost:3000`. Cập nhật `.gitignore`.
- **Tiêu chí hoàn thành (DoD):**
  - Chạy `npm run build` (`tsc -b && vite build`) và `npm run lint` thành công 100% không lỗi.
  - Giao diện `App.tsx` trình diễn showcase tương tác toàn diện cho toàn bộ các Base UI components.

---

### [x] Phiên 2: Xây Dựng API Client, TypeScript Contracts & Quản Lý Auth State *(Đã hoàn thành - 2026-11-05)*
- **Mục tiêu:** Thiết lập tầng giao tiếp HTTP với backend, xử lý tự động gắn token, tự động bắt lỗi 401/403, và quản lý session người dùng toàn cục.
- **Nội dung công việc:**
  1. Cài đặt `axios`, `@tanstack/react-query`, `zustand`, `vitest`, `happy-dom`.
  2. Tạo file `src/types/api.ts` chuẩn hóa toàn bộ TypeScript interfaces từ `FRONTEND_HANDOVER.md` (`User`, `UserRole`, `AuthResponse`, `LogoutResponse`, `LoginDto`, `RegisterDto`, `HealthResponse`, `ApiErrorResponse`).
  3. Xây dựng Axios Client trong `src/api/client.ts` và hằng số endpoint trong `src/api/endpoints.ts`:
     - `Request Interceptor`: Tự động lấy `access_token` từ storage qua `src/utils/token.ts` đính kèm vào header `Authorization: Bearer <token>`.
     - `Response Interceptor`: Bắt lỗi 401 (token hết hạn hoặc bị blacklist sau khi logout) -> xóa session và redirect về `/login?expired=true`. Bắt lỗi 403 (không có quyền truy cập).
     - Hàm tiện ích `getErrorMessage()` bóc tách chính xác chuỗi lỗi đơn lẻ, mảng lỗi NestJS Validation DTO, timeout hoặc lỗi mất kết nối mạng.
  4. Xây dựng Auth Store trong `src/stores/auth.store.ts` bằng `zustand`:
     - State: `user`, `token`, `isAuthenticated`, `isLoading`.
     - Actions: `setAuth(user, token)`, `setUser(user)`, `clearAuth()`, `initAuth()` (khôi phục session khi reload trang), `isAdmin()`.
  5. Thiết lập các API Services cơ sở:
     - `src/features/auth/services/auth.api.ts` (`login`, `register`, `getMe`, `logout`).
     - `src/features/health/services/health.api.ts` (`getHealth`, `getLiveness`, `getReadiness`).
     - `src/features/users/services/users.api.ts` (`getAllUsers`).
  6. Cấu hình `QueryClientProvider` trong `src/main.tsx` và `src/lib/queryClient.ts` (staleTime 5p, gcTime 15p, chặn retry đối với mã 401/403/404).
  7. Xây dựng bộ test tự động với Vitest (`src/stores/auth.store.test.ts`, `src/api/client.test.ts`) kiểm thử 14 kịch bản đạt 100% pass.
  8. Nâng cấp giao diện trực quan `App.tsx` với bảng điều khiển tương tác trực tiếp cho Zustand Auth Store, LocalStorage Inspector, TanStack Query và mô phỏng lỗi API.
- **Tiêu chí hoàn thành (DoD):**
  - Chạy `npm run build` (`tsc -b && vite build`) và `npm run lint` hoàn toàn sạch lỗi (exit code 0).
  - Chạy `npm test` với Vitest: 14/14 tests passed.
  - Auth Store lưu và xóa được token vào `localStorage`, interceptor hoạt động chuẩn xác.

---

### [x] Phiên 3: Thiết Lập Định Tuyến (Routing), Layout Shell & Bộ Bảo Vệ Tuyến Đường (Route Guards) *(Đã hoàn thành - 2026-11-05)*
- **Mục tiêu:** Xây dựng khung điều hướng toàn ứng dụng, giao diện Dashboard Shell (Header, Sidebar) và các lớp bảo vệ route theo phân quyền.
- **Nội dung công việc:**
  1. Cài đặt `react-router-dom` v7 (`^7.18.5`) và `@testing-library/react` cho kiểm thử tự động.
  2. Xây dựng các Layout trong `src/components/layout/`:
     - `AuthLayout.tsx`: Giao diện tối giản, tập trung cho trang Đăng nhập / Đăng ký, hiển thị trạng thái kết nối backend và link tài liệu Scalar API.
     - `DashboardLayout.tsx`: Khung Dashboard đáp ứng (responsive), hỗ trợ mở/đóng Sidebar trên thiết bị di động (mobile drawer).
     - `Sidebar.tsx`: Menu điều hướng (Dashboard, Profile, Sức khỏe hệ thống, Quản trị người dùng - chỉ hiện khi role là Admin, UI Showcase), hiển thị trạng thái backend live.
     - `Header.tsx`: Hiển thị tiêu đề theo ngữ cảnh route, chip trạng thái hệ thống trực tuyến, thông tin người dùng kèm Role Badge, và nút Đăng xuất (kết nối token blacklist).
     - `index.ts`: Export tập trung toàn bộ Layout components.
  3. Xây dựng Route Guards trong `src/routes/`:
     - `ProtectedRoute.tsx`: Chặn người dùng chưa đăng nhập, tự động chuyển về `/login` kèm `location.state` để quay lại đúng trang sau khi đăng nhập.
     - `AdminRoute.tsx`: Chặn người dùng thường (`role !== 'admin'`), chuyển hướng về trang thông báo 403 `/unauthorized`.
     - `PublicOnlyRoute.tsx`: Chặn người dùng đã đăng nhập truy cập lại trang `/login` hoặc `/register` (chuyển thẳng vào `/dashboard`).
  4. Tạo các trang phụ trợ:
     - `NotFoundPage.tsx`: Trang lỗi 404 thân thiện, có nút quay lại hoặc về Dashboard.
     - `UnauthorizedPage.tsx`: Trang lỗi 403 Forbidden giải thích rõ quyền hạn Quản trị viên và thông tin tài khoản hiện tại.
  5. Xây dựng các View Pages tương thích với backend Render:
     - `LoginPage.tsx`: Hỗ trợ đăng nhập thực tế với backend `https://render1-api.onrender.com/auth/login`, nút điền nhanh tài khoản mẫu (Admin/User), và chế độ Mock test nhanh.
     - `RegisterPage.tsx`: Hỗ trợ đăng ký thực tế qua `https://render1-api.onrender.com/auth/register`.
     - `DashboardOverviewPage.tsx`: Thẻ chào mừng, trung tâm kiểm thử các tuyến đường (Test 404, Test 403, Đổi role nhanh để test Guards).
     - `ProfilePage.tsx`: Hiển thị chi tiết hồ sơ tài khoản, nút làm mới từ máy chủ và JWT Session Viewer.
     - `UsersListPage.tsx`: Giao diện quản trị danh sách người dùng Supabase với ô tìm kiếm (chỉ Admin truy cập).
     - `HealthMonitorPage.tsx`: Giám sát trực tiếp Uptime, Heap RAM và độ trễ Supabase từ endpoint `/health`.
     - `ShowcasePage.tsx`: Lưu trữ toàn bộ component demo từ Phiên 1 & 2.
  6. Khởi tạo cấu hình routes trong `src/routes/AppRoutes.tsx` và gắn vào `App.tsx` bằng `<BrowserRouter>`.
  7. Thiết lập bộ kiểm thử Route Guards tự động trong `src/routes/guards.test.tsx` (7 kịch bản kiểm thử ProtectedRoute, AdminRoute, PublicOnlyRoute đạt 100% pass).
  8. Cập nhật file `.env` và `.env.example` trỏ trực tiếp đến backend live `https://render1-api.onrender.com`.
- **Tiêu chí hoàn thành (DoD):**
  - Chạy `npm run build` (`tsc -b && vite build`) và `npm run lint` đạt 100% thành công không lỗi (exit code 0).
  - Chạy `npm test`: 21/21 tests passed (3 test suites: auth store, client interceptors, route guards).
  - Thử truy cập route protected khi chưa login bị chặn và điều hướng về `/login`.
  - Tài khoản thường không thể vào `/admin/users`, bị điều hướng về `/unauthorized` (403).

---

### [x] Phiên 4: Tính Năng Xác Thực (Login, Register & Logout với Token Blacklist) *(Đã hoàn thành - 2026-11-05)*
- **Mục tiêu:** Hiện thực hóa toàn bộ luồng đăng ký, đăng nhập và đăng xuất chuẩn bảo mật với backend NestJS.
- **Nội dung công việc:**
  1. Cài đặt các thư viện form và validation: `react-hook-form`, `@hookform/resolvers`, `zod`.
  2. Tạo bộ schema validation chuẩn hóa trong `src/features/auth/schemas/auth.schema.ts`:
     - `loginSchema`: kiểm tra email hợp lệ, mật khẩu tối thiểu 6 ký tự.
     - `registerSchema`: kiểm tra họ tên (tối thiểu 2 ký tự), email, mật khẩu >= 6 ký tự, và đối sánh mật khẩu xác nhận `confirmPassword`.
  3. Hoàn thiện API Service `src/features/auth/services/auth.api.ts` kết nối trực tiếp với backend `https://render1-api.onrender.com/`:
     - `login`: gọi `POST /auth/login`, nhận JWT Bearer token và user entity.
     - `register`: gọi `POST /auth/register`, tự động tạo người dùng và cấp token.
     - `getMe`: gọi `GET /auth/me`, đọc thông tin người dùng từ token.
     - `logout`: gọi `POST /auth/logout`, đưa JWT token vào danh sách đen (Blacklist) của máy chủ backend.
  4. Xây dựng custom hook `src/features/auth/hooks/useAuth.ts` quản lý thống nhất các tác vụ auth (login, register, logout, trạng thái submit, bắt lỗi và redirect).
  5. Nâng cấp toàn diện `src/features/auth/pages/LoginPage.tsx`:
     - Tích hợp `react-hook-form` + `zodResolver(loginSchema)`.
     - Hiển thị thông báo lỗi chi tiết theo từng input và banner cảnh báo tổng hợp khi đăng nhập thất bại (401 Sai email hoặc mật khẩu).
     - Hỗ trợ ẩn/hiển thị mật khẩu (`Eye`/`EyeOff`).
     - Hộp gợi ý tài khoản mẫu từ Database: Admin (`admin@example.com` / `Admin@123456`) và User (`user@example.com` / `Password123!`) kèm nút bấm 1-click tự động điền form.
     - Banner cảnh báo phiên đăng nhập hết hạn hoặc bị thu hồi khi có tham số `?expired=true`.
     - Giữ chế độ Mock Login ngoại tuyến phục vụ kiểm thử nhanh không cần kết nối mạng.
  6. Nâng cấp toàn diện `src/features/auth/pages/RegisterPage.tsx`:
     - Tích hợp `react-hook-form` + `zodResolver(registerSchema)` cùng `useWatch` tối ưu cho React 19.
     - Các trường: Họ và tên, Email, Mật khẩu, Xác nhận mật khẩu.
     - Huy hiệu kiểm tra trực quan độ dài mật khẩu >= 6 ký tự thời gian thực.
     - Đăng ký thành công hiển thị banner thông báo xanh, tự động lưu token và user vào session store, sau đó chuyển hướng vào `/dashboard`.
     - Xử lý lỗi trùng lặp email (409 Conflict) hoặc validation lỗi từ backend.
  7. Hoàn thiện chức năng Đăng xuất (Logout) với Token Blacklist:
     - Gắn kết `useAuth().logout` vào nút Đăng xuất trên `Header.tsx`.
     - Gửi request `POST /auth/logout` lên máy chủ backend đưa token vào Blacklist.
     - Xóa token & thông tin user trong `localStorage` và `zustand` auth store, chuyển hướng về `/login`.
     - Kiểm thử xác nhận token sau khi logout sẽ bị từ chối với mã 401 khi gọi lại `/auth/me`.
  8. Viết bộ kiểm thử tự động Vitest cho Auth:
     - `src/features/auth/schemas/auth.schema.test.ts` (8 kịch bản kiểm tra validation schema).
     - `src/features/auth/services/auth.api.test.ts` (4 kịch bản kiểm thử API calls).
     - Đạt 33/33 tests passed trên toàn bộ 5 test suites.
- **Tiêu chí hoàn thành (DoD):**
  - Chạy `npm run build` (`tsc -b && vite build`) và `npm run lint` đạt 100% không lỗi và không warning (exit code 0).
  - Chạy `npm test`: 33/33 tests passed.
  - Kiểm thử trực tiếp 9 kịch bản E2E với backend live `https://render1-api.onrender.com/` đạt 100% thành công: Đăng ký user mới -> Lấy /auth/me -> Đăng nhập lại -> Đăng xuất thu hồi token -> Xác nhận token bị blacklist (401) -> Đăng nhập Admin -> Đăng nhập User -> Bắt lỗi sai pass -> Bắt lỗi trùng email (409).

---

### [x] Phiên 5: Trang Tổng Quan (Dashboard Overview) & Quản Lý Hồ Sơ Cá Nhân (Profile) *(Đã hoàn thành - 2026-11-05)*
- **Mục tiêu:** Cung cấp giao diện làm việc chính cho người dùng đã đăng nhập và xem chi tiết hồ sơ tài khoản.
- **Nội dung công việc:**
  1. Tạo component nền tảng `Skeleton.tsx` trong `src/components/common/Skeleton.tsx` (hỗ trợ các biến thể text, circular, rounded, rectangular với hiệu ứng animate-pulse và nhãn trợ năng ARIA), export tập trung tại `src/components/common/index.ts`.
  2. Nâng cấp bộ công cụ xử lý JWT và phiên làm việc tại `src/utils/token.ts`:
     - Xây dựng hàm `decodeJwt` giải mã payload Base64URL an toàn chuẩn UTF-8 tương thích trên cả môi trường trình duyệt và Node.js/Vitest.
     - Xây dựng hàm `getTokenSessionMeta` tính toán thời hạn phiên 24h, thời gian còn lại thân thiện (`Còn lại ~23 giờ 58 phút`), thanh tiến trình thời gian (%) và trích xuất các claims (`sub`, `email`, `role`, `iat`, `exp`).
     - Viết bộ kiểm thử tự động tại `src/utils/token.test.ts` (8 bài kiểm thử đạt 100% pass).
  3. Xây dựng custom hook `src/features/profile/hooks/useProfile.ts`:
     - Sử dụng TanStack Query `useQuery` kết nối endpoint `GET /auth/me` với `queryKey: ['auth', 'me']` và cơ chế staleTime 3 phút.
     - Tự động đồng bộ hồ sơ mới nhất từ backend vào Zustand `authStore` khi dữ liệu thay đổi.
  4. Nâng cấp toàn diện `src/features/profile/pages/ProfilePage.tsx`:
     - Tích hợp `useProfile()` với trạng thái Skeleton loading khi đang fetch dữ liệu.
     - Banner xử lý lỗi kết nối thân thiện kèm nút bấm Thử lại (Retry).
     - Hiển thị avatar đại diện (dựa trên ký tự đầu họ tên kèm chấm tín hiệu hoạt động), Tên, Email, Role Badge phân quyền.
     - Lưới 4 thẻ thông tin tài khoản: Mã định danh UUID (kèm nút 1-click Copy ID), Quyền hạn hệ thống, Ngày tạo tài khoản và Ngày cập nhật gần nhất (định dạng tiếng Việt `vi-VN`).
     - Thẻ giám sát phiên JWT 24 giờ: Thanh tiến trình thời gian phiên làm việc, thời điểm phát hành và hết hạn, bảng thông tin các claims (`sub`, `email`, `role`, `exp`), và khung xem chuỗi Access Token thô kèm nút 1-click Copy Token.
     - Nút "Làm Mới Từ Máy Chủ" (Refetch) kèm hiệu ứng xoay và thông báo phản hồi thành công.
  5. Nâng cấp toàn diện `src/features/dashboard/pages/DashboardOverviewPage.tsx`:
     - Card chào mừng cá nhân hóa theo thời gian trong ngày (Chào buổi sáng / Chào buổi chiều / Chào buổi tối), hiển thị tên người dùng và phân quyền chi tiết.
     - Nút chuyển đổi vai trò nhanh (`Admin` <-> `User`) phục vụ kiểm thử Route Guards ngay trên giao diện.
     - Bộ 3 thẻ tóm tắt số liệu trực quan: Phiên xác thực JWT 24h (thời gian còn lại & tiến trình), Máy chủ Render (kết nối live query tới `/health` hiển thị độ trễ Database Supabase, Uptime, trạng thái Pass/Warn), và Thẻ tóm tắt tài khoản hiện tại.
     - Khu vực lối tắt tính năng (Quick Actions) phân nhánh thông minh theo vai trò:
       * Admin: Quản trị người dùng (`/admin/users`), Giám sát sức khỏe (`/health`), Hồ sơ cá nhân (`/profile`), Tài liệu Scalar API live (`/scalar`).
       * User: Hồ sơ cá nhân (`/profile`), Giám sát sức khỏe (`/health`), Lối tắt thử nghiệm 403 Forbidden khi truy cập `/admin/users`, UI Showcase (`/showcase`).
     - Trung tâm kiểm thử định tuyến (Route Guards Verification): nút test 404, test 403, mở Showcase, đổi vai trò nhanh.
  6. Viết bộ kiểm thử tự động toàn diện:
     - `src/features/profile/pages/ProfilePage.test.tsx` (5 kịch bản: render dữ liệu, skeleton loading, thông tin phiên JWT 24h, copy clipboard token & ID, refetch hồ sơ).
     - `src/features/dashboard/pages/DashboardOverviewPage.test.tsx` (4 kịch bản: chào mừng cá nhân hóa Admin/User, tóm tắt JWT & máy chủ Render, đổi role nhanh).
     - Tổng số bài test tự động: 50/50 tests passed trên toàn bộ 8 test suites.
  7. Tích hợp và kiểm thử E2E trực tiếp với backend live `https://render1-api.onrender.com/`:
     - Đăng nhập tài khoản Admin `admin@example.com` -> Lấy dữ liệu `/auth/me` thành công.
     - Đăng nhập tài khoản User `user@example.com` -> Lấy dữ liệu `/auth/me` thành công.
     - Kiểm tra kết nối endpoint `/health` trả về status `pass`, version `1`.
- **Tiêu chí hoàn thành (DoD):**
  - Chạy `npm run build` (`tsc -b && vite build`) và `npm run lint` đạt 100% thành công không có lỗi hoặc cảnh báo (exit code 0).
  - Chạy `npm test`: 50/50 tests passed (8 test suites).
  - Tải và hiển thị chính xác dữ liệu từ `/auth/me` qua TanStack Query và trạng thái Skeleton loading hoạt động mượt mà.

---

### [x] Phiên 6: Module Quản Trị Người Dùng (Admin Users Management) *(Đã hoàn thành - 2026-11-05)*
- **Mục tiêu:** Xây dựng giao diện bảng quản lý người dùng dành riêng cho Admin kết nối endpoint `GET /users`.
- **Nội dung công việc:**
  1. Hoàn thiện service `src/features/users/services/users.api.ts` (`getAllUsers`) kết nối `GET /users` và viết bộ kiểm thử tại `users.api.test.ts` (3/3 tests passed).
  2. Xây dựng custom hook `useUsers` (`src/features/users/hooks/useUsers.ts`) bằng TanStack Query:
     - Cơ chế caching (staleTime 3 phút, gcTime 10 phút), tự động tính toán số liệu thống kê (`totalUsers`, `adminCount`, `userCount`, `filteredCount`).
     - Tìm kiếm thời gian thực theo Tên, Email hoặc UUID; hỗ trợ nút xóa tìm kiếm nhanh.
     - Bộ lọc vai trò (All, Admin, User).
     - Sắp xếp đa tiêu chí (Tên, Email, Vai trò, Ngày đăng ký) kèm đảo chiều Tăng/Giảm (`asc`/`desc`).
     - Phân trang mượt mà (Pagination) hỗ trợ tùy chọn kích thước trang (10, 20, 50 dòng/trang).
     - Tiện ích xuất dữ liệu: Xuất ra Excel/CSV UTF-8 BOM (`exportToCsv`) và JSON (`exportToJson`).
     - Viết bộ kiểm thử tự động tại `src/features/users/hooks/useUsers.test.tsx` (8/8 tests passed).
  3. Xây dựng các UI Components chuyên biệt trong `src/features/users/components/`:
     - `UserStatsCards.tsx`: 4 thẻ thống kê số liệu tổng quan (Tổng thành viên, Quản trị viên, Người dùng tiêu chuẩn, Số lượng đang hiển thị/lọc kèm % tỷ lệ) và Skeleton loading khi đang fetch.
     - `UserDetailsModal.tsx`: Hộp thoại modal chi tiết người dùng khi xem thông tin (Avatar, Role Badge, Họ tên, Email, UUID với nút 1-click Copy ID và phản hồi "Đã chép!", Ngày đăng ký, Ngày cập nhật, Thẻ giải thích quyền hạn, Trình xem và sao chép JSON thô, phím tắt Escape để đóng).
     - `UserPagination.tsx`: Thanh điều hướng phân trang (hiển thị số dòng, chuyển trang đầu/trước/sau/cuối, các nút số trang).
     - `UserTable.tsx`: Bảng quản trị người dùng cho Desktop/Tablet với tiêu đề có icon sắp xếp, avatar chữ cái, copy UUID nhanh; Card view tối ưu cho màn hình di động; Skeleton loading 5 dòng; Giao diện trạng thái rỗng kèm nút "Xóa Bộ Lọc"; Banner cảnh báo lỗi và nút "Thử Lại Ngay".
  4. Nâng cấp toàn diện trang `src/features/users/pages/UsersListPage.tsx`:
     - Tiêu đề trang, Admin Area Badge, nút Làm Mới (Refresh với icon xoay khi fetch), menu Xuất Danh Sách (Excel/CSV, JSON).
     - Tích hợp UserStatsCards, thanh tìm kiếm, role filter pills, bảng dữ liệu phân trang và UserDetailsModal.
  5. Đóng gói module xuất khẩu tại `src/features/users/index.ts`.
  6. Kiểm tra phân quyền:
     - Tuyến đường `/admin/users` được bảo vệ chặt chẽ bởi `AdminRoute` trong `AppRoutes.tsx`.
     - Người dùng chưa đăng nhập bị chuyển về `/login`.
     - Người dùng thường (`role: 'user'`) truy cập `/admin/users` lập tức bị chặn và chuyển hướng sang trang 403 Forbidden `/unauthorized`.
  7. Viết bộ kiểm thử tự động cho giao diện `src/features/users/pages/UsersListPage.test.tsx` (6/6 tests passed).
- **Tiêu chí hoàn thành (DoD):**
  - Chạy `npm run build` (`tsc -b && vite build`) và `npm run lint` đạt 100% không lỗi và không warning (exit code 0).
  - Chạy `npm test`: Đạt 67/67 tests passed trên toàn bộ 11 test suites.
  - Tích hợp và kiểm thử E2E trực tiếp với backend live `https://render1-api.onrender.com/`:
    * Đăng nhập Admin (`admin@example.com` / `Admin@123456`) -> Gọi `GET /users` và `GET /admin/users` thành công, lấy về đầy đủ 18 users từ Supabase.
    * Đăng nhập User thường (`user@example.com` / `Password123!`) -> Gọi `GET /users` bị chặn với mã 403 Forbidden đúng theo chính sách bảo mật.

---

### [x] Phiên 7: Module Giám Sát Sức Khỏe Hệ Thống (System Health Monitor) *(Đã hoàn thành - 2026-11-05)*
- **Mục tiêu:** Hiển thị trực quan trạng thái vận hành của backend `render1-api`, độ trễ Supabase và tài nguyên bộ nhớ từ endpoint chuẩn IETF RFC Draft `/health`.
- **Nội dung công việc:**
  1. Hoàn thiện API Service `src/features/health/services/health.api.ts`:
     - Kết nối 4 endpoints chuẩn IETF Draft: `getHealth` (`/health`), `getLiveness` (`/health/live`), `getReadiness` (`/health/ready`), `getHealthz` (`/healthz`) với header `Accept: application/health+json, application/json`.
     - Xây dựng phương thức `executeProbe` thực thi và đo đạc độ trễ client roundtrip (ms), bắt lỗi và chuẩn hóa cấu trúc `ProbeResult`.
     - Viết bộ kiểm thử tại `src/features/health/services/health.api.test.ts` (6/6 tests passed).
  2. Xây dựng custom hook `src/features/health/hooks/useSystemHealth.ts`:
     - Tích hợp TanStack Query tự động thăm dò (polling) với tùy chọn bật/tắt `isAutoRefresh` và lựa chọn chu kỳ (10s, 15s, 30s, 60s).
     - Tiện ích định dạng thời gian Uptime `formatUptime` (ngày, giờ, phút, giây thân thiện).
     - Hàm xếp hạng độ trễ Supabase `getLatencyRating` (<200ms Rất Tốt, 200-600ms Ổn Định, 600-1200ms Trung Bình, >1200ms Chậm).
     - Bóc tách đầy đủ dữ liệu từ IETF checks: `datastore:supabase`, `system:memory`, `system:uptime`.
     - Tự động ghi nhận và quản lý dòng thời gian 10 lần kiểm tra gần nhất (`history`) kèm nút "Xóa Lịch Sử".
     - Viết bộ kiểm thử tự động tại `src/features/health/hooks/useSystemHealth.test.tsx` (10/10 tests passed).
  3. Xây dựng `src/features/health/components/HealthStatusWidget.tsx`:
     - Hỗ trợ 3 kiểu hiển thị: `compact` (pill có đèn tín hiệu ping động và số ms Supabase gắn trên Header), `badge` (chip trạng thái tối giản), `card` (thẻ đầy đủ Uptime, Heap RAM, Supabase latency cho Dashboard).
     - Đèn trạng thái tín hiệu đổi màu linh hoạt theo chuẩn IETF: xanh (`pass`), vàng (`warn`), đỏ (`fail` hoặc mất kết nối).
     - Tích hợp thay thế nút tĩnh trên `Header.tsx` và hỗ trợ liên kết trực tiếp vào `/health`.
     - Viết bộ kiểm thử tự động tại `src/features/health/components/HealthStatusWidget.test.tsx` (4/4 tests passed).
  4. Xây dựng trung tâm kiểm thử Probes `src/features/health/components/HealthProbeTester.tsx`:
     - Giao diện tương tác trực tiếp 4 probes (`/health`, `/health/live`, `/health/ready`, `/healthz`).
     - Đo độ trễ client roundtrip theo thời gian thực (ms), trạng thái HTTP status code, và nút "Kiểm Tra Toàn Bộ Probes" chạy song song.
     - Trình xem JSON phản hồi kèm nút 1-click "Sao Chép JSON" phản hồi trực quan "Đã Chép!".
     - Viết bộ kiểm thử tự động tại `src/features/health/components/HealthProbeTester.test.tsx` (4/4 tests passed).
  5. Nâng cấp toàn diện trang giám sát `src/features/health/pages/HealthMonitorPage.tsx`:
     - Thanh điều khiển: Badge trạng thái tổng thể, công tắc Bật/Tắt tự động làm mới, chọn chu kỳ polling (10s, 15s, 30s, 60s), nút "Kiểm Tra Ngay" (Refetch).
     - Banner trạng thái tổng thể xanh/vàng/đỏ kèm ghi chú vận hành từ backend và thời điểm kiểm tra gần nhất.
     - 4 thẻ số liệu cốt lõi:
       * **Cơ Sở Dữ Liệu Supabase**: Độ trễ (ms), huy hiệu xếp hạng, thông điệp kiểm tra kết nối, component id `supabase-database`.
       * **Node.js Heap Memory**: Dung lượng RAM sử dụng (MB), tỷ lệ % heap usage kèm thanh tiến trình màu tím/cam, thông điệp output.
       * **Uptime Tiến Trình**: Thời gian hoạt động liên tục dạng văn bản (`1 giờ 14 phút 5 giây`), số giây quan sát thực tế.
       * **Bản Phát Hành & Dịch Vụ**: Tên service `my-first-api`, Version, Release Git Commit ID kèm nút 1-click sao chép hash commit, huy hiệu tiêu chuẩn IETF RFC Draft.
     - Bảng lịch sử kiểm tra gần nhất (History Timeline) hiển thị sự biến thiên độ trễ Supabase và RAM qua các lần polling.
     - Tích hợp `HealthProbeTester` và Trình xem dữ liệu thô `application/health+json` kèm nút Copy JSON và link mở trực tiếp endpoint `/health` & `/scalar`.
     - Viết bộ kiểm thử tự động tại `src/features/health/pages/HealthMonitorPage.test.tsx` (5/5 tests passed).
  6. Tối ưu hóa trang `DashboardOverviewPage.tsx`: Cập nhật khóa kiểm tra `datastore:supabase` hiển thị chính xác độ trễ Supabase từ live health check.
  7. Đóng gói xuất khẩu tập trung tại `src/features/health/index.ts`.
- **Tiêu chí hoàn thành (DoD):**
  - Chạy `npm run build` (`tsc -b && vite build`) và `npm run lint` đạt 100% không có lỗi hoặc cảnh báo (exit code 0).
  - Chạy `npm test`: Đạt 96/96 tests passed trên toàn bộ 16 test suites.
  - Tích hợp và kiểm thử E2E trực tiếp với backend live `https://render1-api.onrender.com/`:
    * `GET /health`: Trả về `HTTP 200` định dạng `application/health+json`, `status: pass`, `serviceId: my-first-api`, Supabase latency ~144-602ms, Uptime >4400s, RAM ~34MB.
    * `GET /health/live`: Trả về `HTTP 200`, `status: pass` (Liveness Probe).
    * `GET /health/ready`: Trả về `HTTP 200`, `status: pass`, Supabase database sẵn sàng phục vụ truy vấn (Readiness Probe).
    * `GET /healthz`: Trả về `HTTP 200`, `status: pass`.

---

### [x] Phiên 8: Tối Ưu Hóa Production, Cấu Hình Vercel SPA & Bàn Giao Hoàn Chỉnh *(Đã hoàn thành - 2026-11-05)*
- **Mục tiêu:** Hoàn thiện các cấu hình triển khai Vercel, xử lý định tuyến SPA (tránh lỗi 404 khi F5), kiểm tra build production và tài liệu vận hành.
- **Nội dung công việc:**
  1. Tạo file `vercel.json` cấu hình rewrite rules và cache-control:
     ```json
     {
       "$schema": "https://openapi.vercel.sh/vercel.json",
       "cleanUrls": true,
       "rewrites": [
         { "source": "/(.*)", "destination": "/index.html" }
       ],
       "headers": [
         {
           "source": "/assets/(.*)",
           "headers": [
             { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
           ]
         }
       ]
     }
     ```
  2. Tối ưu hóa hiệu năng bundle production:
     - Triển khai Route-level code-splitting (Lazy loading bằng `React.lazy` và `Suspense` kèm fallback `PageLoader`) trong `src/routes/AppRoutes.tsx`.
     - Cấu hình phân cụm vendor chunks thông minh (`manualChunks`) trong `vite.config.ts` (`vendor-react`, `vendor-network`, `vendor-forms`, `vendor-core`).
     - Tối ưu `index.html` với ngôn ngữ `vi`, meta theme-color `#0f172a`, SEO description và nền tối chống chớp trắng khi khởi tạo.
     - Cắt giảm dung lượng chunk tối đa từ 675 kB xuống còn dưới 270 kB (giảm hơn 60%), loại bỏ 100% cảnh báo `chunkSizeWarningLimit`.
  3. Kiểm tra toàn diện linting, typecheck và chạy `npm run build` tạo thư mục `dist/` hoàn chỉnh.
  4. Soạn thảo tài liệu vận hành và hướng dẫn triển khai Vercel chi tiết từ A-Z trong `README.md` (bao gồm Git Integration, Vercel CLI, cấu hình biến môi trường `VITE_API_URL`, bảng tra cứu endpoint API backend).
  5. Kiểm thử tích hợp thông suốt toàn bộ 4 kịch bản UAT trực tiếp với backend live `https://render1-api.onrender.com/`:
     - Kiểm tra kết nối `/health` (status `pass`, IETF RFC Draft).
     - Đăng nhập Admin (`admin@example.com` / `Admin@123456`) -> Truy cập `GET /users` lấy 18 thành viên.
     - Đăng nhập User (`user@example.com` / `Password123!`) -> Truy cập `GET /users` bị chặn với mã 403 Forbidden.
     - Đăng ký dynamic user -> Nhận token -> `GET /auth/me` (200) -> `POST /auth/logout` -> Kiểm tra lại `GET /auth/me` bị chặn với mã 401 Blacklisted.
- **Tiêu chí hoàn thành (DoD):**
  - Chạy `npm run build` (`tsc -b && vite build`) thành công 100% không cảnh báo (exit code 0).
  - Toàn bộ 96/96 automated tests trên 16 test suites đạt 100% pass.
  - ESLint sạch lỗi 100% (exit code 0).
  - Ứng dụng sẵn sàng deploy lên Vercel chỉ với thao tác push git hoặc `vercel --prod`.

---
*Kế hoạch được khởi tạo vào 2026-11-05. Mọi cập nhật trạng thái sẽ được ghi đè trực tiếp vào file này.*
