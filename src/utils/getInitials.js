export const getInitials = (name = "") => {
    return name
        .split(" ")
        .filter(Boolean)
        .map(word => word[0]?.toUpperCase())
        .join("")
        .slice(0, 2);   // Only first 2 letters
};


export const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
    }).format(amount);
};
