export const getInitials = (name = "", index = 2) => {
    return name
        .split(" ")
        .filter(Boolean)
        .map(word => word[0]?.toUpperCase())
        .join("")
        .slice(0, index);   // Only first 2 letters
};


export const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
    }).format(amount);
};

export const formatRelativeTime = (isoDate) => {
    const date = new Date(isoDate);
    const now = new Date();

    const diffMs = Math.max(0, now.getTime() - date.getTime());

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);

    if (seconds < 60) {
        return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
    }

    if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    }

    if (hours < 24) {
        return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    }

    if (days < 30) {
        return `${days} day${days !== 1 ? "s" : ""} ago`;
    }

    return `${months} month${months !== 1 ? "s" : ""} ago`;
};
