// Where the site's falling petals come from: the hero branch publishes the
// positions of its flowers (in page pixels, so they don't depend on scroll),
// and the petal layer releases every petal from one of them.

export type SourcePoint = [x: number, y: number];

let points: SourcePoint[] | null = null;
const listeners = new Set<() => void>();

export const setBlossomSource = (next: SourcePoint[]) => {
    points = next;
    listeners.forEach((fn) => fn());
};

export const getBlossomSource = () => points;

export const onBlossomSource = (fn: () => void) => {
    listeners.add(fn);
    return () => {
        listeners.delete(fn);
    };
};
