function getRandomStringElement(string) {
    return string.charAt(Math.random()*string.length);
}

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function genPass({ length=16, number=4, uppercase=4, special=4, specials="!@#$%^&*" }={}) {
    let lowercase = length - number - uppercase - special;
    let str = `${'l'.repeat(lowercase)}${'n'.repeat(number)}${'s'.repeat(special)}${'u'.repeat(uppercase)}`;
    let pass = [];
    let list = {l: "abcdefghijklmnopqrstuvwxyz", n: "0123456789", u: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", s: specials};
    [...str].forEach((c)=>pass.push(getRandomStringElement(list[c])));
    return shuffle(pass).reduce((a,v)=>{return a+v},"");
}

module.exports = genPass;
