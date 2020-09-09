import { TreeDataProvider, Event, ProviderResult, TreeItem, TreeItemCollapsibleState, EventEmitter } from "vscode";
import { Vocab, createVocab, VocabEntry } from "./vocab";

class SymbolNode extends TreeItem {
    constructor(
        public readonly label: string,
        private count: number,
        public readonly collapsibleState: TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
    }

    get tooltip(): string {
        return `${this.label}-${this.count}`;
    }

    get description(): string {
        return this.count.toString();
    }
}

export class VocabDataProvider implements TreeDataProvider<SymbolNode> {

	vocabPromise: Promise<Vocab>;

	constructor() {
		this.vocabPromise = createVocab();
	}

	reloadVocab(): void {
		this.vocabPromise = createVocab();
	}

	async getSubTokens(): Promise<SymbolNode[]> {
		const vocab: Vocab = await this.vocabPromise;
		const data = Object.entries(vocab)
			.sort((x: [string, VocabEntry], y: [string, VocabEntry]) => x[1].count() < y[1].count() ? 1 : (x[1].count() > y[1].count() ? -1: 0) )
			.map((a: [string, VocabEntry]) => new SymbolNode(a[0], a[1].count(), TreeItemCollapsibleState.Collapsed))
		return data;
	}

	async getFullTokens(subToken: string): Promise<SymbolNode[]> {
		const vocab: Vocab = await this.vocabPromise;
		const data = Object.entries(vocab[subToken].fullTokens)
			.sort((x: [string, number], y: [string, number]) => x[1] < y[1] ? 1 : (x[1] > y[1] ? -1: 0) )
			.map((a: [string, number]) => new SymbolNode(a[0], a[1], TreeItemCollapsibleState.None))
		return data;
	}
	

	getTreeItem(element: SymbolNode): SymbolNode | Thenable<SymbolNode> {
		return element;
	}

	getChildren(element?: SymbolNode | undefined): ProviderResult<SymbolNode[]> {
		if (!element) {
			this.reloadVocab();
			return this.getSubTokens();
		} else {
			return this.getFullTokens(element.label);	
		}
	}

	private _onDidChangeTreeData: EventEmitter<SymbolNode | undefined> = new EventEmitter<SymbolNode | undefined>();
	readonly onDidChangeTreeData: Event<SymbolNode | undefined> = this._onDidChangeTreeData.event;

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}
}