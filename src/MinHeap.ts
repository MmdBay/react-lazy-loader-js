/**
 * MinHeap implementation for tracking items by frequency.
 * Efficiently maintains the least frequently used item at the root.
 * Used by LFU cache for quick access to the least frequently used keys.
 */
export default class MinHeap<K> {
    private heap: Array<{ key: K; frequency: number; index: number }>;
    private positions: Map<K, number>; // Maps keys to their positions in the heap

    /**
     * Initialize an empty MinHeap with empty heap array and position tracking map.
     */
    constructor() {
        this.heap = [];
        this.positions = new Map<K, number>();
    }

    /**
     * Add a new key with its frequency to the heap.
     * Places the item at the end and bubbles up to maintain heap property.
     */
    public push(key: K, frequency: number) {
        const node = { key, frequency, index: this.heap.length };
        this.heap.push(node);
        this.positions.set(key, node.index);
        this.bubbleUp(this.heap.length - 1);
    }

    /**
     * Remove and return the key with the lowest frequency (root of the heap).
     * Swaps root with last item, removes it, and bubbles down to restore heap property.
     */
    public pop(): { key: K; frequency: number } | undefined {
        if (this.isEmpty()) return undefined;
        const minItem = this.heap[0];
        this.swap(0, this.heap.length - 1);
        this.heap.pop();
        this.positions.delete(minItem.key);
        this.bubbleDown(0);
        return minItem;
    }

    /**
     * Remove a specific key from the heap.
     * Swaps with last item, removes it, and rebalances the heap.
     */
    public remove(key: K): void {
        if (!this.positions.has(key)) return;

        const indexToRemove = this.positions.get(key)!;
        const lastIndex = this.heap.length - 1;

        if (indexToRemove !== lastIndex) {
            this.swap(indexToRemove, lastIndex);
            this.heap.pop();
            this.positions.delete(key);
            this.bubbleDown(indexToRemove);
            this.bubbleUp(indexToRemove);
        } else {
            this.heap.pop();
            this.positions.delete(key);
        }
    }

    /**
     * Update the frequency of a key and rebalance the heap.
     */
    public updateFrequency(key: K, frequency: number): void {
        if (this.positions.has(key)) {
            const index = this.positions.get(key)!;
            this.heap[index].frequency = frequency;
            this.bubbleDown(index);
            this.bubbleUp(index);
        }
    }

    /**
     * Move a node up the heap until heap property is satisfied.
     */
    private bubbleUp(index: number) {
        let current = index;
        let parentIdx = this.getParentIndex(current);

        while (current > 0 && this.heap[current].frequency < this.heap[parentIdx].frequency) {
            this.swap(current, parentIdx);
            current = parentIdx;
            parentIdx = this.getParentIndex(current);
        }
    }

    /**
     * Move a node down the heap until heap property is satisfied.
     */
    private bubbleDown(index: number) {
        let current = index;
        let left = this.getLeftChildIndex(current);
        let right = this.getRightChildIndex(current);
        let smallest = current;

        if (left < this.heap.length && this.heap[left].frequency < this.heap[smallest].frequency) {
            smallest = left;
        }

        if (right < this.heap.length && this.heap[right].frequency < this.heap[smallest].frequency) {
            smallest = right;
        }

        if (smallest !== current) {
            this.swap(current, smallest);
            this.bubbleDown(smallest);
        }
    }

    /**
     * Swap two items in the heap and update their position tracking.
     */
    private swap(index1: number, index2: number) {
        const temp = this.heap[index1];
        this.heap[index1] = this.heap[index2];
        this.heap[index2] = temp;
        this.heap[index1].index = index1;
        this.heap[index2].index = index2;
        this.positions.set(this.heap[index1].key, index1);
        this.positions.set(this.heap[index2].key, index2);
    }

    /**
     * Get the parent index of a node at the given index.
     */
    private getParentIndex(index: number) {
        return Math.floor((index - 1) / 2);
    }

    /**
     * Get the left child index of a node at the given index.
     */
    private getLeftChildIndex(index: number) {
        return 2 * index + 1;
    }

    /**
     * Get the right child index of a node at the given index.
     */
    private getRightChildIndex(index: number) {
        return 2 * index + 2;
    }

    /**
     * Check if the heap is empty.
     */
    public isEmpty() {
        return this.heap.length === 0;
    }
}
