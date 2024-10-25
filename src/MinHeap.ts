/**
 * So this is our `MinHeap` class. It’s basically a way to keep track of stuff
 * based on how "frequently" we use it. If something is used less often, we can find 
 * it quickly. Think of it like a to-do list where you can grab the least-used task first.
 */
export default class MinHeap<K> {
    // We’ve got an array (`heap`) that holds all the items (keys) and their frequencies.
    // `positions` is a map that keeps track of where each key is in the heap array.
    private heap: Array<{ key: K; frequency: number; index: number }>;
    private positions: Map<K, number>;

    /**
     * When we create a new `MinHeap`, we’re just starting with an empty heap and an empty positions map.
     * This is like resetting everything.
     */
    constructor() {
        this.heap = [];
        this.positions = new Map<K, number>();
    }

    /**
     * `push` is how we add a new key to the heap. We toss in the key and its frequency, 
     * stick it at the end of the heap, and then make sure the heap stays in the right order by "bubbling it up."
     */
    public push(key: K, frequency: number) {
        const node = { key, frequency, index: this.heap.length }; // Create a new "node" with the key and frequency
        this.heap.push(node); // Add it to the end of the heap
        this.positions.set(key, node.index); // Store its position in the `positions` map
        this.bubbleUp(this.heap.length - 1); // Now we "bubble it up" to keep the heap ordered correctly
    }

    /**
     * `pop` is where we grab the key with the lowest frequency. 
     * It's always gonna be the one at the top of the heap.
     * After we grab it, we swap it with the last item in the heap, remove it, and then "bubble down" to restore order.
     */
    public pop(): { key: K; frequency: number } | undefined {
        if (this.isEmpty()) return undefined; // If the heap is empty, return undefined
        const minItem = this.heap[0]; // The top item (the smallest one)
        this.swap(0, this.heap.length - 1); // Swap it with the last item
        this.heap.pop(); // Remove the last item (which used to be the top)
        this.positions.delete(minItem.key); // Remove the key from the positions map
        this.bubbleDown(0); // Restore the heap order by "bubbling down" from the top
        return minItem; // Return the smallest item
    }

    /**
     * `remove` is used to kick out a specific key. 
     * We find the key, swap it with the last item, remove it, and then rebalance the heap 
     * by either bubbling up or down as needed.
     */
    public remove(key: K): void {
        if (!this.positions.has(key)) return; // If the key’s not in the heap, do nothing

        const indexToRemove = this.positions.get(key)!; // Get the index of the key we want to remove
        const lastIndex = this.heap.length - 1; // The index of the last item in the heap

        if (indexToRemove !== lastIndex) {
            // If it's not the last item, swap it with the last one
            this.swap(indexToRemove, lastIndex);
            this.heap.pop(); // Remove the last item
            this.positions.delete(key); // Remove the key from the map
            this.bubbleDown(indexToRemove); // Rebalance the heap by bubbling down
            this.bubbleUp(indexToRemove); // Also bubble up to be safe
        } else {
            // If it *is* the last item, just remove it directly
            this.heap.pop();
            this.positions.delete(key);
        }
    }

    /**
     * `updateFrequency` is used when a key's frequency changes. 
     * We update its frequency and rebalance the heap by bubbling up or down, as needed.
     */
    public updateFrequency(key: K, frequency: number): void {
        if (this.positions.has(key)) {
            const index = this.positions.get(key)!; // Find the index of the key in the heap
            this.heap[index].frequency = frequency; // Update its frequency
            this.bubbleDown(index); // Bubble down to maintain heap order
            this.bubbleUp(index); // Bubble up just to be sure
        }
    }

    /**
     * `bubbleUp` moves a node up the heap if its frequency is too small. 
     * We keep swapping it with its parent until it's in the right spot.
     */
    private bubbleUp(index: number) {
        let current = index;
        let parentIdx = this.getParentIndex(current);

        while (current > 0 && this.heap[current].frequency < this.heap[parentIdx].frequency) {
            this.swap(current, parentIdx); // Swap with the parent
            current = parentIdx; // Move up to the parent
            parentIdx = this.getParentIndex(current); // Keep going up until it's in the right spot
        }
    }

    /**
     * `bubbleDown` moves a node down the heap if its frequency is too big. 
     * We keep swapping it with the smaller child until it's in the right spot.
     */
    private bubbleDown(index: number) {
        let current = index;
        let left = this.getLeftChildIndex(current);
        let right = this.getRightChildIndex(current);
        let smallest = current;

        // Compare with the left and right children and swap with the smallest one
        if (left < this.heap.length && this.heap[left].frequency < this.heap[smallest].frequency) {
            smallest = left;
        }

        if (right < this.heap.length && this.heap[right].frequency < this.heap[smallest].frequency) {
            smallest = right;
        }

        if (smallest !== current) {
            this.swap(current, smallest); // Swap with the smallest child
            this.bubbleDown(smallest); // Keep going down until it's in the right place
        }
    }

    /**
     * `swap` switches two items in the heap and updates their positions in the map.
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
     * `getParentIndex` is just a little helper to find the parent index of a node.
     * If you're at index i, your parent is at (i-1)/2.
     */
    private getParentIndex(index: number) {
        return Math.floor((index - 1) / 2);
    }

    /**
     * `getLeftChildIndex` gives you the index of the left child.
     * If you're at index i, your left child is at 2*i + 1.
     */
    private getLeftChildIndex(index: number) {
        return 2 * index + 1;
    }

    /**
     * `getRightChildIndex` gives you the index of the right child.
     * If you're at index i, your right child is at 2*i + 2.
     */
    private getRightChildIndex(index: number) {
        return 2 * index + 2;
    }

    /**
     * `isEmpty` is just a simple check to see if the heap is empty.
     * If the heap is empty, we return true.
     */
    public isEmpty() {
        return this.heap.length === 0;
    }
}
