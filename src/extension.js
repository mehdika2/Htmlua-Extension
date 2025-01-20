const vscode = require('vscode');
const completion = require('./completion.js');

function activate(context) {
  // vscode.workspace.onDidChangeTextDocument(event => {
  //   const editor = vscode.window.activeTextEditor;

  //   if (!editor || event.contentChanges.length === 0) {
  //     return;
  //   }

  //   const change = event.contentChanges[0];
  //   const openBrackets = ['{', '[', '(']; // کاراکترهای باز
  //   const closeBrackets = ['}', ']', ')']; // کاراکترهای بسته

  //   // بررسی اگر کاراکتر وارد شده یک براکت باز است
  //   if (openBrackets.includes(change.text)) {
  //     editor.edit(editBuilder => {
  //       const position = change.range.end; // مکان قرارگیری کاراکتر جدید
  //       const nextLineIndent = getIndentation(editor, position.line);

  //       // افزودن خط جدید و فاصله مناسب
  //       const indentText = `\n${nextLineIndent}\t\n${nextLineIndent}`;
  //       const cursorOffset = position.translate(1, 1); // موقعیت بعد از براکت بسته

  //       editBuilder.insert(position, indentText); // اضافه کردن خطوط
  //       setTimeout(() => {
  //         editor.selection = new vscode.Selection(cursorOffset, cursorOffset); // تنظیم مکان نشانگر
  //       }, 50);
  //     });
  //   }
  // });

  let disposable = vscode.languages.registerCompletionItemProvider(
    { language: 'htmlua', scheme: 'file' },
    {
      provideCompletionItems(document, position) {
        const textUntilPosition = document.getText(
          new vscode.Range(
            new vscode.Position(0, 0),
            position 
          )
        );

        let inCodeBlock = false;
        let isIdentifier = false;
        let blockStart = -1;
        let braceCount = 0; // شمارنده برای پرانتزها

        for (let i = 0; i < textUntilPosition.length; i++) {
          const char = textUntilPosition[i];
          const nextChar = i + 1 < textUntilPosition.length ? textUntilPosition[i + 1] : '';

          if (char === '$' && nextChar === '{') {
            inCodeBlock = true;
            blockStart = i;
            braceCount++; // افزایش شمارنده با شروع بلاک
            i++;
          } else if (char === '$' && (i === 0 || textUntilPosition[i - 1] !== '\\')) {
            if (!inCodeBlock) { // فقط اگر داخل بلاک کد نبودیم، شناسه را تشخیص می‌دهیم
              isIdentifier = true;
            }
          } else if (inCodeBlock) {
            if (char === '{') {
              braceCount++; // افزایش شمارنده با پرانتز باز جدید
            } else if (char === '}') {
              braceCount--; // کاهش شمارنده با پرانتز بسته

              if (braceCount === 0) {
                inCodeBlock = false; // بلاک کد واقعاً تمام شد
                blockStart = -1;
              }
            }
          }
        }

        if (!inCodeBlock && !isIdentifier) {
          return [];
        }

        try {
          return completion.complete(document, position);
        } catch (error) {
          console.warn(error);
        }
        return [];
      },
    },
    '.'
  );

  context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = {
  activate,
  deactivate
};
