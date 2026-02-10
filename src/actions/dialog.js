export function openDialog(content, onClose, onConfirm, closeText, confirmText) {
  return {
    type: 'DIALOG_OPEN',
    content,
    onClose,
    onConfirm,
    closeText,
    confirmText
  }
}

export function closeDialog() {
  return {
    type: 'DIALOG_CLOSE'
  }
}
