export interface PasswordDraft {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function validatePasswordDraft(draft: PasswordDraft) {
  if (!draft.currentPassword || !draft.newPassword || !draft.confirmPassword) {
    return "请完整填写当前密码、新密码和确认密码";
  }

  if (draft.newPassword.length < 8) {
    return "新密码至少需要 8 位";
  }

  if (draft.newPassword !== draft.confirmPassword) {
    return "两次输入的新密码不一致";
  }

  return null;
}
