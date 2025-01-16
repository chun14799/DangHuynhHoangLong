var sum_to_n_a = function(n) {
    // your code here
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

var sum_to_n_b = function(n) {
    let sum = 0;
    let i = 1;
    while (i <= n) {
        sum += i;
        i++;
    }
    return sum;
};
var sum_to_n_c = function(n) {
    // your code here
    // Formula
    return (n * (n + 1)) / 2;
};

var sum_to_n_d = function(n) {
    // your code here
    if (n === 1){
        return 1;
    }
    return n + sum_to_n_c(n - 1);
    // Describe for each loop with n=5
    // 5 + sum_to_n_c(4)
    // 5 + 4 + sum_to_n_c(3)
    // 5 + 4 + 3 + sum_to_n_c(2)
    // 5 + 4 + 3 + 2 + 1
};

console.log("sum_to_n_a: ",sum_to_n_a(5))
console.log("sum_to_n_b: ",sum_to_n_b(5))
console.log("sum_to_n_c: ",sum_to_n_c(5))
console.log("sum_to_n_d: ",sum_to_n_d(5))
