const partition = (inputList, filterFunction) => {
    const filterPassList = [];
    const filterFailList = [];

    inputList.forEach((item) => {
        if (filterFunction(item)) {
            filterPassList.push(item);
        } else {
            filterFailList.push(item);
        }
    });

    return {
        filterPassed: filterPassList,
        filterFailed: filterFailList
    };
};

module.exports.partition = partition;
