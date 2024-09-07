const CheckValue = (value: any) => {
    if(value === null) return false;
    if(value === undefined || typeof value === "undefined") return false;
    if(typeof value === "string" && value === "") return false;

    return true;
};

export default CheckValue;
