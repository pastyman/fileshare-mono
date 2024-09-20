//high performace buffer implimantation
export const buffer = () => {
    var buffer: any[] = [];
    //clear
    function clear() {
        buffer.length = 0;
    }

    function push(data: any) {
        buffer.push(data);
    }

    //get length
    function getLength() {
        return buffer.length;
    }

    //gets first element
    function shift() {
        return buffer.shift();
    }

    return { push: push, shift: shift, clear: clear, length: getLength };
}