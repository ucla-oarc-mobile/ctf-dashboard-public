export function dialog(state = {}, action) {
  switch (action.type) {
    case 'DIALOG_OPEN':
      return Object.assign({}, state, {
        isOpen: true,
        content: action.content,
        onClose: action.onClose,
        onConfirm: action.onConfirm,
        closeText: action.closeText,
        confirmText: action.confirmText
      })

    case 'DIALOG_CLOSE':
      return Object.assign({}, state, {
        isOpen: false
      })

    default:
      return state
  }
}
