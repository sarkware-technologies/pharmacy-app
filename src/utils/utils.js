export const toNumber = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
};
