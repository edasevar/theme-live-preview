import * as vscode from 'vscode';

export function getWebviewContent (webview: vscode.Webview, extensionUri: vscode.Uri): string {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "main.js")
  );
  const styleUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "style.css")
  );

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="${styleUri}" rel="stylesheet">
      <title>Theme Live Preview</title>
    </head>
    <body>
      <h2>Theme Live Preview</h2>
      <div id="container"></div>
      <script src="${scriptUri}"></script>
    </body>
    </html>
  `;
}
