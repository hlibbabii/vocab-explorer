import { workspace } from "vscode";
import { getFiles } from "./util"
import { promises } from "fs";
import * as jsTokens from 'js-tokens';

export class VocabEntry {
    fullTokens: {[fullToken: string]: number} = {};

    count(): number {
        return Object.values(this.fullTokens).reduce((a, b) => a+b, 0);
    }
}

export type Vocab = {[subToken: string]: VocabEntry};

function split(token: string): string[] {
    return token.split(/[_\$]+|(?<=[A-Z])(?=[A-Z][a-z])|(?<=[^A-Z])(?=[A-Z])|(?=[0-9])/)
    .map(s => s.toLowerCase());
}

export async function createVocab(): Promise<Vocab> {
	const workspaceFolders = workspace.workspaceFolders;
	const firstFolder = workspaceFolders !== undefined ? workspaceFolders[0].uri.fsPath : undefined;
	const vocab: Vocab = {};
	if (firstFolder === undefined) {
		return vocab;
    }
    for await (const file of getFiles(firstFolder)) {
        const data = await promises.readFile(file, "utf8");
        const tokens: string[] = Array.from(jsTokens(data));
        tokens.forEach((token) => {
            if (token.type === "IdentifierName") {
                    const fullToken = token.value;
                    const subtokens = split(fullToken);
                    for (const subToken of subtokens) {
                    if (!(subToken in vocab)) {
                        vocab[subToken] = new VocabEntry();
                    }
                    if (!(fullToken in vocab[subToken].fullTokens)) {
                        vocab[subToken].fullTokens[fullToken] = 0;
                    }
                    vocab[subToken].fullTokens[fullToken] += 1;
                }
            }
        })
    }
    console.log(vocab);
	return vocab;
}