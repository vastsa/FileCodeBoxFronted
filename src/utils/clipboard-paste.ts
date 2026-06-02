export const getClipboardFile = (items: DataTransferItemList): File | null => {
  for (let index = 0; index < items.length; index++) {
    const item = items[index]
    if (item.kind !== 'file') {
      continue
    }

    const file = item.getAsFile()
    if (file) {
      return file
    }
  }
  return null
}

export type TextInsertionInput = {
  text: string
  insertText: string
  selectionStart: number
  selectionEnd: number
}

export type TextInsertionResult = {
  value: string
  cursor: number
}

export const insertTextAtSelection = ({
  text,
  insertText,
  selectionStart,
  selectionEnd
}: TextInsertionInput): TextInsertionResult => {
  const beforeSelection = text.substring(0, selectionStart)
  const afterSelection = text.substring(selectionEnd)
  return {
    value: beforeSelection + insertText + afterSelection,
    cursor: selectionStart + insertText.length
  }
}
