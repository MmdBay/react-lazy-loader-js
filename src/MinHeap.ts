/**
 * Class representing a MinHeap which is used to efficiently track the least frequently used elements.
 */
export default class MinHeap<K> {
    private heap: Array<{ key: K; frequency: number; index: number }>;
    private positions: Map<K, number>;

    /**
     * Initializes a new instance of the MinHeap.
     */
    constructor() {
        this.heap = [];
        this.positions = new Map<K, number>();
    }

    /**
     * Adds a key with its frequency to the heap.
     * @param {K} key - The key to add.
     * @param {number} frequency - The frequency of the key.
     */
    public push(key: K, frequency: number) {
        const node = { key, frequency, index: this.heap.length };
        this.heap.push(node);
        this.positions.set(key, node.index);
        this.bubbleUp(this.heap.length - 1);
    }

    /**
     * Removes and returns the element with the lowest frequency from the heap.
     * @returns {{ key: K; frequency: number } | undefined} The element with the lowest frequency or undefined if empty.
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
     * Removes a specific key from the heap.
     * @param {K} key - The key to remove.
     */
    public remove(key: K): void {
        if (!this.positions.has(key)) {
            return; // The key does not exist in the heap
        }

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
     * Updates the frequency of a key in the heap and re-adjusts the heap to maintain the min-heap property.
     * @param {K} key - The key to update.
     * @param {number} frequency - The new frequency of the key.
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
     * Maintains the heap property by moving the node at the specified index up.
     * @param {number} index - The index of the node to move up.
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
     * Maintains the heap property by moving the node at the specified index down.
     * @param {number} index - The index of the node to move down.
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
     * Swaps two elements in the heap.
     * @param {number} index1 - The index of the first element to swap.
     * @param {number} index2 - The index of the second element to swap.
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
     * Returns the index of the parent node of the node at the specified index.
     * @param {number} index - The index of the node to find the parent of.
     * @returns {number} The index of the parent node.
     */
    private getParentIndex(index: number) {
        return Math.floor((index - 1) / 2);
    }

    /**
     * Returns the index of the left child node of the node at the specified index.
     * @param {number} index - The index of the node to find the left child of.
     * @returns {number} The index of the left child node.
     */
    private getLeftChildIndex(index: number) {
        return 2 * index + 1;
    }

    /**
     * Returns the index of the right child node of the node at the specified index.
     * @param {number} index - The index of the node to find the right child of.
     * @returns {number} The index of the right child node.
     */
    private getRightChildIndex(index: number) {
        return 2 * index + 2;
    }

    /**
     * Checks if the heap is empty.
     * @returns {boolean} True if the heap is empty, false otherwise.
     */
    public isEmpty() {
        return this.heap.length === 0;
    }
}
