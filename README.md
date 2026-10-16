# Hệ thống tối ưu hóa kế hoạch ôn thi môn Toán bằng Quy hoạch Tuyến tính nguyên (ILP)

Ứng dụng React + Vite + Tailwind CSS, giải bài toán ngay trên trình duyệt bằng `javascript-lp-solver`; không cần backend.

## Chạy trên máy

Cần cài Node.js 18+.

```bash
npm install
npm run dev
```

Mở URL mà Vite hiển thị trong terminal.

## Build bản triển khai

```bash
npm run build
npm run preview
```

Thư mục `dist/` là bản build có thể triển khai lên dịch vụ hosting frontend tĩnh.

## Tính năng

- Nhập số câu sai và tùy chỉnh hệ số của 8 chuyên đề.
- Tải dữ liệu mẫu: `[4, 3, 4, 2, 3, 3, 2, 1]`.
- Tối ưu số lần làm 4 loại tài liệu với biến nguyên, giới hạn số lần và mục tiêu tổng thời gian nhỏ nhất.
- Bảng đối soát chỉ tiêu, thực tế đạt, chênh lệch và tỷ lệ đáp ứng.
- Xuất/in lộ trình qua hộp thoại in của trình duyệt; chọn “Save as PDF / Lưu thành PDF”.

## Lưu ý mô hình

Tỷ lệ đáp ứng của chuyên đề có chỉ tiêu bằng 0 được hiển thị là 100% nếu không có yêu cầu bù. Nghiệm tối ưu có thể có nhiều phương án đồng tối ưu; ứng dụng hiển thị một phương án mà bộ giải trả về.
