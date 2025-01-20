const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function complete(document, position) {
    const completionItems = [];

    // تعریف شیء سراسری
    const linePrefix = document.lineAt(position).text.substr(0, position.character).trimStart();

    if (linePrefix.startsWith("$."))
        return;

    if (linePrefix.endsWith('.')) {
        try {
            var objectName = linePrefix.substr(0, linePrefix.length - 1);
            const index = objectName.indexOf("$");
            console.log(index, objectName.length);
            if(index > 0 && 
                index <= objectName.length)
                objectName = objectName.substr(objectName.indexOf("$") + 1);

            var object = globalObjects.find(i => i.name === objectName);
            if (object)
                return completeObjectUnits(object);

            object = luaObjects.find(i => i.name === objectName);
            if (object)
                return completeObjectUnits(object);

            return [];
        }
        catch (error) {
            console.warn(error);
        }
    }
    else if (linePrefix.includes(".")) {
        return [];
    }

    globalObjects.forEach(globalObject => {
        const globalObjectCompletion = new vscode.CompletionItem(globalObject.name, vscode.CompletionItemKind.Variable);
        globalObjectCompletion.documentation = new vscode.MarkdownString(globalObject.documentation);
        globalObjectCompletion.detail = "Global object";
        completionItems.push(globalObjectCompletion);
    });

    luaObjects.forEach(luaObject => {
        const luaObjectCompletion = new vscode.CompletionItem(luaObject.name, vscode.CompletionItemKind.Variable);
        luaObjectCompletion.documentation = new vscode.MarkdownString(luaObject.documentation);
        luaObjectCompletion.detail = "Lua object";
        completionItems.push(luaObjectCompletion);
    });

    // تعریف توابع Lua
    luaFunctions.forEach(luaFunction => {
        const item = new vscode.CompletionItem(luaFunction.name, vscode.CompletionItemKind.Function);
        item.detail = `(lua function)`;
        item.documentation = new vscode.MarkdownString(luaFunction.documentation);
        item.insertText = new vscode.SnippetString(luaFunction.insertText);
        completionItems.push(item);
    });

    // تعریف توابع داخل
    builtInFunctions.forEach(builtInFunction => {
        const item = new vscode.CompletionItem(builtInFunction.name, vscode.CompletionItemKind.Function);
        item.detail = `(built-in function)`;
        item.documentation = new vscode.MarkdownString(builtInFunction.documentation);
        item.insertText = new vscode.SnippetString(builtInFunction.insertText);
        completionItems.push(item);
    });

    return completionItems;
}

function completeObjectUnits(object) {
    const completionItems = [];
    object.units.forEach(unit => {
        const unitCompletion = new vscode.CompletionItem(unit.name);
        unitCompletion.documentation = new vscode.MarkdownString(unit.documentation, unit.type);
        unitCompletion.detail = unit.detail;
        unitCompletion.kind = unit.type;
        if (unit.type === vscode.CompletionItemKind.Method)
            unitCompletion.insertText = new vscode.SnippetString(unit.insertText);
        completionItems.push(unitCompletion);
    });
    return completionItems;
}

function readJsonFileSync(filePath) {
    try {
        // Read the file synchronously
        const data = fs.readFileSync(filePath, 'utf-8');
        // Parse the JSON data
        const jsonData = JSON.parse(data);
        return jsonData;
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return null; // Return null or handle the error as needed
    }
}

const luaFunctions = readJsonFileSync(path.join(__dirname, '../completion/luaFunctions.json'));
const luaObjects = readJsonFileSync(path.join(__dirname, '../completion/luaObjects.json'));
const builtInFunctions = readJsonFileSync(path.join(__dirname, '../completion/builtInFunctions.json'));
const globalObjects = readJsonFileSync(path.join(__dirname, '../completion/globalObjects.json'));

module.exports = {
    complete
};
