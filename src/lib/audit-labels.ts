/** Nhãn tiếng Việt cho các hành động trong nhật ký thao tác. */
export const AUDIT_LABEL: Record<string, string> = {
  ARTISAN_APPROVED: "Duyệt hộ nghề",
  ARTISAN_REJECTED: "Từ chối hồ sơ hộ nghề",
  USER_SUSPENDED: "Khóa tài khoản",
  USER_REACTIVATED: "Mở khóa tài khoản",
  NEWS_CREATED: "Đăng tin",
  NEWS_UPDATED: "Sửa tin",
  NEWS_DELETED: "Xóa tin",
  QUOTE_ACCEPTED: "Chốt đơn sỉ",
  QUOTE_INVITE: "Mời thêm xưởng",
  "booking.confirm": "Xác nhận lịch trải nghiệm",
  "booking.decline": "Từ chối lịch trải nghiệm",
  "booking.complete": "Hoàn tất buổi trải nghiệm",
  "booking.cancel": "Khách hủy lịch trải nghiệm",
  "report.exported": "Xuất báo cáo CSV",
  "user.password_changed": "Đổi mật khẩu",
  "user.password_reset_requested": "Yêu cầu đặt lại mật khẩu",
  "user.password_reset": "Đặt lại mật khẩu",
};

export function auditLabel(action: string) {
  return AUDIT_LABEL[action] ?? action;
}
